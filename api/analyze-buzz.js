export default async function handler(req, res) {
  // CORSヘッダー
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { buzzText, imageUrl, geminiApiKey } = req.body;

  if (!buzzText) {
    return res.status(400).json({ error: 'buzzText is required' });
  }

  if (!imageUrl) {
    return res.status(400).json({ error: 'imageUrl is required for analysis' });
  }

  const apiKey = geminiApiKey;
  if (!apiKey) {
    return res.status(400).json({ error: 'Gemini API key is required', needApiKey: true });
  }

  // 画像をBase64に変換
  async function fetchImageAsBase64(url) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status}`);
      }
      const arrayBuffer = await response.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString('base64');
      const contentType = response.headers.get('content-type') || 'image/jpeg';
      return { base64, mimeType: contentType };
    } catch (error) {
      console.error('Image fetch error:', error);
      throw new Error('Failed to fetch image');
    }
  }

  try {
    const imageData = await fetchImageAsBase64(imageUrl);

    const prompt = `以下の投稿を分析してください。

【バズった投稿文】
${buzzText}

【商品画像】
（添付画像）

【分析項目】
1. 見た目: 画像は何に見えるか（第一印象）
2. 実態: 実際の商品は何か
3. ギャップ: 見た目と実態の落差（あれば）
4. フックタイプ: 以下から最も当てはまるものを1つ選択
   - 意外性（予想外の展開）
   - 共感（あるある、わかる）
   - ユーモア（クスッと笑える）
   - 驚き（すごい、マジで!?）
   - 感動（素敵、かわいい）
5. 文章テクニック: 使われている技法（疑問形、断定、呼びかけ、否定形フック等）
6. バズ理由: なぜこの画像×文章の組み合わせがバズったか（1文で）

以下のJSON形式のみで回答してください（説明文不要）:
{
  "appearance": "〜に見える",
  "reality": "実際は〜",
  "gap": "ギャップの説明（なければ「なし」）",
  "hookType": "意外性/共感/ユーモア/驚き/感動のいずれか",
  "technique": "使われている技法",
  "buzzReason": "バズ理由を1文で"
}`;

    const parts = [
      { text: prompt },
      {
        inline_data: {
          mime_type: imageData.mimeType,
          data: imageData.base64
        }
      }
    ];

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts }],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 500,
          }
        })
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Gemini API request failed');
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // JSONを抽出
    let analysis = null;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      console.error('JSON parse error:', e);
      return res.status(500).json({ error: 'Failed to parse analysis result' });
    }

    if (!analysis) {
      return res.status(500).json({ error: 'No analysis result' });
    }

    return res.status(200).json({
      success: true,
      analysis,
      analyzedAt: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Buzz analysis error:', error);
    return res.status(500).json({
      error: 'Failed to analyze buzz post',
      message: error.message,
    });
  }
}
