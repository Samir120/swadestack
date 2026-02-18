import { PaymentPhase, PaymentStatus } from '../sequelize/Payment';

export interface PaymentDTO {
  id: string;
  orderId: string;
  amount: number;
  currency: string;
  phase: PaymentPhase;
  status: PaymentStatus;
  klarnaOrderId?: string;
  failureReason?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePaymentDTO {
  orderId: string;
  amount: number;
  currency: string;
  phase: PaymentPhase;
}

export interface UpdatePaymentStatusDTO {
  status: PaymentStatus;
  klarnaOrderId?: string;
  failureReason?: string;
  metadata?: Record<string, any>;
}

export interface PaymentSummaryDTO {
  orderId: string;
  totalAmount: number;
  currency: string;
  requiresPartialPayment: boolean;
  initialPayment?: PaymentDTO;
  finalPayment?: PaymentDTO;
  nextAction: 'pay_initial' | 'wait_for_ready' | 'pay_final' | 'completed' | 'none';
  amountPaid: number;
  amountRemaining: number;
  canPayFinal: boolean;
}
