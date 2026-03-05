import apiClient from './apiClient';
import { AuthResponse } from '../types/user.types';

export interface TwoFactorStatusResponse {
  twoFactorEnabled: boolean;
  verifiedAt: string | null;
}

export interface TwoFactorSetupResponse {
  qrCodeDataUrl: string;
  manualEntryCode: string;
}

export const twoFactorApi = {
  getStatus: async () => {
    return apiClient.get<TwoFactorStatusResponse>('/auth/2fa/status');
  },

  setup: async () => {
    return apiClient.post<TwoFactorSetupResponse>('/auth/2fa/setup');
  },

  verify: async (token: string) => {
    return apiClient.post<{ message: string }>('/auth/2fa/verify', { token });
  },

  disable: async (password: string) => {
    return apiClient.post<{ message: string }>('/auth/2fa/disable', { password });
  },

  validateLogin: async (tempToken: string, token: string) => {
    return apiClient.post<AuthResponse>('/auth/2fa/validate', { tempToken, token });
  },

  sendRecoveryCode: async (tempToken: string) => {
    return apiClient.post<{ message: string }>('/auth/2fa/recovery/send', { tempToken });
  },

  verifyRecoveryCode: async (tempToken: string, code: string) => {
    return apiClient.post<AuthResponse>('/auth/2fa/recovery/verify', { tempToken, code });
  },
};
