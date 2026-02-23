import apiClient from './apiClient';
import { ApiResponse } from '../types/common.types';
import {
  Currency,
  ExchangeRateStatus,
  ProfitMarginRule,
  PricePreview,
  RefreshResult,
  RecalculateResult,
} from '../types/storeSettings.types';

export const storeSettingsApi = {
  // ─── CURRENCIES ───────────────────────────────────────────────

  getCurrencies: async (): Promise<ApiResponse<Currency[]>> => {
    return await apiClient.get<Currency[]>('/store-settings/currencies');
  },

  createCurrency: async (data: Partial<Currency>): Promise<ApiResponse<Currency>> => {
    return await apiClient.post<Currency>('/store-settings/currencies', data);
  },

  updateCurrency: async (id: string, data: Partial<Currency>): Promise<ApiResponse<Currency>> => {
    return await apiClient.put<Currency>(`/store-settings/currencies/${id}`, data);
  },

  deleteCurrency: async (id: string): Promise<ApiResponse<void>> => {
    return await apiClient.delete<void>(`/store-settings/currencies/${id}`);
  },

  setBaseCurrency: async (id: string): Promise<ApiResponse<Currency>> => {
    return await apiClient.put<Currency>(`/store-settings/currencies/${id}/set-base`, {});
  },

  setDisplayCurrency: async (id: string): Promise<ApiResponse<Currency>> => {
    return await apiClient.put<Currency>(`/store-settings/currencies/${id}/set-display`, {});
  },

  // ─── EXCHANGE RATES ───────────────────────────────────────────

  getExchangeRates: async (): Promise<ApiResponse<ExchangeRateStatus>> => {
    return await apiClient.get<ExchangeRateStatus>('/store-settings/exchange-rates');
  },

  refreshExchangeRates: async (): Promise<ApiResponse<RefreshResult>> => {
    return await apiClient.post<RefreshResult>('/store-settings/exchange-rates/refresh', {});
  },

  getExchangeRateStatus: async (): Promise<ApiResponse<{ lastFetchedAt: string | null; isStale: boolean; rateCount: number }>> => {
    return await apiClient.get('/store-settings/exchange-rates/status');
  },

  // ─── PROFIT MARGIN RULES ─────────────────────────────────────

  getProfitRules: async (): Promise<ApiResponse<ProfitMarginRule[]>> => {
    return await apiClient.get<ProfitMarginRule[]>('/store-settings/profit-rules');
  },

  createProfitRule: async (data: Partial<ProfitMarginRule>): Promise<ApiResponse<ProfitMarginRule>> => {
    return await apiClient.post<ProfitMarginRule>('/store-settings/profit-rules', data);
  },

  updateProfitRule: async (id: string, data: Partial<ProfitMarginRule>): Promise<ApiResponse<ProfitMarginRule>> => {
    return await apiClient.put<ProfitMarginRule>(`/store-settings/profit-rules/${id}`, data);
  },

  deleteProfitRule: async (id: string): Promise<ApiResponse<void>> => {
    return await apiClient.delete<void>(`/store-settings/profit-rules/${id}`);
  },

  previewPrice: async (pcComponentId: string): Promise<ApiResponse<PricePreview>> => {
    return await apiClient.get<PricePreview>(`/store-settings/profit-rules/preview?pcComponentId=${pcComponentId}`);
  },

  recalculateAllPrices: async (): Promise<ApiResponse<RecalculateResult>> => {
    return await apiClient.post<RecalculateResult>('/store-settings/profit-rules/recalculate-all', {});
  },
};
