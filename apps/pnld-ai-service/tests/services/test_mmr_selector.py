"""Unit tests for MMR selector."""

import pytest
import numpy as np
from app.services.mmr_selector import MMRSelector, get_mmr_selector


class TestMMRSelector:
    """Tests for MMRSelector class."""

    @pytest.fixture
    def mmr_selector(self):
        """Create MMRSelector instance."""
        return MMRSelector(lambda_param=0.7)

    @pytest.fixture
    def sample_documents(self):
        """Create sample documents with embeddings."""
        # Create 5 documents with known embeddings
        docs = []

        # Doc 1: About PNLD requirements
        docs.append(
            {
                "id": "1",
                "content": "O PNLD tem requisitos específicos para obras didáticas.",
                "embedding": [0.8, 0.1, 0.0, 0.1],
                "similarity": 0.95,
            }
        )

        # Doc 2: Very similar to Doc 1 (redundant)
        docs.append(
            {
                "id": "2",
                "content": "O Programa Nacional do Livro Didático possui requisitos para livros.",
                "embedding": [0.75, 0.15, 0.05, 0.05],
                "similarity": 0.93,
            }
        )

        # Doc 3: About deadlines (diverse topic)
        docs.append(
            {
                "id": "3",
                "content": "Os prazos de submissão devem ser respeitados.",
                "embedding": [0.1, 0.8, 0.0, 0.1],
                "similarity": 0.85,
            }
        )

        # Doc 4: About evaluation criteria (different angle)
        docs.append(
            {
                "id": "4",
                "content": "A avaliação pedagógica considera múltiplos critérios.",
                "embedding": [0.0, 0.1, 0.9, 0.0],
                "similarity": 0.80,
            }
        )

        # Doc 5: About registration process (diverse)
        docs.append(
            {
                "id": "5",
                "content": "O processo de inscrição requer documentação completa.",
                "embedding": [0.1, 0.0, 0.1, 0.8],
                "similarity": 0.75,
            }
        )

        return docs

    @pytest.fixture
    def query_embedding(self):
        """Create a query embedding."""
        # Query about PNLD requirements (similar to docs 1 and 2)
        return np.array([0.85, 0.05, 0.05, 0.05])

    def test_initialization(self):
        """Test MMRSelector initialization."""
        selector = MMRSelector(lambda_param=0.8)
        assert selector.lambda_param == 0.8

    def test_initialization_defaults(self):
        """Test MMRSelector initialization with defaults."""
        selector = MMRSelector()
        assert selector.lambda_param == 0.7

    def test_invalid_lambda(self):
        """Test that invalid lambda values raise errors."""
        with pytest.raises(ValueError):
            MMRSelector(lambda_param=-0.1)

        with pytest.raises(ValueError):
            MMRSelector(lambda_param=1.5)

    @pytest.mark.asyncio
    async def test_select_diverse_basic(self, mmr_selector, sample_documents, query_embedding):
        """Test basic MMR selection."""
        result = await mmr_selector.select_diverse(
            query_embedding=query_embedding,
            documents=sample_documents,
            max_documents=3,
        )

        # Should return 3 documents
        assert len(result) == 3

        # First document should be the most relevant (highest similarity)
        assert result[0]["id"] == "1"

        # All results should have MMR scores
        assert all("mmr_score" in doc for doc in result)
        assert all("mmr_relevance" in doc for doc in result)
        assert all("mmr_rank" in doc for doc in result)

        # MMR ranks should be sequential
        assert result[0]["mmr_rank"] == 1
        assert result[1]["mmr_rank"] == 2
        assert result[2]["mmr_rank"] == 3

    @pytest.mark.asyncio
    async def test_select_diverse_empty_documents(self, mmr_selector, query_embedding):
        """Test MMR selection with empty document list."""
        result = await mmr_selector.select_diverse(
            query_embedding=query_embedding,
            documents=[],
            max_documents=5,
        )

        assert result == []

    @pytest.mark.asyncio
    async def test_select_diverse_fewer_docs_than_max(
        self, mmr_selector, sample_documents, query_embedding
    ):
        """Test MMR selection when documents < max_documents."""
        # Only take first 2 documents
        result = await mmr_selector.select_diverse(
            query_embedding=query_embedding,
            documents=sample_documents[:2],
            max_documents=5,
        )

        # Should return all available documents
        assert len(result) == 2

    @pytest.mark.asyncio
    async def test_select_diverse_with_token_limit(self, mmr_selector, query_embedding):
        """Test MMR selection with token limit."""
        # Create fresh documents with token counts (not modifying shared fixture)
        docs = [
            {
                "id": "1",
                "content": " ".join(["word"] * 100),  # 100 words
                "embedding": [0.8, 0.1, 0.0, 0.1],
                "similarity": 0.95,
            },
            {
                "id": "2",
                "content": " ".join(["word"] * 100),  # 100 words
                "embedding": [0.75, 0.15, 0.05, 0.05],
                "similarity": 0.93,
            },
            {
                "id": "3",
                "content": " ".join(["word"] * 100),  # 100 words
                "embedding": [0.1, 0.8, 0.0, 0.1],
                "similarity": 0.85,
            },
            {
                "id": "4",
                "content": " ".join(["word"] * 100),  # 100 words
                "embedding": [0.0, 0.1, 0.9, 0.0],
                "similarity": 0.80,
            },
        ]

        result = await mmr_selector.select_diverse(
            query_embedding=query_embedding,
            documents=docs,
            max_documents=5,
            max_tokens=250,  # Should stop after ~2 documents (100 + 100 = 200 < 250)
        )

        # Should stop when token limit would be exceeded
        total_tokens = sum(len(doc.get("content", "").split()) for doc in result)
        assert total_tokens <= 250
        assert len(result) <= 3  # At most 2-3 documents should fit

    @pytest.mark.asyncio
    async def test_select_diverse_lambda_1_pure_relevance(self, sample_documents, query_embedding):
        """Test MMR with lambda=1.0 (pure relevance, no diversity)."""
        selector = MMRSelector(lambda_param=1.0)

        result = await selector.select_diverse(
            query_embedding=query_embedding,
            documents=sample_documents,
            max_documents=3,
        )

        # With pure relevance, should select by similarity score only
        assert result[0]["id"] == "1"  # Highest similarity (0.95)
        assert result[1]["id"] == "2"  # Second highest (0.93)
        assert result[2]["id"] == "3"  # Third highest (0.85)

    @pytest.mark.asyncio
    async def test_select_diverse_lambda_0_pure_diversity(self, sample_documents, query_embedding):
        """Test MMR with lambda=0.0 (pure diversity, no relevance)."""
        selector = MMRSelector(lambda_param=0.0)

        result = await selector.select_diverse(
            query_embedding=query_embedding,
            documents=sample_documents,
            max_documents=3,
        )

        # With pure diversity, documents should be maximally different
        # First should still be most relevant (as starting point)
        assert result[0]["id"] == "1"

        # Subsequent documents should be maximally diverse
        # Check that selected documents have low similarity to each other
        embeddings = [np.array(doc["embedding"]) for doc in result]
        for i in range(len(embeddings)):
            for j in range(i + 1, len(embeddings)):
                similarity = np.dot(embeddings[i], embeddings[j]) / (
                    np.linalg.norm(embeddings[i]) * np.linalg.norm(embeddings[j])
                )
                # With pure diversity, similarity between selected docs should be relatively low
                assert similarity < 0.8

    @pytest.mark.asyncio
    async def test_select_diverse_preserves_metadata(
        self, mmr_selector, sample_documents, query_embedding
    ):
        """Test that MMR selection preserves document metadata."""
        # Add extra metadata
        for doc in sample_documents:
            doc["page_number"] = 42
            doc["document_title"] = "Test Document"

        result = await mmr_selector.select_diverse(
            query_embedding=query_embedding,
            documents=sample_documents,
            max_documents=3,
        )

        # Check metadata is preserved
        for doc in result:
            assert doc.get("page_number") == 42
            assert doc.get("document_title") == "Test Document"
            assert "content" in doc
            assert "embedding" in doc

    @pytest.mark.asyncio
    async def test_select_diverse_adds_mmr_score(
        self, mmr_selector, sample_documents, query_embedding
    ):
        """Test that MMR selection adds mmr_score to documents."""
        result = await mmr_selector.select_diverse(
            query_embedding=query_embedding,
            documents=sample_documents,
            max_documents=3,
        )

        # Check that mmr_score is added
        for doc in result:
            assert "mmr_score" in doc
            assert isinstance(doc["mmr_score"], float)

        # First document should have highest MMR score
        assert result[0]["mmr_score"] >= result[1]["mmr_score"]
        assert result[1]["mmr_score"] >= result[2]["mmr_score"]

    @pytest.mark.asyncio
    async def test_select_diverse_without_embeddings(self, mmr_selector, query_embedding):
        """Test MMR selection with documents missing embeddings."""
        docs = [
            {"id": "1", "content": "Test 1"},
            {
                "id": "2",
                "content": "Test 2",
                "embedding": [0.1, 0.2, 0.3, 0.4],
            },  # Match query embedding dimension
        ]

        result = await mmr_selector.select_diverse(
            query_embedding=query_embedding,
            documents=docs,
            max_documents=2,
        )

        # Should only include documents with embeddings
        assert len(result) == 1
        assert result[0]["id"] == "2"

    def test_calculate_diversity_metrics_basic(self, mmr_selector, sample_documents):
        """Test diversity metrics calculation."""
        # Take first 3 documents
        selected = sample_documents[:3]

        metrics = mmr_selector.calculate_diversity_metrics(selected)

        # Check that all metrics are present
        assert "avg_similarity" in metrics
        assert "min_similarity" in metrics
        assert "max_similarity" in metrics
        assert "num_documents" in metrics

        # Check metric values
        assert metrics["num_documents"] == 3
        assert 0 <= metrics["avg_similarity"] <= 1
        assert 0 <= metrics["min_similarity"] <= 1
        assert 0 <= metrics["max_similarity"] <= 1
        assert metrics["min_similarity"] <= metrics["avg_similarity"]
        assert metrics["avg_similarity"] <= metrics["max_similarity"]

    def test_calculate_diversity_metrics_empty(self, mmr_selector):
        """Test diversity metrics with empty document list."""
        metrics = mmr_selector.calculate_diversity_metrics([])

        assert metrics["num_documents"] == 0
        assert metrics["avg_similarity"] == 0.0
        assert metrics["min_similarity"] == 0.0
        assert metrics["max_similarity"] == 0.0

    def test_calculate_diversity_metrics_single_doc(self, mmr_selector, sample_documents):
        """Test diversity metrics with single document."""
        metrics = mmr_selector.calculate_diversity_metrics([sample_documents[0]])

        assert metrics["num_documents"] == 1
        assert metrics["avg_similarity"] == 0.0
        assert metrics["min_similarity"] == 0.0
        assert metrics["max_similarity"] == 0.0

    def test_calculate_diversity_metrics_similar_docs(self, mmr_selector):
        """Test diversity metrics with very similar documents."""
        # Create two nearly identical documents
        docs = [
            {"id": "1", "embedding": [1.0, 0.0, 0.0, 0.0]},
            {"id": "2", "embedding": [0.99, 0.01, 0.0, 0.0]},
        ]

        metrics = mmr_selector.calculate_diversity_metrics(docs)

        # Documents are very similar, so similarity should be high
        assert metrics["avg_similarity"] > 0.9
        assert metrics["min_similarity"] > 0.9

    def test_calculate_diversity_metrics_diverse_docs(self, mmr_selector):
        """Test diversity metrics with very diverse documents."""
        # Create orthogonal vectors (maximally diverse)
        docs = [
            {"id": "1", "embedding": [1.0, 0.0, 0.0, 0.0]},
            {"id": "2", "embedding": [0.0, 1.0, 0.0, 0.0]},
            {"id": "3", "embedding": [0.0, 0.0, 1.0, 0.0]},
        ]

        metrics = mmr_selector.calculate_diversity_metrics(docs)

        # Orthogonal vectors have 0 similarity
        assert metrics["avg_similarity"] < 0.1
        assert metrics["min_similarity"] < 0.1

    def test_calculate_diversity_metrics_without_embeddings(self, mmr_selector):
        """Test diversity metrics with documents missing embeddings."""
        docs = [
            {"id": "1", "content": "Test 1"},
            {"id": "2", "content": "Test 2"},
        ]

        metrics = mmr_selector.calculate_diversity_metrics(docs)

        # Should return zeros when embeddings are missing (num_documents will be 0 since no embeddings)
        assert metrics["num_documents"] == 0
        assert metrics["avg_similarity"] == 0.0

    def test_get_mmr_selector_singleton(self):
        """Test that get_mmr_selector returns singleton instance."""
        selector1 = get_mmr_selector(lambda_param=0.7)
        selector2 = get_mmr_selector(lambda_param=0.7)

        # Should return the same instance
        assert selector1 is selector2

    def test_get_mmr_selector_different_params(self):
        """Test that get_mmr_selector returns singleton (ignores different params after first call)."""
        selector1 = get_mmr_selector(lambda_param=0.7)
        selector2 = get_mmr_selector(lambda_param=0.5)

        # Should return same instance (singleton pattern)
        # Note: This is the actual behavior - it ignores lambda_param after first initialization
        assert selector1 is selector2
        assert selector1.lambda_param == 0.7  # Keeps original lambda

    @pytest.mark.asyncio
    async def test_mmr_reduces_redundancy(self, sample_documents, query_embedding):
        """Test that MMR effectively reduces redundancy compared to pure relevance."""
        # Test with balanced MMR (lambda=0.7)
        mmr_selector = MMRSelector(lambda_param=0.7)
        mmr_result = await mmr_selector.select_diverse(
            query_embedding=query_embedding,
            documents=sample_documents,
            max_documents=3,
        )

        # Test with pure relevance (lambda=1.0)
        relevance_selector = MMRSelector(lambda_param=1.0)
        relevance_result = await relevance_selector.select_diverse(
            query_embedding=query_embedding,
            documents=sample_documents,
            max_documents=3,
        )

        # Calculate diversity for both
        mmr_diversity = mmr_selector.calculate_diversity_metrics(mmr_result)
        relevance_diversity = relevance_selector.calculate_diversity_metrics(relevance_result)

        # MMR should have lower average similarity (more diverse)
        assert mmr_diversity["avg_similarity"] <= relevance_diversity["avg_similarity"]

    @pytest.mark.asyncio
    async def test_mmr_with_real_world_embeddings(self, mmr_selector):
        """Test MMR with more realistic high-dimensional embeddings."""
        np.random.seed(42)

        # Create 10 documents with 384-dimensional embeddings (realistic for sentence transformers)
        docs = []
        for i in range(10):
            # Create random embedding and normalize
            embedding = np.random.randn(384)
            embedding = embedding / np.linalg.norm(embedding)

            docs.append(
                {
                    "id": str(i),
                    "content": f"Document {i}",
                    "embedding": embedding.tolist(),
                    "similarity": 0.9 - (i * 0.05),  # Decreasing similarity
                    "token_count": 100,
                }
            )

        # Create query embedding
        query_emb = np.random.randn(384)
        query_emb = query_emb / np.linalg.norm(query_emb)

        result = await mmr_selector.select_diverse(
            query_embedding=query_emb,
            documents=docs,
            max_documents=5,
        )

        # Should return 5 documents
        assert len(result) == 5

        # All should have MMR scores
        assert all("mmr_score" in doc for doc in result)

        # Calculate diversity
        metrics = mmr_selector.calculate_diversity_metrics(result)
        assert metrics["num_documents"] == 5
        # For high-dimensional random vectors, cosine similarity can be negative
        assert -1 <= metrics["avg_similarity"] <= 1
        assert "diversity_score" in metrics


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
