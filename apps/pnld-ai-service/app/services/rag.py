"""RAG (Retrieval-Augmented Generation) service."""

from typing import List, Optional, AsyncGenerator
import hashlib
import json
from openai import AsyncOpenAI
from app.config import settings
from app.services.embeddings import get_async_openai_client, get_embedding
from app.services.vector_search import search_similar_documents
from app.services.cache_manager import get_semantic_cache
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
    1. Retrieve relevant documents using vector search (with caching)
    2. Build context from retrieved documents
    3. Generate response using LLM with context (with caching)

    Args:
        query: User's question
        edital_id: Optional edital ID to scope search
        conversation_history: Previous messages in the conversation
        max_tokens: Maximum tokens for response
        temperature: LLM temperature parameter

    Returns:
        Tuple of (response_text, source_documents)
    """
    # Check if caching is enabled
    if not settings.USE_CACHING:
        # Original implementation without caching
        similar_docs = await search_similar_documents(
            query=query,
            edital_id=edital_id,
            limit=10,
            similarity_threshold=0.3,
        )
        context = build_context(similar_docs)
        response_text = await generate_llm_response(
            query=query,
            context=context,
            conversation_history=conversation_history or [],
            max_tokens=max_tokens,
            temperature=temperature,
        )
        return response_text, similar_docs

    # Get cache instance
    cache = await get_semantic_cache()

    # Step 1: Retrieve relevant documents with semantic caching
    # Generate query embedding for semantic cache matching
    query_embedding = await get_embedding(query)

    # Create cache key for search results
    search_cache_key = _generate_search_cache_key(query, edital_id)

    async def search_func():
        return await search_similar_documents(
            query=query,
            edital_id=edital_id,
            limit=10,
            similarity_threshold=0.3,
        )

    similar_docs = await cache.get_or_compute(
        key=search_cache_key,
        compute_func=search_func,
        semantic_key=query_embedding,
        cache_type="search_results",
    )

    logger.debug(f"Retrieved {len(similar_docs)} documents for query")

    # Step 2: Build context from retrieved documents
    context = build_context(similar_docs)

    # Step 3: Generate response using LLM with caching
    # Create cache key for LLM response
    llm_cache_key = _generate_llm_cache_key(
        query, context, conversation_history, max_tokens, temperature
    )

    async def llm_func():
        return await generate_llm_response(
            query=query,
            context=context,
            conversation_history=conversation_history or [],
            max_tokens=max_tokens,
            temperature=temperature,
        )

    response_text = await cache.get_or_compute(
        key=llm_cache_key,
        compute_func=llm_func,
        semantic_key=query_embedding,
        cache_type="rag_response",
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
    # Check if caching is enabled for search results
    if settings.USE_CACHING:
        cache = await get_semantic_cache()
        query_embedding = await get_embedding(query)
        search_cache_key = _generate_search_cache_key(query, edital_id)

        async def search_func():
            return await search_similar_documents(
                query=query,
                edital_id=edital_id,
                limit=10,
                similarity_threshold=0.3,
            )

        similar_docs = await cache.get_or_compute(
            key=search_cache_key,
            compute_func=search_func,
            semantic_key=query_embedding,
            cache_type="search_results",
        )
    else:
        # Original implementation without caching
        similar_docs = await search_similar_documents(
            query=query,
            edital_id=edital_id,
            limit=10,
            similarity_threshold=0.3,
        )

    # Yield sources immediately
    yield ("sources", similar_docs)

    # Step 2: Build context from retrieved documents
    context = build_context(similar_docs)

    # Step 3: Stream LLM response (streaming responses are not cached)
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


def _generate_search_cache_key(query: str, edital_id: Optional[str]) -> str:
    """
    Generate cache key for search results.

    Args:
        query: Search query
        edital_id: Optional edital ID

    Returns:
        Deterministic cache key
    """
    key_data = {
        "query": query.strip().lower(),
        "edital_id": edital_id,
        "limit": 10,
        "threshold": 0.3,
    }
    key_string = json.dumps(key_data, sort_keys=True)
    key_hash = hashlib.md5(key_string.encode()).hexdigest()
    return f"search_results:{key_hash}"


def _generate_llm_cache_key(
    query: str,
    context: str,
    conversation_history: List[dict],
    max_tokens: int,
    temperature: float,
) -> str:
    """
    Generate cache key for LLM response.

    Args:
        query: User query
        context: Context string
        conversation_history: Conversation history
        max_tokens: Max tokens parameter
        temperature: Temperature parameter

    Returns:
        Deterministic cache key
    """
    # Hash the context to keep key size manageable
    context_hash = hashlib.md5(context.encode()).hexdigest()

    # Hash conversation history
    history_str = json.dumps(conversation_history, sort_keys=True)
    history_hash = hashlib.md5(history_str.encode()).hexdigest()

    key_data = {
        "query": query.strip().lower(),
        "context_hash": context_hash,
        "history_hash": history_hash,
        "max_tokens": max_tokens,
        "temperature": temperature,
    }
    key_string = json.dumps(key_data, sort_keys=True)
    key_hash = hashlib.md5(key_string.encode()).hexdigest()
    return f"rag_response:{key_hash}"
