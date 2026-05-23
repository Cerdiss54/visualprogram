import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SpreadsheetData, SelectedRange } from '@/types/spreadsheet';
import { recalculateTable } from '@/functions/formulaParser';

interface SpreadsheetState {
  matrixData: SpreadsheetData;
  activeCellId: string | null;
  selectedRange: SelectedRange | null;
  past: SpreadsheetData[];
  future: SpreadsheetData[];
}

const initialState: SpreadsheetState = {
  matrixData: {},
  activeCellId: null,
  selectedRange: null,
  past: [],
  future: [],
};

const spreadsheetSlice = createSlice({
  name: 'spreadsheet',
  initialState,
  reducers: {
    setMatrix: (state, action: PayloadAction<SpreadsheetData>) => {
      state.matrixData = action.payload;
      state.past = [];
      state.future = [];
    },
    setActiveCell: (state, action: PayloadAction<string | null>) => {
      state.activeCellId = action.payload;
    },
    setSelectedRange: (state, action: PayloadAction<SelectedRange | null>) => {
      state.selectedRange = action.payload;
    },
    
    updateCellData: (state, action: PayloadAction<{ cellId: string; entValue: string }>) => {
      const { cellId, entValue } = action.payload;
      
      state.past.push({ ...state.matrixData });
      state.future = []; 
      
      if (state.past.length > 30) state.past.shift(); 

      state.matrixData[cellId] = {
        id: cellId,
        entValue,
        dispValue: state.matrixData[cellId]?.dispValue || '',
      };
      
      state.matrixData = recalculateTable(state.matrixData);
    },

    undo: (state) => {
      if (state.past.length === 0) return;
      const previous = state.past.pop()!;
      state.future.push({ ...state.matrixData });
      state.matrixData = previous;
    },

    redo: (state) => {
      if (state.future.length === 0) return;
      const next = state.future.pop()!;
      state.past.push({ ...state.matrixData });
      state.matrixData = next;
    }
  },
});

export const { setMatrix, setActiveCell, setSelectedRange, updateCellData, undo, redo } = spreadsheetSlice.actions;
export default spreadsheetSlice.reducer;