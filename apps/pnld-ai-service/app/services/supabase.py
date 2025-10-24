"""Supabase client singleton."""

from supabase import acreate_client
from supabase._async.client import AsyncClient
from app.config import settings


_supabase_client: AsyncClient | None = None


async def get_async_supabase_client() -> AsyncClient:
    """
    Get or create the async Supabase client singleton.

    Returns:
        Async Supabase client instance
    """
    global _supabase_client

    if _supabase_client is None:
        _supabase_client = await acreate_client(
            supabase_url=settings.SUPABASE_URL,
            supabase_key=settings.SUPABASE_SERVICE_KEY,
        )

    return _supabase_client
