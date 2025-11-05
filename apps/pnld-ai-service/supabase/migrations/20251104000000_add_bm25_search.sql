-- Migration: Add BM25 Full-Text Search Support
-- Description: Adds PostgreSQL full-text search capabilities with Portuguese language support
-- for hybrid search (vector + BM25) implementation

-- Create Portuguese text search configuration for PNLD documents
-- This extends the default Portuguese configuration with domain-specific settings
CREATE TEXT SEARCH CONFIGURATION IF NOT EXISTS portuguese_pnld (COPY = pg_catalog.portuguese);

COMMENT ON TEXT SEARCH CONFIGURATION portuguese_pnld IS
'Portuguese text search configuration optimized for PNLD educational documents';

-- Add generated tsvector column for full-text search
-- This column is automatically updated when content changes
ALTER TABLE pnld_embeddings
ADD COLUMN IF NOT EXISTS content_search tsvector
GENERATED ALWAYS AS (
    to_tsvector('portuguese_pnld', content)
) STORED;

COMMENT ON COLUMN pnld_embeddings.content_search IS
'Auto-generated text search vector for BM25-style full-text search';

-- Create GIN index for fast full-text search
-- GIN (Generalized Inverted Index) is optimal for tsvector columns
CREATE INDEX IF NOT EXISTS idx_pnld_embeddings_content_search
ON pnld_embeddings
USING gin(content_search);

COMMENT ON INDEX idx_pnld_embeddings_content_search IS
'GIN index for fast full-text search on document content';

-- Function for BM25-style search
-- Uses ts_rank_cd for document length normalization (similar to BM25)
CREATE OR REPLACE FUNCTION bm25_search(
    search_query text,
    edital_filter varchar DEFAULT NULL,
    result_limit int DEFAULT 20
)
RETURNS TABLE (
    id uuid,
    document_id uuid,
    content text,
    bm25_score float,
    document_title text,
    edital_id varchar,
    page_number int,
    chunk_index int
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        e.id,
        e.document_id,
        e.content,
        ts_rank_cd(
            e.content_search,
            plainto_tsquery('portuguese_pnld', search_query),
            32  -- normalization flag: divide rank by document length
        )::float as bm25_score,
        d.title as document_title,
        d.edital_id,
        e.page_number,
        e.chunk_index
    FROM pnld_embeddings e
    JOIN pnld_documents d ON e.document_id = d.id
    WHERE
        e.content_search @@ plainto_tsquery('portuguese_pnld', search_query)
        AND (edital_filter IS NULL OR d.edital_id = edital_filter)
    ORDER BY bm25_score DESC
    LIMIT result_limit;
END;
$$;

COMMENT ON FUNCTION bm25_search IS
'BM25-style full-text search with Portuguese language support and optional edital filtering';

-- Alternative function using websearch_to_tsquery for more flexible query syntax
-- Supports quoted phrases, OR, and negation
CREATE OR REPLACE FUNCTION bm25_search_advanced(
    search_query text,
    edital_filter varchar DEFAULT NULL,
    result_limit int DEFAULT 20,
    min_score float DEFAULT 0.01
)
RETURNS TABLE (
    id uuid,
    document_id uuid,
    content text,
    bm25_score float,
    document_title text,
    edital_id varchar,
    page_number int,
    chunk_index int,
    headline text
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        e.id,
        e.document_id,
        e.content,
        ts_rank_cd(
            e.content_search,
            websearch_to_tsquery('portuguese_pnld', search_query),
            32
        )::float as bm25_score,
        d.title as document_title,
        d.edital_id,
        e.page_number,
        e.chunk_index,
        ts_headline(
            'portuguese_pnld',
            e.content,
            websearch_to_tsquery('portuguese_pnld', search_query),
            'StartSel=<mark>, StopSel=</mark>, MaxWords=50, MinWords=25'
        ) as headline
    FROM pnld_embeddings e
    JOIN pnld_documents d ON e.document_id = d.id
    WHERE
        e.content_search @@ websearch_to_tsquery('portuguese_pnld', search_query)
        AND (edital_filter IS NULL OR d.edital_id = edital_filter)
        AND ts_rank_cd(
            e.content_search,
            websearch_to_tsquery('portuguese_pnld', search_query),
            32
        ) > min_score
    ORDER BY bm25_score DESC
    LIMIT result_limit;
END;
$$;

COMMENT ON FUNCTION bm25_search_advanced IS
'Advanced BM25 search with query syntax support ("quotes", OR, -negation) and result highlighting';

-- Create index on document_id for faster joins (if not exists)
CREATE INDEX IF NOT EXISTS idx_pnld_embeddings_document_id_bm25
ON pnld_embeddings(document_id)
WHERE content_search IS NOT NULL;

-- Add statistics target for better query planning
ALTER TABLE pnld_embeddings
ALTER COLUMN content_search SET STATISTICS 1000;

-- Vacuum and analyze to update statistics
VACUUM ANALYZE pnld_embeddings;
