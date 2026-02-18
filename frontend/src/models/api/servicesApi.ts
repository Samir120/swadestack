import apiClient from './apiClient';
import { Service } from '../types/service.types';
import { PaginatedResponse } from '../types/common.types';

export const servicesApi = {
  getAll: async (page = 1, limit = 20, category?: string) => {
    return apiClient.get<PaginatedResponse<Service>>('/services', {
      page,
      limit,
      category,
    });
  },

  getById: async (id: string) => {
    return apiClient.get<Service>(`/services/${id}`);
  },
};
