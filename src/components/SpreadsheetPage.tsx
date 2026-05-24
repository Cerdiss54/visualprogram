import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  setActiveCell,
  setSelectedRange,
  setLastClickedCell,
  updateCellData,
  addRowThunk,
  deleteRowThunk,
  addColumnThunk,
  deleteColumnThunk,
  undo,
  redo,
} from '@/store/slices/spreadsheetSlice';
import { saveActiveDocument, switchDocument } from '@/store/slices/documentsSlice';
import { CellCoords, SelectedRange } from '@/types/spreadsheet';
import { useTableResize } from '@/functions/tableResize';
import { ContextMenuState } from '@/functions/tableEditor';
import { useVirtualizer } from '@tanstack/react-virtual';

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

const cellIdToCoords = (id: string): CellCoords => {
  const match = id.match(/^([A-Z]+)(\d+)$/);
  if (!match) return { row: 0, col: 0 };
  const col = alphabet.indexOf(match[1]);
  const row = parseInt(match[2], 10) - 1;
  return { row, col };
};

const isCellInRange = (cellId: string, range: SelectedRange | null): boolean => {
  if (!range) return false;
  const { row, col } = cellIdToCoords(cellId);
  const minRow = Math.min(range.start.row, range.end.row);
  const maxRow = Math.max(range.start.row, range.end.row);
  const minCol = Math.min(range.start.col, range.end.col);
  const maxCol = Math.max(range.start.col, range.end.col);
  return row >= minRow && row <= maxRow && col >= minCol && col <= maxCol;
};

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

  const parentRef = useRef<HTMLDivElement>(null);
  const rowVirtualizer = useVirtualizer({
    count: rows,
    getScrollElement: () => parentRef.current,
    estimateSize: (i) => rowHeights[i] || 24,
    overscan: 10,
    enabled: rows > 0,
  });

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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && activeCellId && !editingCellId) {
        if (document.activeElement?.tagName === 'INPUT') return;
        e.preventDefault();
        const cell = matrixData[activeCellId];
        startEditing(activeCellId, cell?.entValue ?? '');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeCellId, editingCellId, matrixData, startEditing]);

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

  if (!currentDoc || rows === 0 || cols === 0) return null;

  const virtualRows = rowVirtualizer.getVirtualItems();
  const paddingTop = virtualRows.length > 0 ? virtualRows[0].start : 0;
  const paddingBottom = virtualRows.length > 0 ? rowVirtualizer.getTotalSize() - virtualRows[virtualRows.length - 1].end : 0;

  return (
    <>
      <div className="table-scroll-box" ref={parentRef} style={{ overflow: 'auto', height: '100%', maxHeight: 'calc(100vh - 150px)' }}>
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
                >
                  {letter}
                  <div
                    style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '5px', cursor: 'col-resize', zIndex: 1 }}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      startResizeColumn(colIdx, e.clientX, columnWidths[colIdx]);
                    }}
                  />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paddingTop > 0 && (
              <tr>
                <td style={{ height: `${paddingTop}px`, padding: 0, border: 0 }} colSpan={cols + 1} />
              </tr>
            )}
            {virtualRows.map((virtualRow) => {
              const rIdx = virtualRow.index;
              const rowNum = rIdx + 1;
              const rowHeight = rowHeights[rIdx] || 24;
              return (
                <tr key={virtualRow.key} style={{ height: rowHeight }} data-index={virtualRow.index} ref={rowVirtualizer.measureElement}>
                  <td
                    className="sticky-row-header"
                    style={{ height: rowHeight, position: 'relative' }}
                    onContextMenu={(e) => openContextMenu(e, 'row', rIdx)}
                  >
                    {rowNum}
                    <div
                      style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: '5px', cursor: 'row-resize', zIndex: 1 }}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        startResizeRow(rIdx, e.clientY, rowHeights[rIdx]);
                      }}
                    />
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
            {paddingBottom > 0 && (
              <tr>
                <td style={{ height: `${paddingBottom}px`, padding: 0, border: 0 }} colSpan={cols + 1} />
              </tr>
            )}
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
              <div style={{ padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid #eee' }} onClick={() => handleAddRow(contextMenu.index)}>Добавить строку</div>
              <div style={{ padding: '8px 12px', cursor: 'pointer', color: '#d32f2f' }} onClick={() => handleDeleteRow(contextMenu.index)}>Удалить строку {contextMenu.index + 1}</div>
            </>
          ) : (
            <>
              <div style={{ padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid #eee' }} onClick={() => handleAddColumn(contextMenu.index)}>Добавить столбец</div>
              <div style={{ padding: '8px 12px', cursor: 'pointer', color: '#d32f2f' }} onClick={() => handleDeleteColumn(contextMenu.index)}>Удалить столбец {String.fromCharCode(65 + contextMenu.index)}</div>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default function SpreadsheetPage() {
  const { documentId } = useParams<{ documentId: string }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const documents = useAppSelector((s) => s.documents.list);
  const activeDocId = useAppSelector((s) => s.documents.activeDocId);
  const activeCellId = useAppSelector((s) => s.spreadsheet.activeCellId);
  const matrixData = useAppSelector((s) => s.spreadsheet.matrixData);
  const saveStatus = useAppSelector((s) => s.ui.saveStatus);
  const hasUnsavedChanges = useAppSelector((s) => s.ui.hasUnsavedChanges);
  const isLoading = useAppSelector((s) => s.ui.isLoading);

  const currentDoc = documents.find((d) => d.id === documentId);

  const navigateWithConfirm = useCallback((to: string) => {
    if (hasUnsavedChanges) {
      if (window.confirm('У вас есть несохранённые изменения. Покинуть страницу?')) {
        navigate(to);
      }
    } else {
      navigate(to);
    }
  }, [hasUnsavedChanges, navigate]);

  useEffect(() => {
    if (!isLoading && documentId && documentId !== activeDocId && currentDoc) {
      dispatch(switchDocument(documentId))
        .unwrap()
        .catch(console.error);
    }
  }, [documentId, activeDocId, isLoading, dispatch, currentDoc]);

  useEffect(() => {
    if (!isLoading && documentId && !currentDoc) {
      const timer = setTimeout(() => navigate('/404', { replace: true }), 500);
      return () => clearTimeout(timer);
    }
  }, [documentId, currentDoc, isLoading, navigate]);

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [hasUnsavedChanges]);

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        if (activeDocId) dispatch(saveActiveDocument());
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        e.preventDefault();
        dispatch(undo());
      } else if ((e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === 'y' || (e.key.toLowerCase() === 'z' && e.shiftKey))) {
        e.preventDefault();
        dispatch(redo());
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [activeDocId, dispatch]);

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

  if (isLoading || (documentId && !currentDoc)) {
    return <div style={{ padding: '20px' }}>Загрузка таблицы...</div>;
  }
  if (!currentDoc) return null;

  const Breadcrumbs = () => (
    <div style={{ fontSize: '14px', padding: '8px 16px', background: '#f5f5f5', borderBottom: '1px solid #ddd' }}>
      <span
        style={{ cursor: 'pointer', color: '#007bff' }}
        onClick={() => navigateWithConfirm('/dashboard')}
      >
        Мои документы
      </span>
      {' → '}
      <span style={{ fontWeight: 'bold' }}>{currentDoc.title}</span>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Breadcrumbs />
      <div style={{ display: 'flex', alignItems: 'center', padding: '8px 16px', gap: '12px', borderBottom: '1px solid #ddd' }}>
        <button onClick={() => navigateWithConfirm('/dashboard')}>⬅ На главную</button>
        <span style={{ flex: 1, fontWeight: 'bold' }}>{currentDoc.title}</span>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={exportToCSV}>Экспорт CSV</button>
          <button onClick={exportToJSON}>Экспорт JSON</button>
        </div>
        <span style={{ fontSize: '14px', color: saveStatus === 'error' ? '#d32f2f' : '#888' }}>
          {saveStatus === 'saving' && 'Сохранение...'}
          {saveStatus === 'saved' && 'Сохранено'}
          {saveStatus === 'error' && 'Ошибка сохранения'}
        </span>
      </div>

      <div style={{ display: 'flex', padding: '4px 16px', gap: '8px', borderBottom: '1px solid #ddd' }}>
        <div style={{ width: '60px', fontWeight: 'bold' }}>{activeCellId ?? ''}</div>
        <input
          type="text"
          style={{ flex: 1 }}
          value={activeCellId ? matrixData[activeCellId]?.entValue || '' : ''}
          disabled={!activeCellId}
          placeholder="Содержимое активной ячейки..."
          onChange={(e) => {
            if (activeCellId) dispatch(updateCellData({ cellId: activeCellId, entValue: e.target.value }));
          }}
        />
      </div>

      <SpreadsheetTable />
    </div>
  );
}