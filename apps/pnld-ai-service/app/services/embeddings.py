"""Embedding generation service using OpenAI."""

from typing import List, BinaryIO, Optional
from openai import OpenAI
from pypdf import PdfReader
from app.config import settings
from app.models.document import PageChunk


_openai_client: OpenAI | None = None


def get_openai_client() -> OpenAI:
    """Get or create the OpenAI client singleton."""
    global _openai_client

    if _openai_client is None:
        _openai_client = OpenAI(api_key=settings.OPENAI_API_KEY)

    return _openai_client


async def generate_embedding(text: str) -> List[float]:
    """
    Generate an embedding vector for the given text.

    Args:
        text: The text to embed

    Returns:
        List of floats representing the embedding vector
    """
    client = get_openai_client()

    response = client.embeddings.create(
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
    client = get_openai_client()

    response = client.embeddings.create(
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
    """
    reader = PdfReader(pdf_file)
    page_chunks = []

    for page_num, page in enumerate(reader.pages, start=1):
        # Extract text from the page
        text = page.extract_text()

        if text.strip():  # Only create chunks for non-empty pages
            page_chunk = PageChunk(
                page_number=page_num,
                content=text.strip(),
                chunk_index=0,
                metadata={"total_pages": len(reader.pages)},
            )
            page_chunks.append(page_chunk)

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

    Args:
        pdf_file: Binary file object containing the PDF
        max_chunk_size: Maximum characters per chunk
        overlap: Number of overlapping characters between chunks

    Returns:
        List of PageChunk objects ready for embedding
    """
    # Extract pages from PDF
    page_chunks = extract_pages_from_pdf(pdf_file)

    # Further chunk pages that are too large
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
