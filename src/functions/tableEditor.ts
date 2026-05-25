import { SpreadsheetData } from '@/types/spreadsheet';
import { useState, useCallback } from 'react';

export interface ContextMenuState {
  visible: boolean;
  x: number;
  y: number;
  type: 'row' | 'column';
  index: number;
}

export const addRow = (
  data: SpreadsheetData,
  rowIndex: number,
  totalCols: number,
  alphabet: string[]
): SpreadsheetData => {
  const newData: SpreadsheetData = {};

  Object.entries(data).forEach(([cellId, cell]) => {
    const match = cellId.match(/^([A-Z]+)(\d+)$/);
    if (match) {
      const col = match[1];
      const row = parseInt(match[2], 10);

      if (row >= rowIndex) {
        const newId = `${col}${row + 1}`;
        newData[newId] = { ...cell, id: newId };
      } else {
        newData[cellId] = { ...cell };
      }
    }
  });

  for (let i = 0; i < totalCols; i++) {
    const newId = `${alphabet[i]}${rowIndex}`;
    if (!newData[newId]) {
      newData[newId] = { id: newId, entValue: '', dispValue: '' };
    }
  }

  return newData;
};

export const deleteRow = (data: SpreadsheetData, rowIndex: number, alphabet: string[]): SpreadsheetData => {
  const newData: SpreadsheetData = {};

  Object.entries(data).forEach(([cellId, cell]) => {
    const match = cellId.match(/^([A-Z]+)(\d+)$/);
    if (match) {
      const col = match[1];
      const row = parseInt(match[2], 10);

      if (row < rowIndex) {
        newData[cellId] = { ...cell };
      } else if (row > rowIndex) {
        const newId = `${col}${row - 1}`;
        newData[newId] = { ...cell, id: newId };
      }
    }
  });

  return newData;
};

export const addColumn = (
  data: SpreadsheetData,
  colIndex: number,
  totalRows: number,
  alphabet: string[]
): SpreadsheetData => {
  const newData: SpreadsheetData = {};

  Object.entries(data).forEach(([cellId, cell]) => {
    const match = cellId.match(/^([A-Z]+)(\d+)$/);
    if (match) {
      const col = match[1];
      const colIdx = alphabet.indexOf(col);
      const row = parseInt(match[2], 10);

      if (colIdx >= colIndex) {
        const newId = `${alphabet[colIdx + 1]}${row}`;
        newData[newId] = { ...cell, id: newId };
      } else {
        newData[cellId] = { ...cell };
      }
    }
  });

  for (let i = 1; i <= totalRows; i++) {
    const newId = `${alphabet[colIndex]}${i}`;
    if (!newData[newId]) {
      newData[newId] = { id: newId, entValue: '', dispValue: '' };
    }
  }

  return newData;
};

export const deleteColumn = (data: SpreadsheetData, colIndex: number, alphabet: string[]): SpreadsheetData => {
  const newData: SpreadsheetData = {};
  const deleteLetter = alphabet[colIndex];

  Object.entries(data).forEach(([cellId, cell]) => {
    const match = cellId.match(/^([A-Z]+)(\d+)$/);
    if (match) {
      const col = match[1];
      const colIdx = alphabet.indexOf(col);
      const row = parseInt(match[2], 10);

      if (col === deleteLetter) return;

      if (colIdx > colIndex) {
        const newId = `${alphabet[colIdx - 1]}${row}`;
        newData[newId] = { ...cell, id: newId };
      } else {
        newData[cellId] = { ...cell };
      }
    }
  });

  return newData;
};

export const useTableEditor = (
  matrixData: SpreadsheetData,
  setMatrixData: React.Dispatch<React.SetStateAction<SpreadsheetData>>,
  totalCols: number,
  totalRows: number,
  alphabet: string[]
) => {
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);

  const handleAddRow = useCallback(
    (rowIndex: number) => {
      const newData = addRow(matrixData, rowIndex + 1, totalCols, alphabet);
      setMatrixData(newData);
      setContextMenu(null);
    },
    [matrixData, setMatrixData, totalCols, alphabet]
  );

  const handleDeleteRow = useCallback(
    (rowIndex: number) => {
      const newData = deleteRow(matrixData, rowIndex + 1, alphabet);
      setMatrixData(newData);
      setContextMenu(null);
    },
    [matrixData, setMatrixData, alphabet]
  );

  const handleAddColumn = useCallback(
    (colIndex: number) => {
      const newData = addColumn(matrixData, colIndex, totalRows, alphabet);
      setMatrixData(newData);
      setContextMenu(null);
    },
    [matrixData, setMatrixData, totalRows, alphabet]
  );

  const handleDeleteColumn = useCallback(
    (colIndex: number) => {
      const newData = deleteColumn(matrixData, colIndex, alphabet);
      setMatrixData(newData);
      setContextMenu(null);
    },
    [matrixData, setMatrixData, alphabet]
  );

  const openContextMenu = useCallback((e: React.MouseEvent, type: 'row' | 'column', index: number) => {
    e.preventDefault();
    setContextMenu({ visible: true, x: e.clientX, y: e.clientY, type, index });
  }, []);

  const closeContextMenu = useCallback(() => setContextMenu(null), []);

  return {
    contextMenu,
    handleAddRow,
    handleDeleteRow,
    handleAddColumn,
    handleDeleteColumn,
    openContextMenu,
    closeContextMenu,
  };
};
