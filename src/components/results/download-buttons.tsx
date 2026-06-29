'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Download, Mail, Loader2, Check } from 'lucide-react'
import { createBrowserClient } from '@supabase/ssr'
import { ASSESSMENT_TYPES } from '@/lib/constants/assessment-types'
import { analytics, type AssessmentType } from '@/lib/analytics'

// Helper to detect UUID format
function isValidUUID(id: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(id)
}

// ============================================================================
// ASSESSMENT DATA TYPES
// ============================================================================

interface ActionItem {
  id?: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  phase?: string;
  category?: string;
  title?: string;
  text?: string;
  description?: string;
  deadline?: string;
  penalty?: string;
  questionId?: string;
}

interface AssessmentData {
  id: string
  assessment_type: string
  overall_score?: number
  category_scores?: Record<string, { score?: number; max?: number; percentage: number } | number>
  action_items?: ActionItem[]
  userDetails?: {
    companyName?: string
    fullName?: string
    contactName?: string
    email?: string
    contactEmail?: string
    industry?: string
    employeeCount?: string
    state?: string
  }
  user_details?: Record<string, string>
  responses?: {
    userDetails?: Record<string, string>
    answers?: Record<string, string>
    applicabilityResults?: Array<{ name: string; applies: boolean; priority: string; reason: string; threshold?: string }>
    applicabilitySummary?: { applicableCount?: number; criticalCount?: number }
  }
  // State-wise compliance specific fields
  applicabilityResults?: Array<{ name: string; applies: boolean; priority: string; reason: string; threshold?: string }>
  applicabilitySummary?: { applicableCount?: number; criticalCount?: number }
  scoreResult?: {
    overallScore?: number
    categoryScores?: Record<string, { score?: number; max?: number; percentage: number }>
    gaps?: Array<{ question: { category: string; text?: string }; recommendation: string }>
    compliantItems?: Array<{ question?: { category?: string; text?: string } }>
  }
  created_at?: string
}

interface DownloadButtonsProps {
  assessmentId?: string
  assessmentType?: string
  autoTrigger?: 'download' | 'email' | null
  complianceScore?: number
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const CATEGORY_LABELS: Record<string, string> = {
  pf: 'Provident Fund (PF)',
  esi: 'Employee State Insurance (ESI)',
  pt: 'Professional Tax (PT)',
  gratuity: 'Gratuity',
  bonus: 'Statutory Bonus',
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function getStatusText(score: number): string {
  if (score >= 90) return 'Compliant'
  if (score >= 70) return 'Needs Attention'
  return 'Non-Compliant'
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function getStatusColour(score: number): [number, number, number] {
  if (score >= 90) return [5, 150, 105] // Green
  if (score >= 70) return [217, 119, 6] // Amber
  return [220, 38, 38] // Red
}

// ============================================================================
// DATA RESOLUTION HELPERS (shared by download + email handlers)
// ============================================================================

// Map an API row into the AssessmentData shape used here.
function mapApiData(apiData: Record<string, unknown>): AssessmentData {
  return {
    id: apiData.id as string,
    assessment_type: apiData.assessment_type as string,
    overall_score: apiData.overall_score as number | undefined,
    category_scores: apiData.category_scores as AssessmentData['category_scores'],
    responses: apiData.responses as AssessmentData['responses'],
    userDetails: apiData.userDetails as AssessmentData['userDetails'],
  }
}

// Resolve assessment data for an id: localStorage/state for local/temp ids,
// API fetch for database ids. Returns null when nothing is found so callers
// can apply their own fallback.
async function resolveAssessmentData(
  id: string,
  stateData: AssessmentData | null
): Promise<AssessmentData | null> {
  if (id.startsWith('local_') || id.startsWith('temp_')) {
    if (stateData) return stateData
    try {
      const stored = localStorage.getItem(`assessment_${id}`)
      if (stored) return JSON.parse(stored)
    } catch (e) {
      console.error('Error loading from localStorage:', e)
    }
    return null
  }

  try {
    const response = await fetch('/api/assessment/' + id)
    if (response.ok) {
      return mapApiData(await response.json())
    }
  } catch (fetchError) {
    console.error('Error fetching assessment:', fetchError)
  }
  return null
}

// Minimal demo fallback used when no assessment data could be resolved.
function fallbackAssessmentData(id: string): AssessmentData {
  return {
    id,
    assessment_type: ASSESSMENT_TYPES.STATUTORY_HEALTH,
    overall_score: 65,
    category_scores: {
      pf: { percentage: 70 },
      esi: { percentage: 60 },
      pt: { percentage: 65 },
      gratuity: { percentage: 55 },
      bonus: { percentage: 70 },
    },
    userDetails: { companyName: 'Demo Company' },
  }
}

// Email can live in many places depending on assessment type. Check them all.
function resolveEmail(data: AssessmentData): string | undefined {
  const userDetails = data.userDetails || data.user_details || data.responses?.userDetails || {}
  const responsesUserDetails = data.responses?.userDetails || {}
  const dataAsUnknown = data as unknown as Record<string, unknown>
  const orgProfile = dataAsUnknown.organizationProfile as Record<string, unknown> | undefined
  const userDetailsField = dataAsUnknown.user_details as Record<string, unknown> | undefined

  return (
    userDetails.email ||
    userDetails.contactEmail ||
    responsesUserDetails.email ||
    responsesUserDetails.contactEmail ||
    (userDetailsField?.email as string | undefined) ||
    (orgProfile?.email as string | undefined) ||
    (dataAsUnknown.email as string | undefined) ||
    (dataAsUnknown.contactEmail as string | undefined)
  )
}

// Trigger a browser download for a blob.
function triggerBlobDownload(blob: Blob, filename: string): void {
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

// Pull the filename out of a Content-Disposition header, with a fallback.
function filenameFromDisposition(header: string | null, fallback: string): string {
  const match = header?.match(/filename="?([^";]+)"?/)
  return match?.[1] || fallback
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function DownloadButtons({ assessmentId, assessmentType: propAssessmentType, autoTrigger, complianceScore }: DownloadButtonsProps) {
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadSuccess, setDownloadSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [assessmentData, setAssessmentData] = useState<AssessmentData | null>(null)
  const [autoTriggered, setAutoTriggered] = useState(false)
  
  // Email state
  const [isEmailing, setIsEmailing] = useState(false)
  const [emailSuccess, setEmailSuccess] = useState(false)
  const [emailError, setEmailError] = useState<string | null>(null)

  // Email override — lets user correct the address before sending
  const [emailOverride, setEmailOverride] = useState<string | null>(null)
  const [isEditingEmail, setIsEditingEmail] = useState(false)
  const [editEmailDraft, setEditEmailDraft] = useState('')

  useEffect(() => {
    const id = assessmentId || window.location.pathname.split('/').pop() || ''
    
    // For real UUIDs, fetch from Supabase
    if (isValidUUID(id)) {
      const fetchFromDB = async () => {
        try {
          const supabase = createBrowserClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
          )
          
          const { data, error } = await supabase
            .from('assessments')
            .select('*')
            .eq('id', id)
            .single()
          
          if (error) {
            console.error('Error fetching assessment from DB:', error)
            // Try localStorage as fallback
            const stored = localStorage.getItem(`assessment_${id}`)
            if (stored) {
              setAssessmentData(JSON.parse(stored))
            }
            return
          }
          
          if (data) {
            // Transform DB data to match AssessmentData interface
            // Email can be in multiple places depending on assessment type
            const userDetailsFromResponses = data.responses?.userDetails || {}
            setAssessmentData({
              id: data.id,
              assessment_type: data.assessment_type,
              overall_score: data.overall_score,
              category_scores: data.category_scores,
              userDetails: {
                companyName: data.company_name || userDetailsFromResponses.companyName,
                fullName: data.full_name || userDetailsFromResponses.fullName || userDetailsFromResponses.contactName,
                email: data.email || userDetailsFromResponses.email || userDetailsFromResponses.contactEmail,
                industry: data.industry || userDetailsFromResponses.industry,
                employeeCount: data.employee_count || userDetailsFromResponses.employeeCount,
                state: data.state || userDetailsFromResponses.state,
              },
              responses: data.responses,
              created_at: data.created_at,
            })
          }
        } catch (e) {
          console.error('Error fetching assessment:', e)
        }
      }
      fetchFromDB()
    } else if (id.startsWith('local_') || id.startsWith('temp_')) {
      // For local/temp IDs, use localStorage
      try {
        const stored = localStorage.getItem(`assessment_${id}`)
        if (stored) {
          setAssessmentData(JSON.parse(stored))
        }
      } catch (e) {
        console.error('Error loading assessment from localStorage:', e)
      }
    }
  }, [assessmentId])

  // ==========================================================================
  // DOWNLOAD & EMAIL HANDLERS
  // ==========================================================================
  // REMOVED: All 5 inline PDF generators (generatePDF, generateLabourCodePDF,
  // generateDPDPPDF, generateStateWiseCompliancePDF, generateFoodBusinessPDF)
  // These now use the unified report generator with type-specific adapters

  // ==========================================================================
  // DOWNLOAD HANDLER
  // ==========================================================================

  const handleDownload = useCallback(async () => {
    setIsDownloading(true)
    setError(null)
    setDownloadSuccess(false)

    try {
      const id = assessmentId || window.location.pathname.split('/').pop() || 'demo'

      // DB-backed assessments (UUID) generate the PDF server-side so the file is
      // built from the stored row, not client state. POSH and local/temp ids
      // fall through to the client-side path below.
      if (isValidUUID(id)) {
        const email = emailOverride || (assessmentData ? resolveEmail(assessmentData) : undefined)
        if (email) {
          const res = await fetch(`/api/report/${id}/pdf?email=${encodeURIComponent(email)}`)
          if (res.ok) {
            const blob = await res.blob()
            const filename = filenameFromDisposition(
              res.headers.get('content-disposition'),
              'ComplianceCheck-Report-' + new Date().toISOString().split('T')[0] + '.pdf'
            )
            triggerBlobDownload(blob, filename)

            analytics.reportDownloaded({
              assessment_type: (assessmentData?.assessment_type || ASSESSMENT_TYPES.STATUTORY_HEALTH) as AssessmentType,
              format: 'pdf',
              compliance_score: assessmentData?.overall_score ?? complianceScore ?? 0,
              assessment_id: id,
              user_tier: 'free',
            })

            setDownloadSuccess(true)
            setTimeout(() => setDownloadSuccess(false), 3000)
            return
          }
          // Non-OK response: fall through to client-side generation.
        }
      }

      const data = (await resolveAssessmentData(id, assessmentData)) || fallbackAssessmentData(id)

      const assessmentType = data.assessment_type || ASSESSMENT_TYPES.STATUTORY_HEALTH

      // Lazy-load jsPDF + adapters only when the user clicks Download
      const [{ generateUnifiedReportBlob }, { buildReportData }] = await Promise.all([
        import('@/lib/pdf/unified-report-generator'),
        import('@/lib/pdf/report-registry'),
      ])

      // Transform assessment data via the type-specific adapter (registry)
      const reportData = buildReportData(assessmentType, data)

      // Generate consistent PDF using unified generator
      const blob = generateUnifiedReportBlob(reportData)
      triggerBlobDownload(
        blob,
        reportData.config.filenamePrefix + '-' + new Date().toISOString().split('T')[0] + '.pdf'
      )

      // Track successful download
      analytics.reportDownloaded({
        assessment_type: assessmentType as AssessmentType,
        format: 'pdf',
        compliance_score: data.overall_score ?? complianceScore ?? 0,
        assessment_id: id,
        user_tier: 'free',
      })

      setDownloadSuccess(true)
      setTimeout(() => setDownloadSuccess(false), 3000)
    } catch (err) {
      console.error('Download error:', err)
      setError('Download failed. Please try again.')
    } finally {
      setIsDownloading(false)
    }
  }, [assessmentId, assessmentData, complianceScore, emailOverride])

  // ==========================================================================
  // EMAIL HANDLER
  // ==========================================================================

  const handleEmailReport = useCallback(async () => {
    setIsEmailing(true)
    setEmailError(null)
    setEmailSuccess(false)

    try {
      const id = assessmentId || window.location.pathname.split('/').pop() || 'demo'

      // DB-backed assessments (UUID) generate the PDF server-side in-process, so
      // the emailed attachment matches the download exactly. No client-side PDF
      // build and no base64 round-trip. POSH and local/temp ids fall through.
      if (isValidUUID(id)) {
        const email = emailOverride || (assessmentData ? resolveEmail(assessmentData) : undefined)
        if (email) {
          const assessmentType = assessmentData?.assessment_type || propAssessmentType || ASSESSMENT_TYPES.STATUTORY_HEALTH
          const companyName =
            assessmentData?.userDetails?.companyName ||
            assessmentData?.responses?.userDetails?.companyName ||
            'Your Company'

          const response = await fetch('/api/email/send-report', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email,
              assessmentId: id,
              companyName,
              score: assessmentData?.overall_score ?? 0,
              assessmentType,
            }),
          })
          const result = await response.json()
          if (!response.ok || !result.success) {
            throw new Error(result.error || 'Failed to send email')
          }

          analytics.trackEvent('report_emailed', {
            assessment_type: assessmentType as AssessmentType,
            compliance_score: assessmentData?.overall_score ?? complianceScore ?? 0,
            assessment_id: id,
            user_tier: 'free',
          })

          setEmailSuccess(true)
          setTimeout(() => setEmailSuccess(false), 5000)
          return
        }
        // Email unknown: fall through to client-side path below.
      }

      const data =
        (await resolveAssessmentData(id, assessmentData)) ||
        assessmentData ||
        fallbackAssessmentData(id)

      // Email can live in many places depending on assessment type.
      const resolvedEmail = emailOverride || resolveEmail(data)

      if (!resolvedEmail) {
        console.error('Email lookup failed. Data keys:', Object.keys(data || {}))
        setEmailError('No email address found. Please download the report instead.')
        return
      }

      const assessmentType = data.assessment_type || propAssessmentType || ASSESSMENT_TYPES.STATUTORY_HEALTH
      const companyName =
        data.userDetails?.companyName || data.responses?.userDetails?.companyName || 'Your Company'

      // Lazy-load jsPDF + adapters only when the user clicks Email
      const [{ generateUnifiedReportBlob: genBlob }, { buildReportData }] = await Promise.all([
        import('@/lib/pdf/unified-report-generator'),
        import('@/lib/pdf/report-registry'),
      ])

      // Transform assessment data via the type-specific adapter (registry)
      const reportData = buildReportData(assessmentType, data)

      // Generate consistent PDF using unified generator
      const blob = genBlob(reportData)

      // Convert blob to base64
      const reader = new FileReader()
      const pdfBase64 = await new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const result = reader.result as string
          // Remove the data:application/pdf;base64, prefix
          const base64 = result.split(',')[1]
          resolve(base64)
        }
        reader.onerror = () => reject(new Error('Failed to read PDF'))
        reader.readAsDataURL(blob)
      })

      // Send to email API
      const response = await fetch('/api/email/send-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: resolvedEmail,
          assessmentId: id,
          pdfBase64,
          companyName,
          score: data.overall_score ?? 0,
          assessmentType,
        }),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to send email')
      }

      // Track successful email
      analytics.trackEvent('report_emailed', {
        assessment_type: assessmentType as AssessmentType,
        compliance_score: data.overall_score ?? complianceScore ?? 0,
        assessment_id: id,
        user_tier: 'free',
      })

      setEmailSuccess(true)
      setTimeout(() => setEmailSuccess(false), 5000)
    } catch (err) {
      console.error('Email error:', err)
      setEmailError(err instanceof Error ? err.message : 'Failed to send email. Please try again.')
    } finally {
      setIsEmailing(false)
    }
  }, [assessmentId, assessmentData, propAssessmentType, complianceScore, emailOverride])

  // Auto-trigger download or email after feedback completion
  useEffect(() => {
    if (autoTrigger && !autoTriggered) {
      setAutoTriggered(true)
      // Small delay to ensure component is fully mounted
      const timer = setTimeout(() => {
        if (autoTrigger === 'download') {
          handleDownload()
        } else if (autoTrigger === 'email') {
          handleEmailReport()
        }
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [autoTrigger, autoTriggered, handleDownload, handleEmailReport])

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <Button 
          className="flex-1" 
          onClick={handleDownload}
          disabled={isDownloading}
        >
          {isDownloading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating Report...
            </>
          ) : downloadSuccess ? (
            <>
              <Check className="w-4 h-4 mr-2" />
              Downloaded!
            </>
          ) : (
            <>
              <Download className="w-4 h-4 mr-2" />
              Download Detailed Report
            </>
          )}
        </Button>
        <Button 
          variant="outline" 
          className="flex-1" 
          onClick={handleEmailReport}
          disabled={isEmailing}
        >
          {isEmailing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Sending...
            </>
          ) : emailSuccess ? (
            <>
              <Check className="w-4 h-4 mr-2 text-green-600" />
              Sent to your email!
            </>
          ) : (
            <>
              <Mail className="w-4 h-4 mr-2" />
              Email Report
            </>
          )}
        </Button>
      </div>
      {error && (
        <p className="text-sm text-amber-600 text-center">{error}</p>
      )}
      {emailError && (
        <p className="text-sm text-red-600 text-center">{emailError}</p>
      )}
      {emailSuccess && (
        <p className="text-sm text-green-600 text-center">Report sent successfully! Check your inbox.</p>
      )}

      {/* Email address display + inline edit */}
      {(() => {
        const userDetails = assessmentData?.userDetails || assessmentData?.responses?.userDetails || {}
        const storedEmail = (userDetails as Record<string, string | undefined>).email ||
                            (userDetails as Record<string, string | undefined>).contactEmail || ''
        const displayEmail = emailOverride ?? storedEmail
        if (!displayEmail && !isEditingEmail) return null
        return (
          <div className="text-sm text-gray-500 text-center">
            {isEditingEmail ? (
              <div className="flex items-center justify-center gap-2 mt-1">
                <input
                  type="email"
                  value={editEmailDraft}
                  onChange={(e) => setEditEmailDraft(e.target.value)}
                  className="border rounded px-2 py-1 text-sm text-gray-800 w-48 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Enter email"
                  autoFocus
                />
                <button
                  onClick={() => {
                    if (editEmailDraft.trim()) setEmailOverride(editEmailDraft.trim())
                    setIsEditingEmail(false)
                  }}
                  className="text-blue-600 hover:underline"
                >
                  Save
                </button>
                <button
                  onClick={() => setIsEditingEmail(false)}
                  className="text-gray-400 hover:underline"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <span>
                Report will be sent to: <span className="font-medium text-gray-700">{displayEmail}</span>{' '}
                <button
                  onClick={() => { setEditEmailDraft(displayEmail); setIsEditingEmail(true) }}
                  className="text-blue-600 hover:underline"
                >
                  Change
                </button>
              </span>
            )}
          </div>
        )
      })()}
    </div>
  )
}
