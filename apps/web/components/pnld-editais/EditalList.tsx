"use client";

import type { Edital } from "@moklabs/pnld-types";

interface EditalListProps {
  editais: Edital[];
  onEdit: (edital: Edital) => void;
  onDelete: (edital: Edital) => void;
  isLoading?: boolean;
}

export function EditalList({
  editais,
  onEdit,
  onDelete,
  isLoading = false,
}: EditalListProps) {
  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#0013ff] border-t-transparent"></div>
        <p className="mt-4 text-[#0013ff] font-sans">Carregando editais...</p>
      </div>
    );
  }

  if (editais.length === 0) {
    return (
      <div className="text-center py-16 px-4">
        <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-gray-100 rounded-full">
          <svg
            className="w-8 h-8 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-[#0013ff] mb-2 font-sans">
          Nenhum edital cadastrado
        </h3>
        <p className="text-gray-600 font-sans">
          Clique em &quot;Novo Edital&quot; para cadastrar o primeiro edital.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {editais.map((edital) => (
        <div
          key={edital.id}
          className="bg-white border-2 border-[#0013ff] rounded-[16px] p-4
                     hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-start justify-between gap-4">
            {/* Edital Info */}
            <div className="flex-1 min-w-0">
              <h3 className="font-sans font-bold text-base text-[#0013ff] mb-1 truncate">
                {edital.name}
              </h3>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600 font-sans">
                <span>
                  <span className="font-medium">Ano:</span> {edital.year}
                </span>
                <span>
                  <span className="font-medium">Tipo:</span>{" "}
                  {edital.type.charAt(0).toUpperCase() + edital.type.slice(1)}
                </span>
                <span className="text-xs text-gray-500">ID: {edital.id}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 flex-shrink-0">
              <button
                onClick={() => onEdit(edital)}
                className="p-2 min-h-[44px] min-w-[44px]
                           bg-white border-2 border-[#0013ff]
                           rounded-[12px]
                           text-[#0013ff]
                           hover:bg-gray-50 active:bg-gray-100
                           transition-colors
                           touch-manipulation"
                aria-label={`Editar ${edital.name}`}
                title="Editar edital"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </button>
              <button
                onClick={() => onDelete(edital)}
                className="p-2 min-h-[44px] min-w-[44px]
                           bg-white border-2 border-red-500
                           rounded-[12px]
                           text-red-500
                           hover:bg-red-50 active:bg-red-100
                           transition-colors
                           touch-manipulation"
                aria-label={`Excluir ${edital.name}`}
                title="Excluir edital"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
