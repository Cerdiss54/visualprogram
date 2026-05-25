import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { logout } from '@/store/slices/authSlice';

export default function AppLayout() {
  const user = useAppSelector((state) => state.auth.user);
  const dispatch = useAppDispatch();
  const location = useLocation();

  const isSpreadsheet = location.pathname.startsWith('/documents/');

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('theme') as 'light' | 'dark') || 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        width: '100vw',
        overflow: 'hidden',
        background: 'var(--bg-main)',
        color: 'var(--text-main)',
      }}
    >
      {!isSpreadsheet && (
        <aside
          style={{
            width: '220px',
            background: 'var(--bg-sidebar)',
            borderRight: '1px solid var(--border-color)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div
            style={{
              padding: '20px',
              fontSize: '1.2rem',
              fontWeight: 'bold',
              borderBottom: '1px solid var(--border-color)',
            }}
          >
            VisualTables
          </div>
          <nav style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <Link
              to="/dashboard"
              style={{
                textDecoration: 'none',
                color: location.pathname.includes('/dashboard') ? 'var(--link-color)' : 'var(--text-main)',
                fontWeight: location.pathname.includes('/dashboard') ? 'bold' : 'normal',
              }}
            >
              Мои таблицы
            </Link>
            <Link
              to="/profile"
              style={{
                textDecoration: 'none',
                color: location.pathname.includes('/profile') ? 'var(--link-color)' : 'var(--text-main)',
                fontWeight: location.pathname.includes('/profile') ? 'bold' : 'normal',
              }}
            >
              Профиль
            </Link>
          </nav>
        </aside>
      )}

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <header
          style={{
            height: '50px',
            background: 'var(--bg-header)',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 20px',
          }}
        >
          <div style={{ fontWeight: 'bold', color: 'var(--text-main)' }}>
            {isSpreadsheet ? 'Редактор таблицы' : 'Панель управления'}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <button
              onClick={toggleTheme}
              style={{
                padding: '4px 8px',
                background: 'var(--bg-panel)',
                color: 'var(--text-main)',
                border: '1px solid var(--border-color)',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              {theme === 'light' ? '🌙 Тёмная' : '☀️ Светлая'}
            </button>
            {user ? (
              <>
                <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>{user.name}</span>
                <button
                  onClick={() => dispatch(logout())}
                  style={{
                    padding: '4px 12px',
                    background: '#f44336',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  Выйти
                </button>
              </>
            ) : (
              <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Гость</span>
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
