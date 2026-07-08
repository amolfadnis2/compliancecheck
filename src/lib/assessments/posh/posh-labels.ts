/**
 * Human-readable labels for POSH applicability answer codes.
 *
 * Shared by the client assessment page (client-side PDF, pre-payment-live
 * fallback) and the server-side gated PDF route, so both render the same
 * "Prepared For" details from the same applicability_responses codes.
 */

export const POSH_EMPLOYEE_COUNT_LABELS: Record<string, string> = {
  'below_10': 'Less than 10 employees',
  '10_to_49': '10-49 employees',
  '50_to_199': '50-199 employees',
  '200_to_499': '200-499 employees',
  '500_plus': '500+ employees',
}

export const POSH_STATE_LABELS: Record<string, string> = {
  'andhra_pradesh': 'Andhra Pradesh', 'assam': 'Assam', 'bihar': 'Bihar',
  'chhattisgarh': 'Chhattisgarh', 'delhi': 'Delhi NCT', 'goa': 'Goa',
  'gujarat': 'Gujarat', 'haryana': 'Haryana', 'himachal_pradesh': 'Himachal Pradesh',
  'jharkhand': 'Jharkhand', 'karnataka': 'Karnataka', 'kerala': 'Kerala',
  'madhya_pradesh': 'Madhya Pradesh', 'maharashtra': 'Maharashtra',
  'manipur': 'Manipur', 'meghalaya': 'Meghalaya', 'mizoram': 'Mizoram',
  'nagaland': 'Nagaland', 'odisha': 'Odisha', 'punjab': 'Punjab',
  'rajasthan': 'Rajasthan', 'sikkim': 'Sikkim', 'tamil_nadu': 'Tamil Nadu',
  'telangana': 'Telangana', 'tripura': 'Tripura', 'uttar_pradesh': 'Uttar Pradesh',
  'uttarakhand': 'Uttarakhand', 'west_bengal': 'West Bengal', 'other_ut': 'Other UT',
}

export const POSH_INDUSTRY_LABELS: Record<string, string> = {
  'it_services': 'IT Services / Software', 'bpo_ites': 'BPO / ITES',
  'manufacturing': 'Manufacturing', 'healthcare': 'Healthcare',
  'hospitality': 'Hospitality', 'retail': 'Retail / E-commerce',
  'education': 'Education', 'media_entertainment': 'Media / Entertainment',
  'banking_finance': 'Banking / Finance', 'construction': 'Construction',
  'logistics': 'Logistics', 'professional_services': 'Professional Services',
  'agriculture': 'Agriculture', 'ngo_nonprofit': 'NGO / Non-profit', 'other': 'Other',
}
