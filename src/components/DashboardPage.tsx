import React from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { useNavigate } from 'react-router-dom';
import Dashboard from '@/components/Dashboard';
import {
  deleteDocumentById,
  renameDocument,
  duplicateDocument,
  importDocument,
  createNewDocument,
} from '@/store/slices/documentsSlice';
import { DocumentItem } from '@/types/spreadsheet';

export default function DashboardPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const allDocuments = useAppSelector((s) => s.documents.list);
  const user = useAppSelector((s) => s.auth.user);
  const isLoading = useAppSelector((s) => s.ui.isLoading);

  const documents = allDocuments.filter((doc: DocumentItem) => doc.userId === user?.id);

  const handleCreateDocument = (title: string, rows: number, cols: number) => {
    dispatch(createNewDocument({ title, rows, cols, userId: user?.id })).then((action) => {
      if (createNewDocument.fulfilled.match(action)) {
        navigate(`/documents/${action.payload.id}`);
      }
    });
  };
  
  const handleSelectDocument = (id: string) => navigate(`/documents/${id}`);
  const handleDeleteDocument = (id: string) => dispatch(deleteDocumentById(id));
  const handleRenameDocument = (id: string, newTitle: string) => dispatch(renameDocument({ id, newTitle }));
  const handleDuplicateDocument = (id: string) => dispatch(duplicateDocument(id));
  const handleImportDocument = (doc: DocumentItem) => dispatch(importDocument({ ...doc, userId: user?.id }));

  if (isLoading) return <div style={{ padding: '20px' }}>Загрузка документов...</div>;

  return (
    <Dashboard
      documents={documents}
      onDuplicateDoc={handleDuplicateDocument}
      onCreateDoc={handleCreateDocument}
      onSelectDoc={handleSelectDocument}
      onDeleteDoc={handleDeleteDocument}
      onRenameDoc={handleRenameDocument}
      onImportDoc={handleImportDocument}
    />
  );
}