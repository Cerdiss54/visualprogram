import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  isAuthInitialized: boolean;
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  isAuthInitialized: false,
};

export const refreshAccessToken = createAsyncThunk(
  'auth/refresh',
  async (_, { rejectWithValue }) => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) return rejectWithValue('Нет токена обновления');
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const currentEmail = localStorage.getItem('currentUserEmail');
      const users = JSON.parse(localStorage.getItem('mockUsers') || '{}');
      const user = currentEmail && users[currentEmail] 
        ? users[currentEmail] 
        : { id: '1', name: 'Пользователь', email: 'user@example.com' };
      return { 
        accessToken: 'mock_new_access_token',
        user: user as User
      };
    } catch (error: unknown) {
      localStorage.removeItem('refreshToken');
      return rejectWithValue(error instanceof Error ? error.message : 'Ошибка');
    }
  }
);

export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: Record<string, string>, { rejectWithValue }) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      if (credentials.email && credentials.password.length >= 8) {
        const users = JSON.parse(localStorage.getItem('mockUsers') || '{}');
        let user = users[credentials.email];
        if (!user) {
          const nextId = String(Object.keys(users).length + 1);
          user = { id: nextId, name: credentials.email.split('@')[0], email: credentials.email };
          users[credentials.email] = user;
          localStorage.setItem('mockUsers', JSON.stringify(users));
        }
        localStorage.setItem('refreshToken', 'mock_refresh_token');
        localStorage.setItem('currentUserEmail', user.email);
        return { 
          user: user as User,
          accessToken: 'mock_access_token' 
        };
      }
      throw new Error('Неверный email или пароль');
    } catch (error: unknown) {
      return rejectWithValue(error instanceof Error ? error.message : 'Ошибка');
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData: Record<string, string>, { rejectWithValue }) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const users = JSON.parse(localStorage.getItem('mockUsers') || '{}');
      const nextId = String(Object.keys(users).length + 1);
      const newUser = { id: nextId, name: userData.name, email: userData.email };
      users[userData.email] = newUser;
      localStorage.setItem('mockUsers', JSON.stringify(users));
      return newUser as User;
    } catch (error: unknown) {
      return rejectWithValue(error instanceof Error ? error.message : 'Ошибка');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('currentUserEmail');
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(refreshAccessToken.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(refreshAccessToken.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.accessToken = action.payload.accessToken;
        state.user = action.payload.user;
        state.isAuthInitialized = true;
      })
      .addCase(refreshAccessToken.rejected, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.accessToken = null;
        state.user = null;
        state.isAuthInitialized = true;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.accessToken = action.payload.accessToken;
        state.user = action.payload.user;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;