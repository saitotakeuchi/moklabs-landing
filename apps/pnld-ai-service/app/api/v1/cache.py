"""Cache monitoring and management endpoints."""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Optional
from app.services.cache_manager import get_semantic_cache
from app.config import settings
from app.utils.logging import get_logger

logger = get_logger(__name__)

router = APIRouter()


class CacheStats(BaseModel):
    """Cache statistics model."""

    enabled: bool
    total_hits: int = 0
    total_misses: int = 0
    hit_rate: float = 0.0
    exact_hits: int = 0
    semantic_hits: int = 0
    index_size: int = 0
    stats_by_type: Dict[str, int] = {}


class CacheInvalidateRequest(BaseModel):
    """Request model for cache invalidation."""

    pattern: str


@router.get("/stats", response_model=CacheStats)
async def get_cache_stats():
    """
    Get cache statistics and performance metrics.

    Returns:
        CacheStats: Current cache statistics including hit/miss rates
    """
    if not settings.USE_CACHING:
        return CacheStats(enabled=False)

    try:
        cache = await get_semantic_cache()
        stats_data = await cache.get_stats()

        total_hits = stats_data.get("total_hits", 0)
        total_misses = stats_data.get("total_misses", 0)
        total_requests = total_hits + total_misses

        hit_rate = (total_hits / total_requests * 100) if total_requests > 0 else 0.0

        return CacheStats(
            enabled=True,
            total_hits=total_hits,
            total_misses=total_misses,
            hit_rate=round(hit_rate, 2),
            exact_hits=stats_data.get("hits_exact", 0),
            semantic_hits=stats_data.get("hits_semantic", 0),
            index_size=cache.index.ntotal,
            stats_by_type={
                k: v for k, v in stats_data.items() if k.startswith(("hits_", "misses_"))
            },
        )

    except Exception as e:
        logger.error(f"Failed to get cache stats: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve cache statistics")


@router.post("/invalidate")
async def invalidate_cache(request: CacheInvalidateRequest):
    """
    Invalidate cache entries matching a pattern.

    Args:
        request: CacheInvalidateRequest with pattern to match

    Returns:
        Success message

    Example patterns:
    - "search_results:*" - Invalidate all search result caches
    - "rag_response:*" - Invalidate all RAG response caches
    - "*edital_123*" - Invalidate all caches related to edital_123
    """
    if not settings.USE_CACHING:
        raise HTTPException(status_code=400, detail="Caching is not enabled")

    try:
        cache = await get_semantic_cache()
        await cache.invalidate_pattern(request.pattern)

        return {
            "success": True,
            "message": f"Cache entries matching '{request.pattern}' have been invalidated",
        }

    except Exception as e:
        logger.error(f"Failed to invalidate cache: {e}")
        raise HTTPException(status_code=500, detail="Failed to invalidate cache")


@router.post("/reset-stats")
async def reset_cache_stats():
    """
    Reset cache statistics counters.

    Returns:
        Success message
    """
    if not settings.USE_CACHING:
        raise HTTPException(status_code=400, detail="Caching is not enabled")

    try:
        cache = await get_semantic_cache()
        await cache.reset_stats()

        return {
            "success": True,
            "message": "Cache statistics have been reset",
        }

    except Exception as e:
        logger.error(f"Failed to reset cache stats: {e}")
        raise HTTPException(status_code=500, detail="Failed to reset cache statistics")


@router.get("/config")
async def get_cache_config():
    """
    Get current cache configuration.

    Returns:
        Dictionary with cache configuration settings
    """
    return {
        "enabled": settings.USE_CACHING,
        "redis_url": settings.REDIS_URL,
        "similarity_threshold": settings.CACHE_SIMILARITY_THRESHOLD,
        "max_index_size": settings.CACHE_MAX_INDEX_SIZE,
        "ttl": {
            "embedding": settings.CACHE_EMBEDDING_TTL,
            "search_results": settings.CACHE_SEARCH_RESULTS_TTL,
            "llm_response": settings.CACHE_LLM_RESPONSE_TTL,
            "processed_query": settings.CACHE_PROCESSED_QUERY_TTL,
            "rag_response": settings.CACHE_RAG_RESPONSE_TTL,
        },
    }
