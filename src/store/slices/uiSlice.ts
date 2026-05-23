import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  screen: 'dashboard' | 'spreadsheet';
  isCreateModalOpen: boolean;
  saveStatus: 'saved' | 'saving' | 'error';
  notification: string | null;
  hasUnsavedChanges: boolean;
  isLoading: boolean;
}

const initialState: UIState = {
  screen: 'dashboard',
  isCreateModalOpen: false,
  saveStatus: 'saved',
  notification: null,
  hasUnsavedChanges: false,
  isLoading: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setScreen: (state, action: PayloadAction<'dashboard' | 'spreadsheet'>) => {
      state.screen = action.payload;
    },
    setCreateModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isCreateModalOpen = action.payload;
    },
    setSaveStatus: (state, action: PayloadAction<'saved' | 'saving' | 'error'>) => {
      state.saveStatus = action.payload;
      if (action.payload === 'saved') {
        state.hasUnsavedChanges = false;
      }
    },
    showNotification: (state, action: PayloadAction<string | null>) => {
      state.notification = action.payload;
    },
    setHasUnsavedChanges: (state, action: PayloadAction<boolean>) => {
      state.hasUnsavedChanges = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

export const {
  setScreen,
  setCreateModalOpen,
  setSaveStatus,
  showNotification,
  setHasUnsavedChanges,
  setLoading,
} = uiSlice.actions;

export default uiSlice.reducer;