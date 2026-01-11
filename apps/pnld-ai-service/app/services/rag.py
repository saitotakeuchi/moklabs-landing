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


def prioritize_edital_documents(documents: List[dict], edital_id: Optional[str]) -> List[dict]:
    """
    Prioritize documents that match the specific edital_id over standard documents.

    Standard documents (NULL edital_id) are useful but should come after
    edital-specific documents when a specific edital is being queried.

    Args:
        documents: List of document chunks with content and metadata
        edital_id: The specific edital being queried (None for general queries)

    Returns:
        Reordered list with edital-specific documents first
    """
    if not edital_id or not documents:
        return documents

    # Separate edital-specific and standard documents
    edital_specific = []
    standard_docs = []

    for doc in documents:
        doc_edital = doc.get("edital_id")
        if doc_edital == edital_id:
            edital_specific.append(doc)
        else:
            # NULL edital_id or different edital
            standard_docs.append(doc)

    # Log the prioritization
    logger.debug(
        "Document prioritization applied",
        extra={
            "edital_id": edital_id,
            "edital_specific_count": len(edital_specific),
            "standard_count": len(standard_docs),
        }
    )

    # Return edital-specific first, then standard documents
    return edital_specific + standard_docs


def build_context(documents: List[dict], edital_id: Optional[str] = None) -> str:
    """
    Build context string from retrieved documents with page citations.

    Args:
        documents: List of document chunks with content and metadata
        edital_id: Optional edital ID for marking edital-specific documents

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
        doc_edital = doc.get("edital_id")

        # Build citation header with edital indicator
        citation = f"[Document {i}: {title}"
        if page_number is not None:
            citation += f", Page {page_number}"
        # Mark if this is from the specific edital or a standard document
        if edital_id:
            if doc_edital == edital_id:
                citation += " (EDITAL-SPECIFIC)"
            elif doc_edital is None:
                citation += " (STANDARD DOCUMENT)"
            else:
                citation += f" (FROM: {doc_edital})"
        citation += "]"

        context_parts.append(f"{citation}\n{content}\n")

    return "\n".join(context_parts)


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
        # First try with normal thresholds
        similar_docs = await hybrid_searcher.search(
            vector_query=processed_query.expanded,
            bm25_query=processed_query.expanded,
            edital_id=edital_id,
            limit=10,
            vector_threshold=0.15,  # Lowered from 0.3
            bm25_min_score=0.001,   # Lowered from 0.01
        )

        # Fallback: If no results, try with original query (not expanded)
        if not similar_docs:
            logger.info("No results with expanded query, trying original query")
            similar_docs = await hybrid_searcher.search(
                vector_query=query,  # Use original query
                bm25_query=query,
                edital_id=edital_id,
                limit=10,
                vector_threshold=0.1,  # Even lower threshold
                bm25_min_score=0.0001,
            )
    else:
        logger.debug("Using vector-only search (streaming)")
        similar_docs = await search_similar_documents(
            query=processed_query.expanded,
            edital_id=edital_id,
            limit=10,
            similarity_threshold=0.15,  # Lowered from 0.3
        )

        # Fallback with original query
        if not similar_docs:
            logger.info("No results with expanded query, trying original query")
            similar_docs = await search_similar_documents(
                query=query,  # Use original query
                edital_id=edital_id,
                limit=10,
                similarity_threshold=0.1,
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

    # Step 5: Prioritize edital-specific documents over standard documents
    if edital_id and similar_docs:
        similar_docs = prioritize_edital_documents(similar_docs, edital_id)
        logger.info(
            "Documents prioritized for edital",
            extra={"edital_id": edital_id, "total_docs": len(similar_docs)},
        )

    # Yield sources after prioritization
    yield ("sources", similar_docs)

    # Step 6: Build context from retrieved documents
    context = build_context(similar_docs, edital_id)

    # Step 7: Stream LLM response
    async for token in generate_llm_response_stream(
        query=query,
        context=context,
        edital_id=edital_id,
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
    edital_id: Optional[str] = None,
    conversation_history: Optional[List[dict]] = None,
    max_tokens: int = 1000,
    temperature: float = 0.7,
) -> AsyncGenerator[str, None]:
    """
    Generate streaming response using LLM with provided context.

    Args:
        query: User's question
        context: Retrieved context from documents
        edital_id: The specific edital being queried
        conversation_history: Previous conversation messages
        max_tokens: Maximum tokens for response
        temperature: LLM temperature parameter

    Yields:
        Individual tokens as they're generated
    """
    client = get_async_openai_client()

    # Build edital-aware instructions
    edital_instruction = ""
    if edital_id:
        edital_instruction = f"""
IMPORTANT: The user is asking about a SPECIFIC edital: "{edital_id}"
- Documents marked "(EDITAL-SPECIFIC)" are from this exact edital - PRIORITIZE these for answers
- Documents marked "(STANDARD DOCUMENT)" contain general PNLD information that may apply to multiple editais
- Documents marked "(FROM: other-edital)" are from a DIFFERENT edital - use with caution, information may not apply

When dates, deadlines, requirements or specifications are mentioned, ALWAYS use information from EDITAL-SPECIFIC documents first.
If the answer is not in EDITAL-SPECIFIC documents, you may use STANDARD DOCUMENT information, but clarify it's general guidance.
NEVER use information from a different edital to answer about this one.
"""

    # Build system message with context
    system_message = f"""You are a helpful assistant that answers questions about PNLD (Programa Nacional do Livro Didático) editals.
Use the following context to answer the user's question. If the context doesn't contain relevant information, say so.
{edital_instruction}
When citing information, always reference the document title and page number if available (e.g., "According to [Document Title], page 5...").

Context:
{context}
"""

    # Build messages list
    messages = [{"role": "system", "content": system_message}]

    # Add conversation history
    if conversation_history:
        messages.extend(conversation_history)

    # Add current query
    messages.append({"role": "user", "content": query})

    # Generate streaming response
    stream = await client.chat.completions.create(
        model=settings.OPENAI_MODEL,
        messages=messages,
        max_completion_tokens=max_tokens,
        temperature=temperature,
        stream=True,
    )

    async for chunk in stream:
        if chunk.choices[0].delta.content:
            yield chunk.choices[0].delta.content
