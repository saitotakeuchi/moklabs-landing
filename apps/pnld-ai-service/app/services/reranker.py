"""Cross-encoder reranking service for improved relevance scoring."""

import asyncio
from typing import List, Dict, Any, Optional, Tuple
from app.utils.logging import get_logger

logger = get_logger(__name__)


class Reranker:
    """
    Cross-encoder reranker for improving result precision.

    Uses a multilingual cross-encoder model to rerank top results from
    retrieval, providing more accurate relevance scores than bi-encoders.
    Supports Portuguese text natively.
    """

    def __init__(
        self,
        model_name: str = "unicamp-dl/mMiniLM-L6-v2-mmarco-v1",
        max_length: int = 512,
        batch_size: int = 16,
    ):
        """
        Initialize reranker with cross-encoder model.

        Args:
            model_name: HuggingFace model name (multilingual by default)
            max_length: Maximum sequence length for cross-encoder
            batch_size: Batch size for scoring
        """
        self.model_name = model_name
        self.max_length = max_length
        self.batch_size = batch_size
        self.model = None
        self.device = None

        logger.info(
            "Reranker initialized (lazy loading)",
            extra={
                "model_name": model_name,
                "max_length": max_length,
                "batch_size": batch_size,
            },
        )

    def _load_model(self):
        """Lazy load the cross-encoder model."""
        if self.model is not None:
            return

        try:
            from sentence_transformers import CrossEncoder
            import torch

            self.device = "cuda" if torch.cuda.is_available() else "cpu"

            logger.info(
                f"Loading cross-encoder model on {self.device}",
                extra={"model_name": self.model_name},
            )

            self.model = CrossEncoder(
                self.model_name,
                max_length=self.max_length,
                device=self.device,
            )

            logger.info("Cross-encoder model loaded successfully")

        except ImportError as e:
            logger.error(
                f"Failed to import required libraries: {str(e)}",
                extra={"error_type": type(e).__name__},
            )
            raise ImportError(
                "sentence-transformers and torch are required for reranking. "
                "Install with: pip install sentence-transformers torch"
            )
        except Exception as e:
            logger.error(
                f"Failed to load cross-encoder model: {str(e)}",
                extra={"model_name": self.model_name, "error_type": type(e).__name__},
            )
            raise

    async def rerank(
        self,
        query: str,
        documents: List[Dict[str, Any]],
        top_k: int = 10,
        content_key: str = "content",
        truncate_content: int = 500,
        original_score_weight: float = 0.3,
        rerank_score_weight: float = 0.7,
    ) -> List[Dict[str, Any]]:
        """
        Rerank documents using cross-encoder scoring.

        Args:
            query: User's search query
            documents: List of retrieved documents to rerank
            top_k: Number of top documents to return after reranking
            content_key: Key to access document content
            truncate_content: Truncate content to this many characters (efficiency)
            original_score_weight: Weight for original retrieval score
            rerank_score_weight: Weight for reranker score

        Returns:
            Reranked list of documents with added 'rerank_score' and 'final_score'
        """
        if not documents:
            logger.debug("No documents to rerank")
            return []

        if not query or not query.strip():
            logger.warning("Empty query provided to reranker, returning original order")
            return documents[:top_k]

        try:
            # Lazy load model on first use
            self._load_model()

            # Prepare query-document pairs
            pairs = self._prepare_pairs(query, documents, content_key, truncate_content)

            # Compute scores in thread pool (blocking operation)
            loop = asyncio.get_event_loop()
            scores = await loop.run_in_executor(None, self._compute_scores, pairs)

            # Combine scores with documents
            reranked_docs = self._combine_scores(
                documents=documents,
                scores=scores,
                original_score_weight=original_score_weight,
                rerank_score_weight=rerank_score_weight,
            )

            # Sort by final score and return top_k
            reranked_docs.sort(key=lambda x: x["final_score"], reverse=True)
            result = reranked_docs[:top_k]

            logger.info(
                "Reranking completed",
                extra={
                    "query_preview": query[:50],
                    "input_count": len(documents),
                    "output_count": len(result),
                    "top_rerank_score": result[0]["rerank_score"] if result else None,
                },
            )

            return result

        except Exception as e:
            logger.error(
                f"Reranking failed: {str(e)}",
                extra={"error_type": type(e).__name__, "document_count": len(documents)},
            )
            # Fallback: return original order
            logger.warning("Falling back to original document order")
            return documents[:top_k]

    def _prepare_pairs(
        self,
        query: str,
        documents: List[Dict[str, Any]],
        content_key: str,
        truncate_content: int,
    ) -> List[Tuple[str, str]]:
        """
        Prepare query-document pairs for cross-encoder.

        Args:
            query: Search query
            documents: List of documents
            content_key: Key to access document content
            truncate_content: Character limit for content

        Returns:
            List of (query, document_content) tuples
        """
        pairs = []
        for doc in documents:
            content = doc.get(content_key, "")
            if isinstance(content, str):
                # Truncate for efficiency
                content = content[:truncate_content]
            else:
                logger.warning(
                    f"Document content is not a string: {type(content)}",
                    extra={"document_id": doc.get("id")},
                )
                content = str(content)[:truncate_content]

            pairs.append((query, content))

        return pairs

    def _compute_scores(self, pairs: List[Tuple[str, str]]) -> List[float]:
        """
        Compute cross-encoder scores for query-document pairs.

        This is a blocking operation that should be run in a thread pool.

        Args:
            pairs: List of (query, document) tuples

        Returns:
            List of relevance scores
        """
        try:
            import torch

            with torch.no_grad():
                scores = self.model.predict(
                    pairs,
                    batch_size=self.batch_size,
                    show_progress_bar=False,
                )

            # Convert to list of floats
            return [float(score) for score in scores]

        except Exception as e:
            logger.error(
                f"Score computation failed: {str(e)}",
                extra={"error_type": type(e).__name__, "pair_count": len(pairs)},
            )
            raise

    def _combine_scores(
        self,
        documents: List[Dict[str, Any]],
        scores: List[float],
        original_score_weight: float,
        rerank_score_weight: float,
    ) -> List[Dict[str, Any]]:
        """
        Combine original retrieval scores with reranker scores.

        Args:
            documents: Original documents
            scores: Reranker scores
            original_score_weight: Weight for original score
            rerank_score_weight: Weight for reranker score

        Returns:
            Documents with added rerank_score and final_score
        """
        reranked_docs = []

        for doc, rerank_score in zip(documents, scores):
            # Create a copy to avoid mutating original
            doc_copy = doc.copy()
            doc_copy["rerank_score"] = rerank_score

            # Get original score (try different possible keys)
            original_score = (
                doc.get("similarity") or doc.get("bm25_score") or doc.get("rrf_score") or 0.0
            )

            # Normalize original score to 0-1 range if needed
            # (similarity scores are already 0-1, others may not be)
            if "bm25_score" in doc:
                # BM25 scores can be > 1, normalize roughly
                original_score = min(original_score, 1.0)

            # Compute weighted combination
            doc_copy["final_score"] = (
                original_score_weight * original_score + rerank_score_weight * rerank_score
            )

            # Track which score was used
            doc_copy["reranking_metadata"] = {
                "original_score": original_score,
                "original_score_type": self._get_score_type(doc),
                "rerank_score": rerank_score,
                "final_score": doc_copy["final_score"],
                "weights": {
                    "original": original_score_weight,
                    "rerank": rerank_score_weight,
                },
            }

            reranked_docs.append(doc_copy)

        return reranked_docs

    def _get_score_type(self, doc: Dict[str, Any]) -> str:
        """Determine which type of score the document has."""
        if "rrf_score" in doc:
            return "rrf"
        elif "similarity" in doc:
            return "vector"
        elif "bm25_score" in doc:
            return "bm25"
        else:
            return "unknown"


# Global singleton instance
_reranker: Optional[Reranker] = None


def get_reranker(
    model_name: str = "unicamp-dl/mMiniLM-L6-v2-mmarco-v1",
    max_length: int = 512,
    batch_size: int = 16,
) -> Reranker:
    """
    Get or create the Reranker singleton.

    Args:
        model_name: Cross-encoder model name
        max_length: Maximum sequence length
        batch_size: Batch size for scoring

    Returns:
        Reranker instance
    """
    global _reranker

    if _reranker is None:
        _reranker = Reranker(
            model_name=model_name,
            max_length=max_length,
            batch_size=batch_size,
        )

    return _reranker
