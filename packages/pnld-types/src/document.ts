/**
 * Document-related types for PNLD AI Service
 * These types mirror the Python Pydantic models in app/models/document.py
 */

export interface DocumentIndexRequest {
  edital_id: string;
  title: string;
  content: string;
  metadata?: Record<string, any>;
}

export interface DocumentIndexResponse {
  document_id: string;
  edital_id: string;
  status: string;
  chunks_created: number;
  message?: string;
}

export interface Document {
  id: string;
  edital_id: string;
  title: string;
  content: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface DocumentEmbedding {
  id: string;
  document_id: string;
  content: string;
  embedding?: number[];
  created_at: string;
}
