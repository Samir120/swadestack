import { useAppSelector } from '../store/hooks';

/**
 * Hook to get the current VAT rate from Redux store.
 * Falls back to 0.25 (25%) if settings haven't loaded yet.
 */
export function useVatRate(): number {
  const vatRate = useAppSelector((state) => state.vatSettings?.settings?.vatRate);
  return vatRate ?? 0.25;
}
