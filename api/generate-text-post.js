// Gemini API - Text-only Post Generation Endpoint
// For generating Threads posts based on buzz post patterns
// Note: Using half-width parentheses only to avoid char boundary errors

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { emotionType, buzzPosts, tone, geminiApiKey } = req.body;

    if (!buzzPosts || buzzPosts.length === 0) {
      return res.status(400).json({ error: 'No buzz posts provided' });
    }

    const apiKey = geminiApiKey;
    if (!apiKey) {
      return res.status(400).json({ error: 'Gemini API key is required', needApiKey: true });
    }

    // Build tone description (half-width parentheses only)
    const toneDescription = tone === 'fun'
      ? 'Friendly and warm tone, using emojis naturally (like a friend chatting)'
      : 'Calm and sincere tone, minimal or no emojis (professional but approachable)';

    // Build emotion description
    const emotionDescription = emotionType === 'heartwarming'
      ? 'Create heartwarming stories about daily life that make readers feel warm and fuzzy. Focus on small happy moments, family, pets, or kind interactions.'
      : 'Create slightly funny, relatable moments that make readers chuckle. Focus on everyday mishaps, awkward situations, or humorous observations.';

    // Build few-shot examples from buzz posts
    const buzzPostsText = buzzPosts
      .slice(0, 5)
      .map((post, i) => `Example ${i + 1}:\n${post.text || post}`)
      .join('\n\n');

    const prompt = `You are an expert at creating viral Threads posts in Japanese.

[Character Tone Setting - MUST FOLLOW]
${toneDescription}

[Reference Buzz Posts - Learn from these structures]
${buzzPostsText}

[Your Task]
${emotionDescription}

Create 3 completely NEW and ORIGINAL posts. Each post must:
- Be 250-350 Japanese characters
- Follow the character tone setting strictly
- Target audience: housewives and office workers in their 20s-40s
- Theme: relatable daily life moments (work, family, cooking, commuting, etc.)
- Use the STRUCTURE of reference posts but create ORIGINAL content
- DO NOT copy any phrases directly from reference posts
- Write in natural, conversational Japanese

[Output Format]
Return ONLY a JSON array with exactly 3 post strings:
["post1", "post2", "post3"]

No markdown, no explanation, just the JSON array.`;

    // Call Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.95,
            maxOutputTokens: 2048,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Gemini API error:', errorData);
      return res.status(500).json({ error: 'Gemini API request failed' });
    }

    const data = await response.json();

    // Extract the generated text
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!generatedText) {
      return res.status(500).json({ error: 'No response from Gemini API' });
    }

    // Parse the JSON response
    let posts;
    try {
      // Remove markdown code block markers if present
      const cleanedText = generatedText
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();

      posts = JSON.parse(cleanedText);

      if (!Array.isArray(posts) || posts.length === 0) {
        throw new Error('Invalid response format');
      }
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', generatedText);

      // Fallback: try to extract posts from raw text
      const lines = generatedText
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 50 && !line.startsWith('{') && !line.startsWith('['));

      if (lines.length >= 3) {
        posts = lines.slice(0, 3);
      } else {
        return res.status(500).json({ error: 'Failed to parse generated posts' });
      }
    }

    return res.status(200).json({
      success: true,
      posts: posts.slice(0, 3).map((content, index) => ({
        id: index + 1,
        content: typeof content === 'string' ? content : String(content),
        emotionType: emotionType,
      })),
    });

  } catch (error) {
    console.error('Generate text post error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
