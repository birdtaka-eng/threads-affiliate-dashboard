
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); // 画像アップロード用に制限緩和

// Request Logger
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// API Routes
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Backend server is running' });
});

// Gemini Text Generation Endpoint
// Gemini Text Generation Endpoint - Enhanced (Image & Persona)
app.post('/api/generate-post-text', async (req, res) => {
    try {
        const {
            buzzUrl,
            rakutenUrl,
            referenceText,
            style, // rewrite, empathy, review
            customPrompt, // User defined instruction for humor extraction
            image, // base64 string
            characterSettings, // { name, tone, kind, expression }
            modelName // optional: 'gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-2.0-flash-exp'
        } = req.body;

        // Dynamic Model Selection
        // Default to 'gemini-1.5-pro' if not specified or invalid
        const targetModelName = modelName || 'gemini-1.5-pro';
        const model = genAI.getGenerativeModel({ model: targetModelName });

        console.log(`Using Gemini Model: ${targetModelName}`);

        // Build Persona Context
        const personaPrompt = `
    【システム絶対命令】
    1. あなたはAIアシスタントではありません。プロの文筆家です。
    2. ユーザーの依頼に対して「はい、承知しました」「〜のような文章を作成します」といった返答や挨拶は**一切禁止**です。
    3. 出力には、生成されたコンテンツ（投稿本文）のみを含めてください。
    4. 自己紹介や意気込みも不要です。直ちに執筆を開始し、完了形の結果のみを出力してください。

    【最重要指示】
    あなたは以下の「投稿者人格」になりきって文章を作成してください。
    元ネタや参考テキストの口調に引っ張られてはいけません。
    必ずこの人格の言葉選び、トーンで語ってください。

    [人格設定]
    名前: ${characterSettings?.name || '私'}
    口調/性格: ${characterSettings?.tone || '親しみやすい、ポジティブ'}
    `;

        // Prompt Construction Strategy
        let strategyPrompt = "";
        const parts = [];

        // Part 1: System Instruction (Persona)
        parts.push(personaPrompt);

        // Part 2: Task Instruction based on Style and Input
        if (style === 'empathy') {
            // Pattern: Empathy/Humor/Visual
            strategyPrompt = `
        【タスク】
        提供された${image ? '画像' : '情報'}を見て、見る人が「あるある」「わかる〜」と共感したり、クスッと笑えるような投稿を **3パターン** 作ってください。
        宣伝色は消し、日常のワンシーンとして切り取ってください。

        パターン1: 【共感重視】「わかる〜！」となるような、しみじみ系の投稿
        パターン2: 【ユーモア重視】クスッと笑える、オチのある投稿
        パターン3: 【勢い重視】短く、インパクトのある投稿
            `;
        } else if (style === 'rewrite') {
            // Pattern: Rewrite (Structure Analysis & Abstraction)
            const instruction = customPrompt || `
            【分析ステップ】
            1. [参考テキスト]を読み込み、「なぜ面白いのか」という構造だけを抽出する。
            2. 具体的な単語は全て捨てる。
            3. 抽出した「面白さの骨組み」だけを使い、話題だけを「楽天の商品（または私の日常）」にすり替えて、新しい投稿を作成する。
            `;

            strategyPrompt = `
        【重要タスク: 構造のトレースと再構築】
        以下の指示に従って、**3パターン** のバリエーションを作成してください。
        
        [ユーザー指示]:
        ${instruction}

        パターン1: 【正統派アレンジ】指示に忠実に構造をトレースしたもの
        パターン2: 【大胆アレンジ】構造を借りつつ、より面白おかしくしたもの
        パターン3: 【シンプル化】エッセンスだけを抜き出し、短くまとめたもの
         `;
        } else {
            // Pattern: Review (Default)
            strategyPrompt = `
        【タスク】
        商品を紹介しますが、押し売り感を出さず「これ本当に良かったよ」という口コミの雰囲気で、**3パターン** の紹介文を作ってください。

        パターン1: 【正直レビュー】本音で語る、親近感のあるレビュー
        パターン2: 【テンション高め】「これ最高！」という興奮を伝えるレビュー
        パターン3: 【問いかけ系】「これ知ってる？」とフォロワーに話しかけるようなレビュー
        `;
        }

        parts.push(strategyPrompt);

        // JSON Output Instruction
        const jsonInstruction = `
        【出力形式】
        **必ず** 以下のJSON形式のみで出力してください。Markdownのコードブロックは不要です。
        
        [
          { "title": "パターン1のタイトル", "text": "パターン1の本文" },
          { "title": "パターン2のタイトル", "text": "パターン2の本文" },
          { "title": "パターン3のタイトル", "text": "パターン3の本文" }
        ]
        `;
        parts.push(jsonInstruction);


        // Part 3: Context Data
        let contextData = `
            [参考情報]
            紹介商品URL: ${rakutenUrl || 'なし'}
            `;

        if (referenceText) {
            contextData += `
            [参考テキスト（元ネタ）]:
    ${referenceText}
            `;
        }
        parts.push(contextData);

        // Part 4: Image Handling
        const contentParts = [];
        const combinedPrompt = parts.join("\n");
        console.log('--- FINAL PROMPT TO GEMINI ---\n', combinedPrompt, '\n------------------------------');

        contentParts.push(combinedPrompt);

        if (image) {
            contentParts.push({
                inlineData: {
                    data: image,
                    mimeType: "image/jpeg", // Assuming JPEG for simplicity, can be dynamic if needed
                },
            });
            contentParts.push("\n[画像指示]: この画像から読み取れる視覚的情報（雰囲気、生活感、ツッコミどころ）を文章に反映させてください。");
        }

        const result = await model.generateContent(contentParts);
        const response = await result.response;
        let text = response.text();

        // Clean up response if it contains markdown code blocks
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();

        let parsedData;
        try {
            parsedData = JSON.parse(text);
        } catch (e) {
            console.error('JSON Parse Error:', e);
            console.log('Raw text:', text);
            // Fallback: wrap raw text in a single object if parsing fails
            parsedData = [{ title: "生成結果", text: text }];
        }

        res.json({ success: true, text: parsedData }); // textプロパティに配列を入れる形に変更
    } catch (error) {
        console.error('Gemini generation error:', error);
        res.status(500).json({ success: false, error: 'Failed to generate text' });
    }
});

// Threads Search Endpoint
app.get('/api/search-threads', async (req, res) => {
    try {
        const { q, limit = 10 } = req.query;
        const token = process.env.THREADS_ACCESS_TOKEN;

        if (!q) {
            return res.status(400).json({ success: false, error: 'Query parameter "q" is required' });
        }
        if (!token) {
            return res.status(500).json({ success: false, error: 'Threads Access Token not configured' });
        }

        const searchUrl = `https://graph.threads.net/v1.0/keyword_search?q=${encodeURIComponent(q)}&access_token=${token}&limit=${limit}`;
        // Request fields: id, permalink, text
        const fields = 'id,permalink,text,media_url,username,timestamp';
        const requestUrl = `${searchUrl}&fields=${fields}`;

        const response = await fetch(requestUrl);
        const data = await response.json();

        if (data.error) {
            console.error('Threads API Error:', data.error);
            return res.status(500).json({ success: false, error: data.error.message });
        }

        const posts = (data.data || []).map(post => ({
            id: post.id,
            buzzUrl: post.permalink,
            postText: post.text || '',
            imageUrl: post.media_url || '',
            timestamp: post.timestamp,
        }));

        res.json({ success: true, count: posts.length, posts });

    } catch (error) {
        console.error('Threads Search Error:', error);
        res.status(500).json({ success: false, error: 'Failed to search threads' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
