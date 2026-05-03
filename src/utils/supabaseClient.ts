import { createClient, SupabaseClient } from '@supabase/supabase-js';
import config from '@/config';
import type { VectorChunk, DocumentSearchResult } from '@/types';

// Lazy-initialize Supabase client to avoid crashing on missing config
let _supabase: SupabaseClient | null = null;

function getSupabase(): SupabaseClient {
  if (!_supabase) {
    if (!config.supabase.url || !config.supabase.anonKey) {
      throw new Error(
        'Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.'
      );
    }
    _supabase = createClient(config.supabase.url, config.supabase.anonKey);
  }
  return _supabase;
}

/**
 * Insert embedded chunks into Supabase documents table.
 * Batches inserts for performance (100 rows per batch).
 */
export async function insertChunks(chunks: VectorChunk[]): Promise<void> {
  const supabase = getSupabase();
  const BATCH_SIZE = 100;

  for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
    const batch = chunks.slice(i, i + BATCH_SIZE).map((chunk) => ({
      content: chunk.content,
      embedding: JSON.stringify(chunk.embedding),
      metadata: chunk.metadata || {},
      session_id: chunk.sessionId,
      filename: chunk.filename,
      chunk_index: chunk.chunkIndex,
    }));

    const { error } = await supabase.from('documents').insert(batch);

    if (error) {
      console.error('Error inserting chunks batch:', error);
      throw new Error(`Failed to store document chunks: ${error.message}`);
    }
  }
}

/**
 * Search for similar documents using Supabase RPC (pgvector cosine similarity).
 */
export async function searchSimilar(
  queryEmbedding: number[],
  sessionId: string,
  topK: number = config.rag.topK,
  matchThreshold: number = config.rag.matchThreshold
): Promise<DocumentSearchResult[]> {
  const supabase = getSupabase();

  const { data, error } = await supabase.rpc('match_documents', {
    query_embedding: JSON.stringify(queryEmbedding),
    match_threshold: matchThreshold,
    match_count: topK,
    filter_session_id: sessionId,
  });

  if (error) {
    console.error('Error searching documents:', error);
    throw new Error(`Vector search failed: ${error.message}`);
  }

  return (data || []).map((row: any) => ({
    id: row.id,
    content: row.content,
    filename: row.filename,
    chunkIndex: row.chunk_index,
    similarity: row.similarity,
    metadata: row.metadata,
  }));
}

/**
 * Delete documents by session ID, optionally filtered by filename.
 */
export async function deleteDocuments(
  sessionId: string,
  filename?: string
): Promise<void> {
  const supabase = getSupabase();

  const { error } = await supabase.rpc('delete_session_documents', {
    p_session_id: sessionId,
    p_filename: filename || null,
  });

  if (error) {
    console.error('Error deleting documents:', error);
    throw new Error(`Failed to delete documents: ${error.message}`);
  }
}

/**
 * Get count of chunks for a specific file in a session.
 */
export async function getChunkCount(
  sessionId: string,
  filename: string
): Promise<number> {
  const supabase = getSupabase();

  const { count, error } = await supabase
    .from('documents')
    .select('*', { count: 'exact', head: true })
    .eq('session_id', sessionId)
    .eq('filename', filename);

  if (error) {
    console.error('Error getting chunk count:', error);
    return 0;
  }

  return count || 0;
}

export { getSupabase as supabase };
