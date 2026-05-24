import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

interface User {
  id: string;
  name: string;
  email: string;
}

interface StoredUser extends User {
  passwordHash: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  isAuthInitialized: boolean;
  registeredAt: string | null;
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  isAuthInitialized: false,
  registeredAt: null,
};

const getMockUsers = (): Record<string, StoredUser> => {
  return JSON.parse(localStorage.getItem('mockUsers') || '{}');
};

const saveMockUsers = (users: Record<string, StoredUser>) => {
  localStorage.setItem('mockUsers', JSON.stringify(users));
};

export const refreshAccessToken = createAsyncThunk(
  'auth/refresh',
  async (_, { rejectWithValue }) => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) return rejectWithValue('Нет токена обновления');
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const currentEmail = localStorage.getItem('currentUserEmail');
      const users = getMockUsers();
      const user = currentEmail && users[currentEmail] 
        ? { id: users[currentEmail].id, name: users[currentEmail].name, email: users[currentEmail].email }
        : { id: '1', name: 'Пользователь', email: 'user@example.com' };
      return { 
        accessToken: 'mock_new_access_token',
        user
      };
    } catch (error: unknown) {
      localStorage.removeItem('refreshToken');
      return rejectWithValue(error instanceof Error ? error.message : 'Ошибка');
    }
  }
);

export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      const { email, password } = credentials;
      const users = getMockUsers();
      const userRecord = users[email];
      
      if (!userRecord) {
        return rejectWithValue('Пользователь не найден');
      }
      
      if (userRecord.passwordHash !== password) {
        return rejectWithValue('Неверный пароль');
      }
      
      localStorage.setItem('refreshToken', 'mock_refresh_token');
      localStorage.setItem('currentUserEmail', email);
      
      const user = { id: userRecord.id, name: userRecord.name, email: userRecord.email };
      return { user, accessToken: 'mock_access_token' };
    } catch (error: unknown) {
      return rejectWithValue(error instanceof Error ? error.message : 'Ошибка входа');
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData: { name: string; email: string; password: string }, { rejectWithValue }) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const { name, email, password } = userData;
      const users = getMockUsers();
      
      if (users[email]) {
        return rejectWithValue('Пользователь с таким email уже существует');
      }
      
      const nextId = String(Object.keys(users).length + 1);
      const newUser: StoredUser = {
        id: nextId,
        name,
        email,
        passwordHash: password,
      };
      users[email] = newUser;
      saveMockUsers(users);
      
      return { id: newUser.id, name: newUser.name, email: newUser.email };
    } catch (error: unknown) {
      return rejectWithValue(error instanceof Error ? error.message : 'Ошибка регистрации');
    }
  }
);

export const updateUserName = createAsyncThunk(
  'auth/updateName',
  async (newName: string, { getState, rejectWithValue }) => {
    const state = getState() as { auth: AuthState };
    const currentUser = state.auth.user;
    if (!currentUser) return rejectWithValue('Не авторизован');
    
    const users = getMockUsers();
    if (users[currentUser.email]) {
      users[currentUser.email].name = newName;
      saveMockUsers(users);
    }
    return { ...currentUser, name: newName };
  }
);

export const updateUserPassword = createAsyncThunk(
  'auth/updatePassword',
  async ({ oldPassword, newPassword }: { oldPassword: string; newPassword: string }, { getState, rejectWithValue }) => {
    const state = getState() as { auth: AuthState };
    const currentUser = state.auth.user;
    if (!currentUser) return rejectWithValue('Не авторизован');
    
    const users = getMockUsers();
    const userRecord = users[currentUser.email];
    if (!userRecord) return rejectWithValue('Пользователь не найден');
    
    if (userRecord.passwordHash !== oldPassword) {
      return rejectWithValue('Неверный старый пароль');
    }
    
    userRecord.passwordHash = newPassword;
    saveMockUsers(users);
    return true;
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
        state.registeredAt = localStorage.getItem('userRegisteredAt') || null;
      })
      .addCase(refreshAccessToken.rejected, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.accessToken = null;
        state.user = null;
        state.isAuthInitialized = true;
      })
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.accessToken = action.payload.accessToken;
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.registeredAt = new Date().toISOString();
        localStorage.setItem('userRegisteredAt', state.registeredAt);
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(updateUserName.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      .addCase(updateUserPassword.fulfilled, (state) => {
      })
      .addCase(updateUserPassword.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;