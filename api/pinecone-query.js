// Vercel Serverless Function: Pinecone Query
// Proxies Pinecone vector search so API key + host stay server-side.

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.PINECONE_API_KEY;
  const host = process.env.PINECONE_HOST;
  if (!apiKey || !host) return res.status(500).json({ error: 'Pinecone not configured' });

  try {
    const { vector, topK = 5 } = req.body;

    // Direct REST call to Pinecone (no SDK needed on serverless)
    const response = await fetch(`${host}/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Api-Key': apiKey,
      },
      body: JSON.stringify({
        vector,
        topK,
        includeMetadata: true,
      }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      return res.status(response.status).json({ error: errData?.message || response.statusText });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
