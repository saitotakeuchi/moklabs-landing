/**
 * Chat-related types for PNLD AI Service
 * These types mirror the Python Pydantic models in app/models/chat.py
 */

export type ChatMessageRole = "user" | "assistant" | "system";

export interface ChatMessage {
  role: ChatMessageRole;
  content: string;
  timestamp?: string;
}

export interface ChatRequest {
  message: string;
  conversation_id?: string;
  edital_id?: string;
  max_tokens?: number;
  temperature?: number;
}

export interface DocumentSource {
  document_id: string;
  title: string;
  content_excerpt: string;
  relevance_score: number;
  page_number?: number;
  chunk_index?: number;
  edital_id?: string;
}

export interface ChatResponse {
  conversation_id: string;
  message: ChatMessage;
  sources: DocumentSource[];
  metadata?: Record<string, any>;
}
