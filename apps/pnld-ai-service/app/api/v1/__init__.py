"""API v1 routes."""

from fastapi import APIRouter
from .health import router as health_router
from .chat import router as chat_router
from .documents import router as documents_router
from .editais import router as editais_router

api_router = APIRouter()
api_router.include_router(health_router, prefix="/health", tags=["health"])
api_router.include_router(chat_router, prefix="/chat", tags=["chat"])
api_router.include_router(documents_router, prefix="/documents", tags=["documents"])
api_router.include_router(editais_router, prefix="/editais", tags=["editais"])
