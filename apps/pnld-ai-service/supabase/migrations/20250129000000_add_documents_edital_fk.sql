-- Add foreign key constraint between pnld_documents and editais
-- Migration: 20250129000000_add_documents_edital_fk

-- First, ensure pnld_documents.edital_id column type matches editais.id
-- editais.id is TEXT, pnld_documents.edital_id is VARCHAR(50)
-- We'll change it to TEXT for consistency
ALTER TABLE pnld_documents
    ALTER COLUMN edital_id TYPE TEXT;

ALTER TABLE chat_conversations
    ALTER COLUMN edital_id TYPE TEXT;

-- Before adding foreign key constraints, we need to handle existing orphaned references
-- Create missing editais for any edital_ids that are referenced but don't exist

-- Create a temporary function to extract year from edital_id or use default
CREATE OR REPLACE FUNCTION extract_year_from_edital(edital_id TEXT) RETURNS INTEGER AS $$
DECLARE
    year_match TEXT;
BEGIN
    -- Try to extract a 4-digit year from the edital_id
    year_match := substring(edital_id FROM '20[0-9]{2}|202[0-9]');
    IF year_match IS NOT NULL THEN
        RETURN year_match::INTEGER;
    ELSE
        -- Default to current year if no year found
        RETURN EXTRACT(YEAR FROM NOW())::INTEGER;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Insert missing editais ONLY from pnld_documents
-- This ensures editais are created only for document references, not conversations
INSERT INTO editais (id, name, year, type, created_at, updated_at)
SELECT DISTINCT
    edital_id,
    edital_id,  -- Use the ID as the name (can be updated manually later)
    extract_year_from_edital(edital_id),  -- Extract year from ID or use current year
    'outros'::edital_type,  -- Default type
    NOW(),
    NOW()
FROM pnld_documents
WHERE edital_id IS NOT NULL
  AND edital_id NOT IN (SELECT id FROM editais)
ON CONFLICT (id) DO NOTHING;

-- Drop the temporary function
DROP FUNCTION extract_year_from_edital(TEXT);

-- Handle orphaned chat_conversations references
-- Set edital_id to NULL for conversations that reference non-existent editais
UPDATE chat_conversations
SET edital_id = NULL
WHERE edital_id IS NOT NULL
  AND edital_id NOT IN (SELECT id FROM editais);

-- Now add foreign key constraint for pnld_documents
-- NULL values are allowed (for standard documents that apply to all editais)
-- Non-NULL values must reference a valid edital in the editais table
ALTER TABLE pnld_documents
    ADD CONSTRAINT fk_pnld_documents_edital
    FOREIGN KEY (edital_id)
    REFERENCES editais(id)
    ON DELETE RESTRICT  -- Prevent deleting an edital if documents reference it
    ON UPDATE CASCADE;  -- Update document references if edital slug changes

-- Add foreign key constraint for chat_conversations
ALTER TABLE chat_conversations
    ADD CONSTRAINT fk_chat_conversations_edital
    FOREIGN KEY (edital_id)
    REFERENCES editais(id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE;

-- Add indexes to improve foreign key lookup performance
-- (these may already exist from previous migrations, hence IF NOT EXISTS)
CREATE INDEX IF NOT EXISTS idx_pnld_documents_edital_id ON pnld_documents(edital_id);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_edital_id ON chat_conversations(edital_id);

-- Update table comments to reflect the relationship
COMMENT ON TABLE pnld_documents IS 'PDF documents uploaded to the system. Documents with NULL edital_id are standard documents available to all editais. Non-NULL edital_id must reference a valid edital in editais table.';
COMMENT ON COLUMN chat_conversations.edital_id IS 'Edital ID (slug). NULL for general conversations. Non-NULL values must reference a valid edital.';
