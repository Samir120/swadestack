import { useState } from 'react';
import { ordersApi } from '../models/api/ordersApi';
import { Order, CreateOrderData } from '../models/types/order.types';
import { useVatRate } from '../hooks/useVatRate';
import { netToGross } from '../utils/vat';

/**
 * Orders ViewModel - Business Logic Layer
 * Handles order-related business logic and state management
 * Connects View (Components) to Model (API)
 */

export const useOrdersViewModel = () => {
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const vatRate = useVatRate();

  /**
   * Create a new order
   */
  const createOrder = async (
    orderData: CreateOrderData
  ): Promise<{ success: boolean; order?: Order; error?: string }> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await ordersApi.create(orderData);

      if (response.success && response.data) {
        setCurrentOrder(response.data);
        return { success: true, order: response.data };
      } else {
        setError(response.message || 'Failed to create order');
        return { success: false, error: response.message };
      }
    } catch (err: any) {
      const errorMessage = err.message || 'An error occurred';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Get order by ID
   */
  const getOrderById = async (
    orderId: string
  ): Promise<{ success: boolean; order?: Order; error?: string }> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await ordersApi.getById(orderId);

      if (response.success && response.data) {
        setCurrentOrder(response.data);
        return { success: true, order: response.data };
      } else {
        setError(response.message || 'Order not found');
        return { success: false, error: response.message };
      }
    } catch (err: any) {
      const errorMessage = err.message || 'An error occurred';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Get order by order number
   */
  const getOrderByNumber = async (
    orderNumber: string
  ): Promise<{ success: boolean; order?: Order; error?: string }> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await ordersApi.getByNumber(orderNumber);

      if (response.success && response.data) {
        setCurrentOrder(response.data);
        return { success: true, order: response.data };
      } else {
        setError(response.message || 'Order not found');
        return { success: false, error: response.message };
      }
    } catch (err: any) {
      const errorMessage = err.message || 'An error occurred';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Create payment intent for order
   */
  const createPaymentIntent = async (
    orderId: string
  ): Promise<{
    success: boolean;
    clientSecret?: string;
    paymentIntentId?: string;
    error?: string;
  }> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await ordersApi.createPaymentIntent(orderId);

      if (response.success && response.data) {
        return {
          success: true,
          clientSecret: response.data.clientSecret,
          paymentIntentId: response.data.paymentIntentId,
        };
      } else {
        setError(response.message || 'Failed to create payment intent');
        return { success: false, error: response.message };
      }
    } catch (err: any) {
      const errorMessage = err.message || 'An error occurred';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Format order date
   */
  const formatOrderDate = (order: Order): string => {
    const date = new Date(order.createdAt);
    return new Intl.DateTimeFormat('sv-SE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  /**
   * Format order total
   */
  const formatOrderTotal = (order: Order): string => {
    const formatter = new Intl.NumberFormat('sv-SE', {
      style: 'currency',
      currency: order.currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
    return formatter.format(netToGross(order.totalAmount, vatRate));
  };

  /**
   * Get order status display text
   */
  const getStatusText = (
    status: string,
    language: 'en' | 'sv'
  ): string => {
    const statusTexts: Record<string, { en: string; sv: string }> = {
      pending: { en: 'Pending', sv: 'Väntande' },
      paid: { en: 'Paid', sv: 'Betald' },
      completed: { en: 'Completed', sv: 'Slutförd' },
      cancelled: { en: 'Cancelled', sv: 'Avbruten' },
    };
    return statusTexts[status]?.[language] || status;
  };

  /**
   * Get order status color class
   */
  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      pending: 'text-yellow-400 bg-yellow-900/30',
      paid: 'text-green-400 bg-green-900/30',
      completed: 'text-blue-400 bg-blue-900/30',
      cancelled: 'text-red-400 bg-red-900/30',
    };
    return colors[status] || 'text-neutral-400 bg-surface-800';
  };

  /**
   * Calculate order item count
   */
  const getItemCount = (order: Order): number => {
    return order.items.reduce((sum, item) => sum + item.quantity, 0);
  };

  /**
   * Validate order data before submission
   */
  const validateOrderData = (
    data: CreateOrderData
  ): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.push('Valid email is required');
    }
    if (!data.firstName || data.firstName.trim().length < 2) {
      errors.push('First name must be at least 2 characters');
    }
    if (!data.lastName || data.lastName.trim().length < 2) {
      errors.push('Last name must be at least 2 characters');
    }
    if (!data.items || data.items.length === 0) {
      errors.push('Order must contain at least one item');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  };

  /**
   * Clear current order
   */
  const clearOrder = () => {
    setCurrentOrder(null);
    setError(null);
  };

  return {
    // State
    currentOrder,
    isLoading,
    error,

    // Actions
    createOrder,
    getOrderById,
    getOrderByNumber,
    createPaymentIntent,
    clearOrder,

    // Business Logic
    formatOrderDate,
    formatOrderTotal,
    getStatusText,
    getStatusColor,
    getItemCount,
    validateOrderData,
  };
};

export default useOrdersViewModel;
