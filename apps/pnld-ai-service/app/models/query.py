"""Query processing models."""

from typing import List, Dict, Optional, Any
from pydantic import BaseModel, Field


class ExtractedEntity(BaseModel):
    """Entity extracted from query."""

    type: str = Field(..., description="Entity type (date, document_type, program_name, etc.)")
    value: str = Field(..., description="Entity value")
    start: int = Field(..., description="Start position in original query")
    end: int = Field(..., description="End position in original query")


class QueryIntent(BaseModel):
    """Classified query intent."""

    category: str = Field(..., description="Intent category (search, deadline, requirement, etc.)")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Classification confidence score")


class ProcessedQuery(BaseModel):
    """Result of query preprocessing."""

    original: str = Field(..., description="Original user query")
    normalized: str = Field(..., description="Normalized text (lowercase, unicode normalized)")
    expanded: str = Field(..., description="Query with acronyms and synonyms expanded")
    entities: List[ExtractedEntity] = Field(default_factory=list, description="Extracted entities")
    intent: Optional[QueryIntent] = Field(None, description="Classified query intent")
    synonyms: Dict[str, List[str]] = Field(
        default_factory=dict, description="Detected terms and their synonyms"
    )
    metadata: Dict[str, Any] = Field(
        default_factory=dict, description="Additional processing metadata"
    )

    def get_search_terms(self) -> List[str]:
        """
        Get all search terms including original, expanded, and synonyms.

        Returns:
            List of unique search terms for retrieval
        """
        terms = [self.original, self.normalized, self.expanded]

        # Add all synonym variations
        for synonym_list in self.synonyms.values():
            terms.extend(synonym_list)

        # Return unique terms
        return list(set(term for term in terms if term))
