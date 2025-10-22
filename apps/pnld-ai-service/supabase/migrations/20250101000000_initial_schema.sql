-- Initial database schema for PNLD AI Service
-- This migration creates the necessary tables and indexes for RAG functionality

-- Enable pgvector extension for vector similarity search
CREATE EXTENSION IF NOT EXISTS vector;

-- PNLD Documents table
-- Stores the main document content from PNLD editals
CREATE TABLE IF NOT EXISTS pnld_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    edital_id VARCHAR(50) NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on edital_id for faster filtering
CREATE INDEX IF NOT EXISTS idx_pnld_documents_edital_id ON pnld_documents(edital_id);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_pnld_documents_created_at ON pnld_documents(created_at DESC);

-- Document embeddings with pgvector
-- Stores vector embeddings for document chunks to enable similarity search
CREATE TABLE IF NOT EXISTS pnld_embeddings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES pnld_documents(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    embedding vector(1536),  -- OpenAI text-embedding-3-small dimension
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for vector similarity search using cosine distance
-- ivfflat is an approximate nearest neighbor algorithm that's faster for large datasets
CREATE INDEX IF NOT EXISTS idx_pnld_embeddings_vector
ON pnld_embeddings USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Create index on document_id for faster joins
CREATE INDEX IF NOT EXISTS idx_pnld_embeddings_document_id ON pnld_embeddings(document_id);

-- Chat conversations
-- Stores chat conversation metadata
CREATE TABLE IF NOT EXISTS chat_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    edital_id VARCHAR(50),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on edital_id
CREATE INDEX IF NOT EXISTS idx_chat_conversations_edital_id ON chat_conversations(edital_id);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_chat_conversations_created_at ON chat_conversations(created_at DESC);

-- Chat messages
-- Stores individual messages within conversations
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on conversation_id for faster conversation retrieval
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation_id ON chat_messages(conversation_id);

-- Create index on created_at for sorting messages
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at ASC);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at on pnld_documents
CREATE TRIGGER update_pnld_documents_updated_at
    BEFORE UPDATE ON pnld_documents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger to automatically update updated_at on chat_conversations
CREATE TRIGGER update_chat_conversations_updated_at
    BEFORE UPDATE ON chat_conversations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function for vector similarity search
-- This function can be called via Supabase RPC to perform similarity searches
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
        (edital_filter IS NULL OR d.edital_id = edital_filter)
        AND 1 - (e.embedding <=> query_embedding) > match_threshold
    ORDER BY e.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

-- Comments for documentation
COMMENT ON TABLE pnld_documents IS 'Stores PNLD edital documents and content';
COMMENT ON TABLE pnld_embeddings IS 'Stores vector embeddings for document chunks';
COMMENT ON TABLE chat_conversations IS 'Stores chat conversation metadata';
COMMENT ON TABLE chat_messages IS 'Stores individual chat messages';
COMMENT ON FUNCTION match_documents IS 'Performs vector similarity search on document embeddings';
