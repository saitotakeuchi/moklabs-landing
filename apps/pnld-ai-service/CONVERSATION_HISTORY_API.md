# Conversation History API Documentation

## Overview

The Conversation History endpoint retrieves the complete conversation history including all messages and metadata. This endpoint is essential for building chat UIs that need to display or restore conversation context.

## Endpoint

**GET** `/api/v1/chat/{conversation_id}`

## Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `conversation_id` | string (UUID) | Yes | Unique conversation identifier returned from chat endpoints |

## Response

### Success Response (200 OK)

```json
{
  "conversation_id": "550e8400-e29b-41d4-a716-446655440000",
  "edital_id": "PNLD-2027-2030-ANOS-INICIAIS",
  "messages": [
    {
      "role": "user",
      "content": "What are the main evaluation criteria?",
      "timestamp": "2025-10-22T14:30:00Z"
    },
    {
      "role": "assistant",
      "content": "The main evaluation criteria include pedagogical quality, accessibility, and alignment with BNCC guidelines...",
      "timestamp": "2025-10-22T14:30:05Z"
    },
    {
      "role": "user",
      "content": "Can you elaborate on accessibility requirements?",
      "timestamp": "2025-10-22T14:31:00Z"
    },
    {
      "role": "assistant",
      "content": "Accessibility requirements include support for students with visual, auditory, and cognitive disabilities...",
      "timestamp": "2025-10-22T14:31:08Z"
    }
  ],
  "created_at": "2025-10-22T14:30:00Z",
  "updated_at": "2025-10-22T14:31:08Z",
  "metadata": {}
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `conversation_id` | String (UUID) | Unique conversation identifier |
| `edital_id` | String (nullable) | Associated PNLD edital identifier |
| `messages` | Array | All messages in chronological order |
| `messages[].role` | String | Message role: "user", "assistant", or "system" |
| `messages[].content` | String | Message content/text |
| `messages[].timestamp` | String (ISO 8601) | When the message was created |
| `created_at` | String (ISO 8601) | Conversation creation timestamp |
| `updated_at` | String (ISO 8601) | Last update timestamp |
| `metadata` | Object (nullable) | Additional conversation metadata |

## Error Responses

### 404 Not Found

**Scenario: Conversation does not exist**

```json
{
  "detail": "Conversation 550e8400-e29b-41d4-a716-446655440000 not found"
}
```

### 422 Unprocessable Entity

**Scenario: Invalid UUID format**

```json
{
  "detail": [
    {
      "loc": ["path", "conversation_id"],
      "msg": "value is not a valid uuid",
      "type": "type_error.uuid"
    }
  ]
}
```

### 500 Internal Server Error

```json
{
  "detail": "Failed to retrieve conversation: [error message] | Type: [error type]"
}
```

## Usage Examples

### Example 1: Retrieve Conversation History

```bash
curl -X GET "https://pnld-ai-service.fly.dev/api/v1/chat/550e8400-e29b-41d4-a716-446655440000"
```

**Response:**

```json
{
  "conversation_id": "550e8400-e29b-41d4-a716-446655440000",
  "edital_id": "PNLD-2027-2030",
  "messages": [
    {
      "role": "user",
      "content": "What are the evaluation criteria?",
      "timestamp": "2025-10-22T14:30:00Z"
    },
    {
      "role": "assistant",
      "content": "The evaluation criteria include...",
      "timestamp": "2025-10-22T14:30:05Z"
    }
  ],
  "created_at": "2025-10-22T14:30:00Z",
  "updated_at": "2025-10-22T14:30:05Z",
  "metadata": {}
}
```

### Using Python

```python
import requests

base_url = "https://pnld-ai-service.fly.dev"
conversation_id = "550e8400-e29b-41d4-a716-446655440000"

# Get conversation history
response = requests.get(f"{base_url}/api/v1/chat/{conversation_id}")

if response.status_code == 200:
    conversation = response.json()

    print(f"Conversation ID: {conversation['conversation_id']}")
    print(f"Total messages: {len(conversation['messages'])}")
    print(f"Created: {conversation['created_at']}")

    # Display messages
    for msg in conversation['messages']:
        print(f"[{msg['role']}]: {msg['content']}")
elif response.status_code == 404:
    print("Conversation not found")
else:
    print(f"Error: {response.status_code}")
```

### Using JavaScript (Fetch API)

```javascript
const baseUrl = 'https://pnld-ai-service.fly.dev';
const conversationId = '550e8400-e29b-41d4-a716-446655440000';

// Get conversation history
const response = await fetch(`${baseUrl}/api/v1/chat/${conversationId}`);

if (response.ok) {
  const conversation = await response.json();

  console.log('Conversation ID:', conversation.conversation_id);
  console.log('Total messages:', conversation.messages.length);
  console.log('Created:', conversation.created_at);

  // Display messages
  conversation.messages.forEach(msg => {
    console.log(`[${msg.role}]: ${msg.content}`);
  });
} else if (response.status === 404) {
  console.log('Conversation not found');
} else {
  console.log('Error:', response.status);
}
```

## Message Ordering

Messages are **always returned in chronological order** (oldest first), ordered by the `created_at` timestamp. This ensures consistent conversation flow when displaying messages in a UI.

```python
# Messages are guaranteed to be in chronological order
messages = conversation['messages']
assert messages[0]['timestamp'] <= messages[1]['timestamp']
```

## Integration with Chat Endpoints

### Workflow: Create → Continue → Retrieve

```python
import requests

base_url = "https://pnld-ai-service.fly.dev"

# 1. Create new conversation with first message
response = requests.post(
    f"{base_url}/api/v1/chat",
    json={
        "message": "What are the evaluation criteria?",
        "edital_id": "PNLD-2027-2030"
    }
)
conversation_id = response.json()['conversation_id']

# 2. Continue conversation with follow-up message
response = requests.post(
    f"{base_url}/api/v1/chat",
    json={
        "message": "Can you provide more details?",
        "conversation_id": conversation_id,
        "edital_id": "PNLD-2027-2030"
    }
)

# 3. Retrieve full conversation history
response = requests.get(f"{base_url}/api/v1/chat/{conversation_id}")
conversation = response.json()

print(f"Total messages: {len(conversation['messages'])}")  # 4 (2 user + 2 assistant)
```

## Use Cases

### Chat UI with Conversation History

```typescript
// React example
import { useEffect, useState } from 'react';

function ChatHistory({ conversationId }: { conversationId: string }) {
  const [conversation, setConversation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch(
          `/api/v1/chat/${conversationId}`
        );

        if (response.ok) {
          const data = await response.json();
          setConversation(data);
        } else if (response.status === 404) {
          setError('Conversation not found');
        } else {
          setError('Failed to load conversation');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [conversationId]);

  if (loading) return <div>Loading conversation...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!conversation) return null;

  return (
    <div>
      <h2>Conversation History</h2>
      <p>Created: {new Date(conversation.created_at).toLocaleString()}</p>
      <p>Last updated: {new Date(conversation.updated_at).toLocaleString()}</p>

      <div className="messages">
        {conversation.messages.map((msg, idx) => (
          <div key={idx} className={`message message-${msg.role}`}>
            <div className="role">{msg.role}</div>
            <div className="content">{msg.content}</div>
            <div className="timestamp">
              {new Date(msg.timestamp).toLocaleTimeString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Restoring Conversation Context

```python
def restore_conversation_context(conversation_id: str) -> list[dict]:
    """
    Restore conversation context for continuing a chat session.

    Returns:
        List of messages formatted for LLM context
    """
    response = requests.get(f"{base_url}/api/v1/chat/{conversation_id}")

    if response.status_code == 200:
        conversation = response.json()

        # Format messages for LLM context
        context = [
            {"role": msg["role"], "content": msg["content"]}
            for msg in conversation["messages"]
        ]

        return context
    else:
        return []

# Use context in new chat request
context = restore_conversation_context(conversation_id)
# Pass context to LLM or use for display
```

### Exporting Conversation

```python
def export_conversation_to_markdown(conversation_id: str, output_file: str):
    """Export conversation to a Markdown file."""
    response = requests.get(f"{base_url}/api/v1/chat/{conversation_id}")

    if response.status_code == 200:
        conversation = response.json()

        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(f"# Conversation {conversation_id}\n\n")
            f.write(f"**Edital ID:** {conversation.get('edital_id', 'N/A')}\n")
            f.write(f"**Created:** {conversation['created_at']}\n")
            f.write(f"**Updated:** {conversation['updated_at']}\n\n")
            f.write("---\n\n")

            for msg in conversation['messages']:
                role = msg['role'].capitalize()
                f.write(f"## {role}\n\n")
                f.write(f"{msg['content']}\n\n")
                f.write(f"*{msg['timestamp']}*\n\n")

        print(f"Conversation exported to {output_file}")

# Usage
export_conversation_to_markdown(conversation_id, "conversation_export.md")
```

## Performance Notes

1. **Query Performance**
   - Two database queries: one for conversation metadata, one for messages
   - Messages ordered by created_at timestamp
   - Average response time: 100-200ms

2. **Message Count**
   - No limit on message count in response
   - Long conversations may have large responses
   - Consider pagination for very long conversations in future versions

3. **Caching**
   - Responses can be cached client-side by conversation_id
   - Invalidate cache when new messages are added
   - Use updated_at timestamp for cache validation

## Testing

Test script provided at `test_conversation_history.py`:

```bash
# Test locally
python test_conversation_history.py

# Test on production
python test_conversation_history.py --production
```

## Best Practices

1. **Store conversation_id** - Always save the conversation_id from chat responses for later retrieval
2. **Handle 404 errors** - Check if conversation exists before attempting operations
3. **Display chronologically** - Messages are already ordered, use them in sequence
4. **Cache appropriately** - Cache conversation history to reduce API calls
5. **Show loading states** - Indicate when fetching conversation history
6. **Error handling** - Handle network errors and missing conversations gracefully
7. **Validate UUIDs** - Ensure conversation_id is a valid UUID before making requests

## Database Schema

### chat_conversations Table

```sql
CREATE TABLE chat_conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    edital_id TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### chat_messages Table

```sql
CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES chat_conversations(id),
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_messages_conversation ON chat_messages(conversation_id, created_at);
```

## Future Enhancements

Potential improvements for future versions:

- [ ] Pagination for very long conversations
- [ ] Filter messages by role (user/assistant)
- [ ] Date range filtering
- [ ] Search within conversation content
- [ ] Conversation summary/title generation
- [ ] Export to different formats (JSON, CSV, PDF)
- [ ] Message edit/delete capabilities
- [ ] Conversation sharing/permissions
