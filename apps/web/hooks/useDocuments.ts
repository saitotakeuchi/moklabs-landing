/**
 * useDocuments Hook
 *
 * Manages document listing, filtering, and pagination
 */

import { useState, useEffect, useCallback } from "react";
import { trackDocumentDeleted, trackApiError } from "@/lib/analytics";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_PNLD_AI_SERVICE_URL || "http://localhost:8000";
const API_VERSION = "/api/v1";

export interface Document {
  id: string;
  edital_id: string | null;
  title: string;
  chunks_count: number;
  created_at: string;
  updated_at: string;
  metadata?: Record<string, any>;
}

export interface DocumentsListResponse {
  documents: Document[];
  total: number;
  limit: number;
  offset: number;
}

export interface UseDocumentsOptions {
  editalId?: string;
  limit?: number;
  offset?: number;
  sortBy?: string;
  autoFetch?: boolean;
}

export interface UseDocumentsReturn {
  documents: Document[];
  total: number;
  isLoading: boolean;
  error: Error | null;
  fetchDocuments: () => Promise<void>;
  refetch: () => Promise<void>;
}

/**
 * Custom hook for managing document list
 */
export function useDocuments(
  options: UseDocumentsOptions = {}
): UseDocumentsReturn {
  const {
    editalId,
    limit = 20,
    offset = 0,
    sortBy = "created_at",
    autoFetch = true,
  } = options;

  const [documents, setDocuments] = useState<Document[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchDocuments = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Build query params
      const params = new URLSearchParams();
      if (editalId) params.append("edital_id", editalId);
      params.append("limit", limit.toString());
      params.append("offset", offset.toString());
      params.append("sort_by", sortBy);

      const response = await fetch(
        `${API_BASE_URL}${API_VERSION}/documents?${params.toString()}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ detail: "Unknown error" }));
        throw new Error(
          errorData.detail || `HTTP ${response.status}: ${response.statusText}`
        );
      }

      const data: DocumentsListResponse = await response.json();
      setDocuments(data.documents);
      setTotal(data.total);
    } catch (err) {
      console.error("Error fetching documents:", err);
      const errorObj =
        err instanceof Error ? err : new Error("Failed to fetch documents");
      setError(errorObj);
    } finally {
      setIsLoading(false);
    }
  }, [editalId, limit, offset, sortBy]);

  // Auto-fetch on mount and when options change
  useEffect(() => {
    if (autoFetch) {
      fetchDocuments();
    }
  }, [fetchDocuments, autoFetch]);

  return {
    documents,
    total,
    isLoading,
    error,
    fetchDocuments,
    refetch: fetchDocuments,
  };
}

/**
 * Hook for document deletion
 */
export interface UseDocumentDeleteReturn {
  deleteDocument: (documentId: string) => Promise<void>;
  isDeleting: boolean;
  error: Error | null;
}

export function useDocumentDelete(): UseDocumentDeleteReturn {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const deleteDocument = useCallback(async (documentId: string) => {
    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch(
        `${API_BASE_URL}${API_VERSION}/documents/${documentId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ detail: "Unknown error" }));
        const error = new Error(
          errorData.detail || `HTTP ${response.status}: ${response.statusText}`
        );

        // Track deletion error
        trackApiError({
          endpoint: `/documents/${documentId}`,
          errorCode: response.status.toString(),
          errorType: "DocumentDeletionError",
          errorMessage: error.message,
        });

        throw error;
      }

      // Successfully deleted - track event
      trackDocumentDeleted({
        documentId,
      });
    } catch (err) {
      console.error("Error deleting document:", err);
      const errorObj =
        err instanceof Error ? err : new Error("Failed to delete document");
      setError(errorObj);
      throw errorObj;
    } finally {
      setIsDeleting(false);
    }
  }, []);

  return {
    deleteDocument,
    isDeleting,
    error,
  };
}

/**
 * Hook for fetching document details
 */
export interface DocumentDetail extends Document {
  embeddings_count: number;
  pages_count?: number;
  sample_chunks?: Array<{
    content: string;
    page_number?: number;
  }>;
}

export interface UseDocumentDetailsOptions {
  documentId: string;
  includeChunks?: boolean;
  autoFetch?: boolean;
}

export interface UseDocumentDetailsReturn {
  document: DocumentDetail | null;
  isLoading: boolean;
  error: Error | null;
  fetchDocument: () => Promise<void>;
}

export function useDocumentDetails(
  options: UseDocumentDetailsOptions
): UseDocumentDetailsReturn {
  const { documentId, includeChunks = false, autoFetch = true } = options;

  const [document, setDocument] = useState<DocumentDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchDocument = useCallback(async () => {
    if (!documentId) return;

    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (includeChunks) params.append("include_chunks", "true");

      const url = `${API_BASE_URL}${API_VERSION}/documents/${documentId}${
        params.toString() ? `?${params.toString()}` : ""
      }`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Document not found");
        }
        const errorData = await response
          .json()
          .catch(() => ({ detail: "Unknown error" }));
        throw new Error(
          errorData.detail || `HTTP ${response.status}: ${response.statusText}`
        );
      }

      const data: DocumentDetail = await response.json();
      setDocument(data);
    } catch (err) {
      console.error("Error fetching document details:", err);
      const errorObj =
        err instanceof Error
          ? err
          : new Error("Failed to fetch document details");
      setError(errorObj);
    } finally {
      setIsLoading(false);
    }
  }, [documentId, includeChunks]);

  // Auto-fetch on mount and when options change
  useEffect(() => {
    if (autoFetch) {
      fetchDocument();
    }
  }, [fetchDocument, autoFetch]);

  return {
    document,
    isLoading,
    error,
    fetchDocument,
  };
}
