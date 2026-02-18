import apiClient from './apiClient';
import {
  FooterStructure,
  FooterCategoryTitle,
  FooterMainPage,
  CreateFooterCategoryTitle,
  UpdateFooterCategoryTitle,
  CreateFooterMainPage,
  UpdateFooterMainPage,
} from '../types/footer.types';

export const footerApi = {
  // Public endpoints
  getFooterStructure: async () => {
    return apiClient.get<FooterStructure>('/footer/structure');
  },

  getActivePages: async () => {
    return apiClient.get<FooterMainPage[]>('/footer/pages');
  },

  // Get all pages including inactive (Admin)
  getAllPages: async () => {
    return apiClient.get<FooterMainPage[]>('/footer/pages/all');
  },

  getPageById: async (id: string) => {
    return apiClient.get<FooterMainPage>(`/footer/pages/${id}`);
  },

  getPageByUrl: async (url: string) => {
    return apiClient.get<FooterMainPage>(`/footer/page-by-url?url=${encodeURIComponent(url)}`);
  },

  // Footer Category Title endpoints (Admin)
  getAllCategories: async () => {
    return apiClient.get<FooterCategoryTitle[]>('/footer/categories');
  },

  getCategoryById: async (id: string) => {
    return apiClient.get<FooterCategoryTitle>(`/footer/categories/${id}`);
  },

  createCategory: async (data: CreateFooterCategoryTitle) => {
    return apiClient.post<FooterCategoryTitle>('/footer/categories', data);
  },

  updateCategory: async (id: string, data: UpdateFooterCategoryTitle) => {
    return apiClient.put<FooterCategoryTitle>(`/footer/categories/${id}`, data);
  },

  deleteCategory: async (id: string) => {
    return apiClient.delete(`/footer/categories/${id}`);
  },

  toggleCategoryActive: async (id: string) => {
    return apiClient.patch<FooterCategoryTitle>(`/footer/categories/${id}/toggle-active`);
  },

  updateCategoryOrder: async (id: string, displayOrder: number) => {
    return apiClient.patch(`/footer/categories/${id}/order`, { displayOrder });
  },

  // Footer Main Page endpoints (Admin)
  getPagesByCategoryId: async (categoryId: string) => {
    return apiClient.get<FooterMainPage[]>(`/footer/pages/category/${categoryId}`);
  },

  createPage: async (data: CreateFooterMainPage) => {
    return apiClient.post<FooterMainPage>('/footer/pages', data);
  },

  updatePage: async (id: string, data: UpdateFooterMainPage) => {
    return apiClient.put<FooterMainPage>(`/footer/pages/${id}`, data);
  },

  deletePage: async (id: string) => {
    return apiClient.delete(`/footer/pages/${id}`);
  },

  togglePageActive: async (id: string) => {
    return apiClient.patch<FooterMainPage>(`/footer/pages/${id}/toggle-active`);
  },

  updatePageOrder: async (id: string, displayOrder: number) => {
    return apiClient.patch(`/footer/pages/${id}/order`, { displayOrder });
  },
};
