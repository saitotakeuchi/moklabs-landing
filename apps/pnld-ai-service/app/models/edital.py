"""Edital (Notice) models for request/response validation."""

from datetime import datetime
from enum import Enum
from typing import List
from pydantic import BaseModel, Field, field_validator
import re


class EditalType(str, Enum):
    """Type of PNLD edital."""

    DIDATICO = "didático"
    LITERARIO = "literário"
    OUTROS = "outros"


class EditalBase(BaseModel):
    """Base edital model with common fields."""

    name: str = Field(..., min_length=1, max_length=40, description="Edital name")
    year: int = Field(..., ge=2000, le=2100, description="Year in YYYY format")
    type: EditalType = Field(..., description="Type of edital")

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: str) -> str:
        """Validate and clean name."""
        v = v.strip()
        if not v:
            raise ValueError("Name cannot be empty")
        if len(v) > 40:
            raise ValueError("Name must be at most 40 characters")
        return v

    @field_validator("year")
    @classmethod
    def validate_year(cls, v: int) -> int:
        """Validate year is in YYYY format."""
        if v < 2000 or v > 2100:
            raise ValueError("Year must be between 2000 and 2100")
        return v


class CreateEditalRequest(EditalBase):
    """Request model for creating a new edital."""

    pass


class UpdateEditalRequest(BaseModel):
    """Request model for updating an edital."""

    name: str | None = Field(None, min_length=1, max_length=40)
    year: int | None = Field(None, ge=2000, le=2100)
    type: EditalType | None = None

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: str | None) -> str | None:
        """Validate and clean name if provided."""
        if v is not None:
            v = v.strip()
            if not v:
                raise ValueError("Name cannot be empty")
            if len(v) > 40:
                raise ValueError("Name must be at most 40 characters")
        return v

    @field_validator("year")
    @classmethod
    def validate_year(cls, v: int | None) -> int | None:
        """Validate year if provided."""
        if v is not None and (v < 2000 or v > 2100):
            raise ValueError("Year must be between 2000 and 2100")
        return v


class EditalResponse(EditalBase):
    """Response model for edital."""

    id: str = Field(..., description="Edital ID (slug)")
    created_at: datetime
    updated_at: datetime

    class Config:
        """Pydantic configuration."""

        from_attributes = True


class ListEditaisResponse(BaseModel):
    """Response model for list editais endpoint."""

    editais: List[EditalResponse]
    total: int


def generate_slug(name: str, year: int) -> str:
    """
    Generate a slug from edital name and year.

    Args:
        name: Edital name
        year: Edital year

    Returns:
        Slug string (e.g., "pnld-2024-didatico")
    """
    # Convert to lowercase
    slug = name.lower()

    # Remove accents/diacritics
    slug = (
        slug.replace("á", "a")
        .replace("à", "a")
        .replace("ã", "a")
        .replace("â", "a")
        .replace("é", "e")
        .replace("ê", "e")
        .replace("í", "i")
        .replace("ó", "o")
        .replace("õ", "o")
        .replace("ô", "o")
        .replace("ú", "u")
        .replace("ü", "u")
        .replace("ç", "c")
    )

    # Replace spaces and special chars with hyphens
    slug = re.sub(r"[^a-z0-9]+", "-", slug)

    # Remove leading/trailing hyphens
    slug = slug.strip("-")

    # Add year
    slug = f"{slug}-{year}"

    return slug
