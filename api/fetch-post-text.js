// HTMLエンティティをデコード
function decodeHtmlEntities(text) {
  if (!text) return '';
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#x([0-9A-Fa-f]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(parseInt(dec, 10)))
    .replace(/&nbsp;/g, ' ');
}

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

  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'url is required' });
  }

  try {
    // threads.net → threads.com のリダイレクトに対応
    let fetchUrl = url.replace('threads.net', 'threads.com');

    // Threadsの投稿ページをfetch（Facebookbotとして取得するとOGPが確実に含まれる）
    const response = await fetch(fetchUrl, {
      headers: {
        'User-Agent': 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'ja-JP,ja;q=0.9,en-US;q=0.8,en;q=0.7',
      },
      redirect: 'follow',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch page: ${response.status}`);
    }

    const html = await response.text();
    let postText = '';

    // デバッグ: HTMLの一部をログ出力
    console.log('[fetch-post-text] HTML length:', html.length);
    console.log('[fetch-post-text] HTML preview:', html.substring(0, 500));

    // パターン1: OGP description（複数パターン対応）
    const ogPatterns = [
      /<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i,
      /<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:description["']/i,
      /<meta\s+property="og:description"\s+content="([^"]+)"/i,
      /<meta\s+content="([^"]+)"\s+property="og:description"/i,
    ];

    for (const pattern of ogPatterns) {
      const match = html.match(pattern);
      if (match) {
        postText = decodeHtmlEntities(match[1]);
        console.log('[fetch-post-text] Found via OGP pattern');
        break;
      }
    }

    // パターン2: JSON-LDから取得
    if (!postText) {
      const jsonLdMatches = html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);
      for (const match of jsonLdMatches) {
        try {
          const jsonLd = JSON.parse(match[1]);
          if (jsonLd.articleBody) {
            postText = decodeHtmlEntities(jsonLd.articleBody);
            console.log('[fetch-post-text] Found via JSON-LD articleBody');
            break;
          } else if (jsonLd.description) {
            postText = decodeHtmlEntities(jsonLd.description);
            console.log('[fetch-post-text] Found via JSON-LD description');
            break;
          }
        } catch (e) {
          // 続行
        }
      }
    }

    // パターン3: meta description
    if (!postText) {
      const metaPatterns = [
        /<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i,
        /<meta[^>]*content=["']([^"']+)["'][^>]*name=["']description["']/i,
      ];
      for (const pattern of metaPatterns) {
        const match = html.match(pattern);
        if (match) {
          postText = decodeHtmlEntities(match[1]);
          console.log('[fetch-post-text] Found via meta description');
          break;
        }
      }
    }

    // パターン4: title タグから（最終手段）
    if (!postText) {
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      if (titleMatch) {
        // タイトルから投稿文を抽出（「ユーザー名: 投稿文」形式の場合）
        const titleText = decodeHtmlEntities(titleMatch[1]);
        const colonIndex = titleText.indexOf(':');
        if (colonIndex > 0 && colonIndex < 50) {
          postText = titleText.substring(colonIndex + 1).trim();
          console.log('[fetch-post-text] Found via title tag');
        }
      }
    }

    // テキストのクリーンアップ
    if (postText) {
      // 「〇〇さん: 」のようなプレフィックスを削除
      postText = postText.replace(/^[^:：]+[:：]\s*/, '');
      // 末尾の「...」や「続きを読む」を削除
      postText = postText.replace(/\.{3,}$/, '').replace(/続きを読む$/, '').trim();
    }

    if (!postText) {
      return res.status(200).json({
        success: false,
        text: null,
        message: 'Could not extract post text',
      });
    }

    return res.status(200).json({
      success: true,
      text: postText,
    });

  } catch (error) {
    console.error('Fetch post text error:', error);
    return res.status(200).json({
      success: false,
      text: null,
      message: error.message,
    });
  }
}
