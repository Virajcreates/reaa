import config from '@/config';

/**
 * Generate an embedding vector for a single text using proxied Gemini API.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await fetch('/api/gemini-embed', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      texts: [text],
      model: config.gemini.embeddingModel,
      dimensionality: 768
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      `Embedding API error (${response.status}): ${errorData?.error || response.statusText}`
    );
  }

  const data = await response.json();
  return data.embedding;
}

/**
 * Generate a 3072-dimensional embedding vector for Pinecone using proxied Gemini API.
 * This explicitly uses gemini-embedding-001 to match the n8n DB population.
 */
export async function generatePineconeEmbedding(text: string): Promise<number[]> {
  const modelName = 'gemini-embedding-001';
  const response = await fetch('/api/gemini-embed', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      texts: [text],
      model: modelName
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      `Pinecone Embedding API error (${response.status}): ${errorData?.error || response.statusText}`
    );
  }

  const data = await response.json();
  return data.embedding;
}

/**
 * Generate embeddings for multiple texts in batches via proxy.
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

    const response = await fetch('/api/gemini-embed', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        texts: batch,
        model: config.gemini.embeddingModel,
        dimensionality: 768
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `Batch embedding API error (${response.status}): ${errorData?.error || response.statusText}`
      );
    }

    const data = await response.json();
    allEmbeddings.push(...data.embeddings);

    completed += batch.length;
    onProgress?.(completed, texts.length);
  }

  return allEmbeddings;
}

/**
 * Query Gemini LLM with retrieved context chunks via proxy.
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

  const response = await fetch('/api/gemini-chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: config.gemini.chatModel,
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
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      `Gemini chat API error (${response.status}): ${errorData?.error || response.statusText}`
    );
  }

  const data = await response.json();

  // Extract the text from Gemini's response
  const candidates = data.candidates;
  if (!candidates || candidates.length === 0) {
    throw new Error('No response generated from Gemini');
  }

  return candidates[0].content.parts.map((p: any) => p.text).join('');
}
