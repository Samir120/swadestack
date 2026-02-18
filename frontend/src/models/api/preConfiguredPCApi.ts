import apiClient from './apiClient';
import { ApiResponse } from '../types/common.types';
import {
  PCConfiguration,
  PCTier,
  PreConfiguredPCFilters,
  PreConfiguredStats,
  CreatePreConfiguredPCRequest,
  UpdatePreConfiguredPCRequest,
  PromoteToPreConfiguredRequest,
} from '../types/pcConfiguration.types';

/**
 * Pre-Configured PC API Service
 * Handles all API calls for pre-configured PCs (admin-created PCs for sale)
 */
class PreConfiguredPCApi {
  // =====================================================
  // PUBLIC ENDPOINTS (No Auth Required)
  // =====================================================

  /**
   * Get all pre-configured PCs with optional filtering
   */
  async getAll(filters?: PreConfiguredPCFilters, limit?: number, offset?: number): Promise<ApiResponse<{
    configurations: PCConfiguration[];
    total: number;
  }>> {
    const params: any = {};
    if (filters?.tier) params.tier = filters.tier;
    if (filters?.minPrice !== undefined) params.minPrice = filters.minPrice;
    if (filters?.maxPrice !== undefined) params.maxPrice = filters.maxPrice;
    if (limit !== undefined) params.limit = limit;
    if (offset !== undefined) params.offset = offset;

    return await apiClient.get('/pc-configurations/pre-configured', params);
  }

  /**
   * Get featured pre-configured PCs for home page
   */
  async getFeatured(limit: number = 8): Promise<ApiResponse<PCConfiguration[]>> {
    return await apiClient.get('/pc-configurations/pre-configured/featured', { limit });
  }

  /**
   * Get pre-configured PCs by tier
   */
  async getByTier(tier: PCTier): Promise<ApiResponse<{
    configurations: PCConfiguration[];
    total: number;
  }>> {
    return await apiClient.get('/pc-configurations/pre-configured', { tier });
  }

  /**
   * Get single pre-configured PC by ID
   */
  async getById(id: string): Promise<ApiResponse<PCConfiguration>> {
    return await apiClient.get(`/pc-configurations/pre-configured/${id}`);
  }

  /**
   * Order a pre-configured PC (creates a copy for the user)
   * Requires authentication
   */
  async order(id: string): Promise<ApiResponse<PCConfiguration>> {
    return await apiClient.post(`/pc-configurations/pre-configured/${id}/order`);
  }

  /**
   * Direct checkout for a pre-configured PC (no user copy needed)
   * POST /api/pc-configurations/pre-configured/:id/direct-checkout
   */
  async directCheckout(id: string, orderData: {
    email: string;
    firstName: string;
    lastName: string;
    userId?: string;
    couponCode?: string;
  }): Promise<ApiResponse<{ orderId: string; orderNumber: string; totalAmount: number }>> {
    return await apiClient.post(`/pc-configurations/pre-configured/${id}/direct-checkout`, orderData);
  }

  // =====================================================
  // ADMIN ENDPOINTS
  // =====================================================

  /**
   * Get all pre-configured PCs for admin
   */
  async adminGetAll(filters?: { tier?: PCTier }, limit?: number, offset?: number): Promise<ApiResponse<{
    configurations: PCConfiguration[];
    total: number;
  }>> {
    const params: any = {};
    if (filters?.tier) params.tier = filters.tier;
    if (limit !== undefined) params.limit = limit;
    if (offset !== undefined) params.offset = offset;

    return await apiClient.get('/pc-configurations/admin/pre-configured', params);
  }

  /**
   * Get pre-configured PC statistics for admin
   */
  async getStats(): Promise<ApiResponse<PreConfiguredStats>> {
    return await apiClient.get('/pc-configurations/admin/pre-configured/stats');
  }

  /**
   * Create a new pre-configured PC
   */
  async create(data: CreatePreConfiguredPCRequest): Promise<ApiResponse<PCConfiguration>> {
    return await apiClient.post('/pc-configurations/admin/pre-configured', data);
  }

  /**
   * Promote an existing configuration to pre-configured PC
   */
  async promote(configId: string, data: PromoteToPreConfiguredRequest): Promise<ApiResponse<PCConfiguration>> {
    return await apiClient.post(`/pc-configurations/admin/pre-configured/${configId}/promote`, data);
  }

  /**
   * Update a pre-configured PC
   */
  async update(id: string, data: UpdatePreConfiguredPCRequest): Promise<ApiResponse<PCConfiguration>> {
    return await apiClient.put(`/pc-configurations/admin/pre-configured/${id}`, data);
  }

  /**
   * Toggle featured status
   */
  async toggleFeatured(id: string): Promise<ApiResponse<{ isFeatured: boolean }>> {
    return await apiClient.patch(`/pc-configurations/admin/pre-configured/${id}/featured`);
  }

  /**
   * Delete a pre-configured PC
   */
  async delete(id: string): Promise<ApiResponse<void>> {
    return await apiClient.delete(`/pc-configurations/admin/pre-configured/${id}`);
  }
}

export const preConfiguredPCApi = new PreConfiguredPCApi();
export default preConfiguredPCApi;
