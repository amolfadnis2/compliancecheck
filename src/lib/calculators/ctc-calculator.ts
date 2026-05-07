/**
 * CTC to In-Hand Salary Calculator
 * Based on India's New Labour Codes 2025
 * 
 * Key Rules:
 * 1. Basic + DA must be minimum 50% of CTC (Labour Code requirement)
 * 2. State-specific Professional Tax slabs
 * 3. Dual tax regime comparison (New vs Old)
 * 4. EPF calculation with ₹15,000 wage ceiling for EPS
 * 5. ESI for gross ≤ ₹21,000
 */

import { RUPEE } from '@/lib/constants/india'

// ============================================
// TYPES & INTERFACES
// ============================================

export interface CTCInput {
  annualCTC: number
  state: string
  isMetroCity: boolean
  taxRegime: 'new' | 'old'
  gender?: 'male' | 'female' // For Maharashtra PT
  
  // Optional deductions (Old Regime)
  section80C?: number
  section80D?: number
  section80CCD1B?: number
  homeLoanInterest?: number
  rentPaid?: number
}

export interface CTCBreakdown {
  // CTC Components
  annualCTC: number
  monthlyGross: number
  basicSalary: number
  monthlyBasic: number
  hra: number
  monthlyHRA: number
  specialAllowance: number
  monthlySpecialAllowance: number
  
  // Employer Contributions (Part of CTC but not in Gross)
  employerPF: number
  employerEPS: number
  employerEPF: number
  employerEDLI: number
  employerESI: number
  gratuityProvision: number
  
  // Employee Deductions
  employeePF: number
  employeeESI: number
  professionalTax: number
  tds: number
  
  // Take-home
  monthlyInHand: number
  annualInHand: number
}

export interface TaxCalculation {
  regime: 'new' | 'old'
  grossSalary: number
  standardDeduction: number
  hraExemption: number
  section80C: number
  section80D: number
  section80CCD1B: number
  homeLoanInterest: number
  totalDeductions: number
  taxableIncome: number
  incomeTax: number
  surcharge: number
  cess: number
  totalTax: number
  rebate: number
  netTax: number
  monthlyTDS: number
}

export interface CTCResult {
  breakdown: CTCBreakdown
  newRegimeTax: TaxCalculation
  oldRegimeTax: TaxCalculation
  recommendedRegime: 'new' | 'old'
  taxSavings: number
  complianceNotes: string[]
}

// ============================================
// CONSTANTS
// ============================================

export const TAX_CONSTANTS = {
  NEW_REGIME_STANDARD_DEDUCTION: 75000,
  OLD_REGIME_STANDARD_DEDUCTION: 50000,
  NEW_REGIME_REBATE_LIMIT: 700000,
  OLD_REGIME_REBATE_LIMIT: 500000,
  NEW_REGIME_REBATE_AMOUNT: 25000,
  OLD_REGIME_REBATE_AMOUNT: 12500,
  GRATUITY_TAX_FREE_LIMIT: 2000000,
} as const

export const EPF_CONSTANTS = {
  EMPLOYEE_RATE: 0.12,
  EMPLOYER_RATE: 0.12,
  EPS_RATE: 0.0833,
  EDLI_RATE: 0.005,
  WAGE_CEILING: 15000,
} as const

export const ESI_CONSTANTS = {
  EMPLOYEE_RATE: 0.0075,
  EMPLOYER_RATE: 0.0325,
  GROSS_CEILING: 21000,
} as const

// Professional Tax Slabs by State
export const PROFESSIONAL_TAX: Record<string, (monthly: number, gender?: 'male' | 'female') => number> = {
  'Maharashtra': (monthly, gender) => {
    if (gender === 'female') {
      if (monthly <= 25000) return 0
      return 200
    }
    // Male
    if (monthly <= 7500) return 0
    if (monthly <= 10000) return 175
    return 200
  },
  'Karnataka': (monthly) => {
    if (monthly <= 24999) return 0
    return 200
  },
  'West Bengal': (monthly) => {
    if (monthly <= 10000) return 0
    if (monthly <= 15000) return 110
    if (monthly <= 25000) return 130
    if (monthly <= 40000) return 150
    return 200
  },
  'Andhra Pradesh': (monthly) => {
    if (monthly <= 15000) return 0
    if (monthly <= 20000) return 150
    return 200
  },
  'Telangana': (monthly) => {
    if (monthly <= 15000) return 0
    if (monthly <= 20000) return 150
    return 200
  },
  'Gujarat': (monthly) => {
    if (monthly <= 12000) return 0
    return 200
  },
  'Tamil Nadu': (monthly) => {
    if (monthly <= 21000) return 0
    if (monthly <= 30000) return 135
    return 208
  },
  'Kerala': (monthly) => {
    if (monthly <= 11999) return 0
    if (monthly <= 17999) return 110
    if (monthly <= 24999) return 130
    return 208
  },
  'Madhya Pradesh': (monthly) => {
    if (monthly <= 18750) return 0
    if (monthly <= 25000) return 125
    if (monthly <= 33333) return 166
    return 208
  },
  'Punjab': (monthly) => {
    if (monthly <= 7500) return 0
    if (monthly <= 10000) return 175
    return 200
  },
  'Assam': (monthly) => {
    if (monthly <= 10000) return 0
    if (monthly <= 15000) return 150
    if (monthly <= 24999) return 180
    return 208
  },
  'Odisha': (monthly) => {
    // Annual basis
    const annual = monthly * 12
    if (annual <= 159999) return 0
    if (annual <= 300000) return 125
    return 200
  },
  'Jharkhand': (monthly) => {
    const annual = monthly * 12
    if (annual <= 300000) return 0
    if (annual <= 500000) return 100
    if (annual <= 800000) return 150
    if (annual <= 1000000) return 175
    return 208
  },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  'Bihar': (monthly) => {
    // Annual PT - calculated annually based on yearly income
    return 0 // Monthly, paid annually
  },
  'Chhattisgarh': (monthly) => {
    const annual = monthly * 12
    if (annual <= 100000) return 0
    if (annual <= 150000) return 130
    if (annual <= 200000) return 150
    if (annual <= 250000) return 200
    return 208
  },
  'Meghalaya': (monthly) => {
    if (monthly <= 4166) return 0
    if (monthly <= 6250) return 16.5
    if (monthly <= 8333) return 25
    if (monthly <= 8334) return 41.5
    if (monthly <= 12500) return 41.5
    if (monthly <= 20833) return 62.5
    if (monthly <= 41666) return 104
    return 208
  },
  'Tripura': (monthly) => {
    if (monthly <= 7500) return 0
    if (monthly <= 15000) return 150
    return 208
  },
  'Sikkim': (monthly) => {
    if (monthly <= 20000) return 0
    if (monthly <= 30000) return 125
    if (monthly <= 40000) return 150
    return 200
  },
  // States without PT
  'Delhi': () => 0,
  'Uttar Pradesh': () => 0,
  'Haryana': () => 0,
  'Rajasthan': () => 0,
  'Himachal Pradesh': () => 0,
  'Uttarakhand': () => 0,
  'Goa': () => 0,
  'Jammu and Kashmir': () => 0,
  'Ladakh': () => 0,
  'Chandigarh': () => 0,
  'Puducherry': (monthly) => {
    if (monthly <= 21000) return 0
    return 200
  },
}

// ============================================
// CALCULATION FUNCTIONS
// ============================================

/**
 * Calculate CTC breakdown with new Labour Code 50% rule
 */
export function calculateCTCBreakdown(input: CTCInput): CTCBreakdown {
  const { annualCTC, state, isMetroCity, gender } = input
  
  // Step 1: Calculate Basic (50% minimum as per Labour Code)
  const basicSalary = annualCTC * 0.50
  const monthlyBasic = basicSalary / 12
  
  // Step 2: Calculate HRA (40-50% of Basic)
  const hraPercentage = isMetroCity ? 0.50 : 0.40
  const hra = basicSalary * hraPercentage
  const monthlyHRA = hra / 12
  
  // Step 3: Calculate Employer contributions
  const employerPF = calculateEmployerPF(monthlyBasic)
  const employerESI = calculateEmployerESI(monthlyBasic + monthlyHRA)
  const gratuityProvision = (basicSalary * 0.0481) / 12
  
  // Step 4: Calculate Special Allowance (balancing figure)
  const monthlyGross = (annualCTC - (employerPF.total * 12) - (employerESI * 12) - (gratuityProvision * 12)) / 12
  const specialAllowance = (monthlyGross - monthlyBasic - monthlyHRA) * 12
  const monthlySpecialAllowance = specialAllowance / 12
  
  // Step 5: Calculate Employee deductions
  const employeePF = monthlyBasic * EPF_CONSTANTS.EMPLOYEE_RATE
  const employeeESI = monthlyGross <= ESI_CONSTANTS.GROSS_CEILING 
    ? monthlyGross * ESI_CONSTANTS.EMPLOYEE_RATE 
    : 0
  
  const professionalTax = calculateProfessionalTax(monthlyGross, state, gender)
  
  return {
    annualCTC,
    monthlyGross,
    basicSalary,
    monthlyBasic,
    hra,
    monthlyHRA,
    specialAllowance,
    monthlySpecialAllowance,
    employerPF: employerPF.total,
    employerEPS: employerPF.eps,
    employerEPF: employerPF.epf,
    employerEDLI: employerPF.edli,
    employerESI,
    gratuityProvision,
    employeePF,
    employeeESI,
    professionalTax,
    tds: 0, // Calculated separately in tax function
    monthlyInHand: 0, // Calculated after tax
    annualInHand: 0,
  }
}

/**
 * Calculate Employer PF with EPS cap
 */
function calculateEmployerPF(monthlyBasic: number) {
  const epsWage = Math.min(monthlyBasic, EPF_CONSTANTS.WAGE_CEILING)
  const eps = epsWage * EPF_CONSTANTS.EPS_RATE
  const epf = (monthlyBasic * EPF_CONSTANTS.EMPLOYER_RATE) - eps
  const edli = epsWage * EPF_CONSTANTS.EDLI_RATE
  
  return {
    total: eps + epf + edli,
    eps: eps,
    epf: epf,
    edli: edli,
  }
}

/**
 * Calculate Employer ESI
 */
function calculateEmployerESI(monthlyGross: number): number {
  if (monthlyGross > ESI_CONSTANTS.GROSS_CEILING) return 0
  return monthlyGross * ESI_CONSTANTS.EMPLOYER_RATE
}

/**
 * Calculate Professional Tax
 */
function calculateProfessionalTax(monthlyGross: number, state: string, gender?: 'male' | 'female'): number {
  const calculator = PROFESSIONAL_TAX[state]
  if (!calculator) return 0
  return calculator(monthlyGross, gender)
}

/**
 * Calculate HRA Exemption (Old Regime only)
 */
function calculateHRAExemption(
  actualHRA: number,
  basicDA: number,
  rentPaid: number,
  isMetroCity: boolean
): number {
  if (rentPaid === 0) return 0
  
  const condition1 = actualHRA
  const condition2 = basicDA * (isMetroCity ? 0.50 : 0.40)
  const condition3 = Math.max(0, rentPaid - (basicDA * 0.10))
  
  return Math.min(condition1, condition2, condition3)
}

/**
 * Calculate Income Tax - New Regime
 */
function calculateNewRegimeTax(
  annualGross: number,
  employerNPS: number = 0
): TaxCalculation {
  const standardDeduction = TAX_CONSTANTS.NEW_REGIME_STANDARD_DEDUCTION
  const taxableIncome = Math.max(0, annualGross - standardDeduction - employerNPS)
  
  let tax = 0
  
  // Tax slabs for New Regime FY 2024-25
  if (taxableIncome > 300000) tax += Math.min(taxableIncome - 300000, 400000) * 0.05
  if (taxableIncome > 700000) tax += Math.min(taxableIncome - 700000, 300000) * 0.10
  if (taxableIncome > 1000000) tax += Math.min(taxableIncome - 1000000, 200000) * 0.15
  if (taxableIncome > 1200000) tax += Math.min(taxableIncome - 1200000, 300000) * 0.20
  if (taxableIncome > 1500000) tax += (taxableIncome - 1500000) * 0.30
  
  // Rebate under 87A
  const rebate = taxableIncome <= TAX_CONSTANTS.NEW_REGIME_REBATE_LIMIT 
    ? Math.min(tax, TAX_CONSTANTS.NEW_REGIME_REBATE_AMOUNT) 
    : 0
  
  // Surcharge
  const surcharge = calculateSurcharge(taxableIncome, tax, 'new')
  
  // Health & Education Cess (4%)
  const cess = (tax + surcharge) * 0.04
  
  const totalTax = tax + surcharge + cess
  const netTax = Math.max(0, totalTax - rebate)
  
  return {
    regime: 'new',
    grossSalary: annualGross,
    standardDeduction,
    hraExemption: 0,
    section80C: 0,
    section80D: 0,
    section80CCD1B: 0,
    homeLoanInterest: 0,
    totalDeductions: standardDeduction + employerNPS,
    taxableIncome,
    incomeTax: tax,
    surcharge,
    cess,
    totalTax,
    rebate,
    netTax,
    monthlyTDS: netTax / 12,
  }
}

/**
 * Calculate Income Tax - Old Regime
 */
function calculateOldRegimeTax(
  annualGross: number,
  basicDA: number,
  actualHRA: number,
  rentPaid: number,
  isMetroCity: boolean,
  deductions: {
    section80C?: number
    section80D?: number
    section80CCD1B?: number
    homeLoanInterest?: number
  } = {}
): TaxCalculation {
  const standardDeduction = TAX_CONSTANTS.OLD_REGIME_STANDARD_DEDUCTION
  const hraExemption = calculateHRAExemption(actualHRA, basicDA, rentPaid, isMetroCity)
  
  const section80C = Math.min(deductions.section80C || 0, 150000)
  const section80D = deductions.section80D || 0
  const section80CCD1B = Math.min(deductions.section80CCD1B || 0, 50000)
  const homeLoanInterest = Math.min(deductions.homeLoanInterest || 0, 200000)
  
  const totalDeductions = standardDeduction + hraExemption + section80C + section80D + section80CCD1B + homeLoanInterest
  const taxableIncome = Math.max(0, annualGross - totalDeductions)
  
  let tax = 0
  
  // Tax slabs for Old Regime
  if (taxableIncome > 250000) tax += Math.min(taxableIncome - 250000, 250000) * 0.05
  if (taxableIncome > 500000) tax += Math.min(taxableIncome - 500000, 500000) * 0.20
  if (taxableIncome > 1000000) tax += (taxableIncome - 1000000) * 0.30
  
  // Rebate under 87A
  const rebate = taxableIncome <= TAX_CONSTANTS.OLD_REGIME_REBATE_LIMIT 
    ? Math.min(tax, TAX_CONSTANTS.OLD_REGIME_REBATE_AMOUNT) 
    : 0
  
  // Surcharge
  const surcharge = calculateSurcharge(taxableIncome, tax, 'old')
  
  // Health & Education Cess (4%)
  const cess = (tax + surcharge) * 0.04
  
  const totalTax = tax + surcharge + cess
  const netTax = Math.max(0, totalTax - rebate)
  
  return {
    regime: 'old',
    grossSalary: annualGross,
    standardDeduction,
    hraExemption,
    section80C,
    section80D,
    section80CCD1B,
    homeLoanInterest,
    totalDeductions,
    taxableIncome,
    incomeTax: tax,
    surcharge,
    cess,
    totalTax,
    rebate,
    netTax,
    monthlyTDS: netTax / 12,
  }
}

/**
 * Calculate Surcharge
 */
function calculateSurcharge(income: number, tax: number, regime: 'new' | 'old'): number {
  if (income <= 5000000) return 0
  if (income <= 10000000) return tax * 0.10
  if (income <= 20000000) return tax * 0.15
  if (income <= 50000000) return tax * 0.25
  
  // Above 5 crore
  return regime === 'new' ? tax * 0.25 : tax * 0.37
}

/**
 * Main Calculator Function
 */
export function calculateCTC(input: CTCInput): CTCResult {
  // Step 1: Calculate CTC breakdown
  const breakdown = calculateCTCBreakdown(input)
  
  // Step 2: Calculate taxes for both regimes
  const newRegimeTax = calculateNewRegimeTax(breakdown.monthlyGross * 12)
  
  const oldRegimeTax = calculateOldRegimeTax(
    breakdown.monthlyGross * 12,
    breakdown.basicSalary,
    breakdown.hra,
    input.rentPaid || 0,
    input.isMetroCity,
    {
      section80C: input.section80C,
      section80D: input.section80D,
      section80CCD1B: input.section80CCD1B,
      homeLoanInterest: input.homeLoanInterest,
    }
  )
  
  // Step 3: Calculate take-home with tax
  const selectedTax = input.taxRegime === 'new' ? newRegimeTax : oldRegimeTax
  breakdown.tds = selectedTax.monthlyTDS
  breakdown.monthlyInHand = breakdown.monthlyGross - breakdown.employeePF - breakdown.employeeESI - breakdown.professionalTax - breakdown.tds
  breakdown.annualInHand = breakdown.monthlyInHand * 12
  
  // Step 4: Determine recommended regime
  const recommendedRegime = newRegimeTax.netTax < oldRegimeTax.netTax ? 'new' : 'old'
  const taxSavings = Math.abs(newRegimeTax.netTax - oldRegimeTax.netTax)
  
  // Step 5: Compliance notes
  const complianceNotes = []
  if (breakdown.basicSalary < input.annualCTC * 0.50) {
    complianceNotes.push('Warning: Basic salary should be minimum 50% of CTC as per new Labour Codes')
  }
  if (breakdown.employeeESI > 0) {
    complianceNotes.push('Tick: ESI applicable (gross salary <= Rs.21,000)')
  }
  if (breakdown.professionalTax > 0) {
    complianceNotes.push(`Tick: Professional Tax: ${formatCurrency(breakdown.professionalTax)}/month in ${input.state}`)
  }
  if (recommendedRegime !== input.taxRegime) {
    complianceNotes.push(`Bulb: Switching to ${recommendedRegime === 'new' ? 'New' : 'Old'} Regime could save ${formatCurrency(taxSavings)} annually`)
  }
  
  return {
    breakdown,
    newRegimeTax,
    oldRegimeTax,
    recommendedRegime,
    taxSavings,
    complianceNotes,
  }
}

/**
 * Format currency
 */
export function formatCurrency(amount: number): string {
  return `${RUPEE}${Math.round(amount).toLocaleString('en-IN')}`
}

/**
 * Get list of states with PT
 */
export function getStatesWithPT(): string[] {
  return Object.keys(PROFESSIONAL_TAX).filter(state => {
    const calculator = PROFESSIONAL_TAX[state]
    return calculator(50000) > 0 // Test with high salary
  })
}

/**
 * Get list of states without PT
 */
export function getStatesWithoutPT(): string[] {
  return Object.keys(PROFESSIONAL_TAX).filter(state => {
    const calculator = PROFESSIONAL_TAX[state]
    return calculator(50000) === 0 // Test with high salary
  })
}
