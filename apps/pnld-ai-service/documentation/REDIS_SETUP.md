# Redis Setup Guide

This service uses Redis for smart caching with semantic similarity matching to reduce latency and API costs.

## Quick Start (Recommended for Development)

### Option 1: Docker Compose (Easiest)

```bash
# Start Redis
docker-compose up -d redis

# Verify it's running
docker-compose ps

# View logs
docker-compose logs -f redis

# Stop Redis
docker-compose down
```

### Option 2: Docker Run

```bash
# Run Redis container
docker run -d \
  --name pnld-redis \
  -p 6379:6379 \
  -v pnld-redis-data:/data \
  redis:7-alpine \
  redis-server --appendonly yes

# Verify connection
docker exec -it pnld-redis redis-cli ping
# Should return: PONG

# View stats
docker exec -it pnld-redis redis-cli INFO stats
```

### Option 3: Native Installation

#### Windows (WSL2)
```bash
wsl
sudo apt update
sudo apt install redis-server
sudo service redis-server start
redis-cli ping  # Should return PONG
```

#### macOS
```bash
brew install redis
brew services start redis
redis-cli ping  # Should return PONG
```

#### Linux
```bash
sudo apt update
sudo apt install redis-server
sudo systemctl start redis
sudo systemctl enable redis
redis-cli ping  # Should return PONG
```

## Configuration

1. **Copy the example environment file:**
   ```bash
   cp .env.example .env
   ```

2. **Update Redis URL in `.env`:**
   ```bash
   # For local Docker/native Redis
   REDIS_URL=redis://localhost:6379
   
   # For production (Upstash/Fly.io)
   # REDIS_URL=redis://default:password@your-redis-host:6379
   ```

3. **Configure caching settings (optional):**
   ```bash
   USE_CACHING=true
   CACHE_SIMILARITY_THRESHOLD=0.95  # 95% similarity for semantic cache hits
   CACHE_MAX_INDEX_SIZE=10000       # Max items in FAISS index
   ```

## Production Setup

### Fly.io with Upstash Redis

1. **Create Redis database on Fly.io:**
   ```bash
   flyctl redis create
   ```

2. **Set the connection URL as a secret:**
   ```bash
   flyctl secrets set REDIS_URL="redis://default:password@hostname:6379"
   ```

### Upstash (Serverless Redis)

1. Visit https://upstash.com and create a free account
2. Create a new Redis database (choose the region closest to your app)
3. Copy the connection URL
4. Add to your `.env` file or set as Fly.io secret

### AWS ElastiCache / GCP Memorystore / Azure Cache

For enterprise deployments, use managed Redis services:
- **AWS ElastiCache:** https://aws.amazon.com/elasticache/
- **Google Cloud Memorystore:** https://cloud.google.com/memorystore
- **Azure Cache for Redis:** https://azure.microsoft.com/en-us/services/cache/

## Verifying Redis Connection

### Using redis-cli

```bash
# Connect to Redis
redis-cli

# Test basic commands
127.0.0.1:6379> PING
PONG

127.0.0.1:6379> SET test "hello"
OK

127.0.0.1:6379> GET test
"hello"

127.0.0.1:6379> EXIT
```

### Using the Application

1. **Start the PNLD AI Service:**
   ```bash
   python -m uvicorn app.main:app --reload
   ```

2. **Check cache configuration:**
   ```bash
   curl http://localhost:8000/api/v1/cache/config
   ```

3. **View cache statistics:**
   ```bash
   curl http://localhost:8000/api/v1/cache/stats
   ```

## Cache Management

### View Cache Stats
```bash
curl http://localhost:8000/api/v1/cache/stats
```

Response:
```json
{
  "enabled": true,
  "total_hits": 150,
  "total_misses": 50,
  "hit_rate": 75.0,
  "exact_hits": 100,
  "semantic_hits": 50,
  "index_size": 1234
}
```

### Invalidate Cache by Pattern
```bash
curl -X POST http://localhost:8000/api/v1/cache/invalidate \
  -H "Content-Type: application/json" \
  -d '{"pattern": "search_results:*"}'
```

### Reset Statistics
```bash
curl -X POST http://localhost:8000/api/v1/cache/reset-stats
```

## Monitoring Redis

### View Memory Usage
```bash
docker exec -it pnld-redis redis-cli INFO memory
```

### View Connected Clients
```bash
docker exec -it pnld-redis redis-cli CLIENT LIST
```

### Monitor Commands in Real-time
```bash
docker exec -it pnld-redis redis-cli MONITOR
```

### View All Cache Keys
```bash
docker exec -it pnld-redis redis-cli KEYS "rag:*"
```

## Troubleshooting

### Connection Refused
```bash
# Check if Redis is running
docker ps | grep redis

# Or for native installation
sudo systemctl status redis  # Linux
brew services list | grep redis  # macOS
```

### Out of Memory
```bash
# Check memory usage
docker exec -it pnld-redis redis-cli INFO memory

# Clear all cache (use with caution!)
docker exec -it pnld-redis redis-cli FLUSHDB
```

### Cache Not Working

1. **Check Redis connection:**
   ```bash
   docker exec -it pnld-redis redis-cli PING
   ```

2. **Verify configuration in `.env`:**
   ```bash
   USE_CACHING=true
   REDIS_URL=redis://localhost:6379
   ```

3. **Check application logs** for Redis connection errors

4. **Test cache manually:**
   ```python
   from app.services.cache_manager import get_semantic_cache
   
   cache = await get_semantic_cache()
   await cache.set("test_key", {"data": "test"})
   result = await cache.get("test_key")
   print(result)  # Should print: {'data': 'test'}
   ```

## Disabling Cache

To run without Redis (caching disabled):

1. **Set in `.env`:**
   ```bash
   USE_CACHING=false
   ```

2. **Or comment out Redis URL:**
   ```bash
   # REDIS_URL=redis://localhost:6379
   ```

The application will gracefully fall back to non-cached operation.

## Performance Tuning

### Memory Limits
```bash
# Set max memory (recommended: 512MB for dev, 2GB+ for production)
docker run -d \
  --name pnld-redis \
  -p 6379:6379 \
  redis:7-alpine \
  redis-server --maxmemory 512mb --maxmemory-policy allkeys-lru
```

### Persistence
```bash
# Enable AOF persistence (recommended for production)
redis-server --appendonly yes

# Or configure in docker-compose.yml (already done)
```

### Eviction Policy
```bash
# LRU (Least Recently Used) - recommended for caching
--maxmemory-policy allkeys-lru

# Other options:
# volatile-lru: Remove expired keys first
# allkeys-random: Remove random keys
# noeviction: Return errors when memory full
```

## Resources

- **Redis Documentation:** https://redis.io/documentation
- **Redis Commands:** https://redis.io/commands
- **Docker Redis Image:** https://hub.docker.com/_/redis
- **Upstash Redis:** https://upstash.com/docs/redis
- **Fly.io Redis:** https://fly.io/docs/reference/redis/
