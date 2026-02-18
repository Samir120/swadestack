import apiClient from './apiClient';
import { Coupon, CouponValidationResult } from '../types/coupon.types';

export const couponsApi = {
  // Public
  validate: async (code: string, orderTotal: number, email: string, items?: { serviceId: string; quantity: number }[]) => {
    return apiClient.post<CouponValidationResult>('/coupons/validate', { code, orderTotal, email, items });
  },

  // Admin
  getAll: async () => {
    return apiClient.get<Coupon[]>('/coupons');
  },

  getById: async (id: string) => {
    return apiClient.get<Coupon>(`/coupons/${id}`);
  },

  create: async (data: Partial<Coupon>) => {
    return apiClient.post<Coupon>('/coupons', data);
  },

  update: async (id: string, data: Partial<Coupon>) => {
    return apiClient.put<Coupon>(`/coupons/${id}`, data);
  },

  delete: async (id: string) => {
    return apiClient.delete(`/coupons/${id}`);
  },

  toggleActive: async (id: string) => {
    return apiClient.patch<Coupon>(`/coupons/${id}/toggle-active`);
  },
};
