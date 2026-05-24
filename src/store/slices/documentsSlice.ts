import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { DocumentItem } from '@/types/spreadsheet';
import { createEmptyData } from '@/functions/tableRendering';
import { setMatrix } from './spreadsheetSlice';
import { setScreen, setSaveStatus, setLoading } from './uiSlice';

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

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export const fetchDocuments = createAsyncThunk('documents/fetchAll', async (_, { dispatch }) => {
  dispatch(setLoading(true));
  await new Promise((res) => setTimeout(res, 600));
  const saved = localStorage.getItem('spreadsheet_docs');
  dispatch(setLoading(false));
  return saved ? JSON.parse(saved) : [];
});

export const createNewDocument = createAsyncThunk(
  'documents/create',
  async (payload: { title: string; rows: number; cols: number; userId?: string }) => {
    const { title, rows, cols, userId } = payload;
    const newDoc: DocumentItem = {
      id: Date.now().toString(),
      title,
      userId,
      rows,
      cols,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      matrixData: createEmptyData(rows, cols, alphabet),
    };
    return newDoc;
  }
);

export const renameDocument = createAsyncThunk(
  'documents/rename',
  async ({ id, newTitle }: { id: string; newTitle: string }) => {
    return { id, newTitle, updatedAt: new Date().toISOString() };
  }
);

export const duplicateDocument = createAsyncThunk(
  'documents/duplicate',
  async (id: string, { getState }) => {
    const state = getState() as { documents: DocumentsState };
    const original = state.documents.list.find((d: DocumentItem) => d.id === id);
    if (!original) throw new Error('Document not found');
    const newDoc: DocumentItem = {
      id: Date.now().toString(),
      title: `Копия ${original.title}`,
      userId: original.userId,
      rows: original.rows,
      cols: original.cols,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      matrixData: JSON.parse(JSON.stringify(original.matrixData)),
    };
    return newDoc;
  }
);

export const importDocument = createAsyncThunk(
  'documents/import',
  async (doc: DocumentItem) => {
    return {
      ...doc,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }
);

export const saveActiveDocument = createAsyncThunk(
  'documents/saveActive',
  async (_, { getState, dispatch }) => {
    dispatch(setSaveStatus('saving'));
    await new Promise((res) => setTimeout(res, 500));
    const state = getState() as { documents: DocumentsState, spreadsheet: { matrixData: any } };
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
    dispatch(setSaveStatus('saved'));
    return updatedList;
  }
);

export const switchDocument = createAsyncThunk(
  'documents/switch',
  async (docId: string, { getState, dispatch }) => {
    const state = getState() as { documents: DocumentsState, auth: { user?: { id: string } } };
    const doc = state.documents.list.find((d: DocumentItem) => d.id === docId);
    if (!doc) throw new Error('Document not found');
    if (doc.userId && doc.userId !== state.auth.user?.id) {
      throw new Error('403');
    }
    dispatch(setMatrix(doc.matrixData));
    dispatch(setScreen('spreadsheet'));
    return docId;
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
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDocuments.pending, (state) => {
        state.status = 'loading';
      })
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
      })
      .addCase(renameDocument.fulfilled, (state, action) => {
        const { id, newTitle, updatedAt } = action.payload;
        const doc = state.list.find((d) => d.id === id);
        if (doc) {
          doc.title = newTitle;
          doc.updatedAt = updatedAt;
          localStorage.setItem('spreadsheet_docs', JSON.stringify(state.list));
        }
      })
      .addCase(duplicateDocument.fulfilled, (state, action) => {
        state.list.unshift(action.payload);
        localStorage.setItem('spreadsheet_docs', JSON.stringify(state.list));
      })
      .addCase(importDocument.fulfilled, (state, action) => {
        state.list.unshift(action.payload);
        localStorage.setItem('spreadsheet_docs', JSON.stringify(state.list));
      })
      .addCase(switchDocument.fulfilled, (state, action) => {
        state.activeDocId = action.payload;
      });
  },
});

export const { setActiveDocId, deleteDocumentById } = documentsSlice.actions;
export default documentsSlice.reducer;