/**
 * Gratuity Calculator - Based on New Labour Codes (2025)
 * 
 * Key Changes Under New Labour Codes:
 * 1. Fixed-term employees: Gratuity after 1 year (not 5 years)
 * 2. Formula: (15 × Last Drawn Wages × Years of Service) ÷ 26
 * 3. Maximum ceiling: Rs.20 lakh
 * 4. Applicability: 10+ employees on any day in preceding 12 months
 * 5. Payment deadline: Within 30 days of becoming due
 */

import { RUPEE } from '@/lib/constants'

// Employment types with different eligibility rules
export const EMPLOYMENT_TYPES = [
  { 
    value: 'regular', 
    label: 'Regular/Permanent Employee',
    minYears: 5,
    description: 'Continuous service of 5+ years required'
  },
  { 
    value: 'fixed_term', 
    label: 'Fixed-Term Contract Employee',
    minYears: 1,
    description: 'NEW: Gratuity eligible after just 1 year (pro-rata)'
  },
  { 
    value: 'journalist', 
    label: 'Working Journalist',
    minYears: 3,
    description: 'Continuous service of 3+ years required'
  },
] as const

// Gratuity calculation constants
export const GRATUITY_CONSTANTS = {
  DAYS_PER_MONTH: 26,        // Working days per month (as per Act)
  MULTIPLIER: 15,            // 15 days wages per year of service
  MAX_CEILING: 2000000,      // Rs.20 lakh maximum
  MIN_EMPLOYEES: 10,         // Applicability threshold
  PAYMENT_DEADLINE_DAYS: 30, // Days to pay after becoming due
} as const

// Input interface for calculator (date-based)
export interface GratuityInput {
  employmentType: 'regular' | 'fixed_term' | 'journalist'
  lastDrawnBasicDA: number       // Basic + DA (monthly)
  dateOfJoining: Date            // When employee started
  lastWorkingDate: Date          // When employee is leaving/left
}

// Output interface
export interface GratuityResult {
  isEligible: boolean
  eligibilityReason: string
  calculatedAmount: number
  cappedAmount: number           // After applying 20L ceiling
  formula: string
  breakdown: {
    dailyWage: number
    totalDays: number
    grossAmount: number
  }
  serviceDetails: {
    years: number
    months: number
    days: number
    totalYearsForCalculation: number  // After rounding
  }
  effectiveYears: number         // Including pro-rata months
  isCapped: boolean
  compliance: {
    paymentDueDate: string       // Actual date when payment is due
    paymentDeadline: string      // Description
    employerInsuranceRequired: boolean
    taxExemption: string
  }
}


/**
 * Calculate service duration between two dates
 */
export function calculateServiceDuration(dateOfJoining: Date, lastWorkingDate: Date): {
  years: number
  months: number
  days: number
  totalMonths: number
} {
  const start = new Date(dateOfJoining)
  const end = new Date(lastWorkingDate)
  
  let years = end.getFullYear() - start.getFullYear()
  let months = end.getMonth() - start.getMonth()
  let days = end.getDate() - start.getDate()
  
  // Adjust for negative days
  if (days < 0) {
    months--
    const prevMonth = new Date(end.getFullYear(), end.getMonth(), 0)
    days += prevMonth.getDate()
  }
  
  // Adjust for negative months
  if (months < 0) {
    years--
    months += 12
  }
  
  const totalMonths = years * 12 + months
  
  return { years, months, days, totalMonths }
}

/**
 * Calculate the payment due date (30 days from last working date)
 */
export function calculatePaymentDueDate(lastWorkingDate: Date): Date {
  const dueDate = new Date(lastWorkingDate)
  dueDate.setDate(dueDate.getDate() + GRATUITY_CONSTANTS.PAYMENT_DEADLINE_DAYS)
  return dueDate
}

/**
 * Format date for display (DD MMM YYYY)
 */
export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}

/**
 * Calculate gratuity based on new labour code rules (date-based)
 */
export function calculateGratuity(input: GratuityInput): GratuityResult {
  const {
    employmentType,
    lastDrawnBasicDA,
    dateOfJoining,
    lastWorkingDate,
  } = input

  // Get minimum years requirement for employment type
  const empType = EMPLOYMENT_TYPES.find(t => t.value === employmentType)
  const minYearsRequired = empType?.minYears || 5

  // Calculate service duration
  const service = calculateServiceDuration(dateOfJoining, lastWorkingDate)
  const effectiveYears = service.years + (service.months / 12)

  // Check eligibility (assuming 10+ employees)
  let isEligible = true
  let eligibilityReason = ''

  if (effectiveYears < minYearsRequired) {
    isEligible = false
    if (employmentType === 'fixed_term') {
      eligibilityReason = `Fixed-term employees need minimum 1 year of service. You have ${formatServiceDuration(service)}.`
    } else if (employmentType === 'journalist') {
      eligibilityReason = `Working journalists need minimum 3 years of continuous service. You have ${formatServiceDuration(service)}.`
    } else {
      eligibilityReason = `Regular employees need minimum 5 years of continuous service. You have ${formatServiceDuration(service)}.`
    }
  } else {
    eligibilityReason = `Eligible for gratuity with ${formatServiceDuration(service)} of service.`
  }

  // For calculation, round years (>6 months counts as full year)
  const roundedYears = service.months >= 6 
    ? service.years + 1 
    : service.years

  // Formula: (15 × Last Drawn Wages × Years of Service) ÷ 26
  const dailyWage = lastDrawnBasicDA / GRATUITY_CONSTANTS.DAYS_PER_MONTH
  const totalDays = GRATUITY_CONSTANTS.MULTIPLIER * roundedYears
  const grossAmount = dailyWage * totalDays
  
  // Apply ceiling
  const cappedAmount = Math.min(grossAmount, GRATUITY_CONSTANTS.MAX_CEILING)
  const isCapped = grossAmount > GRATUITY_CONSTANTS.MAX_CEILING

  // Generate formula string
  const formula = `(15 × ${RUPEE}${lastDrawnBasicDA.toLocaleString('en-IN')} × ${roundedYears} years) ÷ 26`

  // Calculate payment due date
  const paymentDueDate = calculatePaymentDueDate(lastWorkingDate)

  // Tax exemption limit (as per current IT rules)
  const taxExemptLimit = 2000000 // Rs.20 lakh
  const taxExemption = cappedAmount <= taxExemptLimit 
    ? 'Fully exempt under Section 10(10) of Income Tax Act'
    : `${RUPEE}${taxExemptLimit.toLocaleString('en-IN')} exempt; balance taxable`

  return {
    isEligible,
    eligibilityReason,
    calculatedAmount: Math.round(grossAmount),
    cappedAmount: Math.round(cappedAmount),
    formula,
    breakdown: {
      dailyWage: Math.round(dailyWage * 100) / 100,
      totalDays,
      grossAmount: Math.round(grossAmount),
    },
    serviceDetails: {
      years: service.years,
      months: service.months,
      days: service.days,
      totalYearsForCalculation: roundedYears,
    },
    effectiveYears: Math.round(effectiveYears * 100) / 100,
    isCapped,
    compliance: {
      paymentDueDate: formatDate(paymentDueDate),
      paymentDeadline: `Within 30 days of last working date (by ${formatDate(paymentDueDate)})`,
      employerInsuranceRequired: true,
      taxExemption,
    },
  }
}


/**
 * Format service duration for display
 */
function formatServiceDuration(service: { years: number; months: number; days: number }): string {
  const parts = []
  if (service.years > 0) {
    parts.push(`${service.years} year${service.years !== 1 ? 's' : ''}`)
  }
  if (service.months > 0) {
    parts.push(`${service.months} month${service.months !== 1 ? 's' : ''}`)
  }
  if (service.days > 0 && service.years === 0) {
    parts.push(`${service.days} day${service.days !== 1 ? 's' : ''}`)
  }
  return parts.join(', ') || '0 days'
}

/**
 * Format currency with Rupee symbol
 */
export function formatCurrency(amount: number): string {
  return `${RUPEE}${amount.toLocaleString('en-IN')}`
}

/**
 * Get compliance information for gratuity
 */
export const GRATUITY_COMPLIANCE_INFO = {
  applicability: {
    title: 'Applicability',
    description: 'Every establishment with 10 or more employees on any day in the preceding 12 months.',
    icon: '🏢',
  },
  eligibility: {
    regular: {
      title: 'Regular Employees',
      description: 'Minimum 5 years continuous service required.',
      icon: '👤',
    },
    fixedTerm: {
      title: 'Fixed-Term Employees (NEW)',
      description: 'Eligible after just 1 year. Pro-rata gratuity for completed year.',
      icon: '📋',
      isNew: true,
    },
    journalist: {
      title: 'Working Journalists',
      description: 'Minimum 3 years continuous service under Working Journalists Act.',
      icon: '📰',
    },
  },
  payment: {
    title: 'Payment Timeline',
    description: 'Employer must pay within 30 days of gratuity becoming due.',
    penalty: 'Simple interest at rates notified by Government for delayed payment.',
    icon: '⏰',
  },
  insurance: {
    title: 'Compulsory Insurance',
    description: 'Employers MUST obtain insurance for gratuity liability.',
    icon: '🛡️',
  },
  ceiling: {
    title: 'Maximum Ceiling',
    description: 'Rs.20 lakh is the maximum gratuity payable.',
    icon: '📊',
  },
  exemption: {
    title: 'Tax Treatment',
    description: 'Gratuity up to Rs.20 lakh is exempt under Section 10(10) of Income Tax Act.',
    icon: '💰',
  },
} as const
