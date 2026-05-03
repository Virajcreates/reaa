// Vercel Serverless Function: Gemini Embed (single + batch)
// Proxies Gemini embedding requests so the API key stays server-side.

const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'GEMINI_API_KEY not configured' });

  try {
    const { texts, model, dimensionality } = req.body;
    const modelName = model || 'gemini-embedding-2';

    // Batch embedding
    if (Array.isArray(texts) && texts.length > 1) {
      const url = `${GEMINI_BASE_URL}/models/${modelName}:batchEmbedContents?key=${apiKey}`;
      const bodyPayload = {
        requests: texts.map((text) => ({
          model: `models/${modelName}`,
          content: { parts: [{ text }] },
          ...(dimensionality ? { outputDimensionality: dimensionality } : {}),
        })),
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyPayload),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        return res.status(response.status).json({ error: errData?.error?.message || response.statusText });
      }

      const data = await response.json();
      return res.status(200).json({ embeddings: data.embeddings.map((e) => e.values) });
    }

    // Single embedding
    const text = Array.isArray(texts) ? texts[0] : texts;
    const url = `${GEMINI_BASE_URL}/models/${modelName}:embedContent?key=${apiKey}`;
    const bodyPayload = {
      model: `models/${modelName}`,
      content: { parts: [{ text }] },
      ...(dimensionality ? { outputDimensionality: dimensionality } : {}),
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bodyPayload),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      return res.status(response.status).json({ error: errData?.error?.message || response.statusText });
    }

    const data = await response.json();
    return res.status(200).json({ embedding: data.embedding.values });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
