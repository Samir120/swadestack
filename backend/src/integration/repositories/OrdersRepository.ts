import { BaseDAO } from '../dao/BaseDAO';
import Order, { OrderAttributes, OrderStatus } from '../../models/sequelize/Order';
import OrderItem from '../../models/sequelize/OrderItem';
import Service from '../../models/sequelize/Service';
import { Op } from 'sequelize';

export class OrdersRepository extends BaseDAO<Order> {
  constructor() {
    super(Order);
  }

  /**
   * Generate unique order number
   */
  async generateOrderNumber(): Promise<string> {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substr(2, 5).toUpperCase();
    const orderNumber = `ORD-${timestamp}-${random}`;
    
    // Ensure uniqueness
    const exists = await this.exists({ orderNumber } as any);
    if (exists) {
      return this.generateOrderNumber();
    }
    
    return orderNumber;
  }

  /**
   * Find order with items
   */
  async findByIdWithItems(id: string): Promise<Order | null> {
    return await this.model.findByPk(id, {
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [
            {
              model: Service,
              as: 'service',
            },
          ],
        },
      ],
    });
  }

  /**
   * Find order by order number
   */
  async findByOrderNumber(orderNumber: string): Promise<Order | null> {
    return await this.model.findOne({
      where: { orderNumber },
      include: [
        {
          model: OrderItem,
          as: 'items',
        },
      ],
    });
  }

  /**
   * Find orders by user ID
   */
  async findByUserId(
    userId: string,
    limit?: number,
    offset?: number
  ): Promise<{ orders: Order[]; total: number }> {
    const { count, rows } = await this.model.findAndCountAll({
      where: { userId },
      include: [
        {
          model: OrderItem,
          as: 'items',
        },
      ],
      order: [['createdAt', 'DESC']],
      limit: limit || 20,
      offset: offset || 0,
    });

    return { orders: rows, total: count };
  }

  /**
   * Find all orders with pagination and optional status filter
   */
  async findAllWithItems(
    limit?: number,
    offset?: number,
    status?: OrderStatus
  ): Promise<{ orders: Order[]; total: number }> {
    const where: any = {};
    if (status) {
      where.status = status;
    }

    const { count, rows } = await this.model.findAndCountAll({
      where,
      include: [
        {
          model: OrderItem,
          as: 'items',
        },
      ],
      order: [['createdAt', 'DESC']],
      limit: limit || 50,
      offset: offset || 0,
    });

    return { orders: rows, total: count };
  }

  /**
   * Update order status
   */
  async updateStatus(id: string, status: OrderStatus, paymentId?: string): Promise<Order | null> {
    const order = await this.findById(id);
    if (!order) return null;

    order.status = status;
    if (paymentId) {
      order.paymentId = paymentId;
    }
    await order.save();
    
    return order;
  }

  /**
   * Find orders by date range
   */
  async findByDateRange(
    startDate: Date,
    endDate: Date
  ): Promise<Order[]> {
    return await this.model.findAll({
      where: {
        createdAt: {
          [Op.between]: [startDate, endDate],
        },
      },
      order: [['createdAt', 'DESC']],
    });
  }

  /**
   * Calculate total revenue
   */
  async calculateRevenue(startDate?: Date, endDate?: Date): Promise<number> {
    const where: any = {
      status: 'paid',
    };

    if (startDate && endDate) {
      where.createdAt = {
        [Op.between]: [startDate, endDate],
      };
    }

    const orders = await this.model.findAll({ where });
    const revenue = orders.reduce((sum, order) => sum + parseFloat(order.totalAmount.toString()), 0);
    
    return revenue;
  }

  /**
   * Get order statistics
   */
  async getStatistics(): Promise<{
    total: number;
    pending: number;
    paid: number;
    completed: number;
    cancelled: number;
  }> {
    const [total, pending, paid, completed, cancelled] = await Promise.all([
      this.count(),
      this.count({ status: 'pending' } as any),
      this.count({ status: 'paid' } as any),
      this.count({ status: 'completed' } as any),
      this.count({ status: 'cancelled' } as any),
    ]);

    return { total, pending, paid, completed, cancelled };
  }
}

export default OrdersRepository;
