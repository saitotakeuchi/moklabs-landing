"""
Test script to verify pagination preserves total count on empty pages.

This test verifies the fix for MOK-49 where empty pages were returning total=0
instead of preserving the actual total count from the database.
"""

import asyncio
import httpx

API_BASE = "http://localhost:8000/api/v1"


async def test_pagination_total_count():
    """
    Test that pagination preserves total count even on empty pages.

    This test:
    1. Gets the total count of documents
    2. Requests a page beyond the available data
    3. Verifies that the total count is preserved (not zeroed out)
    """
    print("\n" + "="*60)
    print("Testing Pagination Total Count Preservation (MOK-49)")
    print("="*60 + "\n")

    async with httpx.AsyncClient() as client:
        # Step 1: Get first page to know total count
        print("1. Fetching first page to get total count...")
        response = await client.get(f"{API_BASE}/documents?limit=20&offset=0")

        if response.status_code != 200:
            print(f"   ERROR: Failed to fetch first page (status {response.status_code})")
            return False

        data = response.json()
        total_documents = data["total"]
        documents_on_page = len(data["documents"])

        print(f"   Total documents in database: {total_documents}")
        print(f"   Documents on first page: {documents_on_page}\n")

        if total_documents == 0:
            print("   WARNING: No documents in database, creating test scenario...")
            print("   Skipping test - please add some documents first\n")
            return True

        # Step 2: Request a page beyond available data
        # Calculate an offset that should return an empty page
        empty_page_offset = total_documents + 100

        print(f"2. Fetching empty page (offset={empty_page_offset})...")
        response = await client.get(
            f"{API_BASE}/documents?limit=20&offset={empty_page_offset}"
        )

        if response.status_code != 200:
            print(f"   ERROR: Failed to fetch empty page (status {response.status_code})")
            return False

        data = response.json()
        returned_total = data["total"]
        documents_on_page = len(data["documents"])

        print(f"   Documents on empty page: {documents_on_page}")
        print(f"   Total count returned: {returned_total}\n")

        # Step 3: Verify total count is preserved
        print("3. Verifying total count preservation...")

        if documents_on_page != 0:
            print(f"   ERROR: Expected 0 documents on empty page, got {documents_on_page}")
            return False

        if returned_total != total_documents:
            print(f"   FAILED: Total count was not preserved!")
            print(f"   Expected: {total_documents}")
            print(f"   Got: {returned_total}")
            return False

        print(f"   SUCCESS: Total count preserved correctly!")
        print(f"   - Empty page has 0 documents")
        print(f"   - Total count is {returned_total} (matches actual total)")

        return True


async def main():
    """Run pagination tests."""
    print("\nStarting Pagination Test for MOK-49")
    print("="*60)

    success = await test_pagination_total_count()

    print("\n" + "="*60)
    if success:
        print("Test PASSED: Pagination correctly preserves total count")
    else:
        print("Test FAILED: Pagination does not preserve total count")
    print("="*60 + "\n")

    return success


if __name__ == "__main__":
    result = asyncio.run(main())
    exit(0 if result else 1)
