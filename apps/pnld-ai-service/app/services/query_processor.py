"""Query preprocessing and expansion service."""

import json
import re
import unicodedata
from pathlib import Path
from typing import Dict, List, Optional
from app.models.query import ProcessedQuery, ExtractedEntity, QueryIntent
from app.utils.logging import get_logger

logger = get_logger(__name__)


class QueryProcessor:
    """
    Preprocesses and expands user queries to improve retrieval.

    Features:
    - Portuguese text normalization
    - Acronym expansion (PNLD → Programa Nacional do Livro Didático)
    - Synonym expansion (requisitos → exigências, requerimentos)
    - Entity extraction (dates, document types)
    - Query intent classification
    """

    def __init__(self):
        """Initialize query processor with configuration files."""
        self.acronym_map = self._load_acronyms()
        self.synonym_map = self._load_synonyms()

        # Compile regex patterns for performance
        self._date_pattern = re.compile(
            r"\b(\d{1,2}[/\-\.]\d{1,2}[/\-\.]\d{2,4})\b"  # DD/MM/YYYY or similar
        )
        self._document_pattern = re.compile(
            r"\b(edital|portaria|resolução|decreto|lei|ofício|instrução normativa)\b", re.IGNORECASE
        )
        self._program_pattern = re.compile(r"\b(PNLD|MEC|FNDE|EJA|BNCC)\b", re.IGNORECASE)

        logger.info(
            "QueryProcessor initialized",
            extra={
                "acronyms_count": len(self.acronym_map),
                "synonyms_count": len(self.synonym_map),
            },
        )

    def _load_acronyms(self) -> Dict[str, str]:
        """Load acronym mappings from config file."""
        config_path = Path(__file__).parent.parent.parent / "config" / "acronyms.json"
        try:
            with open(config_path, "r", encoding="utf-8") as f:
                return json.load(f)
        except FileNotFoundError:
            logger.warning(f"Acronyms config file not found: {config_path}")
            return {}
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse acronyms config: {e}")
            return {}

    def _load_synonyms(self) -> Dict[str, List[str]]:
        """Load synonym mappings from config file."""
        config_path = Path(__file__).parent.parent.parent / "config" / "synonyms.json"
        try:
            with open(config_path, "r", encoding="utf-8") as f:
                return json.load(f)
        except FileNotFoundError:
            logger.warning(f"Synonyms config file not found: {config_path}")
            return {}
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse synonyms config: {e}")
            return {}

    def _normalize_text(self, text: str) -> str:
        """
        Normalize Portuguese text.

        - Converts to lowercase
        - Normalizes Unicode (NFKD decomposition)
        - Preserves accents for Portuguese language
        - Removes extra whitespace

        Args:
            text: Input text to normalize

        Returns:
            Normalized text
        """
        if not text:
            return ""

        # Normalize unicode and convert to lowercase
        normalized = unicodedata.normalize("NFKD", text.lower())

        # Remove extra whitespace
        normalized = " ".join(normalized.split())

        return normalized

    def _expand_acronyms(self, text: str) -> str:
        """
        Expand acronyms in text.

        Example: "PNLD 2024" → "PNLD Programa Nacional do Livro Didático 2024"

        Args:
            text: Input text with potential acronyms

        Returns:
            Text with expanded acronyms appended
        """
        if not text:
            return ""

        expanded_parts = []

        # Find all acronyms in the text
        for acronym, expansion in self.acronym_map.items():
            # Case-insensitive search for acronym as whole word
            pattern = r"\b" + re.escape(acronym) + r"\b"
            if re.search(pattern, text, re.IGNORECASE):
                expanded_parts.append(expansion.lower())

        # Return original text with expansions appended
        if expanded_parts:
            return f"{text} {' '.join(expanded_parts)}"
        return text

    def _extract_entities(self, text: str) -> List[ExtractedEntity]:
        """
        Extract entities from query text.

        Extracts:
        - Dates (DD/MM/YYYY format)
        - Document types (edital, portaria, etc.)
        - Program names (PNLD, MEC, etc.)

        Args:
            text: Input text to extract entities from

        Returns:
            List of extracted entities
        """
        entities = []

        # Extract dates
        for match in self._date_pattern.finditer(text):
            entities.append(
                ExtractedEntity(
                    type="date", value=match.group(0), start=match.start(), end=match.end()
                )
            )

        # Extract document types
        for match in self._document_pattern.finditer(text):
            entities.append(
                ExtractedEntity(
                    type="document_type",
                    value=match.group(0).lower(),
                    start=match.start(),
                    end=match.end(),
                )
            )

        # Extract program names
        for match in self._program_pattern.finditer(text):
            entities.append(
                ExtractedEntity(
                    type="program_name",
                    value=match.group(0).upper(),
                    start=match.start(),
                    end=match.end(),
                )
            )

        return entities

    def _classify_intent(self, text: str) -> QueryIntent:
        """
        Classify query intent using rule-based heuristics.

        Categories:
        - deadline: Questions about dates and deadlines
        - requirement: Questions about requirements and criteria
        - process: Questions about procedures and processes
        - document: Questions about specific documents
        - general: General questions

        Args:
            text: Normalized query text

        Returns:
            Classified intent with confidence score
        """
        text_lower = text.lower()

        # Deadline intent
        deadline_keywords = ["prazo", "data", "quando", "vencimento", "término", "deadline"]
        if any(keyword in text_lower for keyword in deadline_keywords):
            return QueryIntent(category="deadline", confidence=0.9)

        # Requirement intent
        requirement_keywords = [
            "requisito",
            "exigência",
            "condição",
            "critério",
            "preciso",
            "necessário",
        ]
        if any(keyword in text_lower for keyword in requirement_keywords):
            return QueryIntent(category="requirement", confidence=0.9)

        # Process intent
        process_keywords = ["como", "processo", "procedimento", "etapa", "passo"]
        if any(keyword in text_lower for keyword in process_keywords):
            return QueryIntent(category="process", confidence=0.85)

        # Document intent
        document_keywords = ["edital", "portaria", "documento", "publicação"]
        if any(keyword in text_lower for keyword in document_keywords):
            return QueryIntent(category="document", confidence=0.85)

        # Default to general
        return QueryIntent(category="general", confidence=0.7)

    def _get_synonyms(self, text: str) -> Dict[str, List[str]]:
        """
        Find synonyms for terms in the query.

        Args:
            text: Query text to find synonyms for

        Returns:
            Dictionary mapping detected terms to their synonyms
        """
        detected_synonyms = {}

        text_lower = text.lower()

        for term, synonyms in self.synonym_map.items():
            # Check if term appears as whole word
            pattern = r"\b" + re.escape(term) + r"\b"
            if re.search(pattern, text_lower):
                detected_synonyms[term] = synonyms

        return detected_synonyms

    async def process(self, query: str) -> ProcessedQuery:
        """
        Process query through full preprocessing pipeline.

        Pipeline:
        1. Normalize Portuguese text
        2. Expand acronyms
        3. Extract entities
        4. Classify intent
        5. Generate synonyms

        Args:
            query: Raw user query

        Returns:
            ProcessedQuery with all preprocessing results
        """
        if not query or not query.strip():
            logger.warning("Empty query received")
            return ProcessedQuery(
                original="",
                normalized="",
                expanded="",
                entities=[],
                intent=QueryIntent(category="general", confidence=0.0),
                synonyms={},
                metadata={"empty": True},
            )

        # 1. Normalize Portuguese text
        normalized = self._normalize_text(query)

        # 2. Expand acronyms
        expanded = self._expand_acronyms(normalized)

        # 3. Extract entities
        entities = self._extract_entities(query)

        # 4. Classify intent
        intent = self._classify_intent(normalized)

        # 5. Generate synonyms
        synonyms = self._get_synonyms(normalized)

        processed = ProcessedQuery(
            original=query,
            normalized=normalized,
            expanded=expanded,
            entities=entities,
            intent=intent,
            synonyms=synonyms,
            metadata={
                "entities_count": len(entities),
                "synonyms_count": len(synonyms),
                "acronyms_expanded": len(
                    [
                        acr
                        for acr in self.acronym_map.keys()
                        if re.search(r"\b" + re.escape(acr) + r"\b", query, re.IGNORECASE)
                    ]
                ),
            },
        )

        logger.info(
            "Query processed",
            extra={
                "original_length": len(query),
                "expanded_length": len(expanded),
                "intent": intent.category,
                "entities_count": len(entities),
                "synonyms_count": len(synonyms),
            },
        )

        return processed


# Global singleton instance
_query_processor: Optional[QueryProcessor] = None


def get_query_processor() -> QueryProcessor:
    """Get or create the QueryProcessor singleton."""
    global _query_processor

    if _query_processor is None:
        _query_processor = QueryProcessor()

    return _query_processor
