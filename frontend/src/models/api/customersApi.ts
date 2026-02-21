import apiClient from './apiClient';
import {
  CustomerListResponse,
  CustomerProfile,
  CustomerStats,
  CustomerListQuery,
  UpdateCustomerData,
  CustomerAddress,
  CreateAddressData,
  UpdateAddressData,
  AuditLogResponse,
  CustomerCart,
  CustomerOrdersQuery,
  CustomerOrdersResponse,
  NotesResponse,
  InternalNote,
  LoginActivityResponse,
  EmailHistoryResponse,
} from '../types/customer.types';

export const customersApi = {
  // List & stats
  getAll: async (query: CustomerListQuery) => {
    return apiClient.get<CustomerListResponse>('/admin/customers', query);
  },

  getStats: async () => {
    return apiClient.get<CustomerStats>('/admin/customers/stats');
  },

  getById: async (id: string) => {
    return apiClient.get<CustomerProfile>(`/admin/customers/${id}`);
  },

  update: async (id: string, data: UpdateCustomerData) => {
    return apiClient.put<CustomerProfile>(`/admin/customers/${id}`, data);
  },

  exportCSV: async (query: { search?: string; status?: string }) => {
    return apiClient.getBlob('/admin/customers/export', query);
  },

  // Account actions
  changeStatus: async (id: string, data: { status: string; reason?: string; endDate?: string }) => {
    return apiClient.patch<CustomerProfile>(`/admin/customers/${id}/status`, data);
  },

  verifyEmail: async (id: string) => {
    return apiClient.post<CustomerProfile>(`/admin/customers/${id}/verify-email`);
  },

  revokeVerification: async (id: string) => {
    return apiClient.post<CustomerProfile>(`/admin/customers/${id}/revoke-verification`);
  },

  resendVerification: async (id: string) => {
    return apiClient.post(`/admin/customers/${id}/resend-verification`);
  },

  resetPassword: async (id: string) => {
    return apiClient.post(`/admin/customers/${id}/reset-password`);
  },

  forceLogout: async (id: string) => {
    return apiClient.post(`/admin/customers/${id}/force-logout`);
  },

  deleteCustomer: async (id: string, anonymize: boolean = false) => {
    return apiClient.delete(`/admin/customers/${id}${anonymize ? '?anonymize=true' : ''}`);
  },

  // Addresses
  getAddresses: async (id: string) => {
    return apiClient.get<CustomerAddress[]>(`/admin/customers/${id}/addresses`);
  },

  createAddress: async (id: string, data: CreateAddressData) => {
    return apiClient.post<CustomerAddress>(`/admin/customers/${id}/addresses`, data);
  },

  updateAddress: async (id: string, addrId: string, data: UpdateAddressData) => {
    return apiClient.put<CustomerAddress>(`/admin/customers/${id}/addresses/${addrId}`, data);
  },

  deleteAddress: async (id: string, addrId: string) => {
    return apiClient.delete(`/admin/customers/${id}/addresses/${addrId}`);
  },

  setAddressDefault: async (id: string, addrId: string) => {
    return apiClient.patch(`/admin/customers/${id}/addresses/${addrId}/set-default`);
  },

  // Cart
  getCart: async (id: string) => {
    return apiClient.get<CustomerCart>(`/admin/customers/${id}/cart`);
  },

  clearCart: async (id: string) => {
    return apiClient.delete(`/admin/customers/${id}/cart`);
  },

  removeCartItem: async (id: string, itemId: string) => {
    return apiClient.delete(`/admin/customers/${id}/cart/${itemId}`);
  },

  sendCartReminder: async (id: string) => {
    return apiClient.post(`/admin/customers/${id}/cart/send-reminder`);
  },

  // Orders (with filtering)
  getOrders: async (id: string, query: CustomerOrdersQuery = {}) => {
    return apiClient.get<CustomerOrdersResponse>(`/admin/customers/${id}/orders`, query);
  },

  // Audit logs
  getAuditLogs: async (targetType: string, targetId: string, page: number = 1, pageSize: number = 20) => {
    return apiClient.get<AuditLogResponse>('/admin/customers/audit-logs', { targetType, targetId, page, pageSize });
  },

  // Notes
  getNotes: async (id: string, page: number = 1) => {
    return apiClient.get<NotesResponse>(`/admin/customers/${id}/notes`, { page });
  },

  createNote: async (id: string, content: string) => {
    return apiClient.post<InternalNote>(`/admin/customers/${id}/notes`, { content });
  },

  updateNote: async (noteId: string, content: string) => {
    return apiClient.put<InternalNote>(`/admin/customers/notes/${noteId}`, { content });
  },

  deleteNote: async (noteId: string) => {
    return apiClient.delete(`/admin/customers/notes/${noteId}`);
  },

  // Login activity
  getLoginActivity: async (id: string, page: number = 1) => {
    return apiClient.get<LoginActivityResponse>(`/admin/customers/${id}/login-activity`, { page });
  },

  // Email history
  getEmailHistory: async (id: string, page: number = 1) => {
    return apiClient.get<EmailHistoryResponse>(`/admin/customers/${id}/emails`, { page });
  },

  sendCustomEmail: async (id: string, data: { subject: string; body: string; language?: string }) => {
    return apiClient.post(`/admin/customers/${id}/emails/send`, data);
  },
};
