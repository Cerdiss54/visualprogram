import React, { useState } from 'react';
import { useAppSelector } from '@/store/hooks';

export default function ProfilePage() {
  const user = useAppSelector((state) => state.auth.user);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (newPassword !== confirmPassword) {
      setError('Новые пароли не совпадают');
      return;
    }
    if (newPassword.length < 8) {
      setError('Пароль должен быть не менее 8 символов');
      return;
    }

    setMessage('Пароль успешно изменен');
  };

  return (
    <div style={{ padding: '30px' }}>
      <h2>Профиль пользователя</h2>
      {user ? (
        <>
          <div style={{ marginTop: '20px', fontSize: '1.1rem', lineHeight: '1.8', marginBottom: '30px' }}>
            <p><strong>ID:</strong> {user.id}</p>
            <p><strong>Имя:</strong> {user.name}</p>
            <p><strong>Email:</strong> {user.email}</p>
          </div>

          <div style={{ background: 'var(--bg-panel)', padding: '20px', borderRadius: '8px', width: '320px' }}>
            <h3>Смена пароля</h3>
            <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '15px' }}>
              <input type="password" placeholder="Старый пароль" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} required style={{ padding: '10px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-main)' }} />
              <input type="password" placeholder="Новый пароль" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required style={{ padding: '10px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-main)' }} />
              <input type="password" placeholder="Повторите новый пароль" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required style={{ padding: '10px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-main)' }} />
              {error && <div style={{ color: '#d32f2f', fontSize: '14px' }}>{error}</div>}
              {message && <div style={{ color: '#2e7d32', fontSize: '14px' }}>{message}</div>}
              <button type="submit" style={{ padding: '10px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Сменить пароль</button>
            </form>
          </div>
        </>
      ) : (
        <p>Пользователь не авторизован.</p>
      )}
    </div>
  );
}