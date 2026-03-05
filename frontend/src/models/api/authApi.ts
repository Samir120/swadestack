import apiClient from './apiClient';
import { AuthResponse, LoginData, LoginResponse, RegisterData, User } from '../types/user.types';

export const authApi = {
  register: async (data: RegisterData) => {
    return apiClient.post<{ message: string }>('/auth/register', data);
  },

  login: async (data: LoginData) => {
    return apiClient.post<LoginResponse>('/auth/login', data);
  },

  getProfile: async () => {
    return apiClient.get<User>('/auth/profile');
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    return apiClient.post('/auth/change-password', {
      currentPassword,
      newPassword,
    });
  },

  verifyEmail: async (token: string) => {
    return apiClient.get<{ message: string }>(`/auth/verify-email/${token}`);
  },

  resendVerification: async (email: string) => {
    return apiClient.post<{ message: string }>('/auth/resend-verification', { email });
  },

  forgotPassword: async (email: string) => {
    return apiClient.post<{ message: string }>('/auth/forgot-password', { email });
  },

  resetPassword: async (token: string, newPassword: string) => {
    return apiClient.post<{ message: string }>(`/auth/reset-password/${token}`, { newPassword });
  },

  forgotPassword2faValidate: async (tempToken: string, token: string) => {
    return apiClient.post<{ resetToken: string }>('/auth/forgot-password/2fa/validate', { tempToken, token });
  },

  refreshToken: async (refreshToken: string) => {
    return apiClient.post<AuthResponse>('/auth/refresh', { refreshToken });
  },

  revokeToken: async (refreshToken: string) => {
    return apiClient.post<{ message: string }>('/auth/revoke', { refreshToken });
  },
};
