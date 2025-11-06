/**
 * API client for PNLD AI Service
 *
 * This client provides methods to interact with the PNLD AI backend service
 * for chat functionality and document indexing.
 */

import type {
  DocumentIndexRequest,
  DocumentIndexResponse,
  DocumentListResponse,
  ListEditaisResponse,
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
   * Get conversation history by ID
   */
  async getConversation(conversationId: string): Promise<unknown> {
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
  async getDocument(documentId: string): Promise<unknown> {
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
  async healthCheck(): Promise<unknown> {
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
  async supabaseHealthCheck(): Promise<unknown> {
    const response = await fetch(`${this.baseUrl}/health/supabase`, {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error(`Supabase health check failed: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Upload PDF document with progress tracking
   */
  async uploadPdf(
    file: File,
    editalId: string,
    title: string,
    metadata?: Record<string, unknown>,
    onProgress?: (progress: number) => void
  ): Promise<DocumentIndexResponse> {
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("edital_id", editalId);
      formData.append("title", title);
      if (metadata) {
        formData.append("metadata", JSON.stringify(metadata));
      }

      const xhr = new XMLHttpRequest();

      // Track upload progress
      if (onProgress) {
        xhr.upload.addEventListener("progress", (event) => {
          if (event.lengthComputable) {
            const percentComplete = Math.round(
              (event.loaded / event.total) * 100
            );
            onProgress(percentComplete);
          }
        });
      }

      // Handle completion
      xhr.addEventListener("load", () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response: DocumentIndexResponse = JSON.parse(
              xhr.responseText
            );
            resolve(response);
          } catch {
            reject(new Error("Failed to parse response"));
          }
        } else {
          try {
            const errorResponse = JSON.parse(xhr.responseText);
            reject(
              new Error(
                errorResponse.detail || `Upload failed: ${xhr.statusText}`
              )
            );
          } catch {
            reject(new Error(`Upload failed: ${xhr.statusText}`));
          }
        }
      });

      // Handle errors
      xhr.addEventListener("error", () => {
        reject(new Error("Network error during upload"));
      });

      // Handle abort
      xhr.addEventListener("abort", () => {
        reject(new Error("Upload cancelled"));
      });

      // Send request
      xhr.open("POST", `${this.baseUrl}/documents/upload-pdf`);
      xhr.send(formData);
    });
  }

  /**
   * List documents with optional filtering
   */
  async listDocuments(params: {
    editalId?: string;
    limit?: number;
    offset?: number;
    sortBy?: string;
  }): Promise<DocumentListResponse> {
    const queryParams = new URLSearchParams();
    if (params.editalId) queryParams.append("edital_id", params.editalId);
    if (params.limit) queryParams.append("limit", params.limit.toString());
    if (params.offset) queryParams.append("offset", params.offset.toString());
    if (params.sortBy) queryParams.append("sort_by", params.sortBy);

    const response = await fetch(
      `${this.baseUrl}/documents?${queryParams.toString()}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to list documents: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * List all available editais
   */
  async listEditais(): Promise<ListEditaisResponse> {
    const response = await fetch(`${this.baseUrl}/editais`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to list editais: ${response.statusText}`);
    }

    return response.json();
  }
}

// Export singleton instance
export const pnldAiClient = new PnldAiClient();

// Export class for custom instances
export { PnldAiClient };
