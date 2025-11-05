"""Hybrid search combining vector similarity and BM25 full-text search."""

import asyncio
from typing import List, Dict, Any, Optional
from app.services.vector_search import search_similar_documents
from app.services.bm25_search import search_bm25
from app.utils.logging import get_logger

logger = get_logger(__name__)


class HybridSearcher:
    """
    Hybrid search engine combining dense vector embeddings with sparse BM25 scoring.

    Uses Reciprocal Rank Fusion (RRF) to merge results from both search methods,
    leveraging the complementary strengths of semantic and lexical matching.
    """

    def __init__(
        self,
        vector_weight: float = 0.6,
        bm25_weight: float = 0.4,
        rrf_k: int = 60,
    ):
        """
        Initialize hybrid searcher with fusion weights.

        Args:
            vector_weight: Weight for vector search results (0-1)
            bm25_weight: Weight for BM25 search results (0-1)
            rrf_k: RRF constant (typically 60, higher = more conservative)
        """
        self.vector_weight = vector_weight
        self.bm25_weight = bm25_weight
        self.rrf_k = rrf_k

        logger.info(
            "HybridSearcher initialized",
            extra={
                "vector_weight": vector_weight,
                "bm25_weight": bm25_weight,
                "rrf_k": rrf_k,
            },
        )

    async def search(
        self,
        vector_query: str,
        bm25_query: str,
        edital_id: Optional[str] = None,
        limit: int = 10,
        vector_threshold: float = 0.3,
        bm25_min_score: float = 0.01,
    ) -> List[Dict[str, Any]]:
        """
        Perform hybrid search combining vector and BM25 results.

        Args:
            vector_query: Query for vector similarity search (usually original query)
            bm25_query: Query for BM25 search (usually expanded query)
            edital_id: Optional edital ID to scope search
            limit: Maximum number of results to return
            vector_threshold: Minimum similarity threshold for vector search
            bm25_min_score: Minimum score threshold for BM25 search

        Returns:
            List of documents ranked by RRF fusion score
        """
        # Fetch more results than needed for better fusion
        fetch_limit = limit * 2

        # Execute both searches in parallel
        vector_task = search_similar_documents(
            query=vector_query,
            edital_id=edital_id,
            limit=fetch_limit,
            similarity_threshold=vector_threshold,
        )

        bm25_task = search_bm25(
            query=bm25_query,
            edital_id=edital_id,
            limit=fetch_limit,
            min_score=bm25_min_score,
        )

        logger.debug(
            "Executing parallel searches",
            extra={
                "vector_query": vector_query[:50],
                "bm25_query": bm25_query[:50],
                "fetch_limit": fetch_limit,
            },
        )

        try:
            vector_results, bm25_results = await asyncio.gather(vector_task, bm25_task)
        except Exception as e:
            logger.error(
                f"Hybrid search parallel execution failed: {str(e)}",
                extra={"error_type": type(e).__name__},
            )
            # Fallback to vector-only search
            vector_results = await vector_task
            bm25_results = []

        # Apply Reciprocal Rank Fusion
        fused_results = self._reciprocal_rank_fusion(
            vector_results,
            bm25_results,
        )

        # Log fusion statistics
        logger.info(
            "Hybrid search completed",
            extra={
                "vector_count": len(vector_results),
                "bm25_count": len(bm25_results),
                "fused_count": len(fused_results),
                "returned_count": min(limit, len(fused_results)),
            },
        )

        # Return top results
        return fused_results[:limit]

    def _reciprocal_rank_fusion(
        self,
        vector_results: List[Dict[str, Any]],
        bm25_results: List[Dict[str, Any]],
    ) -> List[Dict[str, Any]]:
        """
        Merge search results using Reciprocal Rank Fusion (RRF).

        RRF Formula: score(d) = Σ [weight / (k + rank)]
        where:
        - d is a document
        - rank is the position in each result list (1-indexed)
        - k is a constant (typically 60)
        - weight is the importance of each ranking method

        Args:
            vector_results: Results from vector similarity search
            bm25_results: Results from BM25 full-text search

        Returns:
            Merged and sorted list of documents with RRF scores
        """
        rrf_scores = {}
        doc_data = {}  # Store full document data

        # Score vector search results
        for rank, doc in enumerate(vector_results, 1):
            doc_id = doc.get("id")
            if not doc_id:
                continue

            score = self.vector_weight / (self.rrf_k + rank)
            rrf_scores[doc_id] = rrf_scores.get(doc_id, 0.0) + score

            # Store document data (prefer first occurrence)
            if doc_id not in doc_data:
                doc_data[doc_id] = {**doc, "source_methods": []}

            doc_data[doc_id]["source_methods"].append(
                {"method": "vector", "rank": rank, "score": doc.get("similarity", 0.0)}
            )

        # Score BM25 search results
        for rank, doc in enumerate(bm25_results, 1):
            doc_id = doc.get("id")
            if not doc_id:
                continue

            score = self.bm25_weight / (self.rrf_k + rank)
            rrf_scores[doc_id] = rrf_scores.get(doc_id, 0.0) + score

            # Store or update document data
            if doc_id not in doc_data:
                doc_data[doc_id] = {**doc, "source_methods": []}

            doc_data[doc_id]["source_methods"].append(
                {"method": "bm25", "rank": rank, "score": doc.get("bm25_score", 0.0)}
            )

        # Sort by RRF score and build result list
        sorted_doc_ids = sorted(rrf_scores.items(), key=lambda x: x[1], reverse=True)

        fused_results = []
        for doc_id, rrf_score in sorted_doc_ids:
            doc = doc_data[doc_id]
            doc["rrf_score"] = rrf_score
            doc["hybrid_rank"] = len(fused_results) + 1
            fused_results.append(doc)

        logger.debug(
            "RRF fusion completed",
            extra={
                "unique_documents": len(fused_results),
                "vector_only": sum(
                    1
                    for d in fused_results
                    if len([m for m in d.get("source_methods", []) if m["method"] == "vector"]) > 0
                    and len([m for m in d.get("source_methods", []) if m["method"] == "bm25"]) == 0
                ),
                "bm25_only": sum(
                    1
                    for d in fused_results
                    if len([m for m in d.get("source_methods", []) if m["method"] == "bm25"]) > 0
                    and len([m for m in d.get("source_methods", []) if m["method"] == "vector"])
                    == 0
                ),
                "both_methods": sum(
                    1
                    for d in fused_results
                    if len([m for m in d.get("source_methods", []) if m["method"] == "vector"]) > 0
                    and len([m for m in d.get("source_methods", []) if m["method"] == "bm25"]) > 0
                ),
            },
        )

        return fused_results


# Global singleton instance
_hybrid_searcher: Optional[HybridSearcher] = None


def get_hybrid_searcher(
    vector_weight: float = 0.6,
    bm25_weight: float = 0.4,
    rrf_k: int = 60,
) -> HybridSearcher:
    """
    Get or create the HybridSearcher singleton.

    Args:
        vector_weight: Weight for vector search (default 0.6)
        bm25_weight: Weight for BM25 search (default 0.4)
        rrf_k: RRF constant (default 60)

    Returns:
        HybridSearcher instance
    """
    global _hybrid_searcher

    if _hybrid_searcher is None:
        _hybrid_searcher = HybridSearcher(
            vector_weight=vector_weight,
            bm25_weight=bm25_weight,
            rrf_k=rrf_k,
        )

    return _hybrid_searcher
