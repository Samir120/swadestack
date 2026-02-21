import apiClient from './apiClient';
import { Order, CreateOrderData, PaymentSummary, PaymentPhase } from '../types/order.types';
import {
  AdminOrderDetail,
  NotesResponse,
  InternalNote,
  AuditLogResponse,
  EmailHistoryResponse,
  OrderAdjustment,
} from '../types/customer.types';

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

  // Admin order detail
  getAdminDetail: async (orderId: string) => {
    return apiClient.get<AdminOrderDetail>(`/orders/${orderId}/admin-detail`);
  },

  modifyOrder: async (orderId: string, data: {
    items?: Array<{ serviceName: string; serviceDescription?: string; quantity: number; price: number; pcComponentId?: string; pcConfigurationId?: string }>;
    adjustments?: Array<{ type: string; description: string; amount: number }>;
    status?: string;
  }) => {
    return apiClient.put<AdminOrderDetail>(`/orders/${orderId}/modify`, data);
  },

  getAdjustments: async (orderId: string) => {
    return apiClient.get<OrderAdjustment[]>(`/orders/${orderId}/adjustments`);
  },

  deleteAdjustment: async (orderId: string, adjustmentId: string) => {
    return apiClient.delete(`/orders/${orderId}/adjustments/${adjustmentId}`);
  },

  // Order notes
  getOrderNotes: async (orderId: string, page: number = 1) => {
    return apiClient.get<NotesResponse>(`/orders/${orderId}/notes`, { page });
  },

  createOrderNote: async (orderId: string, content: string) => {
    return apiClient.post<InternalNote>(`/orders/${orderId}/notes`, { content });
  },

  updateOrderNote: async (noteId: string, content: string) => {
    return apiClient.put<InternalNote>(`/orders/notes/${noteId}`, { content });
  },

  deleteOrderNote: async (noteId: string) => {
    return apiClient.delete(`/orders/notes/${noteId}`);
  },

  // Order activity (audit logs)
  getOrderActivity: async (orderId: string, page: number = 1) => {
    return apiClient.get<AuditLogResponse>(`/orders/${orderId}/activity`, { page });
  },

  // Order emails
  getOrderEmails: async (orderId: string, page: number = 1) => {
    return apiClient.get<EmailHistoryResponse>(`/orders/${orderId}/emails`, { page });
  },

  sendOrderEmail: async (orderId: string, data: { subject: string; body: string; language?: string }) => {
    return apiClient.post(`/orders/${orderId}/emails/send`, data);
  },

  // Catalog search for adding items to orders
  searchCatalog: async (orderId: string, params: { query?: string; category?: string; page?: number; pageSize?: number }) => {
    return apiClient.get<{ products: any[]; total: number; categories: string[] }>(
      `/orders/${orderId}/catalog/search`,
      params
    );
  },

  // Override edit lock on completed/cancelled orders
  overrideLock: async (orderId: string) => {
    return apiClient.post(`/orders/${orderId}/override-lock`, {});
  },
};
