/**
 * PNLD Chat Dashboard
 *
 * Document management interface for uploading, viewing, and deleting documents
 */

'use client';

import { useState } from 'react';
import { toast, Toaster } from 'sonner';
import { DocumentUpload } from '@/components/pnld-docs/DocumentUpload';
import { DocumentList } from '@/components/pnld-docs/DocumentList';
import { DocumentDetail } from '@/components/pnld-docs/DocumentDetail';
import { DocumentDeleteDialog } from '@/components/pnld-docs/DocumentDeleteDialog';
import { useDocumentDelete, useDocuments } from '@/hooks/useDocuments';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<'upload' | 'list'>('list');
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const [documentToDelete, setDocumentToDelete] = useState<{
    id: string;
    title: string;
  } | null>(null);

  const { refetch } = useDocuments({ autoFetch: false });
  const { deleteDocument, isDeleting } = useDocumentDelete();

  const handleUploadComplete = (documentId: string) => {
    // Switch to list view and refresh the list
    setActiveTab('list');
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
      toast.success('Document deleted successfully');
      setDocumentToDelete(null);
      refetch();
    } catch (err) {
      toast.error('Failed to delete document');
    }
  };

  const handleDeleteCancel = () => {
    setDocumentToDelete(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast notifications */}
      <Toaster position="top-right" />

      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">PNLD Document Management</h1>
          <p className="mt-2 text-sm text-gray-600">
            Upload, manage, and view your PNLD documents and embeddings
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="mb-6">
          <nav className="flex space-x-4 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('list')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'list'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Documents
            </button>
            <button
              onClick={() => setActiveTab('upload')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'upload'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Upload New
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'upload' ? (
            <DocumentUpload onUploadComplete={handleUploadComplete} />
          ) : (
            <DocumentList
              onViewDocument={handleViewDocument}
              onDeleteDocument={handleDeleteClick}
              onRefresh={refetch}
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
    </div>
  );
}
