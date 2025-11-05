-- Apply this SQL directly to your Supabase database via the SQL Editor

-- Drop existing function versions
DROP FUNCTION IF EXISTS match_documents(vector(1536), float, int, varchar);
DROP FUNCTION IF EXISTS match_documents(query_embedding vector(1536), match_threshold float, match_count int, edital_filter varchar);

-- Recreate with TEXT type for edital_id
CREATE OR REPLACE FUNCTION match_documents(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 5,
  edital_filter text DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  document_id uuid,
  content text,
  similarity float,
  document_title text,
  edital_id text,
  page_number integer,
  chunk_index integer,
  chunk_metadata jsonb
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    e.id,
    e.document_id,
    e.content,
    1 - (e.embedding <=> query_embedding) as similarity,
    d.title as document_title,
    d.edital_id,
    e.page_number,
    e.chunk_index,
    e.metadata as chunk_metadata
  FROM pnld_embeddings e
  JOIN pnld_documents d ON e.document_id = d.id
  WHERE
    1 - (e.embedding <=> query_embedding) > match_threshold
    AND (
      edital_filter IS NULL
      OR d.edital_id = edital_filter
      OR d.edital_id IS NULL
    )
  ORDER BY e.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
