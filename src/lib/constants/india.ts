/**
 * Shared constants for Indian business compliance
 * Used across all assessment types for consistency
 */

// Rupee symbol - Unicode escape ensures correct encoding in all contexts
export const RUPEE = '₹'

export function formatPrice(amount: number, showDecimal = false): string {
  const formatted = showDecimal
    ? amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : amount.toLocaleString('en-IN')
  return `${RUPEE}${formatted}`
}

// All Indian states and union territories
export const INDIAN_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  // Union Territories
  'Andaman and Nicobar Islands',
  'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Jammu and Kashmir',
  'Ladakh',
  'Lakshadweep',
  'Puducherry',
] as const;

export type IndianState = typeof INDIAN_STATES[number];

// Employee count options - standardised format
export const EMPLOYEE_COUNT_OPTIONS = [
  { value: '1-9', label: '1-9 employees' },
  { value: '10-19', label: '10-19 employees' },
  { value: '20-49', label: '20-49 employees' },
  { value: '50-99', label: '50-99 employees' },
  { value: '100-299', label: '100-299 employees' },
  { value: '300-499', label: '300-499 employees' },
  { value: '500+', label: '500+ employees' },
] as const;

export type EmployeeCountRange = typeof EMPLOYEE_COUNT_OPTIONS[number]['value'];

// Industry types - comprehensive list for Indian businesses
export const INDUSTRY_OPTIONS = [
  { value: 'Information Technology', label: 'Information Technology' },
  { value: 'Manufacturing', label: 'Manufacturing' },
  { value: 'Retail & E-commerce', label: 'Retail & E-commerce' },
  { value: 'Healthcare', label: 'Healthcare' },
  { value: 'Financial Services', label: 'Financial Services (BFSI)' },
  { value: 'Education', label: 'Education' },
  { value: 'Hospitality', label: 'Hospitality' },
  { value: 'Construction', label: 'Construction' },
  { value: 'Logistics & Transportation', label: 'Logistics & Transportation' },
  { value: 'Professional Services', label: 'Professional Services' },
  { value: 'Real Estate', label: 'Real Estate' },
  { value: 'Media & Entertainment', label: 'Media & Entertainment' },
  { value: 'Agriculture', label: 'Agriculture & Allied' },
  { value: 'Pharmaceuticals', label: 'Pharmaceuticals' },
  { value: 'Textiles', label: 'Textiles & Apparel' },
  { value: 'Other', label: 'Other' },
] as const;

export type IndustryType = typeof INDUSTRY_OPTIONS[number]['value'];

// Revenue options for DPDP assessment (SDF threshold determination)
export const REVENUE_OPTIONS = [
  { value: 'below_20cr', label: 'Below ₹20 crore' },
  { value: '20cr_100cr', label: '₹20 crore - ₹100 crore' },
  { value: '100cr_500cr', label: '₹100 crore - ₹500 crore' },
  { value: 'above_500cr', label: 'Above ₹500 crore' },
] as const;

export type RevenueRange = typeof REVENUE_OPTIONS[number]['value'];

// States where Professional Tax is NOT applicable
export const PT_EXEMPT_STATES = [
  'Delhi',
  'Uttar Pradesh',
  'Haryana',
  'Uttarakhand',
  'Himachal Pradesh',
  'Jammu and Kashmir',
  'Ladakh',
  'Arunachal Pradesh',
  'Nagaland',
  'Mizoram',
] as const;

// Helper function to check if PT is applicable
export function isPTApplicable(state: string): boolean {
  return !PT_EXEMPT_STATES.includes(state as typeof PT_EXEMPT_STATES[number]);
}
