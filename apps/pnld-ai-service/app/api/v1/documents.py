"""Document indexing endpoints for PNLD content."""

import traceback
from typing import Optional
from io import BytesIO
from fastapi import APIRouter, HTTPException, status, File, UploadFile, Form
from app.models.document import DocumentIndexRequest, DocumentIndexResponse
from app.services.supabase import get_supabase_client
from app.services.embeddings import (
    generate_embeddings_batch,
    process_pdf_to_chunks,
    chunk_text,
)

router = APIRouter()


@router.post("/index", response_model=DocumentIndexResponse, status_code=status.HTTP_201_CREATED)
async def index_document(request: DocumentIndexRequest) -> DocumentIndexResponse:
    """
    Index a PNLD document (plain text) for vector search.

    This endpoint:
    1. Stores the document in Supabase
    2. Chunks the text content
    3. Generates embeddings using OpenAI
    4. Stores embeddings in pgvector for similarity search

    Args:
        request: Document content and metadata

    Returns:
        DocumentIndexResponse with document ID and status
    """
    try:
        supabase = get_supabase_client()

        # 1. Store document in pnld_documents table
        doc_result = (
            supabase.table("pnld_documents")
            .insert(
                {
                    "edital_id": request.edital_id,
                    "title": request.title,
                    "content": request.content,
                    "metadata": request.metadata or {},
                }
            )
            .execute()
        )

        if not doc_result.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to store document",
            )

        document_id = doc_result.data[0]["id"]

        # 2. Chunk document content (legacy text chunking)
        text_chunks = chunk_text(request.content)

        # 3. Generate embeddings for each chunk
        embeddings = await generate_embeddings_batch(text_chunks)

        # 4. Store embeddings in pnld_embeddings table
        embedding_records = [
            {
                "document_id": document_id,
                "content": chunk,
                "embedding": embedding,
                "page_number": None,  # No page info for plain text
                "chunk_index": idx,
                "metadata": {},
            }
            for idx, (chunk, embedding) in enumerate(zip(text_chunks, embeddings))
        ]

        embed_result = supabase.table("pnld_embeddings").insert(embedding_records).execute()

        if not embed_result.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to store embeddings",
            )

        return DocumentIndexResponse(
            document_id=document_id,
            edital_id=request.edital_id,
            status="indexed",
            chunks_created=len(text_chunks),
            message=f"Document indexed successfully with {len(text_chunks)} chunks",
        )

    except Exception as e:
        # Log full traceback for debugging
        error_traceback = traceback.format_exc()
        print(f"Document indexing error: {error_traceback}")

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to index document: {str(e)} | Type: {type(e).__name__}",
        )


@router.post(
    "/index-pdf", response_model=DocumentIndexResponse, status_code=status.HTTP_201_CREATED
)
async def index_pdf_document(
    file: UploadFile = File(..., description="PDF file to index"),
    edital_id: str = Form(..., description="PNLD edital identifier"),
    title: str = Form(..., description="Document title"),
) -> DocumentIndexResponse:
    """
    Index a PDF document for vector search with page tracking.

    This endpoint:
    1. Extracts text from PDF pages
    2. Stores the document in Supabase
    3. Chunks text while preserving page information
    4. Generates embeddings using OpenAI
    5. Stores embeddings with page numbers for citation support

    Args:
        file: PDF file upload
        edital_id: PNLD edital identifier
        title: Document title

    Returns:
        DocumentIndexResponse with document ID and status
    """
    # Validate file type
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF files are accepted for this endpoint",
        )

    try:
        supabase = get_supabase_client()

        # Read PDF file
        pdf_content = await file.read()
        pdf_file = BytesIO(pdf_content)

        # Extract and chunk PDF with page tracking
        page_chunks = process_pdf_to_chunks(pdf_file, max_chunk_size=1000, overlap=200)

        if not page_chunks:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="PDF file appears to be empty or unreadable",
            )

        # Reconstruct full content for storage (optional)
        full_content = "\n\n".join([chunk.content for chunk in page_chunks])

        # Store document in pnld_documents table
        doc_result = (
            supabase.table("pnld_documents")
            .insert(
                {
                    "edital_id": edital_id,
                    "title": title,
                    "content": full_content,
                    "metadata": {
                        "filename": file.filename,
                        "content_type": file.content_type,
                        "total_pages": max(chunk.page_number for chunk in page_chunks),
                        "total_chunks": len(page_chunks),
                    },
                }
            )
            .execute()
        )

        if not doc_result.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to store document",
            )

        document_id = doc_result.data[0]["id"]

        # Generate embeddings for each chunk
        chunk_texts = [chunk.content for chunk in page_chunks]
        embeddings = await generate_embeddings_batch(chunk_texts)

        # Store embeddings with page information
        embedding_records = [
            {
                "document_id": document_id,
                "content": chunk.content,
                "embedding": embedding,
                "page_number": chunk.page_number,
                "chunk_index": chunk.chunk_index,
                "metadata": chunk.metadata or {},
            }
            for chunk, embedding in zip(page_chunks, embeddings)
        ]

        embed_result = supabase.table("pnld_embeddings").insert(embedding_records).execute()

        if not embed_result.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to store embeddings",
            )

        return DocumentIndexResponse(
            document_id=document_id,
            edital_id=edital_id,
            status="indexed",
            chunks_created=len(page_chunks),
            message=f"PDF indexed successfully with {len(page_chunks)} chunks across {max(chunk.page_number for chunk in page_chunks)} pages",
        )

    except HTTPException:
        raise
    except Exception as e:
        # Log full traceback for debugging
        error_traceback = traceback.format_exc()
        print(f"PDF indexing error: {error_traceback}")

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to index PDF: {str(e)} | Type: {type(e).__name__}",
        )


@router.get("/{document_id}", status_code=status.HTTP_200_OK)
async def get_document(document_id: str) -> dict[str, str]:
    """
    Retrieve a document by ID.

    This is a placeholder endpoint.

    Args:
        document_id: The unique document identifier

    Returns:
        Document details
    """
    # TODO: Implement document retrieval from Supabase
    return {
        "document_id": document_id,
        "status": "placeholder",
        "message": "Document retrieval not yet implemented",
    }


@router.delete("/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_document(document_id: str) -> None:
    """
    Delete a document and its embeddings.

    This is a placeholder endpoint.

    Args:
        document_id: The unique document identifier
    """
    # TODO: Implement document deletion
    # Will cascade delete embeddings due to foreign key constraint
    pass
