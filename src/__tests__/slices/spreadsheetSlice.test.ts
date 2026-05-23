import { describe, it, expect } from 'vitest';
import spreadsheetReducer, {
  updateCellData,
  undo,
  redo,
  setActiveCell,
  setSelectedRange,
  setLastClickedCell,
} from '@/store/slices/spreadsheetSlice';

describe('spreadsheet slice', () => {
  const initialState = {
    matrixData: {},
    activeCellId: null,
    selectedRange: null,
    lastClickedCell: null,
    past: [],
    future: [],
  };

  it('updateCellData should update cell and add to history', () => {
    const action = updateCellData({ cellId: 'A1', entValue: 'Hello' });
    const newState = spreadsheetReducer(initialState, action);
    expect(newState.matrixData['A1']).toEqual({
      id: 'A1',
      entValue: 'Hello',
      dispValue: 'Hello',
    });
    expect(newState.past.length).toBe(1);
  });

  it('undo should revert last change', () => {
    let state = spreadsheetReducer(initialState, updateCellData({ cellId: 'A1', entValue: 'First' }));
    state = spreadsheetReducer(state, updateCellData({ cellId: 'A1', entValue: 'Second' }));
    expect(state.matrixData['A1'].entValue).toBe('Second');
    state = spreadsheetReducer(state, undo());
    expect(state.matrixData['A1'].entValue).toBe('First');
    expect(state.future.length).toBe(1);
  });

  it('redo should restore undone change', () => {
    let state = spreadsheetReducer(initialState, updateCellData({ cellId: 'A1', entValue: 'First' }));
    state = spreadsheetReducer(state, updateCellData({ cellId: 'A1', entValue: 'Second' }));
    state = spreadsheetReducer(state, undo());
    expect(state.matrixData['A1'].entValue).toBe('First');
    state = spreadsheetReducer(state, redo());
    expect(state.matrixData['A1'].entValue).toBe('Second');
  });

  it('setActiveCell changes activeCellId', () => {
    const state = spreadsheetReducer(initialState, setActiveCell('B3'));
    expect(state.activeCellId).toBe('B3');
  });

  it('setSelectedRange changes selectedRange', () => {
    const range = { start: { row: 0, col: 0 }, end: { row: 2, col: 2 } };
    const state = spreadsheetReducer(initialState, setSelectedRange(range));
    expect(state.selectedRange).toEqual(range);
  });

  it('setLastClickedCell changes lastClickedCell', () => {
    const state = spreadsheetReducer(initialState, setLastClickedCell('C5'));
    expect(state.lastClickedCell).toBe('C5');
  });
});