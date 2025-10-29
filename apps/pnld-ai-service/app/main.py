"""FastAPI application entry point for PNLD AI Service."""

import uuid
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.api.v1 import api_router
from app.utils.logging import setup_logging, get_logger, set_request_context, clear_request_context

# Initialize logging
setup_logging()
logger = get_logger(__name__)


def create_app() -> FastAPI:
    """Create and configure the FastAPI application."""
    app = FastAPI(
        title=settings.APP_NAME,
        version=settings.VERSION,
        description="RAG-based AI service for PNLD chat functionality using Supabase",
        docs_url="/docs" if settings.ENVIRONMENT == "development" else None,
        redoc_url="/redoc" if settings.ENVIRONMENT == "development" else None,
    )

    # Configure CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Request ID middleware for tracing
    @app.middleware("http")
    async def add_request_id(request: Request, call_next):
        """Add request ID to headers and logging context."""
        # Generate or extract request ID
        request_id = request.headers.get("X-Request-ID") or str(uuid.uuid4())

        # Set request context for logging
        set_request_context(request_id=request_id)

        # Log incoming request
        logger.info(f"Request started: {request.method} {request.url.path}")

        try:
            response = await call_next(request)
            # Add request ID to response headers
            response.headers["X-Request-ID"] = request_id

            logger.info(f"Request completed: {request.method} {request.url.path} status={response.status_code}")
            return response
        finally:
            # Clear context after request
            clear_request_context()

    # Include API routes
    app.include_router(api_router, prefix="/api/v1")

    logger.info(f"Application initialized: {settings.APP_NAME} v{settings.VERSION} (env={settings.ENVIRONMENT})")

    return app


app = create_app()


@app.get("/")
async def root() -> dict[str, str]:
    """Root endpoint returning service information."""
    return {
        "service": settings.APP_NAME,
        "version": settings.VERSION,
        "status": "running",
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=settings.PORT,
        reload=settings.ENVIRONMENT == "development",
    )
