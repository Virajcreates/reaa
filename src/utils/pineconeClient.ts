import config from '@/config';
import type { DocumentSearchResult } from '@/types';

/**
 * Search Pinecone for similar global knowledge chunks.
 * Tries the local proxy first (for production), falls back to direct call (for local dev).
 */
export async function searchPinecone(
  queryEmbedding: number[],
  topK: number = config.rag.topK
): Promise<DocumentSearchResult[]> {
  let data;
  
  try {
    // 1. Try local proxy (Production)
    const proxyResponse = await fetch('/api/pinecone-query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vector: queryEmbedding, topK }),
    });

    if (proxyResponse.ok) {
      data = await proxyResponse.json();
    } else if (proxyResponse.status !== 404) {
      const err = await proxyResponse.json().catch(() => ({}));
      throw new Error(err.error || proxyResponse.statusText);
    }
  } catch (e) {
    // Proxy failed or not found
  }

  // 2. Fallback to direct call if proxy failed/not found (Local Dev)
  if (!data) {
    if (!config.pinecone.apiKey || !config.pinecone.host) {
      throw new Error('Pinecone is not fully configured.');
    }

    const response = await fetch(`${config.pinecone.host}/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Api-Key': config.pinecone.apiKey,
      },
      body: JSON.stringify({
        vector: queryEmbedding,
        topK,
        includeMetadata: true,
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || response.statusText);
    }
    data = await response.json();
  }

  if (!data.matches || data.matches.length === 0) {
    return [];
  }

  // Map matches to our standard DocumentSearchResult format
  return data.matches.map((match: any) => {
    const metadata = match.metadata || {};
    const content = metadata.text || metadata.content || metadata.chunk || JSON.stringify(metadata);

    return {
      id: match.id,
      content: content as string,
      filename: 'Knowledge Base',
      chunkIndex: 0,
      similarity: match.score || 0,
      metadata: metadata,
    };
  });
}
