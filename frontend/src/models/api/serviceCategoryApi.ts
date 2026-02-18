import apiClient from './apiClient';
import { ServiceCategory } from '../types/serviceCategory.types';

export const serviceCategoryApi = {
  getActive: async () => {
    return apiClient.get<ServiceCategory[]>('/service-categories');
  },

  getAll: async () => {
    return apiClient.get<ServiceCategory[]>('/service-categories/admin/all');
  },

  getById: async (id: string) => {
    return apiClient.get<ServiceCategory>(`/service-categories/${id}`);
  },

  create: async (data: { name_en: string; name_sv: string; displayOrder?: number; isActive?: boolean }) => {
    return apiClient.post<ServiceCategory>('/service-categories', data);
  },

  update: async (id: string, data: { name_en?: string; name_sv?: string; displayOrder?: number; isActive?: boolean }) => {
    return apiClient.put<ServiceCategory>(`/service-categories/${id}`, data);
  },

  delete: async (id: string) => {
    return apiClient.delete(`/service-categories/${id}`);
  },

  toggleActive: async (id: string) => {
    return apiClient.patch<ServiceCategory>(`/service-categories/${id}/toggle-active`, {});
  },

  updateOrder: async (id: string, displayOrder: number) => {
    return apiClient.patch(`/service-categories/${id}/order`, { displayOrder });
  },
};
