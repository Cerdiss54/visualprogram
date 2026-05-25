import { describe, it, expect, vi } from 'vitest';
import documentsReducer, {
  deleteDocumentById,
  setActiveDocId,
  fetchDocuments,
  createNewDocument,
  renameDocument,
  switchDocument,
} from '@/store/slices/documentsSlice';

const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
vi.stubGlobal('localStorage', localStorageMock);

describe('documents slice', () => {
  const initialState = {
    list: [],
    activeDocId: null,
    status: 'idle' as const,
  };

  it('deleteDocumentById removes doc and clears activeDocId if matches', () => {
    const stateWithDoc = {
      ...initialState,
      list: [
        {
          id: '1',
          title: 'Doc1',
          rows: 10,
          cols: 10,
          createdAt: '',
          updatedAt: '',
          matrixData: {},
        },
      ],
      activeDocId: '1',
    };
    const newState = documentsReducer(stateWithDoc, deleteDocumentById('1'));
    expect(newState.list).toHaveLength(0);
    expect(newState.activeDocId).toBeNull();
  });

  it('setActiveDocId updates activeDocId', () => {
    const newState = documentsReducer(initialState, setActiveDocId('doc123'));
    expect(newState.activeDocId).toBe('doc123');
  });

  it('fetchDocuments.fulfilled sets list', () => {
    const action = { type: fetchDocuments.fulfilled.type, payload: [{ id: '1', title: 'Test' }] };
    const newState = documentsReducer(initialState, action);
    expect(newState.list).toHaveLength(1);
    expect(newState.status).toBe('idle');
  });

  it('createNewDocument.fulfilled adds doc to list', () => {
    const newDoc = {
      id: '2',
      title: 'New',
      rows: 5,
      cols: 5,
      createdAt: '',
      updatedAt: '',
      matrixData: {},
    };
    const action = { type: createNewDocument.fulfilled.type, payload: newDoc };
    const newState = documentsReducer(initialState, action);
    expect(newState.list).toContainEqual(newDoc);
  });

  it('renameDocument.fulfilled updates title', () => {
    const state = {
      ...initialState,
      list: [
        {
          id: '1',
          title: 'Old',
          rows: 1,
          cols: 1,
          createdAt: '',
          updatedAt: '',
          matrixData: {},
        },
      ],
    };
    const action = {
      type: renameDocument.fulfilled.type,
      payload: { id: '1', newTitle: 'New', updatedAt: '2025-01-01' },
    };
    const newState = documentsReducer(state, action);
    expect(newState.list[0].title).toBe('New');
  });

  it('switchDocument.fulfilled sets activeDocId', () => {
    const action = { type: switchDocument.fulfilled.type, payload: 'doc456' };
    const newState = documentsReducer(initialState, action);
    expect(newState.activeDocId).toBe('doc456');
  });
});
