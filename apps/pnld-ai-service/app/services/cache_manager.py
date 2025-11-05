"""Smart caching layer with semantic similarity matching."""

import hashlib
import pickle
import asyncio
from typing import Optional, Dict, Any, List, Callable
from datetime import datetime, timedelta
import numpy as np
import faiss
from redis import asyncio as aioredis
from app.utils.logging import get_logger

logger = get_logger(__name__)


class SemanticCache:
    """
    Multi-layer caching with semantic similarity matching.

    Features:
    - Redis for persistent caching
    - FAISS for semantic similarity search
    - TTL-based expiration
    - Hit/miss tracking for monitoring
    - Automatic cache invalidation
    """

    def __init__(
        self,
        redis_url: str = "redis://localhost:6379",
        similarity_threshold: float = 0.95,
        embedding_dim: int = 1536,
        max_index_size: int = 10000,
        ttl_config: Optional[Dict[str, int]] = None,
    ):
        """
        Initialize semantic cache.

        Args:
            redis_url: Redis connection URL
            similarity_threshold: Minimum similarity for cache hits (0.95 = 95%)
            embedding_dim: Dimension of embeddings (OpenAI text-embedding-3-small = 1536)
            max_index_size: Maximum number of items in FAISS index
            ttl_config: Optional TTL configuration dictionary
        """
        self.redis_url = redis_url
        self.redis: Optional[aioredis.Redis] = None
        self.similarity_threshold = similarity_threshold
        self.max_index_size = max_index_size

        # FAISS index for semantic similarity (Inner Product = cosine after normalization)
        self.index = faiss.IndexFlatIP(embedding_dim)
        self.embedding_dim = embedding_dim

        # Maps FAISS index position to Redis cache key
        self.query_cache: Dict[int, str] = {}
        self.cache_embeddings: List[np.ndarray] = []

        # Cache TTL configuration (in seconds)
        if ttl_config is None:
            from app.config import settings

            self.ttl_config = {
                "embedding": settings.CACHE_EMBEDDING_TTL,
                "search_results": settings.CACHE_SEARCH_RESULTS_TTL,
                "llm_response": settings.CACHE_LLM_RESPONSE_TTL,
                "processed_query": settings.CACHE_PROCESSED_QUERY_TTL,
                "rag_response": settings.CACHE_RAG_RESPONSE_TTL,
            }
        else:
            self.ttl_config = ttl_config

        logger.info(
            "SemanticCache initialized",
            extra={
                "similarity_threshold": similarity_threshold,
                "embedding_dim": embedding_dim,
                "max_index_size": max_index_size,
            },
        )

    async def connect(self):
        """Establish Redis connection."""
        if self.redis is None:
            try:
                self.redis = await aioredis.from_url(
                    self.redis_url,
                    encoding="utf-8",
                    decode_responses=False,  # We'll handle bytes for pickle
                )
                await self.redis.ping()
                logger.info("Redis connection established")
            except Exception as e:
                logger.error(f"Failed to connect to Redis: {e}")
                raise

    async def disconnect(self):
        """Close Redis connection."""
        if self.redis:
            await self.redis.close()
            logger.info("Redis connection closed")

    async def get_or_compute(
        self,
        key: str,
        compute_func: Callable,
        ttl: Optional[int] = None,
        semantic_key: Optional[np.ndarray] = None,
        cache_type: str = "default",
    ) -> Any:
        """
        Get from cache or compute and store.

        Args:
            key: Cache key (deterministic identifier)
            compute_func: Async function to compute value on cache miss
            ttl: Time-to-live in seconds (None = use default for cache_type)
            semantic_key: Embedding for semantic similarity matching
            cache_type: Type of cache for TTL lookup

        Returns:
            Cached or computed value
        """
        if not self.redis:
            await self.connect()

        # Try exact match first (fastest)
        cached = await self.get(key)
        if cached is not None:
            await self._record_hit("exact", cache_type)
            logger.debug(f"Cache hit (exact): {key[:50]}...")
            return cached

        # Try semantic similarity match if embedding provided
        if semantic_key is not None:
            similar_result = await self._find_similar_cached(semantic_key, cache_type=cache_type)
            if similar_result is not None:
                await self._record_hit("semantic", cache_type)
                logger.debug(f"Cache hit (semantic): {key[:50]}...")
                return similar_result

        # Cache miss - compute result
        await self._record_miss(cache_type)
        logger.debug(f"Cache miss: {key[:50]}...")

        result = await compute_func()

        # Store in cache
        await self.set(key, result, ttl, semantic_key, cache_type)

        return result

    async def get(self, key: str) -> Optional[Any]:
        """
        Get exact match from cache.

        Args:
            key: Cache key

        Returns:
            Cached value or None
        """
        try:
            cache_key = f"rag:{key}"
            cached = await self.redis.get(cache_key)
            if cached:
                return pickle.loads(cached)
        except Exception as e:
            logger.error(f"Cache get error: {e}")
        return None

    async def set(
        self,
        key: str,
        value: Any,
        ttl: Optional[int] = None,
        semantic_key: Optional[np.ndarray] = None,
        cache_type: str = "default",
    ):
        """
        Store in cache with optional semantic index.

        Args:
            key: Cache key
            value: Value to cache
            ttl: Time-to-live in seconds
            semantic_key: Embedding for semantic matching
            cache_type: Type of cache for TTL lookup
        """
        try:
            # Determine TTL
            if ttl is None:
                ttl = self.ttl_config.get(cache_type, 3600)

            # Serialize and store in Redis
            serialized = pickle.dumps(value)
            cache_key = f"rag:{key}"

            await self.redis.setex(cache_key, ttl, serialized)

            # Add to semantic index if embedding provided
            if semantic_key is not None:
                self._add_to_semantic_index(cache_key, semantic_key)

            logger.debug(f"Cache set: {key[:50]}... (TTL: {ttl}s)")

        except Exception as e:
            logger.error(f"Cache set error: {e}")

    async def _find_similar_cached(
        self,
        query_embedding: np.ndarray,
        cache_type: str,
        k: int = 5,
    ) -> Optional[Any]:
        """
        Find semantically similar cached results using FAISS.

        Args:
            query_embedding: Query embedding vector
            cache_type: Type of cache to search in
            k: Number of nearest neighbors to check

        Returns:
            Cached value if similar enough, else None
        """
        if self.index.ntotal == 0:
            return None

        try:
            # Normalize and reshape query embedding
            query_embedding = query_embedding.reshape(1, -1).astype("float32")
            faiss.normalize_L2(query_embedding)

            # Search FAISS index for k nearest neighbors
            k = min(k, self.index.ntotal)  # Don't search for more than we have
            distances, indices = self.index.search(query_embedding, k)

            # Check if any result is similar enough
            for dist, idx in zip(distances[0], indices[0]):
                if dist >= self.similarity_threshold:
                    cache_key = self.query_cache.get(int(idx))
                    if cache_key and cache_key.startswith(f"rag:{cache_type}"):
                        # Check if still exists in Redis (not expired)
                        cached = await self.redis.get(cache_key)
                        if cached:
                            return pickle.loads(cached)

        except Exception as e:
            logger.error(f"Semantic search error: {e}")

        return None

    def _add_to_semantic_index(self, cache_key: str, embedding: np.ndarray):
        """
        Add embedding to FAISS index for semantic matching.

        Args:
            cache_key: Redis cache key
            embedding: Embedding vector
        """
        try:
            # Normalize and reshape embedding
            embedding = embedding.reshape(1, -1).astype("float32")
            faiss.normalize_L2(embedding)

            # Add to index
            idx = self.index.ntotal
            self.index.add(embedding)
            self.query_cache[idx] = cache_key
            self.cache_embeddings.append(embedding)

            # Limit index size to prevent memory issues
            if self.index.ntotal > self.max_index_size:
                self._rebuild_index_limited()

        except Exception as e:
            logger.error(f"Failed to add to semantic index: {e}")

    def _rebuild_index_limited(self, keep_items: int = 5000):
        """
        Rebuild index keeping only most recent items.

        Args:
            keep_items: Number of most recent items to keep
        """
        try:
            # Keep only the last keep_items
            recent_embeddings = self.cache_embeddings[-keep_items:]
            recent_cache = {
                i: self.query_cache[i + self.index.ntotal - keep_items] for i in range(keep_items)
            }

            # Reset index
            self.index = faiss.IndexFlatIP(self.embedding_dim)
            if recent_embeddings:
                embeddings_array = np.vstack(recent_embeddings)
                self.index.add(embeddings_array)

            self.query_cache = recent_cache
            self.cache_embeddings = recent_embeddings

            logger.info(f"FAISS index rebuilt with {keep_items} items")

        except Exception as e:
            logger.error(f"Failed to rebuild index: {e}")

    async def invalidate_pattern(self, pattern: str):
        """
        Invalidate all cache keys matching pattern.

        Args:
            pattern: Pattern to match (e.g., "search_results:*")
        """
        try:
            cursor = 0
            deleted_count = 0

            while True:
                cursor, keys = await self.redis.scan(cursor, match=f"rag:{pattern}*", count=100)

                if keys:
                    await self.redis.delete(*keys)
                    deleted_count += len(keys)

                if cursor == 0:
                    break

            logger.info(f"Invalidated {deleted_count} cache keys matching '{pattern}'")

        except Exception as e:
            logger.error(f"Cache invalidation error: {e}")

    async def get_stats(self) -> Dict[str, int]:
        """
        Get cache statistics.

        Returns:
            Dictionary with hit/miss counts by type
        """
        try:
            stats_data = await self.redis.hgetall("rag:stats")
            return {k.decode(): int(v.decode()) for k, v in stats_data.items()}
        except Exception as e:
            logger.error(f"Failed to get stats: {e}")
            return {}

    async def reset_stats(self):
        """Reset cache statistics."""
        try:
            await self.redis.delete("rag:stats")
            logger.info("Cache statistics reset")
        except Exception as e:
            logger.error(f"Failed to reset stats: {e}")

    async def _record_hit(self, hit_type: str, cache_type: str):
        """
        Record cache hit for monitoring.

        Args:
            hit_type: 'exact' or 'semantic'
            cache_type: Type of cache
        """
        try:
            await self.redis.hincrby("rag:stats", f"hits_{hit_type}", 1)
            await self.redis.hincrby("rag:stats", f"hits_{cache_type}", 1)
            await self.redis.hincrby("rag:stats", "total_hits", 1)
        except Exception as e:
            logger.error(f"Failed to record hit: {e}")

    async def _record_miss(self, cache_type: str):
        """
        Record cache miss for monitoring.

        Args:
            cache_type: Type of cache
        """
        try:
            await self.redis.hincrby("rag:stats", "total_misses", 1)
            await self.redis.hincrby("rag:stats", f"misses_{cache_type}", 1)
        except Exception as e:
            logger.error(f"Failed to record miss: {e}")

    def generate_cache_key(self, prefix: str, *args: Any, **kwargs: Any) -> str:
        """
        Generate deterministic cache key from arguments.

        Args:
            prefix: Cache key prefix (cache type)
            *args: Positional arguments
            **kwargs: Keyword arguments

        Returns:
            Hashed cache key
        """
        # Create a deterministic string from all arguments
        key_parts = [prefix]
        key_parts.extend(str(arg) for arg in args)
        key_parts.extend(f"{k}={v}" for k, v in sorted(kwargs.items()))

        key_string = ":".join(key_parts)
        key_hash = hashlib.md5(key_string.encode()).hexdigest()

        return f"{prefix}:{key_hash}"


# Global singleton instance
_semantic_cache: Optional[SemanticCache] = None


async def get_semantic_cache(redis_url: Optional[str] = None) -> SemanticCache:
    """
    Get or create the SemanticCache singleton.

    Args:
        redis_url: Optional Redis URL (uses default if not provided)

    Returns:
        SemanticCache instance
    """
    global _semantic_cache

    if _semantic_cache is None:
        from app.config import settings

        url = redis_url or settings.REDIS_URL
        _semantic_cache = SemanticCache(
            redis_url=url,
            similarity_threshold=settings.CACHE_SIMILARITY_THRESHOLD,
            embedding_dim=1536,  # OpenAI text-embedding-3-small
            max_index_size=settings.CACHE_MAX_INDEX_SIZE,
        )
        await _semantic_cache.connect()

    return _semantic_cache
