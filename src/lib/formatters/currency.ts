/**
 * Format a number as Indonesian Rupiah.
 * Numbers are stored as plain integers, formatted only at display time.
 */
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Format a number with thousand separators (no currency symbol).
 */
export function formatNumber(amount: number): string {
  return new Intl.NumberFormat('id-ID').format(amount)
}

/**
 * Parse a formatted rupiah string back to number.
 */
export function parseRupiah(value: string): number {
  const cleaned = value.replace(/[^0-9]/g, '')
  return parseInt(cleaned, 10) || 0
}
