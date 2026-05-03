import config from '@/config';

const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';

/**
 * Smart fetch that tries to use the local proxy first (for production security)
 * but falls back to direct API calls if the proxy is missing (for local development).
 */
async function smartFetch(proxyPath: string, directUrl: string, body: any) {
  try {
    // 1. Try local proxy
    const proxyResponse = await fetch(proxyPath, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    // If proxy exists and worked, return it
    if (proxyResponse.ok) return proxyResponse;
    
    // If proxy exists but returned error, throw it (don't fallback if it's a real API error)
    if (proxyResponse.status !== 404) return proxyResponse;
  } catch (e) {
    // Proxy failed to even connect (local dev server doesn't have it)
  }

  // 2. Fallback to direct call (Local Dev)
  if (!config.gemini.apiKey) {
    throw new Error('Gemini API key is not configured.');
  }

  return fetch(`${directUrl}?key=${config.gemini.apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

/**
 * Generate an embedding vector for a single text.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const modelName = config.gemini.embeddingModel;
  const body = {
    texts: [text],
    model: modelName,
    dimensionality: 768
  };

  const response = await smartFetch(
    '/api/gemini-embed',
    `${GEMINI_BASE_URL}/models/${modelName}:embedContent`,
    {
      model: `models/${modelName}`,
      content: { parts: [{ text }] },
      outputDimensionality: 768
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      `Embedding API error (${response.status}): ${errorData?.error?.message || errorData?.error || response.statusText}`
    );
  }

  const data = await response.json();
  // Handle both proxy response format and direct Gemini format
  return data.embedding?.values || data.embedding;
}

/**
 * Generate a 3072-dimensional embedding vector for Pinecone.
 */
export async function generatePineconeEmbedding(text: string): Promise<number[]> {
  const modelName = 'gemini-embedding-001';
  
  const response = await smartFetch(
    '/api/gemini-embed',
    `${GEMINI_BASE_URL}/models/${modelName}:embedContent`,
    {
      model: `models/${modelName}`,
      content: { parts: [{ text }] },
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      `Pinecone Embedding API error (${response.status}): ${errorData?.error?.message || errorData?.error || response.statusText}`
    );
  }

  const data = await response.json();
  return data.embedding?.values || data.embedding;
}

/**
 * Generate embeddings for multiple texts in batches.
 */
export async function generateEmbeddings(
  texts: string[],
  onProgress?: (completed: number, total: number) => void
): Promise<number[][]> {
  const BATCH_SIZE = 100;
  const allEmbeddings: number[][] = [];
  let completed = 0;

  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const batch = texts.slice(i, i + BATCH_SIZE);
    const modelName = config.gemini.embeddingModel;

    const response = await smartFetch(
      '/api/gemini-embed',
      `${GEMINI_BASE_URL}/models/${modelName}:batchEmbedContents`,
      {
        requests: batch.map((text) => ({
          model: `models/${modelName}`,
          content: { parts: [{ text }] },
          outputDimensionality: 768
        })),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `Batch embedding API error (${response.status}): ${errorData?.error?.message || errorData?.error || response.statusText}`
      );
    }

    const data = await response.json();
    // Handle both proxy response format and direct Gemini format
    const batchEmbeddings = data.embeddings?.map((e: any) => e.values || e) || data.embeddings;
    allEmbeddings.push(...batchEmbeddings);

    completed += batch.length;
    onProgress?.(completed, texts.length);
  }

  return allEmbeddings;
}

/**
 * Query Gemini LLM with retrieved context chunks.
 */
export async function queryWithContext(
  query: string,
  contextChunks: { content: string; filename: string; similarity: number }[],
  language: string = 'English'
): Promise<string> {
  // Build context from retrieved chunks
  const context = contextChunks
    .map(
      (chunk, i) =>
        `[Source ${i + 1} — ${chunk.filename} (relevance: ${(chunk.similarity * 100).toFixed(0)}%)]\n${chunk.content}`
    )
    .join('\n\n---\n\n');

  const systemPrompt = `You are a helpful AI assistant that answers questions based on the provided retrieved contexts.
You have access to two types of context:
1. [Session Document]: Specific files the user just uploaded.
2. [Knowledge Base]: The global Pinecone knowledge base.

Follow these rules:
1. Answer ONLY based on the provided context. If the context doesn't contain relevant information, say so clearly.
2. Prioritize information from the [Session Document] if it answers the question directly.
3. Use the [Knowledge Base] to fill in gaps, provide comparisons, or answer general questions not found in the uploaded documents.
4. IMPORTANT: Always cite which source(s) your answer comes from (e.g., "According to [Session Document - filename.pdf]..." or "Based on the [Knowledge Base]...").
5. Be concise but thorough.
6. If the question is ambiguous, provide the most relevant interpretation based on the context.
${language.toLowerCase() !== 'english' ? `7. Respond in ${language}.` : ''}`;

  const userPrompt = `## Retrieved Document & Knowledge Base Context:

${context}

---

## User Question:
${query}

Please provide a comprehensive answer based on the above context.`;

  const modelName = config.gemini.chatModel;
  const response = await smartFetch(
    '/api/gemini-chat',
    `${GEMINI_BASE_URL}/models/${modelName}:generateContent`,
    {
      contents: [
        {
          role: 'user',
          parts: [{ text: userPrompt }],
        },
      ],
      systemInstruction: {
        parts: [{ text: systemPrompt }],
      },
      generationConfig: {
        temperature: 0.3,
        topP: 0.8,
        maxOutputTokens: 2048,
      },
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      `Gemini chat API error (${response.status}): ${errorData?.error?.message || errorData?.error || response.statusText}`
    );
  }

  const data = await response.json();
  const candidates = data.candidates;
  if (!candidates || candidates.length === 0) {
    throw new Error('No response generated from Gemini');
  }

  return candidates[0].content.parts.map((p: any) => p.text).join('');
}
