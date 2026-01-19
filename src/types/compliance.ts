// Compliance Rule Interface for PDF Generation
// Used by: labour-code-rules.ts, statutory-health rules, food-business-compliance-rules

export interface ComplianceRule {
  questionId: string
  requirement: string
  governmentRef: string
  officialLink: string
  deadline: string
  penalty: string
  actionIfNonCompliant: string[]
  actionIfCompliant: string
  applicabilityNote?: string
  // Optional category field - can be inferred from questionId prefix
  category?: string
}

// Category labels for Labour Code assessments
export const LABOUR_CODE_CATEGORY_LABELS: Record<string, string> = {
  wages: 'Code on Wages',
  ss: 'Code on Social Security',
  osh: 'OSH Code',
  ir: 'Industrial Relations Code'
}
