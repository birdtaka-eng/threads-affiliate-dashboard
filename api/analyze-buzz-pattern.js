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

  const { postText, geminiApiKey } = req.body;

  if (!postText) {
    return res.status(400).json({ error: 'postText is required' });
  }

  const apiKey = geminiApiKey;
  if (!apiKey) {
    return res.status(400).json({ error: 'Gemini API key is required', needApiKey: true });
  }

  try {
    const prompt = `以下のバズ投稿を分析して、構造パターンを抽出してください。

【バズ投稿】
${postText}

【分析項目】
1. 感情タイプ: この投稿が引き起こす主な感情（以下から1つ選択）
   - ほっこり（心温まる、癒し）
   - くすり笑い（クスッと笑える、ユーモア）
   - 共感（あるある、わかる）
   - 驚き（意外、すごい）
   - 感動（素敵、美しい）

2. 構造パターン: 投稿の構成（以下から1つ選択）
   - 会話劇形式（セリフで展開）
   - 対比構成（ビフォーアフター、○○vs△△）
   - 起承転結（状況→展開→転換→オチ）
   - リスト形式（箇条書き、ランキング）
   - 一言完結（短文でズバッと）
   - ストーリー形式（エピソード風）

3. オチの型: 締め方の特徴（以下から1つ選択）
   - 比喩締め（○○みたいだった）
   - 一言オチ（最後に短い一言）
   - 余韻型（...で終わる、問いかけ）
   - ツッコミ型（セルフツッコミ）
   - 感想型（素直な感想で締める）

4. テンプレート: この投稿の構造を再利用可能な形式で記述
   例: 「【場所】で【人物】が【行動】。【セリフ】と言ったら【反応】。【比喩的感想】だった」

以下のJSON形式のみで回答してください（説明文不要）:
{
  "emotionType": "感情タイプ",
  "structurePattern": "構造パターン",
  "endingType": "オチの型",
  "template": "テンプレート文字列"
}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
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
      ...analysis,
    });

  } catch (error) {
    console.error('Buzz pattern analysis error:', error);
    return res.status(500).json({
      error: 'Failed to analyze buzz pattern',
      message: error.message,
    });
  }
}
