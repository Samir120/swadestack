import apiClient from './apiClient';
import { ApiResponse } from '../types/common.types';
import { CompanyLegalSettings } from '../types/legalSettings.types';

export const legalSettingsApi = {
  /**
   * Get public legal settings (no auth required)
   */
  getPublic: async (): Promise<ApiResponse<CompanyLegalSettings>> => {
    return await apiClient.get<CompanyLegalSettings>('/legal-settings');
  },

  /**
   * Get all legal settings (admin only)
   */
  getAdmin: async (): Promise<ApiResponse<CompanyLegalSettings>> => {
    return await apiClient.get<CompanyLegalSettings>('/legal-settings/admin');
  },

  /**
   * Update legal settings (admin only)
   */
  update: async (data: Partial<CompanyLegalSettings>): Promise<ApiResponse<CompanyLegalSettings>> => {
    return await apiClient.put<CompanyLegalSettings>('/legal-settings/admin', data);
  },
};
