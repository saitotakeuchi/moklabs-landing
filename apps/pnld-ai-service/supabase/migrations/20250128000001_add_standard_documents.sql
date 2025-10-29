-- Add support for standard documents (documents that apply to all editais)
-- Migration: 20250128000001_add_standard_documents

-- Allow edital_id to be NULL for standard documents
-- Standard documents with NULL edital_id will be included in searches for all editais
ALTER TABLE pnld_documents
    ALTER COLUMN edital_id DROP NOT NULL;

-- Add index for standard documents (NULL edital_id)
CREATE INDEX IF NOT EXISTS idx_pnld_documents_standard ON pnld_documents(edital_id) WHERE edital_id IS NULL;

-- Add comment explaining standard documents
COMMENT ON COLUMN pnld_documents.edital_id IS 'Edital ID (slug). NULL for standard documents that apply to all editais';

-- Update the search function to include standard documents
-- This affects the existing count_chunks_by_document function behavior
COMMENT ON TABLE pnld_documents IS 'PDF documents uploaded to the system. Documents with NULL edital_id are standard documents available to all editais';
