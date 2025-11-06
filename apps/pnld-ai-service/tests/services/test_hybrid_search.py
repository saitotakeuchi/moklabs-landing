"""Unit tests for hybrid search (vector + BM25 with RRF)."""

import pytest
from app.services.hybrid_search import HybridSearcher, get_hybrid_searcher


class TestHybridSearcher:
    """Test HybridSearcher class and RRF algorithm."""

    def test_initialization(self):
        """Test HybridSearcher initialization with default weights."""
        searcher = HybridSearcher()

        assert searcher.vector_weight == 0.6
        assert searcher.bm25_weight == 0.4
        assert searcher.rrf_k == 60

    def test_custom_weights(self):
        """Test HybridSearcher with custom weights."""
        searcher = HybridSearcher(vector_weight=0.7, bm25_weight=0.3, rrf_k=50)

        assert searcher.vector_weight == 0.7
        assert searcher.bm25_weight == 0.3
        assert searcher.rrf_k == 50

    def test_rrf_vector_only(self):
        """Test RRF with only vector results."""
        searcher = HybridSearcher()

        vector_results = [
            {"id": "doc1", "content": "test1", "similarity": 0.9},
            {"id": "doc2", "content": "test2", "similarity": 0.8},
            {"id": "doc3", "content": "test3", "similarity": 0.7},
        ]
        bm25_results = []

        fused = searcher._reciprocal_rank_fusion(vector_results, bm25_results)

        assert len(fused) == 3
        assert fused[0]["id"] == "doc1"  # Highest rank in vector
        assert fused[1]["id"] == "doc2"
        assert fused[2]["id"] == "doc3"
        assert "rrf_score" in fused[0]
        assert "hybrid_rank" in fused[0]

    def test_rrf_bm25_only(self):
        """Test RRF with only BM25 results."""
        searcher = HybridSearcher()

        vector_results = []
        bm25_results = [
            {"id": "doc1", "content": "test1", "bm25_score": 0.9},
            {"id": "doc2", "content": "test2", "bm25_score": 0.8},
        ]

        fused = searcher._reciprocal_rank_fusion(vector_results, bm25_results)

        assert len(fused) == 2
        assert fused[0]["id"] == "doc1"
        assert "rrf_score" in fused[0]

    def test_rrf_overlapping_results(self):
        """Test RRF with overlapping documents from both methods."""
        searcher = HybridSearcher(vector_weight=0.5, bm25_weight=0.5)

        # doc1 appears in both (should get highest RRF score)
        vector_results = [
            {"id": "doc1", "content": "test1", "similarity": 0.9},
            {"id": "doc2", "content": "test2", "similarity": 0.8},
        ]
        bm25_results = [
            {"id": "doc1", "content": "test1", "bm25_score": 0.85},
            {"id": "doc3", "content": "test3", "bm25_score": 0.7},
        ]

        fused = searcher._reciprocal_rank_fusion(vector_results, bm25_results)

        assert len(fused) == 3  # Unique documents
        assert fused[0]["id"] == "doc1"  # Appears in both, should rank highest
        assert len(fused[0]["source_methods"]) == 2  # From both methods

    def test_rrf_different_rankings(self):
        """Test RRF handles different rankings between methods."""
        searcher = HybridSearcher()

        # Vector ranks doc2 first, BM25 ranks doc3 first
        vector_results = [
            {"id": "doc2", "content": "test2", "similarity": 0.9},
            {"id": "doc3", "content": "test3", "similarity": 0.7},
            {"id": "doc1", "content": "test1", "similarity": 0.6},
        ]
        bm25_results = [
            {"id": "doc3", "content": "test3", "bm25_score": 0.95},
            {"id": "doc1", "content": "test1", "bm25_score": 0.8},
            {"id": "doc2", "content": "test2", "bm25_score": 0.7},
        ]

        fused = searcher._reciprocal_rank_fusion(vector_results, bm25_results)

        # All docs appear in both methods
        assert len(fused) == 3
        # Check that fusion combines rankings (exact order depends on weights)
        assert all(len(doc["source_methods"]) == 2 for doc in fused)

    def test_rrf_score_calculation(self):
        """Test that RRF scores are calculated correctly."""
        searcher = HybridSearcher(vector_weight=0.6, bm25_weight=0.4, rrf_k=60)

        vector_results = [
            {"id": "doc1", "content": "test1", "similarity": 0.9},
        ]
        bm25_results = [
            {"id": "doc1", "content": "test1", "bm25_score": 0.8},
        ]

        fused = searcher._reciprocal_rank_fusion(vector_results, bm25_results)

        # RRF score = (0.6 / (60 + 1)) + (0.4 / (60 + 1))
        # = 0.6/61 + 0.4/61 = 1.0/61 ≈ 0.0164
        expected_score = (0.6 / 61) + (0.4 / 61)
        assert abs(fused[0]["rrf_score"] - expected_score) < 0.0001

    def test_rrf_empty_results(self):
        """Test RRF handles empty result sets."""
        searcher = HybridSearcher()

        fused = searcher._reciprocal_rank_fusion([], [])

        assert len(fused) == 0

    def test_rrf_missing_document_id(self):
        """Test RRF handles documents without IDs gracefully."""
        searcher = HybridSearcher()

        vector_results = [
            {"content": "test1"},  # Missing ID
            {"id": "doc2", "content": "test2"},
        ]
        bm25_results = []

        fused = searcher._reciprocal_rank_fusion(vector_results, bm25_results)

        # Should only include doc2 (has valid ID)
        assert len(fused) == 1
        assert fused[0]["id"] == "doc2"

    def test_source_methods_metadata(self):
        """Test that source methods metadata is properly tracked."""
        searcher = HybridSearcher()

        vector_results = [
            {"id": "doc1", "content": "test1", "similarity": 0.9},
        ]
        bm25_results = [
            {"id": "doc1", "content": "test1", "bm25_score": 0.8},
            {"id": "doc2", "content": "test2", "bm25_score": 0.7},
        ]

        fused = searcher._reciprocal_rank_fusion(vector_results, bm25_results)

        # doc1 should have both methods
        doc1 = next(d for d in fused if d["id"] == "doc1")
        assert len(doc1["source_methods"]) == 2
        methods = [m["method"] for m in doc1["source_methods"]]
        assert "vector" in methods
        assert "bm25" in methods

        # doc2 should only have BM25
        doc2 = next(d for d in fused if d["id"] == "doc2")
        assert len(doc2["source_methods"]) == 1
        assert doc2["source_methods"][0]["method"] == "bm25"

    def test_hybrid_rank_assignment(self):
        """Test that hybrid_rank is correctly assigned."""
        searcher = HybridSearcher()

        vector_results = [
            {"id": "doc1", "content": "test1"},
            {"id": "doc2", "content": "test2"},
            {"id": "doc3", "content": "test3"},
        ]

        fused = searcher._reciprocal_rank_fusion(vector_results, [])

        assert fused[0]["hybrid_rank"] == 1
        assert fused[1]["hybrid_rank"] == 2
        assert fused[2]["hybrid_rank"] == 3


class TestSingleton:
    """Test singleton pattern for HybridSearcher."""

    def test_get_hybrid_searcher_returns_same_instance(self):
        """Test that get_hybrid_searcher returns the same instance."""
        searcher1 = get_hybrid_searcher()
        searcher2 = get_hybrid_searcher()

        assert searcher1 is searcher2

    def test_singleton_with_custom_params(self):
        """Test that singleton uses first initialization parameters."""
        # Reset singleton
        import app.services.hybrid_search as hs_module

        hs_module._hybrid_searcher = None

        searcher1 = get_hybrid_searcher(vector_weight=0.7, bm25_weight=0.3)
        searcher2 = get_hybrid_searcher(vector_weight=0.5, bm25_weight=0.5)

        # Should return same instance (first initialization)
        assert searcher1 is searcher2
        assert searcher1.vector_weight == 0.7
        assert searcher1.bm25_weight == 0.3


@pytest.mark.asyncio
class TestHybridSearchIntegration:
    """Integration tests requiring database connection."""

    @pytest.mark.skip(reason="Requires database with BM25 migration applied")
    async def test_search_returns_results(self):
        """Test that hybrid search returns results."""
        searcher = HybridSearcher()

        results = await searcher.search(
            vector_query="requisitos do PNLD", bm25_query="requisitos do PNLD", limit=5
        )

        assert isinstance(results, list)
        # Results should have RRF scores and hybrid ranks
        if results:
            assert "rrf_score" in results[0]
            assert "hybrid_rank" in results[0]

    @pytest.mark.skip(reason="Requires database with BM25 migration applied")
    async def test_search_with_edital_filter(self):
        """Test hybrid search with edital filtering."""
        searcher = HybridSearcher()

        results = await searcher.search(
            vector_query="prazo", bm25_query="prazo", edital_id="pnld-2024", limit=5
        )

        assert isinstance(results, list)

    @pytest.mark.skip(reason="Requires database with BM25 migration applied")
    async def test_search_error_handling(self):
        """Test that search handles errors gracefully."""
        searcher = HybridSearcher()

        # Invalid query should not crash
        results = await searcher.search(vector_query="", bm25_query="", limit=5)

        assert isinstance(results, list)


class TestRRFWeights:
    """Test RRF with different weight configurations."""

    def test_vector_heavy_weighting(self):
        """Test RRF favors vector results with high vector weight."""
        searcher = HybridSearcher(vector_weight=0.9, bm25_weight=0.1)

        vector_results = [
            {"id": "doc1", "content": "test1"},
        ]
        bm25_results = [
            {"id": "doc2", "content": "test2"},
        ]

        fused = searcher._reciprocal_rank_fusion(vector_results, bm25_results)

        # doc1 should rank higher due to vector weight
        assert fused[0]["id"] == "doc1"

    def test_bm25_heavy_weighting(self):
        """Test RRF favors BM25 results with high BM25 weight."""
        searcher = HybridSearcher(vector_weight=0.1, bm25_weight=0.9)

        vector_results = [
            {"id": "doc1", "content": "test1"},
        ]
        bm25_results = [
            {"id": "doc2", "content": "test2"},
        ]

        fused = searcher._reciprocal_rank_fusion(vector_results, bm25_results)

        # doc2 should rank higher due to BM25 weight
        assert fused[0]["id"] == "doc2"

    def test_equal_weighting(self):
        """Test RRF with equal weights."""
        searcher = HybridSearcher(vector_weight=0.5, bm25_weight=0.5)

        vector_results = [
            {"id": "doc1", "content": "test1"},
            {"id": "doc2", "content": "test2"},
        ]
        bm25_results = [
            {"id": "doc2", "content": "test2"},
            {"id": "doc1", "content": "test1"},
        ]

        fused = searcher._reciprocal_rank_fusion(vector_results, bm25_results)

        # With equal weights and same docs in different orders,
        # doc1 should rank higher (appears first in vector, second in BM25)
        assert fused[0]["id"] == "doc1"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
