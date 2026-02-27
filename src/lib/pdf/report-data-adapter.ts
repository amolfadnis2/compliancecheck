/**
 * Report Data Adapter
 *
 * Transforms assessment-specific data into the UnifiedReportData format
 * used by the unified PDF generator. Each assessment type has different
 * data structures, rules, and category labels - this module normalises
 * them into a single consistent shape.
 */

import type {
  UnifiedReportData,
  UnifiedUserDetails,
  UnifiedCategoryScore,
  UnifiedActionItem,
  UnifiedCompliantItem,
  ReportConfig,
} from './unified-report-generator'

import { DPDP_COMPLIANCE_RULES, DPDP_CATEGORY_LABELS } from './dpdp-compliance-rules'
import { FOOD_COMPLIANCE_RULES, FOOD_CATEGORY_LABELS } from './food-business-compliance-rules'
import { LABOUR_CODE_RULES } from '@/lib/assessments/labour-code-rules'
import { LABOUR_CODE_CATEGORY_LABELS } from '@/types/compliance'
import { STATE_WISE_COMPLIANCE_RULES, STATE_WISE_CATEGORY_LABELS } from './state-wise-compliance-rules'

import {
  STATUTORY_HEALTH_CONFIG,
  LABOUR_CODE_CONFIG,
  DPDP_CONFIG,
  STATE_WISE_CONFIG,
  FOOD_BUSINESS_CONFIG,
} from './report-configs'

// ============================================================================
// TYPES
// ============================================================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRecord = Record<string, any>

interface AssessmentData {
  id?: string
  assessment_type?: string
  overall_score?: number
  category_scores?: AnyRecord
  responses?: AnyRecord
  userDetails?: AnyRecord
  user_details?: AnyRecord
}

// Inline compliance rules for Statutory Health (same as in download-buttons.tsx)
interface ComplianceRuleInline {
  questionId: string
  category: string
  requirement: string
  governmentRef: string
  officialLink: string
  deadline: string
  penalty: string
  actionIfNonCompliant: string[]
  actionIfCompliant: string
  applicabilityNote?: string
}

// ============================================================================
// HELPERS
// ============================================================================

function extractUserDetails(data: AssessmentData): UnifiedUserDetails {
  const ud = data.userDetails || data.user_details || data.responses?.userDetails || {}
  return {
    fullName: ud.fullName || ud.contactName || ud.name || 'Not specified',
    email: ud.email || ud.contactEmail || '',
    phone: ud.phone || ud.contactPhone || '',
    companyName: ud.companyName || ud.company || 'Not specified',
    state: ud.state || ud.primaryState || 'Not specified',
    employeeCount: ud.employeeCount || ud.employees || '',
    industry: ud.industry || ud.industryType || '',
  }
}

function getRiskLevel(score: number): string {
  if (score >= 80) return 'Low Risk'
  if (score >= 60) return 'Moderate Risk'
  if (score >= 40) return 'High Risk'
  return 'Critical Risk'
}

function getPenaltyExposure(score: number, assessmentType: string): string {
  if (assessmentType === 'dpdp') {
    if (score >= 80) return 'Minimal'
    if (score >= 60) return 'Up to Rs. 50 Cr'
    return 'Up to Rs. 250 Cr'
  }
  if (score >= 80) return 'Minimal'
  if (score >= 60) return 'Moderate'
  if (score >= 40) return 'Significant'
  return 'Severe'
}

function determinePriority(score: number): 'high' | 'medium' | 'low' {
  if (score < 40) return 'high'
  if (score < 70) return 'medium'
  return 'low'
}

function getCategoryScoresFromRaw(
  rawScores: AnyRecord,
  categoryLabels?: Record<string, string>
): UnifiedCategoryScore[] {
  return Object.entries(rawScores).map(([key, value]) => {
    const percentage = typeof value === 'number'
      ? value
      : typeof value === 'object' && value !== null
        ? (value as AnyRecord).percentage ?? 0
        : 0
    const questionCount = typeof value === 'object' && value !== null
      ? (value as AnyRecord).total ?? (value as AnyRecord).questionCount ?? 0
      : 0
    const compliantCount = typeof value === 'object' && value !== null
      ? (value as AnyRecord).passed ?? (value as AnyRecord).compliantCount ?? 0
      : 0

    const label = categoryLabels?.[key] || key
    return {
      category: label,
      score: Math.round(percentage),
      status: percentage >= 80 ? 'compliant' as const
        : percentage >= 50 ? 'needs_attention' as const
        : 'non_compliant' as const,
      questionCount: questionCount || 0,
      compliantCount: compliantCount || 0,
    }
  })
}

// ============================================================================
// STATUTORY HEALTH ADAPTER
// ============================================================================

export function adaptStatutoryHealth(
  data: AssessmentData,
  inlineRules: Record<string, ComplianceRuleInline>
): UnifiedReportData {
  const answers = data.responses?.answers || data.responses || {}
  const overallScore = data.overall_score ?? 50
  const userDetails = extractUserDetails(data)
  const categoryScores = getCategoryScoresFromRaw(data.category_scores || {})

  const actionItems: UnifiedActionItem[] = []
  const compliantItems: UnifiedCompliantItem[] = []

  Object.entries(answers).forEach(([questionId, answer]) => {
    const rule = inlineRules[questionId]
    if (!rule) return

    if (answer === 'yes') {
      compliantItems.push({
        questionId,
        category: rule.category,
        text: rule.requirement,
      })
    } else if (answer === 'no') {
      actionItems.push({
        priority: determinePriority(overallScore),
        category: rule.category,
        questionId,
        title: rule.requirement,
        description: rule.governmentRef,
        remediation: rule.actionIfNonCompliant,
        governmentRef: rule.governmentRef,
        officialLink: rule.officialLink,
        penalty: rule.penalty,
        deadline: rule.deadline,
      })
    }
  })

  // Assign priorities based on category scores
  assignPrioritiesFromCategoryScores(actionItems, data.category_scores || {})

  return {
    assessmentId: data.id || 'N/A',
    overallScore,
    riskLevel: getRiskLevel(overallScore),
    penaltyExposure: getPenaltyExposure(overallScore, 'statutory_health'),
    categoryScores,
    actionItems,
    compliantItems,
    userDetails,
    config: STATUTORY_HEALTH_CONFIG,
  }
}

// ============================================================================
// LABOUR CODE ADAPTER
// ============================================================================

export function adaptLabourCode(data: AssessmentData): UnifiedReportData {
  const answers = data.responses?.answers || data.responses || {}
  const overallScore = data.overall_score ?? 50
  const userDetails = extractUserDetails(data)
  const categoryScores = getCategoryScoresFromRaw(
    data.category_scores || {},
    LABOUR_CODE_CATEGORY_LABELS
  )

  const actionItems: UnifiedActionItem[] = []
  const compliantItems: UnifiedCompliantItem[] = []

  Object.entries(answers).forEach(([questionId, answer]) => {
    const rule = LABOUR_CODE_RULES[questionId]
    if (!rule) return

    const category = rule.category || LABOUR_CODE_CATEGORY_LABELS[questionId.split('_')[0]] || questionId.split('_')[0]

    if (answer === 'yes') {
      compliantItems.push({
        questionId,
        category,
        text: rule.requirement,
      })
    } else if (answer === 'no') {
      actionItems.push({
        priority: determinePriority(overallScore),
        category,
        questionId,
        title: rule.requirement,
        description: rule.governmentRef,
        remediation: rule.actionIfNonCompliant,
        governmentRef: rule.governmentRef,
        officialLink: rule.officialLink,
        penalty: rule.penalty,
        deadline: rule.deadline,
      })
    }
  })

  assignPrioritiesFromCategoryScores(actionItems, data.category_scores || {})

  return {
    assessmentId: data.id || 'N/A',
    overallScore,
    riskLevel: getRiskLevel(overallScore),
    penaltyExposure: getPenaltyExposure(overallScore, 'labour_code'),
    categoryScores,
    actionItems,
    compliantItems,
    userDetails,
    config: LABOUR_CODE_CONFIG,
  }
}

// ============================================================================
// DPDP ADAPTER
// ============================================================================

export function adaptDPDP(data: AssessmentData): UnifiedReportData {
  const responsesWithMain = data.responses as AnyRecord | undefined
  const answers = responsesWithMain?.main || data.responses?.answers || data.responses || {}
  const overallScore = data.overall_score ?? 50
  const userDetails = extractUserDetails(data)
  const categoryScores = getCategoryScoresFromRaw(
    data.category_scores || {},
    DPDP_CATEGORY_LABELS
  )

  const actionItems: UnifiedActionItem[] = []
  const compliantItems: UnifiedCompliantItem[] = []

  Object.entries(answers).forEach(([questionId, answer]) => {
    const rule = DPDP_COMPLIANCE_RULES[questionId]
    if (!rule) return

    if (answer === 'yes') {
      compliantItems.push({
        questionId,
        category: rule.category,
        text: rule.requirement,
      })
    } else if (answer === 'no') {
      actionItems.push({
        priority: determinePriority(overallScore),
        category: rule.category,
        questionId,
        title: rule.requirement,
        description: rule.governmentRef,
        remediation: rule.actionIfNonCompliant,
        governmentRef: rule.governmentRef,
        officialLink: rule.officialLink,
        penalty: rule.penalty,
        deadline: rule.deadline,
      })
    }
  })

  assignPrioritiesFromCategoryScores(actionItems, data.category_scores || {})

  return {
    assessmentId: data.id || 'N/A',
    overallScore,
    riskLevel: getRiskLevel(overallScore),
    penaltyExposure: getPenaltyExposure(overallScore, 'dpdp'),
    categoryScores,
    actionItems,
    compliantItems,
    userDetails,
    config: DPDP_CONFIG,
  }
}

// ============================================================================
// STATE-WISE COMPLIANCE ADAPTER
// ============================================================================

export function adaptStateWise(data: AssessmentData): UnifiedReportData {
  const responsesWithMain = data.responses as AnyRecord | undefined
  const answers = responsesWithMain?.main || data.responses?.answers || data.responses || {}
  const overallScore = data.overall_score ?? 50
  const userDetails = extractUserDetails(data)
  const categoryScores = getCategoryScoresFromRaw(
    data.category_scores || {},
    STATE_WISE_CATEGORY_LABELS
  )

  const actionItems: UnifiedActionItem[] = []
  const compliantItems: UnifiedCompliantItem[] = []

  Object.entries(answers).forEach(([questionId, answer]) => {
    const rule = STATE_WISE_COMPLIANCE_RULES[questionId]
    if (!rule) return

    if (answer === 'yes') {
      compliantItems.push({
        questionId,
        category: rule.category,
        text: rule.requirement,
      })
    } else if (answer === 'no') {
      actionItems.push({
        priority: determinePriority(overallScore),
        category: rule.category,
        questionId,
        title: rule.requirement,
        description: rule.governmentRef,
        remediation: rule.actionIfNonCompliant,
        governmentRef: rule.governmentRef,
        officialLink: rule.officialLink,
        penalty: rule.penalty,
        deadline: rule.deadline,
      })
    }
  })

  assignPrioritiesFromCategoryScores(actionItems, data.category_scores || {})

  return {
    assessmentId: data.id || 'N/A',
    overallScore,
    riskLevel: getRiskLevel(overallScore),
    penaltyExposure: getPenaltyExposure(overallScore, 'state_wise'),
    categoryScores,
    actionItems,
    compliantItems,
    userDetails,
    config: STATE_WISE_CONFIG,
  }
}

// ============================================================================
// FOOD BUSINESS ADAPTER
// ============================================================================

export function adaptFoodBusiness(data: AssessmentData): UnifiedReportData {
  const responsesWithMain = data.responses as AnyRecord | undefined
  const answers = responsesWithMain?.main || data.responses?.answers || data.responses || {}
  const overallScore = data.overall_score ?? 50
  const userDetails = extractUserDetails(data)
  const categoryScores = getCategoryScoresFromRaw(
    data.category_scores || {},
    FOOD_CATEGORY_LABELS
  )

  const actionItems: UnifiedActionItem[] = []
  const compliantItems: UnifiedCompliantItem[] = []

  Object.entries(answers).forEach(([questionId, answer]) => {
    const rule = FOOD_COMPLIANCE_RULES[questionId]
    if (!rule) return

    if (answer === 'yes') {
      compliantItems.push({
        questionId,
        category: rule.category || FOOD_CATEGORY_LABELS[questionId.split('_')[0]] || 'General',
        text: rule.requirement,
      })
    } else if (answer === 'no') {
      const category = rule.category || FOOD_CATEGORY_LABELS[questionId.split('_')[0]] || 'General'
      actionItems.push({
        priority: determinePriority(overallScore),
        category,
        questionId,
        title: rule.requirement,
        description: rule.governmentRef,
        remediation: rule.actionIfNonCompliant,
        governmentRef: rule.governmentRef,
        officialLink: rule.officialLink,
        penalty: rule.penalty,
        deadline: rule.deadline,
      })
    }
  })

  assignPrioritiesFromCategoryScores(actionItems, data.category_scores || {})

  return {
    assessmentId: data.id || 'N/A',
    overallScore,
    riskLevel: getRiskLevel(overallScore),
    penaltyExposure: getPenaltyExposure(overallScore, 'food_business'),
    categoryScores,
    actionItems,
    compliantItems,
    userDetails,
    config: FOOD_BUSINESS_CONFIG,
  }
}

// ============================================================================
// PRIORITY ASSIGNMENT HELPER
// ============================================================================

/**
 * Refine action item priorities based on per-category scores.
 * Items in categories with low scores get higher priority.
 */
function assignPrioritiesFromCategoryScores(
  items: UnifiedActionItem[],
  categoryScores: AnyRecord
): void {
  // Build a map of category key -> score percentage
  const scoreMap: Record<string, number> = {}
  Object.entries(categoryScores).forEach(([key, value]) => {
    const pct = typeof value === 'number'
      ? value
      : typeof value === 'object' && value !== null
        ? (value as AnyRecord).percentage ?? 0
        : 0
    scoreMap[key] = pct
  })

  // For each action item, try to find its category score and assign priority
  items.forEach((item) => {
    // Try matching by questionId prefix or category name
    const prefix = item.questionId.split('_')[0]
    const catScore = scoreMap[prefix] ?? scoreMap[item.category.toLowerCase()] ?? null

    if (catScore !== null) {
      if (catScore < 40) item.priority = 'high'
      else if (catScore < 70) item.priority = 'medium'
      else item.priority = 'low'
    }
  })
}
