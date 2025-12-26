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

  const { productName, productDescription, imageUrl, referenceText, geminiApiKey, characterSettings, buzzPatterns } = req.body;

  if (!productName) {
    return res.status(400).json({ error: 'productName is required' });
  }

  if (!imageUrl) {
    return res.status(400).json({ error: 'imageUrl is required for post generation' });
  }

  // APIキーはリクエストから受け取る
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
    if (characterSettings.targetAge || characterSettings.targetGender) {
      const target = [characterSettings.targetAge, characterSettings.targetGender].filter(Boolean).join('・');
      parts.push(`ターゲット: ${target}`);
    }

    return parts.length > 0 ? `\n【発信者キャラ設定】\n${parts.join('\n')}` : '';
  };

  // 感情タイプと魅力タイプのマッピング
  const emotionToAppealMap = {
    'ほっこり': ['fun', 'beautiful'],
    'くすり笑い': ['funny', 'fun'],
    '共感': ['beautiful', 'functional'],
    '驚き': ['fun', 'functional'],
    '感動': ['beautiful'],
  };

  // バズパターンからプロンプト用文字列を生成（タイプ別にフィルタリング）
  const buildBuzzPatternsPrompt = (appealType = null) => {
    if (!buzzPatterns || buzzPatterns.length === 0) return '';

    // 魅力タイプに合うバズパターンをフィルタリング
    let filteredPatterns = buzzPatterns;
    if (appealType) {
      filteredPatterns = buzzPatterns.filter(p => {
        const matchingAppeals = emotionToAppealMap[p.emotionType] || [];
        return matchingAppeals.includes(appealType);
      });
      // マッチするものがなければ全てのパターンを使用
      if (filteredPatterns.length === 0) {
        filteredPatterns = buzzPatterns;
      }
    }

    const examples = filteredPatterns.slice(0, 3).map((p, i) =>
      `例${i + 1}: 「${p.text}」\n   → テンプレート: ${p.template}`
    ).join('\n\n');

    return `
【チャエン式Few-Shot: 参考バズ投稿】
${examples}

★重要★ 上記の投稿の「構造」と「テンプレート」を真似して作成してください。
テンプレートの【】部分を商品に合わせて置き換えてください。`;
  };

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
      throw new Error('Failed to fetch product image');
    }
  }

  // 魅力タイプ別のプロンプト設定
  const appealPrompts = {
    fun: {
      tone: '楽しい・ギャップ・意外性',
      instruction: '画像の見た目と実際の商品のギャップを活かして、「えっ！？」と思わせるような驚きのある文章にしてください。'
    },
    funny: {
      tone: '笑える・クスッとくる・ユーモア',
      instruction: '画像から感じる面白いポイントを活かして、クスッと笑えるユーモアのある文章にしてください。'
    },
    functional: {
      tone: '高機能・便利・すごい',
      instruction: '画像から伝わる商品の機能性や便利さを強調し、「これは使える！」と思わせる文章にしてください。'
    },
    beautiful: {
      tone: '美しい・おしゃれ・素敵',
      instruction: '画像の美しさやおしゃれさを活かして、「かわいい！」「素敵！」と感じる文章にしてください。'
    },
  };

  // Gemini API呼び出し共通関数
  async function callGemini(prompt, imageData) {
    const parts = [{ text: prompt }];

    if (imageData) {
      parts.push({
        inline_data: {
          mime_type: imageData.mimeType,
          data: imageData.base64
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

  // オリジナル生成（画像+商品情報+キャラ設定+バズパターン）
  const generateOriginal = async (type, imageData) => {
    const appeal = appealPrompts[type];
    const characterPrompt = buildCharacterPrompt();
    const buzzPatternsPrompt = buildBuzzPatternsPrompt(type); // タイプ別にフィルタリング

    const prompt = `あなたはThreadsで商品を紹介するインフルエンサーです。
商品画像を見て、以下の条件で投稿文を2案作成してください。
${characterPrompt}
【条件】
- 各投稿は50文字以内
- 商品名を直接書かない（「これ」「この〇〇」などで表現）
- 日本語で自然な口語体
- トーン: ${appeal.tone}
- ${appeal.instruction}
- 絵文字は1-2個まで使用可能
- 「PR」は含めない（別途追加するため）
- 各案は改行で区切る
${buzzPatternsPrompt}
【良い例】
- 「えっ、これ100均じゃないの...!?」
- 「夫が見つけてきたんだけど、これマジで神」
- 「ずっと探してた〇〇、やっと見つけた」

【商品名】${productName}
【商品説明】${productDescription || '（説明なし）'}

画像をよく見て、見た目の特徴を活かした投稿文を2案作成してください。
番号は不要です。改行で区切って出力してください。`;

    const content = await callGemini(prompt, imageData);

    return content
      .split('\n')
      .map(line => line.trim().replace(/^[-・\d.]+\s*/, ''))
      .filter(line => line.length > 0 && line.length <= 60)
      .slice(0, 2);
  };

  // パターン分析 + 元ネタ参照生成
  const analyzeAndGenerate = async (imageData) => {
    // Step 1: パターン分析
    const analysisPrompt = `あなたはThreadsバズ投稿の分析専門家です。

【元ネタ投稿】
${referenceText}

【商品情報】
商品名: ${productName}
説明: ${productDescription || '（説明なし）'}

【分析タスク】

1. この投稿のパターンを判定:
   - ギャップ系（見た目と実態の落差で驚かせる）
   - 呼びかけ系（ターゲットへの共感を誘う）
   - 発見系（新情報の驚きを伝える）
   - 感想系（実体験の説得力で訴える）
   - 質問系（参加を促す問いかけ）
   - その他

2. パターンに応じた分析:

【ギャップ系】見た目/実態/落差ポイント
【呼びかけ系】ターゲット/共感ポイント/キーワード
【発見系】新情報/驚きポイント
【感想系】体験内容/説得力の源
【質問系】問いかけ/答えたくなる理由

3. この商品で同じパターンを使う場合のアレンジ案

以下のJSON形式で回答してください（JSONのみ出力）:
{
  "pattern": "パターン名",
  "patternEmoji": "パターンを表す絵文字1つ",
  "analysis": {
    "key1": "分析内容1",
    "key2": "分析内容2"
  },
  "suggestion": "この商品でのアレンジ案（1文）"
}`;

    const analysisContent = await callGemini(analysisPrompt, imageData);

    // JSONを抽出
    let analysis = null;
    try {
      const jsonMatch = analysisContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      console.error('Analysis JSON parse error:', e);
    }

    // Step 2: パターンに基づいて投稿文を生成
    const types = ['fun', 'funny', 'functional', 'beautiful'];
    const characterPrompt = buildCharacterPrompt();
    const results = await Promise.all(
      types.map(async (type) => {
        const appeal = appealPrompts[type];
        const buzzPatternsPrompt = buildBuzzPatternsPrompt(type);

        const generatePrompt = `あなたはThreadsで商品を紹介するインフルエンサーです。
${characterPrompt}
【元ネタ投稿の分析結果】
パターン: ${analysis?.pattern || '不明'}
${analysis?.suggestion || ''}

【元ネタ投稿】
${referenceText}
${buzzPatternsPrompt}
【条件】
- 各投稿は50文字以内
- 商品名を直接書かない（「これ」「この〇〇」などで表現）
- 日本語で自然な口語体
- トーン: ${appeal.tone}
- ${appeal.instruction}
- 絵文字は1-2個まで使用可能
- 「PR」は含めない
- 元ネタの「構造」「言い回しパターン」を参考に、この商品に合った新しい文章を作成
- 元ネタをそのままコピーしないこと

【商品名】${productName}

2案を改行で区切って出力してください。番号は不要です。`;

        try {
          const content = await callGemini(generatePrompt, imageData);

          return content
            .split('\n')
            .map(line => line.trim().replace(/^[-・\d.]+\s*/, ''))
            .filter(line => line.length > 0 && line.length <= 60)
            .slice(0, 2);
        } catch (err) {
          console.error(`Error generating reference for ${type}:`, err);
          return [];
        }
      })
    );

    const posts = {};
    types.forEach((type, index) => {
      posts[type] = results[index];
    });

    return { analysis, posts };
  };

  try {
    // 画像をBase64に変換
    const imageData = await fetchImageAsBase64(imageUrl);

    const types = ['fun', 'funny', 'functional', 'beautiful'];

    // オリジナル生成（常に実行）
    const originalResults = await Promise.all(
      types.map(type => generateOriginal(type, imageData).catch(err => {
        console.error(`Error generating original for ${type}:`, err);
        return [];
      }))
    );

    const originalPosts = {};
    types.forEach((type, index) => {
      originalPosts[type] = originalResults[index];
    });

    // 元ネタ参照生成（referenceTextがある場合のみ）
    let referencePosts = null;
    let patternAnalysis = null;

    if (referenceText && referenceText.trim()) {
      const referenceResult = await analyzeAndGenerate(imageData);
      referencePosts = referenceResult.posts;
      patternAnalysis = referenceResult.analysis;
    }

    return res.status(200).json({
      success: true,
      original: originalPosts,
      reference: referencePosts,
      patternAnalysis,
      productName,
      imageUrl,
      hasReference: !!referencePosts,
    });

  } catch (error) {
    console.error('Post generation error:', error);
    return res.status(500).json({
      error: 'Failed to generate posts',
      message: error.message,
    });
  }
}
