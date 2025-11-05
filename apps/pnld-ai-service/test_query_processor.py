"""Unit tests for query preprocessing and expansion."""

import pytest
from app.services.query_processor import QueryProcessor, get_query_processor
from app.models.query import ProcessedQuery, QueryIntent


@pytest.fixture
def query_processor():
    """Fixture to provide a QueryProcessor instance."""
    return QueryProcessor()


class TestTextNormalization:
    """Test Portuguese text normalization."""

    def test_lowercase_conversion(self, query_processor):
        """Test that text is converted to lowercase."""
        result = query_processor._normalize_text("PRAZO DO PNLD")
        assert result == "prazo do pnld"

    def test_whitespace_normalization(self, query_processor):
        """Test that extra whitespace is removed."""
        result = query_processor._normalize_text("prazo   do    PNLD")
        assert result == "prazo do pnld"

    def test_unicode_normalization(self, query_processor):
        """Test that Unicode is normalized (NFKD)."""
        result = query_processor._normalize_text("Educação")
        # Should be lowercase and NFKD normalized
        assert result.islower()
        # NFKD decomposition happens, so just verify it's normalized and lowercase
        assert len(result) > 0
        assert "educa" in result  # Base characters should be present

    def test_empty_text(self, query_processor):
        """Test handling of empty text."""
        result = query_processor._normalize_text("")
        assert result == ""

    def test_none_text(self, query_processor):
        """Test handling of None."""
        result = query_processor._normalize_text(None)
        assert result == ""


class TestAcronymExpansion:
    """Test acronym expansion functionality."""

    def test_pnld_expansion(self, query_processor):
        """Test PNLD acronym expansion."""
        result = query_processor._expand_acronyms("qual o prazo do PNLD?")
        assert "programa nacional do livro didático" in result.lower()
        assert "pnld" in result.lower()

    def test_multiple_acronyms(self, query_processor):
        """Test expansion of multiple acronyms."""
        result = query_processor._expand_acronyms("PNLD do MEC e FNDE")
        assert "programa nacional do livro didático" in result.lower()
        assert "ministério da educação" in result.lower()
        assert "fundo nacional de desenvolvimento da educação" in result.lower()

    def test_case_insensitive(self, query_processor):
        """Test that acronym detection is case-insensitive."""
        result1 = query_processor._expand_acronyms("PNLD 2024")
        result2 = query_processor._expand_acronyms("pnld 2024")
        assert "programa nacional" in result1.lower()
        assert "programa nacional" in result2.lower()

    def test_no_acronyms(self, query_processor):
        """Test text without acronyms."""
        text = "qual é o prazo de inscrição?"
        result = query_processor._expand_acronyms(text)
        assert result == text

    def test_partial_match_ignored(self, query_processor):
        """Test that partial matches are not expanded."""
        result = query_processor._expand_acronyms("PNLDX não é um acronônimo")
        # Should not expand PNLDX as PNLD
        assert result.count("programa nacional") == 0


class TestEntityExtraction:
    """Test entity extraction functionality."""

    def test_date_extraction(self, query_processor):
        """Test extraction of dates."""
        entities = query_processor._extract_entities("prazo até 31/12/2024")
        date_entities = [e for e in entities if e.type == "date"]
        assert len(date_entities) == 1
        assert date_entities[0].value == "31/12/2024"

    def test_multiple_date_formats(self, query_processor):
        """Test various date formats."""
        entities = query_processor._extract_entities("datas: 01/01/2024, 15-03-2024")
        date_entities = [e for e in entities if e.type == "date"]
        assert len(date_entities) == 2

    def test_document_type_extraction(self, query_processor):
        """Test extraction of document types."""
        entities = query_processor._extract_entities("onde está o edital?")
        doc_entities = [e for e in entities if e.type == "document_type"]
        assert len(doc_entities) == 1
        assert doc_entities[0].value == "edital"

    def test_program_name_extraction(self, query_processor):
        """Test extraction of program names."""
        entities = query_processor._extract_entities("requisitos do PNLD")
        program_entities = [e for e in entities if e.type == "program_name"]
        assert len(program_entities) == 1
        assert program_entities[0].value == "PNLD"

    def test_mixed_entities(self, query_processor):
        """Test extraction of multiple entity types."""
        entities = query_processor._extract_entities("O edital do PNLD vence em 31/12/2024")
        assert len(entities) == 3
        types = {e.type for e in entities}
        assert "date" in types
        assert "document_type" in types
        assert "program_name" in types

    def test_no_entities(self, query_processor):
        """Test text without entities."""
        entities = query_processor._extract_entities("como funciona?")
        assert len(entities) == 0


class TestIntentClassification:
    """Test query intent classification."""

    def test_deadline_intent(self, query_processor):
        """Test deadline intent classification."""
        intent = query_processor._classify_intent("qual é o prazo de inscrição?")
        assert intent.category == "deadline"
        assert intent.confidence >= 0.85

    def test_requirement_intent(self, query_processor):
        """Test requirement intent classification."""
        intent = query_processor._classify_intent("quais são os requisitos?")
        assert intent.category == "requirement"
        assert intent.confidence >= 0.85

    def test_process_intent(self, query_processor):
        """Test process intent classification."""
        intent = query_processor._classify_intent("como faço para me inscrever?")
        assert intent.category == "process"
        assert intent.confidence >= 0.85

    def test_document_intent(self, query_processor):
        """Test document intent classification."""
        intent = query_processor._classify_intent("onde encontro o edital?")
        assert intent.category == "document"
        assert intent.confidence >= 0.85

    def test_general_intent(self, query_processor):
        """Test general intent classification."""
        intent = query_processor._classify_intent("me explique sobre isso")
        assert intent.category == "general"


class TestSynonymExpansion:
    """Test synonym expansion functionality."""

    def test_single_synonym(self, query_processor):
        """Test synonym detection for single term."""
        synonyms = query_processor._get_synonyms("quais são os requisitos?")
        assert "requisitos" in synonyms
        assert "exigências" in synonyms["requisitos"]
        assert "requerimentos" in synonyms["requisitos"]

    def test_multiple_synonyms(self, query_processor):
        """Test synonym detection for multiple terms."""
        synonyms = query_processor._get_synonyms("prazo do edital")
        assert "prazo" in synonyms
        assert "edital" in synonyms

    def test_no_synonyms(self, query_processor):
        """Test text without known synonyms."""
        synonyms = query_processor._get_synonyms("xyz abc def")
        assert len(synonyms) == 0

    def test_case_insensitive(self, query_processor):
        """Test that synonym detection is case-insensitive."""
        synonyms1 = query_processor._get_synonyms("REQUISITOS")
        synonyms2 = query_processor._get_synonyms("requisitos")
        assert len(synonyms1) == len(synonyms2)


@pytest.mark.asyncio
class TestQueryProcessing:
    """Test full query processing pipeline."""

    async def test_simple_query(self, query_processor):
        """Test processing a simple query."""
        result = await query_processor.process("qual é o prazo do PNLD?")

        assert isinstance(result, ProcessedQuery)
        assert result.original == "qual é o prazo do PNLD?"
        assert "prazo" in result.normalized
        assert "programa nacional" in result.expanded.lower()
        assert result.intent.category == "deadline"
        assert "prazo" in result.synonyms

    async def test_empty_query(self, query_processor):
        """Test handling of empty query."""
        result = await query_processor.process("")

        assert result.original == ""
        assert result.normalized == ""
        assert result.expanded == ""
        assert len(result.entities) == 0
        assert result.metadata.get("empty") is True

    async def test_complex_query(self, query_processor):
        """Test processing a complex query with multiple features."""
        result = await query_processor.process(
            "Quais são os requisitos do edital PNLD 2024 até 31/12/2024?"
        )

        assert len(result.entities) >= 2  # At least date and program
        assert result.intent.category in ["requirement", "deadline"]
        assert len(result.synonyms) >= 1
        assert "programa nacional" in result.expanded.lower()

    async def test_metadata_tracking(self, query_processor):
        """Test that metadata is properly tracked."""
        result = await query_processor.process("requisitos do PNLD")

        assert "entities_count" in result.metadata
        assert "synonyms_count" in result.metadata
        assert "acronyms_expanded" in result.metadata
        assert result.metadata["acronyms_expanded"] >= 1

    async def test_get_search_terms(self, query_processor):
        """Test search terms extraction."""
        result = await query_processor.process("requisitos do PNLD")

        search_terms = result.get_search_terms()
        assert len(search_terms) > 0
        assert result.original in search_terms
        assert result.expanded in search_terms

    async def test_whitespace_only_query(self, query_processor):
        """Test handling of whitespace-only query."""
        result = await query_processor.process("   ")

        assert result.normalized == ""
        assert result.expanded == ""


class TestSingleton:
    """Test singleton pattern."""

    def test_get_query_processor_returns_same_instance(self):
        """Test that get_query_processor returns the same instance."""
        processor1 = get_query_processor()
        processor2 = get_query_processor()
        assert processor1 is processor2

    def test_singleton_loads_config_once(self):
        """Test that configuration is loaded only once."""
        processor = get_query_processor()
        assert len(processor.acronym_map) > 0
        assert len(processor.synonym_map) > 0


class TestEdgeCases:
    """Test edge cases and special scenarios."""

    def test_special_characters(self, query_processor):
        """Test handling of special characters."""
        result = query_processor._normalize_text("prazo@#$%PNLD!?")
        assert "prazo" in result
        assert "pnld" in result

    def test_numbers_preserved(self, query_processor):
        """Test that numbers are preserved."""
        result = query_processor._normalize_text("PNLD 2024")
        assert "2024" in result

    def test_very_long_query(self, query_processor):
        """Test handling of very long queries."""
        long_query = "prazo " * 100
        result = query_processor._normalize_text(long_query)
        assert "prazo" in result

    @pytest.mark.asyncio
    async def test_concurrent_processing(self, query_processor):
        """Test that processor handles concurrent requests."""
        import asyncio

        queries = ["prazo do PNLD", "requisitos do edital", "como me inscrever"]

        results = await asyncio.gather(*[query_processor.process(q) for q in queries])

        assert len(results) == 3
        assert all(isinstance(r, ProcessedQuery) for r in results)


class TestPerformance:
    """Test performance requirements."""

    @pytest.mark.asyncio
    async def test_processing_latency(self, query_processor):
        """Test that processing adds <100ms latency."""
        import time

        query = "Quais são os requisitos do PNLD 2024?"

        start = time.time()
        await query_processor.process(query)
        elapsed = (time.time() - start) * 1000  # Convert to milliseconds

        # Should be well under 100ms
        assert elapsed < 100, f"Processing took {elapsed}ms, should be <100ms"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
