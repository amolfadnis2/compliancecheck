'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  CheckCircle, AlertTriangle, XCircle, ArrowLeft, Building, Loader2,
  FileText, Shield, AlertCircle
} from 'lucide-react'
import { CATEGORY_INFO } from '@/lib/assessments/statutory-health-questions'
import { DPDP_CATEGORIES } from '@/lib/assessments/dpdp-questions'
import { DownloadButtons } from '@/components/results/download-buttons'
import { ASSESSMENT_TYPES, getLocalStorageKey } from '@/lib/constants/assessment-types'

// ============================================================================
// COMPLIANCE SUMMARY DATA
// ============================================================================

// Types moved inline where needed

const QUESTION_SUMMARIES: Record<string, { compliant: string; nonCompliant: string; priority: 'high' | 'medium' | 'low' }> = {
  // STATUTORY HEALTH CHECK QUESTIONS
  pf_1: { 
    compliant: 'EPFO Registration is active',
    nonCompliant: 'EPFO Registration missing - mandatory for 20+ employees',
    priority: 'high'
  },
  pf_2: {
    compliant: 'PF contributions deposited on time',
    nonCompliant: 'PF contributions delayed - 12% interest + damages apply',
    priority: 'high'
  },
  esi_1: {
    compliant: 'ESIC Registration is active',
    nonCompliant: 'ESIC Registration missing - mandatory for 10+ employees',
    priority: 'high'
  },
  esi_2: {
    compliant: 'ESI contributions deposited on time',
    nonCompliant: 'ESI contributions delayed - penalty of 2x amount applies',
    priority: 'high'
  },
  esi_3: {
    compliant: 'ESI wage ceiling monitored correctly',
    nonCompliant: 'ESI wage ceiling not being tracked',
    priority: 'medium'
  },
  pt_1: {
    compliant: 'Professional Tax applicability verified',
    nonCompliant: 'Professional Tax applicability not confirmed',
    priority: 'medium'
  },
  pt_2: {
    compliant: 'PTRC Registration in place',
    nonCompliant: 'PTRC Registration missing - required in applicable states',
    priority: 'medium'
  },
  pt_3: {
    compliant: 'PT deductions and deposits regular',
    nonCompliant: 'PT deductions/deposits not regular',
    priority: 'medium'
  },
  gratuity_1: {
    compliant: 'Gratuity liability being tracked',
    nonCompliant: 'Gratuity liability not tracked - legal requirement for 10+ employees',
    priority: 'medium'
  },
  gratuity_2: {
    compliant: 'Gratuity funding/insurance in place',
    nonCompliant: 'Gratuity not funded - consider LIC Group Gratuity',
    priority: 'low'
  },
  bonus_1: {
    compliant: 'Statutory bonus paid correctly',
    nonCompliant: 'Statutory bonus compliance gap - 8.33% minimum required',
    priority: 'high'
  },
  bonus_2: {
    compliant: 'Bonus registers maintained properly',
    nonCompliant: 'Bonus registers not maintained - Form A, B, C, D required',
    priority: 'medium'
  },

  // LABOUR CODE QUESTIONS - Code on Wages
  wages_1: {
    compliant: 'Minimum wage compliance in place',
    nonCompliant: 'Minimum wage not being paid - immediate rectification needed',
    priority: 'high'
  },
  wages_2: {
    compliant: 'Wages paid within 7-day timeline',
    nonCompliant: 'Wage payment delays - Code mandates payment within 7 days',
    priority: 'high'
  },
  wages_3: {
    compliant: 'Full & final settlement within 2 days',
    nonCompliant: 'F&F settlement delayed - Code requires 2 working days',
    priority: 'medium'
  },
  wages_4: {
    compliant: 'Basic wage is 50%+ of CTC',
    nonCompliant: 'Basic wage below 50% - restructure CTC to avoid PF/gratuity recalculation',
    priority: 'high'
  },
  wages_5: {
    compliant: 'Overtime paid at 2x rate',
    nonCompliant: 'Overtime rate non-compliant - must be 2x normal wage',
    priority: 'medium'
  },
  wages_6: {
    compliant: 'Gender pay parity maintained',
    nonCompliant: 'Gender pay gap exists - Equal Remuneration provisions apply',
    priority: 'high'
  },
  wages_7: {
    compliant: 'Statutory bonus paid on time',
    nonCompliant: 'Bonus payment delayed - pay within 8 months of year end',
    priority: 'high'
  },

  // LABOUR CODE QUESTIONS - Social Security
  ss_1: {
    compliant: 'All eligible employees enrolled in EPF',
    nonCompliant: 'EPF enrolment gaps - register all eligible employees',
    priority: 'high'
  },
  ss_2: {
    compliant: 'All eligible employees covered under ESI',
    nonCompliant: 'ESI coverage gaps - mandatory for 10+ employees',
    priority: 'high'
  },
  ss_3: {
    compliant: 'Gratuity insurance/provision in place',
    nonCompliant: 'Gratuity liability not secured - consider LIC Group Gratuity',
    priority: 'medium'
  },
  ss_4: {
    compliant: 'Maternity benefits compliant',
    nonCompliant: 'Maternity benefit gaps - 26 weeks paid leave mandatory',
    priority: 'high'
  },
  ss_5: {
    compliant: 'Gig/platform workers provisions addressed',
    nonCompliant: 'Gig worker social security not addressed',
    priority: 'medium'
  },
  ss_6: {
    compliant: 'Creche facility provided',
    nonCompliant: 'Creche facility missing - mandatory for 50+ employees',
    priority: 'medium'
  },
  ss_7: {
    compliant: 'Building workers cess compliant',
    nonCompliant: 'Building workers cess not paid',
    priority: 'medium'
  },
  ss_8: {
    compliant: 'Social security contributions regular',
    nonCompliant: 'Social security contribution delays',
    priority: 'high'
  },

  // LABOUR CODE QUESTIONS - OSH Code
  osh_1: {
    compliant: 'Shram Suvidha registration complete',
    nonCompliant: 'Shram Suvidha registration pending - complete within 60 days',
    priority: 'high'
  },
  osh_2: {
    compliant: 'Working hours within 8-hour limit',
    nonCompliant: 'Working hours exceed 8-hour daily limit',
    priority: 'medium'
  },
  osh_3: {
    compliant: 'Overtime consent process in place',
    nonCompliant: 'Overtime consent not being obtained',
    priority: 'medium'
  },
  osh_4: {
    compliant: 'Women night shift provisions met',
    nonCompliant: 'Women night shift safeguards missing',
    priority: 'medium'
  },
  osh_5: {
    compliant: 'Contract labour registration complete',
    nonCompliant: 'Contract labour registration missing - required for 50+ contract workers',
    priority: 'high'
  },
  osh_6: {
    compliant: 'Factory/establishment registration valid',
    nonCompliant: 'Factory registration not valid or missing',
    priority: 'high'
  },
  osh_7: {
    compliant: 'Safety committee formed',
    nonCompliant: 'Safety committee not formed - required for hazardous industries',
    priority: 'medium'
  },
  osh_8: {
    compliant: 'Leave policy compliant with Code',
    nonCompliant: 'Leave entitlements not as per OSH Code',
    priority: 'medium'
  },

  // LABOUR CODE QUESTIONS - Industrial Relations
  industrial_relations_1: {
    compliant: 'Grievance Redressal Committee formed',
    nonCompliant: 'GRC not formed - mandatory for 20+ employees',
    priority: 'high'
  },
  industrial_relations_2: {
    compliant: 'Standing Orders certified',
    nonCompliant: 'Standing Orders not certified - required for 300+ employees',
    priority: 'high'
  },
  industrial_relations_3: {
    compliant: 'Works Committee constituted',
    nonCompliant: 'Works Committee missing - required for 100+ employees',
    priority: 'medium'
  },
  industrial_relations_4: {
    compliant: 'Strike/lockout notice procedures known',
    nonCompliant: 'Strike notice procedures not established',
    priority: 'low'
  },
  industrial_relations_5: {
    compliant: 'Fixed-term employee benefits equal to permanent staff',
    nonCompliant: 'Fixed-term employees not getting equal benefits',
    priority: 'high'
  },
  industrial_relations_6: {
    compliant: 'Retrenchment procedures documented',
    nonCompliant: 'Retrenchment process not compliant with Code',
    priority: 'medium'
  },
  industrial_relations_7: {
    compliant: 'Trade union recognition process in place',
    nonCompliant: 'Trade union recognition procedures not established',
    priority: 'low'
  },
}

// ============================================================================
// TYPES
// ============================================================================

interface LocalAssessmentData {
  id: string
  assessment_type: string
  status: string
  responses: {
    userDetails?: Record<string, string>
    answers?: Record<string, string>
  }
  overall_score?: number
  category_scores?: Record<string, { score: number; max: number; percentage: number }>
  userDetails?: Record<string, string>
  created_at: string
}

interface LocalStorageResultsPageProps {
  id: string
  assessmentType: string
}

// ============================================================================
// HELPER FUNCTIONS  
// ============================================================================

function getStatusFromScore(score: number, isDPDP: boolean = false) {
  if (isDPDP) {
    // DPDP uses different status labels
    if (score >= 80) {
      return { status: 'Ready', color: 'green', description: 'Your organisation demonstrates strong DPDP compliance readiness.' }
    } else if (score >= 60) {
      return { status: 'Needs Attention', color: 'amber', description: 'Several areas require attention before May 2027 deadline.' }
    } else if (score >= 40) {
      return { status: 'At Risk', color: 'orange', description: 'Significant gaps. Immediate action needed to avoid penalties.' }
    } else {
      return { status: 'Critical', color: 'red', description: 'Critical compliance gaps. Immediate action required to avoid severe penalties.' }
    }
  }
  
  // Standard status for statutory/labour code
  if (score >= 80) {
    return { status: 'Compliant', color: 'green', description: 'Your organisation meets key compliance requirements.' }
  } else if (score >= 50) {
    return { status: 'Needs Attention', color: 'amber', description: 'Several areas require immediate attention to avoid penalties.' }
  } else {
    return { status: 'Non-Compliant', color: 'red', description: 'Significant compliance gaps identified. Urgent action required.' }
  }
}

function analyseResponses(answers: Record<string, string>): {
  compliantItems: { id: string; text: string }[]
  nonCompliantItems: { id: string; text: string; priority: 'high' | 'medium' | 'low' }[]
} {
  const compliantItems: { id: string; text: string }[] = []
  const nonCompliantItems: { id: string; text: string; priority: 'high' | 'medium' | 'low' }[] = []

  Object.entries(answers).forEach(([questionId, answer]) => {
    const summary = QUESTION_SUMMARIES[questionId]
    if (!summary) return

    if (answer === 'yes') {
      compliantItems.push({ id: questionId, text: summary.compliant })
    } else if (answer === 'no') {
      nonCompliantItems.push({ id: questionId, text: summary.nonCompliant, priority: summary.priority })
    }
  })

  // Sort non-compliant by priority
  const priorityOrder = { high: 0, medium: 1, low: 2 }
  nonCompliantItems.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])

  return { compliantItems, nonCompliantItems }
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function LocalStorageResultsPage({ id, assessmentType }: LocalStorageResultsPageProps) {
  const [loading, setLoading] = useState(true)
  const [assessment, setAssessment] = useState<LocalAssessmentData | null>(null)
  const isLabourCode = assessmentType === ASSESSMENT_TYPES.LABOUR_CODE
  const isDPDP = assessmentType === ASSESSMENT_TYPES.DPDP
  const isStateWise = assessmentType === ASSESSMENT_TYPES.STATE_WISE_COMPLIANCE

  useEffect(() => {
    try {
      const storageKey = getLocalStorageKey(id)
      console.log('[LocalStorageResults] Loading from key:', storageKey)
      const stored = localStorage.getItem(storageKey)
      if (stored) {
        const data = JSON.parse(stored)
        console.log('[LocalStorageResults] Found data:', data.id, data.assessment_type)
        setAssessment(data)
      } else {
        console.log('[LocalStorageResults] No data found. Available keys:', 
          Object.keys(localStorage).filter(k => k.startsWith('assessment_')))
      }
    } catch (e) {
      console.error('[LocalStorageResults] Error loading:', e)
    } finally {
      setLoading(false)
    }
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your results...</p>
        </div>
      </div>
    )
  }

  if (!assessment) {
    return <DemoResultsView assessmentType={assessmentType} />
  }

  // Handle State-Wise Compliance data structure differently
  // State-wise stores: userDetails, phase2Responses, scoreResult.overallScore, scoreResult.categoryScores
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const assessmentData = assessment as any
  
  let userDetails: Record<string, string> = {}
  let answers: Record<string, string> = {}
  let overallScore = 50
  let categoryScores: Record<string, { score?: number; max?: number; percentage?: number } | number> = {}
  let stateWiseActionItems: Array<{ category: string; text: string; priority: string }> = []
  let stateWiseCompliantItems: Array<{ question: { category: string; text: string } }> = []
  
  if (isStateWise) {
    // State-wise compliance specific data extraction
    userDetails = assessmentData.userDetails || {}
    answers = assessmentData.phase2Responses || {}
    overallScore = assessmentData.scoreResult?.overallScore ?? 50
    categoryScores = assessmentData.scoreResult?.categoryScores || {}
    // State-wise uses 'gaps' not 'actionItems'
    stateWiseActionItems = (assessmentData.scoreResult?.gaps || []).map((gap: { question?: { category?: string; text?: string }; recommendation?: string }) => ({
      category: gap.question?.category || 'General',
      text: gap.recommendation || gap.question?.text || 'Action required',
      priority: 'high'
    }))
    stateWiseCompliantItems = assessmentData.scoreResult?.compliantItems || []
  } else {
    // Standard data extraction for other assessment types
    userDetails = assessment.userDetails || assessment.responses?.userDetails || {}
    answers = assessment.responses?.answers || {}
    overallScore = assessment.overall_score || 50
    categoryScores = assessment.category_scores || {}
  }
  
  const status = getStatusFromScore(overallScore, isDPDP)
  
  // For state-wise, use the pre-computed items; for others, analyze responses
  let compliantItems: { id: string; text: string }[] = []
  let nonCompliantItems: { id: string; text: string; priority: 'high' | 'medium' | 'low' }[] = []
  
  if (isStateWise) {
    // Convert state-wise format to display format
    compliantItems = stateWiseCompliantItems.map((item, idx) => ({
      id: `compliant_${idx}`,
      text: `${item.question?.category || 'General'}: ${item.question?.text || 'Compliant'}`
    }))
    nonCompliantItems = stateWiseActionItems.map((item, idx) => ({
      id: `action_${idx}`,
      text: item.text || item.category || 'Action required',
      priority: (item.priority as 'high' | 'medium' | 'low') || 'medium'
    }))
  } else {
    const analysisResult = analyseResponses(answers)
    compliantItems = analysisResult.compliantItems
    nonCompliantItems = analysisResult.nonCompliantItems
  }

  // Get category info based on assessment type
  const getCategoryInfo = (catId: string) => {
    if (isDPDP) {
      const dpdpCat = DPDP_CATEGORIES[catId as keyof typeof DPDP_CATEGORIES]
      return {
        name: dpdpCat?.label || catId,
        penaltyExposure: dpdpCat?.maxPenalty || 'Variable'
      }
    }
    return {
      name: CATEGORY_INFO[catId as keyof typeof CATEGORY_INFO]?.name || catId,
      penaltyExposure: null
    }
  }

  // Count by category
  const categoryStats = Object.entries(categoryScores).map(([cat, data]) => {
    const percentage = typeof data === 'number' ? data : data.percentage || 0
    const catInfo = getCategoryInfo(cat)
    return {
      category: cat,
      name: catInfo.name,
      penaltyExposure: catInfo.penaltyExposure,
      percentage,
      status: percentage >= 80 ? 'compliant' : percentage >= 50 ? 'needs-attention' : 'non-compliant'
    }
  })

  const compliantCategories = categoryStats.filter(c => c.status === 'compliant').length
  const totalCategories = categoryStats.length

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4 print:hidden">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          <div className="flex items-center gap-2 mb-2">
            <Badge className={isDPDP ? 'bg-purple-100 text-purple-700' : isLabourCode ? 'bg-blue-100 text-blue-700' : isStateWise ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}>
              {isDPDP ? 'DPDP Gap Assessment' : isLabourCode ? 'Labour Code Readiness' : isStateWise ? 'State-Wise Compliance' : 'Statutory Health Check'}
            </Badge>
            <Badge variant="outline" className="text-gray-500">
              {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </Badge>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Compliance Assessment Report</h1>
          {userDetails.companyName && (
            <div className="flex items-center gap-2 text-gray-600 mt-1">
              <Building className="w-4 h-4" />
              <span className="font-medium">{userDetails.companyName}</span>
              {userDetails.employeeCount && <span className="text-gray-400">|</span>}
              {userDetails.employeeCount && <span>{userDetails.employeeCount} employees</span>}
              {userDetails.state && <span className="text-gray-400">|</span>}
              {userDetails.state && <span>{userDetails.state}</span>}
            </div>
          )}
        </div>

        {/* DPDP Compliance Deadline Warning */}
        {isDPDP && (
          <Card className="mb-6 border-amber-300 bg-amber-50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h3 className="font-bold text-amber-900 mb-1">COMPLIANCE DEADLINE: 13 May 2027</h3>
                  <p className="text-sm text-amber-800 mb-2">
                    All DPDP Act 2023 substantive obligations become enforceable in 527 days. 
                    Penalties up to <strong>₹250 crore</strong> apply for non-compliance.
                  </p>
                  <p className="text-xs text-amber-700">
                    Your assessment shows <strong>{nonCompliantItems.length} gaps</strong> requiring remediation 
                    before this deadline.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Overall Score Card - Prominent */}
        <Card className={`mb-6 border-2 ${
          status.color === 'green' ? 'border-green-200 bg-green-50' :
          status.color === 'amber' ? 'border-amber-200 bg-amber-50' : 'border-red-200 bg-red-50'
        }`}>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-center md:text-left flex-1">
                <div className="flex items-center gap-3 justify-center md:justify-start mb-3">
                  {status.color === 'green' && <CheckCircle className="w-10 h-10 text-green-600" />}
                  {status.color === 'amber' && <AlertTriangle className="w-10 h-10 text-amber-600" />}
                  {status.color === 'red' && <XCircle className="w-10 h-10 text-red-600" />}
                  <div>
                    <h2 className={`text-2xl font-bold ${
                      status.color === 'green' ? 'text-green-700' :
                      status.color === 'amber' ? 'text-amber-700' : 'text-red-700'
                    }`}>{status.status}</h2>
                    <p className="text-gray-600 text-sm">{status.description}</p>
                  </div>
                </div>
                <div className="flex gap-4 justify-center md:justify-start text-sm">
                  <div className="flex items-center gap-1">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>{compliantItems.length} compliant</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <XCircle className="w-4 h-4 text-red-600" />
                    <span>{nonCompliantItems.length} gaps found</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Shield className="w-4 h-4 text-blue-600" />
                    <span>{compliantCategories}/{totalCategories} categories OK</span>
                  </div>
                </div>
              </div>
              <div className="text-center">
                <div className={`text-7xl font-bold ${
                  status.color === 'green' ? 'text-green-600' :
                  status.color === 'amber' ? 'text-amber-600' : 'text-red-600'
                }`}>{overallScore}%</div>
                <div className="text-gray-500 text-sm font-medium">Compliance Score</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Two Column Layout: What's Working / What Needs Attention */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* What's Working */}
          <Card className="border-green-200">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <CardTitle className="text-lg text-green-700">What You&apos;re Doing Right</CardTitle>
              </div>
              <CardDescription>{compliantItems.length} areas compliant</CardDescription>
            </CardHeader>
            <CardContent>
              {compliantItems.length === 0 ? (
                <p className="text-gray-500 text-sm italic">No compliant items found. Review all areas below.</p>
              ) : (
                <ul className="space-y-2">
                  {compliantItems.slice(0, 5).map((item) => (
                    <li key={item.id} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{item.text}</span>
                    </li>
                  ))}
                  {compliantItems.length > 5 && (
                    <li className="text-sm text-gray-500 italic pl-6">
                      + {compliantItems.length - 5} more in detailed report
                    </li>
                  )}
                </ul>
              )}
            </CardContent>
          </Card>

          {/* What Needs Attention */}
          <Card className="border-red-200">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <CardTitle className="text-lg text-red-700">Action Required</CardTitle>
              </div>
              <CardDescription>{nonCompliantItems.length} areas need attention</CardDescription>
            </CardHeader>
            <CardContent>
              {nonCompliantItems.length === 0 ? (
                <div className="text-center py-4">
                  <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <p className="text-green-700 font-medium">All areas compliant!</p>
                </div>
              ) : (
                <ul className="space-y-2">
                  {nonCompliantItems.slice(0, 5).map((item) => (
                    <li key={item.id} className="flex items-start gap-2 text-sm">
                      <span className={`px-1.5 py-0.5 rounded text-xs font-medium flex-shrink-0 ${
                        item.priority === 'high' ? 'bg-red-100 text-red-700' :
                        item.priority === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {item.priority === 'high' ? 'HIGH' : item.priority === 'medium' ? 'MED' : 'LOW'}
                      </span>
                      <span className="text-gray-700">{item.text}</span>
                    </li>
                  ))}
                  {nonCompliantItems.length > 5 && (
                    <li className="text-sm text-gray-500 italic pl-12">
                      + {nonCompliantItems.length - 5} more in detailed report
                    </li>
                  )}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Category Breakdown */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-600" />
              Category-wise Compliance Status
            </CardTitle>
            {isDPDP && (
              <CardDescription className="text-amber-600 flex items-center gap-1">
                <AlertTriangle className="w-4 h-4" />
                Penalty exposure shown for each category
              </CardDescription>
            )}
          </CardHeader>
          <CardContent>
            <div className={`grid gap-4 ${isDPDP ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-2 md:grid-cols-5'}`}>
              {categoryStats.map((cat) => (
                <div 
                  key={cat.category} 
                  className={`p-4 rounded-lg ${isDPDP ? 'border-l-4' : 'text-center border-2'} ${
                    cat.status === 'compliant' ? isDPDP ? 'bg-green-50 border-l-green-500' : 'bg-green-50 border-green-200' :
                    cat.status === 'needs-attention' ? isDPDP ? 'bg-amber-50 border-l-amber-500' : 'bg-amber-50 border-amber-200' : 
                    isDPDP ? 'bg-red-50 border-l-red-500' : 'bg-red-50 border-red-200'
                  }`}
                >
                  {!isDPDP && (
                    <div className="mb-2">
                      {cat.status === 'compliant' && <CheckCircle className="w-6 h-6 text-green-600 mx-auto" />}
                      {cat.status === 'needs-attention' && <AlertTriangle className="w-6 h-6 text-amber-600 mx-auto" />}
                      {cat.status === 'non-compliant' && <XCircle className="w-6 h-6 text-red-600 mx-auto" />}
                    </div>
                  )}
                  <div className="flex items-center justify-between gap-2">
                    <div className={isDPDP ? 'flex-1' : ''}>
                      <div className={`${isDPDP ? 'text-xl' : 'text-2xl'} font-bold ${
                        cat.status === 'compliant' ? 'text-green-600' :
                        cat.status === 'needs-attention' ? 'text-amber-600' : 'text-red-600'
                      }`}>{cat.percentage}%</div>
                      <div className={`${isDPDP ? 'text-sm' : 'text-xs'} text-gray-900 font-medium mt-1`}>
                        {cat.name}
                      </div>
                      {isDPDP && cat.penaltyExposure && (
                        <div className="text-xs text-red-600 font-semibold mt-1">
                          Penalty: {cat.penaltyExposure}
                        </div>
                      )}
                    </div>
                    {isDPDP && (
                      <div className="flex-shrink-0">
                        {cat.status === 'compliant' && <CheckCircle className="w-6 h-6 text-green-600" />}
                        {cat.status === 'needs-attention' && <AlertTriangle className="w-6 h-6 text-amber-600" />}
                        {cat.status === 'non-compliant' && <XCircle className="w-6 h-6 text-red-600" />}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Download CTA - Prominent */}
        <Card className={`${isDPDP ? 'border-purple-300 bg-gradient-to-r from-purple-50 to-pink-50' : 'border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50'} print:hidden`}>
          <CardContent className="pt-6">
            {isDPDP && (
              <div className="mb-4 p-3 bg-white border border-purple-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <FileText className="w-5 h-5 text-purple-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-purple-900 mb-1">
                      📋 Detailed Gap Analysis in PDF Report
                    </p>
                    <p className="text-xs text-purple-700">
                      Your PDF report contains <strong>detailed remediation steps, legal references, 
                      deadlines, and government portal links</strong> for each gap identified. 
                      The summary above shows only high-level findings.
                    </p>
                  </div>
                </div>
              </div>
            )}
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="flex-1 text-center md:text-left">
                <div className="flex items-center gap-2 justify-center md:justify-start mb-2">
                  <FileText className={`w-6 h-6 ${isDPDP ? 'text-purple-600' : 'text-blue-600'}`} />
                  <h3 className="text-lg font-bold text-gray-900">
                    {isDPDP ? 'Download Your Complete DPDP Gap Report' : 'Download Detailed Report'}
                  </h3>
                </div>
                <p className="text-gray-600 text-sm mb-2">
                  {isDPDP 
                    ? 'Get your comprehensive 11-page report with:'
                    : 'Get the complete PDF report with:'
                  }
                </p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    {isDPDP ? 'Specific gaps with 5-step remediation plans' : 'Step-by-step remediation actions'}
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    {isDPDP ? 'DPDP Act sections & penalty amounts for each gap' : 'Legal references & government portal links'}
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    {isDPDP ? 'Official portal links and compliance resources' : 'Deadlines & penalty information'}
                  </li>
                  {isDPDP && (
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Compliant items with maintenance guidance
                    </li>
                  )}
                </ul>
              </div>
              <div className="w-full md:w-auto">
                <DownloadButtons assessmentId={id} assessmentType={assessmentType} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Disclaimer */}
        <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <strong>Important:</strong> This assessment is based on your self-reported responses and is for 
              informational purposes only. It does not constitute legal, tax, or professional advice. 
              Compliance requirements vary based on specific circumstances and state rules. 
              Consult a qualified Company Secretary or Labour Law Consultant for specific advice.
            </div>
          </div>
        </div>

        {/* Upsell */}
        <Card className="mt-6 border-gray-200 print:hidden">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-center gap-4">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">
                  {isLabourCode ? 'Also Check: Statutory Compliance Health' : 'Next Step: Labour Code Readiness'}
                </h3>
                <p className="text-gray-600 text-sm">
                  {isLabourCode 
                    ? 'Verify your PF, ESI, Professional Tax, Gratuity and Bonus compliance.'
                    : 'Prepare for the new Labour Codes with our comprehensive readiness assessment.'
                  }
                </p>
              </div>
              <Link href={isLabourCode ? '/assessment/statutory-health' : '/assessment/labour-code'}>
                <Button variant="outline">
                  Start {isLabourCode ? 'Statutory Check' : 'Labour Code Assessment'} - FREE
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Report ID: {id}</p>
          <p className="mt-1">Generated by ComplianceCheck | compliancecheck.in</p>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// DEMO FALLBACK
// ============================================================================

function DemoResultsView({ assessmentType }: { assessmentType: string }) {
  const isLabourCode = assessmentType === ASSESSMENT_TYPES.LABOUR_CODE
  const isDPDP = assessmentType === ASSESSMENT_TYPES.DPDP
  
  // Get badge styling and text based on assessment type
  const getBadgeConfig = () => {
    if (isDPDP) return { className: 'bg-purple-100 text-purple-700', text: 'DPDP Gap Assessment' }
    if (isLabourCode) return { className: 'bg-blue-100 text-blue-700', text: 'Labour Code Readiness' }
    return { className: 'bg-green-100 text-green-700', text: 'Statutory Health Check' }
  }
  
  // Get assessment URL based on type
  const getAssessmentUrl = () => {
    if (isDPDP) return '/assessment/dpdp'
    if (isLabourCode) return '/assessment/labour-code'
    return '/assessment/statutory-health'
  }
  
  const badgeConfig = getBadgeConfig()
  
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          <Badge className={badgeConfig.className}>
            {badgeConfig.text}
          </Badge>
          <h1 className="text-2xl font-bold text-gray-900 mt-2">Assessment Results</h1>
          <p className="text-amber-600 text-sm mt-1">Note: Could not load saved results.</p>
        </div>

        <Card className="mb-6">
          <CardContent className="pt-6 text-center">
            <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Results Not Found</h2>
            <p className="text-gray-600 mb-4">
              We couldn&apos;t find your assessment results. This may happen if your browser 
              cleared storage or if you&apos;re on a different device.
            </p>
            <Link href={getAssessmentUrl()}>
              <Button>Take the Assessment Again</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
