"""Vector similarity search using pgvector."""

from typing import List, Optional, Dict, Any
from app.services.supabase import get_async_supabase_client
from app.services.embeddings import generate_embedding


async def search_similar_documents(
    query: str,
    edital_id: Optional[str] = None,
    limit: int = 5,
    similarity_threshold: float = 0.7,
) -> List[Dict[str, Any]]:
    """
    Search for documents similar to the query using vector similarity.

    Args:
        query: The search query text
        edital_id: Optional edital ID to filter results
        limit: Maximum number of results to return
        similarity_threshold: Minimum similarity score (0-1)

    Returns:
        List of similar document chunks with metadata including page numbers
    """
    # Generate embedding for the query
    query_embedding = await generate_embedding(query)

    # Get async Supabase client
    client = await get_async_supabase_client()

    # Perform vector similarity search using the match_documents RPC function
    try:
        response = await client.rpc(
            "match_documents",
            {
                "query_embedding": query_embedding,
                "match_threshold": similarity_threshold,
                "match_count": limit,
                "edital_filter": edital_id,
            },
        ).execute()

        # Log search results for debugging
        print(f"Vector search: query='{query[:50]}...', edital_id={edital_id}, threshold={similarity_threshold}")
        print(f"Vector search returned: {len(response.data) if response.data else 0} results")

    except Exception as e:
        print(f"Vector search error: {str(e)}")
        raise

    # Transform results to include all metadata
    results = []
    if response.data:
        for item in response.data:
            results.append(
                {
                    "id": item.get("id"),
                    "document_id": item.get("document_id"),
                    "content": item.get("content"),
                    "similarity": item.get("similarity"),
                    "document_title": item.get("document_title"),
                    "edital_id": item.get("edital_id"),
                    "page_number": item.get("page_number"),
                    "chunk_index": item.get("chunk_index"),
                    "metadata": item.get("chunk_metadata", {}),
                }
            )

    return results


async def index_document_embeddings(
    document_id: str,
    content_chunks: List[str],
) -> int:
    """
    Generate and store embeddings for document chunks.

    Args:
        document_id: The document ID to associate embeddings with
        content_chunks: List of text chunks to embed

    Returns:
        Number of embeddings created
    """
    from app.services.embeddings import generate_embeddings_batch

    # Generate embeddings for all chunks
    embeddings = await generate_embeddings_batch(content_chunks)

    # Get async Supabase client
    client = await get_async_supabase_client()

    # Prepare embedding records
    embedding_records = [
        {
            "document_id": document_id,
            "content": chunk,
            "embedding": embedding,
        }
        for chunk, embedding in zip(content_chunks, embeddings)
    ]

    # Insert embeddings into Supabase
    # TODO: Uncomment when database is set up
    # response = await client.table("pnld_embeddings").insert(embedding_records).execute()

    return len(embedding_records)
