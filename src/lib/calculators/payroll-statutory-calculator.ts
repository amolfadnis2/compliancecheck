/**
 * PF / ESI / Professional Tax Calculator (employer view)
 *
 * Rules-based, per-employee monthly statutory cost:
 * 1. EPF: mandatory at 20+ employees. 12% employee + 12% employer on PF wages
 *    (Basic + DA), statutory wage ceiling Rs.15,000. EPS 8.33% and EDLI 0.5%
 *    are always on wages capped at Rs.15,000; admin charges 0.5% of PF wages.
 * 2. ESI: establishment covered at 10+ employees (in ESIC-notified areas);
 *    employee covered while gross wages <= Rs.21,000. 0.75% employee, 3.25%
 *    employer, rounded up to the next rupee.
 * 3. Professional Tax: state slabs reused from the CTC calculator.
 *
 * Sources: EPF & MP Act 1952 and EPF Scheme 1952; ESI Act 1948;
 * Code on Social Security 2020 (Sec 2(88) "wages"); Article 276, Constitution.
 */

import { EPF_CONSTANTS, ESI_CONSTANTS, PROFESSIONAL_TAX } from '@/lib/calculators/ctc-calculator'

export const PAYROLL_RULES_LAST_REVIEWED = '2026-09-27'

export const PAYROLL_THRESHOLDS = {
  PF_MIN_EMPLOYEES: 20,
  ESI_MIN_EMPLOYEES: 10,
  PF_ADMIN_RATE: 0.005,
  LABOUR_CODE_WAGE_SHARE: 0.5,
} as const

// States listed in the PT table with no levy
const NO_PT_STATES = new Set([
  'Delhi',
  'Uttar Pradesh',
  'Haryana',
  'Rajasthan',
  'Himachal Pradesh',
  'Uttarakhand',
  'Goa',
  'Jammu and Kashmir',
  'Ladakh',
  'Chandigarh',
])

// States where PT is computed on annual income and paid annually
const ANNUAL_PT_STATES = new Set(['Bihar'])

export interface PayrollStatutoryInput {
  state: string
  employeeCount: number
  monthlyBasicDA: number
  monthlyGross: number
  gender?: 'male' | 'female'   // Maharashtra PT only
  pfOnActualBasic?: boolean    // default: restrict PF to the Rs.15,000 ceiling
}

export interface PayrollStatutoryResult {
  pf: {
    applicable: boolean
    reason: string
    pfWage: number
    employee: number
    employerEPS: number
    employerEPF: number
    employerEDLI: number
    employerAdmin: number
    employerTotal: number
  }
  esi: {
    establishmentCovered: boolean
    employeeCovered: boolean
    reason: string
    employee: number
    employer: number
  }
  pt: {
    status: 'levied' | 'not_levied' | 'annual' | 'unknown'
    monthly: number
    note: string
  }
  totals: {
    employeeDeductions: number
    employerCost: number
  }
  dueDates: { item: string; due: string }[]
  notes: string[]
}

export function calculatePayrollStatutory(input: PayrollStatutoryInput): PayrollStatutoryResult {
  const { state, employeeCount, monthlyBasicDA, monthlyGross, gender, pfOnActualBasic } = input
  const notes: string[] = []

  // ---------------- EPF ----------------
  const pfApplicable = employeeCount >= PAYROLL_THRESHOLDS.PF_MIN_EMPLOYEES
  const cappedWage = Math.min(monthlyBasicDA, EPF_CONSTANTS.WAGE_CEILING)
  const pfWage = pfApplicable ? (pfOnActualBasic ? monthlyBasicDA : cappedWage) : 0
  const pfEmployee = Math.round(pfWage * EPF_CONSTANTS.EMPLOYEE_RATE)
  const employerEPS = pfApplicable ? Math.round(cappedWage * EPF_CONSTANTS.EPS_RATE) : 0
  const employerEPF = Math.round(pfWage * EPF_CONSTANTS.EMPLOYER_RATE) - employerEPS
  const employerEDLI = pfApplicable ? Math.round(cappedWage * EPF_CONSTANTS.EDLI_RATE) : 0
  const employerAdmin = Math.round(pfWage * PAYROLL_THRESHOLDS.PF_ADMIN_RATE)
  const pfEmployerTotal = employerEPS + employerEPF + employerEDLI + employerAdmin

  const pfReason = pfApplicable
    ? `EPF is mandatory: you have ${employeeCount} employees (threshold: ${PAYROLL_THRESHOLDS.PF_MIN_EMPLOYEES}).`
    : `EPF is not yet mandatory: you have ${employeeCount} employees (threshold: ${PAYROLL_THRESHOLDS.PF_MIN_EMPLOYEES}). You can register voluntarily.`

  if (pfApplicable && monthlyBasicDA > EPF_CONSTANTS.WAGE_CEILING && !pfOnActualBasic) {
    notes.push('PF is calculated on the Rs.15,000 statutory ceiling. Contributing on actual Basic + DA is optional and needs a joint request by employer and employee.')
  }
  if (pfApplicable) {
    notes.push('EPF admin charges have a minimum of Rs.500 per month for the establishment as a whole.')
  }

  // ---------------- ESI ----------------
  const esiEstablishment = employeeCount >= PAYROLL_THRESHOLDS.ESI_MIN_EMPLOYEES
  const esiEmployee = esiEstablishment && monthlyGross <= ESI_CONSTANTS.GROSS_CEILING
  const esiEmployeeAmt = esiEmployee ? Math.ceil(monthlyGross * ESI_CONSTANTS.EMPLOYEE_RATE) : 0
  const esiEmployerAmt = esiEmployee ? Math.ceil(monthlyGross * ESI_CONSTANTS.EMPLOYER_RATE) : 0

  let esiReason: string
  if (!esiEstablishment) {
    esiReason = `ESI does not apply yet: you have ${employeeCount} employees (threshold: ${PAYROLL_THRESHOLDS.ESI_MIN_EMPLOYEES}, in ESIC-notified areas).`
  } else if (!esiEmployee) {
    esiReason = `Your establishment is covered, but this employee's gross wage is above Rs.${ESI_CONSTANTS.GROSS_CEILING.toLocaleString('en-IN')}/month, so no ESI is deducted for them.`
  } else {
    esiReason = `ESI applies: ${employeeCount} employees and gross wage within Rs.${ESI_CONSTANTS.GROSS_CEILING.toLocaleString('en-IN')}/month.`
  }
  if (esiEmployee) {
    notes.push('Employees with an average daily wage up to Rs.176 pay no ESI share; the employer share still applies.')
  }

  // ---------------- Professional Tax ----------------
  let pt: PayrollStatutoryResult['pt']
  const ptSlab = PROFESSIONAL_TAX[state]
  if (ANNUAL_PT_STATES.has(state)) {
    pt = { status: 'annual', monthly: 0, note: `${state} levies Professional Tax on annual income, paid once a year. Check the current state slab.` }
  } else if (NO_PT_STATES.has(state)) {
    pt = { status: 'not_levied', monthly: 0, note: `${state} does not levy Professional Tax on salaries.` }
  } else if (ptSlab) {
    const monthly = ptSlab(monthlyGross, gender)
    pt = {
      status: 'levied',
      monthly,
      note: monthly > 0
        ? `${state} levies Professional Tax. This salary falls in the Rs.${monthly}/month slab.`
        : `${state} levies Professional Tax, but this salary is below the taxable slab.`,
    }
    if (state === 'Maharashtra' && monthly === 200) {
      notes.push('Maharashtra PT is Rs.300 in February (instead of Rs.200) to reach the Rs.2,500 annual total.')
    }
  } else {
    pt = { status: 'unknown', monthly: 0, note: `We don't have Professional Tax slabs for ${state} yet. Check with the state's commercial tax department.` }
  }

  // ---------------- Labour Code wage check ----------------
  if (monthlyGross > 0 && monthlyBasicDA < monthlyGross * PAYROLL_THRESHOLDS.LABOUR_CODE_WAGE_SHARE) {
    notes.push('Basic + DA is under 50% of gross. Under the Code on Social Security 2020, allowances above 50% of total pay are added back to "wages", which can raise the PF base. Review the salary structure.')
  }

  const dueDates: { item: string; due: string }[] = []
  if (pfApplicable) dueDates.push({ item: 'EPF contribution + ECR filing', due: '15th of the following month' })
  if (esiEstablishment) dueDates.push({ item: 'ESI contribution', due: '15th of the following month' })
  if (pt.status === 'levied' || pt.status === 'annual') {
    dueDates.push({ item: 'Professional Tax', due: `As per ${state} schedule (monthly, half-yearly or annual)` })
  }

  return {
    pf: {
      applicable: pfApplicable,
      reason: pfReason,
      pfWage,
      employee: pfEmployee,
      employerEPS,
      employerEPF,
      employerEDLI,
      employerAdmin,
      employerTotal: pfEmployerTotal,
    },
    esi: {
      establishmentCovered: esiEstablishment,
      employeeCovered: esiEmployee,
      reason: esiReason,
      employee: esiEmployeeAmt,
      employer: esiEmployerAmt,
    },
    pt,
    totals: {
      employeeDeductions: pfEmployee + esiEmployeeAmt + pt.monthly,
      employerCost: pfEmployerTotal + esiEmployerAmt,
    },
    dueDates,
    notes,
  }
}
