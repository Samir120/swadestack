export type OrderStatus = 'pending' | 'partial_paid' | 'awaiting_final' | 'paid' | 'cancelled' | 'completed';

export type PartialPaymentStatus = 'initial_pending' | 'initial_paid' | 'final_pending' | 'full_paid';

export type PaymentPhase = 'initial' | 'final' | 'full';

export type PaymentStatus = 'pending' | 'processing' | 'succeeded' | 'failed' | 'cancelled';

export interface OrderItem {
  id: string;
  serviceId: string;
  serviceName: string;
  quantity: number;
  price: number;
}

export interface Payment {
  id: string;
  orderId: string;
  amount: number;
  currency: string;
  phase: PaymentPhase;
  status: PaymentStatus;
  klarnaOrderId?: string;
  failureReason?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentSummary {
  orderId: string;
  totalAmount: number;
  currency: string;
  requiresPartialPayment: boolean;
  initialPayment?: Payment;
  finalPayment?: Payment;
  nextAction: 'pay_initial' | 'wait_for_ready' | 'pay_final' | 'completed' | 'none';
  amountPaid: number;
  amountRemaining: number;
  canPayFinal: boolean;
}

export interface Order {
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
  readyForFinalPaymentAt?: string;
  couponId?: string;
  couponCode?: string;
  discountAmount?: number;
  notifiedForFinalPayment?: boolean;
  items: OrderItem[];
  payments?: Payment[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderData {
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
}
