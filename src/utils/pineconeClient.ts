import config from '@/config';
import type { DocumentSearchResult } from '@/types';

/**
 * Search Pinecone for similar global knowledge chunks via proxied API.
 */
export async function searchPinecone(
  queryEmbedding: number[],
  topK: number = config.rag.topK
): Promise<DocumentSearchResult[]> {
  const response = await fetch('/api/pinecone-query', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      vector: queryEmbedding,
      topK,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      `Pinecone search API error (${response.status}): ${errorData?.error || response.statusText}`
    );
  }

  const queryResponse = await response.json();

  if (!queryResponse.matches || queryResponse.matches.length === 0) {
    return [];
  }

  // Map matches to our standard DocumentSearchResult format
  return queryResponse.matches.map((match: any) => {
    const metadata = match.metadata || {};
    
    // Fallback strategies for extracting text from Pinecone metadata
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
