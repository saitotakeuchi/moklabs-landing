# Redis Setup for Windows

Since you're on Windows, here are the best options to get Redis running:

## Option 1: Using WSL2 + Docker (Recommended)

### Step 1: Install WSL2 and Docker Desktop

1. **Enable WSL2:**
   ```powershell
   # Run in PowerShell as Administrator
   wsl --install
   # Restart computer
   ```

2. **Install Docker Desktop:**
   - Download: https://www.docker.com/products/docker-desktop/
   - Install and enable WSL2 integration
   - Restart Docker Desktop

3. **Start Redis:**
   ```bash
   # From Git Bash or WSL2
   cd apps/pnld-ai-service
   docker compose up -d redis
   
   # Or using docker run
   docker run -d --name pnld-redis -p 6379:6379 redis:7-alpine
   ```

4. **Verify:**
   ```bash
   docker ps | grep redis
   docker exec -it pnld-redis redis-cli ping
   # Should return: PONG
   ```

## Option 2: Memurai (Native Windows Redis)

Memurai is a Windows-native port of Redis.

### Installation:

1. **Download Memurai:**
   - Visit: https://www.memurai.com/get-memurai
   - Download the free Developer Edition

2. **Install:**
   - Run the installer
   - It will install as a Windows Service
   - Default port: 6379

3. **Verify:**
   ```powershell
   # Check if service is running
   Get-Service Memurai
   
   # Test connection (if you install Memurai CLI)
   memurai-cli ping
   ```

## Option 3: Redis in WSL2 (Without Docker)

### Step 1: Install WSL2 Ubuntu

```powershell
# In PowerShell as Administrator
wsl --install -d Ubuntu
```

### Step 2: Install Redis in WSL2

```bash
# In WSL2 Ubuntu terminal
sudo apt update
sudo apt install redis-server -y

# Start Redis
sudo service redis-server start

# Verify
redis-cli ping
# Should return: PONG
```

### Step 3: Access from Windows

Redis in WSL2 will be accessible at `localhost:6379` from Windows applications.

## Option 4: Use a Cloud Redis (Easiest for Testing)

### Upstash (Free Tier Available)

1. **Sign up:** https://upstash.com
2. **Create Database:**
   - Click "Create Database"
   - Choose region closest to you
   - Copy the Redis URL

3. **Update .env:**
   ```bash
   REDIS_URL=redis://default:YOUR_PASSWORD@YOUR_HOST.upstash.io:6379
   ```

**Pros:**
- No local installation
- Works immediately
- Free tier available (10,000 commands/day)
- Perfect for testing

**Cons:**
- Requires internet
- Slight latency (cloud-based)

## Quick Test After Installation

### Update your .env file:

```bash
# For local Redis (Options 1, 2, 3)
REDIS_URL=redis://localhost:6379

# For Upstash (Option 4)
REDIS_URL=redis://default:password@your-host.upstash.io:6379

# Enable caching
USE_CACHING=true
```

### Test the connection:

```bash
cd apps/pnld-ai-service

# Test with Python
python -c "import redis; r=redis.from_url('redis://localhost:6379'); print(r.ping())"
# Should print: True
```

## Recommended Approach for You

Based on your Windows setup, I recommend:

1. **For immediate testing:** Use **Upstash** (Option 4)
   - Sign up, get URL, update .env
   - Start testing in 2 minutes

2. **For development:** Install **Docker Desktop** (Option 1)
   - More control over Redis
   - Easy to start/stop
   - Industry standard

3. **Alternative:** Use **Memurai** (Option 2)
   - Native Windows performance
   - No Docker needed
   - Simple Windows service

## Next Steps

Once Redis is running:

1. **Update .env:**
   ```bash
   cp .env.example .env
   # Edit .env and set REDIS_URL
   ```

2. **Run the service:**
   ```bash
   python -m uvicorn app.main:app --reload
   ```

3. **Test cache endpoints:**
   ```bash
   # Check cache config
   curl http://localhost:8000/api/v1/cache/config
   
   # Check cache stats
   curl http://localhost:8000/api/v1/cache/stats
   ```

4. **Test RAG with caching:**
   ```bash
   # Run test script
   python test_cache_integration.py
   ```

## Troubleshooting

### "Connection refused" error

```bash
# Check if Redis is running
docker ps | grep redis  # For Docker
Get-Service Memurai    # For Memurai
sudo service redis-server status  # For WSL2
```

### "Can't connect to Redis" from Python

```bash
# Test connection manually
python -c "import redis; r=redis.from_url('redis://localhost:6379'); print(r.ping())"

# If it fails, check your REDIS_URL in .env
# Make sure it matches where Redis is running
```

### WSL2 Redis not accessible from Windows

```bash
# In WSL2, edit Redis config to bind to all interfaces
sudo nano /etc/redis/redis.conf

# Find line: bind 127.0.0.1
# Change to: bind 0.0.0.0

# Restart Redis
sudo service redis-server restart
```

## Performance Notes

- **Docker on Windows:** ~5-10ms latency (WSL2 overhead)
- **Memurai (Native):** ~1-2ms latency (best performance)
- **Upstash (Cloud):** ~20-50ms latency (depends on region)
- **WSL2 Native:** ~2-3ms latency (good performance)

For development, any option works fine. For production, use cloud Redis (Upstash/Fly.io).
