import { OrderStatus, PartialPaymentStatus } from '../sequelize/Order';
import { PaymentDTO } from './PaymentDTO';

export interface OrderItemDTO {
  id: string;
  serviceId: string;
  serviceName: string;
  serviceDescription?: string;
  quantity: number;
  price: number;
}

export interface OrderDTO {
  id: string;
  orderNumber: string;
  userId?: string;
  totalAmount: number;
  status: OrderStatus;
  currency: string;
  paymentId?: string;
  email: string;
  firstName: string;
  lastName: string;
  address?: string;
  city?: string;
  postalCode?: string;
  country: string;
  requiresPartialPayment?: boolean;
  partialPaymentStatus?: PartialPaymentStatus;
  readyForFinalPayment?: boolean;
  readyForFinalPaymentAt?: Date;
  couponId?: string;
  couponCode?: string;
  discountAmount?: number;
  notifiedForFinalPayment?: boolean;
  items: OrderItemDTO[];
  payments?: PaymentDTO[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateOrderDTO {
  userId?: string;
  email: string;
  firstName: string;
  lastName: string;
  address?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  paymentMethod?: 'full' | 'partial';
  couponCode?: string;
  items: {
    serviceId: string;
    quantity: number;
  }[];
  pcItems?: {
    preConfiguredPCId: string;
    name: string;
    totalPrice: number;
    configurationSnapshot: any;
  }[];
}

export interface CreateOrderItemDTO {
  orderId: string;
  serviceId: string;
  quantity: number;
  price: number;
  serviceName: string;
  serviceDescription?: string;
}

export interface UpdateOrderStatusDTO {
  status: OrderStatus;
  paymentId?: string;
  skipEmail?: boolean;
}

export interface OrderListDTO {
  orders: OrderDTO[];
  total: number;
  page: number;
  limit: number;
}
