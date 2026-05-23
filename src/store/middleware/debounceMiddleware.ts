import { Middleware } from '@reduxjs/toolkit';
import { updateCellData } from '../slices/spreadsheetSlice';
import { saveActiveDocument } from '../slices/documentsSlice';
import { setSaveStatus } from '../slices/uiSlice';

let timer: NodeJS.Timeout | null = null;

export const debounceMiddleware: Middleware = (store) => (next) => (action) => {
  if (updateCellData.match(action)) {
    const result = next(action);

    store.dispatch(setSaveStatus('saving'));

    if (timer) clearTimeout(timer);

    timer = setTimeout(() => {
      store.dispatch(saveActiveDocument() as any);
    }, 500);

    return result;
  }

  return next(action);
};