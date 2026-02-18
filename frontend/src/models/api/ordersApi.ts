import apiClient from './apiClient';
import { Order, CreateOrderData, PaymentSummary, PaymentPhase } from '../types/order.types';

interface KlarnaCheckoutResponse {
  htmlSnippet: string;
  klarnaOrderId: string;
  paymentId?: string;
}

interface KlarnaConfirmationResponse {
  htmlSnippet: string;
}

export const ordersApi = {
  create: async (data: CreateOrderData) => {
    return apiClient.post<Order>('/orders', data);
  },

  getById: async (id: string) => {
    return apiClient.get<Order>(`/orders/${id}`);
  },

  getByNumber: async (orderNumber: string) => {
    return apiClient.get<Order>(`/orders/number/${orderNumber}`);
  },

  // Payment status
  getPaymentStatus: async (orderId: string) => {
    return apiClient.get<PaymentSummary>(`/orders/${orderId}/payment-status`);
  },

  // Klarna checkout methods
  createKlarnaCheckout: async (orderId: string, phase: PaymentPhase) => {
    return apiClient.post<KlarnaCheckoutResponse>(
      `/orders/${orderId}/klarna-checkout`,
      { phase }
    );
  },

  getKlarnaConfirmation: async (orderId: string) => {
    return apiClient.get<KlarnaConfirmationResponse>(
      `/orders/${orderId}/klarna-confirmation`
    );
  },

  // Payment intent
  createPaymentIntent: async (orderId: string) => {
    return apiClient.post<{ clientSecret: string; paymentIntentId: string }>(
      `/orders/${orderId}/create-payment-intent`, {}
    );
  },

  // Admin methods
  markReadyForFinalPayment: async (orderId: string) => {
    return apiClient.post<Order>(`/orders/${orderId}/mark-ready-final-payment`, {});
  },
};
