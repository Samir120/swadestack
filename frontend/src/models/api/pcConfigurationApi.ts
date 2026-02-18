import apiClient from './apiClient';
import { ApiResponse } from '../types/common.types';
import {
  PCConfiguration,
  ConfigurationStatus,
  PriceBreakdown,
  ConfigurationStats,
  CreateConfigurationRequest,
  CheckoutConfigurationRequest,
} from '../types/pcConfiguration.types';
import {
  ValidationResult,
  ValidateSelectionRequest,
} from '../types/validation.types';
import { ComponentType } from '../types/pcComponent.types';

/**
 * PC Configuration API Service
 * Handles all HTTP requests related to PC configurations
 */
export const pcConfigurationApi = {
  /**
   * Get all configurations for the authenticated user
   * GET /api/pc-configurations?status=saved
   */
  getAll: async (
    status?: ConfigurationStatus
  ): Promise<ApiResponse<{ configurations: PCConfiguration[]; total: number }>> => {
    return apiClient.get('/pc-configurations', status ? { status } : undefined);
  },

  /**
   * Get a single configuration by ID
   * GET /api/pc-configurations/:id
   */
  getById: async (id: string): Promise<ApiResponse<PCConfiguration>> => {
    return apiClient.get(`/pc-configurations/${id}`);
  },

  /**
   * Create a new configuration
   * POST /api/pc-configurations
   */
  create: async (
    data?: CreateConfigurationRequest
  ): Promise<ApiResponse<PCConfiguration>> => {
    return apiClient.post('/pc-configurations', data || {});
  },

  /**
   * Delete a configuration
   * DELETE /api/pc-configurations/:id
   */
  delete: async (id: string): Promise<ApiResponse<{ message: string }>> => {
    return apiClient.delete(`/pc-configurations/${id}`);
  },

  /**
   * Duplicate a configuration
   * POST /api/pc-configurations/:id/duplicate
   */
  duplicate: async (id: string): Promise<ApiResponse<PCConfiguration>> => {
    return apiClient.post(`/pc-configurations/${id}/duplicate`);
  },

  // Component Management

  /**
   * Add a component to configuration
   * POST /api/pc-configurations/:id/components
   * Supports multi-select components with slotIndex and slotType
   */
  addComponent: async (
    configId: string,
    componentType: ComponentType,
    componentId: string,
    quantity?: number,
    slotIndex?: number,
    slotType?: 'nvme' | 'sata'
  ): Promise<ApiResponse<PCConfiguration>> => {
    return apiClient.post(`/pc-configurations/${configId}/components`, {
      componentType,
      componentId,
      quantity,
      slotIndex,
      slotType,
    });
  },

  /**
   * Remove a component from configuration
   * DELETE /api/pc-configurations/:id/components/:type
   * For multi-select components, pass slotIndex as query parameter
   */
  removeComponent: async (
    configId: string,
    componentType: ComponentType,
    slotIndex?: number
  ): Promise<ApiResponse<PCConfiguration>> => {
    const url = slotIndex !== undefined
      ? `/pc-configurations/${configId}/components/${componentType}?slotIndex=${slotIndex}`
      : `/pc-configurations/${configId}/components/${componentType}`;
    return apiClient.delete(url);
  },

  /**
   * Update a component in configuration (change component or quantity)
   * PUT /api/pc-configurations/:id/components/:type
   */
  updateComponent: async (
    configId: string,
    componentType: ComponentType,
    componentId: string,
    quantity?: number
  ): Promise<ApiResponse<PCConfiguration>> => {
    return apiClient.put(`/pc-configurations/${configId}/components/${componentType}`, {
      componentId,
      quantity,
    });
  },

  // Validation

  /**
   * Validate entire configuration
   * POST /api/pc-configurations/:id/validate
   */
  validate: async (configId: string, save?: boolean): Promise<ApiResponse<ValidationResult>> => {
    return apiClient.post(`/pc-configurations/${configId}/validate`, save ? { save: true } : undefined);
  },

  /**
   * Validate a new component selection against existing components (real-time)
   * POST /api/pc-configurations/validate-selection
   */
  validateSelection: async (
    data: ValidateSelectionRequest
  ): Promise<
    ApiResponse<{
      isCompatible: boolean;
      errors: any[];
      warnings: any[];
      suggestedAlternatives?: any;
    }>
  > => {
    return apiClient.post('/pc-configurations/validate-selection', data);
  },

  // Pricing & Build Service

  /**
   * Toggle build service on/off
   * POST /api/pc-configurations/:id/build-service
   */
  toggleBuildService: async (
    configId: string,
    enabled: boolean,
    buildServiceOptionId?: string
  ): Promise<ApiResponse<PCConfiguration>> => {
    return apiClient.post(`/pc-configurations/${configId}/build-service`, {
      includesBuildService: enabled,
      buildServiceOptionId,
    });
  },

  /**
   * Calculate configuration price breakdown
   * GET /api/pc-configurations/:id/price
   */
  calculatePrice: async (configId: string): Promise<ApiResponse<PriceBreakdown>> => {
    return apiClient.get(`/pc-configurations/${configId}/price`);
  },

  // Checkout & Export

  /**
   * Checkout configuration (convert to order)
   * POST /api/pc-configurations/:id/checkout
   */
  checkout: async (
    configId: string,
    orderData: CheckoutConfigurationRequest
  ): Promise<ApiResponse<{ orderId: string; clientSecret: string; totalAmount: number }>> => {
    return apiClient.post(`/pc-configurations/${configId}/checkout`, orderData);
  },

  /**
   * Export configuration as PDF
   * GET /api/pc-configurations/:id/pdf?lang=en|sv
   * Downloads the PDF file directly
   */
  exportPDF: async (configId: string, language: 'en' | 'sv' = 'en'): Promise<void> => {
    const blob = await apiClient.getBlob(`/pc-configurations/${configId}/pdf`, { lang: language });

    // Create download link and trigger download
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `PC-Configuration-${configId.substring(0, 8)}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  // Admin Stats

  /**
   * Get configuration statistics (admin)
   * GET /api/pc-configurations/stats/summary
   */
  getStats: async (): Promise<ApiResponse<ConfigurationStats>> => {
    return apiClient.get('/pc-configurations/stats/summary');
  },
};
