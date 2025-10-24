"""Health check endpoints."""

from fastapi import APIRouter, status
from datetime import datetime
from app.config import settings
from app.services.supabase import get_async_supabase_client

router = APIRouter()


@router.get("", status_code=status.HTTP_200_OK)
async def health_check() -> dict[str, str | bool]:
    """
    Health check endpoint.

    Returns the service status and timestamp.
    """
    return {
        "status": "healthy",
        "service": settings.APP_NAME,
        "version": settings.VERSION,
        "timestamp": datetime.utcnow().isoformat(),
    }


@router.get("/supabase", status_code=status.HTTP_200_OK)
async def supabase_health() -> dict[str, str | bool]:
    """
    Check Supabase connection health.

    Returns whether Supabase is accessible.
    """
    try:
        client = await get_async_supabase_client()
        # Simple query to test connection
        response = await client.table("pnld_documents").select("count", count="exact").limit(0).execute()

        return {
            "status": "healthy",
            "supabase_connected": True,
            "timestamp": datetime.utcnow().isoformat(),
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "supabase_connected": False,
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat(),
        }
