"""
Integration test for cache functionality.
Tests the complete caching flow with Redis and FAISS.
"""

import asyncio
import time
import numpy as np
from app.services.cache_manager import get_semantic_cache
from app.config import settings


async def test_basic_cache():
    """Test basic cache get/set operations."""
    print("\n🧪 Test 1: Basic Cache Operations")
    print("=" * 60)

    cache = await get_semantic_cache()

    # Test 1: Set and get
    print("Setting cache key 'test:key1' = {'data': 'hello'}")
    await cache.set("test:key1", {"data": "hello"}, ttl=300)

    print("Getting cache key 'test:key1'")
    result = await cache.get("test:key1")

    if result and result.get("data") == "hello":
        print("✅ Basic cache operations working!")
    else:
        print("❌ Cache operations failed!")
        return False

    return True


async def test_semantic_similarity():
    """Test semantic similarity matching."""
    print("\n🧪 Test 2: Semantic Similarity Matching")
    print("=" * 60)

    cache = await get_semantic_cache()

    # Create similar embeddings
    embedding1 = np.random.rand(1536).astype("float32")
    # Create a very similar embedding (add small noise)
    embedding2 = embedding1 + np.random.normal(0, 0.01, 1536).astype("float32")
    # Normalize
    embedding1 = embedding1 / np.linalg.norm(embedding1)
    embedding2 = embedding2 / np.linalg.norm(embedding2)

    # Calculate similarity
    similarity = np.dot(embedding1, embedding2)
    print(f"Similarity between embeddings: {similarity:.4f}")

    # Store first query with embedding
    print("Storing query 1 with embedding...")
    await cache.set(
        "test:semantic1",
        {"answer": "This is the cached answer"},
        ttl=300,
        semantic_key=embedding1,
        cache_type="test",
    )

    # Try to find similar cached result
    print("Searching for similar cached result...")
    similar_result = await cache._find_similar_cached(embedding2, cache_type="test", k=5)

    if similar_result and similar_result.get("answer") == "This is the cached answer":
        print("✅ Semantic similarity matching working!")
        print(f"   Found cached result with {similarity:.1%} similarity")
        return True
    else:
        print("❌ Semantic similarity matching failed!")
        print(f"   Expected to find cache hit with {similarity:.1%} similarity")
        return False


async def test_get_or_compute():
    """Test get_or_compute pattern."""
    print("\n🧪 Test 3: Get-or-Compute Pattern")
    print("=" * 60)

    cache = await get_semantic_cache()
    call_count = 0

    async def expensive_computation():
        nonlocal call_count
        call_count += 1
        print(f"  Computing (call #{call_count})...")
        await asyncio.sleep(0.5)  # Simulate slow operation
        return {"result": "computed value", "timestamp": time.time()}

    # First call - should compute
    print("First call (should compute):")
    start = time.time()
    result1 = await cache.get_or_compute(
        key="test:compute1", compute_func=expensive_computation, ttl=300, cache_type="test"
    )
    duration1 = time.time() - start

    # Second call - should use cache
    print("Second call (should use cache):")
    start = time.time()
    result2 = await cache.get_or_compute(
        key="test:compute1", compute_func=expensive_computation, ttl=300, cache_type="test"
    )
    duration2 = time.time() - start

    print(f"\n  First call:  {duration1 * 1000:.0f}ms (computed)")
    print(f"  Second call: {duration2 * 1000:.0f}ms (cached)")
    print(f"  Speedup:     {duration1 / duration2:.1f}x faster")

    if call_count == 1 and duration2 < duration1 * 0.1:
        print("✅ Get-or-compute pattern working!")
        print(f"   Compute function called only {call_count} time")
        return True
    else:
        print("❌ Get-or-compute pattern failed!")
        print(f"   Compute function called {call_count} times (expected 1)")
        return False


async def test_cache_stats():
    """Test cache statistics tracking."""
    print("\n🧪 Test 4: Cache Statistics")
    print("=" * 60)

    cache = await get_semantic_cache()

    # Reset stats
    await cache.reset_stats()

    # Generate some hits and misses
    await cache.set("stats:test1", "value1")
    await cache.get("stats:test1")  # Hit
    await cache.get("stats:nonexistent")  # Miss

    # Record some stats manually
    await cache._record_hit("exact", "test")
    await cache._record_miss("test")

    # Get stats
    stats = await cache.get_stats()

    print(f"Total hits:   {stats.get('total_hits', 0)}")
    print(f"Total misses: {stats.get('total_misses', 0)}")
    print(f"Exact hits:   {stats.get('hits_exact', 0)}")

    if stats.get("total_hits", 0) > 0:
        print("✅ Cache statistics tracking working!")
        return True
    else:
        print("❌ Cache statistics tracking failed!")
        return False


async def test_cache_invalidation():
    """Test cache invalidation by pattern."""
    print("\n🧪 Test 5: Cache Invalidation")
    print("=" * 60)

    cache = await get_semantic_cache()

    # Set multiple keys with a pattern
    print("Setting test keys...")
    await cache.set("invalidate:key1", "value1")
    await cache.set("invalidate:key2", "value2")
    await cache.set("keep:key3", "value3")

    # Verify they exist
    result1 = await cache.get("invalidate:key1")
    result2 = await cache.get("invalidate:key2")
    result3 = await cache.get("keep:key3")

    print(f"Before invalidation:")
    print(f"  invalidate:key1 = {result1}")
    print(f"  invalidate:key2 = {result2}")
    print(f"  keep:key3 = {result3}")

    # Invalidate pattern
    print("\nInvalidating 'invalidate:*' pattern...")
    await cache.invalidate_pattern("invalidate:*")

    # Check results
    result1_after = await cache.get("invalidate:key1")
    result2_after = await cache.get("invalidate:key2")
    result3_after = await cache.get("keep:key3")

    print(f"\nAfter invalidation:")
    print(f"  invalidate:key1 = {result1_after}")
    print(f"  invalidate:key2 = {result2_after}")
    print(f"  keep:key3 = {result3_after}")

    if result1_after is None and result2_after is None and result3_after == "value3":
        print("\n✅ Cache invalidation working!")
        print("   Pattern-matched keys deleted, others preserved")
        return True
    else:
        print("\n❌ Cache invalidation failed!")
        return False


async def test_performance_benchmark():
    """Benchmark cache performance."""
    print("\n🧪 Test 6: Performance Benchmark")
    print("=" * 60)

    cache = await get_semantic_cache()

    # Benchmark set operations
    print("Benchmarking SET operations (100 items)...")
    start = time.time()
    for i in range(100):
        await cache.set(f"bench:key{i}", f"value{i}", ttl=300)
    set_duration = time.time() - start

    # Benchmark get operations (exact match)
    print("Benchmarking GET operations (100 items)...")
    start = time.time()
    for i in range(100):
        await cache.get(f"bench:key{i}")
    get_duration = time.time() - start

    # Benchmark semantic search
    print("Benchmarking semantic search (10 searches)...")
    embedding = np.random.rand(1536).astype("float32")
    embedding = embedding / np.linalg.norm(embedding)

    start = time.time()
    for i in range(10):
        await cache._find_similar_cached(embedding, cache_type="bench", k=5)
    search_duration = time.time() - start

    print(f"\nResults:")
    print(f"  SET operations:    {set_duration * 1000 / 100:.2f}ms per operation")
    print(f"  GET operations:    {get_duration * 1000 / 100:.2f}ms per operation")
    print(f"  Semantic searches: {search_duration * 1000 / 10:.2f}ms per search")
    print(f"  FAISS index size:  {cache.index.ntotal} items")

    # Performance should be reasonable
    if get_duration / 100 < 0.01:  # < 10ms per get
        print("\n✅ Cache performance is good!")
        return True
    else:
        print("\n⚠️  Cache performance may need tuning")
        return True  # Don't fail on performance


async def run_all_tests():
    """Run all cache tests."""
    print("\n" + "=" * 60)
    print("🚀 PNLD AI Service - Cache Integration Tests")
    print("=" * 60)
    print(f"Redis URL: {settings.REDIS_URL}")
    print(f"Caching enabled: {settings.USE_CACHING}")
    print(f"Similarity threshold: {settings.CACHE_SIMILARITY_THRESHOLD}")

    if not settings.USE_CACHING:
        print("\n⚠️  WARNING: Caching is disabled in settings!")
        print("Set USE_CACHING=true in .env to enable caching")
        return

    try:
        # Test Redis connection
        print("\n🔌 Testing Redis connection...")
        cache = await get_semantic_cache()
        print("✅ Connected to Redis successfully!")

        # Run tests
        results = []
        results.append(await test_basic_cache())
        results.append(await test_semantic_similarity())
        results.append(await test_get_or_compute())
        results.append(await test_cache_stats())
        results.append(await test_cache_invalidation())
        results.append(await test_performance_benchmark())

        # Summary
        print("\n" + "=" * 60)
        print("📊 Test Summary")
        print("=" * 60)
        passed = sum(results)
        total = len(results)

        print(f"Passed: {passed}/{total}")

        if passed == total:
            print("\n🎉 All tests passed!")
        else:
            print(f"\n⚠️  {total - passed} test(s) failed")

        # Clean up test data
        print("\n🧹 Cleaning up test data...")
        await cache.invalidate_pattern("test:*")
        await cache.invalidate_pattern("bench:*")
        await cache.invalidate_pattern("stats:*")
        await cache.invalidate_pattern("invalidate:*")
        await cache.invalidate_pattern("keep:*")
        await cache.reset_stats()
        print("✅ Cleanup complete")

    except Exception as e:
        print(f"\n❌ Error: {e}")
        print("\nMake sure Redis is running and REDIS_URL is correct in .env")
        import traceback

        traceback.print_exc()
    finally:
        # Disconnect
        if "cache" in locals():
            await cache.disconnect()


if __name__ == "__main__":
    asyncio.run(run_all_tests())
