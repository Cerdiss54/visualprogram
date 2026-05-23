import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  isCreateModalOpen: boolean;
  saveStatus: 'saved' | 'saving' | 'error';
  notification: string | null;
}

const initialState: UIState = {
  isCreateModalOpen: false,
  saveStatus: 'saved',
  notification: null,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setCreateModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isCreateModalOpen = action.payload;
    },
    setSaveStatus: (state, action: PayloadAction<'saved' | 'saving' | 'error'>) => {
      state.saveStatus = action.payload;
    },
    showNotification: (state, action: PayloadAction<string | null>) => {
      state.notification = action.payload;
    },
  },
});

export const { setCreateModalOpen, setSaveStatus, showNotification } = uiSlice.actions;
export default uiSlice.reducer;