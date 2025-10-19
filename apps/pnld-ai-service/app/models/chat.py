"""Pydantic models for chat functionality."""

from typing import Optional, List, Literal
from pydantic import BaseModel, Field
from datetime import datetime


class ChatMessage(BaseModel):
    """A single chat message."""

    role: Literal["user", "assistant", "system"]
    content: str = Field(..., min_length=1)
    timestamp: Optional[datetime] = None


class ChatRequest(BaseModel):
    """Request model for chat endpoint."""

    message: str = Field(..., min_length=1, description="The user's message")
    conversation_id: Optional[str] = Field(
        None, description="Optional conversation ID to continue an existing conversation"
    )
    edital_id: Optional[str] = Field(
        None, description="Optional edital ID to scope the search"
    )
    max_tokens: Optional[int] = Field(1000, ge=1, le=4000)
    temperature: Optional[float] = Field(0.7, ge=0.0, le=2.0)


class DocumentSource(BaseModel):
    """A document source referenced in the response."""

    document_id: str
    title: str
    content_excerpt: str
    relevance_score: float
    page_number: Optional[int] = Field(None, description="Page number for citation")
    chunk_index: Optional[int] = Field(None, description="Chunk index within page")
    edital_id: Optional[str] = Field(None, description="Associated edital ID")


class ChatResponse(BaseModel):
    """Response model for chat endpoint."""

    conversation_id: str
    message: ChatMessage
    sources: List[DocumentSource] = Field(default_factory=list)
    metadata: Optional[dict] = None
