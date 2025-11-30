// Currency constants - using Unicode escape for guaranteed proper encoding
export const RUPEE = '\u20B9' // ₹

// Format price with Rupee symbol
export function formatPrice(amount: number, showDecimal = false): string {
  const formatted = showDecimal 
    ? amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : amount.toLocaleString('en-IN')
  return `${RUPEE}${formatted}`
}

// Product pricing (in INR)
export const PRICING = {
  statutory_health: {
    original: 999,
    current: 0, // FREE during beta
    label: 'Statutory Health Check',
  },
  labour_code: {
    original: 1999,
    current: 0, // FREE during beta
    label: 'Labour Code Readiness',
  },
  dpdp: {
    original: 2499,
    current: 2499,
    label: 'DPDP Gap Assessment',
  },
} as const

// Format price display with strikethrough for original price
export function getPriceDisplay(productKey: keyof typeof PRICING): { 
  current: string
  original: string
  isFree: boolean 
} {
  const product = PRICING[productKey]
  return {
    current: product.current === 0 ? 'FREE' : formatPrice(product.current),
    original: formatPrice(product.original),
    isFree: product.current === 0,
  }
}
