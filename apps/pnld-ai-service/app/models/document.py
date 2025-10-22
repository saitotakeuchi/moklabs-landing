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


class PdfUploadResponse(BaseModel):
    """Response model for PDF upload endpoint."""

    document_id: str = Field(..., description="Unique document identifier")
    edital_id: str = Field(..., description="PNLD edital identifier")
    title: str = Field(..., description="Document title")
    filename: str = Field(..., description="Original filename")
    pages_processed: int = Field(..., description="Number of pages processed")
    chunks_created: int = Field(..., description="Number of text chunks created")
    status: str = Field(
        ..., description="Processing status: success, processing, or failed"
    )


class DocumentListItem(BaseModel):
    """Document list item model (without full content)."""

    id: str = Field(..., description="Unique document identifier")
    edital_id: str = Field(..., description="PNLD edital identifier")
    title: str = Field(..., description="Document title")
    chunks_count: int = Field(..., description="Number of chunks/embeddings")
    created_at: datetime = Field(..., description="Document creation timestamp")
    updated_at: datetime = Field(..., description="Document last update timestamp")
    metadata: Optional[Dict[str, Any]] = Field(None, description="Document metadata")


class DocumentListResponse(BaseModel):
    """Response model for document list endpoint."""

    documents: list[DocumentListItem] = Field(
        ..., description="List of documents"
    )
    total: int = Field(..., description="Total number of documents matching filters")
    limit: int = Field(..., description="Number of items per page")
    offset: int = Field(..., description="Offset for pagination")


class SampleChunk(BaseModel):
    """Sample chunk model for document details."""

    content: str = Field(..., description="Chunk text content")
    page_number: Optional[int] = Field(None, description="Source page number")
    chunk_index: Optional[int] = Field(None, description="Chunk index within page")


class DocumentDetail(BaseModel):
    """Detailed document model with statistics."""

    id: str = Field(..., description="Unique document identifier")
    edital_id: str = Field(..., description="PNLD edital identifier")
    title: str = Field(..., description="Document title")
    metadata: Optional[Dict[str, Any]] = Field(None, description="Document metadata")
    created_at: datetime = Field(..., description="Document creation timestamp")
    updated_at: datetime = Field(..., description="Document last update timestamp")
    chunks_count: int = Field(..., description="Number of text chunks")
    embeddings_count: int = Field(..., description="Number of embeddings generated")
    sample_chunks: Optional[list[SampleChunk]] = Field(
        None, description="Sample chunks (only included if requested)"
    )


class DocumentDeletionResponse(BaseModel):
    """Response model for document deletion."""

    message: str = Field(..., description="Deletion confirmation message")
    document_id: str = Field(..., description="ID of deleted document")
    embeddings_deleted: int = Field(..., description="Number of embeddings deleted")
