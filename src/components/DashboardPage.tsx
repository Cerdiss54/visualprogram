import React, { useMemo, useCallback } from 'react';
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

  const documents = useMemo(() => {
    return allDocuments.filter((doc: DocumentItem) => doc.userId === user?.id);
  }, [allDocuments, user?.id]);

  const handleCreateDocument = useCallback(
    (title: string, rows: number, cols: number) => {
      dispatch(createNewDocument({ title, rows, cols, userId: user?.id })).then((action) => {
        if (createNewDocument.fulfilled.match(action)) {
          navigate(`/documents/${action.payload.id}`);
        }
      });
    },
    [dispatch, navigate, user?.id]
  );

  const handleSelectDocument = useCallback((id: string) => navigate(`/documents/${id}`), [navigate]);
  const handleDeleteDocument = useCallback((id: string) => dispatch(deleteDocumentById(id)), [dispatch]);
  const handleRenameDocument = useCallback(
    (id: string, newTitle: string) => dispatch(renameDocument({ id, newTitle })),
    [dispatch]
  );
  const handleDuplicateDocument = useCallback((id: string) => dispatch(duplicateDocument(id)), [dispatch]);
  const handleImportDocument = useCallback(
    (doc: DocumentItem) => dispatch(importDocument({ ...doc, userId: user?.id })),
    [dispatch, user?.id]
  );

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
