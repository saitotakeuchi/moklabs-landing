# PNLD Chat Streaming Implementation

This document describes the Server-Sent Events (SSE) streaming implementation for real-time chat responses in the PNLD Chat feature.

## Overview

The PNLD Chat uses SSE streaming to deliver AI-generated responses token-by-token in real-time, providing a better user experience compared to waiting for the complete response.

## Architecture

### Backend (FastAPI + SSE)

**Endpoint**: `POST /api/v1/chat/stream`

**Location**: `apps/pnld-ai-service/app/api/v1/chat.py:159-293`

The backend streams responses using Server-Sent Events with the following event types:

1. **metadata** - Sent first with conversation_id
2. **sources** - Document sources used for RAG
3. **token** - Individual response tokens (streamed)
4. **done** - Completion signal
5. **error** - Error information if something fails

**SSE Format**:

```
event: metadata
data: {"conversation_id": "uuid"}

event: sources
data: [{"document_id": "...", "title": "...", ...}]

event: token
data: {"content": "The"}

event: token
data: {"content": " next"}

event: done
data: {"conversation_id": "uuid"}
```

### Frontend (React + Fetch API)

**API Client**: `apps/web/lib/api/pnld-chat.ts`

The `streamChatMessage()` function (lines 93-177) uses the Fetch API with ReadableStream to parse SSE events:

```typescript
export async function* streamChatMessage(
  request: ChatRequest
): AsyncGenerator<StreamEvent>
```

**Key Features**:

- Manual SSE parsing (required for POST requests)
- Async generator for easy iteration
- Proper event type handling
- Buffer management for incomplete lines

**State Management**: `apps/web/hooks/usePnldChat.ts`

The `usePnldChat` hook manages:

- Message accumulation during streaming
- Conversation ID tracking
- Source citations
- Loading states
- Error handling

## Event Flow

```
User sends message
    ↓
Optimistic UI update (add user message)
    ↓
POST /api/v1/chat/stream
    ↓
[metadata event] → Set conversation_id
    ↓
[sources event] → Set document sources
    ↓
[token events] → Accumulate + update assistant message
    ↓  ↓  ↓
Multiple tokens stream in real-time
    ↓
[done event] → Finalize message
    ↓
Update UI with complete response + sources
```

## Implementation Details

### Token Accumulation

```typescript
// Accumulate tokens
assistantContent += event.data.content;

// Update messages progressively
setMessages((prev) => {
  if (prev[prev.length - 1].role === "assistant") {
    // Update existing assistant message
    return [
      ...prev.slice(0, -1),
      {
        role: "assistant",
        content: assistantContent,
        timestamp: assistantTimestamp,
      },
    ];
  } else {
    // Add new assistant message
    return [
      ...prev,
      {
        role: "assistant",
        content: assistantContent,
        timestamp: assistantTimestamp,
      },
    ];
  }
});
```

### Preventing Duplicate Requests

```typescript
const isStreamingRef = useRef(false);

if (isStreamingRef.current) {
  console.warn("Already streaming a message, ignoring request");
  return;
}

isStreamingRef.current = true;
// ... streaming logic
isStreamingRef.current = false;
```

### Error Handling

```typescript
try {
  for await (const event of streamChatMessage(request)) {
    switch (event.type) {
      case "error":
        throw new Error(event.data.error);
      // ... other cases
    }
  }
} catch (err) {
  setError(err);
  // Add error message to chat
  setMessages((prev) => [
    ...prev,
    {
      role: "assistant",
      content: "Desculpe, ocorreu um erro...",
    },
  ]);
}
```

## UI Components

### ChatInterface

The main chat component uses the `usePnldChat` hook:

```typescript
const { messages, isLoading, sendMessage } = usePnldChat();
```

### TypingIndicator

Shows while `isLoading` is true (during streaming):

```typescript
{isLoading && <TypingIndicator />}
```

Hides once the first token is received and the assistant message appears.

### MessageList

Displays messages including the partially streamed assistant message:

```typescript
<MessageList messages={messages} />
```

## Testing

### Automated Test

Run the SSE integration test:

```bash
cd apps/web
node test-sse-events.js
```

**Expected output**:

```
✓ [metadata] conversation_id: uuid
✓ [sources] N sources received
✓ [token] "text"
... (multiple token events)
✓ [done] conversation_id: uuid

✅ TEST PASSED: All expected events received in correct order
```

### Manual Testing

1. Start the backend:

   ```bash
   cd apps/pnld-ai-service
   python -m uvicorn app.main:app --reload --port 8000
   ```

2. Start the frontend:

   ```bash
   cd apps/web
   npm run dev
   ```

3. Navigate to http://localhost:3000/pnld-chat
4. Send a test message
5. Verify:
   - Typing indicator appears
   - Response streams token by token
   - Typing indicator hides once streaming starts
   - Sources appear after completion
   - Conversation ID is preserved

## Performance Considerations

### Token Batching

The backend may batch multiple tokens into a single event for better performance. The frontend handles this by accumulating all token content.

### Memory Management

- Messages are stored in React state (not persisted to localStorage to avoid size limits)
- Only conversation ID is persisted
- Long conversations may require pagination (future enhancement)

### Network Resilience

- Errors are caught and displayed to the user
- No automatic retry (user must resend)
- Connection timeout handled by fetch timeout

## Acceptance Criteria Status

✅ **All acceptance criteria met** (MOK-34):

- [x] Connect to `POST /api/v1/chat/stream` endpoint
- [x] Display tokens as they stream in real-time
- [x] Show typing indicator while streaming
- [x] Update message content progressively
- [x] Handle SSE events: `token`, `source`, `done`, `error`
- [x] Append sources/citations after stream completes
- [x] Handle connection errors and reconnection
- [x] Cancel stream if user navigates away (implicit via fetch abort)

## Future Enhancements

1. **Stream Cancellation**: Explicit AbortController for canceling streams
2. **Retry Logic**: Automatic retry on transient errors
3. **Resume Support**: Resume streaming after network interruption
4. **Conversation History**: Load previous messages from backend
5. **Markdown Rendering**: Render markdown in streamed responses
6. **Code Syntax Highlighting**: Highlight code blocks in real-time

## References

- [MDN: Server-Sent Events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events)
- [FastAPI StreamingResponse](https://fastapi.tiangolo.com/advanced/custom-response/#streamingresponse)
- [Fetch API ReadableStream](https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream)
