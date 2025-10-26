"use client";

interface EmptyDocumentStateProps {
  hasFilter?: boolean;
  onUploadClick?: () => void;
}

export function EmptyDocumentState({
  hasFilter = false,
  onUploadClick,
}: EmptyDocumentStateProps) {
  if (hasFilter) {
    // Empty state when filtering
    return (
      <div className="text-center py-12">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">
          Nenhum documento encontrado
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Tente ajustar os filtros de busca
        </p>
      </div>
    );
  }

  // Empty state when no documents at all
  return (
    <div className="text-center py-16 px-4">
      {/* Document Icon */}
      <div className="mx-auto h-24 w-24 text-gray-400 mb-6">
        <svg
          className="h-full w-full"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      </div>

      {/* Message */}
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Nenhum documento carregado
      </h3>
      <p className="text-sm text-gray-600 mb-8 max-w-sm mx-auto">
        Comece fazendo upload do seu primeiro documento PNLD para criar
        embeddings e treinar o chat.
      </p>

      {/* Upload CTA Button */}
      {onUploadClick && (
        <button
          onClick={onUploadClick}
          className="inline-flex items-center gap-2 px-6 py-3
                     bg-blue-600 text-white rounded-lg
                     hover:bg-blue-700 active:bg-blue-800
                     transition-colors font-medium
                     shadow-sm hover:shadow-md
                     min-h-[44px] touch-manipulation"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          Fazer upload do primeiro documento
        </button>
      )}

      {/* Help Text */}
      <div className="mt-8 pt-8 border-t border-gray-200 max-w-md mx-auto">
        <p className="text-xs text-gray-500 text-left">
          <strong className="text-gray-700">Dica:</strong> Documentos PDF serão
          processados automaticamente em chunks para criar embeddings vetoriais
          que alimentam o chat PNLD.
        </p>
      </div>
    </div>
  );
}
