import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { logout } from '@/store/slices/authSlice';

export default function AppLayout() {
  const user = useAppSelector((state) => state.auth.user);
  const dispatch = useAppDispatch();
  const location = useLocation();

  const isSpreadsheet = location.pathname.startsWith('/documents/');

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' }}>
      {!isSpreadsheet && (
        <aside style={{ width: '220px', background: '#f8f9fa', borderRight: '1px solid #ddd', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '20px', fontSize: '1.2rem', fontWeight: 'bold', borderBottom: '1px solid #ddd' }}>
            VisualTables
          </div>
          <nav style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <Link to="/dashboard" style={{ textDecoration: 'none', color: location.pathname.includes('/dashboard') ? '#007bff' : '#333', fontWeight: location.pathname.includes('/dashboard') ? 'bold' : 'normal' }}>Мои таблицы</Link>
            <Link to="/profile" style={{ textDecoration: 'none', color: location.pathname.includes('/profile') ? '#007bff' : '#333', fontWeight: location.pathname.includes('/profile') ? 'bold' : 'normal' }}>Профиль</Link>
          </nav>
        </aside>
      )}
      
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <header style={{ height: '50px', background: '#fff', borderBottom: '1px solid #ddd', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px' }}>
          <div style={{ fontWeight: 'bold', color: '#555' }}>
            {isSpreadsheet ? 'Редактор таблицы' : 'Панель управления'}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            {user ? (
              <>
                <span style={{ fontSize: '14px', color: '#555' }}>{user.name}</span>
                <button onClick={() => dispatch(logout())} style={{ padding: '4px 12px', background: '#f44336', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                  Выйти
                </button>
              </>
            ) : (
              <span style={{ fontSize: '14px', color: '#555' }}>Гость</span>
            )}
          </div>
        </header>
        <main style={{ flex: 1, overflow: 'auto', position: 'relative' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}