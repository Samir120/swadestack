import { BaseDAO } from '../dao/BaseDAO';
import OrderAdjustment from '../../models/sequelize/OrderAdjustment';

export class OrderAdjustmentRepository extends BaseDAO<OrderAdjustment> {
  constructor() {
    super(OrderAdjustment);
  }

  async findByOrderId(orderId: string): Promise<OrderAdjustment[]> {
    return await this.findAll({
      where: { orderId } as any,
      order: [['createdAt', 'DESC']],
    });
  }

  async createAdjustment(data: {
    orderId: string;
    type: 'discount' | 'fee' | 'correction' | 'refund';
    description: string;
    amount: number;
    adminUserId: string;
    adminUserName: string;
  }): Promise<OrderAdjustment> {
    return await this.create(data);
  }

  async deleteAdjustment(id: string): Promise<boolean> {
    const count = await this.delete(id);
    return count > 0;
  }

  async getTotalAdjustments(orderId: string): Promise<number> {
    const adjustments = await this.findByOrderId(orderId);
    return adjustments.reduce((sum, adj) => sum + Number(adj.amount), 0);
  }
}

export default OrderAdjustmentRepository;
