import React from 'react';
import { useVatRate } from '../../../hooks/useVatRate';
import { netToGross, vatPercent } from '../../../utils/vat';
import { formatAdminCurrency } from './AdminPriceDisplay';

interface AdminPriceInputProps {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  currency?: string;
  required?: boolean;
  min?: number;
  step?: number;
  placeholder?: string;
  className?: string;
  labelClassName?: string;
  inputClassName?: string;
}

/**
 * Price input field with live VAT-inclusive helper.
 *
 * Renders:
 *   Label (ex. moms)
 *   [number input]
 *   -> 12 500 kr inkl. moms (25%)
 */
const AdminPriceInput: React.FC<AdminPriceInputProps> = ({
  label,
  value,
  onChange,
  currency = 'SEK',
  required,
  min,
  step,
  placeholder,
  className,
  labelClassName,
  inputClassName,
}) => {
  const vatRate = useVatRate();
  const numericValue = typeof value === 'string' ? parseFloat(value) : value;
  const showHelper = !isNaN(numericValue) && numericValue > 0;

  return (
    <div className={className}>
      <label
        className={
          labelClassName ??
          'block text-xs sm:text-sm font-medium text-neutral-400 uppercase tracking-wider mb-1.5'
        }
      >
        {label}{' '}
        <span className="text-neutral-500 normal-case tracking-normal text-[10px]">(ex. moms)</span>
      </label>
      <input
        type="number"
        required={required}
        min={min}
        step={step}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={
          inputClassName ??
          'w-full px-3 py-2.5 text-sm border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500'
        }
      />
      {showHelper && (
        <p className="mt-1 text-[10px] text-neutral-500">
          {formatAdminCurrency(netToGross(numericValue, vatRate), currency)} inkl. moms ({vatPercent(vatRate)}%)
        </p>
      )}
    </div>
  );
};

export default AdminPriceInput;
