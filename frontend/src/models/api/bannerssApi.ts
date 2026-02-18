import apiClient from './apiClient';
import { Banner } from '../types/bannerTypes';
import { PaginatedResponse } from '../types/common.types';

export const bannersApi = {
  getAll: async (page = 1, limit = 20) => {
    return apiClient.get<PaginatedResponse<Banner>>('/banners', {
      page,
      limit,
    });
  },

  getById: async (id: string) => {
    return apiClient.get<Banner>(`/banners/${id}`);
  },
};
