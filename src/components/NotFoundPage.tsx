import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        textAlign: 'center',
      }}
    >
      <h1 style={{ fontSize: '4rem', marginBottom: '10px' }}>404</h1>
      <p style={{ fontSize: '1.2rem', marginBottom: '20px' }}>Запрашиваемая страница не найдена</p>
      <Link to="/" style={{ textDecoration: 'none', color: '#007bff', fontWeight: 'bold' }}>
        Вернуться на главную
      </Link>
    </div>
  );
}
