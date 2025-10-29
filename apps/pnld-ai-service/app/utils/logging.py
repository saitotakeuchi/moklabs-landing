"""Centralized logging configuration for the PNLD AI Service.

This module provides structured logging with:
- Consistent log formatting across the application
- Contextual metadata (request_id, conversation_id, etc.)
- Configurable log levels based on environment
- JSON formatting for production environments
"""

import logging
import sys
from typing import Optional, Dict, Any
from contextvars import ContextVar
from app.config import settings

# Context variables for request tracing
request_id_var: ContextVar[Optional[str]] = ContextVar('request_id', default=None)
conversation_id_var: ContextVar[Optional[str]] = ContextVar('conversation_id', default=None)


class ContextFormatter(logging.Formatter):
    """Custom formatter that includes contextual metadata."""

    def format(self, record: logging.LogRecord) -> str:
        """Format log record with context variables."""
        # Add context variables to the log record
        record.request_id = request_id_var.get() or '-'
        record.conversation_id = conversation_id_var.get() or '-'

        return super().format(record)


def setup_logging(log_level: Optional[str] = None) -> None:
    """
    Configure application-wide logging.

    Args:
        log_level: Optional log level override (DEBUG, INFO, WARNING, ERROR, CRITICAL)
                  If not provided, uses INFO for production, DEBUG for development
    """
    # Determine log level
    if log_level:
        level = getattr(logging, log_level.upper())
    else:
        level = logging.DEBUG if settings.ENVIRONMENT == "development" else logging.INFO

    # Create formatter
    if settings.ENVIRONMENT == "production":
        # JSON-like format for production (easier to parse)
        fmt = '{"time":"%(asctime)s","level":"%(levelname)s","name":"%(name)s","request_id":"%(request_id)s","conversation_id":"%(conversation_id)s","message":"%(message)s"}'
    else:
        # Human-readable format for development
        fmt = '%(asctime)s [%(levelname)s] %(name)s [req:%(request_id)s|conv:%(conversation_id)s] - %(message)s'

    formatter = ContextFormatter(fmt, datefmt='%Y-%m-%d %H:%M:%S')

    # Configure root logger
    root_logger = logging.getLogger()
    root_logger.setLevel(level)

    # Remove existing handlers
    for handler in root_logger.handlers[:]:
        root_logger.removeHandler(handler)

    # Add console handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(level)
    console_handler.setFormatter(formatter)
    root_logger.addHandler(console_handler)

    # Reduce noise from third-party libraries
    logging.getLogger("httpx").setLevel(logging.WARNING)
    logging.getLogger("httpcore").setLevel(logging.WARNING)
    logging.getLogger("openai").setLevel(logging.INFO)
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)


def get_logger(name: str) -> logging.Logger:
    """
    Get a logger instance for the specified module.

    Args:
        name: Logger name (typically __name__ of the module)

    Returns:
        Configured logger instance

    Example:
        >>> logger = get_logger(__name__)
        >>> logger.info("Processing request")
    """
    return logging.getLogger(name)


def set_request_context(request_id: Optional[str] = None, conversation_id: Optional[str] = None) -> None:
    """
    Set contextual information for the current request.

    This information will be automatically included in all log messages
    within the current async context.

    Args:
        request_id: Unique identifier for the HTTP request
        conversation_id: Unique identifier for the conversation (if applicable)

    Example:
        >>> set_request_context(request_id="abc-123", conversation_id="conv-456")
        >>> logger.info("Processing message")  # Will include both IDs
    """
    if request_id:
        request_id_var.set(request_id)
    if conversation_id:
        conversation_id_var.set(conversation_id)


def clear_request_context() -> None:
    """Clear contextual information after request completion."""
    request_id_var.set(None)
    conversation_id_var.set(None)


def log_with_context(logger: logging.Logger, level: str, message: str, **kwargs: Any) -> None:
    """
    Log a message with additional context metadata.

    Args:
        logger: Logger instance to use
        level: Log level (debug, info, warning, error, critical)
        message: Log message
        **kwargs: Additional context to include in the log

    Example:
        >>> log_with_context(logger, "info", "Document indexed", document_id="doc-123", chunks=50)
    """
    log_func = getattr(logger, level.lower())

    if kwargs:
        # Format kwargs as key=value pairs
        context = " ".join(f"{k}={v}" for k, v in kwargs.items())
        log_func(f"{message} | {context}")
    else:
        log_func(message)


# Initialize logging on module import
setup_logging()
