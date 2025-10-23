# Database Migrations

This directory contains SQL migrations for the PNLD AI Service database.

## How to Apply Migrations

### Option 1: Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Open the migration file you want to run
4. Copy the SQL contents
5. Paste into the SQL Editor
6. Click "Run" to execute

### Option 2: Using psql or pgAdmin

If you have direct database access:

```bash
psql <your-database-url> < supabase/migrations/20250123_count_chunks_by_document.sql
```

### Option 3: Supabase CLI

If you have the Supabase CLI installed:

```bash
supabase db push
```

## Available Migrations

### 20250123_count_chunks_by_document.sql

**Purpose**: Optimizes document listing performance by adding a server-side function to count chunks per document.

**What it does**:
- Creates `count_chunks_by_document(uuid[])` function
- Uses PostgreSQL GROUP BY aggregation instead of Python-side counting
- Reduces data transfer and improves performance for large datasets

**Impact**:
- Reduces API response time from potentially 5000ms+ to <500ms for large datasets
- Scales efficiently with thousands of embeddings

**Note**: The application has a fallback mechanism, so it will continue to work even if this migration isn't applied. However, performance will be significantly better with the function in place.

## Verifying Migrations

After applying a migration, you can verify it worked by running:

```sql
SELECT proname, prosrc
FROM pg_proc
WHERE proname = 'count_chunks_by_document';
```

You should see the function listed in the results.
