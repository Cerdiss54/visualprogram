import { createSlice } from '@reduxjs/toolkit';

interface AuthState {
  user: { id: string; name: string; email: string } | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: { id: 'user-777', name: 'Даниил Шильников', email: 'daniil@example.com' },
  isAuthenticated: true,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
    },
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;