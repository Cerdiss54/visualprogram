import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchDocuments } from '@/store/slices/documentsSlice';
import AppLayout from '@/components/AppLayout';
import DashboardPage from '@/components/DashboardPage';
import SpreadsheetPage from '@/components/SpreadsheetPage';
import ProfilePage from '@/components/ProfilePage';
import NotFoundPage from '@/components/NotFoundPage';
import ProtectedRoute from '@/components/ProtectedRoute';
import LoginPage from '@/components/LoginPage';
import RegisterPage from '@/components/RegisterPage';
import { refreshAccessToken } from '@/store/slices/authSlice';
import '@/App.css';

export default function App() {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const isAuthInitialized = useAppSelector((state) => state.auth.isAuthInitialized);

  useEffect(() => {
    dispatch(refreshAccessToken());
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchDocuments());
    }
  }, [dispatch, isAuthenticated]);

  if (!isAuthInitialized) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>
        Инициализация сессии...
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route path="/" element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />} />

        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/documents/:documentId" element={<SpreadsheetPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
