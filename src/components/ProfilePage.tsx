import React from 'react';
import { useAppSelector } from '@/store/hooks';

export default function ProfilePage() {
  const user = useAppSelector((state) => state.auth.user);

  return (
    <div style={{ padding: '30px' }}>
      <h2>Профиль пользователя</h2>
      {user ? (
        <div style={{ marginTop: '20px', fontSize: '1.1rem', lineHeight: '1.8' }}>
          <p><strong>ID:</strong> {user.id}</p>
          <p><strong>Имя:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
        </div>
      ) : (
        <p>Пользователь не авторизован.</p>
      )}
    </div>
  );
}