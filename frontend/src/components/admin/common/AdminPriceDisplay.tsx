import React from 'react';
import { useVatRate } from '../../../hooks/useVatRate';
import { netToGross, vatPercent } from '../../../utils/vat';

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
        <span className="whitespace-nowrap">{formatAdminCurrency(price, currency)}</span>
        <span className="text-neutral-500 font-normal text-[10px] ml-1 whitespace-nowrap">ex. moms</span>
      </span>
      <span className={secondaryClassName ?? 'block text-[10px] text-neutral-500 font-normal'}>
        {formatAdminCurrency(gross, currency)} inkl. moms ({pct}%)
      </span>
    </span>
  );
};

export default AdminPriceDisplay;
