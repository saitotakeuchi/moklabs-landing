# Logging and Observability Documentation

## Overview

The PNLD AI Service implements structured logging with request tracing to provide comprehensive observability for debugging and monitoring.

## Logging Strategy

### Centralized Configuration

All logging is configured through `app/utils/logging.py`, which provides:

- **Structured logging** with consistent formatting
- **Contextual metadata** (request_id, conversation_id, etc.)
- **Environment-aware configuration** (DEBUG in dev, INFO in production)
- **JSON formatting** for production (easier to parse by log aggregation tools)
- **Human-readable formatting** for development

### Log Levels

The service uses Python's standard logging levels:

- **DEBUG**: Detailed diagnostic information (e.g., timestamp updates, internal state changes)
- **INFO**: General informational messages (e.g., successful operations, request completion)
- **WARNING**: Warning messages for recoverable issues (e.g., fallback mechanisms triggered)
- **ERROR**: Error messages for failures (e.g., exceptions, failed operations)
- **CRITICAL**: Critical failures requiring immediate attention

### Log Format

**Development Format:**
```
2025-01-29 10:30:45 [INFO] app.api.v1.chat [req:abc-123|conv:conv-456] - Chat completed successfully
```

**Production Format (JSON-like):**
```json
{"time":"2025-01-29 10:30:45","level":"INFO","name":"app.api.v1.chat","request_id":"abc-123","conversation_id":"conv-456","message":"Chat completed successfully"}
```

## Request Tracing

### Request ID

Every HTTP request is assigned a unique request ID that:

- Is generated automatically or extracted from the `X-Request-ID` header
- Is included in all log messages within that request
- Is returned in the response headers for client-side correlation
- Persists through the entire request lifecycle

### Conversation ID

Chat endpoints also track conversation IDs, allowing you to:

- Trace all messages within a conversation
- Correlate logs across multiple API calls
- Monitor conversation-level metrics

### Usage Example

```python
from app.utils.logging import get_logger, set_request_context

logger = get_logger(__name__)

# Set context (done automatically by middleware for request_id)
set_request_context(conversation_id="conv-123")

# All subsequent logs will include this context
logger.info("Processing message")
# Output: [req:abc-123|conv:conv-123] - Processing message
```

## Logging Best Practices

### 1. Use Appropriate Log Levels

```python
# Good examples:
logger.debug("Cache hit for document", extra={"document_id": doc_id})
logger.info("Document indexed successfully", extra={"document_id": doc_id})
logger.warning("Falling back to alternative method", extra={"reason": str(e)})
logger.error("Failed to index document", extra={"error": str(e), "error_type": type(e).__name__})
```

### 2. Include Contextual Metadata

Always include relevant context using the `extra` parameter:

```python
logger.info(
    "Vector search completed",
    extra={
        "query_preview": query[:50],
        "edital_id": edital_id,
        "result_count": len(results),
        "threshold": similarity_threshold,
    }
)
```

### 3. Avoid Print Statements

**Never use** `print()` statements. Always use the logger:

```python
# Bad:
print(f"Processing {count} documents")

# Good:
logger.info(f"Processing documents", extra={"count": count})
```

### 4. Log Successful Operations

Don't just log errors - log successful completions too:

```python
# After successful operation
logger.info(
    "PDF uploaded successfully",
    extra={
        "document_id": document_id,
        "filename": file.filename,
        "file_size": len(pdf_content)
    }
)
```

### 5. Safe Error Logging

Ensure error logging doesn't leak sensitive information:

```python
try:
    # operation
except Exception as e:
    # Log with safe, structured information
    logger.error(
        "Operation failed",
        extra={
            "operation": "pdf_upload",
            "error": str(e),
            "error_type": type(e).__name__,
            # Don't include sensitive data like API keys, passwords, etc.
        }
    )
    # Re-raise or handle appropriately
```

## Error Handling Patterns

### HTTP Exception Handling

```python
try:
    # operation
    logger.info("Operation completed successfully", extra={...})

except HTTPException:
    # Re-raise HTTP exceptions (already have proper status codes)
    raise

except ValueError as e:
    # Specific expected errors
    logger.warning("Invalid input", extra={"error": str(e)})
    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail=f"Invalid input: {str(e)}"
    )

except Exception as e:
    # Unexpected errors
    logger.error("Unexpected error", extra={"error": str(e), "error_type": type(e).__name__})
    raise HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail=f"Operation failed: {str(e)}"
    )
```

### Streaming Response Error Handling

For Server-Sent Events (SSE) endpoints:

```python
try:
    # operation
    yield f"event: data\ndata: {json.dumps(data)}\n\n"
    logger.info("Stream completed", extra={...})

except Exception as e:
    logger.error("Stream failed", extra={"error": str(e)})
    # Send error event to client
    error_data = {"error": str(e), "conversation_id": conversation_id}
    yield f"event: error\ndata: {json.dumps(error_data)}\n\n"
```

## Conversation State Management

### Updated_at Timestamp

The `chat_conversations.updated_at` field is automatically maintained:

1. **Database Trigger**: Updates on direct table modifications
2. **Application Layer**: Explicitly updated after message inserts via `update_conversation_timestamp()`

This ensures `updated_at` always reflects the latest message activity.

### Implementation

```python
# After storing messages
await update_conversation_timestamp(conversation_id)
```

The function:
- Updates the conversation's `updated_at` to current timestamp
- Logs warnings (not errors) if update fails
- Doesn't block the main operation if timestamp update fails

## Configuration

### Environment Variables

Logging behavior is controlled by the `ENVIRONMENT` setting in `.env`:

- `ENVIRONMENT=development`: DEBUG level, human-readable format
- `ENVIRONMENT=production`: INFO level, JSON format

### Customization

To change log levels without modifying code:

1. Set `LOG_LEVEL` environment variable:
   ```bash
   LOG_LEVEL=WARNING
   ```

2. Or programmatically in `app/main.py`:
   ```python
   from app.utils.logging import setup_logging
   setup_logging(log_level="WARNING")
   ```

## Monitoring and Alerting

### Key Metrics to Monitor

1. **Error Rate**:
   - Count of ERROR and CRITICAL log levels
   - Alert if error rate exceeds threshold

2. **Request Latency**:
   - Time between "Request started" and "Request completed" logs
   - Track p50, p95, p99 percentiles

3. **Operation Success Rates**:
   - Track INFO logs for successful operations
   - Monitor ratio of successes to errors

4. **Conversation Activity**:
   - Track conversation creation and message counts
   - Monitor for unusual patterns

### Log Aggregation

For production deployments, integrate with log aggregation tools:

- **Datadog**: Parse JSON logs, create dashboards
- **CloudWatch**: Use JSON format for structured queries
- **Elasticsearch/Kibana**: Index JSON logs for search and visualization
- **Grafana Loki**: Lightweight log aggregation

Example CloudWatch Insights query:
```
fields @timestamp, level, name, request_id, conversation_id, message
| filter level = "ERROR"
| sort @timestamp desc
| limit 100
```

## Troubleshooting

### Common Issues

#### Logs Not Appearing

**Cause**: Third-party library logs overwhelming output

**Solution**: Adjust library log levels in `app/utils/logging.py`:
```python
logging.getLogger("httpx").setLevel(logging.WARNING)
logging.getLogger("openai").setLevel(logging.INFO)
```

#### Missing Request Context

**Cause**: Code running outside request lifecycle

**Solution**: Manually set context:
```python
from app.utils.logging import set_request_context
set_request_context(request_id="manual-id")
```

#### Timestamp Updates Not Working

**Cause**: Database trigger or application-layer update failing

**Solution**:
1. Check logs for "Failed to update conversation timestamp" warnings
2. Verify database trigger exists:
   ```sql
   SELECT * FROM pg_trigger WHERE tgname = 'update_chat_conversations_updated_at';
   ```
3. Ensure Supabase permissions allow updates

## Testing

### Unit Tests

Example test for logging:

```python
import logging
from app.utils.logging import get_logger

def test_logging_with_context(caplog):
    logger = get_logger("test")

    with caplog.at_level(logging.INFO):
        logger.info("Test message", extra={"key": "value"})

    assert "Test message" in caplog.text
```

### Integration Tests

Test conversation timestamp updates:

```python
async def test_conversation_timestamp_update():
    # Create conversation
    conv_id = await create_conversation()
    initial_time = await get_conversation_updated_at(conv_id)

    # Add message
    await chat_endpoint(conversation_id=conv_id, message="Hello")

    # Verify timestamp updated
    updated_time = await get_conversation_updated_at(conv_id)
    assert updated_time > initial_time
```

## Migration from Print Statements

All `print()` statements have been replaced with structured logging:

| Old Code | New Code |
|----------|----------|
| `print(f"Error: {e}")` | `logger.error("Error occurred", extra={"error": str(e)})` |
| `print("Starting operation")` | `logger.info("Starting operation")` |
| `print(f"Warning: {msg}")` | `logger.warning(msg, extra={...})` |

## Related Documentation

- [README.md](./README.md) - General service documentation
- [QUERY_OPTIMIZATIONS.md](./QUERY_OPTIMIZATIONS.md) - Database query performance
- [CONTAINER_REPRODUCIBILITY.md](./CONTAINER_REPRODUCIBILITY.md) - Docker build strategy

## Support

For questions or issues:
1. Check application logs for ERROR/WARNING messages
2. Verify request_id and conversation_id correlation
3. Review this documentation for best practices
4. Contact the development team with specific log excerpts

---

**Last Updated**: 2025-01-29
**Author**: Claude Code
**Related Issue**: Observability & Conversation State Upkeep
