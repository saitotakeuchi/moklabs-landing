/**
 * API client for PNLD AI Service
 *
 * This client provides methods to interact with the PNLD AI backend service
 * for chat functionality and document indexing.
 */

import type {
  ChatRequest,
  ChatResponse,
  DocumentIndexRequest,
  DocumentIndexResponse,
} from "@moklabs/pnld-types";

const AI_SERVICE_URL =
  process.env.NEXT_PUBLIC_PNLD_AI_SERVICE_URL || "http://localhost:8000";

const API_BASE_URL = `${AI_SERVICE_URL}/api/v1`;

class PnldAiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Send a chat message and receive an AI-generated response
   */
  async chat(request: ChatRequest): Promise<ChatResponse> {
    const response = await fetch(`${this.baseUrl}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Chat request failed: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get conversation history by ID
   */
  async getConversation(conversationId: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/chat/${conversationId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get conversation: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Index a new document for vector search
   */
  async indexDocument(
    request: DocumentIndexRequest
  ): Promise<DocumentIndexResponse> {
    const response = await fetch(`${this.baseUrl}/documents/index`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Document indexing failed: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get document by ID
   */
  async getDocument(documentId: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/documents/${documentId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get document: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Delete a document
   */
  async deleteDocument(documentId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/documents/${documentId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error(`Failed to delete document: ${response.statusText}`);
    }
  }

  /**
   * Check service health
   */
  async healthCheck(): Promise<any> {
    const response = await fetch(`${this.baseUrl}/health`, {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error(`Health check failed: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Check Supabase connection health
   */
  async supabaseHealthCheck(): Promise<any> {
    const response = await fetch(`${this.baseUrl}/health/supabase`, {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error(`Supabase health check failed: ${response.statusText}`);
    }

    return response.json();
  }
}

// Export singleton instance
export const pnldAiClient = new PnldAiClient();

// Export class for custom instances
export { PnldAiClient };
