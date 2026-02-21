import apiClient from './apiClient';
import {
  NewsletterSubscribeData,
  NewsletterCheckStatusResponse,
} from '../types/newsletter.types';

export const newsletterApi = {
  subscribe: async (data: NewsletterSubscribeData) => {
    const response = await apiClient.post('/newsletter/subscribe', data);
    return response;
  },

  checkStatus: async (email: string): Promise<NewsletterCheckStatusResponse> => {
    const response = await apiClient.post<NewsletterCheckStatusResponse>(
      '/newsletter/check-status',
      { email }
    );
    if (!response.data) throw new Error('No data returned');
    return response.data;
  },

  unsubscribeByEmail: async (email: string) => {
    const response = await apiClient.post('/newsletter/unsubscribe-by-email', { email });
    return response;
  },

  verify: async (token: string) => {
    const response = await apiClient.get(`/newsletter/verify/${token}`);
    return response;
  },

  unsubscribeByToken: async (token: string) => {
    const response = await apiClient.get(`/newsletter/unsubscribe/${token}`);
    return response;
  },
};
