import apiClient from './apiClient';
import { ApiResponse } from '../types/common.types';
import {
  PCBuildServiceOption,
  CreateBuildServiceOptionDTO,
  UpdateBuildServiceOptionDTO,
} from '../types/pcConfiguration.types';

/**
 * PC Build Service API
 * Handles all HTTP requests related to PC build service options
 */
export const pcBuildServiceApi = {
  /**
   * Get all active build service options
   * GET /api/pc-build-services
   */
  getActiveOptions: async (): Promise<ApiResponse<{ options: PCBuildServiceOption[] }>> => {
    return apiClient.get('/pc-build-services');
  },

  /**
   * Get all build service options (admin - includes inactive)
   * GET /api/pc-build-services/all
   */
  getAllOptions: async (): Promise<ApiResponse<{ options: PCBuildServiceOption[] }>> => {
    return apiClient.get('/pc-build-services/all');
  },

  /**
   * Get default build service option
   * GET /api/pc-build-services/default
   */
  getDefaultOption: async (): Promise<ApiResponse<PCBuildServiceOption>> => {
    return apiClient.get('/pc-build-services/default');
  },

  /**
   * Get a single build service option by ID
   * GET /api/pc-build-services/:id
   */
  getById: async (id: string): Promise<ApiResponse<PCBuildServiceOption>> => {
    return apiClient.get(`/pc-build-services/${id}`);
  },

  /**
   * Calculate service charge for given total price and option
   * POST /api/pc-build-services/calculate
   */
  calculateCharge: async (
    totalPrice: number,
    optionId: string
  ): Promise<
    ApiResponse<{
      serviceCharge: number;
      totalWithService: number;
      option: PCBuildServiceOption;
    }>
  > => {
    return apiClient.post('/pc-build-services/calculate', {
      totalPrice,
      optionId,
    });
  },

  /**
   * Get service charge calculation examples (for display/preview)
   * GET /api/pc-build-services/calculate-examples
   */
  getChargeExamples: async (): Promise<
    ApiResponse<{
      examples: {
        optionId: string;
        optionName: string;
        priceType: string;
        amount: number;
        examplePrices: { componentTotal: number; serviceCharge: number; total: number }[];
      }[];
    }>
  > => {
    return apiClient.get('/pc-build-services/calculate-examples');
  },

  // Admin-only methods

  /**
   * Create a new build service option (admin)
   * POST /api/pc-build-services
   */
  create: async (
    data: CreateBuildServiceOptionDTO
  ): Promise<ApiResponse<PCBuildServiceOption>> => {
    return apiClient.post('/pc-build-services', data);
  },

  /**
   * Update a build service option (admin)
   * PUT /api/pc-build-services/:id
   */
  update: async (
    id: string,
    data: UpdateBuildServiceOptionDTO
  ): Promise<ApiResponse<PCBuildServiceOption>> => {
    return apiClient.put(`/pc-build-services/${id}`, data);
  },

  /**
   * Delete a build service option (admin)
   * DELETE /api/pc-build-services/:id
   */
  delete: async (id: string): Promise<ApiResponse<{ message: string }>> => {
    return apiClient.delete(`/pc-build-services/${id}`);
  },

  /**
   * Set an option as default (admin)
   * PATCH /api/pc-build-services/:id/set-default
   */
  setDefault: async (id: string): Promise<ApiResponse<PCBuildServiceOption>> => {
    return apiClient.patch(`/pc-build-services/${id}/set-default`);
  },

  /**
   * Toggle option active status (admin)
   * PATCH /api/pc-build-services/:id/toggle-active
   */
  toggleActive: async (id: string): Promise<ApiResponse<PCBuildServiceOption>> => {
    return apiClient.patch(`/pc-build-services/${id}/toggle-active`);
  },
};
