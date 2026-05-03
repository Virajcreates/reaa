-- ============================================================
-- Supabase SQL Migration for PDF Upload + Vector Search
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- Step 1: Enable the vector extension
create extension if not exists vector;

-- Step 2: Create the documents table for storing embedded chunks
create table if not exists documents (
  id bigserial primary key,
  content text not null,
  embedding vector(768),           -- Gemini text-embedding-004 outputs 768 dimensions
  metadata jsonb default '{}',
  session_id text not null,
  filename text not null,
  chunk_index int not null,
  created_at timestamptz default now()
);

-- Step 3: Create HNSW index for fast cosine similarity search
create index if not exists idx_documents_embedding 
  on documents using hnsw (embedding vector_cosine_ops);

-- Step 4: Create index for filtering by session_id
create index if not exists idx_documents_session 
  on documents(session_id);

-- Step 5: Create RPC function for similarity search
create or replace function match_documents(
  query_embedding vector(768),
  match_threshold float default 0.5,
  match_count int default 5,
  filter_session_id text default null
)
returns table (
  id bigint,
  content text,
  metadata jsonb,
  filename text,
  chunk_index int,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    d.id,
    d.content,
    d.metadata,
    d.filename,
    d.chunk_index,
    1 - (d.embedding <=> query_embedding) as similarity
  from documents d
  where (filter_session_id is null or d.session_id = filter_session_id)
    and 1 - (d.embedding <=> query_embedding) > match_threshold
  order by d.embedding <=> query_embedding
  limit match_count;
end;
$$;

-- Step 6: Create RPC function to delete documents
create or replace function delete_session_documents(
  p_session_id text,
  p_filename text default null
)
returns void
language plpgsql
as $$
begin
  if p_filename is not null then
    delete from documents where session_id = p_session_id and filename = p_filename;
  else
    delete from documents where session_id = p_session_id;
  end if;
end;
$$;

-- Step 7: Enable Row Level Security
alter table documents enable row level security;

-- Step 8: Create permissive policy (using anon key — suitable for prototyping)
-- For production, restrict based on auth.uid() or other criteria
create policy "Allow all access" 
  on documents 
  for all 
  using (true) 
  with check (true);
