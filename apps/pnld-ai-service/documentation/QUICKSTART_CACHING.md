# Quick Start: Testing MOK-60 Caching

This guide will help you test the smart caching layer we just built.

## Step 1: Install Redis (Choose One Option)

### Option A: Upstash (Fastest - 2 minutes)

**Perfect for immediate testing, no installation needed!**

1. Go to https://upstash.com
2. Sign up (free tier available)
3. Click "Create Database"
4. Choose region closest to you
5. Copy the **Redis URL** (looks like: `redis://default:password@host.upstash.io:6379`)

### Option B: Docker Desktop (Best for development)

1. Install Docker Desktop: https://www.docker.com/products/docker-desktop/
2. Enable WSL2 integration
3. Restart Docker Desktop
4. Run in terminal:
   ```bash
   docker run -d --name pnld-redis -p 6379:6379 redis:7-alpine
   ```

### Option C: Memurai (Native Windows)

1. Download from https://www.memurai.com/get-memurai
2. Install Memurai Developer Edition
3. It runs as a Windows Service on port 6379

**For detailed instructions, see `WINDOWS_REDIS_SETUP.md`**

## Step 2: Configure Your .env File

```bash
cd apps/pnld-ai-service

# Copy example if you haven't already
cp .env.example .env

# Edit .env and add:
```

**For local Redis (Docker or Memurai):**
```bash
REDIS_URL=redis://localhost:6379
USE_CACHING=true
CACHE_SIMILARITY_THRESHOLD=0.95
```

**For Upstash:**
```bash
REDIS_URL=redis://default:YOUR_PASSWORD@YOUR_HOST.upstash.io:6379
USE_CACHING=true
CACHE_SIMILARITY_THRESHOLD=0.95
```

## Step 3: Test the Cache

Run the integration test script:

```bash
cd apps/pnld-ai-service
python test_cache_integration.py
```

You should see output like:

```
🚀 PNLD AI Service - Cache Integration Tests
============================================================
Redis URL: redis://localhost:6379
Caching enabled: True
Similarity threshold: 0.95

🔌 Testing Redis connection...
✅ Connected to Redis successfully!

🧪 Test 1: Basic Cache Operations
============================================================
✅ Basic cache operations working!

🧪 Test 2: Semantic Similarity Matching
============================================================
Similarity between embeddings: 0.9987
✅ Semantic similarity matching working!
   Found cached result with 99.9% similarity

🧪 Test 3: Get-or-Compute Pattern
============================================================
  First call:  501ms (computed)
  Second call: 2ms (cached)
  Speedup:     250.5x faster
✅ Get-or-compute pattern working!

🧪 Test 4: Cache Statistics
============================================================
✅ Cache statistics tracking working!

🧪 Test 5: Cache Invalidation
============================================================
✅ Cache invalidation working!

🧪 Test 6: Performance Benchmark
============================================================
  SET operations:    1.23ms per operation
  GET operations:    0.45ms per operation
  Semantic searches: 2.15ms per search
  FAISS index size:  100 items
✅ Cache performance is good!

📊 Test Summary
============================================================
Passed: 6/6

🎉 All tests passed!
```

## Step 4: Test with the API

Start the service:

```bash
python -m uvicorn app.main:app --reload
```

### Check Cache Configuration

```bash
curl http://localhost:8000/api/v1/cache/config
```

Expected response:
```json
{
  "enabled": true,
  "redis_url": "redis://localhost:6379",
  "similarity_threshold": 0.95,
  "max_index_size": 10000,
  "ttl": {
    "embedding": 86400,
    "search_results": 3600,
    "llm_response": 1800,
    "processed_query": 7200,
    "rag_response": 1800
  }
}
```

### Check Cache Statistics

```bash
curl http://localhost:8000/api/v1/cache/stats
```

Expected response:
```json
{
  "enabled": true,
  "total_hits": 0,
  "total_misses": 0,
  "hit_rate": 0.0,
  "exact_hits": 0,
  "semantic_hits": 0,
  "index_size": 0,
  "stats_by_type": {}
}
```

## Step 5: Test RAG with Caching

### Test Chat Endpoint (Streaming)

Create a test file `test_chat_with_cache.py`:

```python
import asyncio
import httpx
import time

async def test_chat_with_cache():
    """Test chat endpoint with caching."""
    
    url = "http://localhost:8000/api/v1/chat/stream"
    
    # First query
    print("First query (should be slow - computing)...")
    start = time.time()
    
    async with httpx.AsyncClient() as client:
        async with client.stream(
            "POST",
            url,
            json={
                "message": "Qual o prazo de inscrição do PNLD?",
                "conversation_history": []
            },
            timeout=30.0
        ) as response:
            async for line in response.aiter_lines():
                if line.startswith("data: "):
                    pass  # Process SSE events
    
    duration1 = time.time() - start
    print(f"Duration: {duration1:.2f}s\n")
    
    # Similar query (should hit cache)
    print("Similar query (should be fast - cached)...")
    start = time.time()
    
    async with httpx.AsyncClient() as client:
        async with client.stream(
            "POST",
            url,
            json={
                "message": "Quando posso me inscrever no PNLD?",
                "conversation_history": []
            },
            timeout=30.0
        ) as response:
            async for line in response.aiter_lines():
                if line.startswith("data: "):
                    pass
    
    duration2 = time.time() - start
    print(f"Duration: {duration2:.2f}s\n")
    
    print(f"Speedup: {duration1/duration2:.1f}x faster!")
    
    # Check cache stats
    async with httpx.AsyncClient() as client:
        response = await client.get("http://localhost:8000/api/v1/cache/stats")
        stats = response.json()
        print(f"\nCache Stats:")
        print(f"  Total hits: {stats['total_hits']}")
        print(f"  Total misses: {stats['total_misses']}")
        print(f"  Hit rate: {stats['hit_rate']}%")
        print(f"  Semantic hits: {stats['semantic_hits']}")

if __name__ == "__main__":
    asyncio.run(test_chat_with_cache())
```

Run it:
```bash
python test_chat_with_cache.py
```

## Step 6: Monitor Cache in Real-Time

### Watch Cache Stats During Usage

```bash
# In one terminal, run the service
python -m uvicorn app.main:app --reload

# In another terminal, watch cache stats
watch -n 2 "curl -s http://localhost:8000/api/v1/cache/stats | python -m json.tool"
```

### View Redis Data Directly

**If using local Redis:**
```bash
# Connect to Redis CLI
docker exec -it pnld-redis redis-cli

# View all cache keys
KEYS rag:*

# Get cache stats
HGETALL rag:stats

# Check memory usage
INFO memory
```

**If using Upstash:**
- Go to your Upstash dashboard
- Click on your database
- Use the built-in data browser

## Troubleshooting

### "Connection refused" Error

**Problem:** Can't connect to Redis

**Solutions:**

1. **Check if Redis is running:**
   ```bash
   # For Docker
   docker ps | grep redis
   
   # For Memurai (PowerShell)
   Get-Service Memurai
   ```

2. **Verify REDIS_URL in .env:**
   ```bash
   cat .env | grep REDIS_URL
   ```

3. **Test connection manually:**
   ```python
   python -c "import redis; r=redis.from_url('redis://localhost:6379'); print(r.ping())"
   ```

### Cache Not Working

**Problem:** Cache stats show 0 hits

**Check:**

1. **Is caching enabled?**
   ```bash
   curl http://localhost:8000/api/v1/cache/config | grep enabled
   # Should show: "enabled": true
   ```

2. **Are queries similar enough?**
   - Semantic threshold is 0.95 (95% similarity)
   - Queries need to be very similar to match
   - Test with identical queries first

3. **Check application logs:**
   ```bash
   # Look for cache-related messages
   # Should see "Cache hit" or "Cache miss" in logs
   ```

### Tests Failing

**Problem:** `test_cache_integration.py` fails

**Common issues:**

1. **Redis not running:** Start Redis first
2. **Wrong REDIS_URL:** Check `.env` file
3. **Dependencies missing:** Run `pip install -r requirements.txt`
4. **USE_CACHING=false:** Set to `true` in `.env`

## Expected Performance

After the cache warms up (after ~10-20 queries), you should see:

- **Cache hit rate:** 30-50%
- **Cached query response:** 50-200ms (vs 2-3 seconds uncached)
- **Cost savings:** 30-50% on OpenAI API calls
- **Exact hits:** < 1ms lookup time
- **Semantic hits:** ~5-10ms lookup time

## Next Steps

Once caching is working:

1. **Test with real queries** through your chat interface
2. **Monitor cache hit rates** over time
3. **Tune similarity threshold** if needed (in `.env`)
4. **Adjust TTLs** based on your data update frequency
5. **Deploy to production** with cloud Redis (Upstash/Fly.io)

## Getting Help

If you run into issues:

1. Check `WINDOWS_REDIS_SETUP.md` for detailed installation
2. Review `REDIS_SETUP.md` for general Redis documentation
3. Run `python test_cache_integration.py` to diagnose issues
4. Check application logs for error messages

Happy caching! 🚀
