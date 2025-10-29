#!/usr/bin/env python3
"""
Apply SQL migration to Supabase database.

This script reads the migration SQL file and executes it directly on the database.
"""

import os
import sys
import asyncio
from pathlib import Path


async def apply_migration(migration_file: str):
    """Apply a migration file to the database."""

    # Read migration file
    migration_path = Path(migration_file)
    if not migration_path.exists():
        print(f"Error: Migration file not found: {migration_file}")
        return False

    with open(migration_path, 'r') as f:
        migration_sql = f.read()

    print(f"Applying migration: {migration_path.name}")
    print("=" * 80)

    # Get database connection string from environment
    database_url = os.getenv('DATABASE_URL')
    if not database_url:
        print("Error: DATABASE_URL environment variable not set")
        print("\nSupabase doesn't provide direct SQL execution via the Python client.")
        print("To apply this migration, you have two options:")
        print("\n1. Use Supabase CLI:")
        print("   supabase db push")
        print("\n2. Apply manually via Supabase Dashboard:")
        print("   - Go to your project dashboard")
        print("   - Navigate to SQL Editor")
        print(f"   - Copy and paste the content from: {migration_file}")
        print("   - Execute the SQL")
        print("\n3. Or execute via psql if you have the connection string:")
        print(f"   psql '<your-connection-string>' < {migration_file}")
        return False

    # Try to use psycopg2 if available
    try:
        import psycopg2

        conn = psycopg2.connect(database_url)
        cursor = conn.cursor()

        try:
            cursor.execute(migration_sql)
            conn.commit()
            print("[OK] Migration applied successfully!")
            return True
        except Exception as e:
            conn.rollback()
            print(f"[ERROR] Failed to apply migration: {str(e)}")
            return False
        finally:
            cursor.close()
            conn.close()

    except ImportError:
        print("psycopg2 not installed.")
        print("\nTo apply this migration, you have two options:")
        print("\n1. Install psycopg2:")
        print("   pip install psycopg2-binary")
        print("   Then run this script again")
        print("\n2. Apply manually via Supabase Dashboard SQL Editor")
        print(f"   Copy the content from: {migration_file}")
        return False


async def main():
    migration_file = "supabase/migrations/20250128000002_update_match_documents_for_standard.sql"

    if len(sys.argv) > 1:
        migration_file = sys.argv[1]

    success = await apply_migration(migration_file)
    return 0 if success else 1


if __name__ == "__main__":
    exit_code = asyncio.run(main())
    sys.exit(exit_code)
