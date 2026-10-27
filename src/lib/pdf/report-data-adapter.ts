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
import type { ComplianceRule } from '@/types/compliance'

import { DPDP_COMPLIANCE_RULES, DPDP_CATEGORY_LABELS } from './dpdp-compliance-rules'
import { FOOD_COMPLIANCE_RULES, FOOD_CATEGORY_LABELS } from './food-business-compliance-rules'
import { LABOUR_CODE_RULES } from '@/lib/assessments/labour-code-rules'
import { STATE_WISE_COMPLIANCE_RULES, STATE_WISE_CATEGORY_LABELS } from './state-wise-compliance-rules'
import {
  STATUTORY_HEALTH_COMPLIANCE_RULES,
  STATUTORY_HEALTH_CATEGORY_LABELS,
} from './statutory-health-compliance-rules'
import { STATUTORY_HEALTH_QUESTIONS } from '@/lib/assessments/statutory-health-questions'
import { LABOUR_CODE_QUESTIONS, LABOUR_CODE_CATEGORIES } from '@/lib/assessments/labour-code-questions'
import { ALL_DPDP_QUESTIONS } from '@/lib/assessments/dpdp-questions'
import { PHASE2_QUESTIONS } from '@/lib/assessments/state-wise-compliance-questions'
import { ALL_FOOD_BUSINESS_QUESTIONS } from '@/lib/assessments/food-business-questions'
import { RISK_LEVEL_INFO } from '@/lib/assessments/posh/posh-compliance-questions'
import {
  POSH_STATE_LABELS,
  POSH_EMPLOYEE_COUNT_LABELS,
  POSH_INDUSTRY_LABELS,
} from '@/lib/assessments/posh/posh-labels'

import {
  STATUTORY_HEALTH_CONFIG,
  LABOUR_CODE_CONFIG,
  DPDP_CONFIG,
  STATE_WISE_CONFIG,
  FOOD_BUSINESS_CONFIG,
  POSH_CONFIG,
} from './report-configs'

// ============================================================================
// TYPES
// ============================================================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRecord = Record<string, any>

export interface AssessmentData {
  id?: string
  assessment_type?: string
  overall_score?: number
  category_scores?: AnyRecord
  responses?: AnyRecord
  userDetails?: AnyRecord
  user_details?: AnyRecord
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
  if (score >= 90) return 'Low Risk'
  if (score >= 70) return 'Moderate Risk'
  if (score >= 40) return 'High Risk'
  return 'Critical Risk'
}

function getPenaltyExposure(score: number, assessmentType: string): string {
  if (assessmentType === 'dpdp') {
    if (score >= 90) return 'Minimal'
    if (score >= 70) return 'Up to Rs. 50 Cr'
    return 'Up to Rs. 250 Cr'
  }
  if (score >= 90) return 'Minimal'
  if (score >= 70) return 'Moderate'
  if (score >= 40) return 'Significant'
  return 'Severe'
}

// ============================================================================
// SHARED ANSWER -> REPORT BUILDER
// ============================================================================

/**
 * How one answer reads against its requirement:
 * - compliant: requirement met
 * - partial:   part-way there (e.g. "applied, pending", "sometimes delayed") —
 *              still an action item, one priority step lower
 * - unsure:    the respondent did not know — an action item to verify
 * - gap:       requirement not met
 * - skip:      not applicable / unanswered / not a compliance question
 */
export type AnswerStatus = 'compliant' | 'partial' | 'unsure' | 'gap' | 'skip'

/** The subset of a question definition the adapters need. */
interface QuestionMeta {
  id: string
  text: string
  type: string
  category: string
  options?: Array<string | { value: string; label: string }>
  complianceAnswer?: string
  helpText?: string
}

const NOT_APPLICABLE_PATTERN = /not applicable|not required/i

function optionValues(q: QuestionMeta): string[] {
  return (q.options ?? []).map((o) => (typeof o === 'string' ? o : o.value))
}

function indexQuestions(questions: QuestionMeta[]): Record<string, QuestionMeta> {
  const map: Record<string, QuestionMeta> = {}
  for (const q of questions) map[q.id] = q
  return map
}

/** yes/no: compliant when it matches the compliance answer (default 'yes'). */
function classifyYesNo(q: QuestionMeta | undefined, answer: string): AnswerStatus {
  return answer === (q?.complianceAnswer ?? 'yes') ? 'compliant' : 'gap'
}

// Each classifier mirrors the scoring function of its assessment so the
// report's action plan agrees with the score the user was shown.

// calculateStatutoryHealthScore — every question is yes/no.
function classifyStatutoryHealth(q: QuestionMeta | undefined, answer: string): AnswerStatus {
  return classifyYesNo(q, answer)
}

// calculateLabourCodeScore — MC: first option compliant, last option is
// "Not applicable", anything between is a gap.
function classifyLabourCode(q: QuestionMeta | undefined, answer: string): AnswerStatus {
  if (q?.type !== 'multiple_choice') return classifyYesNo(q, answer)
  const opts = optionValues(q)
  if (answer === opts[0]) return 'compliant'
  if (answer === opts[opts.length - 1] || NOT_APPLICABLE_PATTERN.test(answer)) return 'skip'
  return 'gap'
}

// calculateDPDPScore — MC: the compliance answer scores full, the second
// option scores half, the rest score zero.
function classifyDPDP(q: QuestionMeta | undefined, answer: string): AnswerStatus {
  if (q?.type !== 'multiple_choice') return classifyYesNo(q, answer)
  if (answer === q.complianceAnswer) return 'compliant'
  return optionValues(q).indexOf(answer) === 1 ? 'partial' : 'gap'
}

// calculateComplianceScore (state-wise) — single choice: 'na' counts as met,
// 'sometimes'/'applied' half credit, 'unsure' half credit.
function classifyStateWise(q: QuestionMeta | undefined, answer: string): AnswerStatus {
  if (q?.type === 'single_choice') {
    if (answer === 'na') return 'skip'
    if (answer === q.complianceAnswer || answer === 'yes') return 'compliant'
    if (answer === 'sometimes' || answer === 'applied') return 'partial'
    if (answer === 'unsure') return 'unsure'
    return 'gap'
  }
  if (q && !q.complianceAnswer) return 'compliant'
  return classifyYesNo(q, answer)
}

// calculateFoodBusinessScore — MC: compliance answer full credit, later
// options scale down linearly; "not required" options are not applicable.
function classifyFoodBusiness(q: QuestionMeta | undefined, answer: string): AnswerStatus {
  if (q?.type !== 'multiple_choice') return classifyYesNo(q, answer)
  if (!q.complianceAnswer || answer === q.complianceAnswer) return 'compliant'
  if (NOT_APPLICABLE_PATTERN.test(answer)) return 'skip'
  const opts = optionValues(q)
  const idx = opts.indexOf(answer)
  return idx > 0 && idx < opts.length - 1 ? 'partial' : 'gap'
}

function priorityFromScore(score: number): 'high' | 'medium' | 'low' {
  if (score < 40) return 'high'
  if (score < 70) return 'medium'
  return 'low'
}

function lowerPriority(p: 'high' | 'medium' | 'low'): 'high' | 'medium' | 'low' {
  return p === 'high' ? 'medium' : 'low'
}

function rawPercentage(value: unknown): number | null {
  if (typeof value === 'number') return value
  if (typeof value === 'object' && value !== null) {
    const v = value as AnyRecord
    if (typeof v.percentage === 'number') return v.percentage
    const max = v.maxScore ?? v.max
    if (typeof v.score === 'number' && typeof max === 'number' && max > 0) {
      return (v.score / max) * 100
    }
  }
  return null
}

function categoryStatus(percentage: number): UnifiedCategoryScore['status'] {
  return percentage >= 90 ? 'compliant' : percentage >= 70 ? 'needs_attention' : 'non_compliant'
}

const STATUS_NOTE: Partial<Record<AnswerStatus, string>> = {
  partial: 'Partially in place - complete the remaining steps below.',
  unsure: 'You were not sure about this one - verify your status, then act on the steps below.',
}

interface AdapterSpec {
  assessmentType: string
  rules: Record<string, ComplianceRule>
  questions: Record<string, QuestionMeta>
  categoryLabels: Record<string, string>
  classify: (q: QuestionMeta | undefined, answer: string) => AnswerStatus
  config: ReportConfig
}

/**
 * Turn stored answers into the unified report. Shared by every DB-backed
 * assessment so they all produce the same report shape:
 * - every non-compliant answer with a question definition becomes an action
 *   item (rule text when a rule exists, the question itself otherwise);
 * - per-category question/compliant counts are computed from the answers;
 * - priority comes from the category score, one step lower for partials.
 */
function buildReportFromAnswers(
  data: AssessmentData,
  answers: AnyRecord,
  spec: AdapterSpec
): UnifiedReportData {
  const overallScore = data.overall_score ?? 0
  const rawScores: AnyRecord = data.category_scores || {}

  const scoreFor = (key: string): number => rawPercentage(rawScores[key]) ?? overallScore
  const labelFor = (key: string, rule?: ComplianceRule): string =>
    spec.categoryLabels[key] ?? spec.categoryLabels[rule?.category ?? ''] ?? rule?.category ?? key

  const counts: Record<string, { total: number; compliant: number }> = {}
  const actionItems: UnifiedActionItem[] = []
  const compliantItems: UnifiedCompliantItem[] = []

  for (const [questionId, rawAnswer] of Object.entries(answers)) {
    if (typeof rawAnswer !== 'string' || rawAnswer === '') continue
    const q = spec.questions[questionId]
    const rule = spec.rules[questionId]
    // Neither a question nor a rule: profile/applicability data, not compliance.
    if (!q && !rule) continue

    const status = spec.classify(q, rawAnswer)
    if (status === 'skip') continue

    const key = q?.category ?? questionId.split('_')[0]
    const category = labelFor(key, rule)
    counts[key] ??= { total: 0, compliant: 0 }
    counts[key].total++

    const title = rule?.requirement ?? (q?.text ?? questionId).replace(/\?$/, '')
    if (status === 'compliant') {
      counts[key].compliant++
      compliantItems.push({ questionId, category, text: title })
      continue
    }

    const basePriority = priorityFromScore(scoreFor(key))
    const note = STATUS_NOTE[status]
    const remediation = rule?.actionIfNonCompliant ?? (q?.helpText ? [q.helpText] : [])
    actionItems.push({
      priority: status === 'partial' ? lowerPriority(basePriority) : basePriority,
      category,
      questionId,
      title,
      description: [note, rule?.governmentRef ?? q?.text].filter(Boolean).join(' '),
      remediation,
      governmentRef: rule?.governmentRef,
      officialLink: rule?.officialLink,
      penalty: rule?.penalty,
      deadline: rule?.deadline,
    })
  }

  const priorityRank = { high: 0, medium: 1, low: 2 }
  actionItems.sort((a, b) => priorityRank[a.priority] - priorityRank[b.priority])

  const categoryScores: UnifiedCategoryScore[] = Object.entries(rawScores).map(([key, value]) => {
    const score = Math.round(rawPercentage(value) ?? 0)
    return {
      category: labelFor(key),
      score,
      status: categoryStatus(score),
      questionCount: counts[key]?.total ?? 0,
      compliantCount: counts[key]?.compliant ?? 0,
    }
  })

  return {
    assessmentId: data.id || 'N/A',
    overallScore,
    riskLevel: getRiskLevel(overallScore),
    penaltyExposure: getPenaltyExposure(overallScore, spec.assessmentType),
    categoryScores,
    actionItems,
    compliantItems,
    userDetails: extractUserDetails(data),
    config: spec.config,
  }
}

function getAnswers(data: AssessmentData): AnyRecord {
  const responses = data.responses as AnyRecord | undefined
  return responses?.main || responses?.answers || responses || {}
}

const labelsFrom = (entries: Array<{ id: string; name: string }>): Record<string, string> =>
  Object.fromEntries(entries.map((e) => [e.id, e.name]))

// ============================================================================
// PER-ASSESSMENT ADAPTERS
// ============================================================================

export function adaptStatutoryHealth(data: AssessmentData): UnifiedReportData {
  return buildReportFromAnswers(data, getAnswers(data), {
    assessmentType: 'statutory_health',
    rules: STATUTORY_HEALTH_COMPLIANCE_RULES,
    questions: indexQuestions(STATUTORY_HEALTH_QUESTIONS),
    categoryLabels: STATUTORY_HEALTH_CATEGORY_LABELS,
    classify: classifyStatutoryHealth,
    config: STATUTORY_HEALTH_CONFIG,
  })
}

export function adaptLabourCode(data: AssessmentData): UnifiedReportData {
  return buildReportFromAnswers(data, getAnswers(data), {
    assessmentType: 'labour_code',
    rules: LABOUR_CODE_RULES,
    questions: indexQuestions(LABOUR_CODE_QUESTIONS),
    categoryLabels: labelsFrom(LABOUR_CODE_CATEGORIES),
    classify: classifyLabourCode,
    config: LABOUR_CODE_CONFIG,
  })
}

export function adaptDPDP(data: AssessmentData): UnifiedReportData {
  return buildReportFromAnswers(data, getAnswers(data), {
    assessmentType: 'dpdp',
    rules: DPDP_COMPLIANCE_RULES,
    questions: indexQuestions(ALL_DPDP_QUESTIONS.map((q) => ({ ...q, category: q.phase }))),
    categoryLabels: DPDP_CATEGORY_LABELS,
    classify: classifyDPDP,
    config: DPDP_CONFIG,
  })
}

export function adaptStateWise(data: AssessmentData): UnifiedReportData {
  return buildReportFromAnswers(data, getAnswers(data), {
    assessmentType: 'state_wise',
    rules: STATE_WISE_COMPLIANCE_RULES,
    questions: indexQuestions(PHASE2_QUESTIONS),
    categoryLabels: STATE_WISE_CATEGORY_LABELS,
    classify: classifyStateWise,
    config: STATE_WISE_CONFIG,
  })
}

export function adaptFoodBusiness(data: AssessmentData): UnifiedReportData {
  return buildReportFromAnswers(data, getAnswers(data), {
    assessmentType: 'food_business',
    rules: FOOD_COMPLIANCE_RULES,
    questions: indexQuestions(ALL_FOOD_BUSINESS_QUESTIONS),
    categoryLabels: FOOD_CATEGORY_LABELS,
    classify: classifyFoodBusiness,
    config: FOOD_BUSINESS_CONFIG,
  })
}

// ============================================================================
// POSH COMPLIANCE (from computed in-memory result)
// ============================================================================

const POSH_CATEGORY_LABELS: Record<string, string> = {
  icc_constitution: 'ICC Constitution',
  policy_documentation: 'Policy & Documentation',
  training_awareness: 'Training & Awareness',
  display_communication: 'Display & Communication',
  reporting_monitoring: 'Reporting & Monitoring',
  complaint_handling: 'Complaint Handling',
}

export interface POSHResultInput {
  overallScore: number
  riskLevel: string
  penaltyExposure: string
  categoryScores: Array<{
    category: string
    score: number
    status: 'compliant' | 'needs_attention' | 'non_compliant'
    questionCount: number
    compliantCount: number
  }>
  actionItems: UnifiedActionItem[]
  compliantItems: UnifiedCompliantItem[]
}

export interface POSHUserInput {
  fullName: string
  email: string
  phone?: string
  companyName: string
  state?: string
  employeeCount?: string
  industry?: string
}

/**
 * Adapts already-computed POSH result objects to UnifiedReportData.
 * Unlike the DB-based adapters, this takes in-memory computed objects directly
 * since POSH results are inline (not fetched from DB at PDF generation time).
 */
export function adaptPOSHResult(
  result: POSHResultInput,
  user: POSHUserInput,
  assessmentId?: string
): UnifiedReportData {
  return {
    assessmentId: assessmentId || 'N/A',
    overallScore: result.overallScore,
    riskLevel: result.riskLevel,
    penaltyExposure: result.penaltyExposure,
    categoryScores: result.categoryScores.map((cat) => ({
      ...cat,
      category: POSH_CATEGORY_LABELS[cat.category] || cat.category,
    })),
    actionItems: result.actionItems.map((item) => ({
      ...item,
      category: POSH_CATEGORY_LABELS[item.category] || item.category,
    })),
    compliantItems: result.compliantItems.map((item) => ({
      ...item,
      category: POSH_CATEGORY_LABELS[item.category] || item.category,
    })),
    userDetails: {
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      companyName: user.companyName,
      state: user.state || 'India',
      employeeCount: user.employeeCount,
      industry: user.industry,
    },
    config: POSH_CONFIG,
  }
}

/**
 * Adapts a raw `posh_assessments` DB row (server-side, gated PDF route) to
 * UnifiedReportData. Mirrors the mapping the client page performs before
 * calling adaptPOSHResult directly, so the server-generated PDF matches what
 * the client would have produced from the same stored result.
 */
export function adaptPOSHRow(row: AnyRecord): UnifiedReportData {
  const applicability = row.applicability_responses || {}
  const riskInfo = RISK_LEVEL_INFO[row.risk_level as keyof typeof RISK_LEVEL_INFO]

  const resultInput: POSHResultInput = {
    overallScore: row.overall_score ?? 0,
    riskLevel: riskInfo?.label || row.risk_level,
    penaltyExposure: riskInfo?.penaltyExposure || 'Unknown',
    categoryScores: (row.category_scores || []).map((cat: AnyRecord) => ({
      category: cat.categoryName,
      score: cat.percentage,
      status: cat.status,
      questionCount: cat.questionCount,
      compliantCount: cat.compliantCount,
    })),
    actionItems: row.action_items || [],
    compliantItems: row.compliant_items || [],
  }

  const userInput: POSHUserInput = {
    fullName: row.full_name || 'Not specified',
    email: row.email || '',
    phone: row.phone || undefined,
    companyName: row.company_name || 'Not specified',
    state: POSH_STATE_LABELS[applicability.POSH_APP_006] || applicability.POSH_APP_006 || 'India',
    employeeCount: POSH_EMPLOYEE_COUNT_LABELS[applicability.POSH_APP_001] || applicability.POSH_APP_001 || 'Not specified',
    industry: POSH_INDUSTRY_LABELS[applicability.POSH_APP_008] || applicability.POSH_APP_008 || 'Not specified',
  }

  return adaptPOSHResult(resultInput, userInput, row.id)
}
