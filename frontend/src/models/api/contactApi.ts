import apiClient from './apiClient';
import {
  ContactFormData,
  ContactMessage,
  ContactMessagesResponse,
  ContactMessageStatistics,
  ReplyData,
  UpdateStatusData,
  AddNotesData,
} from '../types/contact.types';

export interface ContactData {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  language?: 'en' | 'sv';
}

export const contactApi = {
  // Public endpoint - submit contact form
  sendMessage: async (data: ContactFormData) => {
    const response = await apiClient.post('/contact', data);
    return response.data;
  },

  // Admin endpoints - manage contact messages
  getAllMessages: async (params?: {
    limit?: number;
    offset?: number;
    status?: 'new' | 'read' | 'replied' | 'archived';
    isRead?: boolean;
  }): Promise<ContactMessagesResponse> => {
    const response = await apiClient.get<ContactMessagesResponse>('/contact/messages', params);
    if (!response.data) {
      throw new Error('No data returned from server');
    }
    return response.data;
  },

  getMessageById: async (id: string): Promise<ContactMessage> => {
    const response = await apiClient.get<ContactMessage>(`/contact/messages/${id}`);
    if (!response.data) throw new Error('No data returned');
    return response.data;
  },

  markAsRead: async (id: string): Promise<ContactMessage> => {
    const response = await apiClient.patch<ContactMessage>(`/contact/messages/${id}/read`);
    if (!response.data) throw new Error('No data returned');
    return response.data;
  },

  updateStatus: async (id: string, data: UpdateStatusData): Promise<ContactMessage> => {
    const response = await apiClient.patch<ContactMessage>(`/contact/messages/${id}/status`, data);
    if (!response.data) throw new Error('No data returned');
    return response.data;
  },

  addNotes: async (id: string, data: AddNotesData): Promise<ContactMessage> => {
    const response = await apiClient.patch<ContactMessage>(`/contact/messages/${id}/notes`, data);
    if (!response.data) throw new Error('No data returned');
    return response.data;
  },

  replyToMessage: async (id: string, data: ReplyData): Promise<void> => {
    await apiClient.post(`/contact/messages/${id}/reply`, data);
  },

  getStatistics: async (): Promise<ContactMessageStatistics> => {
    const response = await apiClient.get<ContactMessageStatistics>('/contact/messages/statistics');
    if (!response.data) throw new Error('No data returned');
    return response.data;
  },

  searchMessages: async (keyword: string): Promise<ContactMessage[]> => {
    const response = await apiClient.get<ContactMessage[]>('/contact/messages/search', { keyword });
    if (!response.data) throw new Error('No data returned');
    return response.data;
  },

  deleteMessage: async (id: string): Promise<void> => {
    await apiClient.delete(`/contact/messages/${id}`);
  },
};
