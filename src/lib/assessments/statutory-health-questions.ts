export interface Question {
  id: string
  text: string
  type: 'yes_no' | 'multiple_choice' | 'number'
  category: 'pf' | 'esi' | 'pt' | 'gratuity' | 'bonus'
  categoryLabel: string
  options?: string[]
  weight: number
  helpText?: string
  complianceAnswer?: string
}

export const STATUTORY_HEALTH_QUESTIONS: Question[] = [
  // PF Questions (2 - employee count auto-derived from Step 1)
  {
    id: 'pf_1',
    text: 'Are you registered with EPFO (Employees Provident Fund Organisation)?',
    type: 'yes_no',
    category: 'pf',
    categoryLabel: 'Provident Fund (PF)',
    weight: 10,
    complianceAnswer: 'yes',
    helpText: 'Registration is mandatory if you have 20+ employees.',
  },
  {
    id: 'pf_2',
    text: 'Do you deduct and deposit PF contributions by the 15th of each month?',
    type: 'yes_no',
    category: 'pf',
    categoryLabel: 'Provident Fund (PF)',
    weight: 8,
    complianceAnswer: 'yes',
    helpText: 'PF contributions must be deposited by 15th of following month.',
  },

  // ESI Questions (3 - employee count auto-derived from Step 1)
  {
    id: 'esi_1',
    text: 'Are you registered with ESIC (Employee State Insurance Corporation)?',
    type: 'yes_no',
    category: 'esi',
    categoryLabel: 'Employee State Insurance (ESI)',
    weight: 10,
    complianceAnswer: 'yes',
    helpText: 'Registration is mandatory if you have 10+ employees with wages up to ₹21,000/month.',
  },
  {
    id: 'esi_2',
    text: 'Do you deposit ESI contributions by the 15th of each month?',
    type: 'yes_no',
    category: 'esi',
    categoryLabel: 'Employee State Insurance (ESI)',
    weight: 8,
    complianceAnswer: 'yes',
    helpText: 'ESI contributions (employer 3.25% + employee 0.75%) due by 15th of following month.',
  },
  {
    id: 'esi_3',
    text: 'Do you have employees earning wages up to ₹21,000/month?',
    type: 'yes_no',
    category: 'esi',
    categoryLabel: 'Employee State Insurance (ESI)',
    weight: 6,
    complianceAnswer: 'yes',
    helpText: 'ESI applies only to employees with monthly wages up to ₹21,000.',
  },

  // Professional Tax Questions (3)
  {
    id: 'pt_1',
    text: 'Is Professional Tax applicable in your state of operation?',
    type: 'yes_no',
    category: 'pt',
    categoryLabel: 'Professional Tax (PT)',
    weight: 8,
    complianceAnswer: 'yes',
    helpText: 'PT is a state-level tax. Not all states levy PT (e.g., Delhi, UP, Haryana do not).',
  },
  {
    id: 'pt_2',
    text: 'Do you hold a Professional Tax Registration Certificate (PTRC)?',
    type: 'yes_no',
    category: 'pt',
    categoryLabel: 'Professional Tax (PT)',
    weight: 8,
    complianceAnswer: 'yes',
    helpText: 'Employers must register for PT in applicable states.',
  },
  {
    id: 'pt_3',
    text: 'Do you deduct and deposit PT from employee salaries as per state rules?',
    type: 'yes_no',
    category: 'pt',
    categoryLabel: 'Professional Tax (PT)',
    weight: 6,
    complianceAnswer: 'yes',
    helpText: 'PT must be deducted from salaries and deposited as per state rules.',
  },

  // Gratuity Questions (2 - employee count auto-derived from Step 1)
  {
    id: 'gratuity_1',
    text: 'Do you maintain records of gratuity liability for employees with 4+ years of service?',
    type: 'yes_no',
    category: 'gratuity',
    categoryLabel: 'Gratuity',
    weight: 8,
    complianceAnswer: 'yes',
    helpText: 'Gratuity is payable after 5 years of continuous service. Track liability proactively.',
  },
  {
    id: 'gratuity_2',
    text: 'Have you provisioned for gratuity payments (insurance or book reserve)?',
    type: 'yes_no',
    category: 'gratuity',
    categoryLabel: 'Gratuity',
    weight: 6,
    complianceAnswer: 'yes',
    helpText: 'Companies can fund gratuity via LIC group gratuity scheme or book reserves.',
  },

  // Bonus Questions (2)
  {
    id: 'bonus_1',
    text: 'Do you pay statutory bonus (minimum 8.33%) to eligible employees?',
    type: 'yes_no',
    category: 'bonus',
    categoryLabel: 'Bonus',
    weight: 10,
    complianceAnswer: 'yes',
    helpText: 'Minimum bonus is 8.33% of salary, maximum is 20%. Applies to employees earning basic + DA up to ₹21,000/month.',
  },
  {
    id: 'bonus_2',
    text: 'Do you maintain bonus registers and pay bonus by 30th November each year?',
    type: 'yes_no',
    category: 'bonus',
    categoryLabel: 'Bonus',
    weight: 6,
    complianceAnswer: 'yes',
    helpText: 'Bonus must be paid within 8 months of closing the accounting year.',
  },
]

// Auto-derive applicability from employee count (captured in Step 1)
export const getApplicability = (employeeCount: string) => {
  const getMaxCount = (range: string) => {
    if (range === '500+') return 500
    const parts = range.split('-')
    return parseInt(parts[1] || parts[0])
  }
  
  const count = getMaxCount(employeeCount)
  
  return {
    pf: count >= 20,        // PF mandatory for 20+ employees
    esi: count >= 10,       // ESI mandatory for 10+ employees  
    pt: true,               // PT depends on state, not employee count
    gratuity: count >= 10,  // Gratuity Act applies to 10+ employees
    bonus: count >= 20,     // Bonus Act applies to 20+ employees
  }
}

export const CATEGORY_INFO = {
  pf: { name: 'Provident Fund (PF)', description: 'EPF Act 1952', maxScore: 18 },
  esi: { name: 'Employee State Insurance (ESI)', description: 'ESI Act 1948', maxScore: 24 },
  pt: { name: 'Professional Tax (PT)', description: 'State-level compliance', maxScore: 22 },
  gratuity: { name: 'Gratuity', description: 'Payment of Gratuity Act 1972', maxScore: 14 },
  bonus: { name: 'Bonus', description: 'Payment of Bonus Act 1965', maxScore: 16 },
}

// ============================================================================
// SCORING
// ============================================================================

export function calculateStatutoryHealthScore(responses: Record<string, string>) {
  const categoryScores: Record<string, { score: number; max: number; percentage: number }> = {}
  let totalScore = 0
  let maxScore = 0
  let questionsAnswered = 0

  Object.keys(CATEGORY_INFO).forEach(cat => {
    const catQuestions = STATUTORY_HEALTH_QUESTIONS.filter(q => q.category === cat)
    let catScore = 0
    let catMax = 0

    catQuestions.forEach(q => {
      catMax += q.weight
      const answer = responses[q.id]
      if (answer !== undefined) questionsAnswered++

      if (q.complianceAnswer) {
        if (answer === q.complianceAnswer) catScore += q.weight
      } else {
        // Informational question — no wrong answer, full points
        catScore += q.weight
      }
    })

    const percentage = catMax > 0 ? Math.round((catScore / catMax) * 100) : 0
    categoryScores[cat] = { score: catScore, max: catMax, percentage }
    totalScore += catScore
    maxScore += catMax
  })

  const overallScore = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0

  return {
    overallScore,
    categoryScores,
    questionsAnswered,
    totalQuestions: STATUTORY_HEALTH_QUESTIONS.length,
  }
}

// ============================================================================
// ACTION ITEMS
// ============================================================================

const ACTION_DESCRIPTIONS: Record<string, string> = {
  pf_1: 'Register with EPFO immediately if your establishment has 20+ employees',
  pf_2: 'Set up automated PF payment by 15th of each month to avoid penalties',
  esi_1: 'Register with ESIC if you have 10+ employees with wages up to Rs.21,000/month',
  esi_2: 'Ensure ESI contributions are deposited by 15th of each month',
  pt_2: 'Obtain Professional Tax Registration Certificate (PTRC) from your state',
  pt_3: 'Implement monthly PT deduction and deposit process',
  gratuity_1: 'Start maintaining gratuity liability records for all employees with 4+ years service',
  gratuity_2: 'Consider LIC group gratuity scheme or create book reserves for gratuity',
  bonus_1: 'Calculate and pay statutory bonus (min 8.33%) to eligible employees',
  bonus_2: 'Maintain bonus registers and pay bonus by November 30th each year',
}

export function generateStatutoryHealthActionItems(responses: Record<string, string>) {
  const items: { priority: 'high' | 'medium' | 'low'; text: string; category: string }[] = []

  STATUTORY_HEALTH_QUESTIONS.forEach(q => {
    const answer = responses[q.id]
    if (q.complianceAnswer && answer !== q.complianceAnswer) {
      const priority: 'high' | 'medium' | 'low' =
        q.weight >= 10 ? 'high' : q.weight >= 6 ? 'medium' : 'low'
      items.push({
        priority,
        text: ACTION_DESCRIPTIONS[q.id] ||
          `Review compliance for: ${CATEGORY_INFO[q.category as keyof typeof CATEGORY_INFO].name}`,
        category: CATEGORY_INFO[q.category as keyof typeof CATEGORY_INFO].name,
      })
    }
  })

  return items.sort((a, b) => {
    const order: Record<string, number> = { high: 0, medium: 1, low: 2 }
    return order[a.priority] - order[b.priority]
  })
}

// Re-export shared constants for backward compatibility
export { INDIAN_STATES, EMPLOYEE_COUNT_OPTIONS, INDUSTRY_OPTIONS } from '@/lib/constants/india'
