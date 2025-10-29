-- Enable Row Level Security (RLS) for all tables
-- Migration: 20250129000001_enable_rls_all_tables

-- This migration enables RLS on all tables and creates policies that allow
-- full access for authenticated service role while protecting against
-- unauthorized direct database access.

-- Enable RLS on pnld_documents
ALTER TABLE pnld_documents ENABLE ROW LEVEL SECURITY;

-- Enable RLS on pnld_embeddings
ALTER TABLE pnld_embeddings ENABLE ROW LEVEL SECURITY;

-- Enable RLS on chat_conversations
ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;

-- Enable RLS on chat_messages
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Note: editais already has RLS enabled from migration 20250128000000_create_editais_table.sql

-- ============================================================================
-- POLICIES FOR PNLD_DOCUMENTS
-- ============================================================================

-- Allow all operations for service role (backend API)
CREATE POLICY "Service role has full access to pnld_documents"
    ON pnld_documents
    FOR ALL
    USING (auth.jwt()->>'role' = 'service_role')
    WITH CHECK (auth.jwt()->>'role' = 'service_role');

-- Allow public read access to documents (for frontend display)
CREATE POLICY "Public can read pnld_documents"
    ON pnld_documents
    FOR SELECT
    USING (true);

-- ============================================================================
-- POLICIES FOR PNLD_EMBEDDINGS
-- ============================================================================

-- Service role has full access (needed for RAG operations)
CREATE POLICY "Service role has full access to pnld_embeddings"
    ON pnld_embeddings
    FOR ALL
    USING (auth.jwt()->>'role' = 'service_role')
    WITH CHECK (auth.jwt()->>'role' = 'service_role');

-- No public access to embeddings (internal use only)

-- ============================================================================
-- POLICIES FOR CHAT_CONVERSATIONS
-- ============================================================================

-- Service role has full access
CREATE POLICY "Service role has full access to chat_conversations"
    ON chat_conversations
    FOR ALL
    USING (auth.jwt()->>'role' = 'service_role')
    WITH CHECK (auth.jwt()->>'role' = 'service_role');

-- Allow public read access to conversations (for frontend)
CREATE POLICY "Public can read chat_conversations"
    ON chat_conversations
    FOR SELECT
    USING (true);

-- ============================================================================
-- POLICIES FOR CHAT_MESSAGES
-- ============================================================================

-- Service role has full access
CREATE POLICY "Service role has full access to chat_messages"
    ON chat_messages
    FOR ALL
    USING (auth.jwt()->>'role' = 'service_role')
    WITH CHECK (auth.jwt()->>'role' = 'service_role');

-- Allow public read access to messages (for frontend)
CREATE POLICY "Public can read chat_messages"
    ON chat_messages
    FOR SELECT
    USING (true);

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON POLICY "Service role has full access to pnld_documents" ON pnld_documents
    IS 'Backend API (using service role key) has full access to documents';

COMMENT ON POLICY "Public can read pnld_documents" ON pnld_documents
    IS 'Frontend can read documents for display';

COMMENT ON POLICY "Service role has full access to pnld_embeddings" ON pnld_embeddings
    IS 'Backend API has full access to embeddings for RAG operations';

COMMENT ON POLICY "Service role has full access to chat_conversations" ON chat_conversations
    IS 'Backend API has full access to conversations';

COMMENT ON POLICY "Public can read chat_conversations" ON chat_conversations
    IS 'Frontend can read conversations for display';

COMMENT ON POLICY "Service role has full access to chat_messages" ON chat_messages
    IS 'Backend API has full access to messages';

COMMENT ON POLICY "Public can read chat_messages" ON chat_messages
    IS 'Frontend can read messages for display';
