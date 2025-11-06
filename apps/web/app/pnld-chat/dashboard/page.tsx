/**
 * PNLD Chat Dashboard
 *
 * Document management interface for uploading, viewing, and deleting documents
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast, Toaster } from "sonner";
import { DocumentUpload } from "@/components/pnld-docs/DocumentUpload";
import { DocumentList } from "@/components/pnld-docs/DocumentList";
import { DocumentDetail } from "@/components/pnld-docs/DocumentDetail";
import { DocumentDeleteDialog } from "@/components/pnld-docs/DocumentDeleteDialog";
import { useDocumentDelete, useDocuments } from "@/hooks/useDocuments";
import {
  EditalList,
  EditalDialog,
  DeleteEditalDialog,
} from "@/components/pnld-editais";
import { useEditais } from "@/hooks/useEditais";
import type { Edital, CreateEditalRequest } from "@moklabs/pnld-types";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";

function DashboardContent() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"upload" | "list" | "editais">(
    "list"
  );
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(
    null
  );
  const [documentToDelete, setDocumentToDelete] = useState<{
    id: string;
    title: string;
  } | null>(null);

  // Edital state
  const [isEditalDialogOpen, setIsEditalDialogOpen] = useState(false);
  const [editalToEdit, setEditalToEdit] = useState<Edital | null>(null);
  const [editalToDelete, setEditalToDelete] = useState<Edital | null>(null);
  const [isEditalSubmitting, setIsEditalSubmitting] = useState(false);
  const [deleteEditalError, setDeleteEditalError] = useState<string | null>(
    null
  );

  const { refetch } = useDocuments({ autoFetch: false });
  const { deleteDocument, isDeleting } = useDocumentDelete();
  const {
    editais,
    isLoading: isLoadingEditais,
    createEdital,
    updateEdital,
    deleteEdital,
    fetchEditais,
  } = useEditais();

  const handleUploadComplete = () => {
    // Switch to list view and refresh the list
    setActiveTab("list");
    refetch();
  };

  const handleViewDocument = (documentId: string) => {
    setSelectedDocumentId(documentId);
  };

  const handleDeleteClick = (documentId: string) => {
    // Find document title from the list (we'll need to get it from the child component)
    // For now, we'll just show the ID
    setDocumentToDelete({ id: documentId, title: documentId });
  };

  const handleDeleteConfirm = async () => {
    if (!documentToDelete) return;

    try {
      await deleteDocument(documentToDelete.id);
      toast.success("Document deleted successfully");
      setDocumentToDelete(null);
      refetch();
    } catch {
      toast.error("Failed to delete document");
    }
  };

  const handleDeleteCancel = () => {
    setDocumentToDelete(null);
  };

  // Edital handlers
  const handleNewEdital = () => {
    setEditalToEdit(null);
    setIsEditalDialogOpen(true);
  };

  const handleEditEdital = (edital: Edital) => {
    setEditalToEdit(edital);
    setIsEditalDialogOpen(true);
  };

  const handleDeleteEditalClick = (edital: Edital) => {
    setEditalToDelete(edital);
    setDeleteEditalError(null);
  };

  const handleEditalSubmit = async (data: CreateEditalRequest) => {
    setIsEditalSubmitting(true);
    try {
      if (editalToEdit) {
        await updateEdital(editalToEdit.id, data);
        toast.success("Edital atualizado com sucesso");
      } else {
        await createEdital(data);
        toast.success("Edital criado com sucesso");
      }
      setIsEditalDialogOpen(false);
      setEditalToEdit(null);
      fetchEditais();
    } catch (error) {
      toast.error(
        editalToEdit ? "Erro ao atualizar edital" : "Erro ao criar edital"
      );
      console.error("Error submitting edital:", error);
    } finally {
      setIsEditalSubmitting(false);
    }
  };

  const handleDeleteEditalConfirm = async () => {
    if (!editalToDelete) return;

    try {
      await deleteEdital(editalToDelete.id);
      toast.success("Edital excluído com sucesso");
      setEditalToDelete(null);
      setDeleteEditalError(null);
      fetchEditais();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Erro ao excluir edital";
      setDeleteEditalError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const handleDeleteEditalCancel = () => {
    setEditalToDelete(null);
    setDeleteEditalError(null);
  };

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success("Logged out successfully");
      router.push("/admin/login");
    } catch (error) {
      toast.error("Failed to log out");
      console.error("Logout error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast notifications */}
      <Toaster position="top-right" />

      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                PNLD Document Management
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                Upload, manage, and view your PNLD documents and embeddings
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {user?.email}
                </p>
                <p className="text-xs text-gray-500">Administrator</p>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 active:bg-red-800 transition-colors font-medium text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="mb-6">
          <nav className="flex space-x-4 border-b border-gray-200">
            <button
              onClick={() => setActiveTab("list")}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "list"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Documents
            </button>
            <button
              onClick={() => setActiveTab("upload")}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "upload"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Upload New
            </button>
            <button
              onClick={() => setActiveTab("editais")}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "editais"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Editais
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === "upload" ? (
            <DocumentUpload onUploadComplete={handleUploadComplete} />
          ) : activeTab === "editais" ? (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Gerenciar Editais
                  </h2>
                  <p className="mt-1 text-sm text-gray-600">
                    Cadastre e organize os editais PNLD
                  </p>
                </div>
                <button
                  onClick={handleNewEdital}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors font-medium text-sm"
                >
                  Novo Edital
                </button>
              </div>
              <EditalList
                editais={editais}
                onEdit={handleEditEdital}
                onDelete={handleDeleteEditalClick}
                isLoading={isLoadingEditais}
              />
            </div>
          ) : (
            <DocumentList
              onViewDocument={handleViewDocument}
              onDeleteDocument={handleDeleteClick}
              onRefresh={refetch}
              onUploadClick={() => setActiveTab("upload")}
            />
          )}
        </div>
      </main>

      {/* Document Detail Modal */}
      {selectedDocumentId && (
        <DocumentDetail
          documentId={selectedDocumentId}
          isOpen={!!selectedDocumentId}
          onClose={() => setSelectedDocumentId(null)}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {documentToDelete && (
        <DocumentDeleteDialog
          isOpen={!!documentToDelete}
          documentTitle={documentToDelete.title}
          isDeleting={isDeleting}
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
        />
      )}

      {/* Edital Dialog */}
      <EditalDialog
        isOpen={isEditalDialogOpen}
        edital={editalToEdit}
        onClose={() => {
          setIsEditalDialogOpen(false);
          setEditalToEdit(null);
        }}
        onSubmit={handleEditalSubmit}
        isLoading={isEditalSubmitting}
      />

      {/* Delete Edital Dialog */}
      <DeleteEditalDialog
        isOpen={!!editalToDelete}
        edital={editalToDelete}
        onClose={handleDeleteEditalCancel}
        onConfirm={handleDeleteEditalConfirm}
        isLoading={isEditalSubmitting}
        error={deleteEditalError}
      />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <AuthProvider>
      <DashboardContent />
    </AuthProvider>
  );
}
