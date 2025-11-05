"""Performance benchmark for MMR selection."""

import asyncio
import time
import numpy as np
from statistics import mean, median, stdev
from typing import List, Dict, Any
from app.services.mmr_selector import MMRSelector


def create_synthetic_documents(
    num_docs: int, embedding_dim: int = 384, avg_content_length: int = 500
) -> List[Dict[str, Any]]:
    """Create synthetic documents for benchmarking."""
    docs = []
    np.random.seed(42)

    for i in range(num_docs):
        # Create normalized random embedding
        embedding = np.random.randn(embedding_dim)
        embedding = embedding / np.linalg.norm(embedding)

        # Create content with random length
        content_length = max(100, int(np.random.normal(avg_content_length, 100)))
        content = " ".join(["word"] * content_length)

        docs.append(
            {
                "id": str(i),
                "content": content,
                "embedding": embedding.tolist(),
                "similarity": 0.9 - (i * 0.01),  # Decreasing similarity
                "page_number": (i % 100) + 1,
                "document_title": f"Document {i // 100}",
            }
        )

    return docs


def create_query_embedding(embedding_dim: int = 384) -> np.ndarray:
    """Create a synthetic query embedding."""
    np.random.seed(123)
    embedding = np.random.randn(embedding_dim)
    return embedding / np.linalg.norm(embedding)


async def benchmark_mmr_selection(
    selector: MMRSelector,
    query_embedding: np.ndarray,
    documents: List[Dict[str, Any]],
    max_documents: int,
    num_runs: int = 10,
) -> Dict[str, float]:
    """Benchmark MMR selection performance."""
    latencies = []

    # Warm-up run
    await selector.select_diverse(
        query_embedding=query_embedding,
        documents=documents,
        max_documents=max_documents,
    )

    # Benchmark runs
    for _ in range(num_runs):
        start = time.perf_counter()
        result = await selector.select_diverse(
            query_embedding=query_embedding,
            documents=documents,
            max_documents=max_documents,
        )
        end = time.perf_counter()

        latency_ms = (end - start) * 1000
        latencies.append(latency_ms)

    return {
        "mean_ms": mean(latencies),
        "median_ms": median(latencies),
        "p95_ms": np.percentile(latencies, 95),
        "p99_ms": np.percentile(latencies, 99),
        "min_ms": min(latencies),
        "max_ms": max(latencies),
        "stdev_ms": stdev(latencies) if len(latencies) > 1 else 0,
        "num_runs": num_runs,
    }


async def benchmark_diversity_metrics(
    selector: MMRSelector,
    documents: List[Dict[str, Any]],
    num_runs: int = 10,
) -> Dict[str, float]:
    """Benchmark diversity metrics calculation."""
    latencies = []

    # Warm-up run
    selector.calculate_diversity_metrics(documents)

    # Benchmark runs
    for _ in range(num_runs):
        start = time.perf_counter()
        metrics = selector.calculate_diversity_metrics(documents)
        end = time.perf_counter()

        latency_ms = (end - start) * 1000
        latencies.append(latency_ms)

    return {
        "mean_ms": mean(latencies),
        "median_ms": median(latencies),
        "p95_ms": np.percentile(latencies, 95),
        "p99_ms": np.percentile(latencies, 99),
        "min_ms": min(latencies),
        "max_ms": max(latencies),
        "stdev_ms": stdev(latencies) if len(latencies) > 1 else 0,
        "num_runs": num_runs,
    }


async def run_benchmarks():
    """Run comprehensive MMR benchmarks."""
    print("=" * 80)
    print("MMR Performance Benchmarks")
    print("=" * 80)
    print()

    # Test configurations
    test_configs = [
        {"input_docs": 10, "select_docs": 5, "description": "Small document set"},
        {"input_docs": 20, "select_docs": 10, "description": "Medium document set"},
        {"input_docs": 50, "select_docs": 10, "description": "Large document set"},
        {"input_docs": 100, "select_docs": 10, "description": "Very large document set"},
    ]

    lambda_values = [0.5, 0.7, 1.0]  # Different MMR configurations

    for config in test_configs:
        input_docs = config["input_docs"]
        select_docs = config["select_docs"]
        description = config["description"]

        print(f"\n{description}")
        print(f"Input: {input_docs} documents, Select: {select_docs} documents")
        print("-" * 80)

        # Create synthetic data
        documents = create_synthetic_documents(input_docs)
        query_embedding = create_query_embedding()

        for lambda_param in lambda_values:
            selector = MMRSelector(lambda_param=lambda_param)

            # Benchmark MMR selection
            results = await benchmark_mmr_selection(
                selector=selector,
                query_embedding=query_embedding,
                documents=documents,
                max_documents=select_docs,
                num_runs=20,
            )

            print(f"\nλ={lambda_param} (lambda parameter):")
            print(f"  Mean:   {results['mean_ms']:.2f} ms")
            print(f"  Median: {results['median_ms']:.2f} ms")
            print(f"  P95:    {results['p95_ms']:.2f} ms")
            print(f"  P99:    {results['p99_ms']:.2f} ms")
            print(f"  Min:    {results['min_ms']:.2f} ms")
            print(f"  Max:    {results['max_ms']:.2f} ms")
            print(f"  StdDev: {results['stdev_ms']:.2f} ms")

            # Check if meets performance requirements
            if results["p95_ms"] > 100:
                print(f"  ⚠️  WARNING: P95 latency exceeds 100ms target")
            else:
                print(f"  ✓ P95 latency meets 100ms target")

    # Benchmark diversity metrics calculation
    print("\n" + "=" * 80)
    print("Diversity Metrics Calculation Performance")
    print("=" * 80)

    for num_docs in [5, 10, 20, 50]:
        documents = create_synthetic_documents(num_docs)
        selector = MMRSelector(lambda_param=0.7)

        results = await benchmark_diversity_metrics(
            selector=selector, documents=documents, num_runs=50
        )

        print(f"\n{num_docs} documents:")
        print(f"  Mean:   {results['mean_ms']:.2f} ms")
        print(f"  Median: {results['median_ms']:.2f} ms")
        print(f"  P95:    {results['p95_ms']:.2f} ms")

    # Test with different embedding dimensions
    print("\n" + "=" * 80)
    print("Embedding Dimension Impact")
    print("=" * 80)

    for dim in [128, 384, 768, 1536]:
        documents = create_synthetic_documents(20, embedding_dim=dim)
        query_embedding = create_query_embedding(embedding_dim=dim)
        selector = MMRSelector(lambda_param=0.7)

        results = await benchmark_mmr_selection(
            selector=selector,
            query_embedding=query_embedding,
            documents=documents,
            max_documents=10,
            num_runs=20,
        )

        print(f"\nEmbedding dimension: {dim}")
        print(f"  Mean:   {results['mean_ms']:.2f} ms")
        print(f"  P95:    {results['p95_ms']:.2f} ms")

    # Compare with baseline (pure relevance)
    print("\n" + "=" * 80)
    print("MMR vs Pure Relevance Comparison")
    print("=" * 80)

    documents = create_synthetic_documents(50)
    query_embedding = create_query_embedding()

    # Pure relevance (lambda=1.0)
    pure_relevance = MMRSelector(lambda_param=1.0)
    relevance_results = await benchmark_mmr_selection(
        selector=pure_relevance,
        query_embedding=query_embedding,
        documents=documents,
        max_documents=10,
        num_runs=20,
    )

    # Balanced MMR (lambda=0.7)
    balanced_mmr = MMRSelector(lambda_param=0.7)
    mmr_results = await benchmark_mmr_selection(
        selector=balanced_mmr,
        query_embedding=query_embedding,
        documents=documents,
        max_documents=10,
        num_runs=20,
    )

    print(f"\nPure Relevance (λ=1.0):")
    print(f"  Mean: {relevance_results['mean_ms']:.2f} ms")
    print(f"  P95:  {relevance_results['p95_ms']:.2f} ms")

    print(f"\nBalanced MMR (λ=0.7):")
    print(f"  Mean: {mmr_results['mean_ms']:.2f} ms")
    print(f"  P95:  {mmr_results['p95_ms']:.2f} ms")

    overhead = (
        (mmr_results["mean_ms"] - relevance_results["mean_ms"]) / relevance_results["mean_ms"] * 100
    )
    print(f"\nMMR Overhead: {overhead:.1f}%")

    # Calculate diversity improvement
    selected_pure = await pure_relevance.select_diverse(
        query_embedding=query_embedding, documents=documents, max_documents=10
    )
    selected_mmr = await balanced_mmr.select_diverse(
        query_embedding=query_embedding, documents=documents, max_documents=10
    )

    diversity_pure = pure_relevance.calculate_diversity_metrics(selected_pure)
    diversity_mmr = balanced_mmr.calculate_diversity_metrics(selected_mmr)

    print(f"\nDiversity Comparison:")
    print(f"  Pure Relevance avg similarity: {diversity_pure['avg_similarity']:.3f}")
    print(f"  Balanced MMR avg similarity:   {diversity_mmr['avg_similarity']:.3f}")
    print(
        f"  Diversity improvement:         {(diversity_pure['avg_similarity'] - diversity_mmr['avg_similarity']):.3f}"
    )

    print("\n" + "=" * 80)
    print("Benchmark Complete")
    print("=" * 80)


if __name__ == "__main__":
    asyncio.run(run_benchmarks())
