import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { SpreadsheetData, SelectedRange } from '@/types/spreadsheet';
import { recalculateTable } from '@/functions/formulaParser';
import { addRow, deleteRow, addColumn, deleteColumn } from '@/functions/tableEditor';

interface SpreadsheetState {
  matrixData: SpreadsheetData;
  activeCellId: string | null;
  selectedRange: SelectedRange | null;
  lastClickedCell: string | null;
  past: SpreadsheetData[];
  future: SpreadsheetData[];
}

const initialState: SpreadsheetState = {
  matrixData: {},
  activeCellId: null,
  selectedRange: null,
  lastClickedCell: null,
  past: [],
  future: [],
};

const pushToHistory = (state: SpreadsheetState) => {
  state.past.push({ ...state.matrixData });
  if (state.past.length > 30) state.past.shift();
  state.future = [];
};

export const addRowThunk = createAsyncThunk(
  'spreadsheet/addRow',
  async ({ rowIndex, totalCols, alphabet }: { rowIndex: number; totalCols: number; alphabet: string[] }, { getState }) => {
    const state = getState() as any;
    const currentData = state.spreadsheet.matrixData;
    return addRow(currentData, rowIndex, totalCols, alphabet);
  }
);

export const deleteRowThunk = createAsyncThunk(
  'spreadsheet/deleteRow',
  async ({ rowIndex, alphabet }: { rowIndex: number; alphabet: string[] }, { getState }) => {
    const state = getState() as any;
    const currentData = state.spreadsheet.matrixData;
    return deleteRow(currentData, rowIndex, alphabet);
  }
);

export const addColumnThunk = createAsyncThunk(
  'spreadsheet/addColumn',
  async ({ colIndex, totalRows, alphabet }: { colIndex: number; totalRows: number; alphabet: string[] }, { getState }) => {
    const state = getState() as any;
    const currentData = state.spreadsheet.matrixData;
    return addColumn(currentData, colIndex, totalRows, alphabet);
  }
);

export const deleteColumnThunk = createAsyncThunk(
  'spreadsheet/deleteColumn',
  async ({ colIndex, alphabet }: { colIndex: number; alphabet: string[] }, { getState }) => {
    const state = getState() as any;
    const currentData = state.spreadsheet.matrixData;
    return deleteColumn(currentData, colIndex, alphabet);
  }
);

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
    setLastClickedCell: (state, action: PayloadAction<string | null>) => {
      state.lastClickedCell = action.payload;
    },
    updateCellData: (state, action: PayloadAction<{ cellId: string; entValue: string }>) => {
      const { cellId, entValue } = action.payload;
      pushToHistory(state);
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
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(addRowThunk.fulfilled, (state, action) => {
        pushToHistory(state);
        state.matrixData = action.payload;
      })
      .addCase(deleteRowThunk.fulfilled, (state, action) => {
        pushToHistory(state);
        state.matrixData = action.payload;
      })
      .addCase(addColumnThunk.fulfilled, (state, action) => {
        pushToHistory(state);
        state.matrixData = action.payload;
      })
      .addCase(deleteColumnThunk.fulfilled, (state, action) => {
        pushToHistory(state);
        state.matrixData = action.payload;
      });
  },
});

export const { setMatrix, setActiveCell, setSelectedRange, setLastClickedCell, updateCellData, undo, redo } = spreadsheetSlice.actions;
export default spreadsheetSlice.reducer;