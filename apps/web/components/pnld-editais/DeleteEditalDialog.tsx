"use client";

import { useEffect } from "react";
import type { Edital } from "@moklabs/pnld-types";

interface DeleteEditalDialogProps {
  isOpen: boolean;
  edital: Edital | null;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
}

export function DeleteEditalDialog({
  isOpen,
  edital,
  onClose,
  onConfirm,
  isLoading = false,
  error = null,
}: DeleteEditalDialogProps) {
  // Handle ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isLoading) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, isLoading, onClose]);

  // Lock body scroll when dialog is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen || !edital) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isLoading) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
      onClick={handleBackdropClick}
      aria-labelledby="delete-dialog-title"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-white rounded-[24px] shadow-xl max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Dialog Header */}
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <div className="flex-1">
              <h2
                id="delete-dialog-title"
                className="font-sans font-bold text-xl text-[#0013ff] mb-2"
              >
                Excluir Edital?
              </h2>
              <p className="text-gray-600 font-sans text-sm">
                Tem certeza que deseja excluir o edital{" "}
                <span className="font-medium text-[#0013ff]">
                  &quot;{edital.name}&quot;
                </span>
                ?
              </p>
              <p className="text-gray-600 font-sans text-sm mt-2">
                Esta ação não pode ser desfeita. Você só pode excluir um edital
                se não houver documentos associados a ele.
              </p>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="px-6 pb-4">
            <div className="bg-red-50 border-2 border-red-200 rounded-[16px] p-4">
              <p className="text-sm text-red-600 font-sans">{error}</p>
            </div>
          </div>
        )}

        {/* Dialog Actions */}
        <div className="px-6 pb-6 flex gap-3 justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-6 py-3 min-h-[44px]
                       bg-white border-2 border-[#0013ff]
                       rounded-[16px]
                       font-sans font-bold text-sm text-[#0013ff]
                       hover:bg-gray-50 active:bg-gray-100
                       disabled:opacity-50 disabled:cursor-not-allowed
                       transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="px-6 py-3 min-h-[44px]
                       bg-red-600 border-2 border-red-600
                       rounded-[16px]
                       font-sans font-bold text-sm text-white
                       hover:bg-red-700 hover:border-red-700
                       active:bg-red-800 active:border-red-800
                       disabled:opacity-50 disabled:cursor-not-allowed
                       transition-colors"
          >
            {isLoading ? "Excluindo..." : "Excluir"}
          </button>
        </div>
      </div>
    </div>
  );
}
