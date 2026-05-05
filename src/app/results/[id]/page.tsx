import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, AlertTriangle, XCircle, ArrowLeft, Building } from 'lucide-react'
import { STATUTORY_HEALTH_QUESTIONS, CATEGORY_INFO } from '@/lib/assessments/statutory-health-questions'
import { LABOUR_CODE_CATEGORIES, calculateLabourCodeScore, generateLabourCodeActionItems, getComplianceStatus } from '@/lib/assessments/labour-code-questions'
import { DPDP_CATEGORIES, calculateDPDPScore, generateDPDPActionItems, getDPDPComplianceStatus, getDaysUntilDeadline } from '@/lib/assessments/dpdp-questions'
import { DownloadWithFeedback } from '@/components/results/download-with-feedback'
import { LocalStorageResultsPage } from '@/components/results/local-storage-results'
import { GatedResults, getGateConfig } from '@/components/results/gated-results'
import { ASSESSMENT_TYPES } from '@/lib/constants/assessment-types'

// Type definitions
interface ActionItem {
  id?: string;
  priority: 'high' | 'medium' | 'low' | 'critical';
  text?: string;
  title?: string;
  category?: string;
  phase?: string;
  description?: string;
  deadline?: string;
  penalty?: string;
}

interface CompanyDetails {
  company_name?: string;
  industry?: string;
  employee_count?: string;
  state?: string;
  contact_name?: string;
  email?: string;
}

interface AssessmentData {
  id: string;
  assessment_type: string;
  status: string;
  responses: {
    userDetails?: Record<string, string>;
    answers?: Record<string, string>;
    profile?: DPDPProfile;
  };
  overall_score?: number;
  category_scores?: Record<string, number>;
  action_items?: ActionItem[];
  company_details?: CompanyDetails;
  user_details?: Record<string, string>;
  maturity_level?: string;
  started_at?: string;
  completed_at?: string;
}

// DPDP Profile type for organization context
interface DPDPProfile {
  processesChildrenData?: string | boolean;
  processesHealthData?: string | boolean;
  processesSensitiveData?: string | boolean;
  revenue?: string;
}

// Initialize Supabase conditionally
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

interface PageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ type?: string }>
}

export default async function ResultsPage({ params, searchParams }: PageProps) {
  const { id } = await params
  const { type } = await searchParams
  
  const assessmentType = type || ASSESSMENT_TYPES.STATUTORY_HEALTH
  const isLabourCode = assessmentType === ASSESSMENT_TYPES.LABOUR_CODE
  const isDPDP = assessmentType === ASSESSMENT_TYPES.DPDP
  const isStateWise = assessmentType === ASSESSMENT_TYPES.STATE_WISE_COMPLIANCE
  const isFoodBusiness = assessmentType === ASSESSMENT_TYPES.FOOD_BUSINESS

  // Handle temporary/local IDs (when DB not configured or fallback)
  // Also use LocalStorageResults for Food Business assessments
  if (id.startsWith('temp_') || id.startsWith('local_') || isFoodBusiness) {
    const { source, reason } = getGateConfig(assessmentType)
    return (
      <GatedResults source={source} reason={reason}>
        <LocalStorageResultsPage id={id} assessmentType={assessmentType} />
      </GatedResults>
    )
  }

  // Try to fetch from Supabase
  if (!supabaseUrl || !supabaseServiceKey) {
    return <TempResultsPage assessmentType={assessmentType} />
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)
  const { data: assessment, error } = await supabase
    .from('assessments')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !assessment) {
    // Show demo results if not found
    return <TempResultsPage assessmentType={assessmentType} />
  }

  // Render based on assessment type — all behind the shared OTP gate
  const { source, reason } = getGateConfig(assessmentType)

  if (isDPDP) {
    return (
      <GatedResults source={source} reason={reason}>
        <DPDPResultsView assessment={assessment} />
      </GatedResults>
    )
  } else if (isLabourCode) {
    return (
      <GatedResults source={source} reason={reason}>
        <LabourCodeResultsView assessment={assessment} />
      </GatedResults>
    )
  } else if (isStateWise) {
    return (
      <GatedResults source={source} reason={reason}>
        <StateWiseResultsView assessment={assessment} />
      </GatedResults>
    )
  } else {
    return (
      <GatedResults source={source} reason={reason}>
        <StatutoryHealthResultsView assessment={assessment} />
      </GatedResults>
    )
  }
}

// Labour Code Results Component
function LabourCodeResultsView({ assessment }: { assessment: AssessmentData }) {
  const responses = assessment.responses?.answers || {}
  const companyDetails = assessment.company_details || assessment.responses?.userDetails || {}
  
  // Use stored scores or calculate fresh
  const overallScore = assessment.overall_score || calculateLabourCodeScore(responses).overallScore
  const categoryScores = assessment.category_scores || calculateLabourCodeScore(responses).categoryScores
  const actionItems = assessment.action_items || generateLabourCodeActionItems(responses)
  const status = getComplianceStatus(overallScore)

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4 print:hidden">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          <div className="flex items-center gap-2 mb-2">
            <Badge className="bg-blue-100 text-blue-700">Labour Code Readiness</Badge>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Your Compliance Report</h1>
          {companyDetails.company_name && (
            <div className="flex items-center gap-2 text-gray-600 mt-1">
              <Building className="w-4 h-4" />
              <span>{companyDetails.company_name}</span>
            </div>
          )}
        </div>

        {/* Overall Score Card */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-center md:text-left">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Overall Readiness Score</h2>
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${
                  status.color === 'green' ? 'bg-green-100' :
                  status.color === 'amber' ? 'bg-amber-100' : 'bg-red-100'
                }`}>
                  {status.color === 'green' && <CheckCircle className="w-5 h-5 text-green-600" />}
                  {status.color === 'amber' && <AlertTriangle className="w-5 h-5 text-amber-600" />}
                  {status.color === 'red' && <XCircle className="w-5 h-5 text-red-600" />}
                  <span className={`font-semibold ${
                    status.color === 'green' ? 'text-green-600' :
                    status.color === 'amber' ? 'text-amber-600' : 'text-red-600'
                  }`}>{status.status}</span>
                </div>
                <p className="text-sm text-gray-500 mt-2">{status.description}</p>
              </div>
              <div className="text-center">
                <div className={`text-6xl font-bold ${
                  status.color === 'green' ? 'text-green-600' :
                  status.color === 'amber' ? 'text-amber-600' : 'text-red-600'
                }`}>{overallScore}%</div>
                <div className="text-gray-500 text-sm">Readiness Score</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Labour Code Breakdown</CardTitle>
            <CardDescription>Readiness status for each of the 4 Labour Codes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {LABOUR_CODE_CATEGORIES.map((cat) => {
              const score = categoryScores[cat.id] || 0
              const catStatus = score >= 80 ? 'ready' : score >= 50 ? 'attention' : 'risk'
              
              return (
                <div key={cat.id} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{cat.icon}</span>
                      <span className="font-medium">{cat.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {catStatus === 'ready' && <CheckCircle className="w-5 h-5 text-green-600" />}
                      {catStatus === 'attention' && <AlertTriangle className="w-5 h-5 text-amber-600" />}
                      {catStatus === 'risk' && <XCircle className="w-5 h-5 text-red-600" />}
                      <span className={`font-bold ${
                        catStatus === 'ready' ? 'text-green-600' :
                        catStatus === 'attention' ? 'text-amber-600' : 'text-red-600'
                      }`}>{score}%</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mb-2">{cat.description}</p>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all ${
                        catStatus === 'ready' ? 'bg-green-500' :
                        catStatus === 'attention' ? 'bg-amber-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${score}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>

        {/* Action Items */}
        {actionItems.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Action Items</CardTitle>
              <CardDescription>Prioritised steps to improve your Labour Code readiness</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {actionItems.map((item: ActionItem, index: number) => (
                <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                  <div className={`px-2 py-1 rounded text-xs font-medium ${
                    item.priority === 'high' ? 'bg-red-100 text-red-700' :
                    item.priority === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {item.priority.toUpperCase()}
                  </div>
                  <div>
                    <p className="text-gray-900">{item.text}</p>
                    <p className="text-sm text-gray-500 capitalize">{item.category?.replace('_', ' ') || 'General'}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Download & Share */}
        <Card className="print:hidden">
          <CardContent className="pt-6">
            <DownloadWithFeedback assessmentType="labour_code" />
            <p className="text-center text-sm text-gray-500 mt-4">
              Report generated on {new Date().toLocaleDateString('en-IN', { 
                day: 'numeric', month: 'long', year: 'numeric' 
              })}
            </p>
          </CardContent>
        </Card>

        {/* Disclaimer */}
        <div className="mt-8 p-4 bg-amber-50 rounded-lg text-sm text-amber-800 print:bg-transparent print:border print:border-amber-300">
          <strong>Disclaimer:</strong> This report is for informational purposes only and does not 
          constitute legal advice. Please consult a qualified legal or compliance professional 
          for specific guidance on your compliance obligations under the Labour Codes.
        </div>

        {/* Upsell */}
        <Card className="mt-6 border-green-200 bg-green-50 print:hidden">
          <CardContent className="pt-6">
            <h3 className="font-semibold text-gray-900 mb-2">Also Try: Statutory Health Check</h3>
            <p className="text-gray-600 text-sm mb-4">
              Check your compliance with PF, ESI, Professional Tax, Gratuity and Bonus requirements.
            </p>
            <Link href="/assessment/statutory-health">
              <Button variant="outline" className="border-green-600 text-green-600 hover:bg-green-100">
                Start Statutory Health Check - FREE
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// State-Wise Compliance Results Component
function StateWiseResultsView({ assessment }: { assessment: AssessmentData }) {
  const responses = assessment.responses || {}
  const userDetails = responses.userDetails || {}
  const overallScore = assessment.overall_score ?? 50
  const categoryScores = assessment.category_scores || {}
  const actionItems = assessment.action_items || []
  const applicabilityResults = (responses as { applicabilityResults?: Array<{ name: string; applies: boolean; priority: string; reason: string; threshold?: string }> }).applicabilityResults || []
  const compliantItems = (responses as { compliantItems?: Array<{ question: { category: string; text: string } }> }).compliantItems || []
  
  // Derive counts from actual data
  const gapsCount = actionItems.length
  const compliantCount = compliantItems.length
  const applicableCount = applicabilityResults.filter(r => r.applies).length
  
  // Status based on score
  const status = overallScore >= 80 ? { text: 'On Track', color: 'green', bg: 'bg-green-50', border: 'border-green-200' } :
                 overallScore >= 50 ? { text: 'Needs Attention', color: 'amber', bg: 'bg-amber-50', border: 'border-amber-200' } :
                 { text: 'At Risk', color: 'red', bg: 'bg-red-50', border: 'border-red-200' }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4 print:hidden">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          <div className="flex items-center gap-2 mb-2">
            <Badge className="bg-purple-100 text-purple-700">State-Wise Compliance</Badge>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Compliance Assessment Report</h1>
          {userDetails.companyName && (
            <div className="flex items-center gap-2 text-gray-600 mt-1">
              <Building className="w-4 h-4" />
              <span>{userDetails.companyName}</span>
            </div>
          )}
        </div>

        {/* Overall Score Card */}
        <Card className={`mb-6 ${status.bg} ${status.border} border-2`}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  {status.color === 'green' && <CheckCircle className="w-6 h-6 text-green-600" />}
                  {status.color === 'amber' && <AlertTriangle className="w-6 h-6 text-amber-600" />}
                  {status.color === 'red' && <XCircle className="w-6 h-6 text-red-600" />}
                  <h2 className={`text-xl font-bold ${
                    status.color === 'green' ? 'text-green-700' :
                    status.color === 'amber' ? 'text-amber-700' : 'text-red-700'
                  }`}>{status.text}</h2>
                </div>
                <p className="text-gray-600 text-sm mb-3">
                  {status.color === 'green' ? 'Your compliance posture is strong.' :
                   status.color === 'amber' ? 'Several areas require immediate attention to avoid penalties.' :
                   'Critical compliance gaps detected. Immediate action required.'}
                </p>
                <div className="flex gap-4 text-sm">
                  <span className="flex items-center gap-1">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    {compliantCount} compliant
                  </span>
                  <span className="flex items-center gap-1">
                    <XCircle className="w-4 h-4 text-red-500" />
                    {gapsCount} gaps found
                  </span>
                  <span className="flex items-center gap-1 text-gray-500">
                    {Object.keys(categoryScores).length}/{applicableCount} categories OK
                  </span>
                </div>
              </div>
              <div className="text-center">
                <div className={`text-5xl font-bold ${
                  status.color === 'green' ? 'text-green-600' :
                  status.color === 'amber' ? 'text-amber-600' : 'text-red-600'
                }`}>{Math.round(overallScore)}%</div>
                <div className="text-gray-500 text-sm">Compliance Score</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Compliant vs Gaps */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-green-700 flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                What You&apos;re Doing Right
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">{compliantCount} areas compliant</p>
              {compliantCount === 0 ? (
                <p className="text-sm text-gray-400 italic mt-2">No compliant items found. Review all areas below.</p>
              ) : (
                <p className="text-sm text-green-600 mt-2">Keep up the good work!</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-red-700 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Action Required
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">{gapsCount} areas need attention</p>
              {gapsCount === 0 ? (
                <div className="flex items-center gap-2 text-green-600 mt-2">
                  <CheckCircle className="w-5 h-5" />
                  All areas compliant!
                </div>
              ) : (
                <p className="text-sm text-red-600 mt-2">Review action items below</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Category Scores */}
        {Object.keys(categoryScores).length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Category-wise Compliance Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(categoryScores).map(([category, scores]) => {
                const scoreData = typeof scores === 'object' && scores !== null ? scores as { percentage?: number } : { percentage: 0 }
                const percentage = scoreData.percentage || 0
                const catStatus = percentage >= 80 ? 'compliant' : percentage >= 50 ? 'needs-attention' : 'non-compliant'
                
                return (
                  <div key={category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium capitalize">{category.replace(/_/g, ' ')}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            catStatus === 'compliant' ? 'bg-green-500' :
                            catStatus === 'needs-attention' ? 'bg-amber-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className={`font-bold ${
                        catStatus === 'compliant' ? 'text-green-600' :
                        catStatus === 'needs-attention' ? 'text-amber-600' : 'text-red-600'
                      }`}>{percentage}%</span>
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        )}

        {/* Action Items */}
        {actionItems.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-red-700">Action Items ({actionItems.length})</CardTitle>
              <CardDescription>Address these gaps to improve your compliance score</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {actionItems.map((item, idx) => (
                <div key={idx} className="p-3 bg-red-50 border-l-4 border-red-500 rounded">
                  <div className="font-medium text-red-800">{item.category || 'General'}</div>
                  <p className="text-sm text-gray-700 mt-1">{item.text || item.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Download Section */}
        <Card className="print:hidden">
          <CardContent className="pt-6">
            <DownloadWithFeedback 
              assessmentId={assessment.id}
              assessmentType={ASSESSMENT_TYPES.STATE_WISE_COMPLIANCE}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


// Statutory Health Results Component
function StatutoryHealthResultsView({ assessment }: { assessment: AssessmentData }) {
  const responses = assessment.responses as { 
    userDetails: { fullName: string; email: string; companyName: string }
    answers: Record<string, string> 
  }

  // Calculate scores
  const calculateCategoryScores = () => {
    const scores: Record<string, { score: number; max: number; percentage: number; status: string }> = {}

    Object.keys(CATEGORY_INFO).forEach(cat => {
      const categoryQuestions = STATUTORY_HEALTH_QUESTIONS.filter(q => q.category === cat)
      let score = 0
      let max = 0

      categoryQuestions.forEach(q => {
        max += q.weight
        const answer = responses.answers[q.id]
        
        if (q.complianceAnswer) {
          // Compliance question: check if answer matches required answer
          if (answer === q.complianceAnswer) {
            score += q.weight
          }
          // Non-compliant answer gets 0 points
        } else {
          // Informational question (no complianceAnswer): pt_1, esi_3
          // These gather info, not test compliance - give full points
          score += q.weight
        }
      })

      const percentage = max > 0 ? Math.round((score / max) * 100) : 0
      let status = 'non-compliant'
      if (percentage >= 70) status = 'compliant'
      else if (percentage >= 40) status = 'needs-attention'

      scores[cat] = { score, max, percentage, status }
    })

    return scores
  }

  const categoryScores = calculateCategoryScores()

  const overallScore = Math.round(
    Object.values(categoryScores).reduce((sum, cat) => sum + cat.percentage, 0) / 
    Object.keys(categoryScores).length
  )

  const getOverallStatus = () => {
    if (overallScore >= 70) return { text: 'Compliant', color: 'text-green-600', bg: 'bg-green-100' }
    if (overallScore >= 40) return { text: 'Needs Attention', color: 'text-amber-600', bg: 'bg-amber-100' }
    return { text: 'Non-Compliant', color: 'text-red-600', bg: 'bg-red-100' }
  }

  const status = getOverallStatus()

  const generateActionItems = () => {
    const items: { priority: 'high' | 'medium' | 'low'; text: string; category: string }[] = []
    const actionMap: Record<string, string> = {
      'pf_1': 'Register with EPFO immediately if your establishment has 20+ employees',
      'pf_2': 'Set up automated PF payment by 15th of each month to avoid penalties',
      'esi_1': 'Register with ESIC if you have 10+ employees with wages up to ₹21,000/month',
      'esi_2': 'Ensure ESI contributions are deposited by 15th of each month',
      'pt_2': 'Obtain Professional Tax Registration Certificate (PTRC) from your state',
      'pt_3': 'Implement monthly PT deduction and deposit process',
      'gratuity_1': 'Start maintaining gratuity liability records for all employees with 4+ years service',
      'gratuity_2': 'Consider LIC group gratuity scheme or create book reserves for gratuity',
      'bonus_1': 'Calculate and pay statutory bonus (min 8.33%) to eligible employees',
      'bonus_2': 'Maintain bonus registers and pay bonus by November 30th each year',
    }

    STATUTORY_HEALTH_QUESTIONS.forEach(q => {
      const answer = responses.answers[q.id]
      if (q.complianceAnswer && answer !== q.complianceAnswer) {
        const priority = q.weight >= 10 ? 'high' : q.weight >= 6 ? 'medium' : 'low'
        items.push({
          priority,
          text: actionMap[q.id] || `Review compliance for: ${q.id}`,
          category: CATEGORY_INFO[q.category as keyof typeof CATEGORY_INFO].name,
        })
      }
    })

    return items.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 }
      return priorityOrder[a.priority] - priorityOrder[b.priority]
    })
  }

  const actionItems = generateActionItems()

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4 print:hidden">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          <Badge className="bg-green-100 text-green-700 mb-2">Statutory Health Check</Badge>
          <h1 className="text-2xl font-bold text-gray-900">Your Compliance Report</h1>
          <p className="text-gray-600">{responses.userDetails.companyName}</p>
        </div>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-center md:text-left">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Overall Compliance Score</h2>
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${status.bg}`}>
                  {overallScore >= 70 ? <CheckCircle className={`w-5 h-5 ${status.color}`} /> :
                   overallScore >= 40 ? <AlertTriangle className={`w-5 h-5 ${status.color}`} /> :
                   <XCircle className={`w-5 h-5 ${status.color}`} />}
                  <span className={`font-semibold ${status.color}`}>{status.text}</span>
                </div>
              </div>
              <div className="text-center">
                <div className="text-6xl font-bold text-blue-600">{overallScore}%</div>
                <div className="text-gray-500 text-sm">Compliance Score</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Category Breakdown</CardTitle>
            <CardDescription>Compliance status for each statutory requirement</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(categoryScores).map(([cat, data]) => (
              <div key={cat} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{CATEGORY_INFO[cat as keyof typeof CATEGORY_INFO].name}</span>
                  <div className="flex items-center gap-2">
                    {data.status === 'compliant' && <CheckCircle className="w-5 h-5 text-green-600" />}
                    {data.status === 'needs-attention' && <AlertTriangle className="w-5 h-5 text-amber-600" />}
                    {data.status === 'non-compliant' && <XCircle className="w-5 h-5 text-red-600" />}
                    <span className={`font-bold ${
                      data.status === 'compliant' ? 'text-green-600' :
                      data.status === 'needs-attention' ? 'text-amber-600' : 'text-red-600'
                    }`}>{data.percentage}%</span>
                  </div>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${
                      data.status === 'compliant' ? 'bg-green-500' :
                      data.status === 'needs-attention' ? 'bg-amber-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${data.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {actionItems.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Action Items</CardTitle>
              <CardDescription>Prioritised steps to improve your compliance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {actionItems.map((item, index) => (
                <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                  <div className={`px-2 py-1 rounded text-xs font-medium ${
                    item.priority === 'high' ? 'bg-red-100 text-red-700' :
                    item.priority === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {item.priority.toUpperCase()}
                  </div>
                  <div>
                    <p className="text-gray-900">{item.text}</p>
                    <p className="text-sm text-gray-500">{item.category}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        <Card className="print:hidden">
          <CardContent className="pt-6">
            <DownloadWithFeedback assessmentType="statutory_health" />
            <p className="text-center text-sm text-gray-500 mt-4">
              Report generated on {new Date().toLocaleDateString('en-IN', { 
                day: 'numeric', month: 'long', year: 'numeric' 
              })}
            </p>
          </CardContent>
        </Card>

        <div className="mt-8 p-4 bg-amber-50 rounded-lg text-sm text-amber-800">
          <strong>Disclaimer:</strong> This report is for informational purposes only and does not 
          constitute legal advice.
        </div>

        <Card className="mt-6 border-blue-200 bg-blue-50 print:hidden">
          <CardContent className="pt-6">
            <h3 className="font-semibold text-gray-900 mb-2">Also Try: Labour Code Readiness</h3>
            <p className="text-gray-600 text-sm mb-4">
              Get ready for the new Labour Codes with our detailed readiness assessment.
            </p>
            <Link href="/assessment/labour-code">
              <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-100">
                Start Labour Code Assessment - FREE
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// DPDP Results Component
function DPDPResultsView({ assessment }: { assessment: AssessmentData }) {
  const responses = assessment.responses?.answers || {}
  // user_details is the canonical column written by dpdp-submit; fall back to legacy paths
  const userDetails: Record<string, string> = assessment.user_details || (assessment.company_details as Record<string, string>) || assessment.responses?.userDetails || {}
  const companyName = userDetails.companyName || userDetails.company_name || ''
  const profile = assessment.responses?.profile

  // Use stored scores or calculate fresh
  const scoreResult = calculateDPDPScore(responses, profile || {})
  const overallScore = assessment.overall_score || scoreResult.overallScore
  const categoryScores = assessment.category_scores || scoreResult.phaseScores
  const actionItems = assessment.action_items || generateDPDPActionItems(responses, profile || {})
  const maturityLevel = assessment.maturity_level || scoreResult.maturityLevel
  const status = getDPDPComplianceStatus(overallScore)
  const daysUntilDeadline = getDaysUntilDeadline()

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4 print:hidden">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <Badge className="bg-purple-100 text-purple-700">DPDP Gap Assessment</Badge>
            <Badge className="bg-amber-100 text-amber-700">
              {daysUntilDeadline} days to deadline
            </Badge>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Your DPDP Compliance Report</h1>
          {companyName && (
            <div className="flex items-center gap-2 text-gray-600 mt-1">
              <Building className="w-4 h-4" />
              <span>{companyName}</span>
            </div>
          )}
        </div>

        {/* Overall Score Card */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-center md:text-left">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">DPDP Compliance Score</h2>
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${
                  status.color === 'green' ? 'bg-green-100' :
                  status.color === 'amber' ? 'bg-amber-100' :
                  status.color === 'orange' ? 'bg-orange-100' : 'bg-red-100'
                }`}>
                  {status.color === 'green' && <CheckCircle className="w-5 h-5 text-green-600" />}
                  {status.color === 'amber' && <AlertTriangle className="w-5 h-5 text-amber-600" />}
                  {status.color === 'orange' && <AlertTriangle className="w-5 h-5 text-orange-600" />}
                  {status.color === 'red' && <XCircle className="w-5 h-5 text-red-600" />}
                  <span className={`font-semibold ${
                    status.color === 'green' ? 'text-green-600' :
                    status.color === 'amber' ? 'text-amber-600' :
                    status.color === 'orange' ? 'text-orange-600' : 'text-red-600'
                  }`}>{status.label}</span>
                </div>
                <p className="text-sm text-gray-500 mt-2">{status.description}</p>
                {maturityLevel && (
                  <p className="text-sm font-medium text-gray-700 mt-1">
                    Maturity Level: <span className="text-purple-700">{maturityLevel}</span>
                  </p>
                )}
              </div>
              <div className="text-center">
                <div
                  data-testid="compliance-score"
                  className={`text-6xl font-bold ${
                    status.color === 'green' ? 'text-green-600' :
                    status.color === 'amber' ? 'text-amber-600' :
                    status.color === 'orange' ? 'text-orange-600' : 'text-red-600'
                  }`}
                >
                  {overallScore}%
                </div>
                <div className="text-gray-500 text-sm">Compliance Score</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Risk & Penalty Card */}
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-900 mb-1">Penalty Exposure</h3>
                <p className="text-sm text-red-700 mb-2">
                  {overallScore < 50 ? 'Up to ₹250 crore' : overallScore < 80 ? 'Up to ₹50 crore' : 'Minimal exposure'}
                </p>
                <p className="text-xs text-red-600">
                  Compliance deadline: 13 May 2027 ({daysUntilDeadline} days remaining)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Compliance Breakdown by Category</CardTitle>
            <CardDescription>Readiness status for each DPDP requirement area</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(DPDP_CATEGORIES).map(([catId, cat]) => {
              const catScore = categoryScores[catId]
              const score = typeof catScore === 'number'
                ? catScore
                : (catScore?.percentage || 0)
              const catStatus = score >= 80 ? 'ready' : score >= 60 ? 'attention' : score >= 40 ? 'risk' : 'critical'

              return (
                <div key={catId} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{cat.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {catStatus === 'ready' && <CheckCircle className="w-5 h-5 text-green-600" />}
                      {catStatus === 'attention' && <AlertTriangle className="w-5 h-5 text-amber-600" />}
                      {catStatus === 'risk' && <AlertTriangle className="w-5 h-5 text-orange-600" />}
                      {catStatus === 'critical' && <XCircle className="w-5 h-5 text-red-600" />}
                      <span className={`font-bold ${
                        catStatus === 'ready' ? 'text-green-600' :
                        catStatus === 'attention' ? 'text-amber-600' :
                        catStatus === 'risk' ? 'text-orange-600' : 'text-red-600'
                      }`}>{Math.round(score)}%</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mb-1">{cat.description}</p>
                  <p className="text-xs text-red-600">Max penalty: {cat.maxPenalty}</p>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mt-2">
                    <div
                      className={`h-full transition-all ${
                        catStatus === 'ready' ? 'bg-green-500' :
                        catStatus === 'attention' ? 'bg-amber-500' :
                        catStatus === 'risk' ? 'bg-orange-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${score}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>

        {/* Action Items */}
        {actionItems.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Prioritised Action Items</CardTitle>
              <CardDescription>Steps to improve DPDP compliance before May 2027</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {actionItems.slice(0, 10).map((item: ActionItem & { penalty?: string }, index: number) => (
                <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                  <div className={`px-2 py-1 rounded text-xs font-medium flex-shrink-0 ${
                    item.priority === 'critical' ? 'bg-red-200 text-red-900' :
                    item.priority === 'high' ? 'bg-red-100 text-red-700' :
                    item.priority === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {item.priority.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-900 text-sm">{item.title || item.text}</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      <span className="text-xs text-gray-500">{item.category || item.phase}</span>
                      {item.penalty && (
                        <span className="text-xs text-red-600">Penalty: {item.penalty}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {actionItems.length > 10 && (
                <p className="text-sm text-gray-500 text-center">
                  + {actionItems.length - 10} more action items in full report
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Download & Share */}
        <Card className="print:hidden">
          <CardContent className="pt-6">
            <DownloadWithFeedback assessmentType="dpdp" />
            <p className="text-center text-sm text-gray-500 mt-4">
              Report generated on {new Date().toLocaleDateString('en-IN', { 
                day: 'numeric', month: 'long', year: 'numeric' 
              })}
            </p>
          </CardContent>
        </Card>

        {/* Disclaimer */}
        <div className="mt-8 p-4 bg-amber-50 rounded-lg text-sm text-amber-800 print:bg-transparent print:border print:border-amber-300">
          <strong>Disclaimer:</strong> This report is for informational purposes only and does not 
          constitute legal advice. The DPDP Act 2023 and its Rules are subject to amendment. Please 
          consult a qualified data protection professional for specific guidance on your compliance 
          obligations.
        </div>

        {/* Upsell */}
        <Card className="mt-6 border-green-200 bg-green-50 print:hidden">
          <CardContent className="pt-6">
            <h3 className="font-semibold text-gray-900 mb-2">Also Try: Statutory Health Check</h3>
            <p className="text-gray-600 text-sm mb-4">
              Check your compliance with PF, ESI, Professional Tax, Gratuity and Bonus requirements.
            </p>
            <div className="flex gap-3 flex-wrap">
              <Link href="/assessment/statutory-health">
                <Button variant="outline" className="border-green-600 text-green-600 hover:bg-green-100">
                  Statutory Health Check - FREE
                </Button>
              </Link>
              <Link href="/assessment/labour-code">
                <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-100">
                  Labour Code Readiness - FREE
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Temporary Results Page (when DB not configured or temp ID)
function TempResultsPage({ assessmentType }: { assessmentType: string }) {
  const isLabourCode = assessmentType === 'labour_code'
  
  // Demo data
  const demoScore = 65
  const demoStatus = { status: 'Needs Attention', color: 'amber', description: 'Several areas require attention.' }
  
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          <Badge className={isLabourCode ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}>
            {isLabourCode ? 'Labour Code Readiness' : 'Statutory Health Check'}
          </Badge>
          <h1 className="text-2xl font-bold text-gray-900 mt-2">Assessment Complete</h1>
          <p className="text-amber-600 text-sm mt-1">Note: Results shown are for demonstration (database not configured)</p>
        </div>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Your Score</h2>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                  <span className="font-semibold text-amber-600">{demoStatus.status}</span>
                </div>
              </div>
              <div className="text-center">
                <div className="text-6xl font-bold text-amber-600">{demoScore}%</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="print:hidden">
          <CardContent className="pt-6">
            <DownloadWithFeedback assessmentType={isLabourCode ? "labour_code" : "statutory_health"} />
          </CardContent>
        </Card>

        <Card className="mt-6 border-blue-200 bg-blue-50 print:hidden">
          <CardContent className="pt-6">
            <h3 className="font-semibold text-gray-900 mb-2">Try Another Assessment</h3>
            <div className="flex gap-3 flex-wrap">
              <Link href="/assessment/statutory-health">
                <Button variant="outline" size="sm">Statutory Health Check</Button>
              </Link>
              <Link href="/assessment/labour-code">
                <Button variant="outline" size="sm">Labour Code Readiness</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
