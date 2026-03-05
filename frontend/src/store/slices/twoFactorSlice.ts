import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { twoFactorApi } from '../../models/api/twoFactorApi';
import apiClient from '../../models/api/apiClient';
import { AuthResponse } from '../../models/types/user.types';

interface TwoFactorState {
  isEnabled: boolean;
  verifiedAt: string | null;
  isLoading: boolean;
  error: string | null;
  setup: {
    qrCodeDataUrl: string | null;
    manualEntryCode: string | null;
    isLoading: boolean;
    error: string | null;
  };
  pendingLogin: {
    tempToken: string | null;
    isLoading: boolean;
    error: string | null;
    recoverySent: boolean;
  };
}

const initialState: TwoFactorState = {
  isEnabled: false,
  verifiedAt: null,
  isLoading: false,
  error: null,
  setup: {
    qrCodeDataUrl: null,
    manualEntryCode: null,
    isLoading: false,
    error: null,
  },
  pendingLogin: {
    tempToken: null,
    isLoading: false,
    error: null,
    recoverySent: false,
  },
};

export const fetchTwoFactorStatus = createAsyncThunk(
  'twoFactor/fetchStatus',
  async () => {
    const response = await twoFactorApi.getStatus();
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch 2FA status');
    }
    return response.data;
  }
);

export const initiateTwoFactorSetup = createAsyncThunk(
  'twoFactor/initiateSetup',
  async () => {
    const response = await twoFactorApi.setup();
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to initiate 2FA setup');
    }
    return response.data;
  }
);

export const verifyAndEnableTwoFactor = createAsyncThunk(
  'twoFactor/verifyAndEnable',
  async (token: string) => {
    const response = await twoFactorApi.verify(token);
    if (!response.success) {
      throw new Error(response.message || 'Invalid verification code');
    }
    return true;
  }
);

export const disableTwoFactor = createAsyncThunk(
  'twoFactor/disable',
  async (password: string) => {
    const response = await twoFactorApi.disable(password);
    if (!response.success) {
      throw new Error(response.message || 'Failed to disable 2FA');
    }
    return true;
  }
);

export const validateTwoFactorLogin = createAsyncThunk(
  'twoFactor/validateLogin',
  async ({ tempToken, token }: { tempToken: string; token: string }) => {
    const response = await twoFactorApi.validateLogin(tempToken, token);
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Invalid or expired code');
    }
    // Set auth tokens immediately so auth state is ready
    const data = response.data as AuthResponse;
    apiClient.setAccessToken(data.token);
    localStorage.setItem('refresh_token', data.refreshToken);
    return data;
  }
);

export const sendTwoFactorRecoveryCode = createAsyncThunk(
  'twoFactor/sendRecoveryCode',
  async (tempToken: string) => {
    const response = await twoFactorApi.sendRecoveryCode(tempToken);
    if (!response.success) {
      throw new Error(response.message || 'Failed to send recovery code');
    }
    return true;
  }
);

export const verifyTwoFactorRecoveryCode = createAsyncThunk(
  'twoFactor/verifyRecoveryCode',
  async ({ tempToken, code }: { tempToken: string; code: string }) => {
    const response = await twoFactorApi.verifyRecoveryCode(tempToken, code);
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Invalid or expired recovery code');
    }
    const data = response.data as AuthResponse;
    apiClient.setAccessToken(data.token);
    localStorage.setItem('refresh_token', data.refreshToken);
    return data;
  }
);

const twoFactorSlice = createSlice({
  name: 'twoFactor',
  initialState,
  reducers: {
    setTwoFactorPending: (state, action: PayloadAction<string>) => {
      state.pendingLogin.tempToken = action.payload;
      state.pendingLogin.error = null;
      state.pendingLogin.recoverySent = false;
    },
    clearTwoFactorPending: (state) => {
      state.pendingLogin = initialState.pendingLogin;
    },
    clearSetup: (state) => {
      state.setup = initialState.setup;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch status
      .addCase(fetchTwoFactorStatus.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchTwoFactorStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isEnabled = action.payload.twoFactorEnabled;
        state.verifiedAt = action.payload.verifiedAt;
      })
      .addCase(fetchTwoFactorStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || null;
      })
      // Setup
      .addCase(initiateTwoFactorSetup.pending, (state) => {
        state.setup.isLoading = true;
        state.setup.error = null;
      })
      .addCase(initiateTwoFactorSetup.fulfilled, (state, action) => {
        state.setup.isLoading = false;
        state.setup.qrCodeDataUrl = action.payload.qrCodeDataUrl;
        state.setup.manualEntryCode = action.payload.manualEntryCode;
      })
      .addCase(initiateTwoFactorSetup.rejected, (state, action) => {
        state.setup.isLoading = false;
        state.setup.error = action.error.message || null;
      })
      // Verify and enable
      .addCase(verifyAndEnableTwoFactor.pending, (state) => {
        state.setup.isLoading = true;
        state.setup.error = null;
      })
      .addCase(verifyAndEnableTwoFactor.fulfilled, (state) => {
        state.setup.isLoading = false;
        state.isEnabled = true;
        state.verifiedAt = new Date().toISOString();
      })
      .addCase(verifyAndEnableTwoFactor.rejected, (state, action) => {
        state.setup.isLoading = false;
        state.setup.error = action.error.message || null;
      })
      // Disable
      .addCase(disableTwoFactor.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(disableTwoFactor.fulfilled, (state) => {
        state.isLoading = false;
        state.isEnabled = false;
        state.verifiedAt = null;
      })
      .addCase(disableTwoFactor.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || null;
      })
      // Validate login
      .addCase(validateTwoFactorLogin.pending, (state) => {
        state.pendingLogin.isLoading = true;
        state.pendingLogin.error = null;
      })
      .addCase(validateTwoFactorLogin.fulfilled, (state) => {
        state.pendingLogin.isLoading = false;
        state.pendingLogin.tempToken = null;
      })
      .addCase(validateTwoFactorLogin.rejected, (state, action) => {
        state.pendingLogin.isLoading = false;
        state.pendingLogin.error = action.error.message || null;
      })
      // Send recovery code
      .addCase(sendTwoFactorRecoveryCode.pending, (state) => {
        state.pendingLogin.isLoading = true;
        state.pendingLogin.error = null;
      })
      .addCase(sendTwoFactorRecoveryCode.fulfilled, (state) => {
        state.pendingLogin.isLoading = false;
        state.pendingLogin.recoverySent = true;
      })
      .addCase(sendTwoFactorRecoveryCode.rejected, (state, action) => {
        state.pendingLogin.isLoading = false;
        state.pendingLogin.error = action.error.message || null;
      })
      // Verify recovery code
      .addCase(verifyTwoFactorRecoveryCode.pending, (state) => {
        state.pendingLogin.isLoading = true;
        state.pendingLogin.error = null;
      })
      .addCase(verifyTwoFactorRecoveryCode.fulfilled, (state) => {
        state.pendingLogin.isLoading = false;
        state.pendingLogin.tempToken = null;
      })
      .addCase(verifyTwoFactorRecoveryCode.rejected, (state, action) => {
        state.pendingLogin.isLoading = false;
        state.pendingLogin.error = action.error.message || null;
      });
  },
});

export const { setTwoFactorPending, clearTwoFactorPending, clearSetup } = twoFactorSlice.actions;
export default twoFactorSlice.reducer;
