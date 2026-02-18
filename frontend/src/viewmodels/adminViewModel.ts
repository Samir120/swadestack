import { useState } from 'react';
import apiClient from '../models/api/apiClient';

/**
 * Admin ViewModel - Business Logic for Admin Operations
 * Handles CRUD operations for admin dashboard
 */

export const useAdminViewModel = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ==================== PORTFOLIO MANAGEMENT ====================

  const createPortfolioItem = async (data: any) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.post('/portfolio', data);
      if (response.success) {
        return { success: true, data: response.data };
      }
      throw new Error(response.message);
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  const updatePortfolioItem = async (id: string, data: any) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.put(`/portfolio/${id}`, data);
      if (response.success) {
        return { success: true, data: response.data };
      }
      throw new Error(response.message);
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  const deletePortfolioItem = async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.delete(`/portfolio/${id}`);
      if (response.success) {
        return { success: true };
      }
      throw new Error(response.message);
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  const togglePortfolioFeatured = async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.patch(`/portfolio/${id}/toggle-featured`);
      if (response.success) {
        return { success: true, data: response.data };
      }
      throw new Error(response.message);
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  // ==================== SERVICES MANAGEMENT ====================

  const createService = async (data: any) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.post('/services', data);
      if (response.success) {
        return { success: true, data: response.data };
      }
      throw new Error(response.message);
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  const updateService = async (id: string, data: any) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.put(`/services/${id}`, data);
      if (response.success) {
        return { success: true, data: response.data };
      }
      throw new Error(response.message);
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  const deleteService = async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.delete(`/services/${id}`);
      if (response.success) {
        return { success: true };
      }
      throw new Error(response.message);
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  const toggleServiceActive = async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.patch(`/services/${id}/toggle-active`);
      if (response.success) {
        return { success: true, data: response.data };
      }
      throw new Error(response.message);
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  // ==================== BANNERS MANAGEMENT ====================

  const createBanner = async (data: any) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.post('/banners', data);
      if (response.success) {
        return { success: true, data: response.data };
      }
      throw new Error(response.message);
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  const updateBanner = async (id: string, data: any) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.put(`/banners/${id}`, data);
      if (response.success) {
        return { success: true, data: response.data };
      }
      throw new Error(response.message);
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  const deleteBanner = async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.delete(`/banners/${id}`);
      if (response.success) {
        return { success: true };
      }
      throw new Error(response.message);
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  const toggleBannerActive = async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.patch(`/banners/${id}/toggle-active`);
      if (response.success) {
        return { success: true, data: response.data };
      }
      throw new Error(response.message);
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  // ==================== ORDERS MANAGEMENT ====================

  const getAllOrders = async (page = 1, limit = 50, status?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.get('/orders', { page, limit, status });
      if (response.success) {
        return { success: true, data: response.data };
      }
      throw new Error(response.message);
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  const updateOrderStatus = async (id: string, status: string, paymentId?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.patch(`/orders/${id}/status`, {
        status,
        paymentId,
      });
      if (response.success) {
        return { success: true, data: response.data };
      }
      throw new Error(response.message);
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  const getOrderStatistics = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.get('/orders/stats/summary');
      if (response.success) {
        return { success: true, data: response.data };
      }
      throw new Error(response.message);
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    // Portfolio
    createPortfolioItem,
    updatePortfolioItem,
    deletePortfolioItem,
    togglePortfolioFeatured,
    // Services
    createService,
    updateService,
    deleteService,
    toggleServiceActive,
    // Banners
    createBanner,
    updateBanner,
    deleteBanner,
    toggleBannerActive,
    // Orders
    getAllOrders,
    updateOrderStatus,
    getOrderStatistics,
  };
};

export default useAdminViewModel;
