import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authApi } from '../../models/api/authApi';
import apiClient from '../../models/api/apiClient';
import { User, LoginData, RegisterData } from '../../models/types/user.types';
import { validateTwoFactorLogin, verifyTwoFactorRecoveryCode } from './twoFactorSlice';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  registrationSuccess: boolean;
  registrationEmail: string | null;
}

// Migration: clean up old auth_token if present
if (localStorage.getItem('auth_token')) {
  localStorage.removeItem('auth_token');
}

// If a refresh token exists, we need to rehydrate — start in loading state
const hasRefreshToken = !!localStorage.getItem('refresh_token');

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: hasRefreshToken,
  error: null,
  registrationSuccess: false,
  registrationEmail: null,
};

/**
 * Rehydrate session on page load using the stored refresh token.
 * Calls /auth/refresh to get new access token + user data.
 */
export const rehydrateSession = createAsyncThunk(
  'auth/rehydrateSession',
  async (_, { rejectWithValue }) => {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      return rejectWithValue({ message: 'No refresh token' });
    }

    const response = await authApi.refreshToken(refreshToken);
    if (!response.success || !response.data) {
      localStorage.removeItem('refresh_token');
      return rejectWithValue({ message: response.message || 'Session expired' });
    }

    return response.data;
  }
);

export const login = createAsyncThunk(
  'auth/login',
  async (data: LoginData) => {
    const response = await authApi.login(data);
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Login failed');
    }
    return response.data;
  }
);

// Type guard for 2FA response
export function isRequiresTwoFactor(data: any): data is { requiresTwoFactor: true; tempToken: string } {
  return data && data.requiresTwoFactor === true && typeof data.tempToken === 'string';
}

export const register = createAsyncThunk(
  'auth/register',
  async (data: RegisterData) => {
    const response = await authApi.register(data);
    if (!response.success) {
      throw new Error(response.message || 'Registration failed');
    }
    return { email: data.email, message: response.message };
  }
);

export const verifyEmail = createAsyncThunk(
  'auth/verifyEmail',
  async (token: string) => {
    const response = await authApi.verifyEmail(token);
    if (!response.success) {
      throw new Error(response.message || 'Verification failed');
    }
    return response.message;
  }
);

export const resendVerification = createAsyncThunk(
  'auth/resendVerification',
  async (email: string) => {
    const response = await authApi.resendVerification(email);
    if (!response.success) {
      throw new Error(response.message || 'Failed to resend verification');
    }
    return response.message;
  }
);

export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (email: string) => {
    const response = await authApi.forgotPassword(email);
    if (!response.success) {
      throw new Error(response.message || 'Failed to send reset email');
    }
    return response.message;
  }
);

export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async ({ token, newPassword }: { token: string; newPassword: string }) => {
    const response = await authApi.resetPassword(token, newPassword);
    if (!response.success) {
      throw new Error(response.message || 'Failed to reset password');
    }
    return response.message;
  }
);

export const fetchProfile = createAsyncThunk(
  'auth/fetchProfile',
  async (_, { rejectWithValue }) => {
    const response = await authApi.getProfile();
    if (!response.success || !response.data) {
      const message = response.message || 'Failed to fetch profile';
      const isUnauthorized = message.toLowerCase().includes('unauthorized') ||
                             message.toLowerCase().includes('invalid') ||
                             message.toLowerCase().includes('expired');
      return rejectWithValue({ message, isUnauthorized });
    }
    return response.data;
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      apiClient.setAccessToken(null);
      localStorage.removeItem('refresh_token');
      localStorage.setItem('logout_timestamp', Date.now().toString());
    },
    clearRegistrationState: (state) => {
      state.registrationSuccess = false;
      state.registrationEmail = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Rehydrate session (page load)
      .addCase(rehydrateSession.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(rehydrateSession.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        apiClient.setAccessToken(action.payload.token);
        localStorage.setItem('refresh_token', action.payload.refreshToken);
      })
      .addCase(rehydrateSession.rejected, (state) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
        apiClient.setAccessToken(null);
        localStorage.removeItem('refresh_token');
      })
      // Login
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        // If 2FA is required, don't set auth state
        if ('requiresTwoFactor' in action.payload) {
          return;
        }
        state.user = action.payload.user;
        state.isAuthenticated = true;
        apiClient.setAccessToken(action.payload.token);
        localStorage.setItem('refresh_token', action.payload.refreshToken);
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Login failed';
      })
      // Register
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.registrationSuccess = false;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.registrationSuccess = true;
        state.registrationEmail = action.payload.email;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Registration failed';
      })
      // Fetch profile
      .addCase(fetchProfile.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.isLoading = false;
        const payload = action.payload as { message: string; isUnauthorized: boolean } | undefined;
        if (payload?.isUnauthorized) {
          state.user = null;
          state.isAuthenticated = false;
          apiClient.setAccessToken(null);
          localStorage.removeItem('refresh_token');
        }
      })
      // 2FA login success — set auth state
      .addCase(validateTwoFactorLogin.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.isAuthenticated = true;
      })
      .addCase(verifyTwoFactorRecoveryCode.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.isAuthenticated = true;
      });
  },
});

export const { logout, clearRegistrationState } = authSlice.actions;
export default authSlice.reducer;
