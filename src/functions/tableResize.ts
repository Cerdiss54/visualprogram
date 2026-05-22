import { useState, useCallback, useEffect } from 'react';

export interface ResizeState {
  isResizing: boolean;
  type: 'column' | 'row' | null;
  index: number;
  startX: number;
  startY: number;
  startWidth: number;
  startHeight: number;
}

const DEFAULT_COLUMN_WIDTH = 100;
const DEFAULT_ROW_HEIGHT = 30;

export const useTableResize = (totalCols: number, totalRows: number) => {
  const [columnWidths, setColumnWidths] = useState<number[]>(
    Array(totalCols).fill(DEFAULT_COLUMN_WIDTH)
  );
  const [rowHeights, setRowHeights] = useState<number[]>(
    Array(totalRows).fill(DEFAULT_ROW_HEIGHT)
  );
  const [resizeState, setResizeState] = useState<ResizeState>({
    isResizing: false,
    type: null,
    index: -1,
    startX: 0,
    startY: 0,
    startWidth: 0,
    startHeight: 0,
  });

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!resizeState.isResizing) return;

    if (resizeState.type === 'column') {
      const deltaX = e.clientX - resizeState.startX;
      const newWidth = Math.max(50, resizeState.startWidth + deltaX);
      setColumnWidths((prev) => {
        const updated = [...prev];
        updated[resizeState.index] = newWidth;
        return updated;
      });
    } else if (resizeState.type === 'row') {
      const deltaY = e.clientY - resizeState.startY;
      const newHeight = Math.max(20, resizeState.startHeight + deltaY);
      setRowHeights((prev) => {
        const updated = [...prev];
        updated[resizeState.index] = newHeight;
        return updated;
      });
    }
  }, [resizeState]);

  const handleMouseUp = useCallback(() => {
    setResizeState({
      isResizing: false,
      type: null,
      index: -1,
      startX: 0,
      startY: 0,
      startWidth: 0,
      startHeight: 0,
    });
  }, []);

  useEffect(() => {
    if (resizeState.isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [resizeState.isResizing, handleMouseMove, handleMouseUp]);

  const startResizeColumn = useCallback((colIndex: number, clientX: number, currentWidth: number) => {
    setResizeState({
      isResizing: true,
      type: 'column',
      index: colIndex,
      startX: clientX,
      startY: 0,
      startWidth: currentWidth,
      startHeight: 0,
    });
  }, []);

  const startResizeRow = useCallback((rowIndex: number, clientY: number, currentHeight: number) => {
    setResizeState({
      isResizing: true,
      type: 'row',
      index: rowIndex,
      startX: 0,
      startY: clientY,
      startWidth: 0,
      startHeight: currentHeight,
    });
  }, []);

  return {
    columnWidths,
    rowHeights,
    startResizeColumn,
    startResizeRow,
    isResizing: resizeState.isResizing,
  };
};