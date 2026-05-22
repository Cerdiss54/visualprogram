import React, { useState } from 'react';
import { createEmptyData } from '@/functions/tableRendering';
import '@/App.css'

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const ROWS = 100;
const COLS = 26;

export default function App() {
  const [matrixData, setMatrixData] = useState(() => 
    createEmptyData(ROWS, COLS, alphabet)
  );

  const [activeCellId, setActiveCellId] = useState<string | null>(null);

  const [editingCellId, setEditingCellId] = useState<string | null>(null);

  const [inputValue, setInputValue] = useState<string>('');

  const handleSave = (cellId: string) => {
    setMatrixData((prev) => ({
      ...prev,
      [cellId]: {
        id: cellId,
        entValue: inputValue,
        dispValue: inputValue, 
      },
    }));
    setEditingCellId(null); 
  };

  return (
    <div className="app-container">
      <div className="formula-bar">
        <div className="active-id-box">{activeCellId ?? ''}</div>
        <input
          type="text"
          className="formula-input"
          readOnly
          value={activeCellId ? matrixData[activeCellId]?.entValue : ''}
          placeholder="Содержимое активной ячейки..."
        />
      </div>

      <div className="table-scroll-box">
        <table className="excel-table">
          <thead>
            <tr>
              <th className="sticky-corner"></th>
              {alphabet.slice(0, COLS).map((letter) => (
                <th key={letter} className="sticky-col-header">
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
                  <td className="sticky-row-header">{rowNum}</td>

                  {alphabet.slice(0, COLS).map((letter) => {
                    const cellId = `${letter}${rowNum}`; 
                    const cell = matrixData[cellId];

                    const isActive = activeCellId === cellId;
                    const isEditing = editingCellId === cellId;

                    return (
                      <td
                        key={cellId}
                        className={`grid-cell ${isActive ? 'active' : ''}`}
                        onClick={() => {
                          setActiveCellId(cellId);
                        }}
                        onDoubleClick={() => {
                          setEditingCellId(cellId);
                          setInputValue(cell?.entValue ?? '');
                        }}
                      >
                        {isEditing ? (
                          <input
                            type="text"
                            className="cell-input-field"
                            autoFocus
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleSave(cellId);
                              }
                              if (e.key === 'Escape') {
                                setEditingCellId(null);
                              }
                            }}
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
    </div>
  );
}