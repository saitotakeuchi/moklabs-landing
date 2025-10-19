"""Chat endpoints for RAG-based conversations."""

import uuid
from datetime import datetime
from fastapi import APIRouter, HTTPException, status
from app.models.chat import ChatRequest, ChatResponse, ChatMessage, DocumentSource
from app.services.rag import generate_rag_response
from app.services.supabase import get_supabase_client

router = APIRouter()


@router.post("", response_model=ChatResponse, status_code=status.HTTP_200_OK)
async def chat(request: ChatRequest) -> ChatResponse:
    """
    Process a chat message and return an AI-generated response using RAG.

    This endpoint:
    1. Retrieves relevant documents from vector store
    2. Builds context from retrieved documents
    3. Generates response using LLM with page citations
    4. Stores conversation in Supabase

    Args:
        request: Chat request containing message and optional conversation context

    Returns:
        ChatResponse with AI-generated message and source citations
    """
    try:
        supabase = get_supabase_client()

        # Get or create conversation
        conversation_id = request.conversation_id
        if not conversation_id:
            # Create new conversation
            conv_result = (
                supabase.table("chat_conversations")
                .insert(
                    {
                        "edital_id": request.edital_id,
                        "metadata": {},
                    }
                )
                .execute()
            )
            if conv_result.data:
                conversation_id = conv_result.data[0]["id"]
            else:
                conversation_id = str(uuid.uuid4())

        # Get conversation history (optional: load previous messages)
        conversation_history = []
        # TODO: Load previous messages from database if needed

        # Generate RAG response
        response_text, source_docs = await generate_rag_response(
            query=request.message,
            edital_id=request.edital_id,
            conversation_history=conversation_history,
            max_tokens=request.max_tokens or 1000,
            temperature=request.temperature or 0.7,
        )

        # Format source documents with page information
        sources = []
        for doc in source_docs:
            source = DocumentSource(
                document_id=doc.get("document_id", ""),
                title=doc.get("document_title", "Unknown"),
                content_excerpt=doc.get("content", "")[:200],  # Limit excerpt length
                relevance_score=doc.get("similarity", 0.0),
                page_number=doc.get("page_number"),
                chunk_index=doc.get("chunk_index"),
                edital_id=doc.get("edital_id"),
            )
            sources.append(source)

        # Store user message
        supabase.table("chat_messages").insert(
            {
                "conversation_id": conversation_id,
                "role": "user",
                "content": request.message,
                "metadata": {},
            }
        ).execute()

        # Store assistant response
        supabase.table("chat_messages").insert(
            {
                "conversation_id": conversation_id,
                "role": "assistant",
                "content": response_text,
                "metadata": {"sources": [s.dict() for s in sources]},
            }
        ).execute()

        return ChatResponse(
            conversation_id=conversation_id,
            message=ChatMessage(
                role="assistant",
                content=response_text,
                timestamp=datetime.now(),
            ),
            sources=sources,
            metadata={"edital_id": request.edital_id},
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process chat request: {str(e)}",
        )


@router.get("/{conversation_id}", status_code=status.HTTP_200_OK)
async def get_conversation(conversation_id: str) -> dict[str, str]:
    """
    Retrieve conversation history by ID.

    This is a placeholder endpoint. Full implementation will be added later.

    Args:
        conversation_id: The unique conversation identifier

    Returns:
        Conversation history
    """
    # TODO: Implement conversation retrieval from Supabase
    return {
        "conversation_id": conversation_id,
        "status": "placeholder",
        "message": "Conversation retrieval not yet implemented",
    }
