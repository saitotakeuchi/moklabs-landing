/**
 * PNLD Chat API Client
 *
 * Handles communication with the PNLD AI Service backend
 */

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_PNLD_AI_SERVICE_URL || 'http://localhost:8000';
const API_VERSION = '/api/v1';

// Types matching backend API
export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
}

export interface DocumentSource {
  document_id: string;
  title: string;
  content_excerpt: string;
  relevance_score: number;
  page_number?: number;
  chunk_index: number;
  edital_id?: string;
}

export interface ChatRequest {
  message: string;
  conversation_id?: string;
  edital_id?: string;
  max_tokens?: number;
  temperature?: number;
}

export interface ChatResponse {
  conversation_id: string;
  message: ChatMessage;
  sources: DocumentSource[];
  metadata?: {
    edital_id?: string;
  };
}

export interface ConversationHistory {
  conversation_id: string;
  edital_id?: string;
  messages: ChatMessage[];
  created_at: string;
  updated_at: string;
  metadata?: Record<string, unknown>;
}

// Streaming event types
export type StreamEvent =
  | { type: 'metadata'; data: { conversation_id: string } }
  | { type: 'sources'; data: DocumentSource[] }
  | { type: 'token'; data: { content: string } }
  | { type: 'done'; data: { conversation_id: string } }
  | { type: 'error'; data: { error: string; conversation_id?: string } };

/**
 * Send a chat message (non-streaming)
 */
export async function sendChatMessage(request: ChatRequest): Promise<ChatResponse> {
  const response = await fetch(`${API_BASE_URL}${API_VERSION}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(error.detail || `HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Send a chat message with streaming response
 * Returns an async generator that yields stream events
 */
export async function* streamChatMessage(request: ChatRequest): AsyncGenerator<StreamEvent> {
  const response = await fetch(`${API_BASE_URL}${API_VERSION}/chat/stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(error.detail || `HTTP ${response.status}: ${response.statusText}`);
  }

  if (!response.body) {
    throw new Error('Response body is null');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');

      // Keep the last incomplete line in the buffer
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.trim() === '') continue;

        // Parse SSE format: "event: type\ndata: json"
        if (line.startsWith('event: ')) {
          // Event type is on separate line, handled below
          continue;
        }

        if (line.startsWith('data: ')) {
          const dataStr = line.substring(6);
          try {
            const data = JSON.parse(dataStr);

            // Determine event type from data structure
            if ('conversation_id' in data && Object.keys(data).length === 1) {
              yield { type: 'metadata', data };
            } else if (Array.isArray(data) && data.length > 0 && 'document_id' in data[0]) {
              yield { type: 'sources', data };
            } else if ('content' in data && typeof data.content === 'string') {
              yield { type: 'token', data };
            } else if ('conversation_id' in data && Object.keys(data).length === 1) {
              yield { type: 'done', data };
            } else if ('error' in data) {
              yield { type: 'error', data };
            }
          } catch (e) {
            console.error('Failed to parse SSE data:', dataStr, e);
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

/**
 * Get conversation history
 */
export async function getConversationHistory(conversationId: string): Promise<ConversationHistory> {
  const response = await fetch(`${API_BASE_URL}${API_VERSION}/chat/${conversationId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Conversation not found');
    }
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(error.detail || `HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
}
