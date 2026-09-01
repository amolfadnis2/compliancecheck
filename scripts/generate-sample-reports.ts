/**
 * generate-sample-reports.ts — regenerates the watermarked "SAMPLE" PDF
 * shown pre-payment on the homepage, all 7 assessment landing pages, and the
 * results teaser, so prospects can see real report quality before paying.
 *
 * Reuses the SAME unified PDF generator + report-data-adapter.ts adapters
 * that produce the real paid reports (CLAUDE.md sec 11 — never hand-build a
 * separate PDF path). Answers are synthetic (a fixed dummy company, a
 * deterministic yes/no pattern over each assessment's real compliance-rule
 * questions), but every finding, penalty, deadline and remediation step
 * shown is the same content a real paying user would see.
 *
 * Run:  npm run generate:samples
 * Rerun whenever a scoring/question/compliance-rule file changes for any
 * assessment type, so the samples stay in sync with the real reports.
 *
 * Writes: public/samples/<assessment_type>-sample.pdf
 */
import fs from 'node:fs'
import path from 'node:path'

import {
  adaptStatutoryHealth,
  adaptLabourCode,
  adaptDPDP,
  adaptStateWise,
  adaptFoodBusiness,
  adaptPOSHResult,
  type AssessmentData,
  type POSHResultInput,
  type POSHUserInput,
} from '../src/lib/pdf/report-data-adapter'
import {
  generateUnifiedReportBytes,
  type UnifiedReportData,
  type UnifiedActionItem,
  type UnifiedCompliantItem,
  type UnifiedUserDetails,
} from '../src/lib/pdf/unified-report-generator'
import { AUTO_DEALER_CONFIG } from '../src/lib/pdf/report-configs'
import { DPDP_COMPLIANCE_RULES } from '../src/lib/pdf/dpdp-compliance-rules'
import { FOOD_COMPLIANCE_RULES } from '../src/lib/pdf/food-business-compliance-rules'
import { LABOUR_CODE_RULES } from '../src/lib/assessments/labour-code-rules'
import { STATE_WISE_COMPLIANCE_RULES } from '../src/lib/pdf/state-wise-compliance-rules'
import { STATUTORY_HEALTH_COMPLIANCE_RULES } from '../src/lib/pdf/statutory-health-compliance-rules'
import { getRulesByCategory } from '../src/lib/assessments/posh/posh-compliance-rules'
import { RISK_LEVEL_INFO } from '../src/lib/assessments/posh/posh-compliance-questions'
import { PHASE2_STATUTORY_QUESTIONS } from '../src/lib/assessments/auto-dealer/phase-2-statutory'
import { PHASE3_WORKSHOP_EHS_QUESTIONS } from '../src/lib/assessments/auto-dealer/phase-3-workshop-ehs'
import { ASSESSMENT_TYPES } from '../src/lib/constants/assessment-types'

const WATERMARK = 'SAMPLE - ILLUSTRATIVE ONLY'
const OUT_DIR = path.join(process.cwd(), 'public', 'samples')

// Fixed, believable dummy company — the same identity across every sample so
// the set reads as one consistent illustrative business.
const SAMPLE_USER: UnifiedUserDetails = {
  fullName: 'Anita Sharma',
  email: 'sample@compliancecheck.co.in',
  phone: '+91 98765 43210',
  companyName: 'Sample Enterprises Pvt Ltd',
  state: 'Maharashtra',
  employeeCount: '51-100',
  industry: 'Manufacturing',
}

// ~1-in-3 questions marked compliant, the rest gaps — a realistic-looking
// mixed result rather than an all-pass or all-fail sample.
function isSampleCompliant(index: number): boolean {
  return index % 3 === 0
}

interface RuleLike {
  category?: string
}

/**
 * Builds a fake AssessmentData covering every question in a real
 * compliance-rules map, so the resulting report shows genuine findings,
 * penalties and remediation text — nothing invented.
 */
function buildSampleAssessmentData<R extends RuleLike>(
  id: string,
  rules: Record<string, R>
): AssessmentData {
  const answers: Record<string, string> = {}
  const categoryTotals: Record<string, { total: number; passed: number }> = {}

  Object.entries(rules).forEach(([questionId, rule], index) => {
    const category = rule.category || 'General'
    const compliant = isSampleCompliant(index)
    answers[questionId] = compliant ? 'yes' : 'no'
    if (!categoryTotals[category]) categoryTotals[category] = { total: 0, passed: 0 }
    categoryTotals[category].total += 1
    if (compliant) categoryTotals[category].passed += 1
  })

  const category_scores: Record<string, { percentage: number; total: number; passed: number }> = {}
  let totalCount = 0
  let totalPassed = 0
  Object.entries(categoryTotals).forEach(([category, { total, passed }]) => {
    category_scores[category] = { percentage: Math.round((passed / total) * 100), total, passed }
    totalCount += total
    totalPassed += passed
  })

  return {
    id,
    overall_score: totalCount > 0 ? Math.round((totalPassed / totalCount) * 100) : 0,
    category_scores,
    responses: { answers, userDetails: SAMPLE_USER },
    user_details: SAMPLE_USER,
  }
}

function buildPOSHSample(): UnifiedReportData {
  const categories = [
    'icc_constitution',
    'policy_documentation',
    'training_awareness',
    'display_communication',
    'reporting_monitoring',
    'complaint_handling',
  ]

  const actionItems: UnifiedActionItem[] = []
  const compliantItems: UnifiedCompliantItem[] = []
  const categoryScores: POSHResultInput['categoryScores'] = []
  let totalCount = 0
  let totalPassed = 0

  categories.forEach((category) => {
    const rules = getRulesByCategory(category)
    let passed = 0
    rules.forEach((rule, index) => {
      const compliant = isSampleCompliant(index)
      if (compliant) {
        passed += 1
        compliantItems.push({ questionId: rule.questionId, category, text: rule.requirement })
      } else {
        actionItems.push({
          priority: 'medium',
          category,
          questionId: rule.questionId,
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
    const percentage = rules.length > 0 ? Math.round((passed / rules.length) * 100) : 0
    categoryScores.push({
      category,
      score: percentage,
      status: percentage >= 90 ? 'compliant' : percentage >= 70 ? 'needs_attention' : 'non_compliant',
      questionCount: rules.length,
      compliantCount: passed,
    })
    totalCount += rules.length
    totalPassed += passed
  })

  actionItems.forEach((item) => {
    const catScore = categoryScores.find((c) => c.category === item.category)?.score ?? 50
    item.priority = catScore < 40 ? 'high' : catScore < 70 ? 'medium' : 'low'
  })

  const overallScore = totalCount > 0 ? Math.round((totalPassed / totalCount) * 100) : 0
  const riskInfo =
    overallScore >= 90 ? RISK_LEVEL_INFO.low : overallScore >= 70 ? RISK_LEVEL_INFO.medium : RISK_LEVEL_INFO.high

  const result: POSHResultInput = {
    overallScore,
    riskLevel: riskInfo.label,
    penaltyExposure: riskInfo.penaltyExposure,
    categoryScores,
    actionItems,
    compliantItems,
  }
  const user: POSHUserInput = { ...SAMPLE_USER }

  return adaptPOSHResult(result, user, 'SAMPLE-POSH')
}

function timelineToDeadline(timeline: string): string {
  if (timeline === 'immediate') return 'Immediate'
  if (timeline === '30_days') return 'Within 30 days'
  if (timeline === '90_days') return 'Within 90 days'
  return timeline
}

function titleCase(snake: string): string {
  return snake
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

// Auto-dealer has its own standalone server-side PDF generator (CLAUDE.md sec
// 14 — intentionally not on the shared adapter). For the sample only, we
// build a UnifiedReportData directly from a subset of its real question bank
// so the sample still uses the shared generator without touching the live
// auto-dealer report route.
function buildAutoDealerSample(): UnifiedReportData {
  const questions = [...PHASE2_STATUTORY_QUESTIONS, ...PHASE3_WORKSHOP_EHS_QUESTIONS]
  const actionItems: UnifiedActionItem[] = []
  const compliantItems: UnifiedCompliantItem[] = []
  const categoryTotals: Record<string, { total: number; passed: number }> = {}

  questions.forEach((q, index) => {
    const category = titleCase(q.complianceArea)
    const compliant = isSampleCompliant(index)
    if (!categoryTotals[category]) categoryTotals[category] = { total: 0, passed: 0 }
    categoryTotals[category].total += 1
    if (compliant) {
      categoryTotals[category].passed += 1
      compliantItems.push({ questionId: q.id, category, text: q.text })
    } else {
      actionItems.push({
        priority: 'medium',
        category,
        questionId: q.id,
        title: q.gapTemplate.finding,
        description: q.source,
        remediation: [q.gapTemplate.recommendation],
        governmentRef: q.source,
        penalty: q.gapTemplate.penaltyExposure,
        deadline: timelineToDeadline(q.gapTemplate.timeline),
      })
    }
  })

  const categoryScores = Object.entries(categoryTotals).map(([category, { total, passed }]) => {
    const percentage = total > 0 ? Math.round((passed / total) * 100) : 0
    return {
      category,
      score: percentage,
      status:
        percentage >= 90 ? ('compliant' as const) : percentage >= 70 ? ('needs_attention' as const) : ('non_compliant' as const),
      questionCount: total,
      compliantCount: passed,
    }
  })

  actionItems.forEach((item) => {
    const catScore = categoryScores.find((c) => c.category === item.category)?.score ?? 50
    item.priority = catScore < 40 ? 'high' : catScore < 70 ? 'medium' : 'low'
  })

  const totalCount = questions.length
  const totalPassed = Object.values(categoryTotals).reduce((s, c) => s + c.passed, 0)
  const overallScore = totalCount > 0 ? Math.round((totalPassed / totalCount) * 100) : 0
  const riskLevel = overallScore >= 90 ? 'Low Risk' : overallScore >= 70 ? 'Moderate Risk' : overallScore >= 40 ? 'High Risk' : 'Critical Risk'
  const penaltyExposure = overallScore >= 90 ? 'Minimal' : overallScore >= 70 ? 'Moderate' : overallScore >= 40 ? 'Significant' : 'Severe'

  return {
    assessmentId: 'SAMPLE-AUTO-DEALER',
    overallScore,
    riskLevel,
    penaltyExposure,
    categoryScores,
    actionItems,
    compliantItems,
    userDetails: SAMPLE_USER,
    config: AUTO_DEALER_CONFIG,
  }
}

const SAMPLES: Array<{ type: string; build: () => UnifiedReportData }> = [
  {
    type: ASSESSMENT_TYPES.STATUTORY_HEALTH,
    build: () => adaptStatutoryHealth(buildSampleAssessmentData('SAMPLE-STATUTORY-HEALTH', STATUTORY_HEALTH_COMPLIANCE_RULES)),
  },
  {
    type: ASSESSMENT_TYPES.LABOUR_CODE,
    build: () => adaptLabourCode(buildSampleAssessmentData('SAMPLE-LABOUR-CODE', LABOUR_CODE_RULES)),
  },
  {
    type: ASSESSMENT_TYPES.DPDP,
    build: () => adaptDPDP(buildSampleAssessmentData('SAMPLE-DPDP', DPDP_COMPLIANCE_RULES)),
  },
  {
    type: ASSESSMENT_TYPES.STATE_WISE_COMPLIANCE,
    build: () => adaptStateWise(buildSampleAssessmentData('SAMPLE-STATE-WISE', STATE_WISE_COMPLIANCE_RULES)),
  },
  {
    type: ASSESSMENT_TYPES.FOOD_BUSINESS,
    build: () => adaptFoodBusiness(buildSampleAssessmentData('SAMPLE-FOOD-BUSINESS', FOOD_COMPLIANCE_RULES)),
  },
  {
    type: ASSESSMENT_TYPES.POSH,
    build: buildPOSHSample,
  },
  {
    type: ASSESSMENT_TYPES.AUTO_DEALER,
    build: buildAutoDealerSample,
  },
]

function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true })

  for (const sample of SAMPLES) {
    const data = sample.build()
    const bytes = generateUnifiedReportBytes(data, { watermarkText: WATERMARK })
    const outPath = path.join(OUT_DIR, `${sample.type}-sample.pdf`)
    fs.writeFileSync(outPath, bytes)
    console.log(`Wrote ${path.relative(process.cwd(), outPath)} (${bytes.byteLength} bytes)`)
  }

  console.log(`\nGenerated ${SAMPLES.length} sample reports in ${path.relative(process.cwd(), OUT_DIR)}`)
}

main()
