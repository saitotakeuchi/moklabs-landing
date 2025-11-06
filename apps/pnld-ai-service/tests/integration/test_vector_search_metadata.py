#!/usr/bin/env python3
"""
Integration test for vector search with page metadata and standard documents.

This test verifies that:
1. The match_documents function returns page_number, chunk_index, and chunk_metadata
2. Standard documents (edital_id IS NULL) are included when an edital filter is provided
3. Edital-scoped documents are correctly filtered
4. The search_similar_documents function in vector_search.py correctly handles the metadata

Usage:
    python test_vector_search_metadata.py
"""

import asyncio
import uuid
from app.services.supabase import get_async_supabase_client
from app.services.vector_search import search_similar_documents
from app.services.embeddings import generate_embedding


async def setup_test_data():
    """Set up test documents and embeddings with metadata."""
    supabase = await get_async_supabase_client()

    # Create a test edital
    test_edital_id = f"test-edital-{uuid.uuid4().hex[:8]}"

    # Create edital-scoped document
    edital_doc_id = str(uuid.uuid4())
    await supabase.table('pnld_documents').insert({
        'id': edital_doc_id,
        'edital_id': test_edital_id,
        'title': 'Edital Specific Document',
        'content': 'This document is specific to the test edital.',
        'metadata': {'test': True}
    }).execute()

    # Create standard document (NULL edital_id)
    standard_doc_id = str(uuid.uuid4())
    await supabase.table('pnld_documents').insert({
        'id': standard_doc_id,
        'edital_id': None,  # Standard document
        'title': 'Standard Document',
        'content': 'This is a standard document available to all editais.',
        'metadata': {'test': True}
    }).execute()

    # Create embeddings with page metadata for edital-scoped document
    edital_embedding = await generate_embedding("edital specific information")
    await supabase.table('pnld_embeddings').insert({
        'document_id': edital_doc_id,
        'content': 'This document is specific to the test edital.',
        'embedding': edital_embedding,
        'page_number': 1,
        'chunk_index': 0,
        'metadata': {'section': 'introduction', 'relevance': 'high'}
    }).execute()

    # Create embeddings with page metadata for standard document
    standard_embedding = await generate_embedding("standard guidelines and requirements")
    await supabase.table('pnld_embeddings').insert({
        'document_id': standard_doc_id,
        'content': 'This is a standard document available to all editais.',
        'embedding': standard_embedding,
        'page_number': 5,
        'chunk_index': 2,
        'metadata': {'section': 'guidelines', 'type': 'regulatory'}
    }).execute()

    return test_edital_id, edital_doc_id, standard_doc_id


async def cleanup_test_data(test_edital_id: str, edital_doc_id: str, standard_doc_id: str):
    """Clean up test data."""
    supabase = await get_async_supabase_client()

    # Delete documents (cascades to embeddings)
    await supabase.table('pnld_documents').delete().eq('id', edital_doc_id).execute()
    await supabase.table('pnld_documents').delete().eq('id', standard_doc_id).execute()

    print(f"\n✓ Cleaned up test data")


async def test_page_metadata_in_results():
    """Test that page metadata is correctly returned in search results."""
    print("\n" + "=" * 80)
    print("TEST 1: Page Metadata in Search Results")
    print("=" * 80)

    # Search without edital filter
    results = await search_similar_documents(
        query="standard guidelines",
        edital_id=None,
        limit=5,
        similarity_threshold=0.0
    )

    print(f"\nRetrieved {len(results)} results")

    # Check that results have page metadata
    passed = True
    for i, result in enumerate(results):
        print(f"\nResult {i + 1}:")
        print(f"  Document: {result.get('document_title')}")
        print(f"  Page Number: {result.get('page_number')}")
        print(f"  Chunk Index: {result.get('chunk_index')}")
        print(f"  Metadata: {result.get('metadata')}")
        print(f"  Similarity: {result.get('similarity'):.4f}")

        # Verify metadata fields exist
        if result.get('page_number') is not None:
            print(f"  ✓ Has page_number")
        else:
            print(f"  ✗ Missing page_number")
            passed = False

        if result.get('chunk_index') is not None:
            print(f"  ✓ Has chunk_index")
        else:
            print(f"  ✗ Missing chunk_index")
            passed = False

        if result.get('metadata') is not None:
            print(f"  ✓ Has metadata")
        else:
            print(f"  ✗ Missing metadata")
            passed = False

    return passed


async def test_standard_documents_included():
    """Test that standard documents are included when edital filter is provided."""
    print("\n" + "=" * 80)
    print("TEST 2: Standard Documents Included with Edital Filter")
    print("=" * 80)

    test_edital_id, edital_doc_id, standard_doc_id = await setup_test_data()

    try:
        # Search with edital filter - should return both edital-scoped AND standard docs
        results = await search_similar_documents(
            query="edital guidelines requirements",
            edital_id=test_edital_id,
            limit=10,
            similarity_threshold=0.0
        )

        print(f"\nSearching with edital_id={test_edital_id}")
        print(f"Retrieved {len(results)} results")

        # Check for standard document in results
        has_standard = False
        has_edital_specific = False

        for result in results:
            edital_id = result.get('edital_id')
            doc_title = result.get('document_title')

            if edital_id is None:
                has_standard = True
                print(f"\n✓ Found standard document: {doc_title}")
                print(f"  Page: {result.get('page_number')}, Chunk: {result.get('chunk_index')}")

            if edital_id == test_edital_id:
                has_edital_specific = True
                print(f"\n✓ Found edital-specific document: {doc_title}")
                print(f"  Page: {result.get('page_number')}, Chunk: {result.get('chunk_index')}")

        passed = has_standard and has_edital_specific

        if not has_standard:
            print("\n✗ Standard document not included in results")
        if not has_edital_specific:
            print("\n✗ Edital-specific document not included in results")

        return passed

    finally:
        await cleanup_test_data(test_edital_id, edital_doc_id, standard_doc_id)


async def test_edital_filtering():
    """Test that edital filtering works correctly."""
    print("\n" + "=" * 80)
    print("TEST 3: Edital Filtering")
    print("=" * 80)

    test_edital_id, edital_doc_id, standard_doc_id = await setup_test_data()

    # Create another edital's document
    other_edital_id = f"other-edital-{uuid.uuid4().hex[:8]}"

    try:
        supabase = await get_async_supabase_client()

        other_doc_id = str(uuid.uuid4())
        await supabase.table('pnld_documents').insert({
            'id': other_doc_id,
            'edital_id': other_edital_id,
            'title': 'Other Edital Document',
            'content': 'This document is for a different edital.',
            'metadata': {'test': True}
        }).execute()

        other_embedding = await generate_embedding("other edital specific content")
        await supabase.table('pnld_embeddings').insert({
            'document_id': other_doc_id,
            'content': 'This document is for a different edital.',
            'embedding': other_embedding,
            'page_number': 3,
            'chunk_index': 1,
            'metadata': {'section': 'requirements'}
        }).execute()

        # Search with test_edital_id filter
        results = await search_similar_documents(
            query="edital content",
            edital_id=test_edital_id,
            limit=10,
            similarity_threshold=0.0
        )

        print(f"\nSearching with edital_id={test_edital_id}")
        print(f"Retrieved {len(results)} results")

        # Check that other edital's document is NOT included
        has_other_edital = False
        has_test_edital = False
        has_standard = False

        for result in results:
            edital_id = result.get('edital_id')
            doc_title = result.get('document_title')

            if edital_id == other_edital_id:
                has_other_edital = True
                print(f"\n✗ Found other edital's document (should not be included): {doc_title}")

            if edital_id == test_edital_id:
                has_test_edital = True
                print(f"\n✓ Found test edital document: {doc_title}")

            if edital_id is None:
                has_standard = True
                print(f"\n✓ Found standard document: {doc_title}")

        passed = has_test_edital and has_standard and not has_other_edital

        if not has_test_edital:
            print("\n✗ Test edital document not found")
        if not has_standard:
            print("\n✗ Standard document not found")
        if has_other_edital:
            print("\n✗ Other edital's document incorrectly included")

        # Clean up other edital document
        await supabase.table('pnld_documents').delete().eq('id', other_doc_id).execute()

        return passed

    finally:
        await cleanup_test_data(test_edital_id, edital_doc_id, standard_doc_id)


async def main():
    """Run all tests."""
    print("\n" + "=" * 80)
    print("VECTOR SEARCH METADATA AND STANDARD DOCUMENTS INTEGRATION TEST")
    print("=" * 80)

    results = []

    try:
        # Test 1: Page metadata
        test1_passed = await test_page_metadata_in_results()
        results.append(("Page Metadata in Results", test1_passed))

        # Test 2: Standard documents included
        test2_passed = await test_standard_documents_included()
        results.append(("Standard Documents Included", test2_passed))

        # Test 3: Edital filtering
        test3_passed = await test_edital_filtering()
        results.append(("Edital Filtering", test3_passed))

    except Exception as e:
        print(f"\n✗ Test suite failed with error: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

    # Print summary
    print("\n" + "=" * 80)
    print("TEST SUMMARY")
    print("=" * 80)

    all_passed = True
    for test_name, passed in results:
        status = "✓ PASSED" if passed else "✗ FAILED"
        print(f"{status}: {test_name}")
        if not passed:
            all_passed = False

    print("=" * 80)

    if all_passed:
        print("\n✓ All tests passed!")
        return True
    else:
        print("\n✗ Some tests failed")
        return False


if __name__ == "__main__":
    success = asyncio.run(main())
    exit(0 if success else 1)
