/**
 * DocumentList Component
 *
 * Displays a list/table of documents with filtering and pagination
 */

"use client";

import { useState, useMemo } from "react";
import { useDocuments } from "@/hooks/useDocuments";
import { useEditais } from "@/hooks/useEditais";
import { DocumentListItem, DocumentListItemCard } from "./DocumentListItem";
import { DocumentListSkeleton } from "@/components/ui";
import { EmptyDocumentState } from "./EmptyDocumentState";

interface DocumentListProps {
  onViewDocument: (documentId: string) => void;
  onDeleteDocument: (documentId: string) => void;
  onRefresh?: () => void;
  onUploadClick?: () => void;
}

export function DocumentList({
  onViewDocument,
  onDeleteDocument,
  onRefresh,
  onUploadClick,
}: DocumentListProps) {
  const [editalFilter, setEditalFilter] = useState("");
  const [page, setPage] = useState(0);
  const limit = 20;

  const { documents, total, isLoading, error, refetch } = useDocuments({
    editalId: editalFilter === "standard" ? "null" : editalFilter || undefined,
    limit,
    offset: page * limit,
  });

  const { editais } = useEditais();

  // Create a map of edital ID to edital name for quick lookup
  const editalNamesMap = useMemo(() => {
    return editais.reduce(
      (acc, edital) => {
        acc[edital.id] = edital.name;
        return acc;
      },
      {} as Record<string, string>
    );
  }, [editais]);

  const totalPages = Math.ceil(total / limit);

  const handleFilterChange = (newFilter: string) => {
    setEditalFilter(newFilter);
    setPage(0); // Reset to first page when filter changes
  };

  const handleRefresh = () => {
    refetch();
    if (onRefresh) {
      onRefresh();
    }
  };

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <p className="text-sm text-red-700">{error.message}</p>
          <button
            onClick={handleRefresh}
            className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">Documents</h2>
            <p className="text-sm text-gray-600 mt-1">
              {total} {total === 1 ? "document" : "documents"} total
            </p>
          </div>
          <div className="flex gap-2">
            <select
              value={editalFilter}
              onChange={(e) => handleFilterChange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
            >
              <option value="">Todos os editais</option>
              <option value="standard" className="font-semibold">
                📌 Standard (applies to all)
              </option>
              {editais.map((edital) => (
                <option key={edital.id} value={edital.id}>
                  {edital.name} ({edital.year})
                </option>
              ))}
            </select>
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              {isLoading ? "Loading..." : "Refresh"}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {isLoading && documents.length === 0 ? (
          // Loading skeleton
          <DocumentListSkeleton count={5} />
        ) : documents.length === 0 ? (
          // Enhanced empty state
          <EmptyDocumentState
            hasFilter={!!editalFilter}
            onUploadClick={onUploadClick}
          />
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Edital ID
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Chunks
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {documents.map((doc) => (
                    <DocumentListItem
                      key={doc.id}
                      document={doc}
                      editalName={
                        doc.edital_id === null
                          ? "Standard"
                          : editalNamesMap[doc.edital_id] || doc.edital_id
                      }
                      onView={onViewDocument}
                      onDelete={onDeleteDocument}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
              {documents.map((doc) => (
                <DocumentListItemCard
                  key={doc.id}
                  document={doc}
                  editalName={
                    doc.edital_id === null
                      ? "Standard"
                      : editalNamesMap[doc.edital_id] || doc.edital_id
                  }
                  onView={onViewDocument}
                  onDelete={onDeleteDocument}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4">
                <div className="text-sm text-gray-700">
                  Page {page + 1} of {totalPages}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    disabled={page === 0}
                    className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() =>
                      setPage((p) => Math.min(totalPages - 1, p + 1))
                    }
                    disabled={page >= totalPages - 1}
                    className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
