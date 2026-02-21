import PaymentRepository from '../integration/repositories/PaymentRepository';
import OrdersRepository from '../integration/repositories/OrdersRepository';
import Payment from '../models/sequelize/Payment';
import { PaymentPhase, PaymentStatus } from '../models/sequelize/Payment';
import { PaymentDTO, PaymentSummaryDTO } from '../models/dto/PaymentDTO';
import { OrderDTO } from '../models/dto/OrderDTO';
import { OrderEmailService } from './OrderEmailService';
import VatSettingsService from './VatSettingsService';

/**
 * Partial Payment Service - Business Logic for Two-Phase Payments
 * Handles partial payment initialization, validation, and lifecycle management
 */
export class PartialPaymentService {
  private paymentRepository: PaymentRepository;
  private ordersRepository: OrdersRepository;
  private orderEmailService: OrderEmailService;
  private vatSettingsService: VatSettingsService;

  constructor() {
    this.paymentRepository = new PaymentRepository();
    this.ordersRepository = new OrdersRepository();
    this.orderEmailService = new OrderEmailService();
    this.vatSettingsService = new VatSettingsService();
  }

  /**
   * Check if order qualifies for partial payment (>10,000 SEK)
   */
  requiresPartialPayment(totalAmount: number, currency: string): boolean {
    // Convert to SEK if needed (for now, assume SEK)
    const amountInSEK = currency === 'SEK' ? totalAmount : totalAmount;
    return amountInSEK > 10000;
  }

  /**
   * Calculate payment amounts (50% each)
   */
  private calculatePaymentAmounts(totalAmount: number): { initial: number; final: number } {
    const initial = Math.round(totalAmount * 50) / 100; // 50% rounded to 2 decimals
    const final = Math.round((totalAmount - initial) * 100) / 100; // Remaining amount
    return { initial, final };
  }

  /**
   * Initialize partial payment for an order
   * Creates two Payment records: initial (50%) and final (50%)
   */
  async initializePartialPayment(orderId: string): Promise<void> {
    // Get order
    const order = await this.ordersRepository.findById(orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    // Calculate payment amounts
    const { initial, final } = this.calculatePaymentAmounts(order.totalAmount);

    // Create initial payment record
    await Payment.create({
      orderId: order.id,
      amount: initial,
      currency: order.currency,
      phase: 'initial',
      status: 'pending',
    });

    // Create final payment record
    await Payment.create({
      orderId: order.id,
      amount: final,
      currency: order.currency,
      phase: 'final',
      status: 'pending',
    });

    // Update order flags
    order.requiresPartialPayment = true;
    order.partialPaymentStatus = 'initial_pending';
    await order.save();

    console.log(`✓ Initialized partial payment for order ${order.orderNumber} (${initial} + ${final} ${order.currency})`);
  }

  /**
   * Mark order as ready for final payment (Admin function)
   */
  async markReadyForFinalPayment(orderId: string, adminUserId: string): Promise<OrderDTO> {
    // Get order with payments
    const order = await this.ordersRepository.findById(orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    // Validate order status
    if (order.status !== 'partial_paid') {
      throw new Error('Order must be in partial_paid status to mark ready for final payment');
    }

    // Get payments
    const payments = await this.paymentRepository.findByOrderId(orderId);
    const initialPayment = payments.find(p => p.phase === 'initial');

    if (!initialPayment || initialPayment.status !== 'succeeded') {
      throw new Error('Initial payment must be completed before marking ready for final payment');
    }

    // Update order
    order.readyForFinalPayment = true;
    order.readyForFinalPaymentAt = new Date();
    order.status = 'awaiting_final';
    order.partialPaymentStatus = 'final_pending';
    await order.save();

    // Update final payment metadata
    const finalPayment = payments.find(p => p.phase === 'final');
    if (finalPayment) {
      await this.paymentRepository.updatePaymentStatus(finalPayment.id, finalPayment.status, {
        markedReadyBy: adminUserId,
        markedReadyAt: new Date().toISOString(),
      });
    }

    console.log(`✓ Order ${order.orderNumber} marked ready for final payment by admin ${adminUserId}`);

    // Send notification to customer
    try {
      const customerName = `${order.firstName} ${order.lastName}`;
      const language = 'en'; // You can add language preference to order model if needed
      const finalPayment = payments.find(p => p.phase === 'final');
      const vatRate = await this.vatSettingsService.getCurrentRate();
      const grossFinalAmount = finalPayment
        ? (Number(finalPayment.amount) * (1 + vatRate)).toLocaleString('sv-SE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        : null;
      const additionalInfo = grossFinalAmount
        ? `Your final payment of ${grossFinalAmount} ${order.currency} is now ready. Please complete the payment at your earliest convenience.`
        : 'Your order is ready for final payment. Please complete the payment at your earliest convenience.';

      await this.orderEmailService.sendOrderStatusUpdate(
        order.orderNumber,
        order.email,
        customerName,
        'awaiting_final',
        'partial_paid',
        language,
        additionalInfo
      );

      // Mark as notified
      order.notifiedForFinalPayment = true;
      await order.save();

      console.log(`✓ Final payment notification sent to ${order.email}`);
    } catch (error) {
      console.error('Failed to send final payment notification:', error);
      // Don't fail the operation if email fails
    }

    return this.mapOrderToDTO(order, payments);
  }

  /**
   * Get payment summary for an order
   */
  async getPaymentSummary(orderId: string): Promise<PaymentSummaryDTO> {
    const order = await this.ordersRepository.findById(orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    // If order is cancelled or completed, return minimal summary
    if (order.status === 'cancelled' || order.status === 'completed') {
      return {
        orderId: order.id,
        totalAmount: parseFloat(order.totalAmount.toString()),
        currency: order.currency,
        requiresPartialPayment: false, // Hide partial payment for cancelled/completed orders
        initialPayment: undefined,
        finalPayment: undefined,
        nextAction: order.status === 'completed' ? 'completed' : 'none',
        amountPaid: order.status === 'completed' ? parseFloat(order.totalAmount.toString()) : 0,
        amountRemaining: 0,
        canPayFinal: false,
      };
    }

    const payments = await this.paymentRepository.findByOrderId(orderId);
    const initialPayment = payments.find(p => p.phase === 'initial');
    const finalPayment = payments.find(p => p.phase === 'final');

    // Calculate amounts
    let amountPaid = 0;
    if (initialPayment?.status === 'succeeded') {
      amountPaid += parseFloat(initialPayment.amount.toString());
    }
    if (finalPayment?.status === 'succeeded') {
      amountPaid += parseFloat(finalPayment.amount.toString());
    }

    const amountRemaining = parseFloat(order.totalAmount.toString()) - amountPaid;

    // Determine next action
    let nextAction: 'pay_initial' | 'wait_for_ready' | 'pay_final' | 'completed' | 'none' = 'none';
    let canPayFinal = false;

    if (!order.requiresPartialPayment) {
      nextAction = order.status === 'paid' ? 'completed' : 'none';
    } else if (initialPayment?.status === 'pending') {
      nextAction = 'pay_initial';
    } else if (initialPayment?.status === 'succeeded' && !order.readyForFinalPayment) {
      nextAction = 'wait_for_ready';
    } else if (order.readyForFinalPayment && finalPayment?.status === 'pending') {
      nextAction = 'pay_final';
      canPayFinal = true;
    } else if (finalPayment?.status === 'succeeded') {
      nextAction = 'completed';
    }

    return {
      orderId: order.id,
      totalAmount: parseFloat(order.totalAmount.toString()),
      currency: order.currency,
      requiresPartialPayment: order.requiresPartialPayment || false,
      initialPayment: initialPayment ? this.mapPaymentToDTO(initialPayment) : undefined,
      finalPayment: finalPayment ? this.mapPaymentToDTO(finalPayment) : undefined,
      nextAction,
      amountPaid,
      amountRemaining,
      canPayFinal,
    };
  }

  /**
   * Validate payment phase is valid for order
   */
  async validatePaymentPhase(orderId: string, phase: PaymentPhase): Promise<{ valid: boolean; reason?: string }> {
    const order = await this.ordersRepository.findById(orderId);
    if (!order) {
      return { valid: false, reason: 'Order not found' };
    }

    const payments = await this.paymentRepository.findByOrderId(orderId);

    if (phase === 'initial') {
      // Can pay initial if order is pending and initial payment is pending
      if (order.status !== 'pending') {
        return { valid: false, reason: 'Order is not in pending status' };
      }
      const initialPayment = payments.find(p => p.phase === 'initial');
      if (!initialPayment || initialPayment.status !== 'pending') {
        return { valid: false, reason: 'Initial payment already processed or not found' };
      }
      return { valid: true };
    }

    if (phase === 'final') {
      // Can pay final if order is awaiting_final and readyForFinalPayment is true
      if (order.status !== 'awaiting_final') {
        return { valid: false, reason: 'Order not ready for final payment' };
      }
      if (!order.readyForFinalPayment) {
        return { valid: false, reason: 'Order not marked ready by admin' };
      }
      const initialPayment = payments.find(p => p.phase === 'initial');
      if (!initialPayment || initialPayment.status !== 'succeeded') {
        return { valid: false, reason: 'Initial payment not completed' };
      }
      const finalPayment = payments.find(p => p.phase === 'final');
      if (!finalPayment || finalPayment.status !== 'pending') {
        return { valid: false, reason: 'Final payment not available' };
      }
      return { valid: true };
    }

    if (phase === 'full') {
      // Full payment for non-partial orders
      if (order.requiresPartialPayment) {
        return { valid: false, reason: 'Order requires partial payment' };
      }
      if (order.status !== 'pending') {
        return { valid: false, reason: 'Order already paid or cancelled' };
      }
      return { valid: true };
    }

    if (phase === 'additional') {
      // Additional payment for balance due after order modification
      const additionalPayment = payments.find(p => p.phase === 'additional' && p.status === 'pending');
      if (!additionalPayment) {
        return { valid: false, reason: 'No pending additional payment found' };
      }
      return { valid: true };
    }

    return { valid: false, reason: 'Invalid payment phase' };
  }

  // Helper methods

  private mapPaymentToDTO(payment: Payment): PaymentDTO {
    return {
      id: payment.id,
      orderId: payment.orderId,
      amount: parseFloat(payment.amount.toString()),
      currency: payment.currency,
      phase: payment.phase,
      status: payment.status,
      klarnaOrderId: payment.klarnaOrderId,
      failureReason: payment.failureReason,
      metadata: payment.metadata,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
    };
  }

  private mapOrderToDTO(order: any, payments: Payment[]): OrderDTO {
    return {
      id: order.id,
      orderNumber: order.orderNumber,
      userId: order.userId,
      totalAmount: parseFloat(order.totalAmount),
      status: order.status,
      currency: order.currency,
      paymentId: order.paymentId,
      email: order.email,
      firstName: order.firstName,
      lastName: order.lastName,
      address: order.address,
      city: order.city,
      postalCode: order.postalCode,
      country: order.country,
      requiresPartialPayment: order.requiresPartialPayment,
      partialPaymentStatus: order.partialPaymentStatus,
      readyForFinalPayment: order.readyForFinalPayment,
      readyForFinalPaymentAt: order.readyForFinalPaymentAt,
      notifiedForFinalPayment: order.notifiedForFinalPayment,
      items: order.items || [],
      payments: payments.map(p => this.mapPaymentToDTO(p)),
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
  }
}

export default PartialPaymentService;
