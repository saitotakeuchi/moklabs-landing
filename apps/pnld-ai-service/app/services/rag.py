"""RAG (Retrieval-Augmented Generation) service."""

from typing import List, Optional
from openai import OpenAI
from app.config import settings
from app.services.embeddings import get_openai_client
from app.services.vector_search import search_similar_documents


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
    1. Retrieve relevant documents using vector search
    2. Build context from retrieved documents
    3. Generate response using LLM with context

    Args:
        query: User's question
        edital_id: Optional edital ID to scope search
        conversation_history: Previous messages in the conversation
        max_tokens: Maximum tokens for response
        temperature: LLM temperature parameter

    Returns:
        Tuple of (response_text, source_documents)
    """
    # Step 1: Retrieve relevant documents
    # Using lower threshold (0.5) to be more permissive during initial testing
    similar_docs = await search_similar_documents(
        query=query,
        edital_id=edital_id,
        limit=5,
        similarity_threshold=0.5,
    )

    # Step 2: Build context from retrieved documents
    context = build_context(similar_docs)

    # Step 3: Generate response using LLM
    response_text = await generate_llm_response(
        query=query,
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
    client = get_openai_client()

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
    response = client.chat.completions.create(
        model=settings.OPENAI_MODEL,
        messages=messages,
        max_tokens=max_tokens,
        temperature=temperature,
    )

    return response.choices[0].message.content or ""
