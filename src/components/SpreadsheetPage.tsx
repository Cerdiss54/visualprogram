import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
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
import { setCellStyle, setRangeStyle, CellStyle } from '@/store/slices/cellStylesSlice';
import { CellCoords, SelectedRange, DocumentItem } from '@/types/spreadsheet';
import { useTableResize } from '@/functions/tableResize';
import { ContextMenuState } from '@/functions/tableEditor';
import { useVirtualizer } from '@tanstack/react-virtual';

const alphabet = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

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

const formatCellValue = (rawValue: string, style?: CellStyle): string => {
  if (!style || style.numberFormat === 'general') return rawValue;
  const num = parseFloat(rawValue);
  if (isNaN(num)) return rawValue;
  switch (style.numberFormat) {
    case 'number': return num.toLocaleString();
    case 'percent': return (num * 100).toFixed(2) + '%';
    case 'currency': return '$' + num.toLocaleString();
    case 'date': return new Date(num).toLocaleDateString();
    default: return rawValue;
  }
};

const SpreadsheetTable: React.FC = React.memo(() => {
  const dispatch = useAppDispatch();
  const matrixData = useAppSelector((s) => s.spreadsheet.matrixData);
  const activeCellId = useAppSelector((s) => s.spreadsheet.activeCellId);
  const selectedRange = useAppSelector((s) => s.spreadsheet.selectedRange);
  const lastClickedCell = useAppSelector((s) => s.spreadsheet.lastClickedCell);
  const cellStyles = useAppSelector((s) => s.cellStyles);
  const user = useAppSelector((s) => s.auth.user);
  const currentDoc = useAppSelector((s) =>
    s.documents.list.find((d) => d.id === s.documents.activeDocId && d.userId === user?.id)
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
  }, [activeCellId, editingCellId, matrixData]);

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
                    const cellStyle = cellStyles[cellId];
                    const displayValue = formatCellValue(cell?.dispValue ?? '', cellStyle);
                    return (
                      <td
                        key={cellId}
                        className={`grid-cell ${isActive ? 'active' : ''}`}
                        style={{
                        backgroundColor: isInRange && !isActive ? 'var(--bg-highlight)' : cellStyle?.backgroundColor,
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
                          <span
                            className="cell-view-text"
                            style={{
                              fontWeight: cellStyle?.fontWeight,
                              fontStyle: cellStyle?.fontStyle,
                              textDecoration: cellStyle?.textDecoration,
                            color: cellStyle?.color,
                              textAlign: cellStyle?.textAlign,
                              display: 'block',
                            }}
                          >
                            {displayValue}
                          </span>
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
            background: 'var(--bg-header)',
            border: '1px solid var(--border-color)',
            borderRadius: '4px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
            zIndex: 1000,
            minWidth: '200px',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {contextMenu.type === 'row' ? (
            <>
              <div style={{ padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid var(--border-color)' }} onClick={() => handleAddRow(contextMenu.index)}>Добавить строку</div>
              <div style={{ padding: '8px 12px', cursor: 'pointer', color: '#d32f2f' }} onClick={() => handleDeleteRow(contextMenu.index)}>Удалить строку {contextMenu.index + 1}</div>
            </>
          ) : (
            <>
              <div style={{ padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid var(--border-color)' }} onClick={() => handleAddColumn(contextMenu.index)}>Добавить столбец</div>
              <div style={{ padding: '8px 12px', cursor: 'pointer', color: '#d32f2f' }} onClick={() => handleDeleteColumn(contextMenu.index)}>Удалить столбец {String.fromCharCode(65 + contextMenu.index)}</div>
            </>
          )}
        </div>
      )}
    </>
  );
});

export default function SpreadsheetPage() {
  const { documentId } = useParams<{ documentId: string }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [stylesLoaded, setStylesLoaded] = useState(false);

  const allDocuments = useAppSelector((s) => s.documents.list);
  const user = useAppSelector((s) => s.auth.user);
  const activeDocId = useAppSelector((s) => s.documents.activeDocId);
  const activeCellId = useAppSelector((s) => s.spreadsheet.activeCellId);
  const matrixData = useAppSelector((s) => s.spreadsheet.matrixData);
  const selectedRange = useAppSelector((s) => s.spreadsheet.selectedRange);
  const cellStyles = useAppSelector((s) => s.cellStyles);
  const saveStatus = useAppSelector((s) => s.ui.saveStatus);
  const hasUnsavedChanges = useAppSelector((s) => s.ui.hasUnsavedChanges);
  const isLoading = useAppSelector((s) => s.ui.isLoading);

  const globalDoc = useMemo(() => allDocuments.find((d: DocumentItem) => d.id === documentId), [allDocuments, documentId]);
  const currentDoc = useMemo(() => globalDoc?.userId === user?.id ? globalDoc : undefined, [globalDoc, user?.id]);
  const rows = currentDoc?.rows ?? 0;
  const cols = currentDoc?.cols ?? 0;

  const activeCellStyle = activeCellId ? cellStyles[activeCellId] : {};
  const clipboardRef = useRef<{ cells: string[]; data: Record<string, string>; styles: Record<string, CellStyle>; sourceRows: number; sourceCols: number } | null>(null);

  const navigateWithConfirm = useCallback((to: string) => {
    if (hasUnsavedChanges) {
      if (window.confirm('У вас есть несохранённые изменения. Покинуть страницу?')) {
        navigate(to);
      }
    } else {
      navigate(to);
    }
  }, [hasUnsavedChanges, navigate]);

  const applyFormatting = useCallback((styleProps: Partial<CellStyle>) => {
    if (!activeCellId) return;
    if (selectedRange && (selectedRange.start.row !== selectedRange.end.row || selectedRange.start.col !== selectedRange.end.col)) {
      const cells: string[] = [];
      const minRow = Math.min(selectedRange.start.row, selectedRange.end.row);
      const maxRow = Math.max(selectedRange.start.row, selectedRange.end.row);
      const minCol = Math.min(selectedRange.start.col, selectedRange.end.col);
      const maxCol = Math.max(selectedRange.start.col, selectedRange.end.col);
      for (let r = minRow; r <= maxRow; r++) {
        for (let c = minCol; c <= maxCol; c++) {
          const cellId = `${alphabet[c]}${r + 1}`;
          cells.push(cellId);
        }
      }
      dispatch(setRangeStyle({ cells, style: styleProps }));
    } else if (activeCellId) {
      dispatch(setCellStyle({ cellId: activeCellId, style: styleProps }));
    }
  }, [activeCellId, selectedRange, dispatch]);

  const handleCopy = useCallback(() => {
    if (!selectedRange) return;
    const cells: string[] = [];
    const data: Record<string, string> = {};
    const styles: Record<string, CellStyle> = {};
    
    const minRow = Math.min(selectedRange.start.row, selectedRange.end.row);
    const maxRow = Math.max(selectedRange.start.row, selectedRange.end.row);
    const minCol = Math.min(selectedRange.start.col, selectedRange.end.col);
    const maxCol = Math.max(selectedRange.start.col, selectedRange.end.col);
    
    for (let r = minRow; r <= maxRow; r++) {
      for (let c = minCol; c <= maxCol; c++) {
        const cellId = `${alphabet[c]}${r + 1}`;
        cells.push(cellId);
        data[cellId] = matrixData[cellId]?.entValue || '';
        if (cellStyles[cellId]) styles[cellId] = cellStyles[cellId];
      }
    }
    
    const sourceRows = maxRow - minRow + 1;
    const sourceCols = maxCol - minCol + 1;
    clipboardRef.current = { cells, data, styles, sourceRows, sourceCols };
    const plainText = cells.map(cellId => data[cellId]).join('\t');
    navigator.clipboard?.writeText(plainText);
  }, [selectedRange, matrixData, cellStyles]);

  const handleCut = useCallback(() => {
    if (!selectedRange) return;
    handleCopy();
    const cellsToClear: string[] = [];
    const minRow = Math.min(selectedRange.start.row, selectedRange.end.row);
    const maxRow = Math.max(selectedRange.start.row, selectedRange.end.row);
    const minCol = Math.min(selectedRange.start.col, selectedRange.end.col);
    const maxCol = Math.max(selectedRange.start.col, selectedRange.end.col);
    for (let r = minRow; r <= maxRow; r++) {
      for (let c = minCol; c <= maxCol; c++) {
        const cellId = `${alphabet[c]}${r + 1}`;
        cellsToClear.push(cellId);
      }
    }
    cellsToClear.forEach(cellId => {
      dispatch(updateCellData({ cellId, entValue: '' }));
      dispatch(setCellStyle({ cellId, style: {} }));
    });
  }, [selectedRange, handleCopy, dispatch]);

  const handlePaste = useCallback(() => {
    if (!clipboardRef.current || !activeCellId) return;
    const { cells, data, styles, sourceRows, sourceCols } = clipboardRef.current;
    const activeCoords = cellIdToCoords(activeCellId);
    let idx = 0;
    for (let r = 0; r < sourceRows; r++) {
      for (let c = 0; c < sourceCols; c++) {
        const sourceCell = cells[idx];
        if (sourceCell) {
          const targetRow = activeCoords.row + r;
          const targetCol = activeCoords.col + c;
          if (targetRow < rows && targetCol < cols) {
            const targetCellId = `${alphabet[targetCol]}${targetRow + 1}`;
            dispatch(updateCellData({ cellId: targetCellId, entValue: data[sourceCell] || '' }));
            if (styles[sourceCell]) {
              dispatch(setCellStyle({ cellId: targetCellId, style: styles[sourceCell] }));
            }
          }
        }
        idx++;
      }
    }
  }, [activeCellId, rows, cols, dispatch]);

  const handleSelectAll = useCallback(() => {
    if (rows && cols) {
      dispatch(setSelectedRange({ start: { row: 0, col: 0 }, end: { row: rows - 1, col: cols - 1 } }));
    }
  }, [rows, cols, dispatch]);

  const handleClear = useCallback(() => {
    if (selectedRange) {
      const cellsToClear: string[] = [];
      const minRow = Math.min(selectedRange.start.row, selectedRange.end.row);
      const maxRow = Math.max(selectedRange.start.row, selectedRange.end.row);
      const minCol = Math.min(selectedRange.start.col, selectedRange.end.col);
      const maxCol = Math.max(selectedRange.start.col, selectedRange.end.col);
      for (let r = minRow; r <= maxRow; r++) {
        for (let c = minCol; c <= maxCol; c++) {
          cellsToClear.push(`${alphabet[c]}${r + 1}`);
        }
      }
      cellsToClear.forEach(cellId => dispatch(updateCellData({ cellId, entValue: '' })));
    } else if (activeCellId) {
      dispatch(updateCellData({ cellId: activeCellId, entValue: '' }));
    }
  }, [selectedRange, activeCellId, dispatch]);

  const handleTabNavigation = useCallback((shift: boolean) => {
    if (!activeCellId) return;
    const { row, col } = cellIdToCoords(activeCellId);
    let newRow = row, newCol = col;
    if (shift) {
      if (col > 0) newCol--;
      else if (row > 0) { newRow--; newCol = cols - 1; }
    } else {
      if (col < cols - 1) newCol++;
      else if (row < rows - 1) { newRow++; newCol = 0; }
    }
    const newCellId = `${alphabet[newCol]}${newRow + 1}`;
    dispatch(setActiveCell(newCellId));
    dispatch(setSelectedRange({ start: { row: newRow, col: newCol }, end: { row: newRow, col: newCol } }));
  }, [activeCellId, cols, rows, dispatch]);

  const handleArrowNavigation = useCallback((direction: 'up' | 'down' | 'left' | 'right', shift: boolean) => {
    if (!activeCellId) return;
    const { row, col } = cellIdToCoords(activeCellId);
    let newRow = row, newCol = col;
    if (direction === 'up' && row > 0) newRow--;
    if (direction === 'down' && row < rows - 1) newRow++;
    if (direction === 'left' && col > 0) newCol--;
    if (direction === 'right' && col < cols - 1) newCol++;
    const newCellId = `${alphabet[newCol]}${newRow + 1}`;
    dispatch(setActiveCell(newCellId));
    
    if (shift && selectedRange) {
      dispatch(setSelectedRange({ start: selectedRange.start, end: { row: newRow, col: newCol } }));
    } else {
      dispatch(setSelectedRange({ start: { row: newRow, col: newCol }, end: { row: newRow, col: newCol } }));
    }
  }, [activeCellId, cols, rows, dispatch, selectedRange]);

  const handleEnter = useCallback(() => {
    if (!activeCellId) return;
    const editingCell = document.querySelector('.cell-input-field');
    if (!editingCell) {
      const cell = matrixData[activeCellId];
      const targetCell = document.querySelector(`[data-cell-id="${activeCellId}"]`);
      if (targetCell) {
        const event = new MouseEvent('dblclick', { bubbles: true });
        targetCell.dispatchEvent(event);
      }
    }
  }, [activeCellId, matrixData]);

  useEffect(() => {
    if (activeDocId) {
      setStylesLoaded(false);
      const saved = localStorage.getItem(`styles_${activeDocId}`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          Object.entries(parsed).forEach(([cellId, style]) => {
            dispatch(setCellStyle({ cellId, style: style as CellStyle }));
          });
        } catch (e) {}
      }
      setStylesLoaded(true);
    }
  }, [activeDocId, dispatch]);

  useEffect(() => {
    if (activeDocId && stylesLoaded) {
      localStorage.setItem(`styles_${activeDocId}`, JSON.stringify(cellStyles));
    }
  }, [cellStyles, activeDocId, stylesLoaded]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'SELECT') {
        return;
      }
      if (e.ctrlKey && e.key.toLowerCase() === 'b') { e.preventDefault(); applyFormatting({ fontWeight: activeCellStyle?.fontWeight === 'bold' ? 'normal' : 'bold' }); }
      if (e.ctrlKey && e.key.toLowerCase() === 'i') { e.preventDefault(); applyFormatting({ fontStyle: activeCellStyle?.fontStyle === 'italic' ? 'normal' : 'italic' }); }
      if (e.ctrlKey && e.key.toLowerCase() === 'u') { e.preventDefault(); applyFormatting({ textDecoration: activeCellStyle?.textDecoration === 'underline' ? 'none' : 'underline' }); }
      if (e.ctrlKey && e.key.toLowerCase() === 's') { e.preventDefault(); if (activeDocId) dispatch(saveActiveDocument()); }
      if (e.ctrlKey && e.key.toLowerCase() === 'z' && !e.shiftKey) { e.preventDefault(); dispatch(undo()); }
      if (e.ctrlKey && (e.key.toLowerCase() === 'y' || (e.key.toLowerCase() === 'z' && e.shiftKey))) { e.preventDefault(); dispatch(redo()); }
      if (e.ctrlKey && e.key.toLowerCase() === 'c') { e.preventDefault(); handleCopy(); }
      if (e.ctrlKey && e.key.toLowerCase() === 'x') { e.preventDefault(); handleCut(); }
      if (e.ctrlKey && e.key.toLowerCase() === 'v') { e.preventDefault(); handlePaste(); }
      if (e.ctrlKey && e.key.toLowerCase() === 'a') { e.preventDefault(); handleSelectAll(); }
      if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); handleClear(); }
      if (e.key === 'Tab') { e.preventDefault(); handleTabNavigation(e.shiftKey); }
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleEnter(); }
      if (e.key === 'ArrowUp') { e.preventDefault(); handleArrowNavigation('up', e.shiftKey); }
      if (e.key === 'ArrowDown') { e.preventDefault(); handleArrowNavigation('down', e.shiftKey); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); handleArrowNavigation('left', e.shiftKey); }
      if (e.key === 'ArrowRight') { e.preventDefault(); handleArrowNavigation('right', e.shiftKey); }
      if (e.key === 'Escape') { 
        const input = document.querySelector('.cell-input-field');
        if (input) (input as HTMLElement).blur();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeDocId, activeCellStyle, dispatch, handleCopy, handleCut, handlePaste, handleSelectAll, handleClear, handleTabNavigation, handleEnter, applyFormatting, handleArrowNavigation]);

  useEffect(() => {
    if (!isLoading && documentId && globalDoc) {
      if (globalDoc.userId !== user?.id) {
        navigate('/dashboard', { replace: true });
      } else if (globalDoc.id !== activeDocId) {
        dispatch(switchDocument(globalDoc.id))
          .unwrap()
          .catch((err: unknown) => {
            if (String(err).includes('403')) navigate('/dashboard', { replace: true });
          });
      }
    }
  }, [documentId, activeDocId, isLoading, dispatch, globalDoc, navigate, user?.id]);

  useEffect(() => {
    if (!isLoading && documentId && !globalDoc) {
      const timer = setTimeout(() => navigate('/404', { replace: true }), 500);
      return () => clearTimeout(timer);
    }
  }, [documentId, globalDoc, isLoading, navigate]);

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

  // Автосохранение изменений в течение 500 мс (debounce)
  useEffect(() => {
    if (hasUnsavedChanges && activeDocId) {
      const timer = setTimeout(() => {
        dispatch(saveActiveDocument());
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [hasUnsavedChanges, activeDocId, dispatch]);

  const exportToCSV = () => {
    if (!currentDoc) return;
    const { rows, cols, matrixData, title } = currentDoc;
    const csvRows: string[] = [];
    for (let r = 0; r < rows; r++) {
      const rowData: string[] = [];
      for (let c = 0; c < cols; c++) {
        rowData.push(matrixData[`${alphabet[c]}${r + 1}`]?.entValue || '');
      }
      csvRows.push(rowData.join(','));
    }
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute('download', `${title}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToJSON = () => {
    if (!currentDoc) return;
    const { title, rows, cols, matrixData, createdAt, updatedAt } = currentDoc;
    const exportDoc = { title, rows, cols, matrixData, cellStyles, createdAt, updatedAt };
    const blob = new Blob([JSON.stringify(exportDoc, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute('download', `${title}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading || (documentId && !globalDoc)) {
    return <div style={{ padding: '20px' }}>Загрузка таблицы...</div>;
  }
  if (!currentDoc) return null;

  const Breadcrumbs = () => (
    <div style={{ fontSize: '14px', padding: '8px 16px', background: 'var(--bg-panel)', borderBottom: '1px solid var(--border-color)' }}>
      <span style={{ cursor: 'pointer', color: 'var(--link-color)' }} onClick={() => navigateWithConfirm('/dashboard')}>
        Мои документы
      </span>
      {' → '}
      <span style={{ fontWeight: 'bold' }}>{currentDoc.title}</span>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Breadcrumbs />
      
      <div className="formatting-toolbar" style={{ display: 'flex', gap: '8px', padding: '8px 16px', borderBottom: '1px solid var(--border-color)', alignItems: 'center', flexWrap: 'wrap', background: 'var(--bg-sidebar)' }}>
        <button onClick={() => applyFormatting({ fontWeight: activeCellStyle?.fontWeight === 'bold' ? 'normal' : 'bold' })} style={{ fontWeight: 'bold', padding: '4px 8px' }}>B</button>
        <button onClick={() => applyFormatting({ fontStyle: activeCellStyle?.fontStyle === 'italic' ? 'normal' : 'italic' })} style={{ fontStyle: 'italic', padding: '4px 8px' }}>I</button>
        <button onClick={() => applyFormatting({ textDecoration: activeCellStyle?.textDecoration === 'underline' ? 'none' : 'underline' })} style={{ textDecoration: 'underline', padding: '4px 8px' }}>U</button>
        
        <input type="color" value={activeCellStyle?.backgroundColor || '#ffffff'} onChange={(e) => applyFormatting({ backgroundColor: e.target.value })} title="Цвет фона" style={{ width: '30px', height: '30px' }} />
        <input type="color" value={activeCellStyle?.color || '#000000'} onChange={(e) => applyFormatting({ color: e.target.value })} title="Цвет текста" style={{ width: '30px', height: '30px' }} />
        
        <select value={activeCellStyle?.textAlign || 'left'} onChange={(e) => applyFormatting({ textAlign: e.target.value as CellStyle['textAlign'] })} style={{ padding: '4px' }}>
          <option value="left">Влево</option>
          <option value="center">Центр</option>
          <option value="right">Вправо</option>
        </select>
        
        <select value={activeCellStyle?.numberFormat || 'general'} onChange={(e) => applyFormatting({ numberFormat: e.target.value as CellStyle['numberFormat'] })} style={{ padding: '4px' }}>
          <option value="general">Общий</option>
          <option value="number">Число</option>
          <option value="percent">Процент</option>
          <option value="currency">Валюта</option>
          <option value="date">Дата</option>
        </select>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', padding: '8px 16px', gap: '12px', borderBottom: '1px solid var(--border-color)' }}>
        <button onClick={() => navigateWithConfirm('/dashboard')}>⬅ На главную</button>
        <span style={{ flex: 1, fontWeight: 'bold' }}>{currentDoc.title}</span>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={exportToCSV}>Экспорт CSV</button>
          <button onClick={exportToJSON}>Экспорт JSON</button>
        </div>
        <span style={{ fontSize: '14px', color: saveStatus === 'error' ? '#d32f2f' : 'var(--text-muted)' }}>
          {saveStatus === 'saving' && 'Сохранение...'}
          {saveStatus === 'saved' && 'Сохранено'}
          {saveStatus === 'error' && 'Ошибка сохранения'}
        </span>
      </div>

      <div style={{ display: 'flex', padding: '4px 16px', gap: '8px', borderBottom: '1px solid var(--border-color)' }}>
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