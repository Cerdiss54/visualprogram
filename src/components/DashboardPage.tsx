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
  const documents = useAppSelector((s) => s.documents.list);
  const isLoading = useAppSelector((s) => s.ui.isLoading);

  const handleCreateDocument = (title: string, rows: number, cols: number) => {
    dispatch(createNewDocument({ title, rows, cols })).then((action) => {
      if (createNewDocument.fulfilled.match(action)) {
        navigate(`/documents/${action.payload.id}`);
      }
    });
  };
  
  const handleSelectDocument = (id: string) => navigate(`/documents/${id}`);
  const handleDeleteDocument = (id: string) => dispatch(deleteDocumentById(id));
  const handleRenameDocument = (id: string, newTitle: string) => dispatch(renameDocument({ id, newTitle }));
  const handleDuplicateDocument = (id: string) => dispatch(duplicateDocument(id));
  const handleImportDocument = (doc: DocumentItem) => dispatch(importDocument(doc));

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