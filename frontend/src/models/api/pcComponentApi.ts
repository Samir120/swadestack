import apiClient from './apiClient';
import { ApiResponse } from '../types/common.types';
import {
  PCComponent,
  ComponentType,
  ComponentFilters,
  CreatePCComponentDTO,
  UpdatePCComponentDTO,
  LowStockComponent,
} from '../types/pcComponent.types';

/**
 * PC Component API Service
 * Handles all HTTP requests related to PC components
 */
export const pcComponentApi = {
  /**
   * Get components by type with optional filters
   * GET /api/pc-components?type=cpu&manufacturer=AMD
   */
  getByType: async (
    componentType: ComponentType,
    filters?: Omit<ComponentFilters, 'componentType'>
  ): Promise<ApiResponse<{ components: PCComponent[]; total: number }>> => {
    return apiClient.get('/pc-components', {
      type: componentType,
      ...filters,
    });
  },

  /**
   * Get all components with pagination
   * GET /api/pc-components?page=1&limit=20
   */
  getAll: async (
    page = 1,
    limit = 50,
    filters?: ComponentFilters
  ): Promise<ApiResponse<{ components: PCComponent[]; total: number; page: number; limit: number }>> => {
    return apiClient.get('/pc-components', {
      page,
      limit,
      ...filters,
    });
  },

  /**
   * Get a single component by ID
   * GET /api/pc-components/:id
   */
  getById: async (id: string): Promise<ApiResponse<PCComponent>> => {
    return apiClient.get(`/pc-components/${id}`);
  },

  /**
   * Search components by query string
   * GET /api/pc-components/search?q=Ryzen&type=cpu
   */
  search: async (
    query: string,
    filters?: ComponentFilters
  ): Promise<ApiResponse<{ components: PCComponent[]; total: number }>> => {
    return apiClient.get('/pc-components/search', {
      q: query,
      ...filters,
    });
  },

  /**
   * Get list of manufacturers, optionally filtered by component type
   * GET /api/pc-components/manufacturers?type=cpu
   */
  getManufacturers: async (
    componentType?: ComponentType
  ): Promise<ApiResponse<{ manufacturers: string[] }>> => {
    return apiClient.get('/pc-components/manufacturers', {
      type: componentType,
    });
  },

  /**
   * Get component type counts (public)
   * GET /api/pc-components/counts
   */
  getComponentTypeCounts: async (): Promise<
    ApiResponse<{ counts: Record<ComponentType, number> }>
  > => {
    return apiClient.get('/pc-components/counts');
  },

  /**
   * Get low stock components (admin)
   * GET /api/pc-components/stats/low-stock?threshold=10
   */
  getLowStockComponents: async (
    threshold = 10
  ): Promise<ApiResponse<{ components: LowStockComponent[] }>> => {
    return apiClient.get('/pc-components/stats/low-stock', {
      threshold,
    });
  },

  // Admin-only methods

  /**
   * Get all components including inactive (admin)
   * GET /api/pc-components/admin/all?type=cpu&page=1&limit=200
   */
  getAllAdmin: async (
    page = 1,
    limit = 200,
    componentType?: ComponentType
  ): Promise<ApiResponse<{ components: PCComponent[]; total: number; page: number; limit: number }>> => {
    return apiClient.get('/pc-components/admin/all', {
      page,
      limit,
      type: componentType,
    });
  },

  /**
   * Create a new component (admin)
   * POST /api/pc-components
   */
  create: async (data: CreatePCComponentDTO): Promise<ApiResponse<PCComponent>> => {
    return apiClient.post('/pc-components', data);
  },

  /**
   * Update an existing component (admin)
   * PUT /api/pc-components/:id
   */
  update: async (id: string, data: UpdatePCComponentDTO): Promise<ApiResponse<PCComponent>> => {
    return apiClient.put(`/pc-components/${id}`, data);
  },

  /**
   * Delete a component (admin)
   * DELETE /api/pc-components/:id
   */
  delete: async (id: string): Promise<ApiResponse<{ message: string }>> => {
    return apiClient.delete(`/pc-components/${id}`);
  },

  /**
   * Update component stock (admin)
   * PATCH /api/pc-components/:id/stock
   */
  updateStock: async (
    id: string,
    quantity: number,
    operation: 'set' | 'increment' | 'decrement' = 'set'
  ): Promise<ApiResponse<PCComponent>> => {
    return apiClient.patch(`/pc-components/${id}/stock`, {
      quantity,
      operation,
    });
  },

  /**
   * Toggle component active status (admin)
   * PATCH /api/pc-components/:id/toggle-active
   */
  toggleActive: async (id: string): Promise<ApiResponse<PCComponent>> => {
    return apiClient.patch(`/pc-components/${id}/toggle-active`);
  },
};
