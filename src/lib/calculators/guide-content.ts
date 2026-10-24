/**
 * Server-rendered explainer content for the calculator pages (How it's
 * calculated, Worked example, Eligibility, FAQ, Related guides).
 *
 * Every figure here is read from the calculator modules' own constants, and the
 * worked examples are produced by running the real calculator functions on a
 * fixed sample input — so this copy can never drift from what the tool computes.
 * Do not hand-type rates, ceilings or thresholds into this file.
 */

import {
  EMPLOYMENT_TYPES,
  GRATUITY_CONSTANTS,
  calculateGratuity,
  formatCurrency,
} from '@/lib/calculators/gratuity-calculator'
import {
  EPF_CONSTANTS,
  ESI_CONSTANTS,
  TAX_CONSTANTS,
  calculateCTC,
  getStatesWithoutPT,
} from '@/lib/calculators/ctc-calculator'
import {
  PAYROLL_THRESHOLDS,
  calculatePayrollStatutory,
} from '@/lib/calculators/payroll-statutory-calculator'

export interface CalculatorGuideContent {
  /** Steps of the formula, in order. */
  howItWorks: string[]
  example: {
    intro: string
    rows: { label: string; value: string }[]
    result: string
  }
  eligibility: string[]
  faqs: { question: string; answer: string }[]
  /** Blog post slugs; missing slugs are skipped at render time. */
  relatedSlugs: string[]
  /** Other calculators worth linking to from this one. */
  relatedTools?: { href: string; label: string; description: string }[]
}

const PF_CALCULATOR_LINK = {
  href: '/calculator/pf',
  label: 'PF calculator with salary hikes',
  description: 'See what your EPF grows to by retirement, your EPS pension and your real return as your salary rises.',
}

// getStatesWithoutPT() tests a monthly slab, so it also returns states that
// levy PT annually (e.g. Bihar). Keep only the ones the payroll calculator
// itself classifies as not levied.
function statesWithoutPT(): string[] {
  return getStatesWithoutPT().filter(
    (state) =>
      calculatePayrollStatutory({ state, employeeCount: 1, monthlyBasicDA: 0, monthlyGross: 50000 }).pt
        .status === 'not_levied'
  )
}

const pct = (rate: number) => `${Math.round(rate * 10000) / 100}%`
const inr = (n: number) => formatCurrency(Math.round(n))
const lakh = (n: number) => `${formatCurrency(n / 100000)} lakh`

function minYears(value: (typeof EMPLOYMENT_TYPES)[number]['value']): number {
  return EMPLOYMENT_TYPES.find((t) => t.value === value)?.minYears ?? 0
}

// ---------------------------------------------------------------------------
// Gratuity
// ---------------------------------------------------------------------------

function gratuityGuide(): CalculatorGuideContent {
  const { MULTIPLIER, DAYS_PER_MONTH, MAX_CEILING, MIN_EMPLOYEES, PAYMENT_DEADLINE_DAYS } =
    GRATUITY_CONSTANTS

  const sample = { basic: 40000, joined: '2016-04-01', left: '2026-03-31' }
  const r = calculateGratuity({
    employmentType: 'regular',
    lastDrawnBasicDA: sample.basic,
    dateOfJoining: new Date(sample.joined),
    lastWorkingDate: new Date(sample.left),
  })

  return {
    howItWorks: [
      `Gratuity = (${MULTIPLIER} × last drawn monthly Basic + DA × years of service) ÷ ${DAYS_PER_MONTH}.`,
      `${MULTIPLIER} is the number of days' wages paid per completed year of service, and ${DAYS_PER_MONTH} is the number of working days in a month used by the Act.`,
      // TODO-VERIFY: the Payment of Gratuity Act wording is "in excess of six
      // months"; the calculator code rounds up at months >= 6.
      'This calculator counts a final part-year of 6 months or more as a full year of service.',
      `The result is capped at the statutory ceiling of ${lakh(MAX_CEILING)}.`,
      `Gratuity must be paid within ${PAYMENT_DEADLINE_DAYS} days of becoming due.`,
    ],
    example: {
      intro: `A regular employee joined on ${new Date(sample.joined).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} and leaves on ${new Date(sample.left).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}, with a last drawn Basic + DA of ${inr(sample.basic)} a month.`,
      rows: [
        {
          label: 'Service',
          value: `${r.serviceDetails.years} years, ${r.serviceDetails.months} months (counted as ${r.serviceDetails.totalYearsForCalculation} years)`,
        },
        { label: 'Daily wage', value: `${inr(sample.basic)} ÷ ${DAYS_PER_MONTH} = ${formatCurrency(r.breakdown.dailyWage)}` },
        { label: 'Days of wages', value: `${MULTIPLIER} × ${r.serviceDetails.totalYearsForCalculation} = ${r.breakdown.totalDays}` },
        { label: 'Formula', value: r.formula },
      ],
      result: `Gratuity payable: ${inr(r.cappedAmount)}${r.isCapped ? ' (capped at the statutory ceiling)' : ''}.`,
    },
    eligibility: [
      `The establishment must have had ${MIN_EMPLOYEES} or more employees on any day in the preceding 12 months.`,
      `Regular / permanent employees: at least ${minYears('regular')} years of continuous service.`,
      `Fixed-term employees: at least ${minYears('fixed_term')} year of service under the new Labour Codes (pro-rata).`,
      `Working journalists: at least ${minYears('journalist')} years of continuous service.`,
    ],
    faqs: [
      {
        question: 'What is the gratuity formula in India?',
        answer: `Gratuity = (${MULTIPLIER} × last drawn monthly Basic + DA × years of service) ÷ ${DAYS_PER_MONTH}, subject to a maximum of ${lakh(MAX_CEILING)}.`,
      },
      {
        question: 'How many years of service do I need to get gratuity?',
        answer: `Regular employees need ${minYears('regular')} years of continuous service. Fixed-term employees become eligible after ${minYears('fixed_term')} year under the new Labour Codes, and working journalists after ${minYears('journalist')} years.`,
      },
      {
        question: 'What is the maximum gratuity amount?',
        answer: `The statutory ceiling is ${lakh(MAX_CEILING)}. Any amount calculated above that is capped.`,
      },
      {
        question: 'Which employers have to pay gratuity?',
        answer: `Every establishment that had ${MIN_EMPLOYEES} or more employees on any day in the preceding 12 months.`,
      },
      {
        question: 'How soon must the employer pay gratuity?',
        answer: `Within ${PAYMENT_DEADLINE_DAYS} days of the gratuity becoming due.`,
      },
    ],
    relatedSlugs: [
      'gratuity-calculation-explained-with-the-labour-code-formula',
      'fixed-term-employment-gratuity-after-one-year',
      'gratuity-vs-superannuation-vs-nps-how-they-actually-differ',
    ],
    relatedTools: [PF_CALCULATOR_LINK],
  }
}

// ---------------------------------------------------------------------------
// CTC to in-hand
// ---------------------------------------------------------------------------

function ctcGuide(): CalculatorGuideContent {
  // The example stops before TDS: TDS depends on tax-slab figures that are
  // flagged TODO-VERIFY below.
  const sample = { annualCTC: 600000, state: 'Karnataka', isMetroCity: true }
  const r = calculateCTC({ ...sample, taxRegime: 'new' })
  const b = r.breakdown
  const noPtStates = statesWithoutPT()
  const beforeTds = b.monthlyGross - b.employeePF - b.employeeESI - b.professionalTax

  return {
    howItWorks: [
      'Basic salary is set at 50% of CTC, the minimum "wages" share under the new Labour Codes.',
      'HRA is 50% of Basic in metro cities and 40% elsewhere.',
      `Employer PF is ${pct(EPF_CONSTANTS.EMPLOYER_RATE)} of Basic: ${pct(EPF_CONSTANTS.EPS_RATE)} goes to EPS on wages up to ${inr(EPF_CONSTANTS.WAGE_CEILING)}, plus EDLI at ${pct(EPF_CONSTANTS.EDLI_RATE)}. A gratuity provision and employer ESI (${pct(ESI_CONSTANTS.EMPLOYER_RATE)}, if gross is up to ${inr(ESI_CONSTANTS.GROSS_CEILING)}/month) are also taken out of CTC.`,
      'Special allowance is the balancing figure, so that monthly gross plus employer costs equals CTC.',
      `In-hand = monthly gross − employee PF (${pct(EPF_CONSTANTS.EMPLOYEE_RATE)} of Basic) − employee ESI (${pct(ESI_CONSTANTS.EMPLOYEE_RATE)}, if applicable) − Professional Tax (state slab) − TDS under the chosen tax regime.`,
    ],
    example: {
      intro: `An annual CTC of ${inr(sample.annualCTC)} in a metro city in ${sample.state}, new tax regime.`,
      rows: [
        { label: 'Monthly Basic (50% of CTC)', value: inr(b.monthlyBasic) },
        { label: 'Monthly HRA', value: inr(b.monthlyHRA) },
        { label: 'Monthly gross', value: inr(b.monthlyGross) },
        { label: 'Employee PF', value: inr(b.employeePF) },
        { label: 'Employee ESI', value: inr(b.employeeESI) },
        { label: 'Professional Tax', value: inr(b.professionalTax) },
      ],
      result: `Monthly in-hand before TDS: ${inr(beforeTds)}. Income-tax TDS under your chosen regime is then deducted; the calculator above shows it.`,
    },
    eligibility: [
      `PF is deducted when the employer is EPF-covered (${PAYROLL_THRESHOLDS.PF_MIN_EMPLOYEES} or more employees).`,
      `ESI is deducted only when monthly gross is up to ${inr(ESI_CONSTANTS.GROSS_CEILING)} and the establishment has ${PAYROLL_THRESHOLDS.ESI_MIN_EMPLOYEES} or more employees.`,
      `Professional Tax depends on the state. It is not levied in: ${noPtStates.join(', ')}.`,
    ],
    faqs: [
      {
        question: 'What is the difference between CTC and in-hand salary?',
        answer:
          'CTC is the total annual cost to the employer, including employer PF, employer ESI and a gratuity provision. In-hand salary is what reaches your bank account after employee PF, employee ESI, Professional Tax and TDS are deducted from gross pay.',
      },
      {
        question: 'Why is Basic set at 50% of CTC?',
        answer:
          'Under the new Labour Codes, allowances above 50% of total pay are added back to "wages". Keeping Basic at 50% avoids that add-back changing the PF and gratuity base.',
      },
      {
        question: 'How much PF is deducted from my salary?',
        answer: `The employee contributes ${pct(EPF_CONSTANTS.EMPLOYEE_RATE)} of Basic. The employer contributes another ${pct(EPF_CONSTANTS.EMPLOYER_RATE)}, of which ${pct(EPF_CONSTANTS.EPS_RATE)} on wages up to ${inr(EPF_CONSTANTS.WAGE_CEILING)} goes to the pension scheme (EPS).`,
      },
      {
        question: 'When is ESI deducted?',
        answer: `When your monthly gross is up to ${inr(ESI_CONSTANTS.GROSS_CEILING)}. You pay ${pct(ESI_CONSTANTS.EMPLOYEE_RATE)} and the employer pays ${pct(ESI_CONSTANTS.EMPLOYER_RATE)} of gross wages.`,
      },
      {
        question: 'What standard deduction does the calculator use?',
        // TODO-VERIFY: TAX_CONSTANTS rebate limits (NEW_REGIME_REBATE_LIMIT /
        // NEW_REGIME_REBATE_AMOUNT) look older than the FY2025-26 figures.
        answer: `${inr(TAX_CONSTANTS.NEW_REGIME_STANDARD_DEDUCTION)} under the new regime and ${inr(TAX_CONSTANTS.OLD_REGIME_STANDARD_DEDUCTION)} under the old regime.`,
      },
    ],
    relatedSlugs: [
      'ctc-vs-in-hand-salary-where-your-money-actually-goes',
      'how-the-labour-codes-change-your-employees-take-home-pay',
      'the-50-wages-rule-how-the-code-on-wages-rewrites-your-salary-structure',
      'pf-calculator-how-much-epf-will-you-retire-with',
    ],
    relatedTools: [PF_CALCULATOR_LINK],
  }
}

// ---------------------------------------------------------------------------
// PF, ESI & PT
// ---------------------------------------------------------------------------

function pfEsiPtGuide(): CalculatorGuideContent {
  const sample = { state: 'Karnataka', employeeCount: 25, monthlyBasicDA: 12000, monthlyGross: 20000 }
  const r = calculatePayrollStatutory(sample)
  const noPtStates = statesWithoutPT()

  return {
    howItWorks: [
      `PF wage = Basic + DA, capped at ${inr(EPF_CONSTANTS.WAGE_CEILING)} unless employer and employee opt to contribute on actual wages.`,
      `Employee PF = ${pct(EPF_CONSTANTS.EMPLOYEE_RATE)} of PF wage. Employer PF = ${pct(EPF_CONSTANTS.EMPLOYER_RATE)}, split into EPS (${pct(EPF_CONSTANTS.EPS_RATE)} of capped wage) and EPF (the balance), plus EDLI at ${pct(EPF_CONSTANTS.EDLI_RATE)} and admin charges at ${pct(PAYROLL_THRESHOLDS.PF_ADMIN_RATE)}.`,
      `ESI applies when monthly gross is up to ${inr(ESI_CONSTANTS.GROSS_CEILING)}: employee ${pct(ESI_CONSTANTS.EMPLOYEE_RATE)}, employer ${pct(ESI_CONSTANTS.EMPLOYER_RATE)} of gross.`,
      'Professional Tax is taken from the state slab for the monthly gross.',
    ],
    example: {
      intro: `An employer in ${sample.state} with ${sample.employeeCount} employees; one employee earns Basic + DA of ${inr(sample.monthlyBasicDA)} and a gross of ${inr(sample.monthlyGross)} a month.`,
      rows: [
        { label: 'Employee PF', value: inr(r.pf.employee) },
        { label: 'Employer PF (EPS + EPF + EDLI + admin)', value: inr(r.pf.employerTotal) },
        { label: 'Employee ESI', value: inr(r.esi.employee) },
        { label: 'Employer ESI', value: inr(r.esi.employer) },
        { label: 'Professional Tax', value: inr(r.pt.monthly) },
      ],
      result: `Employee deductions: ${inr(r.totals.employeeDeductions)} a month. Employer statutory cost: ${inr(r.totals.employerCost)} a month.`,
    },
    eligibility: [
      `EPF is mandatory for establishments with ${PAYROLL_THRESHOLDS.PF_MIN_EMPLOYEES} or more employees; smaller employers can register voluntarily.`,
      `ESI covers establishments with ${PAYROLL_THRESHOLDS.ESI_MIN_EMPLOYEES} or more employees in ESIC-notified areas, for employees earning up to ${inr(ESI_CONSTANTS.GROSS_CEILING)} a month.`,
      `Professional Tax is a state levy. It is not levied on salaries in: ${noPtStates.join(', ')}.`,
    ],
    faqs: [
      {
        question: 'When does PF become mandatory for an employer?',
        answer: `When the establishment has ${PAYROLL_THRESHOLDS.PF_MIN_EMPLOYEES} or more employees. Below that, registration is voluntary.`,
      },
      {
        question: 'When does ESI apply?',
        answer: `ESI applies to establishments with ${PAYROLL_THRESHOLDS.ESI_MIN_EMPLOYEES} or more employees in ESIC-notified areas, and covers employees whose monthly gross is up to ${inr(ESI_CONSTANTS.GROSS_CEILING)}.`,
      },
      {
        question: 'What are the PF and ESI contribution rates?',
        answer: `PF: employee ${pct(EPF_CONSTANTS.EMPLOYEE_RATE)} and employer ${pct(EPF_CONSTANTS.EMPLOYER_RATE)} of PF wage. ESI: employee ${pct(ESI_CONSTANTS.EMPLOYEE_RATE)} and employer ${pct(ESI_CONSTANTS.EMPLOYER_RATE)} of gross wages.`,
      },
      {
        question: 'Is PF calculated on the full basic salary?',
        answer: `By default PF is calculated on Basic + DA up to ${inr(EPF_CONSTANTS.WAGE_CEILING)} a month. Contributing on actual Basic + DA above that is optional.`,
      },
      {
        question: 'When are PF and ESI contributions due?',
        answer: 'Both are due by the 15th of the following month.',
      },
    ],
    relatedSlugs: [
      'pf-esi-applicability-employer-guide',
      'epf-vs-esic-what-each-one-actually-covers',
      'professional-tax-state-wise-guide',
      'pf-calculator-how-much-epf-will-you-retire-with',
    ],
  }
}

export type CalculatorGuideId = 'gratuity' | 'ctc' | 'pf-esi-pt'

export function getCalculatorGuide(id: CalculatorGuideId): CalculatorGuideContent {
  switch (id) {
    case 'gratuity':
      return gratuityGuide()
    case 'ctc':
      return ctcGuide()
    case 'pf-esi-pt':
      return pfEsiPtGuide()
  }
}

/** Related posts for the penalty calculator (which already has its own FAQ). */
export const PENALTY_CALCULATOR_RELATED_SLUGS = [
  'every-labour-law-penalty-in-one-table',
  'rs-250-crore-how-dpdp-penalties-are-actually-calculated',
  'esic-inspections-damages-and-interest',
]
