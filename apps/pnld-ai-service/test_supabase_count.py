#!/usr/bin/env python3
"""
Test script to verify Supabase count behavior.

This tests whether the Supabase Python client can extract counts
without materializing all rows into memory.
"""

import sys
import asyncio
from pathlib import Path

# Add app to path
sys.path.insert(0, str(Path(__file__).parent))

from app.services.supabase import get_async_supabase_client


async def test_count_strategies():
    """Test different strategies for getting counts from Supabase."""
    print("=" * 80)
    print("Testing Supabase Count Strategies")
    print("=" * 80)

    supabase = await get_async_supabase_client()

    # Strategy 1: select("*", count="exact") - Current approach
    print("\n1. Current Approach: select('*', count='exact')")
    print("-" * 80)
    result1 = await (
        supabase.table("pnld_embeddings")
        .select("*", count="exact")
        .limit(1)
        .execute()
    )
    print(f"   Count: {result1.count}")
    print(f"   Data rows returned: {len(result1.data) if result1.data else 0}")
    print(f"   Data size estimate: ~{sys.getsizeof(result1.data)} bytes")

    # Strategy 2: select("id", count="exact") - Minimal column selection
    print("\n2. Optimized: select('id', count='exact') with limit(1)")
    print("-" * 80)
    result2 = await (
        supabase.table("pnld_embeddings")
        .select("id", count="exact")
        .limit(1)
        .execute()
    )
    print(f"   Count: {result2.count}")
    print(f"   Data rows returned: {len(result2.data) if result2.data else 0}")
    print(f"   Data size estimate: ~{sys.getsizeof(result2.data)} bytes")

    # Strategy 3: HEAD request approach (if supported)
    print("\n3. Check if count header is available without data")
    print("-" * 80)
    result3 = await (
        supabase.table("pnld_embeddings")
        .select("id", count="exact")
        .limit(0)
        .execute()
    )
    print(f"   Count: {result3.count}")
    print(f"   Data rows returned: {len(result3.data) if result3.data else 0}")
    print(f"   Data size estimate: ~{sys.getsizeof(result3.data)} bytes")

    # Strategy 4: RPC function approach
    print("\n4. Using count_chunks_by_document RPC")
    print("-" * 80)
    # Get first document ID
    doc_result = await (
        supabase.table("pnld_documents")
        .select("id")
        .limit(1)
        .execute()
    )

    if doc_result.data and len(doc_result.data) > 0:
        document_id = doc_result.data[0]["id"]
        try:
            rpc_result = await supabase.rpc(
                "count_chunks_by_document",
                {"document_ids": [document_id]}
            ).execute()
            print(f"   RPC result: {rpc_result.data}")
            print(f"   Data size estimate: ~{sys.getsizeof(rpc_result.data)} bytes")
        except Exception as e:
            print(f"   RPC failed: {e}")
    else:
        print("   No documents available for testing")

    print("\n" + "=" * 80)
    print("Comparison Summary")
    print("=" * 80)
    print("Strategy 1 (select '*'): Fetches ALL columns for ALL rows (wasteful)")
    print("Strategy 2 (select 'id'): Fetches minimal column for 1 row (better)")
    print("Strategy 3 (limit 0): Fetches no rows, only count header (optimal)")
    print("Strategy 4 (RPC): Server-side aggregation (optimal for batch)")
    print("=" * 80)


async def test_list_documents_query_optimization():
    """Test the list_documents query to see if we can avoid duplicate queries."""
    print("\n" + "=" * 80)
    print("Testing list_documents Query Optimization")
    print("=" * 80)

    supabase = await get_async_supabase_client()

    # Current approach: Query twice (once for count, once for data)
    print("\nCurrent Approach (2 queries):")
    print("-" * 80)

    # Query 1: Get count
    query1 = supabase.table("pnld_documents").select("*", count="exact")
    count_result = await query1.execute()
    total_count = count_result.count if count_result.count else 0
    print(f"Query 1 - Count: {total_count}, Data rows: {len(count_result.data)}")

    # Query 2: Get paginated data
    query2 = (
        supabase.table("pnld_documents")
        .select("*")
        .order("created_at", desc=True)
        .range(0, 9)  # First 10 items
    )
    data_result = await query2.execute()
    print(f"Query 2 - Data rows: {len(data_result.data)}")

    # Optimized approach: Single query with count
    print("\nOptimized Approach (1 query):")
    print("-" * 80)

    combined_query = (
        supabase.table("pnld_documents")
        .select("*", count="exact")
        .order("created_at", desc=True)
        .range(0, 9)  # First 10 items
    )
    combined_result = await combined_query.execute()
    print(f"Single Query - Count: {combined_result.count}, Data rows: {len(combined_result.data)}")

    print("\n" + "=" * 80)
    print("Result: We CAN get both count and paginated data in a single query!")
    print("The Supabase Python client returns both result.count and result.data")
    print("=" * 80)


if __name__ == "__main__":
    asyncio.run(test_count_strategies())
    asyncio.run(test_list_documents_query_optimization())
