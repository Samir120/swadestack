// Common Types
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: any[];
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

export type Language = 'en' | 'sv';

export type Theme = 'light' | 'dark';

export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}
