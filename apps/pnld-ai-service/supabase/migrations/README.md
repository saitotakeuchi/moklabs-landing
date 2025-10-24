# Database Migrations

This directory contains SQL migrations for the PNLD AI Service database.

## How to Apply Migrations

### Option 1: Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard at <https://supabase.com/dashboard>
2. Select your project (in this case: `mdulampmbhnpiaucgnfg`)
3. In the left sidebar, click on **"SQL Editor"**
4. Click **"New Query"** button (top right)
5. Open the migration file locally:

   ```bash
   apps/pnld-ai-service/supabase/migrations/20250123_count_chunks_by_document.sql
   ```

6. Copy the entire SQL contents from the file
7. Paste it into the SQL Editor
8. Click **"Run"** (or press Ctrl+Enter) to execute
9. You should see: "Success. No rows returned"

The function is now deployed and ready to use!

**Visual Guide:**

```bash
Supabase Dashboard → Your Project → SQL Editor (left sidebar) → New Query →
Paste SQL → Run
```

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
