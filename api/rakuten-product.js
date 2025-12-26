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

  // 楽天商品URLかチェック
  if (!url.includes('item.rakuten.co.jp')) {
    return res.status(400).json({ error: 'Invalid Rakuten product URL' });
  }

  try {
    // 商品ページを直接fetch
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'ja-JP,ja;q=0.9,en-US;q=0.8,en;q=0.7',
        'Accept-Charset': 'UTF-8',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch product page: ${response.status}`);
    }

    // ArrayBufferとして取得し、エンコーディングを検出
    const buffer = await response.arrayBuffer();

    // まずUTF-8でデコードを試みる
    let html = new TextDecoder('utf-8').decode(buffer);

    // HTMLからcharsetを検出
    const charsetMatch = html.match(/<meta[^>]*charset=["']?([^"'\s>]+)/i) ||
                         html.match(/<meta[^>]*content=["'][^"']*charset=([^"'\s;]+)/i);

    if (charsetMatch) {
      const charset = charsetMatch[1].toLowerCase();
      // EUC-JPやShift_JISの場合は再デコード
      if (charset === 'euc-jp' || charset === 'shift_jis' || charset === 'shift-jis') {
        try {
          html = new TextDecoder(charset).decode(buffer);
        } catch (e) {
          console.log('Fallback to UTF-8 decoding');
        }
      }
    }

    // 商品情報を抽出
    let productName = '';
    let description = '';
    let imageUrls = [];
    let price = null;

    // JSON-LDを探す
    const jsonLdMatch = html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/i);
    if (jsonLdMatch) {
      try {
        const jsonLd = JSON.parse(jsonLdMatch[1]);
        if (jsonLd['@type'] === 'Product' || jsonLd.name) {
          productName = decodeHtmlEntities(jsonLd.name || '');
          description = decodeHtmlEntities(jsonLd.description || '');
          // 画像は配列の場合とそうでない場合がある
          if (Array.isArray(jsonLd.image)) {
            imageUrls = jsonLd.image;
          } else if (jsonLd.image) {
            imageUrls = [jsonLd.image];
          }
          if (jsonLd.offers) {
            price = jsonLd.offers.price || jsonLd.offers.lowPrice || null;
          }
        }
      } catch (e) {
        console.error('JSON-LD parse error:', e);
      }
    }

    // 追加の画像をHTMLから抽出（楽天の商品画像パターン）
    const imgMatches = html.matchAll(/["'](https?:\/\/(?:tshop\.r10s\.jp|image\.rakuten\.co\.jp|thumbnail\.image\.rakuten\.co\.jp)[^"']+\.(?:jpg|jpeg|png|gif|webp))["']/gi);
    const additionalImages = [];
    for (const match of imgMatches) {
      const imgUrl = match[1];
      // サムネイルを大きい画像に変換
      const largeUrl = imgUrl
        .replace(/\/s\d+x\d+/, '')
        .replace('thumbnail.image.rakuten.co.jp', 'image.rakuten.co.jp');

      if (!additionalImages.includes(largeUrl) && !imageUrls.includes(largeUrl)) {
        additionalImages.push(largeUrl);
      }
    }

    // 画像を結合（重複を除去、最大10枚）
    imageUrls = [...new Set([...imageUrls, ...additionalImages])].slice(0, 10);

    // JSON-LDがない場合はHTMLから抽出
    if (!productName) {
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      if (titleMatch) {
        productName = decodeHtmlEntities(titleMatch[1].split('|')[0].split('-')[0].trim());
      }
    }

    // OGPタグからも試行
    if (!productName) {
      const ogTitleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i);
      if (ogTitleMatch) {
        productName = decodeHtmlEntities(ogTitleMatch[1]);
      }
    }

    if (imageUrls.length === 0) {
      const ogImageMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i);
      if (ogImageMatch) {
        imageUrls = [ogImageMatch[1]];
      }
    }

    if (!description) {
      const ogDescMatch = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i);
      if (ogDescMatch) {
        description = decodeHtmlEntities(ogDescMatch[1]);
      }
    }

    // それでも取れない場合はURLから推測
    if (!productName) {
      const urlMatch = url.match(/item\.rakuten\.co\.jp\/([^\/]+)\/([^\/\?]+)/);
      if (urlMatch) {
        productName = urlMatch[2].replace(/-/g, ' ');
      }
    }

    return res.status(200).json({
      success: true,
      productName: productName || '商品名不明',
      description: description || '',
      price,
      imageUrls: imageUrls,
      imageUrl: imageUrls[0] || null,
      source: 'html_scrape',
    });

  } catch (error) {
    console.error('Rakuten product fetch error:', error);
    return res.status(500).json({
      error: 'Failed to fetch product info',
      message: error.message,
    });
  }
}
