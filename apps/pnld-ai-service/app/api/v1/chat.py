"""Chat endpoints for RAG-based conversations."""

import uuid
import json
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, HTTPException, status
from fastapi.responses import StreamingResponse
from app.models.chat import (
    ChatRequest,
    ChatMessage,
    DocumentSource,
    ConversationHistory,
)
from app.services.rag import generate_rag_response_stream
from app.services.supabase import get_async_supabase_client
from app.utils.logging import get_logger, set_request_context

router = APIRouter()
logger = get_logger(__name__)


async def validate_edital_exists(edital_id: Optional[str]) -> None:
    """
    Validate that an edital exists in the database.

    Conversations without edital_id (general conversations) are always valid.
    For non-NULL edital_id, verifies the edital exists in the editais table.

    Args:
        edital_id: The edital ID to validate (can be None for general conversations)

    Raises:
        HTTPException: 404 if edital_id is not None and doesn't exist
    """
    # General conversations (NULL edital_id) are always valid
    if edital_id is None:
        return

    # Validate non-NULL edital_id exists in editais table
    supabase = await get_async_supabase_client()
    result = await supabase.table("editais").select("id").eq("id", edital_id).execute()

    if not result.data:
        logger.warning(
            f"Attempted to reference non-existent edital in conversation",
            extra={"edital_id": edital_id},
        )
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Edital '{edital_id}' not found. Please create the edital first or omit edital_id for general conversations.",
        )


async def update_conversation_timestamp(conversation_id: str) -> None:
    """
    Update the updated_at timestamp for a conversation.

    This should be called whenever a message is added to ensure
    the conversation's updated_at reflects the latest activity.

    Args:
        conversation_id: The conversation ID to update
    """
    try:
        supabase = await get_async_supabase_client()
        await (
            supabase.table("chat_conversations")
            .update({"updated_at": datetime.now().isoformat()})
            .eq("id", conversation_id)
            .execute()
        )
        logger.debug(f"Updated conversation timestamp", extra={"conversation_id": conversation_id})
    except Exception as e:
        # Log but don't fail the request if timestamp update fails
        logger.warning(
            f"Failed to update conversation timestamp",
            extra={"conversation_id": conversation_id, "error": str(e)},
        )


async def load_conversation_history(conversation_id: str) -> List[dict]:
    """
    Load conversation history from Supabase.

    Args:
        conversation_id: The conversation ID to load messages for

    Returns:
        List of message dictionaries with 'role' and 'content' keys
        formatted for the LLM context
    """
    supabase = await get_async_supabase_client()

    # Fetch messages in chronological order
    messages_result = await (
        supabase.table("chat_messages")
        .select("role, content")
        .eq("conversation_id", conversation_id)
        .order("created_at", desc=False)
        .execute()
    )

    if not messages_result.data:
        return []

    # Format messages for LLM (exclude system messages if any)
    conversation_history = []
    for msg in messages_result.data:
        if msg["role"] in ["user", "assistant"]:
            conversation_history.append({"role": msg["role"], "content": msg["content"]})

    return conversation_history


@router.post("/stream", status_code=status.HTTP_200_OK)
async def chat_stream(request: ChatRequest) -> StreamingResponse:
    """
    Process a chat message and stream the AI-generated response using Server-Sent Events (SSE).

    This endpoint:
    1. Retrieves relevant documents from vector store
    2. Streams the AI response token by token
    3. Sends source citations after completion
    4. Stores conversation in Supabase

    Event types:
    - metadata: Contains conversation_id (sent first)
    - sources: Document sources with citations (sent after retrieval)
    - token: Individual response tokens
    - done: Completion signal
    - error: Error information

    Args:
        request: Chat request containing message and optional conversation context

    Returns:
        StreamingResponse with text/event-stream content type
    """

    async def event_generator():
        """Generate SSE events for the chat stream."""
        conversation_id = None
        complete_response = ""
        sources = []

        try:
            # Validate that edital exists (if edital_id is not None)
            await validate_edital_exists(request.edital_id)

            supabase = await get_async_supabase_client()

            # Get or create conversation
            conversation_id = request.conversation_id
            if not conversation_id:
                # Create new conversation
                conv_result = await (
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
                logger.info(
                    f"Created new conversation (streaming)",
                    extra={"conversation_id": conversation_id, "edital_id": request.edital_id},
                )

            # Set conversation context for logging
            set_request_context(conversation_id=conversation_id)

            # Send conversation_id as metadata event
            yield f"event: metadata\ndata: {json.dumps({'conversation_id': conversation_id})}\n\n"

            # Load conversation history if continuing existing conversation
            if conversation_id:
                conversation_history = await load_conversation_history(conversation_id)
            else:
                conversation_history = []

            # Store user message
            await (
                supabase.table("chat_messages")
                .insert(
                    {
                        "conversation_id": conversation_id,
                        "role": "user",
                        "content": request.message,
                        "metadata": {},
                    }
                )
                .execute()
            )

            # Stream RAG response
            async for event_type, data in generate_rag_response_stream(
                query=request.message,
                edital_id=request.edital_id,
                conversation_history=conversation_history,
                max_tokens=request.max_tokens or 1000,
                temperature=request.temperature or 0.7,
            ):
                if event_type == "sources":
                    # Format source documents
                    source_docs = data
                    for doc in source_docs:
                        source = DocumentSource(
                            document_id=doc.get("document_id", ""),
                            title=doc.get("document_title", "Unknown"),
                            content_excerpt=doc.get("content", "")[:200],
                            relevance_score=doc.get("similarity", 0.0),
                            page_number=doc.get("page_number"),
                            chunk_index=doc.get("chunk_index"),
                            edital_id=doc.get("edital_id"),
                        )
                        sources.append(source)

                    # Send sources event
                    sources_data = [s.dict() for s in sources]
                    yield f"event: sources\ndata: {json.dumps(sources_data)}\n\n"

                elif event_type == "token":
                    # Accumulate complete response
                    complete_response += data
                    # Send token event
                    yield f"event: token\ndata: {json.dumps({'content': data})}\n\n"

                elif event_type == "done":
                    # Store assistant response in database
                    await (
                        supabase.table("chat_messages")
                        .insert(
                            {
                                "conversation_id": conversation_id,
                                "role": "assistant",
                                "content": complete_response,
                                "metadata": {"sources": [s.dict() for s in sources]},
                            }
                        )
                        .execute()
                    )

                    # Update conversation timestamp to reflect latest activity
                    await update_conversation_timestamp(conversation_id)

                    logger.info(
                        f"Streaming chat completed successfully",
                        extra={
                            "message_length": len(complete_response),
                            "sources_count": len(sources),
                        },
                    )

                    # Send done event
                    yield f"event: done\ndata: {json.dumps({'conversation_id': conversation_id})}\n\n"

        except Exception as e:
            logger.error(
                f"Streaming chat failed",
                extra={
                    "conversation_id": conversation_id,
                    "error": str(e),
                    "error_type": type(e).__name__,
                },
            )
            # Send error event
            error_data = {
                "error": str(e),
                "conversation_id": conversation_id,
            }
            yield f"event: error\ndata: {json.dumps(error_data)}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",  # Disable buffering in nginx
        },
    )


@router.get(
    "/{conversation_id}", response_model=ConversationHistory, status_code=status.HTTP_200_OK
)
async def get_conversation(conversation_id: str) -> ConversationHistory:
    """
    Retrieve full conversation history by ID.

    This endpoint:
    1. Fetches conversation metadata from chat_conversations table
    2. Retrieves all messages in chronological order
    3. Returns complete conversation with metadata

    Args:
        conversation_id: The unique conversation identifier

    Returns:
        ConversationHistory with all messages and metadata

    Raises:
        404: If conversation not found
        500: If database error occurs
    """
    try:
        supabase = await get_async_supabase_client()

        # Fetch conversation metadata
        conv_result = await (
            supabase.table("chat_conversations").select("*").eq("id", conversation_id).execute()
        )

        if not conv_result.data or len(conv_result.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Conversation {conversation_id} not found",
            )

        conversation = conv_result.data[0]

        # Fetch all messages in chronological order
        messages_result = await (
            supabase.table("chat_messages")
            .select("*")
            .eq("conversation_id", conversation_id)
            .order("created_at", desc=False)
            .execute()
        )

        # Convert database messages to ChatMessage models
        messages = []
        for msg in messages_result.data:
            messages.append(
                ChatMessage(
                    role=msg["role"],
                    content=msg["content"],
                    timestamp=datetime.fromisoformat(msg["created_at"].replace("Z", "+00:00")),
                )
            )

        # Build and return conversation history
        return ConversationHistory(
            conversation_id=conversation["id"],
            edital_id=conversation.get("edital_id"),
            messages=messages,
            created_at=datetime.fromisoformat(conversation["created_at"].replace("Z", "+00:00")),
            updated_at=datetime.fromisoformat(conversation["updated_at"].replace("Z", "+00:00")),
            metadata=conversation.get("metadata"),
        )

    except HTTPException:
        # Re-raise HTTP exceptions (like 404)
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve conversation: {str(e)} | Type: {type(e).__name__}",
        )
