import apiClient from './apiClient';
import { Feature } from '../types/feature.types';

export const featuresApi = {
  getActive: async () => {
    return apiClient.get<Feature[]>('/features');
  },

  getAll: async () => {
    return apiClient.get<Feature[]>('/features/admin/all');
  },

  create: async (data: FormData) => {
    return apiClient.post<Feature>('/features', data);
  },

  update: async (id: string, data: FormData) => {
    return apiClient.put<Feature>(`/features/${id}`, data);
  },

  delete: async (id: string) => {
    return apiClient.delete(`/features/${id}`);
  },

  toggleActive: async (id: string) => {
    return apiClient.patch<Feature>(`/features/${id}/toggle-active`);
  },

  updateOrder: async (id: string, displayOrder: number) => {
    return apiClient.patch(`/features/${id}/order`, { displayOrder });
  },
};
