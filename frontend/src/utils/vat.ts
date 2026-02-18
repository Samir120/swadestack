/**
 * Calculate gross (VAT-inclusive) amount from net amount
 */
export function netToGross(net: number, vatRate: number): number {
  return net * (1 + vatRate);
}

/**
 * Calculate VAT amount from net amount
 */
export function vatAmount(net: number, vatRate: number): number {
  return net * vatRate;
}

/**
 * Convert VAT rate decimal to percentage integer (e.g. 0.25 -> 25)
 */
export function vatPercent(vatRate: number): number {
  return Math.round(vatRate * 100);
}
