"""RAG (Retrieval-Augmented Generation) service."""

from typing import List, Optional, AsyncGenerator
from openai import AsyncOpenAI
from app.config import settings
from app.services.embeddings import get_async_openai_client, generate_embedding
from app.services.vector_search import search_similar_documents
from app.services.query_processor import get_query_processor
from app.services.hybrid_search import get_hybrid_searcher
from app.services.reranker import get_reranker
from app.services.mmr_selector import get_mmr_selector
from app.utils.logging import get_logger

logger = get_logger(__name__)


async def generate_rag_response(
    query: str,
    edital_id: Optional[str] = None,
    conversation_history: Optional[List[dict]] = None,
    max_tokens: int = 1000,
    temperature: float = 0.7,
) -> tuple[str, List[dict]]:
    """
    Generate a response using RAG pipeline.

    Steps:
    1. Preprocess and expand query
    2. Retrieve relevant documents using vector search
    3. Build context from retrieved documents
    4. Generate response using LLM with context

    Args:
        query: User's question
        edital_id: Optional edital ID to scope search
        conversation_history: Previous messages in the conversation
        max_tokens: Maximum tokens for response
        temperature: LLM temperature parameter

    Returns:
        Tuple of (response_text, source_documents)
    """
    # Step 1: Preprocess query
    query_processor = get_query_processor()
    processed_query = await query_processor.process(query)

    logger.info(
        "Query preprocessing completed",
        extra={
            "original_query": query,
            "intent": processed_query.intent.category if processed_query.intent else None,
            "entities_count": len(processed_query.entities),
            "synonyms_count": len(processed_query.synonyms),
        },
    )

    # Step 2: Retrieve relevant documents
    # Use hybrid search if enabled, otherwise fall back to vector-only
    if settings.USE_HYBRID_SEARCH:
        logger.debug("Using hybrid search (vector + BM25)")
        hybrid_searcher = get_hybrid_searcher(
            vector_weight=settings.HYBRID_VECTOR_WEIGHT,
            bm25_weight=settings.HYBRID_BM25_WEIGHT,
            rrf_k=settings.HYBRID_RRF_K,
        )
        similar_docs = await hybrid_searcher.search(
            vector_query=processed_query.expanded,  # Use expanded for vector
            bm25_query=processed_query.expanded,  # Use expanded for BM25
            edital_id=edital_id,
            limit=10,
            vector_threshold=0.3,
            bm25_min_score=0.01,
        )
    else:
        logger.debug("Using vector-only search")
        similar_docs = await search_similar_documents(
            query=processed_query.expanded,
            edital_id=edital_id,
            limit=10,
            similarity_threshold=0.3,
        )

    # Step 3: Apply reranking if enabled
    if settings.USE_RERANKING and similar_docs:
        logger.debug("Applying cross-encoder reranking")
        reranker = get_reranker(
            model_name=settings.RERANKER_MODEL,
            max_length=settings.RERANKER_MAX_LENGTH,
            batch_size=settings.RERANKER_BATCH_SIZE,
        )
        similar_docs = await reranker.rerank(
            query=query,  # Use original query for reranking
            documents=similar_docs,
            top_k=settings.RERANKER_TOP_K,
            original_score_weight=settings.RERANKER_ORIGINAL_SCORE_WEIGHT,
            rerank_score_weight=settings.RERANKER_SCORE_WEIGHT,
        )
        logger.info(
            "Reranking applied",
            extra={
                "final_count": len(similar_docs),
                "top_final_score": similar_docs[0].get("final_score") if similar_docs else None,
            },
        )

    # Step 4: Apply MMR for diverse context selection if enabled
    if settings.USE_MMR and similar_docs:
        logger.debug("Applying MMR for diverse context selection")
        mmr_selector = get_mmr_selector(lambda_param=settings.MMR_LAMBDA)

        # Generate query embedding for MMR
        query_embedding = await generate_embedding(processed_query.expanded)

        # Select diverse documents
        similar_docs = await mmr_selector.select_diverse(
            query_embedding=query_embedding,
            documents=similar_docs,
            max_documents=10,
            max_tokens=settings.MMR_MAX_TOKENS,
        )

        # Calculate and log diversity metrics
        diversity_metrics = mmr_selector.calculate_diversity_metrics(similar_docs)
        logger.info(
            "MMR selection applied",
            extra={
                "final_count": len(similar_docs),
                "avg_similarity": diversity_metrics.get("avg_pairwise_similarity"),
                "min_similarity": diversity_metrics.get("min_pairwise_similarity"),
                "max_similarity": diversity_metrics.get("max_pairwise_similarity"),
            },
        )

    # Step 5: Build context from retrieved documents
    context = build_context(similar_docs)

    # Step 6: Generate response using LLM
    response_text = await generate_llm_response(
        query=query,  # Use original query for LLM (more natural)
        context=context,
        conversation_history=conversation_history or [],
        max_tokens=max_tokens,
        temperature=temperature,
    )

    return response_text, similar_docs


def build_context(documents: List[dict]) -> str:
    """
    Build context string from retrieved documents with page citations.

    Args:
        documents: List of document chunks with content and metadata

    Returns:
        Formatted context string with page references
    """
    if not documents:
        return "No relevant documents found."

    context_parts = []
    for i, doc in enumerate(documents, 1):
        content = doc.get("content", "")
        title = doc.get("document_title", "Unknown")
        page_number = doc.get("page_number")

        # Build citation header
        citation = f"[Document {i}: {title}"
        if page_number is not None:
            citation += f", Page {page_number}"
        citation += "]"

        context_parts.append(f"{citation}\n{content}\n")

    return "\n".join(context_parts)


async def generate_llm_response(
    query: str,
    context: str,
    conversation_history: List[dict],
    max_tokens: int = 1000,
    temperature: float = 0.7,
) -> str:
    """
    Generate response using LLM with provided context.

    Args:
        query: User's question
        context: Retrieved context from documents
        conversation_history: Previous conversation messages
        max_tokens: Maximum tokens for response
        temperature: LLM temperature parameter

    Returns:
        Generated response text
    """
    client = get_async_openai_client()

    # Build system message with context
    system_message = f"""You are a helpful assistant that answers questions about PNLD (Programa Nacional do Livro Didático) editals.
Use the following context to answer the user's question. If the context doesn't contain relevant information, say so.

When citing information, always reference the page number if available (e.g., "According to page 5 of the document...").

Context:
{context}
"""

    # Build messages list
    messages = [{"role": "system", "content": system_message}]

    # Add conversation history
    messages.extend(conversation_history)

    # Add current query
    messages.append({"role": "user", "content": query})

    # Generate response
    response = await client.chat.completions.create(
        model=settings.OPENAI_MODEL,
        messages=messages,
        max_tokens=max_tokens,
        temperature=temperature,
    )

    return response.choices[0].message.content or ""


async def generate_rag_response_stream(
    query: str,
    edital_id: Optional[str] = None,
    conversation_history: Optional[List[dict]] = None,
    max_tokens: int = 1000,
    temperature: float = 0.7,
) -> AsyncGenerator[tuple[str, List[dict] | None], None]:
    """
    Generate a streaming response using RAG pipeline.

    Yields tuples of (event_type, data):
    - ('token', token_text): Individual tokens as they're generated
    - ('sources', source_documents): Retrieved source documents (sent once)
    - ('done', None): Indicates completion

    Args:
        query: User's question
        edital_id: Optional edital ID to scope search
        conversation_history: Previous messages in the conversation
        max_tokens: Maximum tokens for response
        temperature: LLM temperature parameter

    Yields:
        Tuples of (event_type, data) for streaming
    """
    # Step 1: Preprocess query
    query_processor = get_query_processor()
    processed_query = await query_processor.process(query)

    logger.info(
        "Query preprocessing completed (streaming)",
        extra={
            "original_query": query,
            "intent": processed_query.intent.category if processed_query.intent else None,
            "entities_count": len(processed_query.entities),
            "synonyms_count": len(processed_query.synonyms),
        },
    )

    # Step 2: Retrieve relevant documents
    # Use hybrid search if enabled, otherwise fall back to vector-only
    if settings.USE_HYBRID_SEARCH:
        logger.debug("Using hybrid search (streaming)")
        hybrid_searcher = get_hybrid_searcher(
            vector_weight=settings.HYBRID_VECTOR_WEIGHT,
            bm25_weight=settings.HYBRID_BM25_WEIGHT,
            rrf_k=settings.HYBRID_RRF_K,
        )
        similar_docs = await hybrid_searcher.search(
            vector_query=processed_query.expanded,
            bm25_query=processed_query.expanded,
            edital_id=edital_id,
            limit=10,
            vector_threshold=0.3,
            bm25_min_score=0.01,
        )
    else:
        logger.debug("Using vector-only search (streaming)")
        similar_docs = await search_similar_documents(
            query=processed_query.expanded,
            edital_id=edital_id,
            limit=10,
            similarity_threshold=0.3,
        )

    # Step 3: Apply reranking if enabled
    if settings.USE_RERANKING and similar_docs:
        logger.debug("Applying cross-encoder reranking (streaming)")
        reranker = get_reranker(
            model_name=settings.RERANKER_MODEL,
            max_length=settings.RERANKER_MAX_LENGTH,
            batch_size=settings.RERANKER_BATCH_SIZE,
        )
        similar_docs = await reranker.rerank(
            query=query,
            documents=similar_docs,
            top_k=settings.RERANKER_TOP_K,
            original_score_weight=settings.RERANKER_ORIGINAL_SCORE_WEIGHT,
            rerank_score_weight=settings.RERANKER_SCORE_WEIGHT,
        )

    # Step 4: Apply MMR for diverse context selection if enabled
    if settings.USE_MMR and similar_docs:
        logger.debug("Applying MMR for diverse context selection (streaming)")
        mmr_selector = get_mmr_selector(lambda_param=settings.MMR_LAMBDA)

        # Generate query embedding for MMR
        query_embedding = await generate_embedding(processed_query.expanded)

        # Select diverse documents
        similar_docs = await mmr_selector.select_diverse(
            query_embedding=query_embedding,
            documents=similar_docs,
            max_documents=10,
            max_tokens=settings.MMR_MAX_TOKENS,
        )

        # Calculate and log diversity metrics
        diversity_metrics = mmr_selector.calculate_diversity_metrics(similar_docs)
        logger.info(
            "MMR selection applied (streaming)",
            extra={
                "final_count": len(similar_docs),
                "avg_similarity": diversity_metrics.get("avg_pairwise_similarity"),
                "min_similarity": diversity_metrics.get("min_pairwise_similarity"),
                "max_similarity": diversity_metrics.get("max_pairwise_similarity"),
            },
        )

    # Yield sources after MMR selection
    yield ("sources", similar_docs)

    # Step 4: Build context from retrieved documents
    context = build_context(similar_docs)

    # Step 5: Stream LLM response
    async for token in generate_llm_response_stream(
        query=query,
        context=context,
        conversation_history=conversation_history or [],
        max_tokens=max_tokens,
        temperature=temperature,
    ):
        yield ("token", token)

    # Signal completion
    yield ("done", None)


async def generate_llm_response_stream(
    query: str,
    context: str,
    conversation_history: List[dict],
    max_tokens: int = 1000,
    temperature: float = 0.7,
) -> AsyncGenerator[str, None]:
    """
    Generate streaming response using LLM with provided context.

    Args:
        query: User's question
        context: Retrieved context from documents
        conversation_history: Previous conversation messages
        max_tokens: Maximum tokens for response
        temperature: LLM temperature parameter

    Yields:
        Individual tokens as they're generated
    """
    client = get_async_openai_client()

    # Build system message with context
    system_message = f"""You are a helpful assistant that answers questions about PNLD (Programa Nacional do Livro Didático) editals.
Use the following context to answer the user's question. If the context doesn't contain relevant information, say so.

When citing information, always reference the page number if available (e.g., "According to page 5 of the document...").

Context:
{context}
"""

    # Build messages list
    messages = [{"role": "system", "content": system_message}]

    # Add conversation history
    messages.extend(conversation_history)

    # Add current query
    messages.append({"role": "user", "content": query})

    # Generate streaming response
    stream = await client.chat.completions.create(
        model=settings.OPENAI_MODEL,
        messages=messages,
        max_tokens=max_tokens,
        temperature=temperature,
        stream=True,
    )

    async for chunk in stream:
        if chunk.choices[0].delta.content:
            yield chunk.choices[0].delta.content
