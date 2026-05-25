import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface CellStyle {
  fontWeight?: 'normal' | 'bold';
  fontStyle?: 'normal' | 'italic';
  textDecoration?: 'none' | 'underline';
  backgroundColor?: string;
  color?: string;
  textAlign?: 'left' | 'center' | 'right';
  numberFormat?: 'general' | 'number' | 'percent' | 'currency' | 'date';
}

interface CellStylesState {
  [cellId: string]: CellStyle;
}

const initialState: CellStylesState = {};

const cellStylesSlice = createSlice({
  name: 'cellStyles',
  initialState,
  reducers: {
    setCellStyle: (state, action: PayloadAction<{ cellId: string; style: Partial<CellStyle> }>) => {
      const { cellId, style } = action.payload;
      if (!state[cellId]) state[cellId] = {};
      state[cellId] = { ...state[cellId], ...style };
    },
    setRangeStyle: (state, action: PayloadAction<{ cells: string[]; style: Partial<CellStyle> }>) => {
      const { cells, style } = action.payload;
      cells.forEach((cellId) => {
        if (!state[cellId]) state[cellId] = {};
        state[cellId] = { ...state[cellId], ...style };
      });
    },
    clearCellStyles: (state, action: PayloadAction<string[]>) => {
      action.payload.forEach((cellId) => {
        delete state[cellId];
      });
    },
  },
});

export const { setCellStyle, setRangeStyle, clearCellStyles } = cellStylesSlice.actions;
export default cellStylesSlice.reducer;
