/**
 * Sample report fixtures — the public "see what you get before you pay" PDFs.
 *
 * These run the REAL scoring functions, the REAL compliance rules and the REAL
 * unified generator over a fictional company's answers. Nothing here is
 * hand-written report copy, so a sample can never drift from the product a
 * buyer actually receives.
 *
 * Every report built here sets `isSample: true`, which puts a "SAMPLE REPORT -
 * FICTIONAL COMPANY" banner on the cover. Never reuse these builders for a real
 * assessment.
 */

import { ASSESSMENT_TYPES, type AssessmentType } from '@/lib/constants/assessment-types'
import type { UnifiedReportData, UnifiedActionItem, UnifiedCompliantItem } from './unified-report-generator'
import { adaptStatutoryHealth, adaptDPDP, adaptPOSHResult, type POSHResultInput } from './report-data-adapter'
import { calculateStatutoryHealthScore } from '@/lib/assessments/statutory-health-questions'
import { calculateDPDPScore, getRelevantQuestions } from '@/lib/assessments/dpdp-questions'
import {
  ALL_POSH_QUESTIONS,
  POSH_CATEGORIES,
  RISK_LEVEL_INFO,
  calculatePOSHScore,
  type POSHQuestion,
} from '@/lib/assessments/posh/posh-compliance-questions'
import { getRuleByQuestionId } from '@/lib/assessments/posh/posh-compliance-rules'

// ============================================================================
// THE FICTIONAL COMPANY
// ============================================================================

/**
 * Deliberately obvious as a demo: the name says "Demo", the contact is a
 * ComplianceCheck address, and the cover carries a SAMPLE banner.
 */
const DEMO_COMPANY = {
  fullName: 'Sample Report',
  email: 'samples@compliancecheck.co.in',
  phone: '',
  companyName: 'Demo Manufacturing Pvt Ltd',
  state: 'Maharashtra',
  employeeCount: '26-50',
  industry: 'Manufacturing',
}

// ============================================================================
// STATUTORY HEALTH CHECK
// ============================================================================

/**
 * A mid-range profile: registered for the big-ticket items but slipping on
 * deposits, professional tax and gratuity provisioning — the pattern a real
 * 45-person manufacturer usually shows.
 */
const STATUTORY_HEALTH_ANSWERS: Record<string, string> = {
  pf_1: 'yes',       // EPFO registered
  pf_2: 'no',        // but monthly deposits slip past the 15th
  esi_1: 'yes',      // ESIC registered
  esi_2: 'no',       // contributions delayed
  esi_3: 'yes',      // informational
  pt_1: 'yes',       // informational (state)
  pt_2: 'no',        // no PTRC
  pt_3: 'no',        // no monthly PT process
  gratuity_1: 'yes', // records maintained
  gratuity_2: 'no',  // no funding arrangement
  bonus_1: 'yes',    // bonus paid
  bonus_2: 'yes',    // registers maintained
}

function buildStatutoryHealthSample(): UnifiedReportData {
  const { overallScore, categoryScores } = calculateStatutoryHealthScore(STATUTORY_HEALTH_ANSWERS)

  return {
    ...adaptStatutoryHealth({
      id: 'SAMPLE',
      assessment_type: ASSESSMENT_TYPES.STATUTORY_HEALTH,
      overall_score: overallScore,
      category_scores: categoryScores,
      responses: { answers: STATUTORY_HEALTH_ANSWERS },
      userDetails: DEMO_COMPANY,
    }),
    isSample: true,
  }
}

// ============================================================================
// DPDP GAP ASSESSMENT
// ============================================================================

/**
 * Question IDs the demo company is compliant on; every other relevant question
 * is answered non-compliantly. The story: privacy notice and basic security
 * hygiene in place, but no consent records, no breach drill, no retention
 * schedule and no DPO — the usual shape for an SME that has not started DPDP
 * work in earnest.
 */
const DPDP_SAMPLE_COMPLIANT = new Set([
  'consent_1', 'consent_2', 'consent_3', 'consent_7',
  'security_1', 'security_2', 'security_3', 'security_4', 'security_6',
  'rights_1', 'rights_2', 'rights_4',
  'breach_1',
  'gov_1', 'gov_3',
])

function buildDPDPSample(): UnifiedReportData {
  // The demo company does not process children's data, so those questions are
  // out of scope — matching how a real profile filters the question set.
  const profile = {
    processesChildrenData: 'no',
    processesHealthData: 'no',
    processesSensitiveData: 'yes',
  }

  // Answers are derived from the real question definitions so a compliant
  // answer is always the question's own complianceAnswer (several DPDP
  // questions are multiple-choice, where 'yes' scores nothing).
  const answers: Record<string, string> = {}
  getRelevantQuestions(false).forEach((q) => {
    if (DPDP_SAMPLE_COMPLIANT.has(q.id)) {
      answers[q.id] = q.complianceAnswer ?? 'yes'
    } else if (q.type === 'yes_no') {
      answers[q.id] = 'no'
    } else {
      // A genuine non-compliant option from the question itself.
      answers[q.id] = q.options?.find((opt) => opt !== q.complianceAnswer) ?? 'no'
    }
  })

  const { overallScore, phaseScores } = calculateDPDPScore(answers, profile)

  return {
    ...adaptDPDP({
      id: 'SAMPLE',
      assessment_type: ASSESSMENT_TYPES.DPDP,
      overall_score: overallScore,
      category_scores: phaseScores,
      responses: { answers, profile },
      userDetails: DEMO_COMPANY,
    }),
    isSample: true,
  }
}

// ============================================================================
// POSH ACT COMPLIANCE
// ============================================================================

/**
 * Pick a deterministic, realistic answer for a POSH question.
 *
 * Rather than hardcoding ~45 answers (which would rot every time a question
 * changes), roughly two out of every three questions are answered compliantly
 * and the rest are answered with a genuine non-compliant option from the
 * question itself. The result is a mid-range score with real gaps in every
 * category — exactly what a sample needs to show.
 */
function sampleAnswerFor(question: POSHQuestion, index: number): string | undefined {
  const beCompliant = index % 3 !== 2

  if (beCompliant) {
    return question.compliantAnswers[0]
  }

  // A non-compliant answer, taken from the question's own options so the PDF
  // renders exactly what a real respondent could have chosen.
  const nonCompliant = question.options?.find(
    (opt) =>
      !question.compliantAnswers.includes(opt.value) &&
      !(question.partiallyCompliantAnswers ?? []).includes(opt.value)
  )
  return nonCompliant?.value ?? (question.type === 'yes_no' ? 'no' : question.compliantAnswers[0])
}

function buildPOSHSample(): UnifiedReportData {
  // Questions that depend on another answer are skipped: without the parent
  // answer they would not be shown to a real respondent either.
  const questions = ALL_POSH_QUESTIONS.filter((q) => !q.conditionalOn)

  const responses: Record<string, string> = {}
  questions.forEach((q, i) => {
    const answer = sampleAnswerFor(q, i)
    if (answer) responses[q.id] = answer
  })

  const result = calculatePOSHScore(questions, responses)

  // Same mapping the POSH results page performs before calling
  // adaptPOSHResult, so the sample matches a real POSH report.
  const categoryScores: POSHResultInput['categoryScores'] = Object.entries(result.categoryScores).map(
    ([code, cs]) => {
      const categoryQuestions = questions.filter((q) => q.category === code)
      return {
        category: POSH_CATEGORIES[code as keyof typeof POSH_CATEGORIES]?.name ?? code,
        score: cs.percentage,
        status: cs.status,
        questionCount: categoryQuestions.length,
        compliantCount: result.compliantItems.filter((c) => c.category === code).length,
      }
    }
  )

  const actionItems: UnifiedActionItem[] = result.actionItems.flatMap((item) => {
    const rule = getRuleByQuestionId(item.questionId)
    if (!rule) return []
    return [{
      priority: item.priority,
      category: item.category,
      questionId: item.questionId,
      title: rule.requirement,
      description: item.text,
      remediation: rule.actionIfNonCompliant,
      governmentRef: rule.governmentRef,
      officialLink: rule.officialLink,
      penalty: rule.penalty,
      deadline: rule.deadline,
    }]
  })

  const compliantItems: UnifiedCompliantItem[] = result.compliantItems.map((item) => ({
    questionId: item.questionId,
    category: item.category,
    text: item.text,
  }))

  const riskInfo = RISK_LEVEL_INFO[result.riskLevel]

  return {
    ...adaptPOSHResult(
      {
        overallScore: result.overallPercentage,
        riskLevel: riskInfo?.label ?? result.riskLevel,
        penaltyExposure: riskInfo?.penaltyExposure ?? 'Unknown',
        categoryScores,
        actionItems,
        compliantItems,
      },
      DEMO_COMPANY,
      'SAMPLE'
    ),
    isSample: true,
  }
}

// ============================================================================
// REGISTRY
// ============================================================================

/**
 * Assessment types that have a public sample report. Only the paid
 * assessments need one — a free assessment shows its full report anyway.
 *
 * Must stay in step with SAMPLE_REPORT_SLUGS (guarded by a unit test); the
 * slugs live in sample-report-paths.ts so linking to a sample does not drag
 * the jsPDF generator into a page bundle.
 */
export const SAMPLE_REPORT_BUILDERS: Partial<Record<AssessmentType, () => UnifiedReportData>> = {
  [ASSESSMENT_TYPES.STATUTORY_HEALTH]: buildStatutoryHealthSample,
  [ASSESSMENT_TYPES.DPDP]: buildDPDPSample,
  [ASSESSMENT_TYPES.POSH]: buildPOSHSample,
}

export function buildSampleReport(type: AssessmentType): UnifiedReportData | null {
  const builder = SAMPLE_REPORT_BUILDERS[type]
  return builder ? builder() : null
}
