-- Migration: Add function to efficiently count chunks per document
-- This optimizes the document listing endpoint by using server-side aggregation
-- instead of fetching all embeddings and counting them in Python

CREATE OR REPLACE FUNCTION count_chunks_by_document(document_ids uuid[])
RETURNS TABLE (document_id uuid, chunk_count bigint)
LANGUAGE sql
STABLE
AS $$
  SELECT
    document_id,
    COUNT(*) as chunk_count
  FROM pnld_embeddings
  WHERE document_id = ANY(document_ids)
  GROUP BY document_id;
$$;

-- Add comment for documentation
COMMENT ON FUNCTION count_chunks_by_document IS
  'Efficiently counts embeddings/chunks per document using server-side aggregation. '
  'Used by the document listing endpoint to avoid transferring large amounts of data.';
