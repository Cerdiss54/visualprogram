import React, { useState } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { updateUserName, updateUserPassword } from '@/store/slices/authSlice';

export default function ProfilePage() {
  const user = useAppSelector((state) => state.auth.user);
  const registeredAt = useAppSelector((state) => state.auth.registeredAt);
  const documents = useAppSelector((state) => state.documents.list);
  const error = useAppSelector((state) => state.auth.error);
  const dispatch = useAppDispatch();

  const userDocs = documents.filter((doc) => doc.userId === user?.id);

  const [name, setName] = useState(user?.name || '');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handleUpdateName = async () => {
    if (!name.trim()) {
      setMessage({ text: 'Имя не может быть пустым', type: 'error' });
      return;
    }
    try {
      await dispatch(updateUserName(name.trim())).unwrap();
      setMessage({ text: 'Имя успешно обновлено', type: 'success' });
    } catch {
      setMessage({ text: 'Ошибка при обновлении имени', type: 'error' });
    }
  };

  const handleUpdatePassword = async () => {
    setMessage(null);
    if (newPassword !== confirmPassword) {
      setMessage({ text: 'Новые пароли не совпадают', type: 'error' });
      return;
    }
    if (newPassword.length < 8) {
      setMessage({ text: 'Пароль должен содержать не менее 8 символов', type: 'error' });
      return;
    }
    if (oldPassword === newPassword) {
      setMessage({ text: 'Новый пароль должен отличаться от старого', type: 'error' });
      return;
    }
    try {
      await dispatch(updateUserPassword({ oldPassword, newPassword })).unwrap();
      setMessage({ text: 'Пароль успешно изменён', type: 'success' });
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setMessage({ text: err || 'Ошибка смены пароля', type: 'error' });
    }
  };

  return (
    <div style={{ padding: '30px', maxWidth: '600px', margin: '0 auto' }}>
      <h2>Профиль пользователя</h2>
      {user ? (
        <>
          <div style={{ marginBottom: '30px' }}>
            <h3>Информация</h3>
            <p><strong>ID:</strong> {user.id}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Дата регистрации:</strong> {registeredAt ? new Date(registeredAt).toLocaleDateString() : 'не указана'}</p>
            <p><strong>Количество документов:</strong> {userDocs.length}</p>
          </div>

          <div style={{ marginBottom: '30px' }}>
            <h3>Изменить имя</h3>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ padding: '8px', marginRight: '10px', border: '1px solid #ccc', borderRadius: '4px', width: '200px' }}
            />
            <button
              onClick={handleUpdateName}
              style={{ padding: '8px 16px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              Сохранить
            </button>
          </div>

          <div style={{ marginBottom: '30px' }}>
            <h3>Сменить пароль</h3>
            <div style={{ marginBottom: '10px' }}>
              <input
                type="password"
                placeholder="Старый пароль"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                style={{ padding: '8px', width: '100%', border: '1px solid #ccc', borderRadius: '4px' }}
              />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <input
                type="password"
                placeholder="Новый пароль"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                style={{ padding: '8px', width: '100%', border: '1px solid #ccc', borderRadius: '4px' }}
              />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <input
                type="password"
                placeholder="Подтвердите новый пароль"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={{ padding: '8px', width: '100%', border: '1px solid #ccc', borderRadius: '4px' }}
              />
            </div>
            <button
              onClick={handleUpdatePassword}
              style={{ padding: '8px 16px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              Сменить пароль
            </button>
          </div>

          {message && (
            <div
              style={{
                marginTop: '20px',
                padding: '10px',
                borderRadius: '4px',
                backgroundColor: message.type === 'success' ? '#d4edda' : '#f8d7da',
                color: message.type === 'success' ? '#155724' : '#721c24',
                border: `1px solid ${message.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`,
              }}
            >
              {message.text}
            </div>
          )}
          {error && !message && (
            <div style={{ marginTop: '20px', padding: '10px', borderRadius: '4px', backgroundColor: '#f8d7da', color: '#721c24', border: '1px solid #f5c6cb' }}>
              {error}
            </div>
          )}
        </>
      ) : (
        <p>Пользователь не авторизован.</p>
      )}
    </div>
  );
}