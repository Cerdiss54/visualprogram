import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import Dashboard from '@/components/Dashboard';
import { createEmptyData } from '@/functions/tableRendering';
import { recalculateTable } from '@/functions/formulaParser';
import { CellCoords, SelectedRange, SpreadsheetData, DocumentItem } from '@/types/spreadsheet';
import { useTableEditor } from '@/functions/tableEditor';
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

const coordsToCellId = (coords: CellCoords): string => {
  return `${alphabet[coords.col]}${coords.row + 1}`;
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

interface SpreadsheetTableProps {
  matrixData: SpreadsheetData;
  setMatrixData: React.Dispatch<React.SetStateAction<SpreadsheetData>>;
  rows: number;
  cols: number;
  activeCellId: string | null;
  setActiveCellId: React.Dispatch<React.SetStateAction<string | null>>;
  editingCellId: string | null;
  setEditingCellId: React.Dispatch<React.SetStateAction<string | null>>;
  inputValue: string;
  setInputValue: React.Dispatch<React.SetStateAction<string>>;
  selectedRange: SelectedRange | null;
  setSelectedRange: React.Dispatch<React.SetStateAction<SelectedRange | null>>;
  lastClickedCell: string | null;
  setLastClickedCell: React.Dispatch<React.SetStateAction<string | null>>;
  handleSave: (cellId: string, value: string) => void;
  startEditing: (cellId: string, currentValue: string) => void;
  handleCellClick: (cellId: string, e: React.MouseEvent) => void;
  editInputRef: React.RefObject<HTMLInputElement>;
}

const SpreadsheetTable: React.FC<SpreadsheetTableProps> = ({
  matrixData,
  setMatrixData,
  rows,
  cols,
  activeCellId,
  setActiveCellId,
  editingCellId,
  setEditingCellId,
  inputValue,
  setInputValue,
  selectedRange,
  setSelectedRange,
  lastClickedCell,
  setLastClickedCell,
  handleSave,
  startEditing,
  handleCellClick,
  editInputRef,
}) => {
  const {
    contextMenu,
    handleAddRow,
    handleDeleteRow,
    handleAddColumn,
    handleDeleteColumn,
    openContextMenu,
    closeContextMenu,
  } = useTableEditor(matrixData, setMatrixData, cols, rows, alphabet);

  const {
    columnWidths,
    rowHeights,
    startResizeColumn,
    startResizeRow,
    isResizing,
  } = useTableResize(cols, rows);

  const handleColumnMouseDown = useCallback((colIndex: number, e: React.MouseEvent<HTMLTableHeaderCellElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const isOnRightEdge = e.clientX >= rect.right - 5;
    if (isOnRightEdge) {
      e.preventDefault();
      if (colIndex >= 0 && colIndex < columnWidths.length) {
        startResizeColumn(colIndex, e.clientX, columnWidths[colIndex]);
      }
    }
  }, [columnWidths, startResizeColumn]);

  const handleRowMouseDown = useCallback((rowIndex: number, e: React.MouseEvent<HTMLTableCellElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const isOnBottomEdge = e.clientY >= rect.bottom - 5;
    if (isOnBottomEdge) {
      e.preventDefault();
      if (rowIndex >= 0 && rowIndex < rowHeights.length) {
        startResizeRow(rowIndex, e.clientY, rowHeights[rowIndex]);
      }
    }
  }, [rowHeights, startResizeRow]);

  useEffect(() => {
    if (contextMenu) {
      document.addEventListener('click', closeContextMenu);
      return () => document.removeEventListener('click', closeContextMenu);
    }
  }, [contextMenu, closeContextMenu]);

  useEffect(() => {
    if (isResizing) {
      document.body.style.cursor = 'col-resize';
    } else {
      document.body.style.cursor = '';
    }
    return () => {
      document.body.style.cursor = '';
    };
  }, [isResizing]);

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
                  style={{
                    width: columnWidths[colIdx],
                    position: 'relative',
                  }}
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
                              if (e.key === 'Escape') {
                                setEditingCellId(null);
                              }
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
              <div
                style={{ padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid #eee' }}
                onClick={() => handleAddRow(contextMenu.index)}
              >
                Добавить строку
              </div>
              <div
                style={{ padding: '8px 12px', cursor: 'pointer', color: '#d32f2f' }}
                onClick={() => handleDeleteRow(contextMenu.index)}
              >
                Удалить строку {contextMenu.index + 1}
              </div>
            </>
          ) : (
            <>
              <div
                style={{ padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid #eee' }}
                onClick={() => handleAddColumn(contextMenu.index)}
              >
                Добавить столбец
              </div>
              <div
                style={{ padding: '8px 12px', cursor: 'pointer', color: '#d32f2f' }}
                onClick={() => handleDeleteColumn(contextMenu.index)}
              >
                Удалить столбец {String.fromCharCode(65 + contextMenu.index)}
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default function App() {
  const [screen, setScreen] = useState<'dashboard' | 'spreadsheet'>('dashboard');
  const [documents, setDocuments] = useState<DocumentItem[]>(() => {
    const saved = localStorage.getItem('spreadsheet_docs');
    return saved ? JSON.parse(saved) : [];
  });
  const [activeDocId, setActiveDocId] = useState<string | null>(null);
  const [matrixData, setMatrixData] = useState<SpreadsheetData>({});
  const [activeCellId, setActiveCellId] = useState<string | null>(null);
  const [editingCellId, setEditingCellId] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState<string>('');
  const [selectedRange, setSelectedRange] = useState<SelectedRange | null>(null);
  const [lastClickedCell, setLastClickedCell] = useState<string | null>(null);

  const editInputRef = useRef<HTMLInputElement>(null);
  const currentDoc = documents.find((d) => d.id === activeDocId);
  const currentRows = currentDoc?.rows ?? 0;
  const currentCols = currentDoc?.cols ?? 0;

  useEffect(() => {
    localStorage.setItem('spreadsheet_docs', JSON.stringify(documents));
  }, [documents]);

  useEffect(() => {
    if (activeDocId && currentDoc) {
      setMatrixData(currentDoc.matrixData);
    }
  }, [activeDocId, currentDoc]);

  useEffect(() => {
    if (activeDocId && Object.keys(matrixData).length > 0) {
      setDocuments((prev) =>
        prev.map((doc) =>
          doc.id === activeDocId
            ? { ...doc, updatedAt: new Date().toISOString(), matrixData }
            : doc
        )
      );
    }
  }, [matrixData, activeDocId]);

  const handleCreateDocument = (title: string, rows: number, cols: number) => {
    const newDoc: DocumentItem = {
      id: crypto.randomUUID(),
      title,
      rows,
      cols,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      matrixData: createEmptyData(rows, cols, alphabet),
    };
    setDocuments((prev) => [newDoc, ...prev]);
  };

  const handleSelectDocument = (id: string) => {
    setActiveDocId(id);
    setScreen('spreadsheet');
    setActiveCellId(null);
    setSelectedRange(null);
    setEditingCellId(null);
    setLastClickedCell(null);
  };

  const handleDeleteDocument = (id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
    if (activeDocId === id) {
      setActiveDocId(null);
      setScreen('dashboard');
      setMatrixData({});
    }
  };

  const handleRenameDocument = useCallback((id: string, newTitle: string) => {
    setDocuments((prev) =>
      prev.map((doc) =>
        doc.id === id ? { ...doc, title: newTitle, updatedAt: new Date().toISOString() } : doc
      )
    );
  }, []);

  const handleSave = useCallback((cellId: string, value: string) => {
    setMatrixData((prev) => {
      const updated = {
        ...prev,
        [cellId]: {
          id: cellId,
          entValue: value,
          dispValue: prev[cellId]?.dispValue || '',
        },
      };
      return recalculateTable(updated);
    });
    setEditingCellId(null);
  }, []);
  const handleDuplicateDocument = useCallback((id: string) => {
  const originalDoc = documents.find(d => d.id === id);
  if (!originalDoc) return;

  const newTitle = `Копия ${originalDoc.title}`;
  const newDoc: DocumentItem = {
    id: crypto.randomUUID(),
    title: newTitle,
    rows: originalDoc.rows,
    cols: originalDoc.cols,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    matrixData: JSON.parse(JSON.stringify(originalDoc.matrixData)), // глубокое копирование
  };
  setDocuments(prev => [newDoc, ...prev]);
}, [documents]);

  const startEditing = useCallback((cellId: string, currentValue: string) => {
    setEditingCellId(cellId);
    setInputValue(currentValue);
  }, []);

  const handleCellClick = useCallback((cellId: string, e: React.MouseEvent) => {
    const clickedCoords = cellIdToCoords(cellId);
    if (e.shiftKey && lastClickedCell) {
      const startCoords = cellIdToCoords(lastClickedCell);
      setSelectedRange({
        start: startCoords,
        end: clickedCoords,
      });
      setActiveCellId(cellId);
    } else if (!e.shiftKey) {
      setSelectedRange({
        start: clickedCoords,
        end: clickedCoords,
      });
      setActiveCellId(cellId);
      setLastClickedCell(cellId);
    }
  }, [lastClickedCell]);

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (editingCellId || screen !== 'spreadsheet') return;
      if ((e.key === 'Enter' || e.key === 'F2') && activeCellId) {
        e.preventDefault();
        startEditing(activeCellId, matrixData[activeCellId]?.entValue || '');
        return;
      }
      if (activeCellId && currentRows > 0 && currentCols > 0) {
        const coords = cellIdToCoords(activeCellId);
        let newRow = coords.row;
        let newCol = coords.col;
        if (e.key === 'ArrowUp') newRow = Math.max(0, coords.row - 1);
        if (e.key === 'ArrowDown') newRow = Math.min(currentRows - 1, coords.row + 1);
        if (e.key === 'ArrowLeft') newCol = Math.max(0, coords.col - 1);
        if (e.key === 'ArrowRight') newCol = Math.min(currentCols - 1, coords.col + 1);
        if (newRow !== coords.row || newCol !== coords.col) {
          e.preventDefault();
          const newCellId = coordsToCellId({ row: newRow, col: newCol });
          setActiveCellId(newCellId);
          setSelectedRange({
            start: { row: newRow, col: newCol },
            end: { row: newRow, col: newCol },
          });
          setLastClickedCell(newCellId);
        }
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [activeCellId, editingCellId, startEditing, screen, currentRows, currentCols, matrixData]);

  useEffect(() => {
    if (editingCellId && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [editingCellId]);

  if (screen === 'dashboard') {
    return (
      <Dashboard
        documents={documents}
        onDuplicateDoc={handleDuplicateDocument}
        onCreateDoc={handleCreateDocument}
        onSelectDoc={handleSelectDocument}
        onDeleteDoc={handleDeleteDocument}
        onRenameDoc={handleRenameDocument}
      />
    );
  }

  if (!currentDoc) return null;

  return (
    <div className="app-container">
      <div className="table-toolbar">
        <button className="btn-back" onClick={() => setScreen('dashboard')}>
          ⬅ На главную
        </button>
        <span className="current-doc-title">📄 {currentDoc.title}</span>
      </div>

      <div className="formula-bar">
        <div className="active-id-box">{activeCellId ?? ''}</div>
        <input
          type="text"
          className="formula-input"
          value={activeCellId ? matrixData[activeCellId]?.entValue || '' : ''}
          disabled={!activeCellId}
          placeholder="Содержимое активной ячейки..."
          onChange={(e) => {
            if (activeCellId) {
              handleSave(activeCellId, e.target.value);
              setInputValue(e.target.value);
            }
          }}
        />
      </div>

      <SpreadsheetTable
        key={activeDocId}
        matrixData={matrixData}
        setMatrixData={setMatrixData}
        rows={currentRows}
        cols={currentCols}
        activeCellId={activeCellId}
        setActiveCellId={setActiveCellId}
        editingCellId={editingCellId}
        setEditingCellId={setEditingCellId}
        inputValue={inputValue}
        setInputValue={setInputValue}
        selectedRange={selectedRange}
        setSelectedRange={setSelectedRange}
        lastClickedCell={lastClickedCell}
        setLastClickedCell={setLastClickedCell}
        handleSave={handleSave}
        startEditing={startEditing}
        handleCellClick={handleCellClick}
        editInputRef={editInputRef}
      />
    </div>
  );
}