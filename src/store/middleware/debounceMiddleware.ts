import { Middleware } from '@reduxjs/toolkit';
import {
  updateCellData,
  addRowThunk,
  deleteRowThunk,
  addColumnThunk,
  deleteColumnThunk,
} from '../slices/spreadsheetSlice';
import { saveActiveDocument } from '../slices/documentsSlice';
import { setSaveStatus, setHasUnsavedChanges } from '../slices/uiSlice';

let timer: ReturnType<typeof setTimeout> | null = null;

export const debounceMiddleware: Middleware = (store) => (next) => (action) => {
  const isDataChange =
    updateCellData.match(action) ||
    addRowThunk.fulfilled.match(action) ||
    deleteRowThunk.fulfilled.match(action) ||
    addColumnThunk.fulfilled.match(action) ||
    deleteColumnThunk.fulfilled.match(action);

  if (isDataChange) {
    const result = next(action);
    store.dispatch(setHasUnsavedChanges(true));
    store.dispatch(setSaveStatus('saving'));

    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      store.dispatch(saveActiveDocument() as any);
    }, 500);
    return result;
  }

  return next(action);
};
