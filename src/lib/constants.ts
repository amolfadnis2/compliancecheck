// Currency constants - using Unicode escape for guaranteed proper encoding
export const RUPEE = '\u20B9' // ₹

// Indian States (all states and union territories)
export const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Puducherry', 'Chandigarh',
  'Andaman and Nicobar Islands', 'Dadra and Nagar Haveli and Daman and Diu', 'Lakshadweep'
] as const;

// Employee count options (standardized across all assessments)
export const EMPLOYEE_COUNT_OPTIONS = [
  { value: '1-9', label: '1-9 employees' },
  { value: '10-19', label: '10-19 employees' },
  { value: '20-49', label: '20-49 employees' },
  { value: '50-99', label: '50-99 employees' },
  { value: '100-299', label: '100-299 employees' },
  { value: '300-499', label: '300-499 employees' },
  { value: '500+', label: '500+ employees' },
] as const;

// Industry options (standardized across all assessments)
export const INDUSTRY_OPTIONS = [
  { value: 'Information Technology', label: 'Information Technology' },
  { value: 'Manufacturing', label: 'Manufacturing' },
  { value: 'Retail & E-commerce', label: 'Retail & E-commerce' },
  { value: 'Healthcare', label: 'Healthcare' },
  { value: 'Financial Services', label: 'Financial Services' },
  { value: 'Education', label: 'Education' },
  { value: 'Hospitality', label: 'Hospitality' },
  { value: 'Construction', label: 'Construction' },
  { value: 'Logistics & Transportation', label: 'Logistics & Transportation' },
  { value: 'Professional Services', label: 'Professional Services' },
  { value: 'Other', label: 'Other' },
] as const;

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
