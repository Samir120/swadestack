import apiClient from './apiClient';
import { ApiResponse } from '../types/common.types';
import { VatSettings } from '../types/vatSettings.types';

export const vatSettingsApi = {
  /**
   * Get public VAT settings (no auth required)
   */
  getPublic: async (): Promise<ApiResponse<VatSettings>> => {
    return await apiClient.get<VatSettings>('/vat-settings');
  },

  /**
   * Get all VAT settings (admin only)
   */
  getAdmin: async (): Promise<ApiResponse<VatSettings>> => {
    return await apiClient.get<VatSettings>('/vat-settings/admin');
  },

  /**
   * Update VAT settings (admin only)
   */
  update: async (data: Partial<VatSettings>): Promise<ApiResponse<VatSettings>> => {
    return await apiClient.put<VatSettings>('/vat-settings/admin', data);
  },
};
