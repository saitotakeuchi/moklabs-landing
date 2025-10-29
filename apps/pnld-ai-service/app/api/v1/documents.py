"""Document indexing endpoints for PNLD content."""

import traceback
import json
from typing import Optional
from io import BytesIO
from fastapi import APIRouter, HTTPException, status, File, UploadFile, Form, Query
from app.models.document import (
    DocumentIndexRequest,
    DocumentIndexResponse,
    PdfUploadResponse,
    DocumentListResponse,
    DocumentListItem,
    DocumentDetail,
    SampleChunk,
    DocumentDeletionResponse,
)
from app.services.supabase import get_async_supabase_client
from app.services.embeddings import (
    generate_embeddings_batch,
    process_pdf_to_chunks,
    chunk_text,
    TextlessPdfError,
)

router = APIRouter()


@router.get("", response_model=DocumentListResponse, status_code=status.HTTP_200_OK)
async def list_documents(
    edital_id: Optional[str] = Query(None, description="Filter by edital ID"),
    limit: int = Query(20, ge=1, le=100, description="Number of items per page"),
    offset: int = Query(0, ge=0, description="Offset for pagination"),
    sort_by: str = Query("created_at", description="Sort field (created_at, updated_at, title)"),
) -> DocumentListResponse:
    """
    List all documents with pagination and filtering.

    This endpoint:
    1. Retrieves documents from the database
    2. Supports filtering by edital_id
    3. Includes chunk/embedding counts per document
    4. Returns paginated results with total count

    Args:
        edital_id: Optional filter by edital ID
        limit: Number of items per page (1-100, default 20)
        offset: Offset for pagination (default 0)
        sort_by: Sort field - created_at, updated_at, or title (default created_at)

    Returns:
        DocumentListResponse with paginated document list
    """
    try:
        supabase = await get_async_supabase_client()

        # Validate sort_by parameter
        valid_sort_fields = ["created_at", "updated_at", "title"]
        if sort_by not in valid_sort_fields:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid sort_by field. Must be one of: {', '.join(valid_sort_fields)}",
            )

        # Build query for documents with count and pagination in a single request
        # This optimization eliminates the need for two separate queries
        query = supabase.table("pnld_documents").select("*", count="exact")

        # Apply edital_id filter if provided
        if edital_id:
            query = query.eq("edital_id", edital_id)

        # Apply sorting
        query = query.order(sort_by, desc=(sort_by != "title"))

        # Apply pagination
        query = query.range(offset, offset + limit - 1)

        # Execute single query to get both count and paginated data
        try:
            result = await query.execute()
            total_count = result.count if result.count else 0
        except Exception as e:
            # Handle range errors (e.g., offset beyond available data)
            error_str = str(e)
            if "416" in error_str or "Range Not Satisfiable" in error_str:
                # For range errors, we need to get the count with a separate lightweight query
                count_query = supabase.table("pnld_documents").select("id", count="exact").limit(0)
                if edital_id:
                    count_query = count_query.eq("edital_id", edital_id)
                count_result = await count_query.execute()
                total_count = count_result.count if count_result.count else 0

                # Return empty result for out-of-range offsets
                return DocumentListResponse(
                    documents=[],
                    total=total_count,
                    limit=limit,
                    offset=offset,
                )
            else:
                # Re-raise other errors
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Failed to list documents: {str(e)} | Type: {type(e).__name__}",
                )

        if not result.data:
            return DocumentListResponse(
                documents=[],
                total=total_count,
                limit=limit,
                offset=offset,
            )

        # Get document IDs for counting chunks
        document_ids = [doc["id"] for doc in result.data]

        # Count embeddings/chunks per document using optimized server-side aggregation
        # This uses the count_chunks_by_document() Postgres function for efficiency
        try:
            chunks_result = await supabase.rpc(
                "count_chunks_by_document",
                {"document_ids": document_ids}
            ).execute()

            # Create a mapping of document_id to chunk count from RPC result
            chunks_count_map = {}
            if chunks_result.data:
                for row in chunks_result.data:
                    chunks_count_map[row["document_id"]] = row["chunk_count"]

        except Exception as e:
            # Fallback to Python-side counting if RPC function doesn't exist
            # This is less efficient but ensures the endpoint still works
            print(f"Warning: count_chunks_by_document RPC failed, using fallback: {str(e)}")
            chunks_query = (
                supabase.table("pnld_embeddings")
                .select("document_id", count="exact")
                .in_("document_id", document_ids)
            )
            fallback_result = await chunks_query.execute()

            chunks_count_map = {}
            if fallback_result.data:
                # Count chunks per document in Python (less efficient)
                from collections import Counter
                counts = Counter(row["document_id"] for row in fallback_result.data)
                chunks_count_map = dict(counts)

        # Build response documents
        documents = []
        for doc in result.data:
            doc_id = doc["id"]
            documents.append(
                DocumentListItem(
                    id=doc_id,
                    edital_id=doc["edital_id"],
                    title=doc["title"],
                    chunks_count=chunks_count_map.get(doc_id, 0),
                    created_at=doc["created_at"],
                    updated_at=doc["updated_at"],
                    metadata=doc.get("metadata"),
                )
            )

        return DocumentListResponse(
            documents=documents,
            total=total_count,
            limit=limit,
            offset=offset,
        )

    except HTTPException:
        raise
    except Exception as e:
        # Log full traceback for debugging
        error_traceback = traceback.format_exc()
        print(f"List documents error: {error_traceback}")

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to list documents: {str(e)} | Type: {type(e).__name__}",
        )


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
        supabase = await get_async_supabase_client()

        # 1. Store document in pnld_documents table
        doc_result = await (
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

        embed_result = await supabase.table("pnld_embeddings").insert(embedding_records).execute()

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
        supabase = await get_async_supabase_client()

        # Read PDF file
        pdf_content = await file.read()
        pdf_file = BytesIO(pdf_content)

        # Extract and chunk PDF with page tracking
        try:
            page_chunks = process_pdf_to_chunks(pdf_file, max_chunk_size=1000, overlap=200)
        except TextlessPdfError as e:
            # PDF contains no extractable text (scanned/image-based PDF)
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=str(e),
            )

        # Reconstruct full content for storage (optional)
        full_content = "\n\n".join([chunk.content for chunk in page_chunks])

        # Store document in pnld_documents table
        doc_result = await (
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

        embed_result = await supabase.table("pnld_embeddings").insert(embedding_records).execute()

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


@router.post(
    "/upload-pdf", response_model=PdfUploadResponse, status_code=status.HTTP_201_CREATED
)
async def upload_pdf(
    file: UploadFile = File(..., description="PDF file to upload and index"),
    edital_id: str = Form(..., description="PNLD edital identifier"),
    title: str = Form(..., description="Document title"),
    metadata: Optional[str] = Form(None, description="Additional metadata as JSON string"),
) -> PdfUploadResponse:
    """
    Upload and index a PDF document with comprehensive validation.

    This endpoint:
    1. Validates file type (PDF only)
    2. Validates file size (max 50MB)
    3. Extracts text from PDF pages
    4. Stores the document in Supabase
    5. Chunks text while preserving page information
    6. Generates embeddings using OpenAI
    7. Stores embeddings with page numbers for citation support

    Args:
        file: PDF file upload (max 50MB)
        edital_id: PNLD edital identifier
        title: Document title
        metadata: Optional JSON string with additional metadata

    Returns:
        PdfUploadResponse with detailed processing information

    Raises:
        HTTPException: If validation fails or processing encounters errors
    """
    # Constants
    MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB in bytes

    # Validate file type
    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Filename is required",
        )

    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF files are accepted. Please upload a file with .pdf extension",
        )

    # Validate content type if provided
    if file.content_type and file.content_type not in [
        "application/pdf",
        "application/x-pdf",
    ]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid content type: {file.content_type}. Expected application/pdf",
        )

    try:
        # Read file content and validate size
        pdf_content = await file.read()
        file_size = len(pdf_content)

        if file_size == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Uploaded file is empty",
            )

        if file_size > MAX_FILE_SIZE:
            size_mb = file_size / (1024 * 1024)
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"File size ({size_mb:.2f}MB) exceeds maximum allowed size of 50MB",
            )

        # Parse optional metadata
        parsed_metadata = {}
        if metadata:
            try:
                parsed_metadata = json.loads(metadata)
                if not isinstance(parsed_metadata, dict):
                    raise ValueError("Metadata must be a JSON object")
            except json.JSONDecodeError as e:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid JSON in metadata field: {str(e)}",
                )

        supabase = await get_async_supabase_client()
        pdf_file = BytesIO(pdf_content)

        # Extract and chunk PDF with page tracking
        try:
            page_chunks = process_pdf_to_chunks(pdf_file, max_chunk_size=1000, overlap=200)
        except TextlessPdfError as e:
            # PDF contains no extractable text (scanned/image-based PDF)
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=str(e),
            )

        # Calculate page count
        total_pages = max(chunk.page_number for chunk in page_chunks)

        # Reconstruct full content for storage
        full_content = "\n\n".join([chunk.content for chunk in page_chunks])

        # Merge metadata with file information
        document_metadata = {
            **parsed_metadata,
            "filename": file.filename,
            "content_type": file.content_type or "application/pdf",
            "file_size_bytes": file_size,
            "file_size_mb": round(file_size / (1024 * 1024), 2),
            "total_pages": total_pages,
            "total_chunks": len(page_chunks),
        }

        # Store document in pnld_documents table
        doc_result = await (
            supabase.table("pnld_documents")
            .insert(
                {
                    "edital_id": edital_id,
                    "title": title,
                    "content": full_content,
                    "metadata": document_metadata,
                }
            )
            .execute()
        )

        if not doc_result.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to store document in database",
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

        embed_result = await supabase.table("pnld_embeddings").insert(embedding_records).execute()

        if not embed_result.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to store embeddings in database",
            )

        return PdfUploadResponse(
            document_id=document_id,
            edital_id=edital_id,
            title=title,
            filename=file.filename,
            pages_processed=total_pages,
            chunks_created=len(page_chunks),
            status="success",
        )

    except HTTPException:
        raise
    except Exception as e:
        # Log full traceback for debugging
        error_traceback = traceback.format_exc()
        print(f"PDF upload error: {error_traceback}")

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process PDF upload: {str(e)} | Type: {type(e).__name__}",
        )


@router.get("/{document_id}", response_model=DocumentDetail, status_code=status.HTTP_200_OK)
async def get_document(
    document_id: str,
    include_chunks: bool = Query(False, description="Include sample chunks in response")
) -> DocumentDetail:
    """
    Retrieve detailed document information by ID.

    This endpoint:
    1. Fetches document metadata from pnld_documents table
    2. Counts related embeddings/chunks
    3. Optionally includes sample chunks

    Args:
        document_id: The unique document identifier (UUID)
        include_chunks: Whether to include sample chunks (default: False)

    Returns:
        DocumentDetail with metadata, counts, and optional sample chunks

    Raises:
        404: If document not found
        500: If database error occurs
    """
    try:
        supabase = await get_async_supabase_client()

        # Fetch document metadata
        doc_result = await (
            supabase.table("pnld_documents")
            .select("*")
            .eq("id", document_id)
            .execute()
        )

        if not doc_result.data or len(doc_result.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Document {document_id} not found",
            )

        document = doc_result.data[0]

        # Count embeddings/chunks efficiently without fetching all rows
        # Use limit(0) to get only the count header without materializing data
        chunks_result = await (
            supabase.table("pnld_embeddings")
            .select("id", count="exact")
            .eq("document_id", document_id)
            .limit(0)
            .execute()
        )

        chunks_count = chunks_result.count if chunks_result.count else 0
        embeddings_count = chunks_count  # Same for now

        # Optionally fetch sample chunks
        sample_chunks = None
        if include_chunks and chunks_count > 0:
            # Fetch first 5 chunks as samples
            sample_result = await (
                supabase.table("pnld_embeddings")
                .select("content, page_number, chunk_index")
                .eq("document_id", document_id)
                .order("created_at", desc=False)
                .limit(5)
                .execute()
            )

            if sample_result.data:
                sample_chunks = [
                    SampleChunk(
                        content=chunk["content"],
                        page_number=chunk.get("page_number"),
                        chunk_index=chunk.get("chunk_index"),
                    )
                    for chunk in sample_result.data
                ]

        # Build and return document detail
        return DocumentDetail(
            id=document["id"],
            edital_id=document["edital_id"],
            title=document["title"],
            metadata=document.get("metadata"),
            created_at=document["created_at"],
            updated_at=document["updated_at"],
            chunks_count=chunks_count,
            embeddings_count=embeddings_count,
            sample_chunks=sample_chunks,
        )

    except HTTPException:
        # Re-raise HTTP exceptions (like 404)
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve document: {str(e)} | Type: {type(e).__name__}",
        )


@router.delete("/{document_id}", response_model=DocumentDeletionResponse, status_code=status.HTTP_200_OK)
async def delete_document(document_id: str) -> DocumentDeletionResponse:
    """
    Delete a document and all its related embeddings.

    This endpoint:
    1. Checks if document exists
    2. Counts related embeddings before deletion
    3. Deletes embeddings from pnld_embeddings
    4. Deletes document from pnld_documents
    5. Returns deletion confirmation with counts

    Args:
        document_id: The unique document identifier (UUID)

    Returns:
        DocumentDeletionResponse with confirmation message and deletion counts

    Raises:
        404: If document not found
        500: If database error occurs
    """
    try:
        supabase = await get_async_supabase_client()

        # Check if document exists
        doc_result = await (
            supabase.table("pnld_documents")
            .select("id")
            .eq("id", document_id)
            .execute()
        )

        if not doc_result.data or len(doc_result.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Document {document_id} not found",
            )

        # Count embeddings before deletion
        embeddings_result = await (
            supabase.table("pnld_embeddings")
            .select("id", count="exact")
            .eq("document_id", document_id)
            .execute()
        )

        embeddings_count = embeddings_result.count if embeddings_result.count else 0

        # Delete embeddings first
        await supabase.table("pnld_embeddings").delete().eq("document_id", document_id).execute()

        # Delete document
        await supabase.table("pnld_documents").delete().eq("id", document_id).execute()

        # Return deletion confirmation
        return DocumentDeletionResponse(
            message=f"Document and related embeddings successfully deleted",
            document_id=document_id,
            embeddings_deleted=embeddings_count,
        )

    except HTTPException:
        # Re-raise HTTP exceptions (like 404)
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete document: {str(e)} | Type: {type(e).__name__}",
        )
