import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAppDispatch } from '@/store/hooks';
import { fetchDocuments } from '@/store/slices/documentsSlice';
import AppLayout from '@/components/AppLayout';
import DashboardPage from '@/components/DashboardPage';
import SpreadsheetPage from '@/components/SpreadsheetPage';
import ProfilePage from '@/components/ProfilePage';
import NotFoundPage from '@/components/NotFoundPage';
import ProtectedRoute from '@/components/ProtectedRoute';
import '@/App.css';

export default function App() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchDocuments());
  }, [dispatch]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/documents/:documentId" element={<SpreadsheetPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}