import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { DocumentItem } from '@/types/spreadsheet';
import { createEmptyData } from '@/functions/tableRendering';
import { setMatrix } from './spreadsheetSlice';
import { setSaveStatus } from './uiSlice';

interface DocumentsState {
  list: DocumentItem[];
  activeDocId: string | null;
  status: 'idle' | 'loading' | 'failed';
}

const initialState: DocumentsState = {
  list: [],
  activeDocId: null,
  status: 'idle',
};

export const fetchDocuments = createAsyncThunk('documents/fetchAll', async () => {
  await new Promise((res) => setTimeout(res, 600)); 
  const saved = localStorage.getItem('spreadsheet_docs');
  return saved ? JSON.parse(saved) : [];
});

export const createNewDocument = createAsyncThunk(
  'documents/create',
  async (payload: { title: string; rows: number; cols: number }) => {
    const { title, rows, cols } = payload;
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    
    const newDoc: DocumentItem = {
      id: crypto.randomUUID(),
      title,
      rows,
      cols,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      matrixData: createEmptyData(rows, cols, alphabet),
    };
    return newDoc;
  }
);

export const saveActiveDocument = createAsyncThunk(
  'documents/saveActive',
  async (_, { getState, dispatch }) => {
    dispatch(setSaveStatus('saving'));
    await new Promise((res) => setTimeout(res, 500)); 
    
    const state = getState() as any;
    const activeDocId = state.documents.activeDocId;
    const currentMatrix = state.spreadsheet.matrixData;
    const docList = state.documents.list;

    if (!activeDocId) throw new Error('No active document');

    const updatedList = docList.map((doc: DocumentItem) =>
      doc.id === activeDocId
        ? { ...doc, updatedAt: new Date().toISOString(), matrixData: currentMatrix }
        : doc
    );

    localStorage.setItem('spreadsheet_docs', JSON.stringify(updatedList));
    return updatedList;
  }
);

const documentsSlice = createSlice({
  name: 'documents',
  initialState,
  reducers: {
    setActiveDocId: (state, action: PayloadAction<string | null>) => {
      state.activeDocId = action.payload;
    },
    deleteDocumentById: (state, action: PayloadAction<string>) => {
      state.list = state.list.filter((d) => d.id !== action.payload);
      if (state.activeDocId === action.payload) state.activeDocId = null;
      localStorage.setItem('spreadsheet_docs', JSON.stringify(state.list));
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDocuments.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchDocuments.fulfilled, (state, action) => {
        state.status = 'idle';
        state.list = action.payload;
      })
      .addCase(createNewDocument.fulfilled, (state, action) => {
        state.list.unshift(action.payload);
        localStorage.setItem('spreadsheet_docs', JSON.stringify(state.list));
      })
      .addCase(saveActiveDocument.fulfilled, (state, action) => {
        state.list = action.payload;
      });
  },
});

export const { setActiveDocId, deleteDocumentById } = documentsSlice.actions;
export default documentsSlice.reducer;