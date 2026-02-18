import Order from '../models/sequelize/Order';
import OrderItem from '../models/sequelize/OrderItem';
import { Op } from 'sequelize';
import OrdersService from './OrdersService';

/**
 * User Orders Service
 * Handles user order tracking and history
 */
export class UserOrdersService {
  private ordersService: OrdersService;

  constructor() {
    this.ordersService = new OrdersService();
  }
  /**
   * Get all orders for a user
   */
  async getUserOrders(userId: string, options?: {
    status?: string;
    limit?: number;
    offset?: number;
  }) {
    const where: any = { userId };

    if (options?.status) {
      where.status = options.status;
    }

    const { rows: orders, count } = await Order.findAndCountAll({
      where,
      include: [
        {
          model: OrderItem,
          as: 'items',
        },
      ],
      order: [['createdAt', 'DESC']],
      limit: options?.limit || 20,
      offset: options?.offset || 0,
    });

    return {
      orders,
      total: count,
      page: Math.floor((options?.offset || 0) / (options?.limit || 20)) + 1,
      pages: Math.ceil(count / (options?.limit || 20)),
    };
  }

  /**
   * Get a single order by ID
   */
  async getOrderById(userId: string, orderId: string) {
    const order = await Order.findOne({
      where: { id: orderId, userId },
      include: [
        {
          model: OrderItem,
          as: 'items',
        },
      ],
    });

    if (!order) {
      throw new Error('Order not found');
    }

    return order;
  }

  /**
   * Get order by order number
   */
  async getOrderByNumber(userId: string, orderNumber: string) {
    const order = await Order.findOne({
      where: { orderNumber, userId },
      include: [
        {
          model: OrderItem,
          as: 'items',
        },
      ],
    });

    if (!order) {
      throw new Error('Order not found');
    }

    return order;
  }

  /**
   * Get order statistics for user
   */
  async getOrderStatistics(userId: string) {
    const orders = await Order.findAll({
      where: { userId },
      attributes: ['status', 'totalAmount', 'createdAt'],
    });

    const stats = {
      totalOrders: orders.length,
      totalSpent: orders.reduce((sum, order) => sum + Number(order.totalAmount), 0),
      byStatus: {
        pending: orders.filter((o) => o.status === 'pending').length,
        paid: orders.filter((o) => o.status === 'paid').length,
        completed: orders.filter((o) => o.status === 'completed').length,
        cancelled: orders.filter((o) => o.status === 'cancelled').length,
      },
      recentOrders: orders.slice(0, 5).map((o) => ({
        id: o.id,
        orderNumber: (o as any).orderNumber,
        status: o.status,
        total: parseFloat(o.totalAmount.toString()),
        date: o.createdAt,
      })),
    };

    return stats;
  }

  /**
   * Cancel an order (only if pending)
   */
  async cancelOrder(userId: string, orderId: string) {
    // First verify the order belongs to the user
    const order = await Order.findOne({
      where: { id: orderId, userId },
    });

    if (!order) {
      throw new Error('Order not found');
    }

    // Use OrdersService.cancelOrder to ensure proper business logic,
    // email notifications, and layered architecture compliance
    const cancelledOrder = await this.ordersService.cancelOrder(orderId);

    if (!cancelledOrder) {
      throw new Error('Failed to cancel order');
    }

    return cancelledOrder;
  }
}

export default UserOrdersService;
