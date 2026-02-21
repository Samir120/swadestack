import React from 'react';
import { useVatRate } from '../../../hooks/useVatRate';
import { netToGross, vatPercent } from '../../../utils/vat';

/**
 * Format a currency amount using the standard admin format (sv-SE locale).
 * Exported for use in places where only the formatted string is needed.
 */
export function formatAdminCurrency(amount: number, currency = 'SEK'): string {
  return new Intl.NumberFormat('sv-SE', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(amount);
}

interface AdminPriceDisplayProps {
  price: number;
  currency?: string;
  className?: string;
  primaryClassName?: string;
  secondaryClassName?: string;
}

/**
 * Read-only display of a net (ex. moms) price with a VAT-inclusive helper line.
 *
 * Renders:
 *   {formatted net price} ex. moms
 *   {formatted gross price} inkl. moms (25%)
 */
const AdminPriceDisplay: React.FC<AdminPriceDisplayProps> = ({
  price,
  currency = 'SEK',
  className,
  primaryClassName,
  secondaryClassName,
}) => {
  const vatRate = useVatRate();
  const gross = netToGross(price, vatRate);
  const pct = vatPercent(vatRate);

  return (
    <span className={className}>
      <span className={primaryClassName}>
        {formatAdminCurrency(price, currency)}{' '}
        <span className="text-neutral-500 font-normal text-[10px]">ex. moms</span>
      </span>
      <span className={secondaryClassName ?? 'block text-[10px] text-neutral-500 font-normal'}>
        {formatAdminCurrency(gross, currency)} inkl. moms ({pct}%)
      </span>
    </span>
  );
};

export default AdminPriceDisplay;
