export type DiscountType = 'percentage' | 'fixed_amount';
export type ApplicableTo = 'all' | 'services' | 'gaming_pcs' | 'specific_categories';

export interface Coupon {
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
  validFrom?: string;
  validUntil?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
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
