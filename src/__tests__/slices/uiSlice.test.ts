import { describe, it, expect } from 'vitest';
import uiReducer, {
  setScreen,
  setSaveStatus,
  setHasUnsavedChanges,
  setLoading,
} from '@/store/slices/uiSlice';

describe('ui slice', () => {
  it('setScreen changes screen', () => {
    const state = uiReducer(undefined, setScreen('spreadsheet'));
    expect(state.screen).toBe('spreadsheet');
  });

  it('setSaveStatus changes status and resets unsaved flag on saved', () => {
    let state = uiReducer(undefined, setSaveStatus('saving'));
    expect(state.saveStatus).toBe('saving');
    state = uiReducer(state, setSaveStatus('saved'));
    expect(state.saveStatus).toBe('saved');
    expect(state.hasUnsavedChanges).toBe(false);
  });

  it('setHasUnsavedChanges works', () => {
    const state = uiReducer(undefined, setHasUnsavedChanges(true));
    expect(state.hasUnsavedChanges).toBe(true);
  });

  it('setLoading changes loading flag', () => {
    const state = uiReducer(undefined, setLoading(true));
    expect(state.isLoading).toBe(true);
  });
});