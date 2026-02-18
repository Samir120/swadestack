import CouponsRepository from '../integration/repositories/CouponsRepository';
import {
  CouponDTO,
  CreateCouponDTO,
  UpdateCouponDTO,
  CouponValidationResult,
  CartItemContext,
} from '../models/dto/CouponDTO';
import { ApplicableTo } from '../models/sequelize/Coupon';

export class CouponsService {
  private couponsRepository: CouponsRepository;

  constructor() {
    this.couponsRepository = new CouponsRepository();
  }

  /**
   * Validate coupon for checkout.
   * @param cartItems - When provided, enables applicableTo filtering and per-item discount calculation.
   *                     When omitted (e.g. from the public validate endpoint), applicableTo checks are skipped.
   * @param existingCouponId - If another coupon is already applied, used to check combinable constraint.
   */
  async validateCoupon(
    code: string,
    orderTotal: number,
    email: string,
    cartItems?: CartItemContext[],
    existingCouponId?: string
  ): Promise<CouponValidationResult> {
    const coupon = await this.couponsRepository.findByCode(code);

    if (!coupon) {
      return { valid: false, error: 'Invalid coupon code' };
    }

    if (!coupon.isActive) {
      return { valid: false, error: 'This coupon is no longer active' };
    }

    // Check date validity
    const now = new Date();
    if (coupon.validFrom && now < new Date(coupon.validFrom)) {
      return { valid: false, error: 'This coupon is not yet valid' };
    }
    if (coupon.validUntil && now > new Date(coupon.validUntil)) {
      return { valid: false, error: 'This coupon has expired' };
    }

    // Check total usage limit
    if (coupon.maxUses != null && coupon.currentUses >= coupon.maxUses) {
      return { valid: false, error: 'This coupon has reached its usage limit' };
    }

    // Check per-user usage limit
    if (coupon.maxUsesPerUser != null) {
      const userUsage = await this.couponsRepository.countUsageByEmail(coupon.id, email);
      if (userUsage >= coupon.maxUsesPerUser) {
        return { valid: false, error: 'You have already used this coupon the maximum number of times' };
      }
    }

    // Check first order only
    if (coupon.firstOrderOnly) {
      const previousOrders = await this.couponsRepository.countCompletedOrdersByEmail(email);
      if (previousOrders > 0) {
        return { valid: false, error: 'This coupon is only available for first-time customers' };
      }
    }

    // Check combinable constraint
    if (!coupon.combinable && existingCouponId && existingCouponId !== coupon.id) {
      return { valid: false, error: 'This coupon cannot be combined with other offers' };
    }

    // Check minimum order amount
    const minimumAmount = coupon.minimumOrderAmount != null
      ? parseFloat(coupon.minimumOrderAmount.toString())
      : null;
    if (minimumAmount != null && orderTotal < minimumAmount) {
      return { valid: false, error: `Minimum order amount is ${minimumAmount} SEK` };
    }

    // Determine applicable total based on applicableTo setting
    let applicableTotal = orderTotal;
    if (cartItems && cartItems.length > 0 && coupon.applicableTo !== 'all') {
      const { matchingTotal, allMatch } = this.calculateApplicableTotal(coupon.applicableTo, coupon.applicableCategoryIds, cartItems);
      if (matchingTotal <= 0) {
        return { valid: false, error: 'This coupon is not applicable to the items in your cart' };
      }
      if (!allMatch) {
        return { valid: false, error: 'This coupon can only be applied when all items in your cart belong to the eligible category' };
      }
      applicableTotal = matchingTotal;
    }

    // Calculate discount
    const discountValue = parseFloat(coupon.discountValue.toString());
    let discountAmount: number;

    if (coupon.discountType === 'percentage') {
      discountAmount = Math.round((applicableTotal * discountValue / 100) * 100) / 100;
      // Apply maxDiscountAmount cap for percentage coupons
      if (coupon.maxDiscountAmount != null) {
        const maxCap = parseFloat(coupon.maxDiscountAmount.toString());
        discountAmount = Math.min(discountAmount, maxCap);
      }
      // Cap at applicable total
      discountAmount = Math.min(discountAmount, applicableTotal);
    } else {
      // fixed_amount
      discountAmount = Math.min(discountValue, applicableTotal);
    }

    // Never exceed the full order total
    discountAmount = Math.min(discountAmount, orderTotal);

    const maxDiscountAmount = coupon.maxDiscountAmount != null
      ? parseFloat(coupon.maxDiscountAmount.toString())
      : undefined;

    return {
      valid: true,
      couponId: coupon.id,
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue,
      discountAmount,
      maxDiscountAmount,
      applicableTo: coupon.applicableTo,
    };
  }

  /**
   * Calculate the total amount for items that match the coupon's applicableTo filter.
   * Returns both the matching total and whether ALL cart items matched.
   */
  private calculateApplicableTotal(
    applicableTo: ApplicableTo,
    applicableCategoryIds: string | undefined,
    cartItems: CartItemContext[]
  ): { matchingTotal: number; allMatch: boolean } {
    let matchingItems: CartItemContext[];

    switch (applicableTo) {
      case 'services':
        matchingItems = cartItems.filter(item => !item.isGamingPC);
        break;
      case 'gaming_pcs':
        matchingItems = cartItems.filter(item => item.isGamingPC === true);
        break;
      case 'specific_categories': {
        if (!applicableCategoryIds) return { matchingTotal: 0, allMatch: false };
        const categoryIds = applicableCategoryIds.split(',').map(id => id.trim()).filter(Boolean);
        matchingItems = cartItems.filter(
          item => item.serviceCategoryId && categoryIds.includes(item.serviceCategoryId)
        );
        break;
      }
      default:
        matchingItems = cartItems;
    }

    const matchingTotal = matchingItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const allMatch = matchingItems.length === cartItems.length;
    return { matchingTotal, allMatch };
  }

  async getAll(): Promise<CouponDTO[]> {
    const coupons = await this.couponsRepository.findAllCoupons();
    return coupons.map(this.mapToDTO);
  }

  async getById(id: string): Promise<CouponDTO | null> {
    const coupon = await this.couponsRepository.findById(id);
    return coupon ? this.mapToDTO(coupon) : null;
  }

  async create(data: CreateCouponDTO): Promise<CouponDTO> {
    // Normalize code to uppercase
    const normalizedData = { ...data, code: data.code.toUpperCase() };
    this.validateCouponData(normalizedData);
    const coupon = await this.couponsRepository.create(normalizedData);
    return this.mapToDTO(coupon);
  }

  async update(id: string, data: UpdateCouponDTO): Promise<CouponDTO | null> {
    const existing = await this.couponsRepository.findById(id);
    if (!existing) return null;

    const normalizedData = data.code ? { ...data, code: data.code.toUpperCase() } : data;
    if (normalizedData.code || normalizedData.discountType || normalizedData.discountValue != null) {
      this.validateCouponData({ ...existing.toJSON(), ...normalizedData } as any);
    }

    const [, updatedItems] = await this.couponsRepository.update(id, normalizedData);
    return updatedItems[0] ? this.mapToDTO(updatedItems[0]) : null;
  }

  async delete(id: string): Promise<boolean> {
    const deleted = await this.couponsRepository.delete(id);
    return deleted > 0;
  }

  async toggleActive(id: string): Promise<CouponDTO | null> {
    const coupon = await this.couponsRepository.toggleActive(id);
    return coupon ? this.mapToDTO(coupon) : null;
  }

  async incrementUsage(couponId: string, discountAmount: number): Promise<void> {
    await this.couponsRepository.incrementUsageAndDiscount(couponId, discountAmount);
  }

  private mapToDTO(coupon: any): CouponDTO {
    return {
      id: coupon.id,
      code: coupon.code,
      description: coupon.description,
      discountType: coupon.discountType,
      discountValue: parseFloat(coupon.discountValue),
      minimumOrderAmount: coupon.minimumOrderAmount != null ? parseFloat(coupon.minimumOrderAmount) : undefined,
      maxDiscountAmount: coupon.maxDiscountAmount != null ? parseFloat(coupon.maxDiscountAmount) : undefined,
      maxUses: coupon.maxUses,
      maxUsesPerUser: coupon.maxUsesPerUser,
      currentUses: coupon.currentUses,
      totalDiscountGiven: coupon.totalDiscountGiven != null ? parseFloat(coupon.totalDiscountGiven) : 0,
      applicableTo: coupon.applicableTo || 'all',
      applicableCategoryIds: coupon.applicableCategoryIds,
      firstOrderOnly: coupon.firstOrderOnly || false,
      combinable: coupon.combinable !== false,
      validFrom: coupon.validFrom,
      validUntil: coupon.validUntil,
      isActive: coupon.isActive,
      createdAt: coupon.createdAt,
      updatedAt: coupon.updatedAt,
    };
  }

  private validateCouponData(data: Partial<CreateCouponDTO>): void {
    if (data.code && data.code.length < 2) {
      throw new Error('Coupon code must be at least 2 characters');
    }
    if (data.discountValue != null && data.discountValue <= 0) {
      throw new Error('Discount value must be greater than 0');
    }
    if (data.discountType === 'percentage' && data.discountValue != null && data.discountValue > 100) {
      throw new Error('Percentage discount cannot exceed 100%');
    }
  }
}

export default CouponsService;
