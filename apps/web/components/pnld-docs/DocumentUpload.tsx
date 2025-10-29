/**
 * DocumentUpload Component
 *
 * Drag-and-drop file upload for PDF documents
 */

"use client";

import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { useDocumentUpload } from "@/hooks/useDocumentUpload";
import { useEditais } from "@/hooks/useEditais";
import { UploadProgress } from "./UploadProgress";
import { toast } from "sonner";

interface DocumentUploadProps {
  onUploadComplete?: (documentId: string) => void;
}

export function DocumentUpload({ onUploadComplete }: DocumentUploadProps) {
  const [editalId, setEditalId] = useState("");
  const [title, setTitle] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const { upload, isUploading, progress, error, reset } = useDocumentUpload();
  const { editais, isLoading: isLoadingEditais } = useEditais();

  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setSelectedFile(file);
      // Auto-fill title from filename if empty
      if (!title) {
        setTitle(file.name.replace(".pdf", ""));
      }
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
    },
    multiple: false,
    disabled: isUploading,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFile) {
      toast.error("Please select a PDF file");
      return;
    }

    if (!editalId.trim()) {
      toast.error("Please select an edital or choose 'Standard'");
      return;
    }

    if (!title.trim()) {
      toast.error("Please enter a document title");
      return;
    }

    try {
      const result = await upload({
        file: selectedFile,
        editalId: editalId === "standard" ? undefined : editalId.trim(),
        title: title.trim(),
      });

      toast.success(`Document "${result.title}" uploaded successfully!`);

      // Reset form
      setEditalId("");
      setTitle("");
      setSelectedFile(null);
      reset();

      // Notify parent
      if (onUploadComplete) {
        onUploadComplete(result.document_id);
      }
    } catch {
      toast.error(error?.message || "Failed to upload document");
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setEditalId("");
    setTitle("");
    reset();
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-6">Upload Document</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* File Drop Zone */}
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive
              ? "border-blue-500 bg-blue-50"
              : selectedFile
                ? "border-green-500 bg-green-50"
                : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"
          } ${isUploading ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <input {...getInputProps()} />
          <div className="space-y-2">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
              aria-hidden="true"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {selectedFile ? (
              <div>
                <p className="text-sm font-medium text-green-600">
                  File selected:
                </p>
                <p className="text-sm text-gray-600">{selectedFile.name}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            ) : isDragActive ? (
              <p className="text-sm text-blue-600">Drop the PDF file here</p>
            ) : (
              <div>
                <p className="text-sm text-gray-600">
                  Drag and drop a PDF file here, or click to select
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Max file size: 50MB
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Upload Progress */}
        {isUploading && selectedFile && (
          <UploadProgress progress={progress} fileName={selectedFile.name} />
        )}

        {/* Form Fields */}
        <div className="space-y-4">
          <div>
            <label
              htmlFor="editalId"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Edital <span className="text-red-500">*</span>
            </label>
            <select
              id="editalId"
              value={editalId}
              onChange={(e) => setEditalId(e.target.value)}
              disabled={isUploading || isLoadingEditais}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              required
            >
              <option value="">Selecione um edital...</option>
              <option value="standard" className="font-semibold text-blue-600">
                📌 Standard (applies to all editais)
              </option>
              {editais.map((edital) => (
                <option key={edital.id} value={edital.id}>
                  {edital.name} ({edital.year})
                </option>
              ))}
            </select>
            {editais.length === 0 && !isLoadingEditais && (
              <p className="mt-1 text-xs text-amber-600">
                Nenhum edital específico cadastrado. Você pode usar &quot;Standard&quot; ou cadastrar editais na aba &quot;Editais&quot;.
              </p>
            )}
            {editalId === "standard" && (
              <p className="mt-1 text-xs text-blue-600">
                Este documento estará disponível em todas as buscas, independente do edital selecionado.
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Document Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isUploading}
              placeholder="e.g., PNLD 2025 - Edital Completo"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              required
            />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4">
            <p className="text-sm text-red-700">{error.message}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isUploading || !selectedFile}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {isUploading ? "Uploading..." : "Upload Document"}
          </button>
          {selectedFile && !isUploading && (
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
