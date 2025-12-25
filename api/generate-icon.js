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

  const { characterKind, expression } = req.body;

  if (!characterKind || !expression) {
    return res.status(400).json({ error: 'characterKind and expression are required' });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'OpenAI API key not configured' });
  }

  // 表情マッピング
  const expressionMap = {
    gentle: 'やさしい',
    energetic: '元気な',
    cool: 'クールな',
    friendly: '親しみやすい',
  };
  const expressionText = expressionMap[expression] || 'やさしい';

  // 背景色をランダムで選択
  const bgColors = ['白', 'ライトピンク', 'ライトブルー', 'クリーム色', 'ミントグリーン', 'ラベンダー'];
  const getRandomBgColor = () => bgColors[Math.floor(Math.random() * bgColors.length)];

  // プロンプト生成
  const buildPrompt = (bgColor) => {
    return `スレッズ用のSNSアイコン。色鉛筆で描いたシンプルでかわいい${characterKind}、${expressionText}雰囲気、${bgColor}の単色背景、顔のアップ、ミニマル、丸いアイコン向け`;
  };

  try {
    // 4枚生成（並列で実行）
    const generateImage = async (bgColor) => {
      const response = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'dall-e-3',
          prompt: buildPrompt(bgColor),
          n: 1,
          size: '1024x1024',
          quality: 'standard',
          response_format: 'url',
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Image generation failed');
      }

      const data = await response.json();
      return data.data[0].url;
    };

    // 4枚を並列生成
    const bgColorsForImages = [
      getRandomBgColor(),
      getRandomBgColor(),
      getRandomBgColor(),
      getRandomBgColor(),
    ];

    const imagePromises = bgColorsForImages.map((bgColor, index) =>
      generateImage(bgColor)
        .then(url => ({ id: index + 1, url, bgColor }))
        .catch(err => ({ id: index + 1, url: null, error: err.message }))
    );

    const images = await Promise.all(imagePromises);

    return res.status(200).json({
      success: true,
      images,
      prompt: buildPrompt('（各色）'),
    });

  } catch (error) {
    console.error('Icon generation error:', error);
    return res.status(500).json({
      error: 'Failed to generate icons',
      message: error.message,
    });
  }
}
