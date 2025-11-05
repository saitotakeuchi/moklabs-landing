"""Semantic chunking for preserving meaning boundaries in documents."""

import re
import spacy
from typing import List, Dict, Optional, Tuple
from dataclasses import dataclass
from app.models.document import PageChunk
from app.utils.logging import get_logger

logger = get_logger(__name__)


@dataclass
class SemanticChunk:
    """Represents a semantically meaningful chunk of text."""

    text: str
    page_number: int
    chunk_type: str  # 'header', 'paragraph', 'list', 'table'
    metadata: Dict
    start_char: int
    end_char: int
    sentence_count: int = 0


class SemanticChunker:
    """
    Semantic chunking that respects document structure and meaning boundaries.

    Features:
    - Sentence-aware chunking (no mid-sentence splits)
    - Respects paragraph boundaries
    - Handles Portuguese text properly
    - Dynamic chunk sizing based on content
    - Semantic overlap using complete sentences
    """

    def __init__(self):
        """Initialize the semantic chunker with Portuguese language model."""
        try:
            # Load Portuguese language model with sentencizer
            self.nlp = spacy.load("pt_core_news_lg", disable=["ner", "parser"])
            if "sentencizer" not in self.nlp.pipe_names:
                self.nlp.add_pipe("sentencizer")

            logger.info("Semantic chunker initialized with Portuguese model")
        except OSError as e:
            logger.error(
                f"Failed to load Portuguese model. Run: python -m spacy download pt_core_news_lg",
                extra={"error": str(e)},
            )
            raise

        # Patterns for structure detection
        self.header_pattern = re.compile(
            r"^(?:\d+\.?)+\s+[A-ZÀ-Ü]|"  # Numbered headers
            r"^[A-ZÀ-Ü][^.!?]*:$|"  # Headers ending with colon
            r"^CAPÍTULO|^SEÇÃO|^TÍTULO|"  # Chapter/Section markers
            r"^Art\.|^Artigo|^§|^Parágrafo",  # Legal article markers
            re.MULTILINE,
        )

        self.list_pattern = re.compile(
            r"^\s*[-•·◦▪▸]\s|"  # Bullet points
            r"^\s*[a-z]\)|"  # Lettered lists
            r"^\s*\d+[.)\]]\s|"  # Numbered lists
            r"^\s*[ivxIVX]+[.)\]]\s",  # Roman numeral lists
            re.MULTILINE,
        )

    def chunk_document(
        self,
        text: str,
        page_number: int,
        min_size: int = 500,
        max_size: int = 1500,
        target_size: int = 1000,
    ) -> List[SemanticChunk]:
        """
        Create semantic chunks preserving document structure.

        Args:
            text: Text content to chunk
            page_number: Page number in source document
            min_size: Minimum chunk size in characters
            max_size: Maximum chunk size in characters
            target_size: Target chunk size in characters

        Returns:
            List of SemanticChunk objects
        """
        if not text or not text.strip():
            return []

        # Identify sections in the document
        sections = self._identify_sections(text)

        # Chunk each section appropriately
        chunks = []
        for section in sections:
            if section["type"] == "list":
                # Keep lists together when possible
                chunks.extend(self._chunk_list(section, page_number, max_size))
            else:
                # Sentence-aware paragraph chunking
                chunks.extend(
                    self._chunk_paragraph(
                        section,
                        page_number,
                        min_size,
                        max_size,
                        target_size,
                    )
                )

        logger.debug(
            f"Document chunked",
            extra={
                "page": page_number,
                "sections": len(sections),
                "chunks": len(chunks),
            },
        )

        return chunks

    def _identify_sections(self, text: str) -> List[Dict]:
        """
        Identify different sections in the document.

        Detects:
        - Headers
        - Lists
        - Regular paragraphs

        Args:
            text: Document text

        Returns:
            List of section dictionaries
        """
        sections = []
        lines = text.split("\n")
        current_section = {"text": "", "type": "paragraph", "start": 0}

        for i, line in enumerate(lines):
            line_stripped = line.strip()

            # Skip empty lines
            if not line_stripped:
                continue

            # Detect headers
            if self.header_pattern.match(line):
                if current_section["text"]:
                    sections.append(current_section)
                current_section = {"text": line_stripped, "type": "header", "start": i}
                # Headers are kept with following content, so don't append yet
                continue

            # Detect list items
            if self.list_pattern.match(line):
                if current_section["type"] != "list":
                    if current_section["text"]:
                        sections.append(current_section)
                    current_section = {"text": line_stripped, "type": "list", "start": i}
                else:
                    current_section["text"] += "\n" + line_stripped
                continue

            # Regular paragraph text
            if current_section["type"] == "list":
                # End list section
                if current_section["text"]:
                    sections.append(current_section)
                current_section = {"text": line_stripped, "type": "paragraph", "start": i}
            elif current_section["type"] == "header":
                # Combine header with following paragraph
                current_section["text"] += "\n" + line_stripped
                current_section["type"] = "paragraph"
            else:
                # Continue paragraph
                if current_section["text"]:
                    current_section["text"] += " " + line_stripped
                else:
                    current_section["text"] = line_stripped

        # Add final section
        if current_section["text"]:
            sections.append(current_section)

        return sections

    def _chunk_paragraph(
        self,
        section: Dict,
        page_number: int,
        min_size: int,
        max_size: int,
        target_size: int,
    ) -> List[SemanticChunk]:
        """
        Chunk paragraph by sentences, respecting size constraints.

        Args:
            section: Section dictionary with text and type
            page_number: Page number in source document
            min_size: Minimum chunk size
            max_size: Maximum chunk size
            target_size: Target chunk size

        Returns:
            List of SemanticChunk objects
        """
        text = section["text"]

        # If text is too short, return as single chunk
        if len(text) < min_size:
            return [
                SemanticChunk(
                    text=text,
                    page_number=page_number,
                    chunk_type=section["type"],
                    metadata={"too_short": True},
                    start_char=0,
                    end_char=len(text),
                    sentence_count=1,
                )
            ]

        # Use spaCy for sentence segmentation
        doc = self.nlp(text)
        sentences = [sent.text.strip() for sent in doc.sents if sent.text.strip()]

        if not sentences:
            return []

        chunks = []
        current_chunk = ""
        current_sentences = []
        start_char = 0

        for sentence in sentences:
            # Check if adding sentence exceeds max size
            potential_length = len(current_chunk) + len(sentence) + 1

            if potential_length > max_size and current_chunk:
                # Save current chunk
                chunk_text = current_chunk.strip()
                chunks.append(
                    SemanticChunk(
                        text=chunk_text,
                        page_number=page_number,
                        chunk_type=section["type"],
                        metadata={},
                        start_char=start_char,
                        end_char=start_char + len(chunk_text),
                        sentence_count=len(current_sentences),
                    )
                )

                # Start new chunk with current sentence
                current_chunk = sentence
                current_sentences = [sentence]
                start_char += len(chunk_text) + 1
            else:
                # Add sentence to current chunk
                if current_chunk:
                    current_chunk += " " + sentence
                else:
                    current_chunk = sentence
                current_sentences.append(sentence)

                # Check if we've reached target size
                if len(current_chunk) >= target_size:
                    chunk_text = current_chunk.strip()
                    chunks.append(
                        SemanticChunk(
                            text=chunk_text,
                            page_number=page_number,
                            chunk_type=section["type"],
                            metadata={},
                            start_char=start_char,
                            end_char=start_char + len(chunk_text),
                            sentence_count=len(current_sentences),
                        )
                    )
                    current_chunk = ""
                    current_sentences = []
                    start_char += len(chunk_text) + 1

        # Add remaining content if it meets minimum size
        if current_chunk:
            chunk_text = current_chunk.strip()
            if len(chunk_text) >= min_size:
                chunks.append(
                    SemanticChunk(
                        text=chunk_text,
                        page_number=page_number,
                        chunk_type=section["type"],
                        metadata={},
                        start_char=start_char,
                        end_char=start_char + len(chunk_text),
                        sentence_count=len(current_sentences),
                    )
                )
            elif chunks:
                # Append to last chunk if below minimum
                last_chunk = chunks[-1]
                combined_text = last_chunk.text + " " + chunk_text
                chunks[-1] = SemanticChunk(
                    text=combined_text,
                    page_number=page_number,
                    chunk_type=section["type"],
                    metadata=last_chunk.metadata,
                    start_char=last_chunk.start_char,
                    end_char=last_chunk.start_char + len(combined_text),
                    sentence_count=last_chunk.sentence_count + len(current_sentences),
                )

        return chunks

    def _chunk_list(
        self,
        section: Dict,
        page_number: int,
        max_size: int,
    ) -> List[SemanticChunk]:
        """
        Chunk list items, keeping them intact when possible.

        Args:
            section: Section dictionary with list text
            page_number: Page number
            max_size: Maximum chunk size

        Returns:
            List of SemanticChunk objects
        """
        text = section["text"]

        # If list is small enough, keep it as one chunk
        if len(text) <= max_size:
            return [
                SemanticChunk(
                    text=text,
                    page_number=page_number,
                    chunk_type="list",
                    metadata={},
                    start_char=0,
                    end_char=len(text),
                    sentence_count=text.count("\n") + 1,
                )
            ]

        # Split large lists by items
        items = text.split("\n")
        chunks = []
        current_chunk = ""
        start_char = 0

        for item in items:
            if not item.strip():
                continue

            potential_length = len(current_chunk) + len(item) + 1

            if potential_length > max_size and current_chunk:
                # Save current chunk
                chunk_text = current_chunk.strip()
                chunks.append(
                    SemanticChunk(
                        text=chunk_text,
                        page_number=page_number,
                        chunk_type="list",
                        metadata={"partial_list": True},
                        start_char=start_char,
                        end_char=start_char + len(chunk_text),
                        sentence_count=chunk_text.count("\n") + 1,
                    )
                )
                current_chunk = item
                start_char += len(chunk_text) + 1
            else:
                if current_chunk:
                    current_chunk += "\n" + item
                else:
                    current_chunk = item

        # Add remaining items
        if current_chunk:
            chunk_text = current_chunk.strip()
            chunks.append(
                SemanticChunk(
                    text=chunk_text,
                    page_number=page_number,
                    chunk_type="list",
                    metadata={"partial_list": len(chunks) > 0},
                    start_char=start_char,
                    end_char=start_char + len(chunk_text),
                    sentence_count=chunk_text.count("\n") + 1,
                )
            )

        return chunks

    def add_semantic_overlap(
        self,
        chunks: List[SemanticChunk],
        overlap_sentences: int = 1,
    ) -> List[SemanticChunk]:
        """
        Add contextual overlap using complete sentences.

        Args:
            chunks: List of SemanticChunk objects
            overlap_sentences: Number of sentences to overlap

        Returns:
            Enhanced chunks with overlap metadata
        """
        if len(chunks) <= 1:
            return chunks

        enhanced_chunks = []

        for i, chunk in enumerate(chunks):
            # Get sentences from current chunk
            doc = self.nlp(chunk.text)
            sentences = [sent.text.strip() for sent in doc.sents]

            # Add context from previous chunk
            prev_context = None
            if i > 0:
                prev_doc = self.nlp(chunks[i - 1].text)
                prev_sentences = [sent.text.strip() for sent in prev_doc.sents]
                if prev_sentences:
                    prev_context = " ".join(prev_sentences[-overlap_sentences:])

            # Add context from next chunk
            next_context = None
            if i < len(chunks) - 1:
                next_doc = self.nlp(chunks[i + 1].text)
                next_sentences = [sent.text.strip() for sent in next_doc.sents]
                if next_sentences:
                    next_context = " ".join(next_sentences[:overlap_sentences])

            # Create enhanced chunk with context
            enhanced_metadata = chunk.metadata.copy()
            if prev_context:
                enhanced_metadata["prev_context"] = prev_context
            if next_context:
                enhanced_metadata["next_context"] = next_context

            enhanced_chunk = SemanticChunk(
                text=chunk.text,
                page_number=chunk.page_number,
                chunk_type=chunk.chunk_type,
                metadata=enhanced_metadata,
                start_char=chunk.start_char,
                end_char=chunk.end_char,
                sentence_count=chunk.sentence_count,
            )

            enhanced_chunks.append(enhanced_chunk)

        return enhanced_chunks

    def semantic_chunk_to_page_chunk(
        self,
        semantic_chunk: SemanticChunk,
        chunk_index: int,
    ) -> PageChunk:
        """
        Convert SemanticChunk to PageChunk for compatibility.

        Args:
            semantic_chunk: SemanticChunk object
            chunk_index: Index of chunk in document

        Returns:
            PageChunk object
        """
        metadata = semantic_chunk.metadata.copy()
        metadata.update(
            {
                "chunk_type": semantic_chunk.chunk_type,
                "sentence_count": semantic_chunk.sentence_count,
                "semantic_chunking": True,
            }
        )

        return PageChunk(
            page_number=semantic_chunk.page_number,
            content=semantic_chunk.text,
            chunk_index=chunk_index,
            metadata=metadata,
        )


# Singleton instance
_semantic_chunker: Optional[SemanticChunker] = None


def get_semantic_chunker() -> SemanticChunker:
    """
    Get or create the SemanticChunker singleton.

    Returns:
        SemanticChunker instance
    """
    global _semantic_chunker

    if _semantic_chunker is None:
        _semantic_chunker = SemanticChunker()

    return _semantic_chunker
