import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import Dashboard from '@/components/Dashboard';
import {
  setActiveCell,
  setSelectedRange,
  setLastClickedCell,
  updateCellData,
  addRowThunk,
  deleteRowThunk,
  addColumnThunk,
  deleteColumnThunk,
} from '@/store/slices/spreadsheetSlice';
import {
  switchDocument,
  deleteDocumentById,
  renameDocument,
  duplicateDocument,
  importDocument,
  createNewDocument,
  fetchDocuments,
  saveActiveDocument,
} from '@/store/slices/documentsSlice';
import { setScreen, setHasUnsavedChanges, setSaveStatus } from '@/store/slices/uiSlice';
import { CellCoords, SelectedRange, DocumentItem, ContextMenuState } from '@/types/spreadsheet';
import { useTableResize } from '@/functions/tableResize';
import '@/App.css';

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

const cellIdToCoords = (id: string): CellCoords => {
  const match = id.match(/^([A-Z]+)(\d+)$/);
  if (!match) return { row: 0, col: 0 };
  const col = alphabet.indexOf(match[1]);
  const row = parseInt(match[2], 10) - 1;
  return { row, col };
};

const coordsToCellId = (coords: CellCoords): string => `${alphabet[coords.col]}${coords.row + 1}`;

const isCellInRange = (cellId: string, range: SelectedRange | null): boolean => {
  if (!range) return false;
  const { row, col } = cellIdToCoords(cellId);
  const minRow = Math.min(range.start.row, range.end.row);
  const maxRow = Math.max(range.start.row, range.end.row);
  const minCol = Math.min(range.start.col, range.end.col);
  const maxCol = Math.max(range.start.col, range.end.col);
  return row >= minRow && row <= maxRow && col >= minCol && col <= maxCol;
};

// ----------------------------------------------------------------------
// Компонент таблицы (внутри App)
// ----------------------------------------------------------------------
const SpreadsheetTable: React.FC = () => {
  const dispatch = useAppDispatch();
  const matrixData = useAppSelector((s) => s.spreadsheet.matrixData);
  const activeCellId = useAppSelector((s) => s.spreadsheet.activeCellId);
  const selectedRange = useAppSelector((s) => s.spreadsheet.selectedRange);
  const lastClickedCell = useAppSelector((s) => s.spreadsheet.lastClickedCell);
  const currentDoc = useAppSelector((s) =>
    s.documents.list.find((d) => d.id === s.documents.activeDocId)
  );
  const rows = currentDoc?.rows ?? 0;
  const cols = currentDoc?.cols ?? 0;

  const [editingCellId, setEditingCellId] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState<string>('');
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

  const { columnWidths, rowHeights, startResizeColumn, startResizeRow, isResizing } = useTableResize(cols, rows);

  const handleSave = useCallback((cellId: string, value: string) => {
    dispatch(updateCellData({ cellId, entValue: value }));
    setEditingCellId(null);
  }, [dispatch]);

  const startEditing = useCallback((cellId: string, currentValue: string) => {
    setEditingCellId(cellId);
    setInputValue(currentValue);
  }, []);

  const handleCellClick = useCallback((cellId: string, e: React.MouseEvent) => {
    const clickedCoords = cellIdToCoords(cellId);
    if (e.shiftKey && lastClickedCell) {
      const startCoords = cellIdToCoords(lastClickedCell);
      dispatch(setSelectedRange({ start: startCoords, end: clickedCoords }));
      dispatch(setActiveCell(cellId));
    } else if (!e.shiftKey) {
      dispatch(setSelectedRange({ start: clickedCoords, end: clickedCoords }));
      dispatch(setActiveCell(cellId));
      dispatch(setLastClickedCell(cellId));
    }
  }, [dispatch, lastClickedCell]);

  const openContextMenu = (e: React.MouseEvent, type: 'row' | 'column', index: number) => {
    e.preventDefault();
    setContextMenu({ visible: true, x: e.clientX, y: e.clientY, type, index });
  };
  const closeContextMenu = () => setContextMenu(null);

  const handleAddRow = (rowIndex: number) => {
    dispatch(addRowThunk({ rowIndex: rowIndex + 1, totalCols: cols, alphabet }));
    closeContextMenu();
  };
  const handleDeleteRow = (rowIndex: number) => {
    dispatch(deleteRowThunk({ rowIndex: rowIndex + 1, alphabet }));
    closeContextMenu();
  };
  const handleAddColumn = (colIndex: number) => {
    dispatch(addColumnThunk({ colIndex, totalRows: rows, alphabet }));
    closeContextMenu();
  };
  const handleDeleteColumn = (colIndex: number) => {
    dispatch(deleteColumnThunk({ colIndex, alphabet }));
    closeContextMenu();
  };

  const handleColumnMouseDown = (colIndex: number, e: React.MouseEvent<HTMLTableHeaderCellElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    if (e.clientX >= rect.right - 5) {
      e.preventDefault();
      startResizeColumn(colIndex, e.clientX, columnWidths[colIndex]);
    }
  };
  const handleRowMouseDown = (rowIndex: number, e: React.MouseEvent<HTMLTableCellElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    if (e.clientY >= rect.bottom - 5) {
      e.preventDefault();
      startResizeRow(rowIndex, e.clientY, rowHeights[rowIndex]);
    }
  };

  useEffect(() => {
    if (contextMenu) {
      document.addEventListener('click', closeContextMenu);
      return () => document.removeEventListener('click', closeContextMenu);
    }
  }, [contextMenu]);

  useEffect(() => {
    document.body.style.cursor = isResizing ? 'col-resize' : '';
    return () => { document.body.style.cursor = ''; };
  }, [isResizing]);

  useEffect(() => {
    if (editingCellId && editInputRef.current) editInputRef.current.focus();
  }, [editingCellId]);

  if (!currentDoc) return null;

  return (
    <>
      <div className="table-scroll-box">
        <table className="excel-table">
          <thead>
            <tr>
              <th className="sticky-corner"></th>
              {alphabet.slice(0, cols).map((letter, colIdx) => (
                <th
                  key={letter}
                  className="sticky-col-header"
                  style={{ width: columnWidths[colIdx], position: 'relative' }}
                  onContextMenu={(e) => openContextMenu(e, 'column', colIdx)}
                  onMouseDown={(e) => handleColumnMouseDown(colIdx, e)}
                >
                  {letter}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }).map((_, rIdx) => {
              const rowNum = rIdx + 1;
              const rowHeight = rowHeights[rIdx];
              return (
                <tr key={rowNum} style={{ height: rowHeight }}>
                  <td
                    className="sticky-row-header"
                    style={{ height: rowHeight, position: 'relative' }}
                    onContextMenu={(e) => openContextMenu(e, 'row', rIdx)}
                    onMouseDown={(e) => handleRowMouseDown(rIdx, e)}
                  >
                    {rowNum}
                  </td>
                  {alphabet.slice(0, cols).map((letter) => {
                    const cellId = `${letter}${rowNum}`;
                    const cell = matrixData[cellId];
                    const isActive = activeCellId === cellId;
                    const isEditing = editingCellId === cellId;
                    const isInRange = isCellInRange(cellId, selectedRange);
                    return (
                      <td
                        key={cellId}
                        className={`grid-cell ${isActive ? 'active' : ''}`}
                        style={{
                          backgroundColor: isInRange && !isActive ? '#e6f4ea' : undefined,
                          width: columnWidths[alphabet.indexOf(letter)],
                          height: rowHeight,
                        }}
                        onClick={(e) => handleCellClick(cellId, e)}
                        onDoubleClick={() => startEditing(cellId, cell?.entValue ?? '')}
                      >
                        {isEditing ? (
                          <input
                            ref={editInputRef}
                            type="text"
                            className="cell-input-field"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleSave(cellId, inputValue);
                              }
                              if (e.key === 'Escape') setEditingCellId(null);
                            }}
                            onBlur={() => handleSave(cellId, inputValue)}
                          />
                        ) : (
                          <span className="cell-view-text">{cell?.dispValue ?? ''}</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {contextMenu?.visible && (
        <div
          style={{
            position: 'fixed',
            top: contextMenu.y,
            left: contextMenu.x,
            background: 'white',
            border: '1px solid #ccc',
            borderRadius: '4px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
            zIndex: 1000,
            minWidth: '200px',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {contextMenu.type === 'row' ? (
            <>
              <div style={{ padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid #eee' }} onClick={() => handleAddRow(contextMenu.index)}>
                Добавить строку
              </div>
              <div style={{ padding: '8px 12px', cursor: 'pointer', color: '#d32f2f' }} onClick={() => handleDeleteRow(contextMenu.index)}>
                Удалить строку {contextMenu.index + 1}
              </div>
            </>
          ) : (
            <>
              <div style={{ padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid #eee' }} onClick={() => handleAddColumn(contextMenu.index)}>
                Добавить столбец
              </div>
              <div style={{ padding: '8px 12px', cursor: 'pointer', color: '#d32f2f' }} onClick={() => handleDeleteColumn(contextMenu.index)}>
                Удалить столбец {String.fromCharCode(65 + contextMenu.index)}
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};

// ----------------------------------------------------------------------
// Главный компонент App
// ----------------------------------------------------------------------
export default function App() {
  const dispatch = useAppDispatch();
  const screen = useAppSelector((s) => s.ui.screen);
  const documents = useAppSelector((s) => s.documents.list);
  const activeDocId = useAppSelector((s) => s.documents.activeDocId);
  const matrixData = useAppSelector((s) => s.spreadsheet.matrixData);
  const saveStatus = useAppSelector((s) => s.ui.saveStatus);
  const hasUnsavedChanges = useAppSelector((s) => s.ui.hasUnsavedChanges);
  const isLoading = useAppSelector((s) => s.ui.isLoading); // нужно добавить в uiSlice
  const currentDoc = documents.find((d) => d.id === activeDocId);

  // Загрузка документов при старте
  useEffect(() => {
    dispatch(fetchDocuments());
  }, [dispatch]);

  // Блокировка закрытия страницы при несохранённых изменениях
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('unload', handler);
  }, [hasUnsavedChanges]);

  // Глобальные горячие клавиши
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        if (activeDocId) dispatch(saveActiveDocument());
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [activeDocId, dispatch]);

  // Обработчики документов
  const handleCreateDocument = (title: string, rows: number, cols: number) => {
    dispatch(createNewDocument({ title, rows, cols })).then((action) => {
      if (createNewDocument.fulfilled.match(action)) {
        dispatch(switchDocument(action.payload.id));
      }
    });
  };
  const handleSelectDocument = (id: string) => dispatch(switchDocument(id));
  const handleDeleteDocument = (id: string) => dispatch(deleteDocumentById(id));
  const handleRenameDocument = (id: string, newTitle: string) => dispatch(renameDocument({ id, newTitle }));
  const handleDuplicateDocument = (id: string) => dispatch(duplicateDocument(id));
  const handleImportDocument = (doc: DocumentItem) => dispatch(importDocument(doc));

  // Экспорт CSV/JSON
  const exportToCSV = () => {
    if (!currentDoc) return;
    const { rows, cols, matrixData, title } = currentDoc;
    const csvRows: string[] = [];
    for (let r = 0; r < rows; r++) {
      const rowData: string[] = [];
      for (let c = 0; c < cols; c++) {
        let value = matrixData[`${alphabet[c]}${r + 1}`]?.entValue || '';
        if (value.includes(',') || value.includes('"') || value.includes('\n')) {
          value = `"${value.replace(/"/g, '""')}"`;
        }
        rowData.push(value);
      }
      csvRows.push(rowData.join(','));
    }
    const blob = new Blob(['\uFEFF' + csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute('download', `${title}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportToJSON = () => {
    if (!currentDoc) return;
    const { title, rows, cols, matrixData, createdAt, updatedAt } = currentDoc;
    const exportDoc = { title, rows, cols, matrixData, createdAt, updatedAt };
    const blob = new Blob([JSON.stringify(exportDoc, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute('download', `${title}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return <div style={{ padding: '20px' }}>Загрузка документов...</div>;
  }

  if (screen === 'dashboard') {
    return (
      <Dashboard
        documents={documents}
        onDuplicateDoc={handleDuplicateDocument}
        onCreateDoc={handleCreateDocument}
        onSelectDoc={handleSelectDocument}
        onDeleteDoc={handleDeleteDocument}
        onRenameDoc={handleRenameDocument}
        onImportDoc={handleImportDocument}
      />
    );
  }

  if (!currentDoc) {
    // Если активного документа нет, возвращаем на дашборд
    dispatch(setScreen('dashboard'));
    return null;
  }

  return (
    <div className="app-container">
      <div className="table-toolbar">
        <button className="btn-back" onClick={() => dispatch(setScreen('dashboard'))}>
          ⬅ На главную
        </button>
        <span className="current-doc-title">{currentDoc.title}</span>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
          <button onClick={exportToCSV}>Экспорт CSV</button>
          <button onClick={exportToJSON}>Экспорт JSON</button>
        </div>
        <span
          style={{
            marginLeft: '15px',
            fontSize: '14px',
            color: saveStatus === 'error' ? '#d32f2f' : '#888',
          }}
        >
          {saveStatus === 'saving' && 'Сохранение...'}
          {saveStatus === 'saved' && 'Сохранено'}
          {saveStatus === 'error' && 'Ошибка сохранения'}
        </span>
      </div>

      <div className="formula-bar">
        <div className="active-id-box">{activeDocId ?? ''}</div>
        <input
          type="text"
          className="formula-input"
          value={activeDocId ? matrixData[activeDocId]?.entValue || '' : ''}
          disabled={!activeDocId}
          placeholder="Содержимое активной ячейки..."
          onChange={(e) => {
            if (activeDocId) {
              dispatch(updateCellData({ cellId: activeDocId, entValue: e.target.value }));
            }
          }}
        />
      </div>

      <SpreadsheetTable />
    </div>
  );
}