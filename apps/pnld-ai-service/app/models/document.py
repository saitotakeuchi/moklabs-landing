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


class DocumentEmbedding(BaseModel):
    """Document embedding chunk model."""

    id: str
    document_id: str
    content: str
    embedding: Optional[list[float]] = None
    created_at: datetime
