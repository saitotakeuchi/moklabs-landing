"use client";

import { useEffect, useRef } from "react";
import type { Edital, CreateEditalRequest } from "@moklabs/pnld-types";
import { EditalForm } from "./EditalForm";

interface EditalDialogProps {
  isOpen: boolean;
  edital?: Edital | null;
  onClose: () => void;
  onSubmit: (data: CreateEditalRequest) => Promise<void>;
  isLoading?: boolean;
}

export function EditalDialog({
  isOpen,
  edital,
  onClose,
  onSubmit,
  isLoading = false,
}: EditalDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

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

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isLoading) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
      onClick={handleBackdropClick}
      aria-labelledby="dialog-title"
      role="dialog"
      aria-modal="true"
    >
      <div
        ref={dialogRef}
        className="bg-white rounded-[24px] shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Dialog Header */}
        <div className="sticky top-0 bg-white border-b-2 border-gray-100 px-6 py-4 rounded-t-[24px]">
          <div className="flex items-center justify-between">
            <h2
              id="dialog-title"
              className="font-sans font-bold text-xl text-[#0013ff]"
            >
              {edital ? "Editar Edital" : "Novo Edital"}
            </h2>
            <button
              onClick={onClose}
              disabled={isLoading}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100
                         rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Fechar"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
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
        </div>

        {/* Dialog Content */}
        <div className="px-6 py-6">
          <EditalForm
            edital={edital}
            onSubmit={onSubmit}
            onCancel={onClose}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}
