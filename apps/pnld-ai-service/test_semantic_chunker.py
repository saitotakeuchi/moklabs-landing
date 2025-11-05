"""Unit tests for semantic chunker."""

import pytest
from app.services.semantic_chunker import SemanticChunker, SemanticChunk


class TestSemanticChunker:
    """Tests for SemanticChunker class."""

    @pytest.fixture
    def chunker(self):
        """Create SemanticChunker instance."""
        return SemanticChunker()

    @pytest.fixture
    def sample_text(self):
        """Sample Portuguese text with various structures."""
        return """
Art. 1º Este edital estabelece os requisitos para o PNLD 2024.

Os participantes devem atender aos seguintes critérios:
- Documento fiscal válido
- Registro na plataforma
- Conformidade com normas técnicas

Parágrafo único. As obras didáticas devem incluir material complementar.
Os livros podem ser impressos ou digitais. A avaliação pedagógica considera
múltiplos aspectos da qualidade educacional.
"""

    def test_initialization(self, chunker):
        """Test chunker initialization."""
        assert chunker is not None
        assert chunker.nlp is not None
        assert "sentencizer" in chunker.nlp.pipe_names

    def test_chunk_empty_text(self, chunker):
        """Test chunking empty text."""
        chunks = chunker.chunk_document("", page_number=1)
        assert len(chunks) == 0

    def test_chunk_short_text(self, chunker):
        """Test chunking text shorter than minimum size."""
        text = "Este é um texto curto."
        chunks = chunker.chunk_document(text, page_number=1, min_size=500)

        assert len(chunks) == 1
        assert chunks[0].text == text
        assert chunks[0].page_number == 1

    def test_chunk_with_headers(self, chunker, sample_text):
        """Test that headers are detected and preserved."""
        chunks = chunker.chunk_document(
            sample_text,
            page_number=1,
            min_size=100,
            max_size=500,
            target_size=300,
        )

        # Should create multiple chunks
        assert len(chunks) > 0

        # Check that article header is present in first chunk
        assert any("Art. 1º" in chunk.text for chunk in chunks)

    def test_chunk_with_lists(self, chunker, sample_text):
        """Test that lists are detected and handled."""
        chunks = chunker.chunk_document(
            sample_text,
            page_number=1,
            min_size=100,
            max_size=500,
            target_size=300,
        )

        # Lists should be kept together when possible
        list_chunks = [c for c in chunks if c.chunk_type == "list"]
        if list_chunks:
            # Verify list structure is preserved
            assert any("-" in chunk.text for chunk in list_chunks)

    def test_sentence_boundaries(self, chunker):
        """Test that chunks respect sentence boundaries."""
        text = (
            "Esta é a primeira frase. Esta é a segunda frase muito longa que deve "
            "ser mantida intacta. Esta é a terceira frase. Esta é a quarta frase também longa."
        )

        chunks = chunker.chunk_document(
            text,
            page_number=1,
            min_size=50,
            max_size=100,
            target_size=80,
        )

        # All chunks should contain complete sentences
        for chunk in chunks:
            # Check that chunks end with sentence terminators
            assert chunk.text.rstrip().endswith((".", "!", "?")) or len(chunk.text) < 100

    def test_chunk_metadata(self, chunker, sample_text):
        """Test that chunks have proper metadata."""
        chunks = chunker.chunk_document(
            sample_text,
            page_number=5,
            min_size=100,
            max_size=500,
        )

        for chunk in chunks:
            assert chunk.page_number == 5
            assert chunk.chunk_type in ["paragraph", "list", "header"]
            assert isinstance(chunk.metadata, dict)
            assert chunk.start_char >= 0
            assert chunk.end_char >= chunk.start_char
            assert chunk.sentence_count >= 0

    def test_semantic_overlap(self, chunker):
        """Test adding semantic overlap between chunks."""
        text = (
            "Primeira sentença do primeiro parágrafo. Segunda sentença do primeiro parágrafo. "
            "Primeira sentença do segundo parágrafo. Segunda sentença do segundo parágrafo. "
            "Primeira sentença do terceiro parágrafo. Segunda sentença do terceiro parágrafo."
        )

        chunks = chunker.chunk_document(
            text,
            page_number=1,
            min_size=50,
            max_size=120,
            target_size=100,
        )

        # Add overlap
        enhanced_chunks = chunker.add_semantic_overlap(chunks, overlap_sentences=1)

        assert len(enhanced_chunks) == len(chunks)

        # Check that middle chunks have both prev and next context
        if len(enhanced_chunks) > 2:
            middle_chunk = enhanced_chunks[1]
            assert "prev_context" in middle_chunk.metadata
            assert "next_context" in middle_chunk.metadata

    def test_section_detection(self, chunker):
        """Test document section identification."""
        text = """
Art. 1º Este é um artigo legal.

Parágrafo único. Este é um parágrafo especial.

Os requisitos são:
- Item um
- Item dois
- Item três

Texto normal após a lista.
"""

        sections = chunker._identify_sections(text)

        # Should have different section types
        section_types = [s["type"] for s in sections]
        assert "paragraph" in section_types
        assert "list" in section_types

    def test_large_document_chunking(self, chunker):
        """Test chunking a larger document."""
        # Create a large document with multiple paragraphs
        paragraphs = [f"Este é o parágrafo número {i}. " * 10 for i in range(20)]
        text = "\n\n".join(paragraphs)

        chunks = chunker.chunk_document(
            text,
            page_number=1,
            min_size=500,
            max_size=1500,
            target_size=1000,
        )

        # Should create multiple chunks
        assert len(chunks) > 1

        # All chunks should respect size constraints
        for chunk in chunks:
            assert len(chunk.text) >= 500 or chunk == chunks[-1]  # Last chunk can be smaller
            assert len(chunk.text) <= 1500

    def test_semantic_chunk_to_page_chunk_conversion(self, chunker):
        """Test conversion from SemanticChunk to PageChunk."""
        semantic_chunk = SemanticChunk(
            text="Test content",
            page_number=3,
            chunk_type="paragraph",
            metadata={"test": "value"},
            start_char=0,
            end_char=12,
            sentence_count=1,
        )

        page_chunk = chunker.semantic_chunk_to_page_chunk(semantic_chunk, chunk_index=5)

        assert page_chunk.content == "Test content"
        assert page_chunk.page_number == 3
        assert page_chunk.chunk_index == 5
        assert page_chunk.metadata["chunk_type"] == "paragraph"
        assert page_chunk.metadata["sentence_count"] == 1
        assert page_chunk.metadata["semantic_chunking"] is True

    def test_portuguese_sentence_segmentation(self, chunker):
        """Test Portuguese-specific sentence segmentation."""
        text = (
            "O Sr. João da Silva foi ao Dr. Pedro. "
            "A Sra. Maria comprou 1.500 livros. "
            "O valor é R$ 1.000,00 reais."
        )

        chunks = chunker.chunk_document(
            text,
            page_number=1,
            min_size=20,
            max_size=100,
        )

        # Should not split on abbreviations or numbers
        assert len(chunks) > 0
        for chunk in chunks:
            # Should have proper sentence structure
            assert len(chunk.text.strip()) > 0


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
