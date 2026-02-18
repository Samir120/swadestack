import { BaseDAO } from '../dao/BaseDAO';
import Coupon from '../../models/sequelize/Coupon';
import Order from '../../models/sequelize/Order';
import { Op } from 'sequelize';
import sequelize from '../../config/database';

export class CouponsRepository extends BaseDAO<Coupon> {
  constructor() {
    super(Coupon);
  }

  async findByCode(code: string): Promise<Coupon | null> {
    return await this.model.findOne({
      where: { code: code.toUpperCase() },
    });
  }

  async findAllCoupons(): Promise<Coupon[]> {
    return await this.model.findAll({
      order: [['createdAt', 'DESC']],
    });
  }

  async toggleActive(id: string): Promise<Coupon | null> {
    const coupon = await this.findById(id);
    if (!coupon) return null;

    coupon.isActive = !coupon.isActive;
    await coupon.save();
    return coupon;
  }

  async incrementUsage(id: string): Promise<void> {
    await this.model.increment('currentUses', { where: { id } as any });
  }

  async incrementUsageAndDiscount(id: string, discountAmount: number): Promise<void> {
    await this.model.increment(
      { currentUses: 1, totalDiscountGiven: discountAmount } as any,
      { where: { id } as any }
    );
  }

  async countUsageByEmail(couponId: string, email: string): Promise<number> {
    return await Order.count({
      where: {
        couponId,
        email,
        status: { [Op.notIn]: ['cancelled'] },
      },
    });
  }

  async countCompletedOrdersByEmail(email: string): Promise<number> {
    return await Order.count({
      where: {
        email,
        status: { [Op.notIn]: ['cancelled'] },
      },
    });
  }
}

export default CouponsRepository;
