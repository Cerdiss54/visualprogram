import React, { useState, useCallback, useRef, useEffect } from 'react';
import { createEmptyData } from '@/functions/tableRendering';
import { recalculateTable } from '@/functions/formulaParser';
import { CellCoords, SelectedRange, SpreadsheetData } from '@/types/spreadsheet';
import { useTableEditor } from '@/functions/tableEditor';
import '@/App.css';

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const ROWS = 100;
const COLS = 26;

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

export default function App() {
  const [matrixData, setMatrixData] = useState<SpreadsheetData>(() => 
    createEmptyData(ROWS, COLS, alphabet)
  );
  
  const [activeCellId, setActiveCellId] = useState<string | null>(null);
  const [editingCellId, setEditingCellId] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState<string>('');
  const [selectedRange, setSelectedRange] = useState<SelectedRange | null>(null);
  const [lastClickedCell, setLastClickedCell] = useState<string | null>(null);
  
  const editInputRef = useRef<HTMLInputElement>(null);
  const {
    contextMenu,
    handleAddRow,
    handleDeleteRow,
    handleAddColumn,
    handleDeleteColumn,
    openContextMenu,
    closeContextMenu,
  } = useTableEditor(matrixData, setMatrixData, COLS, ROWS, alphabet);

  const handleSave = useCallback((cellId: string, value: string) => {
    setMatrixData((prev) => {
      const updated: SpreadsheetData = {
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

  const handleEditKeyDown = useCallback((e: React.KeyboardEvent, cellId: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave(cellId, inputValue);
    }
    if (e.key === 'Escape') {
      setEditingCellId(null);
    }
  }, [inputValue, handleSave]);

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
      const newRange = {
        start: clickedCoords,
        end: clickedCoords,
      };
      setSelectedRange(newRange);
      setActiveCellId(cellId);
      setLastClickedCell(cellId);
    }
  }, [lastClickedCell]);

  useEffect(() => {
    if (contextMenu) {
      document.addEventListener('click', closeContextMenu);
      return () => document.removeEventListener('click', closeContextMenu);
    }
  }, [contextMenu, closeContextMenu]);

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (editingCellId) return;

      if ((e.key === 'Enter') && activeCellId) {
        e.preventDefault();
        startEditing(activeCellId, matrixData[activeCellId]?.entValue || '');
        return;
      }

      if (activeCellId) {
        const coords = cellIdToCoords(activeCellId);
        let newRow = coords.row;
        let newCol = coords.col;
        
        if (e.key === 'ArrowUp') newRow = Math.max(0, coords.row - 1);
        if (e.key === 'ArrowDown') newRow = Math.min(ROWS - 1, coords.row + 1);
        if (e.key === 'ArrowLeft') newCol = Math.max(0, coords.col - 1);
        if (e.key === 'ArrowRight') newCol = Math.min(COLS - 1, coords.col + 1);
        
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
  }, [activeCellId, editingCellId, startEditing, matrixData]);

  useEffect(() => {
    if (editingCellId && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [editingCellId]);

  return (
    <div className="app-container">
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

      <div className="table-scroll-box">
        <table className="excel-table">
          <thead>
            <tr>
              <th className="sticky-corner"></th>
              {alphabet.slice(0, COLS).map((letter, colIdx) => (
                <th 
                  key={letter} 
                  className="sticky-col-header"
                  onContextMenu={(e) => openContextMenu(e, 'column', colIdx)}
                >
                  {letter}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: ROWS }).map((_, rIdx) => {
              const rowNum = rIdx + 1;

              return (
                <tr key={rowNum}>
                  <td 
                    className="sticky-row-header"
                    onContextMenu={(e) => openContextMenu(e, 'row', rIdx)}
                  >
                    {rowNum}
                  </td>
                  {alphabet.slice(0, COLS).map((letter) => {
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
                            onKeyDown={(e) => handleEditKeyDown(e, cellId)}
                            onBlur={() => handleSave(cellId, inputValue)}
                          />
                        ) : (
                          <span className="cell-view-text">
                            {cell?.dispValue ?? ''}
                          </span>
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
                onMouseEnter={(e) => (e.currentTarget.style.background = '#f0f0f0')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'white')}
              >
                Добавить строку
              </div>
              <div 
                style={{ padding: '8px 12px', cursor: 'pointer', color: '#d32f2f' }}
                onClick={() => handleDeleteRow(contextMenu.index)}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#ffebee')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'white')}
              >
                Удалить строку {contextMenu.index + 1}
              </div>
            </>
          ) : (
            <>
              <div 
                style={{ padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid #eee' }}
                onClick={() => handleAddColumn(contextMenu.index)}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#f0f0f0')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'white')}
              >
                Добавить столбец
              </div>
              <div 
                style={{ padding: '8px 12px', cursor: 'pointer', color: '#d32f2f' }}
                onClick={() => handleDeleteColumn(contextMenu.index)}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#ffebee')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'white')}
              >
                Удалить столбец {String.fromCharCode(65 + contextMenu.index)}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}