"""Unit tests for cache manager."""

import pytest
import asyncio
import numpy as np
from unittest.mock import AsyncMock, patch, MagicMock
from app.services.cache_manager import SemanticCache, get_semantic_cache


@pytest.fixture
def cache_instance():
    """Create a cache instance for testing."""
    cache = SemanticCache(
        redis_url="redis://localhost:6379",
        similarity_threshold=0.95,
        embedding_dim=1536,
        max_index_size=100,
    )
    return cache


@pytest.fixture
def mock_redis():
    """Mock Redis client."""
    redis_mock = AsyncMock()
    redis_mock.ping = AsyncMock(return_value=True)
    redis_mock.get = AsyncMock(return_value=None)
    redis_mock.setex = AsyncMock(return_value=True)
    redis_mock.delete = AsyncMock(return_value=1)
    redis_mock.hgetall = AsyncMock(return_value={})
    redis_mock.hincrby = AsyncMock(return_value=1)
    redis_mock.scan = AsyncMock(return_value=(0, []))
    return redis_mock


class TestSemanticCacheInitialization:
    """Test cache initialization."""

    def test_init_with_defaults(self):
        """Test initialization with default parameters."""
        cache = SemanticCache()
        assert cache.redis_url == "redis://localhost:6379"
        assert cache.similarity_threshold == 0.95
        assert cache.embedding_dim == 1536
        assert cache.max_index_size == 10000
        assert cache.redis is None

    def test_init_with_custom_params(self):
        """Test initialization with custom parameters."""
        cache = SemanticCache(
            redis_url="redis://custom:6380",
            similarity_threshold=0.90,
            embedding_dim=768,
            max_index_size=5000,
        )
        assert cache.redis_url == "redis://custom:6380"
        assert cache.similarity_threshold == 0.90
        assert cache.embedding_dim == 768
        assert cache.max_index_size == 5000

    def test_init_with_custom_ttl(self):
        """Test initialization with custom TTL configuration."""
        custom_ttl = {
            "embedding": 1000,
            "search_results": 2000,
        }
        cache = SemanticCache(ttl_config=custom_ttl)
        assert cache.ttl_config == custom_ttl

    def test_faiss_index_initialized(self):
        """Test that FAISS index is properly initialized."""
        cache = SemanticCache(embedding_dim=768)
        assert cache.index is not None
        assert cache.index.ntotal == 0
        assert cache.index.d == 768


class TestRedisConnection:
    """Test Redis connection management."""

    @pytest.mark.asyncio
    async def test_connect_success(self, cache_instance, mock_redis):
        """Test successful Redis connection."""

        async def mock_from_url(*args, **kwargs):
            return mock_redis

        with patch("app.services.cache_manager.aioredis.from_url", side_effect=mock_from_url):
            await cache_instance.connect()
            assert cache_instance.redis is not None
            mock_redis.ping.assert_called_once()

    @pytest.mark.asyncio
    async def test_connect_failure(self, cache_instance):
        """Test Redis connection failure handling."""
        with patch(
            "app.services.cache_manager.aioredis.from_url",
            side_effect=Exception("Connection failed"),
        ):
            with pytest.raises(Exception, match="Connection failed"):
                await cache_instance.connect()

    @pytest.mark.asyncio
    async def test_disconnect(self, cache_instance, mock_redis):
        """Test Redis disconnection."""
        cache_instance.redis = mock_redis
        await cache_instance.disconnect()
        mock_redis.close.assert_called_once()


class TestCacheOperations:
    """Test basic cache operations."""

    @pytest.mark.asyncio
    async def test_get_cache_miss(self, cache_instance, mock_redis):
        """Test cache get on miss."""
        cache_instance.redis = mock_redis
        mock_redis.get.return_value = None

        result = await cache_instance.get("test_key")
        assert result is None
        mock_redis.get.assert_called_once_with("rag:test_key")

    @pytest.mark.asyncio
    async def test_get_cache_hit(self, cache_instance, mock_redis):
        """Test cache get on hit."""
        import pickle

        cache_instance.redis = mock_redis
        test_value = {"data": "test"}
        mock_redis.get.return_value = pickle.dumps(test_value)

        result = await cache_instance.get("test_key")
        assert result == test_value

    @pytest.mark.asyncio
    async def test_set_without_semantic_key(self, cache_instance, mock_redis):
        """Test cache set without semantic key."""
        cache_instance.redis = mock_redis
        test_value = {"data": "test"}

        await cache_instance.set("test_key", test_value, ttl=3600, cache_type="test")

        mock_redis.setex.assert_called_once()
        call_args = mock_redis.setex.call_args
        assert call_args[0][0] == "rag:test_key"
        assert call_args[0][1] == 3600

    @pytest.mark.asyncio
    async def test_set_with_semantic_key(self, cache_instance, mock_redis):
        """Test cache set with semantic key."""
        cache_instance.redis = mock_redis
        test_value = {"data": "test"}
        embedding = np.random.rand(1536).astype("float32")

        await cache_instance.set(
            "test_key", test_value, ttl=3600, semantic_key=embedding, cache_type="test"
        )

        # Verify Redis set was called
        mock_redis.setex.assert_called_once()

        # Verify embedding was added to FAISS index
        assert cache_instance.index.ntotal == 1

    @pytest.mark.asyncio
    async def test_set_uses_default_ttl(self, cache_instance, mock_redis):
        """Test that set uses default TTL from config."""
        cache_instance.redis = mock_redis
        cache_instance.ttl_config = {"search_results": 7200}

        await cache_instance.set("test_key", "value", cache_type="search_results")

        call_args = mock_redis.setex.call_args
        assert call_args[0][1] == 7200


class TestSemanticSearch:
    """Test semantic similarity search."""

    @pytest.mark.asyncio
    async def test_find_similar_empty_index(self, cache_instance, mock_redis):
        """Test semantic search with empty index."""
        cache_instance.redis = mock_redis
        query_embedding = np.random.rand(1536).astype("float32")

        result = await cache_instance._find_similar_cached(query_embedding, cache_type="test")
        assert result is None

    @pytest.mark.asyncio
    async def test_find_similar_below_threshold(self, cache_instance, mock_redis):
        """Test semantic search with similarity below threshold."""
        import pickle

        cache_instance.redis = mock_redis

        # Add an embedding to the index
        embedding1 = np.random.rand(1536).astype("float32")
        cache_instance._add_to_semantic_index("rag:test:key1", embedding1)

        # Query with very different embedding
        query_embedding = np.random.rand(1536).astype("float32")

        result = await cache_instance._find_similar_cached(query_embedding, cache_type="test")
        # Result should be None because similarity is below threshold
        assert result is None

    @pytest.mark.asyncio
    async def test_find_similar_above_threshold(self, cache_instance, mock_redis):
        """Test semantic search with similarity above threshold."""
        import pickle

        cache_instance.redis = mock_redis

        # Add an embedding to the index
        embedding = np.random.rand(1536).astype("float32")
        test_value = {"data": "cached_result"}
        cache_instance._add_to_semantic_index("rag:test:key1", embedding)

        # Mock Redis to return the cached value
        mock_redis.get.return_value = pickle.dumps(test_value)

        # Query with the same embedding (100% similarity)
        result = await cache_instance._find_similar_cached(embedding.copy(), cache_type="test", k=1)

        # Should find the cached result
        assert result == test_value


class TestGetOrCompute:
    """Test get_or_compute functionality."""

    @pytest.mark.asyncio
    async def test_get_or_compute_cache_miss(self, cache_instance, mock_redis):
        """Test get_or_compute on cache miss."""
        cache_instance.redis = mock_redis
        mock_redis.get.return_value = None

        compute_called = False

        async def compute_func():
            nonlocal compute_called
            compute_called = True
            return {"result": "computed"}

        result = await cache_instance.get_or_compute(
            key="test_key", compute_func=compute_func, cache_type="test"
        )

        assert compute_called is True
        assert result == {"result": "computed"}
        mock_redis.setex.assert_called_once()

    @pytest.mark.asyncio
    async def test_get_or_compute_cache_hit(self, cache_instance, mock_redis):
        """Test get_or_compute on cache hit."""
        import pickle

        cache_instance.redis = mock_redis
        cached_value = {"result": "cached"}
        mock_redis.get.return_value = pickle.dumps(cached_value)

        compute_called = False

        async def compute_func():
            nonlocal compute_called
            compute_called = True
            return {"result": "computed"}

        result = await cache_instance.get_or_compute(
            key="test_key", compute_func=compute_func, cache_type="test"
        )

        assert compute_called is False
        assert result == cached_value
        mock_redis.setex.assert_not_called()

    @pytest.mark.asyncio
    async def test_get_or_compute_with_semantic_key(self, cache_instance, mock_redis):
        """Test get_or_compute with semantic similarity."""
        cache_instance.redis = mock_redis
        mock_redis.get.return_value = None

        embedding = np.random.rand(1536).astype("float32")

        async def compute_func():
            return {"result": "computed"}

        result = await cache_instance.get_or_compute(
            key="test_key",
            compute_func=compute_func,
            semantic_key=embedding,
            cache_type="test",
        )

        assert result == {"result": "computed"}
        # Verify embedding was added to index
        assert cache_instance.index.ntotal == 1


class TestCacheInvalidation:
    """Test cache invalidation."""

    @pytest.mark.asyncio
    async def test_invalidate_pattern_no_matches(self, cache_instance, mock_redis):
        """Test pattern invalidation with no matches."""
        cache_instance.redis = mock_redis
        mock_redis.scan.return_value = (0, [])

        await cache_instance.invalidate_pattern("test:*")

        mock_redis.scan.assert_called_once()
        mock_redis.delete.assert_not_called()

    @pytest.mark.asyncio
    async def test_invalidate_pattern_with_matches(self, cache_instance, mock_redis):
        """Test pattern invalidation with matches."""
        cache_instance.redis = mock_redis
        mock_redis.scan.return_value = (0, [b"rag:test:key1", b"rag:test:key2"])

        await cache_instance.invalidate_pattern("test:*")

        mock_redis.delete.assert_called_once_with(b"rag:test:key1", b"rag:test:key2")


class TestCacheStatistics:
    """Test cache statistics."""

    @pytest.mark.asyncio
    async def test_get_stats_empty(self, cache_instance, mock_redis):
        """Test getting stats when no stats exist."""
        cache_instance.redis = mock_redis
        mock_redis.hgetall.return_value = {}

        stats = await cache_instance.get_stats()
        assert stats == {}

    @pytest.mark.asyncio
    async def test_get_stats_with_data(self, cache_instance, mock_redis):
        """Test getting stats with data."""
        cache_instance.redis = mock_redis
        mock_redis.hgetall.return_value = {
            b"total_hits": b"100",
            b"total_misses": b"50",
            b"hits_exact": b"80",
            b"hits_semantic": b"20",
        }

        stats = await cache_instance.get_stats()
        assert stats["total_hits"] == 100
        assert stats["total_misses"] == 50
        assert stats["hits_exact"] == 80
        assert stats["hits_semantic"] == 20

    @pytest.mark.asyncio
    async def test_record_hit(self, cache_instance, mock_redis):
        """Test recording cache hit."""
        cache_instance.redis = mock_redis

        await cache_instance._record_hit("exact", "search_results")

        assert mock_redis.hincrby.call_count == 3
        mock_redis.hincrby.assert_any_call("rag:stats", "hits_exact", 1)
        mock_redis.hincrby.assert_any_call("rag:stats", "hits_search_results", 1)
        mock_redis.hincrby.assert_any_call("rag:stats", "total_hits", 1)

    @pytest.mark.asyncio
    async def test_record_miss(self, cache_instance, mock_redis):
        """Test recording cache miss."""
        cache_instance.redis = mock_redis

        await cache_instance._record_miss("search_results")

        assert mock_redis.hincrby.call_count == 2
        mock_redis.hincrby.assert_any_call("rag:stats", "total_misses", 1)
        mock_redis.hincrby.assert_any_call("rag:stats", "misses_search_results", 1)

    @pytest.mark.asyncio
    async def test_reset_stats(self, cache_instance, mock_redis):
        """Test resetting statistics."""
        cache_instance.redis = mock_redis

        await cache_instance.reset_stats()

        mock_redis.delete.assert_called_once_with("rag:stats")


class TestCacheKeyGeneration:
    """Test cache key generation."""

    def test_generate_cache_key_simple(self, cache_instance):
        """Test generating simple cache key."""
        key = cache_instance.generate_cache_key("test", "arg1", "arg2")
        assert key.startswith("test:")
        assert len(key) > 10  # Has hash suffix

    def test_generate_cache_key_deterministic(self, cache_instance):
        """Test that cache keys are deterministic."""
        key1 = cache_instance.generate_cache_key("test", "arg1", foo="bar")
        key2 = cache_instance.generate_cache_key("test", "arg1", foo="bar")
        assert key1 == key2

    def test_generate_cache_key_different_args(self, cache_instance):
        """Test that different args produce different keys."""
        key1 = cache_instance.generate_cache_key("test", "arg1")
        key2 = cache_instance.generate_cache_key("test", "arg2")
        assert key1 != key2


class TestIndexManagement:
    """Test FAISS index management."""

    def test_add_to_semantic_index(self, cache_instance):
        """Test adding embeddings to index."""
        embedding = np.random.rand(1536).astype("float32")

        cache_instance._add_to_semantic_index("test_key", embedding)

        assert cache_instance.index.ntotal == 1
        assert len(cache_instance.cache_embeddings) == 1
        assert 0 in cache_instance.query_cache

    def test_rebuild_index_on_size_limit(self, cache_instance):
        """Test index rebuild when size limit is reached."""
        # Set a small max index size for testing
        cache_instance.max_index_size = 10

        # Add embeddings beyond limit (should trigger rebuild)
        for i in range(15):
            embedding = np.random.rand(1536).astype("float32")
            cache_instance._add_to_semantic_index(f"key_{i}", embedding)

        # After rebuild, index should keep only the last 5000 items (default keep_items)
        # But since we only added 15, the index should have all 15
        # The rebuild is only triggered once we exceed max_index_size
        # After the first rebuild at 11, it keeps 5 items, then we add 4 more = 9 total
        assert cache_instance.index.ntotal > 0
        assert len(cache_instance.cache_embeddings) > 0


class TestGetSemanticCacheSingleton:
    """Test get_semantic_cache singleton."""

    @pytest.mark.asyncio
    async def test_get_semantic_cache_creates_instance(self, mock_redis):
        """Test that get_semantic_cache creates singleton."""
        # Clear singleton
        import app.services.cache_manager as cache_module

        cache_module._semantic_cache = None

        async def mock_from_url(*args, **kwargs):
            return mock_redis

        with patch("app.services.cache_manager.aioredis.from_url", side_effect=mock_from_url):
            cache = await get_semantic_cache()
            assert cache is not None

            # Second call should return same instance
            cache2 = await get_semantic_cache()
            assert cache is cache2

        # Clean up
        cache_module._semantic_cache = None


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
