/**
 * DocumentDetail Component
 *
 * Displays detailed information about a document
 */

"use client";

import { useEffect } from "react";
import { useDocumentDetails } from "@/hooks/useDocuments";

interface DocumentDetailProps {
  documentId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function DocumentDetail({
  documentId,
  isOpen,
  onClose,
}: DocumentDetailProps) {
  const {
    document: documentData,
    isLoading,
    error,
  } = useDocumentDetails({
    documentId,
    includeChunks: true,
    autoFetch: isOpen,
  });

  // Handle Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      window.document.addEventListener("keydown", handleEscape);
      // Prevent body scroll when modal is open
      window.document.body.style.overflow = "hidden";
    }

    return () => {
      window.document.removeEventListener("keydown", handleEscape);
      window.document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden z-10 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Document Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {isLoading ? (
            <div className="space-y-4">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              </div>
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border-l-4 border-red-500 p-4">
              <p className="text-sm text-red-700">{error.message}</p>
            </div>
          ) : documentData ? (
            <div className="space-y-6">
              {/* Basic Info */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                  Title
                </h3>
                <p className="text-lg font-medium text-gray-900">
                  {documentData.title}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">
                    Edital ID
                  </h3>
                  <p className="text-gray-900">{documentData.edital_id}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">
                    Document ID
                  </h3>
                  <p className="text-gray-900 font-mono text-sm">
                    {documentData.id}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">
                    Chunks Count
                  </h3>
                  <p className="text-gray-900">{documentData.chunks_count}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">
                    Embeddings Count
                  </h3>
                  <p className="text-gray-900">
                    {documentData.embeddings_count}
                  </p>
                </div>

                {documentData.pages_count !== undefined && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">
                      Pages
                    </h3>
                    <p className="text-gray-900">{documentData.pages_count}</p>
                  </div>
                )}

                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">
                    Created
                  </h3>
                  <p className="text-gray-900">
                    {new Date(documentData.created_at).toLocaleString("pt-BR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>

              {/* Sample Chunks */}
              {documentData.sample_chunks &&
                documentData.sample_chunks.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">
                      Sample Chunks
                    </h3>
                    <div className="space-y-3">
                      {documentData.sample_chunks.map((chunk, index) => (
                        <div
                          key={index}
                          className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                        >
                          {chunk.page_number !== undefined && (
                            <div className="text-xs text-gray-500 mb-2">
                              Page {chunk.page_number}
                            </div>
                          )}
                          <p className="text-sm text-gray-700 whitespace-pre-wrap">
                            {chunk.content}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* Metadata */}
              {documentData.metadata &&
                Object.keys(documentData.metadata).length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">
                      Metadata
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <pre className="text-xs text-gray-700 overflow-x-auto">
                        {JSON.stringify(documentData.metadata, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="flex justify-end px-6 py-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
