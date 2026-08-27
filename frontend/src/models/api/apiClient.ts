import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { ApiResponse } from '../types/common.types';

interface FailedRequest {
  resolve: (value: any) => void;
  reject: (reason?: any) => void;
  config: InternalAxiosRequestConfig;
}

/**
 * API Client - Model Layer (Data Provider)
 * Handles all HTTP communications with the backend
 */
class ApiClient {
  private client: AxiosInstance;
  private accessToken: string | null = null;
  private isRefreshing = false;
  private failedQueue: FailedRequest[] = [];
  private onAuthFailure: (() => void) | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: (import.meta as any).env?.VITE_API_URL || '/api',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor - Add auth token from memory
    this.client.interceptors.request.use(
      (config) => {
        if (this.accessToken) {
          config.headers.Authorization = `Bearer ${this.accessToken}`;
        }
        if (config.data instanceof FormData) {
          delete config.headers['Content-Type'];
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor - Handle 401 with token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        // Only attempt refresh on 401, and skip for auth endpoints that don't use bearer tokens
        const skipRefreshUrls = [
          '/auth/refresh',
          '/auth/login',
          '/auth/forgot-password',
          '/auth/forgot-password/2fa/validate',
          '/auth/2fa/validate',
          '/auth/2fa/recovery/send',
          '/auth/2fa/recovery/verify',
        ];
        if (
          error.response?.status !== 401 ||
          !originalRequest ||
          originalRequest._retry ||
          skipRefreshUrls.some(url => originalRequest.url === url)
        ) {
          return Promise.reject(error);
        }

        // If already refreshing, queue this request
        if (this.isRefreshing) {
          return new Promise((resolve, reject) => {
            this.failedQueue.push({ resolve, reject, config: originalRequest });
          });
        }

        originalRequest._retry = true;
        this.isRefreshing = true;

        try {
          const refreshToken = localStorage.getItem('refresh_token');
          if (!refreshToken) {
            throw new Error('No refresh token');
          }

          const response = await this.client.post('/auth/refresh', { refreshToken });
          const { token: newAccessToken, refreshToken: newRefreshToken } = response.data.data;

          this.accessToken = newAccessToken;
          localStorage.setItem('refresh_token', newRefreshToken);

          // Retry all queued requests with new token
          this.failedQueue.forEach(({ resolve, config }) => {
            config.headers.Authorization = `Bearer ${newAccessToken}`;
            resolve(this.client(config));
          });
          this.failedQueue = [];

          // Retry original request
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return this.client(originalRequest);
        } catch (refreshError) {
          // Refresh failed — clear everything and notify
          this.accessToken = null;
          localStorage.removeItem('refresh_token');

          // Reject all queued requests
          this.failedQueue.forEach(({ reject }) => {
            reject(refreshError);
          });
          this.failedQueue = [];

          if (this.onAuthFailure) {
            this.onAuthFailure();
          }

          return Promise.reject(refreshError);
        } finally {
          this.isRefreshing = false;
        }
      }
    );
  }

  setAccessToken(token: string | null): void {
    this.accessToken = token;
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  setOnAuthFailure(callback: (() => void) | null): void {
    this.onAuthFailure = callback;
  }

  /**
   * GET request
   */
  async get<T>(url: string, params?: any): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.get<ApiResponse<T>>(url, { params });
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * POST request
   */
  async post<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.post<ApiResponse<T>>(url, data);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * PUT request
   */
  async put<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.put<ApiResponse<T>>(url, data);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * PATCH request
   */
  async patch<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.patch<ApiResponse<T>>(url, data);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * DELETE request
   */
  async delete<T>(url: string): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.delete<ApiResponse<T>>(url);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * GET request for blob (PDF, images, etc.)
   * Returns the blob directly for download
   */
  async getBlob(url: string, params?: any): Promise<Blob> {
    const response = await this.client.get(url, {
      params,
      responseType: 'blob',
    });
    return response.data;
  }

  /**
   * Handle API errors
   */
  private handleError(error: any): ApiResponse<any> {
    if (axios.isAxiosError(error) && error.response) {
      return {
        success: false,
        message: error.response.data?.message || 'An error occurred',
        errors: error.response.data?.errors,
      };
    }

    return {
      success: false,
      message: error.message || 'Network error',
    };
  }
}

export default new ApiClient();
