-- Create editais (notices/announcements) table
-- Migration: 20250128000000_create_editais_table

-- Create edital_type enum
CREATE TYPE edital_type AS ENUM ('didático', 'literário', 'outros');

-- Create editais table
CREATE TABLE IF NOT EXISTS editais (
    id TEXT PRIMARY KEY,  -- Slug generated from name and year
    name TEXT NOT NULL CHECK (char_length(name) >= 1 AND char_length(name) <= 40),
    year INTEGER NOT NULL CHECK (year >= 2000 AND year <= 2100),
    type edital_type NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,

    -- Ensure unique combination of name and year
    CONSTRAINT unique_edital_name_year UNIQUE (name, year)
);

-- Create index on year for filtering
CREATE INDEX idx_editais_year ON editais(year);

-- Create index on type for filtering
CREATE INDEX idx_editais_type ON editais(type);

-- Create index on created_at for sorting
CREATE INDEX idx_editais_created_at ON editais(created_at DESC);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_editais_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER trigger_update_editais_updated_at
    BEFORE UPDATE ON editais
    FOR EACH ROW
    EXECUTE FUNCTION update_editais_updated_at();

-- Add comment to table
COMMENT ON TABLE editais IS 'PNLD editais (public notices/announcements) for organizing documents';
COMMENT ON COLUMN editais.id IS 'Slug generated from name and year (e.g., pnld-2024-didatico)';
COMMENT ON COLUMN editais.name IS 'Edital name (max 40 characters)';
COMMENT ON COLUMN editais.year IS 'Year in YYYY format';
COMMENT ON COLUMN editais.type IS 'Type of edital: didático, literário, or outros';

-- Enable Row Level Security (RLS)
ALTER TABLE editais ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (adjust based on auth requirements)
CREATE POLICY "Allow all operations on editais" ON editais
    FOR ALL
    USING (true)
    WITH CHECK (true);
