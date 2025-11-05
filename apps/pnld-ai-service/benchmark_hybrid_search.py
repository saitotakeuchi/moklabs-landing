"""
Performance benchmark for hybrid search vs vector-only search.

This script compares:
- Vector-only search latency
- BM25-only search latency
- Hybrid search (vector + BM25 with RRF) latency
- Result quality metrics (if ground truth available)

Usage:
    python benchmark_hybrid_search.py

Requirements:
    - Database must have BM25 migration applied
    - Documents must be indexed with embeddings
"""

import asyncio
import time
from statistics import mean, median, stdev
from typing import List, Dict, Any

from app.services.vector_search import search_similar_documents
from app.services.bm25_search import search_bm25
from app.services.hybrid_search import HybridSearcher


# Test queries covering different search patterns
TEST_QUERIES = [
    "Quais são os requisitos para participar do PNLD 2024?",
    "prazo de inscrição",
    "documentação necessária",
    "critérios de avaliação",
    "como fazer a submissão",
    "regulamento do edital",
    "Programa Nacional do Livro Didático",
    "MEC FNDE educação",
    "aprovação de livros didáticos",
    "processo de seleção de obras",
]


async def benchmark_vector_search(queries: List[str], limit: int = 10) -> Dict[str, Any]:
    """Benchmark vector-only search."""
    latencies = []

    print("\n" + "=" * 60)
    print("BENCHMARKING: Vector-Only Search")
    print("=" * 60)

    for query in queries:
        start = time.time()
        results = await search_similar_documents(
            query=query,
            limit=limit,
            similarity_threshold=0.3,
        )
        latency = (time.time() - start) * 1000  # Convert to ms
        latencies.append(latency)

        print(f"Query: '{query[:40]}...'")
        print(f"  Latency: {latency:.2f}ms | Results: {len(results)}")

    return {
        "method": "vector_only",
        "mean_latency": mean(latencies),
        "median_latency": median(latencies),
        "p95_latency": sorted(latencies)[int(len(latencies) * 0.95)],
        "std_latency": stdev(latencies) if len(latencies) > 1 else 0,
        "min_latency": min(latencies),
        "max_latency": max(latencies),
    }


async def benchmark_bm25_search(queries: List[str], limit: int = 10) -> Dict[str, Any]:
    """Benchmark BM25-only search."""
    latencies = []

    print("\n" + "=" * 60)
    print("BENCHMARKING: BM25-Only Search")
    print("=" * 60)

    for query in queries:
        start = time.time()
        results = await search_bm25(
            query=query,
            limit=limit,
            min_score=0.01,
        )
        latency = (time.time() - start) * 1000
        latencies.append(latency)

        print(f"Query: '{query[:40]}...'")
        print(f"  Latency: {latency:.2f}ms | Results: {len(results)}")

    return {
        "method": "bm25_only",
        "mean_latency": mean(latencies),
        "median_latency": median(latencies),
        "p95_latency": sorted(latencies)[int(len(latencies) * 0.95)],
        "std_latency": stdev(latencies) if len(latencies) > 1 else 0,
        "min_latency": min(latencies),
        "max_latency": max(latencies),
    }


async def benchmark_hybrid_search(queries: List[str], limit: int = 10) -> Dict[str, Any]:
    """Benchmark hybrid search (vector + BM25 with RRF)."""
    latencies = []
    searcher = HybridSearcher(vector_weight=0.6, bm25_weight=0.4, rrf_k=60)

    print("\n" + "=" * 60)
    print("BENCHMARKING: Hybrid Search (Vector + BM25)")
    print("=" * 60)

    for query in queries:
        start = time.time()
        results = await searcher.search(
            vector_query=query,
            bm25_query=query,
            limit=limit,
            vector_threshold=0.3,
            bm25_min_score=0.01,
        )
        latency = (time.time() - start) * 1000
        latencies.append(latency)

        print(f"Query: '{query[:40]}...'")
        print(f"  Latency: {latency:.2f}ms | Results: {len(results)}")

        # Show source method breakdown for first result
        if results and "source_methods" in results[0]:
            methods = [m["method"] for m in results[0]["source_methods"]]
            print(f"  Top result from: {', '.join(methods)}")

    return {
        "method": "hybrid",
        "mean_latency": mean(latencies),
        "median_latency": median(latencies),
        "p95_latency": sorted(latencies)[int(len(latencies) * 0.95)],
        "std_latency": stdev(latencies) if len(latencies) > 1 else 0,
        "min_latency": min(latencies),
        "max_latency": max(latencies),
    }


def print_comparison_report(results: List[Dict[str, Any]]):
    """Print comparison report of all methods."""
    print("\n" + "=" * 60)
    print("BENCHMARK COMPARISON REPORT")
    print("=" * 60)
    print(f"\n{'Method':<20} {'Mean':>10} {'Median':>10} {'P95':>10} {'Min':>10} {'Max':>10}")
    print("-" * 70)

    for r in results:
        print(
            f"{r['method']:<20} "
            f"{r['mean_latency']:>9.2f}ms "
            f"{r['median_latency']:>9.2f}ms "
            f"{r['p95_latency']:>9.2f}ms "
            f"{r['min_latency']:>9.2f}ms "
            f"{r['max_latency']:>9.2f}ms"
        )

    # Calculate hybrid overhead
    vector_mean = next(r["mean_latency"] for r in results if r["method"] == "vector_only")
    hybrid_mean = next(r["mean_latency"] for r in results if r["method"] == "hybrid")
    overhead = hybrid_mean - vector_mean
    overhead_pct = (overhead / vector_mean) * 100

    print(f"\nHybrid Search Overhead: {overhead:.2f}ms ({overhead_pct:.1f}%)")
    print(f"\nAcceptance Criteria: P95 latency < 500ms")

    hybrid_p95 = next(r["p95_latency"] for r in results if r["method"] == "hybrid")
    if hybrid_p95 < 500:
        print(f"✅ PASSED: Hybrid P95 = {hybrid_p95:.2f}ms")
    else:
        print(f"❌ FAILED: Hybrid P95 = {hybrid_p95:.2f}ms (exceeds 500ms)")


async def main():
    """Run all benchmarks and generate report."""
    print("Hybrid Search Performance Benchmark")
    print("Testing with {} queries".format(len(TEST_QUERIES)))

    try:
        # Run benchmarks
        vector_results = await benchmark_vector_search(TEST_QUERIES)
        bm25_results = await benchmark_bm25_search(TEST_QUERIES)
        hybrid_results = await benchmark_hybrid_search(TEST_QUERIES)

        # Print comparison report
        print_comparison_report([vector_results, bm25_results, hybrid_results])

    except Exception as e:
        print(f"\n❌ Benchmark failed: {str(e)}")
        print(f"Error type: {type(e).__name__}")
        print("\nNote: Ensure database has BM25 migration applied and documents are indexed.")
        raise


if __name__ == "__main__":
    asyncio.run(main())
