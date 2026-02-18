import { DiscountType, ApplicableTo } from '../sequelize/Coupon';

export interface CouponDTO {
  id: string;
  code: string;
  description?: string;
  discountType: DiscountType;
  discountValue: number;
  minimumOrderAmount?: number;
  maxDiscountAmount?: number;
  maxUses?: number;
  maxUsesPerUser?: number;
  currentUses: number;
  totalDiscountGiven: number;
  applicableTo: ApplicableTo;
  applicableCategoryIds?: string;
  firstOrderOnly: boolean;
  combinable: boolean;
  validFrom?: Date;
  validUntil?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCouponDTO {
  code: string;
  description?: string;
  discountType: DiscountType;
  discountValue: number;
  minimumOrderAmount?: number;
  maxDiscountAmount?: number;
  maxUses?: number;
  maxUsesPerUser?: number;
  applicableTo?: ApplicableTo;
  applicableCategoryIds?: string;
  firstOrderOnly?: boolean;
  combinable?: boolean;
  validFrom?: Date;
  validUntil?: Date;
  isActive?: boolean;
}

export interface UpdateCouponDTO {
  code?: string;
  description?: string;
  discountType?: DiscountType;
  discountValue?: number;
  minimumOrderAmount?: number;
  maxDiscountAmount?: number;
  maxUses?: number;
  maxUsesPerUser?: number;
  applicableTo?: ApplicableTo;
  applicableCategoryIds?: string;
  firstOrderOnly?: boolean;
  combinable?: boolean;
  validFrom?: Date;
  validUntil?: Date;
  isActive?: boolean;
}

export interface CartItemContext {
  serviceId: string;
  serviceCategoryId?: string | null;
  quantity: number;
  price: number;
  isGamingPC?: boolean;
}

export interface CouponValidationResult {
  valid: boolean;
  couponId?: string;
  code?: string;
  discountType?: DiscountType;
  discountValue?: number;
  discountAmount?: number;
  maxDiscountAmount?: number;
  applicableTo?: ApplicableTo;
  error?: string;
}
