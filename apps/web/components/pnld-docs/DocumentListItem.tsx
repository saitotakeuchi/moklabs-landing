/**
 * DocumentListItem Component
 *
 * Displays a single document in the list
 */

import type { Document } from '@/hooks/useDocuments';

interface DocumentListItemProps {
  document: Document;
  onView: (documentId: string) => void;
  onDelete: (documentId: string) => void;
}

export function DocumentListItem({ document, onView, onDelete }: DocumentListItemProps) {
  const formattedDate = new Date(document.created_at).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  return (
    <tr className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4">
        <button
          onClick={() => onView(document.id)}
          className="text-blue-600 hover:text-blue-800 font-medium hover:underline text-left"
        >
          {document.title}
        </button>
      </td>
      <td className="px-6 py-4 text-sm text-gray-600">{document.edital_id}</td>
      <td className="px-6 py-4 text-sm text-gray-600 text-center">{document.chunks_count}</td>
      <td className="px-6 py-4 text-sm text-gray-600">{formattedDate}</td>
      <td className="px-6 py-4">
        <div className="flex gap-2 justify-end">
          <button
            onClick={() => onView(document.id)}
            className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors"
          >
            View
          </button>
          <button
            onClick={() => onDelete(document.id)}
            className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded transition-colors"
          >
            Delete
          </button>
        </div>
      </td>
    </tr>
  );
}

/**
 * DocumentListItemCard Component (for mobile view)
 */
export function DocumentListItemCard({ document, onView, onDelete }: DocumentListItemProps) {
  const formattedDate = new Date(document.created_at).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <button
          onClick={() => onView(document.id)}
          className="text-blue-600 hover:text-blue-800 font-medium hover:underline text-left flex-1"
        >
          {document.title}
        </button>
      </div>
      <div className="space-y-1 text-sm text-gray-600">
        <p>
          <span className="font-medium">Edital:</span> {document.edital_id}
        </p>
        <p>
          <span className="font-medium">Chunks:</span> {document.chunks_count}
        </p>
        <p>
          <span className="font-medium">Created:</span> {formattedDate}
        </p>
      </div>
      <div className="flex gap-2 mt-4">
        <button
          onClick={() => onView(document.id)}
          className="flex-1 px-3 py-2 text-sm text-blue-600 border border-blue-600 hover:bg-blue-50 rounded transition-colors"
        >
          View Details
        </button>
        <button
          onClick={() => onDelete(document.id)}
          className="flex-1 px-3 py-2 text-sm text-red-600 border border-red-600 hover:bg-red-50 rounded transition-colors"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
