"""
Run SQL migration to create count_chunks_by_document function.

This script applies the migration to create an optimized server-side
function for counting chunks per document.
"""

import asyncio
import os
from pathlib import Path
from app.services.supabase import get_async_supabase_client


async def run_migration():
    """Execute the count_chunks_by_document migration."""
    # Read migration file
    migration_file = Path(__file__).parent / "supabase" / "migrations" / "20250123_count_chunks_by_document.sql"

    if not migration_file.exists():
        print(f"ERROR: Migration file not found: {migration_file}")
        return False

    with open(migration_file, "r") as f:
        migration_sql = f.read()

    print("=" * 60)
    print("Running Migration: count_chunks_by_document")
    print("=" * 60)
    print()

    try:
        # Get Supabase client
        client = await get_async_supabase_client()

        # Execute migration SQL using rpc to execute raw SQL
        # Note: Supabase doesn't directly support raw SQL execution via the client
        # So we'll need to use the Postgres connection directly

        # Alternative: Use psycopg2 with DATABASE_URL
        import asyncpg
        from dotenv import load_dotenv

        load_dotenv()
        database_url = os.getenv("DATABASE_URL")

        # If DATABASE_URL not provided, construct from SUPABASE_URL
        if not database_url:
            supabase_url = os.getenv("SUPABASE_URL")
            supabase_key = os.getenv("SUPABASE_SERVICE_KEY")

            if not supabase_url:
                print("ERROR: Neither DATABASE_URL nor SUPABASE_URL found in environment")
                print("Please add one of these to your .env file")
                return False

            # Extract project ref from Supabase URL
            # Format: https://<project-ref>.supabase.co
            import re
            match = re.search(r'https://([^.]+)\.supabase\.co', supabase_url)
            if not match:
                print(f"ERROR: Invalid SUPABASE_URL format: {supabase_url}")
                return False

            project_ref = match.group(1)
            # Construct database URL
            # Format: postgresql://postgres.[project-ref]:[password]@aws-0-us-west-1.pooler.supabase.com:6543/postgres
            db_password = os.getenv("SUPABASE_DB_PASSWORD") or os.getenv("DB_PASSWORD")

            if not db_password:
                print("ERROR: Database password not found")
                print("Please add SUPABASE_DB_PASSWORD or DB_PASSWORD to your .env file")
                print("You can find this in your Supabase project settings under Database")
                return False

            database_url = f"postgresql://postgres.{project_ref}:{db_password}@aws-0-us-west-1.pooler.supabase.com:6543/postgres"
            print(f"Using constructed database URL for project: {project_ref}")
            print()

        # Connect to database
        conn = await asyncpg.connect(database_url)

        try:
            # Execute migration
            print("Executing SQL migration...")
            await conn.execute(migration_sql)
            print("✓ Migration executed successfully")
            print()

            # Verify function was created
            result = await conn.fetch("""
                SELECT proname, prosrc
                FROM pg_proc
                WHERE proname = 'count_chunks_by_document'
            """)

            if result:
                print("✓ Function 'count_chunks_by_document' created successfully")
                print(f"  Function exists: {result[0]['proname']}")
                print()
                return True
            else:
                print("✗ Function was not created")
                return False

        finally:
            await conn.close()

    except Exception as e:
        print(f"ERROR: Migration failed")
        print(f"  {type(e).__name__}: {str(e)}")
        return False


if __name__ == "__main__":
    success = asyncio.run(run_migration())
    exit(0 if success else 1)
