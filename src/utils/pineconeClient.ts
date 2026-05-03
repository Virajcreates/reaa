import { Pinecone } from '@pinecone-database/pinecone';
import config from '@/config';
import type { DocumentSearchResult } from '@/types';

// Lazy-initialize Pinecone client
let _pinecone: Pinecone | null = null;
let _index: any = null;

function getPineconeIndex() {
  if (!_pinecone) {
    if (!config.pinecone.apiKey || !config.pinecone.indexName) {
      throw new Error(
        'Pinecone is not fully configured. Please set VITE_PINECONE_API_KEY and VITE_PINECONE_INDEX_NAME in your .env file.'
      );
    }
    _pinecone = new Pinecone({
      apiKey: config.pinecone.apiKey,
    });
    
    // Connect to the specific index (using host if provided, otherwise letting SDK resolve it)
    if (config.pinecone.host) {
      _index = _pinecone.index(config.pinecone.indexName, config.pinecone.host);
    } else {
      _index = _pinecone.index(config.pinecone.indexName);
    }
  }
  return _index;
}

/**
 * Search Pinecone for similar global knowledge chunks.
 * We extract the 'text' or 'content' field from the metadata.
 */
export async function searchPinecone(
  queryEmbedding: number[],
  topK: number = config.rag.topK
): Promise<DocumentSearchResult[]> {
  let queryResponse;

  if (import.meta.env.PROD) {
    // Production (Vercel): Use serverless proxy
    const proxyResponse = await fetch('/api/pinecone-query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vector: queryEmbedding, topK }),
    });

    if (!proxyResponse.ok) {
      const err = await proxyResponse.json().catch(() => ({}));
      throw new Error(err.error || proxyResponse.statusText);
    }
    queryResponse = await proxyResponse.json();
  } else {
    // Localhost: Direct SDK call
    const index = getPineconeIndex();

    // Query Pinecone
    queryResponse = await index.query({
      vector: queryEmbedding,
      topK,
      includeMetadata: true,
    });
  }

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
