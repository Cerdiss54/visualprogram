import React, { useState } from 'react';
import { DocumentItem } from '@/types/spreadsheet';

interface DashboardProps {
  documents: DocumentItem[];
  onCreateDoc: (title: string, rows: number, cols: number, data?: any) => void; 
  onSelectDoc: (id: string) => void;
  onDeleteDoc: (id: string) => void;
  onRenameDoc: (id: string, newTitle: string) => void;
  onDuplicateDoc: (id: string) => void; 
}

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

function PreviewTable({ doc }: { doc: DocumentItem }) {
  const previewRows = 3;
  const previewCols = 3;

  return (
    <div className="preview-table-box">
      <table className="dashboard-preview-table">
        <tbody>
          {Array.from({ length: previewRows }).map((_, rIdx) => (
            <tr key={rIdx}>
              {Array.from({ length: previewCols }).map((_, cIdx) => {
                const cellId = `${alphabet[cIdx]}${rIdx + 1}`;
                const cellValue = doc.matrixData[cellId]?.dispValue || '';
                return (
                  <td key={cIdx} title={cellId}>
                    {cellValue}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function Dashboard({ documents, onCreateDoc, onSelectDoc, onDeleteDoc, onRenameDoc, onDuplicateDoc }: DashboardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newDocTitle, setNewDocTitle] = useState('');
  const [docRows, setDocRows] = useState(100);
  const [docCols, setDocCols] = useState(26);
  
  const [editingDocId, setEditingDocId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [docToDelete, setDocToDelete] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newDocTitle.trim()) return;
    
    const validatedRows = Math.max(1, Math.min(1000, Number(docRows) || 10));
    const validatedCols = Math.max(1, Math.min(26, Number(docCols) || 10));

    onCreateDoc(newDocTitle.trim(), validatedRows, validatedCols);
    
    setNewDocTitle('');
    setDocRows(100);
    setDocCols(26);
    setIsModalOpen(false);
  };

  const startRename = (doc: DocumentItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingDocId(doc.id);
    setEditingTitle(doc.title);
  };

  const saveRename = () => {
    if (editingDocId && editingTitle.trim()) {
      onRenameDoc(editingDocId, editingTitle.trim());
    }
    setEditingDocId(null);
    setEditingTitle('');
  };

  const handleRenameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      saveRename();
    }
    if (e.key === 'Escape') {
      setEditingDocId(null);
      setEditingTitle('');
    }
  };

  const confirmDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDocToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirmed = () => {
    if (docToDelete) {
      onDeleteDoc(docToDelete);
      setDocToDelete(null);
    }
    setDeleteConfirmOpen(false);
  };

  const cancelDelete = () => {
    setDocToDelete(null);
    setDeleteConfirmOpen(false);
  };

  const handleDuplicate = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onDuplicateDoc(id);
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Мои таблицы</h1>
        <button className="btn-create" onClick={() => setIsModalOpen(true)}>
          + Создать таблицу
        </button>
      </header>

      <div className="doc-grid">
        {documents.length === 0 ? (
          <div className="empty-state">У вас пока нет созданных таблиц.</div>
        ) : (
          documents.map((doc) => (
            <div key={doc.id} className="doc-card" onClick={() => onSelectDoc(doc.id)}>
              <div className="doc-main-content">
                <div className="doc-meta-info">
                  {editingDocId === doc.id ? (
                    <input
                      type="text"
                      className="rename-input"
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      onBlur={saveRename}
                      onKeyDown={handleRenameKeyDown}
                      autoFocus
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <div className="doc-title-wrapper">
                      <h3>{doc.title}</h3>
                      <button
                        className="btn-rename"
                        onClick={(e) => startRename(doc, e)}
                        title="Переименовать"
                      >
                        Переименовать
                      </button>
                    </div>
                  )}
                  <span className="doc-dimensions-badge">
                    Размер: {doc.rows} × {doc.cols}
                  </span>
                  <p>Создан: {new Date(doc.createdAt).toLocaleDateString()}</p>
                  <p>Изменен: {new Date(doc.updatedAt).toLocaleDateString()}</p>
                </div>
                <PreviewTable doc={doc} />
              </div>

              <div className="doc-actions">
                <button
                  className="btn-duplicate"
                  onClick={(e) => handleDuplicate(doc.id, e)}
                  title="Копировать"
                >
                  Копировать
                </button>
                <button
                  className="btn-delete"
                  onClick={(e) => confirmDelete(doc.id, e)}
                  title="Удалить таблицу"
                >
                  Удалить
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Новая таблица</h2>
            <form onSubmit={handleSubmit}>
              <label className="modal-label">Название таблицы</label>
              <input
                type="text"
                placeholder="Введите название таблицы..."
                value={newDocTitle}
                onChange={(e) => setNewDocTitle(e.target.value)}
                required
                autoFocus
              />

              <div className="modal-row-inputs">
                <div className="input-group">
                  <label className="modal-label">Строки (max 1000)</label>
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    value={docRows}
                    onChange={(e) => setDocRows(parseInt(e.target.value, 10) || 0)}
                    required
                  />
                </div>
                <div className="input-group">
                  <label className="modal-label">Столбцы (max 26)</label>
                  <input
                    type="number"
                    min="1"
                    max="26"
                    value={docCols}
                    onChange={(e) => setDocCols(parseInt(e.target.value, 10) || 0)}
                    required
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setIsModalOpen(false)}>
                  Отмена
                </button>
                <button type="submit" className="btn-confirm">
                  Создать
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteConfirmOpen && (
        <div className="modal-overlay" onClick={cancelDelete}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Подтверждение удаления</h2>
            <p>Вы уверены, что хотите удалить этот документ? Восстановить его будет невозможно.</p>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={cancelDelete}>
                Отмена
              </button>
              <button className="btn-confirm btn-danger" onClick={handleDeleteConfirmed}>
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}