import apiClient from './apiClient';
import { NotificationBanner, ActiveNotificationBanner } from '../types/notificationBanner.types';

export const notificationBannersApi = {
  // Public
  getActive: async () => {
    return apiClient.get<ActiveNotificationBanner | null>('/notification-banners/active');
  },

  track: async (id: string, type: 'impression' | 'click' | 'dismiss') => {
    return apiClient.post(`/notification-banners/${id}/track`, { type });
  },

  // Admin
  getAll: async () => {
    return apiClient.get<NotificationBanner[]>('/notification-banners');
  },

  getById: async (id: string) => {
    return apiClient.get<NotificationBanner>(`/notification-banners/${id}`);
  },

  create: async (data: Partial<NotificationBanner>) => {
    return apiClient.post<NotificationBanner>('/notification-banners', data);
  },

  update: async (id: string, data: Partial<NotificationBanner>) => {
    return apiClient.put<NotificationBanner>(`/notification-banners/${id}`, data);
  },

  delete: async (id: string) => {
    return apiClient.delete(`/notification-banners/${id}`);
  },

  toggle: async (id: string) => {
    return apiClient.patch<NotificationBanner>(`/notification-banners/${id}/toggle`);
  },
};
