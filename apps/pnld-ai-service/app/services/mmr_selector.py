"""Maximal Marginal Relevance (MMR) for diverse context selection."""

import numpy as np
from typing import List, Dict, Any, Optional
from sklearn.metrics.pairwise import cosine_similarity
from app.utils.logging import get_logger

logger = get_logger(__name__)


class MMRSelector:
    """
    Maximal Marginal Relevance selector for creating diverse, non-redundant context.

    MMR balances relevance to the query with diversity from already-selected documents,
    ensuring the context contains complementary rather than redundant information.
    """

    def __init__(self, lambda_param: float = 0.7):
        """
        Initialize MMR selector.

        Args:
            lambda_param: Trade-off between relevance and diversity
                - 1.0 = pure relevance (no diversity consideration)
                - 0.0 = pure diversity (no relevance consideration)
                - 0.7 = balanced (recommended)
        """
        if not 0 <= lambda_param <= 1:
            raise ValueError(f"lambda_param must be between 0 and 1, got {lambda_param}")

        self.lambda_param = lambda_param

        logger.info("MMRSelector initialized", extra={"lambda_param": lambda_param})

    async def select_diverse(
        self,
        query_embedding: np.ndarray,
        documents: List[Dict[str, Any]],
        max_documents: int = 10,
        max_tokens: Optional[int] = 3000,
        embedding_key: str = "embedding",
        content_key: str = "content",
    ) -> List[Dict[str, Any]]:
        """
        Select diverse documents using Maximal Marginal Relevance.

        Args:
            query_embedding: Query embedding vector
            documents: List of document dictionaries with embeddings
            max_documents: Maximum number of documents to select
            max_tokens: Maximum total tokens (optional, estimated by word count)
            embedding_key: Key to access document embedding
            content_key: Key to access document content for token counting

        Returns:
            List of selected documents with MMR scores added
        """
        if not documents:
            logger.debug("No documents to select from")
            return []

        if len(documents) == 1:
            logger.debug("Only one document, returning as-is")
            return documents[:1]

        try:
            # Extract embeddings from documents
            doc_embeddings = []
            valid_docs = []

            for doc in documents:
                embedding = doc.get(embedding_key)
                if embedding is not None:
                    doc_embeddings.append(np.array(embedding))
                    valid_docs.append(doc)
                else:
                    logger.warning(
                        f"Document missing embedding", extra={"document_id": doc.get("id")}
                    )

            if not valid_docs:
                logger.warning("No documents with valid embeddings")
                return []

            # Convert to numpy array
            doc_embeddings = np.array(doc_embeddings)
            query_embedding = np.array(query_embedding).reshape(1, -1)

            # Calculate relevance scores (similarity to query)
            relevance_scores = cosine_similarity(query_embedding, doc_embeddings)[0]

            # Select documents using MMR
            selected = self._mmr_selection(
                relevance_scores=relevance_scores,
                doc_embeddings=doc_embeddings,
                documents=valid_docs,
                max_documents=max_documents,
                max_tokens=max_tokens,
                content_key=content_key,
            )

            logger.info(
                "MMR selection completed",
                extra={
                    "input_count": len(valid_docs),
                    "selected_count": len(selected),
                    "lambda": self.lambda_param,
                },
            )

            return selected

        except Exception as e:
            logger.error(
                f"MMR selection failed: {str(e)}",
                extra={"error_type": type(e).__name__, "document_count": len(documents)},
            )
            # Fallback: return original documents up to max_documents
            logger.warning("Falling back to original document order")
            return documents[:max_documents]

    def _mmr_selection(
        self,
        relevance_scores: np.ndarray,
        doc_embeddings: np.ndarray,
        documents: List[Dict[str, Any]],
        max_documents: int,
        max_tokens: Optional[int],
        content_key: str,
    ) -> List[Dict[str, Any]]:
        """
        Perform iterative MMR selection.

        Args:
            relevance_scores: Pre-computed relevance scores
            doc_embeddings: Document embedding matrix
            documents: List of documents
            max_documents: Maximum documents to select
            max_tokens: Maximum tokens (optional)
            content_key: Key for content field

        Returns:
            Selected documents with MMR metadata
        """
        selected = []
        selected_indices = []
        remaining_indices = list(range(len(documents)))
        current_tokens = 0

        while remaining_indices and len(selected) < max_documents:
            mmr_scores = []

            for idx in remaining_indices:
                # Relevance to query
                relevance = relevance_scores[idx]

                # Diversity from selected chunks
                if selected_indices:
                    selected_embeddings = doc_embeddings[selected_indices]
                    similarities = cosine_similarity(
                        doc_embeddings[idx : idx + 1], selected_embeddings
                    )[0]
                    max_similarity = np.max(similarities)
                    diversity = 1 - max_similarity
                else:
                    diversity = 1.0

                # MMR score = λ * relevance + (1 - λ) * diversity
                mmr = self.lambda_param * relevance + (1 - self.lambda_param) * diversity
                mmr_scores.append(mmr)

            # Select document with highest MMR score
            best_local_idx = int(np.argmax(mmr_scores))
            best_idx = remaining_indices[best_local_idx]
            best_mmr_score = mmr_scores[best_local_idx]
            best_doc = documents[best_idx].copy()

            # Check token limit if specified
            if max_tokens is not None:
                content = best_doc.get(content_key, "")
                doc_tokens = len(content.split())
                if current_tokens + doc_tokens > max_tokens:
                    logger.debug(
                        "Token limit reached",
                        extra={
                            "current_tokens": current_tokens,
                            "max_tokens": max_tokens,
                            "selected_count": len(selected),
                        },
                    )
                    break
                current_tokens += doc_tokens

            # Add MMR metadata
            best_doc["mmr_score"] = float(best_mmr_score)
            best_doc["mmr_relevance"] = float(relevance_scores[best_idx])
            best_doc["mmr_rank"] = len(selected) + 1

            selected.append(best_doc)
            selected_indices.append(best_idx)
            remaining_indices.remove(best_idx)

        return selected

    def calculate_diversity_metrics(
        self,
        documents: List[Dict[str, Any]],
        embedding_key: str = "embedding",
    ) -> Dict[str, float]:
        """
        Calculate diversity metrics for selected documents.

        Args:
            documents: List of documents with embeddings
            embedding_key: Key to access document embedding

        Returns:
            Dictionary with diversity metrics:
                - avg_similarity: Average pairwise similarity
                - max_similarity: Maximum pairwise similarity
                - min_similarity: Minimum pairwise similarity
                - redundancy_score: Number of highly similar pairs (>0.8)
                - diversity_score: 1 - avg_similarity
        """
        if len(documents) < 2:
            return {
                "avg_similarity": 0.0,
                "max_similarity": 0.0,
                "min_similarity": 0.0,
                "redundancy_score": 0.0,
                "diversity_score": 1.0,
                "num_documents": len(documents),
            }

        try:
            # Extract embeddings
            embeddings = []
            for doc in documents:
                emb = doc.get(embedding_key)
                if emb is not None:
                    embeddings.append(np.array(emb))

            if len(embeddings) < 2:
                return {
                    "avg_similarity": 0.0,
                    "max_similarity": 0.0,
                    "min_similarity": 0.0,
                    "redundancy_score": 0.0,
                    "diversity_score": 1.0,
                    "num_documents": len(embeddings),
                }

            embeddings = np.array(embeddings)

            # Calculate similarity matrix
            similarity_matrix = cosine_similarity(embeddings)

            # Exclude diagonal (self-similarity)
            np.fill_diagonal(similarity_matrix, 0)

            # Get upper triangle (avoid double counting)
            upper_triangle = similarity_matrix[np.triu_indices_from(similarity_matrix, k=1)]

            avg_sim = float(np.mean(upper_triangle))
            max_sim = float(np.max(upper_triangle))
            min_sim = float(np.min(upper_triangle))

            # Count redundant pairs (similarity > 0.8)
            redundant_pairs = int(np.sum(upper_triangle > 0.8))

            return {
                "avg_similarity": avg_sim,
                "max_similarity": max_sim,
                "min_similarity": min_sim,
                "redundancy_score": redundant_pairs,
                "diversity_score": 1 - avg_sim,
                "num_documents": len(embeddings),
            }

        except Exception as e:
            logger.error(
                f"Diversity metrics calculation failed: {str(e)}",
                extra={"error_type": type(e).__name__},
            )
            return {
                "avg_similarity": 0.0,
                "max_similarity": 0.0,
                "min_similarity": 0.0,
                "redundancy_score": 0.0,
                "diversity_score": 0.0,
                "num_documents": 0,
                "error": str(e),
            }


# Global singleton instance
_mmr_selector: Optional[MMRSelector] = None


def get_mmr_selector(lambda_param: float = 0.7) -> MMRSelector:
    """
    Get or create the MMRSelector singleton.

    Args:
        lambda_param: Trade-off between relevance and diversity

    Returns:
        MMRSelector instance
    """
    global _mmr_selector

    if _mmr_selector is None:
        _mmr_selector = MMRSelector(lambda_param=lambda_param)

    return _mmr_selector
