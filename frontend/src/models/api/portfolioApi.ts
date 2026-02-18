import apiClient from './apiClient';
import { PortfolioItem } from '../types/portfolio.types';
import { PaginatedResponse } from '../types/common.types';

export const portfolioApi = {
  getAll: async (page = 1, limit = 20, category?: string) => {
    return apiClient.get<PaginatedResponse<PortfolioItem>>('/portfolio', {
      page,
      limit,
      category,
    });
  },

  getFeatured: async (limit = 6) => {
    return apiClient.get<PortfolioItem[]>('/portfolio/featured', { limit });
  },

  getById: async (id: string) => {
    return apiClient.get<PortfolioItem>(`/portfolio/${id}`);
  },

  getCategories: async () => {
    return apiClient.get<string[]>('/portfolio/categories');
  },
};
