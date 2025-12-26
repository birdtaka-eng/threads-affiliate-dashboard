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

  const { imageBase64, referenceText, geminiApiKey, characterSettings, buzzPatterns } = req.body;

  if (!imageBase64) {
    return res.status(400).json({ error: 'imageBase64 is required' });
  }

  const apiKey = geminiApiKey;
  if (!apiKey) {
    return res.status(400).json({ error: 'Gemini API key is required', needApiKey: true });
  }

  // キャラ設定からプロンプト用文字列を生成
  const buildCharacterPrompt = () => {
    if (!characterSettings) return '';

    const parts = [];
    if (characterSettings.characterName) {
      parts.push(`名前: ${characterSettings.characterName}`);
    }
    if (characterSettings.title) {
      parts.push(`肩書き: ${characterSettings.title}`);
    }
    if (characterSettings.tone) {
      const toneMap = { fun: '楽しい・絵文字多め', serious: '真面目・絵文字なし' };
      parts.push(`トーン: ${toneMap[characterSettings.tone] || characterSettings.tone}`);
    }
    if (characterSettings.accountCharacter) {
      parts.push(`キャラ設定: ${characterSettings.accountCharacter}`);
    }

    return parts.length > 0 ? `\n【発信者キャラ設定】\n${parts.join('\n')}\n` : '';
  };

  // バズパターンからプロンプト用文字列を生成（チャエン式Few-Shot）
  const buildBuzzPatternsPrompt = () => {
    if (!buzzPatterns || buzzPatterns.length === 0) return '';

    const examples = buzzPatterns.slice(0, 3).map((p, i) =>
      `例${i + 1}: 「${p.text}」\n   → テンプレート: ${p.template || '（なし）'}`
    ).join('\n\n');

    return `
【チャエン式Few-Shot: 参考バズ投稿】
${examples}

★重要★ 上記の投稿の「構造」と「テンプレート」を真似して作成してください。
`;
  };

  // Base64からMIMEタイプとデータを抽出
  function parseBase64Image(base64String) {
    const matches = base64String.match(/^data:(.+);base64,(.+)$/);
    if (matches) {
      return { mimeType: matches[1], data: matches[2] };
    }
    // 既にbase64データのみの場合
    return { mimeType: 'image/jpeg', data: base64String };
  }

  // Gemini API呼び出し
  async function callGemini(prompt, imageData) {
    const parts = [{ text: prompt }];

    if (imageData) {
      parts.push({
        inline_data: {
          mime_type: imageData.mimeType,
          data: imageData.data
        }
      });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts }],
          generationConfig: {
            temperature: 0.9,
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
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  }

  try {
    const imageData = parseBase64Image(imageBase64);
    const characterPrompt = buildCharacterPrompt();
    const buzzPatternsPrompt = buildBuzzPatternsPrompt();

    // プロンプト
    const basePrompt = `この画像を見て、Threadsでバズる投稿文を作成してください。
${characterPrompt}
【条件】
・3〜20文字の短い一言
・感情を動かすフック（驚き、共感、笑いなど）
・「可愛い」「すごい」だけでなく、ギャップや発見を入れる
・絵文字は1-2個まで使用可能
・日本語で自然な口語体
${buzzPatternsPrompt}
【参考パターン】
・「これ考えた人天才」
・「可愛すぎて二度見した」
・「○○好き集まれ」
・「待って、これ...」
・「マジでこれ」`;

    const referencePrompt = referenceText
      ? `\n\n【参考にする投稿】\n${referenceText}\n\n上記のパターンを参考に、同じようなテンションで4案作成してください。`
      : '\n\n4案を改行で区切って出力してください。番号は不要です。';

    const prompt = basePrompt + referencePrompt;

    const content = await callGemini(prompt, imageData);

    // 投稿案を抽出
    const posts = content
      .split('\n')
      .map(line => line.trim().replace(/^[-・\d.]+\s*/, ''))
      .filter(line => line.length > 0 && line.length <= 50)
      .slice(0, 4);

    // 結果をフォーマット（generate-postと同じ構造に）
    const result = {
      success: true,
      original: {
        fun: posts.slice(0, 2),
        funny: posts.slice(2, 4),
        functional: [],
        beautiful: [],
      },
      reference: null,
      patternAnalysis: null,
      hasReference: false,
      isFreePost: true,
    };

    return res.status(200).json(result);

  } catch (error) {
    console.error('Free post generation error:', error);
    return res.status(500).json({
      error: 'Failed to generate posts',
      message: error.message,
    });
  }
}
