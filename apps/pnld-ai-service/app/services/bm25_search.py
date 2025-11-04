"""BM25 full-text search service using PostgreSQL."""

from typing import List, Optional, Dict, Any
from app.services.supabase import get_async_supabase_client
from app.utils.logging import get_logger

logger = get_logger(__name__)


async def search_bm25(
    query: str,
    edital_id: Optional[str] = None,
    limit: int = 20,
    min_score: float = 0.01,
) -> List[Dict[str, Any]]:
    """
    Perform BM25-style full-text search on document chunks.

    Uses PostgreSQL's full-text search with Portuguese language support
    and ts_rank_cd for document length normalization (similar to BM25).

    Args:
        query: The search query text
        edital_id: Optional edital ID to filter results
        limit: Maximum number of results to return
        min_score: Minimum BM25 score threshold

    Returns:
        List of matching document chunks with BM25 scores
    """
    client = await get_async_supabase_client()

    try:
        # Use the BM25 search function
        response = await client.rpc(
            "bm25_search",
            {
                "search_query": query,
                "edital_filter": edital_id,
                "result_limit": limit,
            },
        ).execute()

        # Filter by min_score in Python (since RPC doesn't support it in basic version)
        results = []
        if response.data:
            for item in response.data:
                bm25_score = item.get("bm25_score", 0.0)

                # Skip results below threshold
                if bm25_score < min_score:
                    continue

                results.append(
                    {
                        "id": item.get("id"),
                        "document_id": item.get("document_id"),
                        "content": item.get("content"),
                        "bm25_score": bm25_score,
                        "document_title": item.get("document_title"),
                        "edital_id": item.get("edital_id"),
                        "page_number": item.get("page_number"),
                        "chunk_index": item.get("chunk_index"),
                    }
                )

        result_count = len(results)
        logger.info(
            "BM25 search completed",
            extra={
                "query_preview": query[:50],
                "edital_id": edital_id,
                "min_score": min_score,
                "result_count": result_count,
            },
        )

        return results

    except Exception as e:
        logger.error(
            f"BM25 search failed: {str(e)}",
            extra={"edital_id": edital_id, "error_type": type(e).__name__},
        )
        # Return empty results on error rather than failing the whole request
        return []


async def search_bm25_advanced(
    query: str,
    edital_id: Optional[str] = None,
    limit: int = 20,
    min_score: float = 0.01,
) -> List[Dict[str, Any]]:
    """
    Perform advanced BM25 search with query syntax support and highlighting.

    Supports advanced query syntax:
    - "quoted phrases" for exact matches
    - word1 OR word2 for alternative matches
    - -word for negation

    Args:
        query: The search query with optional syntax
        edital_id: Optional edital ID to filter results
        limit: Maximum number of results to return
        min_score: Minimum BM25 score threshold

    Returns:
        List of matching document chunks with BM25 scores and highlighted snippets
    """
    client = await get_async_supabase_client()

    try:
        response = await client.rpc(
            "bm25_search_advanced",
            {
                "search_query": query,
                "edital_filter": edital_id,
                "result_limit": limit,
                "min_score": min_score,
            },
        ).execute()

        results = []
        if response.data:
            for item in response.data:
                results.append(
                    {
                        "id": item.get("id"),
                        "document_id": item.get("document_id"),
                        "content": item.get("content"),
                        "bm25_score": item.get("bm25_score", 0.0),
                        "document_title": item.get("document_title"),
                        "edital_id": item.get("edital_id"),
                        "page_number": item.get("page_number"),
                        "chunk_index": item.get("chunk_index"),
                        "headline": item.get("headline"),  # Highlighted snippet
                    }
                )

        result_count = len(results)
        logger.info(
            "Advanced BM25 search completed",
            extra={
                "query_preview": query[:50],
                "edital_id": edital_id,
                "min_score": min_score,
                "result_count": result_count,
            },
        )

        return results

    except Exception as e:
        logger.error(
            f"Advanced BM25 search failed: {str(e)}",
            extra={"edital_id": edital_id, "error_type": type(e).__name__},
        )
        return []
