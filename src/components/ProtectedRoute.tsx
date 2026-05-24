import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAppSelector } from '@/store/hooks';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  if (!isAuthenticated) {
    return <Navigate to="/404" replace />;
  }
  return <>{children}</>;
}