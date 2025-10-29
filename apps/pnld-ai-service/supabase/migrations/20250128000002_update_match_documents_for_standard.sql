-- Update match_documents function to include standard documents (NULL edital_id)
-- Migration: 20250128000002_update_match_documents_for_standard

-- First, drop all existing versions of match_documents function
-- We need to be explicit about each signature that might exist

-- Drop the 4-parameter version with various type combinations
DROP FUNCTION IF EXISTS match_documents(vector(1536), float, int, varchar);
DROP FUNCTION IF EXISTS match_documents(query_embedding vector(1536), match_threshold float, match_count int, edital_filter varchar);
DROP FUNCTION IF EXISTS match_documents(vector(1536), double precision, integer, text);
DROP FUNCTION IF EXISTS match_documents(query_embedding vector(1536), match_threshold double precision, match_count integer, edital_filter text);

-- Drop the 3-parameter version without edital_filter (in case it exists)
DROP FUNCTION IF EXISTS match_documents(vector(1536), float, int);
DROP FUNCTION IF EXISTS match_documents(vector(1536), double precision, integer);

-- Now create the function with updated logic to include standard documents
-- Using the same types as the original: float instead of double precision, int instead of integer, varchar instead of text
CREATE OR REPLACE FUNCTION match_documents(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 5,
  edital_filter varchar DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  document_id uuid,
  content text,
  similarity float,
  document_title text,
  edital_id varchar
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
    d.edital_id
  FROM pnld_embeddings e
  JOIN pnld_documents d ON e.document_id = d.id
  WHERE
    1 - (e.embedding <=> query_embedding) > match_threshold
    AND (
      -- If edital_filter is provided, include documents matching that edital OR standard documents (NULL edital_id)
      edital_filter IS NULL
      OR d.edital_id = edital_filter
      OR d.edital_id IS NULL
    )
  ORDER BY e.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Add comment explaining the update
COMMENT ON FUNCTION match_documents IS 'Matches documents based on vector similarity. When edital_filter is provided, includes both documents matching that edital AND standard documents (where edital_id IS NULL). Standard documents are always included in searches.';
