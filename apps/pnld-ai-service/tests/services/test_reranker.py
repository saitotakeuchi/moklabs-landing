"""Unit tests for cross-encoder reranker."""

import pytest
from unittest.mock import Mock, patch, MagicMock
from app.services.reranker import Reranker, get_reranker


class TestRerankerInitialization:
    """Test Reranker initialization."""

    def test_default_initialization(self):
        """Test reranker initializes with default parameters."""
        reranker = Reranker()

        assert reranker.model_name == "unicamp-dl/mMiniLM-L6-v2-mmarco-v1"
        assert reranker.max_length == 512
        assert reranker.batch_size == 16
        assert reranker.model is None  # Lazy loading

    def test_custom_initialization(self):
        """Test reranker initializes with custom parameters."""
        reranker = Reranker(model_name="custom-model", max_length=256, batch_size=8)

        assert reranker.model_name == "custom-model"
        assert reranker.max_length == 256
        assert reranker.batch_size == 8


class TestPairPreparation:
    """Test query-document pair preparation."""

    def test_prepare_pairs_basic(self):
        """Test basic pair preparation."""
        reranker = Reranker()
        query = "test query"
        documents = [
            {"content": "document 1", "id": "doc1"},
            {"content": "document 2", "id": "doc2"},
        ]

        pairs = reranker._prepare_pairs(query, documents, "content", 500)

        assert len(pairs) == 2
        assert pairs[0] == (query, "document 1")
        assert pairs[1] == (query, "document 2")

    def test_prepare_pairs_truncation(self):
        """Test content truncation in pair preparation."""
        reranker = Reranker()
        query = "test"
        long_content = "a" * 1000
        documents = [{"content": long_content}]

        pairs = reranker._prepare_pairs(query, documents, "content", 100)

        assert len(pairs[0][1]) == 100
        assert pairs[0][1] == "a" * 100

    def test_prepare_pairs_non_string_content(self):
        """Test handling of non-string content."""
        reranker = Reranker()
        query = "test"
        documents = [{"content": 12345}]  # Number instead of string

        pairs = reranker._prepare_pairs(query, documents, "content", 500)

        assert len(pairs) == 1
        assert isinstance(pairs[0][1], str)
        assert pairs[0][1] == "12345"

    def test_prepare_pairs_missing_content(self):
        """Test handling of missing content key."""
        reranker = Reranker()
        query = "test"
        documents = [{"id": "doc1"}]  # No content key

        pairs = reranker._prepare_pairs(query, documents, "content", 500)

        assert len(pairs) == 1
        assert pairs[0][1] == ""


class TestScoreCombination:
    """Test score combination logic."""

    def test_combine_scores_with_similarity(self):
        """Test combining reranker scores with similarity scores."""
        reranker = Reranker()
        documents = [
            {"id": "doc1", "content": "test1", "similarity": 0.8},
            {"id": "doc2", "content": "test2", "similarity": 0.6},
        ]
        rerank_scores = [0.9, 0.7]

        result = reranker._combine_scores(
            documents=documents,
            scores=rerank_scores,
            original_score_weight=0.3,
            rerank_score_weight=0.7,
        )

        assert len(result) == 2
        assert "rerank_score" in result[0]
        assert "final_score" in result[0]
        assert "reranking_metadata" in result[0]

        # Check calculation: 0.3 * 0.8 + 0.7 * 0.9 = 0.87
        expected_score_1 = 0.3 * 0.8 + 0.7 * 0.9
        assert abs(result[0]["final_score"] - expected_score_1) < 0.001

    def test_combine_scores_with_bm25(self):
        """Test combining reranker scores with BM25 scores."""
        reranker = Reranker()
        documents = [
            {"id": "doc1", "content": "test1", "bm25_score": 0.75},
        ]
        rerank_scores = [0.85]

        result = reranker._combine_scores(
            documents=documents,
            scores=rerank_scores,
            original_score_weight=0.4,
            rerank_score_weight=0.6,
        )

        assert result[0]["reranking_metadata"]["original_score_type"] == "bm25"
        expected_score = 0.4 * 0.75 + 0.6 * 0.85
        assert abs(result[0]["final_score"] - expected_score) < 0.001

    def test_combine_scores_with_rrf(self):
        """Test combining reranker scores with RRF scores."""
        reranker = Reranker()
        documents = [
            {"id": "doc1", "content": "test1", "rrf_score": 0.65},
        ]
        rerank_scores = [0.9]

        result = reranker._combine_scores(
            documents=documents,
            scores=rerank_scores,
            original_score_weight=0.3,
            rerank_score_weight=0.7,
        )

        assert result[0]["reranking_metadata"]["original_score_type"] == "rrf"

    def test_combine_scores_no_original_score(self):
        """Test combining when document has no original score."""
        reranker = Reranker()
        documents = [
            {"id": "doc1", "content": "test1"},  # No score
        ]
        rerank_scores = [0.8]

        result = reranker._combine_scores(
            documents=documents,
            scores=rerank_scores,
            original_score_weight=0.3,
            rerank_score_weight=0.7,
        )

        # Should use 0.0 as original score
        expected_score = 0.3 * 0.0 + 0.7 * 0.8
        assert abs(result[0]["final_score"] - expected_score) < 0.001


class TestScoreTypeDetection:
    """Test score type detection."""

    def test_get_score_type_rrf(self):
        """Test detection of RRF score."""
        reranker = Reranker()
        doc = {"rrf_score": 0.5}

        score_type = reranker._get_score_type(doc)

        assert score_type == "rrf"

    def test_get_score_type_vector(self):
        """Test detection of vector similarity score."""
        reranker = Reranker()
        doc = {"similarity": 0.8}

        score_type = reranker._get_score_type(doc)

        assert score_type == "vector"

    def test_get_score_type_bm25(self):
        """Test detection of BM25 score."""
        reranker = Reranker()
        doc = {"bm25_score": 0.7}

        score_type = reranker._get_score_type(doc)

        assert score_type == "bm25"

    def test_get_score_type_unknown(self):
        """Test detection when no known score present."""
        reranker = Reranker()
        doc = {"id": "doc1"}

        score_type = reranker._get_score_type(doc)

        assert score_type == "unknown"


@pytest.mark.asyncio
class TestReranking:
    """Test reranking functionality."""

    async def test_rerank_empty_documents(self):
        """Test reranking with empty document list."""
        reranker = Reranker()

        result = await reranker.rerank(query="test query", documents=[], top_k=5)

        assert result == []

    async def test_rerank_empty_query(self):
        """Test reranking with empty query returns original order."""
        reranker = Reranker()
        documents = [
            {"id": "doc1", "content": "test1"},
            {"id": "doc2", "content": "test2"},
        ]

        result = await reranker.rerank(query="", documents=documents, top_k=5)

        assert len(result) == 2
        assert result == documents

    @pytest.mark.skip(reason="Mock patching issue with module-level imports")
    async def test_rerank_with_mock_model(self):
        """Test reranking with mocked model."""
        # Setup mocks
        mock_torch.cuda.is_available.return_value = False
        mock_model = MagicMock()
        mock_model.predict.return_value = [0.9, 0.7, 0.5]
        mock_cross_encoder.return_value = mock_model

        reranker = Reranker()
        documents = [
            {"id": "doc1", "content": "test1", "similarity": 0.6},
            {"id": "doc2", "content": "test2", "similarity": 0.7},
            {"id": "doc3", "content": "test3", "similarity": 0.8},
        ]

        result = await reranker.rerank(query="test query", documents=documents, top_k=2)

        # Should return top 2 after reranking
        assert len(result) == 2
        assert "rerank_score" in result[0]
        assert "final_score" in result[0]
        # doc1 should be first (highest rerank score 0.9)
        assert result[0]["id"] == "doc1"

    async def test_rerank_respects_top_k(self):
        """Test that reranking respects top_k parameter."""
        reranker = Reranker()
        documents = [{"id": f"doc{i}", "content": f"test{i}"} for i in range(10)]

        # Mock to avoid actual model loading
        with patch.object(reranker, "_load_model"):
            with patch.object(
                reranker, "_compute_scores", return_value=[float(i) for i in range(10)]
            ):
                result = await reranker.rerank(query="test", documents=documents, top_k=5)

        assert len(result) == 5

    async def test_rerank_fallback_on_error(self):
        """Test that reranking falls back to original order on error."""
        reranker = Reranker()
        documents = [
            {"id": "doc1", "content": "test1"},
            {"id": "doc2", "content": "test2"},
        ]

        # Force an error by making _load_model raise
        with patch.object(reranker, "_load_model", side_effect=Exception("Model error")):
            result = await reranker.rerank(query="test", documents=documents, top_k=5)

        # Should return original documents (fallback)
        assert len(result) == 2
        assert result[0]["id"] == "doc1"
        assert result[1]["id"] == "doc2"


class TestSingleton:
    """Test singleton pattern."""

    def test_get_reranker_returns_same_instance(self):
        """Test that get_reranker returns the same instance."""
        # Reset singleton
        import app.services.reranker as reranker_module

        reranker_module._reranker = None

        reranker1 = get_reranker()
        reranker2 = get_reranker()

        assert reranker1 is reranker2

    def test_singleton_with_custom_params(self):
        """Test that singleton uses first initialization parameters."""
        # Reset singleton
        import app.services.reranker as reranker_module

        reranker_module._reranker = None

        reranker1 = get_reranker(model_name="model1", batch_size=8)
        reranker2 = get_reranker(model_name="model2", batch_size=16)

        # Should return same instance (first initialization)
        assert reranker1 is reranker2
        assert reranker1.model_name == "model1"
        assert reranker1.batch_size == 8


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
