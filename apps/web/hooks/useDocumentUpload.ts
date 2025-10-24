/**
 * useDocumentUpload Hook
 *
 * Handles PDF document upload with progress tracking
 */

import { useState, useCallback } from "react";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_PNLD_AI_SERVICE_URL || "http://localhost:8000";
const API_VERSION = "/api/v1";

export interface DocumentUploadRequest {
  file: File;
  editalId: string;
  title: string;
  metadata?: Record<string, any>;
}

export interface DocumentUploadResponse {
  document_id: string;
  edital_id: string;
  title: string;
  filename: string;
  pages_processed?: number;
  chunks_created: number;
  status: "success" | "processing" | "failed";
}

export interface UseDocumentUploadReturn {
  upload: (request: DocumentUploadRequest) => Promise<DocumentUploadResponse>;
  isUploading: boolean;
  progress: number;
  error: Error | null;
  reset: () => void;
}

/**
 * Custom hook for uploading PDF documents with progress tracking
 */
export function useDocumentUpload(): UseDocumentUploadReturn {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<Error | null>(null);

  const reset = useCallback(() => {
    setIsUploading(false);
    setProgress(0);
    setError(null);
  }, []);

  const upload = useCallback(
    async (request: DocumentUploadRequest): Promise<DocumentUploadResponse> => {
      // Reset state
      setIsUploading(true);
      setProgress(0);
      setError(null);

      // Validate file type
      if (!request.file.name.toLowerCase().endsWith(".pdf")) {
        const err = new Error("Only PDF files are allowed");
        setError(err);
        setIsUploading(false);
        throw err;
      }

      // Validate file size (50MB max)
      const MAX_SIZE = 50 * 1024 * 1024; // 50MB in bytes
      if (request.file.size > MAX_SIZE) {
        const err = new Error("File size must be less than 50MB");
        setError(err);
        setIsUploading(false);
        throw err;
      }

      return new Promise((resolve, reject) => {
        const formData = new FormData();
        formData.append("file", request.file);
        formData.append("edital_id", request.editalId);
        formData.append("title", request.title);
        if (request.metadata) {
          formData.append("metadata", JSON.stringify(request.metadata));
        }

        const xhr = new XMLHttpRequest();

        // Track upload progress
        xhr.upload.addEventListener("progress", (event) => {
          if (event.lengthComputable) {
            const percentComplete = Math.round(
              (event.loaded / event.total) * 100
            );
            setProgress(percentComplete);
          }
        });

        // Handle completion
        xhr.addEventListener("load", () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const response: DocumentUploadResponse = JSON.parse(
                xhr.responseText
              );
              setIsUploading(false);
              setProgress(100);
              resolve(response);
            } catch (e) {
              const err = new Error("Failed to parse response");
              setError(err);
              setIsUploading(false);
              reject(err);
            }
          } else {
            try {
              const errorResponse = JSON.parse(xhr.responseText);
              const err = new Error(
                errorResponse.detail || `Upload failed: ${xhr.statusText}`
              );
              setError(err);
              setIsUploading(false);
              reject(err);
            } catch (e) {
              const err = new Error(`Upload failed: ${xhr.statusText}`);
              setError(err);
              setIsUploading(false);
              reject(err);
            }
          }
        });

        // Handle errors
        xhr.addEventListener("error", () => {
          const err = new Error("Network error during upload");
          setError(err);
          setIsUploading(false);
          reject(err);
        });

        // Handle abort
        xhr.addEventListener("abort", () => {
          const err = new Error("Upload cancelled");
          setError(err);
          setIsUploading(false);
          reject(err);
        });

        // Send request
        xhr.open("POST", `${API_BASE_URL}${API_VERSION}/documents/upload-pdf`);
        xhr.send(formData);
      });
    },
    []
  );

  return {
    upload,
    isUploading,
    progress,
    error,
    reset,
  };
}
