import { BaseDAO } from '../dao/BaseDAO';
import Payment, { PaymentAttributes, PaymentPhase, PaymentStatus } from '../../models/sequelize/Payment';
import Order from '../../models/sequelize/Order';

export class PaymentRepository extends BaseDAO<Payment> {
  constructor() {
    super(Payment);
  }

  /**
   * Find all payments for an order
   */
  async findByOrderId(orderId: string): Promise<Payment[]> {
    return await this.model.findAll({
      where: { orderId },
      order: [['createdAt', 'ASC']],
    });
  }

  /**
   * Find payment by Klarna order ID
   */
  async findByKlarnaOrderId(klarnaOrderId: string): Promise<Payment | null> {
    return await this.model.findOne({
      where: { klarnaOrderId },
    });
  }

  /**
   * Find pending initial payment for an order
   */
  async findPendingInitialPayment(orderId: string): Promise<Payment | null> {
    return await this.model.findOne({
      where: {
        orderId,
        phase: 'initial',
        status: 'pending',
      },
    });
  }

  /**
   * Find pending final payment for an order
   */
  async findPendingFinalPayment(orderId: string): Promise<Payment | null> {
    return await this.model.findOne({
      where: {
        orderId,
        phase: 'final',
        status: 'pending',
      },
    });
  }

  /**
   * Get payments by phase for an order
   */
  async getPaymentsByPhase(orderId: string, phase: PaymentPhase): Promise<Payment[]> {
    return await this.model.findAll({
      where: {
        orderId,
        phase,
      },
      order: [['createdAt', 'ASC']],
    });
  }

  /**
   * Update payment status and metadata
   */
  async updatePaymentStatus(
    id: string,
    status: PaymentStatus,
    metadata?: Record<string, any>
  ): Promise<Payment | null> {
    const payment = await this.findById(id);
    if (!payment) return null;

    payment.status = status;
    if (metadata) {
      payment.metadata = { ...payment.metadata, ...metadata };
    }
    await payment.save();

    return payment;
  }

  /**
   * Update payment with Klarna order ID
   */
  async updateKlarnaOrderId(
    id: string,
    klarnaOrderId: string
  ): Promise<Payment | null> {
    const payment = await this.findById(id);
    if (!payment) return null;

    payment.klarnaOrderId = klarnaOrderId;
    payment.status = 'processing';
    await payment.save();

    return payment;
  }

  /**
   * Mark payment as failed with reason
   */
  async markAsFailed(
    id: string,
    failureReason: string
  ): Promise<Payment | null> {
    const payment = await this.findById(id);
    if (!payment) return null;

    payment.status = 'failed';
    payment.failureReason = failureReason;
    await payment.save();

    return payment;
  }

  /**
   * Find all payments with their related orders
   */
  async findAllWithOrders(
    limit?: number,
    offset?: number
  ): Promise<{ payments: Payment[]; total: number }> {
    const { count, rows } = await this.model.findAndCountAll({
      include: [
        {
          model: Order,
          as: 'order',
        },
      ],
      order: [['createdAt', 'DESC']],
      limit: limit || 50,
      offset: offset || 0,
    });

    return { payments: rows, total: count };
  }
}

export default PaymentRepository;
