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
// COMPLIANCE KNOWLEDGE BASE - Government References & Action Items
// ============================================================================

interface ComplianceRule {
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

const COMPLIANCE_RULES: Record<string, ComplianceRule> = {
  // PF Rules
  pf_1: {
    questionId: 'pf_1',
    category: 'Provident Fund',
    requirement: 'EPFO Registration',
    governmentRef: 'Employees Provident Funds and Miscellaneous Provisions Act, 1952 - Section 1(3)',
    officialLink: 'https://www.epfindia.gov.in',
    deadline: 'Within 1 month of crossing 20 employees threshold',
    penalty: 'Up to Rs.25,000 fine and 1 year imprisonment for non-registration',
    actionIfNonCompliant: [
      'Register immediately on EPFO Unified Portal (unifiedportal-emp.epfindia.gov.in)',
      'Obtain Establishment Code Number',
      'Register all eligible employees (earning up to Rs.15,000/month basic + DA)',
      'Submit Form 5A (Return of Ownership) within 15 days of registration'
    ],
    actionIfCompliant: 'Your EPFO registration is in order. Ensure annual renewal of Digital Signature Certificate (DSC) for continued portal access.',
    applicabilityNote: 'Mandatory for establishments with 20+ employees. Voluntary registration allowed for smaller establishments.'
  },
  pf_2: {
    questionId: 'pf_2',
    category: 'Provident Fund',
    requirement: 'Monthly PF Contribution Deposit',
    governmentRef: 'EPF Scheme 1952 - Para 38 | EPS 1995 - Para 6',
    officialLink: 'https://unifiedportal-emp.epfindia.gov.in',
    deadline: '15th of following month',
    penalty: '12% p.a. interest on delayed deposits + damages up to 100% of arrears',
    actionIfNonCompliant: [
      'Calculate arrears with 12% interest immediately',
      'File ECR (Electronic Challan cum Return) on Unified Portal',
      'Pay via online challan (EPFO accepts only online payments)',
      'Submit IW-1 form if wage arrears are being paid',
      'Set up auto-reminders for 10th of each month to ensure timely deposit'
    ],
    actionIfCompliant: 'Excellent! Timely PF deposits demonstrate good governance. Continue maintaining deposit records for 6 years as per EPF Scheme para 36A.'
  },

  // ESI Rules
  esi_1: {
    questionId: 'esi_1',
    category: 'Employee State Insurance',
    requirement: 'ESIC Registration',
    governmentRef: 'ESI Act, 1948 - Section 2A | ESI (Central) Rules 1950 - Rule 10',
    officialLink: 'https://www.esic.gov.in',
    deadline: 'Within 15 days of becoming applicable (10+ employees)',
    penalty: 'Twice the contribution amount + interest at 12% p.a.',
    actionIfNonCompliant: [
      'Register on ESIC Portal (esic.gov.in/employerlogin)',
      'Obtain 17-digit Employer Code',
      'Generate Temporary IDs for all employees',
      'Link employees Aadhaar for permanent IP numbers',
      'Declare wages and pay first contribution within 15 days'
    ],
    actionIfCompliant: 'Your ESIC registration is compliant. Remember to file half-yearly returns (Form 6) by 11th May and 11th November.',
    applicabilityNote: 'Mandatory for 10+ employees in notified areas. Wage ceiling: Rs.21,000/month (Rs.25,000 for PWD).'
  },
  esi_2: {
    questionId: 'esi_2',
    category: 'Employee State Insurance',
    requirement: 'Monthly ESI Contribution Deposit',
    governmentRef: 'ESI Act, 1948 - Section 39(5) | ESI Rules - Rule 31',
    officialLink: 'https://www.esic.gov.in/contribution',
    deadline: '15th of following month',
    penalty: 'Simple interest at 12% p.a. on delayed payment + damages up to 25%',
    actionIfNonCompliant: [
      'Calculate arrears: Employee share (0.75%) + Employer share (3.25%) = 4% of gross wages',
      'Log into ESIC Portal and generate challan',
      'Pay via online banking only (cash/cheque not accepted)',
      'Update monthly contribution details on portal',
      'Automate salary processing to calculate ESI correctly'
    ],
    actionIfCompliant: 'Good compliance! Ensure IP numbers are generated for all new joiners within 10 days of joining.'
  },
  esi_3: {
    questionId: 'esi_3',
    category: 'Employee State Insurance',
    requirement: 'Wage Ceiling Compliance',
    governmentRef: 'ESI Act, 1948 - Section 2(9) | Notification dated 06.10.2016',
    officialLink: 'https://www.esic.gov.in',
    deadline: 'Ongoing monitoring',
    penalty: 'Non-coverage leads to denial of benefits and retrospective liability',
    actionIfNonCompliant: [
      'Review salary structure of all employees monthly',
      'Employees crossing Rs.21,000 exit ESI coverage',
      'Provide exit documentation to affected employees',
      'Consider group health insurance for employees above ESI ceiling'
    ],
    actionIfCompliant: 'Correct wage monitoring in place. Continue monthly review of wage brackets during salary revisions.'
  },

  // Professional Tax Rules
  pt_1: {
    questionId: 'pt_1',
    category: 'Professional Tax',
    requirement: 'State Applicability Check',
    governmentRef: 'Article 276 of Constitution of India | State-specific PT Acts',
    officialLink: 'State Commercial Tax Department websites',
    deadline: 'N/A - Depends on state of operation',
    penalty: 'Varies by state: Rs.5 to Rs.5,000 per month of non-compliance',
    actionIfNonCompliant: [
      'Verify if your operating state levies Professional Tax',
      'States WITH PT: Maharashtra, Karnataka, West Bengal, Tamil Nadu, Gujarat, Andhra Pradesh, Telangana, Kerala, Assam, Meghalaya, Odisha, Tripura, Sikkim, Jharkhand, Bihar',
      'States WITHOUT PT: Delhi, Haryana, UP, Rajasthan, Punjab (confirm current status)',
      'If applicable, register within 30 days of starting operations'
    ],
    actionIfCompliant: 'You have correctly identified PT applicability. Proceed with registration if in an applicable state.'
  },
  pt_2: {
    questionId: 'pt_2',
    category: 'Professional Tax',
    requirement: 'PTRC Registration',
    governmentRef: 'Maharashtra: MVAT Act 2002 | Karnataka: KPT Act 1976 | State-specific Acts',
    officialLink: 'State GST/Commercial Tax portal',
    deadline: 'Within 30 days of becoming liable',
    penalty: 'Maharashtra: Rs.5/day delay | Karnataka: Rs.100/month | Other states vary',
    actionIfNonCompliant: [
      'Apply for PTRC (Professional Tax Registration Certificate) on state portal',
      'Maharashtra: mahagst.gov.in | Karnataka: gst.kar.nic.in',
      'Submit required documents: PAN, Aadhaar, Bank details, Rent agreement',
      'Obtain PTEC (Enrollment Certificate) for proprietor/partners/directors separately',
      'Display certificate at business premises'
    ],
    actionIfCompliant: 'PTRC is in order. Renew annually if required by your state (e.g., Maharashtra requires no renewal).'
  },
  pt_3: {
    questionId: 'pt_3',
    category: 'Professional Tax',
    requirement: 'Monthly PT Deduction and Deposit',
    governmentRef: 'State PT Acts - Collection and deposit provisions',
    officialLink: 'State Commercial Tax portal',
    deadline: 'Maharashtra: 30th of following month | Karnataka: 20th | Others vary',
    penalty: 'Interest 1-2% per month + penalties for late filing',
    actionIfNonCompliant: [
      'Review state-specific PT slabs for salary brackets',
      'Configure payroll system to auto-deduct PT from salaries',
      'File monthly/quarterly PT returns as per state rules',
      'Maharashtra: Monthly if PT > Rs.50,000/year, else quarterly',
      'Maintain Form III-B register of employees liable for PT'
    ],
    actionIfCompliant: 'PT compliance maintained. File annual returns (Form IIIB in Maharashtra) by 31st May each year.'
  },

  // Gratuity Rules
  gratuity_1: {
    questionId: 'gratuity_1',
    category: 'Gratuity',
    requirement: 'Gratuity Liability Tracking',
    governmentRef: 'Payment of Gratuity Act, 1972 - Section 4',
    officialLink: 'https://labour.gov.in/sites/default/files/ThePaymentofGratuityAct1972.pdf',
    deadline: 'Continuous tracking; payment within 30 days of becoming due',
    penalty: 'Simple interest at 10% p.a. from due date + up to 6 months imprisonment for default',
    actionIfNonCompliant: [
      'Calculate gratuity liability: (15 x Last drawn salary x Years of service) / 26',
      'Create gratuity register with all employees having 4+ years service',
      'Maximum gratuity ceiling: Rs.20,00,000 (as of 2024)',
      'Include gratuity provision in annual financial statements',
      'Consider actuarial valuation for accurate liability assessment'
    ],
    actionIfCompliant: 'Good practice! Regular liability tracking helps with cash flow planning. Review valuations annually with an actuary for companies with 100+ employees.',
    applicabilityNote: 'Applies to establishments with 10+ employees. Once applicable, continues even if count falls below 10.'
  },
  gratuity_2: {
    questionId: 'gratuity_2',
    category: 'Gratuity',
    requirement: 'Gratuity Funding/Insurance',
    governmentRef: 'Payment of Gratuity Act, 1972 - Section 4A | Income Tax Act Section 36(1)(v)',
    officialLink: 'https://licindia.in/Products/Group-Insurance/Group-Gratuity',
    deadline: 'Recommended to provision annually',
    penalty: 'Non-payment of gratuity: imprisonment up to 2 years + fine up to Rs.20,000',
    actionIfNonCompliant: [
      'Option 1: LIC Group Gratuity Scheme - Most popular, tax-deductible contributions',
      'Option 2: Private insurer gratuity plans (ICICI, HDFC, SBI Life)',
      'Option 3: Book reserve method - Create internal provision',
      'Consult CFO/CA for tax-optimal funding strategy',
      'Ensure adequate funds available when gratuity becomes payable'
    ],
    actionIfCompliant: 'Excellent financial planning! Review coverage adequacy annually, especially after salary revisions or new hires.'
  },

  // Bonus Rules
  bonus_1: {
    questionId: 'bonus_1',
    category: 'Statutory Bonus',
    requirement: 'Minimum Bonus Payment',
    governmentRef: 'Payment of Bonus Act, 1965 - Section 10 | Bonus ceiling notification 2016',
    officialLink: 'https://labour.gov.in/sites/default/files/payment_of_bonus_act_1702.pdf',
    deadline: 'Within 8 months of closing the accounting year',
    penalty: 'Imprisonment up to 6 months and/or fine up to Rs.1,000',
    actionIfNonCompliant: [
      'Identify eligible employees: Worked 30+ days, earning up to Rs.21,000/month (basic + DA)',
      'Calculate minimum bonus: 8.33% of salary or Rs.100, whichever is higher',
      'Calculate allocable surplus and maximum bonus (up to 20%)',
      'Pay bonus by 30th November for March year-end companies',
      'New establishments exempted for first 5 years if incurring losses'
    ],
    actionIfCompliant: 'Compliant with bonus requirements. Document bonus calculation methodology in Form D for inspection purposes.',
    applicabilityNote: 'Applies to establishments with 20+ employees. Employees earning basic + DA > Rs.21,000/month are NOT eligible for statutory bonus (but may receive ex-gratia).'
  },
  bonus_2: {
    questionId: 'bonus_2',
    category: 'Statutory Bonus',
    requirement: 'Bonus Registers and Timely Payment',
    governmentRef: 'Payment of Bonus Rules, 1975 - Rule 4 | Form A, B, C, D registers',
    officialLink: 'https://labour.gov.in',
    deadline: 'Payment: 30th Nov (March YE) | Registers: Maintain for 8 years',
    penalty: 'Failure to maintain registers: Fine up to Rs.1,000 per instance',
    actionIfNonCompliant: [
      'Maintain Form A: Computation of allocable surplus',
      'Maintain Form B: Set on/set off statement',
      'Maintain Form C: Bonus paid to each employee',
      'Maintain Form D: Annual return (submit to Labour Inspector by 31st Jan)',
      'Issue bonus payment slips to all eligible employees'
    ],
    actionIfCompliant: 'Well-maintained records. Submit annual return (Form D) to local Labour Commissioner by 31st January each year.'
  }
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
      let data: AssessmentData | null = null
      
      // For local/temp IDs, use localStorage
      if (id.startsWith('local_') || id.startsWith('temp_')) {
        data = assessmentData || null
      } else {
        // For database IDs, fetch assessment data from API
        try {
          const response = await fetch('/api/assessment/' + id)
          if (response.ok) {
            const apiData = await response.json()
            data = {
              id: apiData.id,
              assessment_type: apiData.assessment_type,
              overall_score: apiData.overall_score,
              category_scores: apiData.category_scores,
              responses: apiData.responses,
              userDetails: apiData.userDetails,
            }
          }
        } catch (fetchError) {
          console.error('Error fetching assessment:', fetchError)
        }
      }

      // Use fallback demo data if nothing found
      if (!data) {
        data = {
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

      // Generate PDF client-side based on assessment type
      const assessmentType = data.assessment_type || ASSESSMENT_TYPES.STATUTORY_HEALTH

      // Lazy-load jsPDF only when user clicks Download
      const [{ generateUnifiedReportBlob }, { adaptStatutoryHealth, adaptLabourCode, adaptDPDP, adaptStateWise, adaptFoodBusiness }] = await Promise.all([
        import('@/lib/pdf/unified-report-generator'),
        import('@/lib/pdf/report-data-adapter'),
      ])

      // Transform assessment data using type-specific adapter
      let reportData
      if (assessmentType === ASSESSMENT_TYPES.DPDP) {
        reportData = adaptDPDP(data)
      } else if (assessmentType === ASSESSMENT_TYPES.LABOUR_CODE) {
        reportData = adaptLabourCode(data)
      } else if (assessmentType === ASSESSMENT_TYPES.STATE_WISE_COMPLIANCE) {
        reportData = adaptStateWise(data)
      } else if (assessmentType === ASSESSMENT_TYPES.FOOD_BUSINESS) {
        reportData = adaptFoodBusiness(data)
      } else {
        reportData = adaptStatutoryHealth(data, COMPLIANCE_RULES)
      }

      // Generate consistent PDF using unified generator
      const blob = generateUnifiedReportBlob(reportData)

      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      const reportPrefix = reportData.config.filenamePrefix
      link.download = reportPrefix + '-' + new Date().toISOString().split('T')[0] + '.pdf'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

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
  }, [assessmentId, assessmentData, complianceScore])

  // ==========================================================================
  // EMAIL HANDLER
  // ==========================================================================

  const handleEmailReport = useCallback(async () => {
    setIsEmailing(true)
    setEmailError(null)
    setEmailSuccess(false)

    try {
      const id = assessmentId || window.location.pathname.split('/').pop() || 'demo'
      let data: AssessmentData | null = null
      
      // For local/temp IDs, try localStorage first (both from state and direct read)
      if (id.startsWith('local_') || id.startsWith('temp_')) {
        // First try from state
        data = assessmentData || null
        
        // If state is empty, try loading directly from localStorage
        if (!data) {
          try {
            const stored = localStorage.getItem(`assessment_${id}`)
            if (stored) {
              data = JSON.parse(stored)
            }
          } catch (e) {
            console.error('Error loading from localStorage:', e)
          }
        }
      } else {
        // For database IDs, fetch assessment data from API
        try {
          const response = await fetch('/api/assessment/' + id)
          if (response.ok) {
            const apiData = await response.json()
            data = {
              id: apiData.id,
              assessment_type: apiData.assessment_type,
              overall_score: apiData.overall_score,
              category_scores: apiData.category_scores,
              responses: apiData.responses,
              userDetails: apiData.userDetails,
            }
          }
        } catch (fetchError) {
          console.error('Error fetching assessment:', fetchError)
        }
      }

      // Use fallback if nothing found - try localStorage one more time
      if (!data) {
        try {
          const stored = localStorage.getItem(`assessment_${id}`)
          if (stored) {
            data = JSON.parse(stored)
          }
        } catch (e) {
          console.error('Final localStorage fallback failed:', e)
        }
      }
      
      // If still no data, use minimal fallback
      if (!data) {
        data = assessmentData || {
          id,
          assessment_type: ASSESSMENT_TYPES.STATUTORY_HEALTH,
          overall_score: 65,
          category_scores: {},
          userDetails: { companyName: 'Unknown' },
        }
      }

      // Get email from user details (check ALL possible field names and structures)
      // Different assessment types store email in different places:
      // - Statutory Health: userDetails.email (from responses.userDetails.email)
      // - Labour Code: userDetails.contactEmail (from responses.userDetails.contactEmail)
      // - DPDP: user_details.email or organizationProfile.email
      const userDetails = data.userDetails || data.user_details || data.responses?.userDetails || {}
      const responsesUserDetails = data.responses?.userDetails || {}
      const dataAsUnknown = data as unknown as Record<string, unknown>
      const orgProfile = dataAsUnknown.organizationProfile as Record<string, unknown> | undefined
      const userDetailsField = dataAsUnknown.user_details as Record<string, unknown> | undefined
      
      // Check all possible email field names across all assessment types
      const email = userDetails.email || 
                   userDetails.contactEmail || 
                   responsesUserDetails.email || 
                   responsesUserDetails.contactEmail ||
                   userDetailsField?.email ||
                   orgProfile?.email ||
                   dataAsUnknown.email ||
                   dataAsUnknown.contactEmail

      const resolvedEmail = emailOverride || email

      if (!resolvedEmail) {
        console.error('Email lookup failed. Data structure:', {
          userDetails,
          responsesUserDetails,
          orgProfile,
          dataKeys: Object.keys(data || {}),
        })
        setEmailError('No email address found. Please download the report instead.')
        return
      }

      // Generate PDF as base64
      const assessmentType = data.assessment_type || propAssessmentType || ASSESSMENT_TYPES.STATUTORY_HEALTH

      // Lazy-load jsPDF only when user clicks Email
      const [{ generateUnifiedReportBlob: genBlob }, { adaptStatutoryHealth: adaptSH, adaptLabourCode: adaptLC, adaptDPDP: adaptD, adaptStateWise: adaptSW, adaptFoodBusiness: adaptFB }] = await Promise.all([
        import('@/lib/pdf/unified-report-generator'),
        import('@/lib/pdf/report-data-adapter'),
      ])

      // Transform assessment data using type-specific adapter
      let reportData
      if (assessmentType === ASSESSMENT_TYPES.DPDP) {
        reportData = adaptD(data)
      } else if (assessmentType === ASSESSMENT_TYPES.LABOUR_CODE) {
        reportData = adaptLC(data)
      } else if (assessmentType === ASSESSMENT_TYPES.STATE_WISE_COMPLIANCE) {
        reportData = adaptSW(data)
      } else if (assessmentType === ASSESSMENT_TYPES.FOOD_BUSINESS) {
        reportData = adaptFB(data)
      } else {
        reportData = adaptSH(data, COMPLIANCE_RULES)
      }

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
          companyName: userDetails.companyName || 'Your Company',
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
