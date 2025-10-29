"""Edital management API endpoints."""

from fastapi import APIRouter, HTTPException, status
from typing import List
from app.models.edital import (
    CreateEditalRequest,
    UpdateEditalRequest,
    EditalResponse,
    ListEditaisResponse,
    generate_slug,
)
from app.services.supabase import get_async_supabase_client

router = APIRouter(tags=["editais"])


@router.get("", response_model=ListEditaisResponse)
async def list_editais(
    limit: int = 100,
    offset: int = 0,
    year: int | None = None,
    type: str | None = None,
) -> ListEditaisResponse:
    """
    List all editais with optional filtering.

    Args:
        limit: Maximum number of editais to return (default: 100)
        offset: Number of editais to skip (default: 0)
        year: Filter by year (optional)
        type: Filter by type (optional)

    Returns:
        List of editais with total count
    """
    supabase = await get_async_supabase_client()

    # Build query
    query = supabase.table("editais").select("*", count="exact")

    # Apply filters
    if year is not None:
        query = query.eq("year", year)
    if type is not None:
        query = query.eq("type", type)

    # Apply pagination and sorting
    query = query.order("created_at", desc=True).range(offset, offset + limit - 1)

    # Execute query
    response = query.execute()

    return ListEditaisResponse(
        editais=[EditalResponse(**edital) for edital in response.data],
        total=response.count or 0,
    )


@router.get("/{edital_id}", response_model=EditalResponse)
async def get_edital(edital_id: str) -> EditalResponse:
    """
    Get a specific edital by ID.

    Args:
        edital_id: Edital slug ID

    Returns:
        Edital details

    Raises:
        HTTPException: If edital not found
    """
    supabase = await get_async_supabase_client()

    response = supabase.table("editais").select("*").eq("id", edital_id).execute()

    if not response.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Edital with ID '{edital_id}' not found",
        )

    return EditalResponse(**response.data[0])


@router.post("", response_model=EditalResponse, status_code=status.HTTP_201_CREATED)
async def create_edital(request: CreateEditalRequest) -> EditalResponse:
    """
    Create a new edital.

    Args:
        request: Edital creation request

    Returns:
        Created edital

    Raises:
        HTTPException: If edital with same name/year exists or creation fails
    """
    supabase = await get_async_supabase_client()

    # Generate slug from name and year
    edital_id = generate_slug(request.name, request.year)

    # Check if edital with same ID already exists
    existing = (
        supabase.table("editais").select("id").eq("id", edital_id).execute()
    )

    if existing.data:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Edital with name '{request.name}' and year {request.year} already exists",
        )

    # Insert new edital
    edital_data = {
        "id": edital_id,
        "name": request.name,
        "year": request.year,
        "type": request.type.value,
    }

    response = supabase.table("editais").insert(edital_data).execute()

    if not response.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create edital",
        )

    return EditalResponse(**response.data[0])


@router.put("/{edital_id}", response_model=EditalResponse)
async def update_edital(
    edital_id: str, request: UpdateEditalRequest
) -> EditalResponse:
    """
    Update an existing edital.

    Args:
        edital_id: Edital slug ID
        request: Edital update request

    Returns:
        Updated edital

    Raises:
        HTTPException: If edital not found or update fails
    """
    supabase = await get_async_supabase_client()

    # Check if edital exists
    existing = supabase.table("editais").select("*").eq("id", edital_id).execute()

    if not existing.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Edital with ID '{edital_id}' not found",
        )

    # Build update data (only include fields that are provided)
    update_data = {}
    if request.name is not None:
        update_data["name"] = request.name
    if request.year is not None:
        update_data["year"] = request.year
    if request.type is not None:
        update_data["type"] = request.type.value

    # If name or year changed, we need to update the ID (slug)
    if request.name is not None or request.year is not None:
        current_data = existing.data[0]
        new_name = request.name if request.name is not None else current_data["name"]
        new_year = request.year if request.year is not None else current_data["year"]
        new_id = generate_slug(new_name, new_year)

        # If ID changed, we need to:
        # 1. Update all documents referencing this edital
        # 2. Delete old edital
        # 3. Create new edital with new ID
        if new_id != edital_id:
            # Update documents
            supabase.table("documents").update({"edital_id": new_id}).eq(
                "edital_id", edital_id
            ).execute()

            # Delete old edital
            supabase.table("editais").delete().eq("id", edital_id).execute()

            # Create new edital
            edital_data = {
                "id": new_id,
                "name": new_name,
                "year": new_year,
                "type": (
                    request.type.value
                    if request.type is not None
                    else current_data["type"]
                ),
            }

            response = supabase.table("editais").insert(edital_data).execute()

            if not response.data:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to update edital",
                )

            return EditalResponse(**response.data[0])

    # Update edital
    response = (
        supabase.table("editais")
        .update(update_data)
        .eq("id", edital_id)
        .execute()
    )

    if not response.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update edital",
        )

    return EditalResponse(**response.data[0])


@router.delete("/{edital_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_edital(edital_id: str) -> None:
    """
    Delete an edital.

    Note: This will fail if there are documents associated with this edital.
    Delete all associated documents first.

    Args:
        edital_id: Edital slug ID

    Raises:
        HTTPException: If edital not found, has associated documents, or deletion fails
    """
    supabase = await get_async_supabase_client()

    # Check if edital exists
    existing = supabase.table("editais").select("id").eq("id", edital_id).execute()

    if not existing.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Edital with ID '{edital_id}' not found",
        )

    # Check if there are documents associated with this edital
    documents = (
        supabase.table("documents")
        .select("id", count="exact")
        .eq("edital_id", edital_id)
        .limit(1)
        .execute()
    )

    if documents.count and documents.count > 0:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Cannot delete edital: {documents.count} document(s) are still associated with it. Delete the documents first.",
        )

    # Delete edital
    response = supabase.table("editais").delete().eq("id", edital_id).execute()

    if not response.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete edital",
        )
