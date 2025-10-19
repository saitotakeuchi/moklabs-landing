"""Pydantic models for document management."""

from typing import Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime


class DocumentIndexRequest(BaseModel):
    """Request model for document indexing."""

    edital_id: str = Field(..., description="PNLD edital identifier")
    title: str = Field(..., min_length=1, description="Document title")
    content: str = Field(..., min_length=1, description="Document content to be indexed")
    metadata: Optional[Dict[str, Any]] = Field(
        None, description="Additional document metadata"
    )


class DocumentIndexResponse(BaseModel):
    """Response model for document indexing."""

    document_id: str
    edital_id: str
    status: str
    chunks_created: int
    message: Optional[str] = None


class Document(BaseModel):
    """Full document model."""

    id: str
    edital_id: str
    title: str
    content: str
    metadata: Optional[Dict[str, Any]] = None
    created_at: datetime
    updated_at: datetime


class PageChunk(BaseModel):
    """Model representing a chunk of text from a specific page."""

    page_number: int = Field(..., description="Page number in the source document")
    content: str = Field(..., min_length=1, description="Text content of the chunk")
    chunk_index: int = Field(
        default=0, description="Index of chunk within the page (for multi-chunk pages)"
    )
    metadata: Optional[Dict[str, Any]] = Field(
        None, description="Additional chunk metadata (section, paragraph, etc.)"
    )


class DocumentEmbedding(BaseModel):
    """Document embedding chunk model."""

    id: str
    document_id: str
    content: str
    embedding: Optional[list[float]] = None
    page_number: Optional[int] = Field(None, description="Source page number for citation")
    chunk_index: Optional[int] = Field(None, description="Index within page")
    metadata: Optional[Dict[str, Any]] = Field(None, description="Additional chunk metadata")
    created_at: datetime
