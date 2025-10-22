-- Add page tracking columns to pnld_embeddings
-- This migration adds support for page-level chunking and metadata tracking

-- Add page_number column for citation support
ALTER TABLE pnld_embeddings
ADD COLUMN IF NOT EXISTS page_number INTEGER;

-- Add chunk_index column to track multiple chunks within a page
ALTER TABLE pnld_embeddings
ADD COLUMN IF NOT EXISTS chunk_index INTEGER DEFAULT 0;

-- Add metadata column for additional chunk information
ALTER TABLE pnld_embeddings
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Create index on page_number for filtering and sorting
CREATE INDEX IF NOT EXISTS idx_pnld_embeddings_page_number
ON pnld_embeddings(page_number);

-- Create composite index on document_id and page_number for efficient page lookups
CREATE INDEX IF NOT EXISTS idx_pnld_embeddings_doc_page
ON pnld_embeddings(document_id, page_number);

-- Drop the existing match_documents function before creating the updated version
DROP FUNCTION IF EXISTS match_documents(vector, float, int, varchar);

-- Create updated match_documents function to include page_number in results
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
    edital_id varchar,
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
        (edital_filter IS NULL OR d.edital_id = edital_filter)
        AND 1 - (e.embedding <=> query_embedding) > match_threshold
    ORDER BY e.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

-- Update function comment
COMMENT ON FUNCTION match_documents IS 'Performs vector similarity search on document embeddings with page tracking';
