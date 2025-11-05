"""Embedding generation service using OpenAI."""

from typing import List, BinaryIO, Optional
from openai import AsyncOpenAI
from pypdf import PdfReader
from app.config import settings
from app.models.document import PageChunk
from app.utils.logging import get_logger

logger = get_logger(__name__)


class TextlessPdfError(Exception):
    """
    Raised when a PDF file contains no extractable text.

    This typically occurs with:
    - Scanned documents (images without OCR)
    - PDFs created from images without text layer
    - Corrupted or malformed PDFs

    Resolution requires OCR processing to extract text from images.
    """

    pass


_openai_client: AsyncOpenAI | None = None


def get_async_openai_client() -> AsyncOpenAI:
    """Get or create the AsyncOpenAI client singleton."""
    global _openai_client

    if _openai_client is None:
        _openai_client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

    return _openai_client


async def generate_embedding(text: str) -> List[float]:
    """
    Generate an embedding vector for the given text.

    Args:
        text: The text to embed

    Returns:
        List of floats representing the embedding vector
    """
    client = get_async_openai_client()

    response = await client.embeddings.create(
        model=settings.OPENAI_EMBEDDING_MODEL,
        input=text,
    )

    return response.data[0].embedding


async def generate_embeddings_batch(texts: List[str]) -> List[List[float]]:
    """
    Generate embeddings for multiple texts in batch.

    Args:
        texts: List of texts to embed

    Returns:
        List of embedding vectors
    """
    client = get_async_openai_client()

    response = await client.embeddings.create(
        model=settings.OPENAI_EMBEDDING_MODEL,
        input=texts,
    )

    return [item.embedding for item in response.data]


def extract_pages_from_pdf(pdf_file: BinaryIO) -> List[PageChunk]:
    """
    Extract text from a PDF file, preserving page boundaries.

    Args:
        pdf_file: Binary file object containing the PDF

    Returns:
        List of PageChunk objects, one per page

    Raises:
        TextlessPdfError: If PDF contains no extractable text (e.g., scanned document)
    """
    reader = PdfReader(pdf_file)
    page_chunks = []
    total_pages = len(reader.pages)
    pages_with_text = 0

    for page_num, page in enumerate(reader.pages, start=1):
        # Extract text from the page
        # Note: extract_text() can return None for scanned/image-only pages
        text = page.extract_text()

        # Guard against None before calling .strip()
        if text is not None and text.strip():
            pages_with_text += 1
            page_chunk = PageChunk(
                page_number=page_num,
                content=text.strip(),
                chunk_index=0,
                metadata={"total_pages": total_pages},
            )
            page_chunks.append(page_chunk)

    # If no pages had extractable text, raise an error
    if not page_chunks:
        raise TextlessPdfError(
            f"PDF contains no extractable text across {total_pages} page(s). "
            "This typically indicates a scanned document or image-based PDF. "
            "Please provide a PDF with selectable text or use OCR software to convert the document first."
        )

    return page_chunks


def chunk_page_text(
    page_text: str, page_number: int, max_chunk_size: int = 1000, overlap: int = 200
) -> List[PageChunk]:
    """
    Split a single page's text into multiple chunks if it exceeds max_chunk_size.

    This preserves page number information while splitting large pages.

    Args:
        page_text: Text content from a single page
        page_number: Page number in the source document
        max_chunk_size: Maximum characters per chunk
        overlap: Number of overlapping characters between chunks

    Returns:
        List of PageChunk objects
    """
    if len(page_text) <= max_chunk_size:
        return [
            PageChunk(
                page_number=page_number,
                content=page_text,
                chunk_index=0,
                metadata={},
            )
        ]

    chunks = []
    start = 0
    chunk_index = 0

    while start < len(page_text):
        end = start + max_chunk_size

        # Try to find a natural break point (sentence or paragraph end)
        if end < len(page_text):
            # Look for sentence endings within the last 100 chars
            search_start = max(start, end - 100)
            last_period = page_text.rfind(". ", search_start, end)
            last_newline = page_text.rfind("\n", search_start, end)

            # Use the latest natural break point found
            natural_break = max(last_period, last_newline)
            if natural_break > start:
                end = natural_break + 1

        chunk_text = page_text[start:end].strip()

        if chunk_text:  # Only add non-empty chunks
            chunk = PageChunk(
                page_number=page_number,
                content=chunk_text,
                chunk_index=chunk_index,
                metadata={"is_partial_page": True},
            )
            chunks.append(chunk)
            chunk_index += 1

        start = end - overlap
        if start >= len(page_text):
            break

    return chunks


def process_pdf_to_chunks(
    pdf_file: BinaryIO, max_chunk_size: int = 1000, overlap: int = 200
) -> List[PageChunk]:
    """
    Extract and chunk a PDF file while preserving page information.

    This is the main function for PDF processing. It extracts pages and
    splits large pages into multiple chunks while maintaining page references.

    Uses semantic chunking if enabled, otherwise falls back to character-based chunking.

    Args:
        pdf_file: Binary file object containing the PDF
        max_chunk_size: Maximum characters per chunk
        overlap: Number of overlapping characters between chunks

    Returns:
        List of PageChunk objects ready for embedding

    Raises:
        TextlessPdfError: If PDF contains no extractable text (e.g., scanned document)

    Note:
        This function rejects scanned PDFs and image-based PDFs without text layers.
        PDFs must contain selectable/extractable text to be processed.
    """
    # Extract pages from PDF (raises TextlessPdfError if no text found)
    page_chunks = extract_pages_from_pdf(pdf_file)

    # Use semantic chunking if enabled
    if settings.USE_SEMANTIC_CHUNKING:
        try:
            return process_pdf_to_chunks_semantic(page_chunks)
        except Exception as e:
            logger.warning(
                f"Semantic chunking failed, falling back to character-based chunking",
                extra={"error": str(e), "error_type": type(e).__name__},
            )
            # Fall through to character-based chunking

    # Character-based chunking (legacy)
    all_chunks = []
    for page_chunk in page_chunks:
        if len(page_chunk.content) > max_chunk_size:
            # Split large page into multiple chunks
            sub_chunks = chunk_page_text(
                page_chunk.content,
                page_chunk.page_number,
                max_chunk_size,
                overlap,
            )
            all_chunks.extend(sub_chunks)
        else:
            all_chunks.append(page_chunk)

    return all_chunks


def process_pdf_to_chunks_semantic(page_chunks: List[PageChunk]) -> List[PageChunk]:
    """
    Process PDF pages using semantic chunking.

    This method:
    1. Chunks each page using semantic boundaries (sentences, paragraphs)
    2. Respects document structure (headers, lists)
    3. Adds semantic overlap between chunks

    Args:
        page_chunks: List of PageChunk objects (one per page)

    Returns:
        List of PageChunk objects with semantic chunking applied

    Raises:
        ImportError: If semantic_chunker module cannot be imported
    """
    from app.services.semantic_chunker import get_semantic_chunker

    chunker = get_semantic_chunker()
    all_chunks = []
    global_chunk_index = 0

    for page_chunk in page_chunks:
        # Apply semantic chunking to page content
        semantic_chunks = chunker.chunk_document(
            text=page_chunk.content,
            page_number=page_chunk.page_number,
            min_size=settings.SEMANTIC_CHUNK_MIN_SIZE,
            max_size=settings.SEMANTIC_CHUNK_MAX_SIZE,
            target_size=settings.SEMANTIC_CHUNK_TARGET_SIZE,
        )

        # Add semantic overlap if requested
        if settings.SEMANTIC_OVERLAP_SENTENCES > 0:
            semantic_chunks = chunker.add_semantic_overlap(
                semantic_chunks,
                overlap_sentences=settings.SEMANTIC_OVERLAP_SENTENCES,
            )

        # Convert to PageChunk objects
        for semantic_chunk in semantic_chunks:
            page_chunk = chunker.semantic_chunk_to_page_chunk(
                semantic_chunk,
                chunk_index=global_chunk_index,
            )
            all_chunks.append(page_chunk)
            global_chunk_index += 1

    logger.info(
        f"Semantic chunking completed",
        extra={
            "pages": len(page_chunks),
            "semantic_chunks": len(all_chunks),
            "avg_chunks_per_page": len(all_chunks) / len(page_chunks) if page_chunks else 0,
        },
    )

    return all_chunks


def chunk_text(text: str, chunk_size: int = 1000, overlap: int = 200) -> List[str]:
    """
    Split text into overlapping chunks.

    Note: This is the legacy chunking function for plain text.
    For PDFs, use process_pdf_to_chunks() instead.

    Args:
        text: The text to chunk
        chunk_size: Maximum characters per chunk
        overlap: Number of overlapping characters between chunks

    Returns:
        List of text chunks
    """
    if len(text) <= chunk_size:
        return [text]

    chunks = []
    start = 0

    while start < len(text):
        end = start + chunk_size
        chunk = text[start:end]
        chunks.append(chunk)

        start = end - overlap
        if start >= len(text):
            break

    return chunks
