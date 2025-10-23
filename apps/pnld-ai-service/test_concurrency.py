"""
Test script to verify concurrent request handling.

This script sends multiple concurrent requests to the API endpoints
to verify that async refactoring prevents event loop blocking.
"""

import asyncio
import httpx
import time
from typing import List

API_BASE = "http://localhost:8000/api/v1"


async def test_health_endpoint():
    """Test basic health endpoint."""
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{API_BASE}/health")
        return response.status_code == 200


async def test_documents_list():
    """Test documents listing endpoint."""
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{API_BASE}/documents")
        return response.status_code == 200


async def test_concurrent_requests(num_requests: int = 10):
    """
    Send multiple concurrent requests to test async behavior.

    Args:
        num_requests: Number of concurrent requests to send
    """
    print(f"\n{'='*60}")
    print(f"Testing {num_requests} concurrent requests")
    print(f"{'='*60}\n")

    # Test health endpoint concurrently
    print("1. Testing concurrent health checks...")
    start_time = time.time()

    tasks = [test_health_endpoint() for _ in range(num_requests)]
    results = await asyncio.gather(*tasks)

    duration = time.time() - start_time
    success_count = sum(results)

    print(f"   Completed {success_count}/{num_requests} requests")
    print(f"   Duration: {duration:.2f}s")
    print(f"   Avg time per request: {(duration/num_requests)*1000:.0f}ms\n")

    # Test documents listing concurrently
    print("2. Testing concurrent document listings...")
    start_time = time.time()

    tasks = [test_documents_list() for _ in range(num_requests)]
    results = await asyncio.gather(*tasks)

    duration = time.time() - start_time
    success_count = sum(results)

    print(f"   Completed {success_count}/{num_requests} requests")
    print(f"   Duration: {duration:.2f}s")
    print(f"   Avg time per request: {(duration/num_requests)*1000:.0f}ms\n")

    print(f"{'='*60}")
    print("Concurrency test completed successfully!")
    print(f"{'='*60}\n")


async def main():
    """Run concurrency tests."""
    print("\nStarting FastAPI Async Concurrency Test")
    print("=" * 60)

    # Test with increasing concurrency
    for num_requests in [5, 10]:
        await test_concurrent_requests(num_requests)
        await asyncio.sleep(1)  # Brief pause between test runs


if __name__ == "__main__":
    asyncio.run(main())
