import { useState, useCallback } from 'react';
import { couponsApi } from '../models/api/couponsApi';
import { CouponValidationResult, DiscountType } from '../models/types/coupon.types';

export const useCouponViewModel = () => {
  const [appliedCoupon, setAppliedCoupon] = useState<CouponValidationResult | null>(null);
  const [couponCode, setCouponCode] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);

  const validateAndApplyCoupon = useCallback(async (code: string, orderTotal: number, email: string, items?: { serviceId: string; quantity: number }[]) => {
    if (!code.trim()) {
      setCouponError('Please enter a coupon code');
      return false;
    }

    setIsValidating(true);
    setCouponError(null);

    try {
      const response = await couponsApi.validate(code.trim(), orderTotal, email, items);
      if (response.success && response.data) {
        if (response.data.valid) {
          setAppliedCoupon(response.data);
          setCouponError(null);
          return true;
        } else {
          setCouponError(response.data.error || 'Invalid coupon');
          setAppliedCoupon(null);
          return false;
        }
      } else {
        setCouponError('Failed to validate coupon');
        return false;
      }
    } catch {
      setCouponError('Failed to validate coupon');
      return false;
    } finally {
      setIsValidating(false);
    }
  }, []);

  const removeCoupon = useCallback(() => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError(null);
  }, []);

  const formatDiscount = useCallback((discountType?: DiscountType, discountValue?: number): string => {
    if (!discountType || discountValue == null) return '';
    if (discountType === 'percentage') {
      return `${discountValue}%`;
    }
    return `${discountValue.toLocaleString('sv-SE', { maximumFractionDigits: 0 })} SEK`;
  }, []);

  const discountAmount = appliedCoupon?.discountAmount || 0;

  return {
    appliedCoupon,
    couponCode,
    setCouponCode,
    isValidating,
    couponError,
    discountAmount,
    validateAndApplyCoupon,
    removeCoupon,
    formatDiscount,
  };
};
