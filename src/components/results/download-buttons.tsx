'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Download, Mail, Loader2, Check } from 'lucide-react'
import { jsPDF } from 'jspdf'
import { createBrowserClient } from '@supabase/ssr'
import { DPDP_COMPLIANCE_RULES, DPDP_CATEGORY_LABELS } from '@/lib/pdf/dpdp-compliance-rules'
import { ASSESSMENT_TYPES } from '@/lib/constants/assessment-types'

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
  }
  created_at?: string
}

interface DownloadButtonsProps {
  assessmentId?: string
  assessmentType?: string
  autoTrigger?: 'download' | 'email' | null
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const CATEGORY_LABELS: Record<string, string> = {
  pf: 'Provident Fund (PF)',
  esi: 'Employee State Insurance (ESI)',
  pt: 'Professional Tax (PT)',
  gratuity: 'Gratuity',
  bonus: 'Statutory Bonus',
}

function getStatusText(score: number): string {
  if (score >= 80) return 'Compliant'
  if (score >= 50) return 'Needs Attention'
  return 'Non-Compliant'
}

function getStatusColour(score: number): [number, number, number] {
  if (score >= 80) return [5, 150, 105] // Green
  if (score >= 50) return [217, 119, 6] // Amber
  return [220, 38, 38] // Red
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function DownloadButtons({ assessmentId, assessmentType: propAssessmentType, autoTrigger }: DownloadButtonsProps) {
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadSuccess, setDownloadSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [assessmentData, setAssessmentData] = useState<AssessmentData | null>(null)
  const [autoTriggered, setAutoTriggered] = useState(false)
  
  // Email state
  const [isEmailing, setIsEmailing] = useState(false)
  const [emailSuccess, setEmailSuccess] = useState(false)
  const [emailError, setEmailError] = useState<string | null>(null)

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
  }, [autoTrigger, autoTriggered])

  // ==========================================================================
  // PDF GENERATION - ASCII SAFE VERSION
  // ==========================================================================

  const generatePDF = (data: AssessmentData): Blob => {
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const margin = 15
    const contentWidth = pageWidth - (margin * 2)
    let yPos = margin

    // Get data
    const userDetails = data.userDetails || data.responses?.userDetails || {}
    const answers = data.responses?.answers || {}
    const overallScore = data.overall_score ?? 50  // Use ?? to preserve 0 scores
    const categoryScores = data.category_scores || {}

    // Helper: Add wrapped text
    const addText = (text: string, x: number, y: number, maxWidth: number, lineHeight: number = 5): number => {
      const lines = doc.splitTextToSize(text, maxWidth)
      doc.text(lines, x, y)
      return y + (lines.length * lineHeight)
    }

    // Helper: Check page break
    const checkPageBreak = (requiredSpace: number): void => {
      if (yPos + requiredSpace > pageHeight - 25) {
        doc.setFontSize(8)
        doc.setTextColor(150)
        doc.text('Page ' + doc.getNumberOfPages(), pageWidth / 2, pageHeight - 10, { align: 'center' })
        doc.addPage()
        yPos = margin
      }
    }

    // Helper: Draw section header
    const drawSectionHeader = (title: string, bgColor: [number, number, number] = [30, 64, 175]): void => {
      checkPageBreak(20)
      doc.setFillColor(bgColor[0], bgColor[1], bgColor[2])
      doc.rect(margin, yPos, contentWidth, 10, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      doc.text(title, margin + 5, yPos + 7)
      yPos += 15
    }

    // ========================================================================
    // PAGE 1: COVER PAGE
    // ========================================================================

    // Header
    doc.setFillColor(30, 64, 175)
    doc.rect(0, 0, pageWidth, 45, 'F')

    doc.setTextColor(255, 255, 255)
    doc.setFontSize(22)
    doc.setFont('helvetica', 'bold')
    doc.text('ComplianceCheck', margin, 25)

    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    doc.text('Statutory Compliance Health Check Report', margin, 36)

    doc.setFontSize(10)
    doc.text(new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }), pageWidth - margin, 36, { align: 'right' })

    yPos = 55

    // Company Information Box
    doc.setFillColor(249, 250, 251)
    doc.roundedRect(margin, yPos, contentWidth, 40, 3, 3, 'F')
    doc.setDrawColor(229, 231, 235)
    doc.roundedRect(margin, yPos, contentWidth, 40, 3, 3, 'S')

    doc.setTextColor(31, 41, 55)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text('Organisation Details', margin + 5, yPos + 10)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    const companyName = userDetails.companyName || 'Not specified'
    const industry = userDetails.industry || 'Not specified'
    const employeeCount = userDetails.employeeCount || 'Not specified'
    const state = userDetails.state || 'Not specified'
    const contactName = userDetails.fullName || 'Not specified'

    doc.text('Company: ' + companyName, margin + 5, yPos + 20)
    doc.text('Industry: ' + industry, margin + 5, yPos + 28)
    doc.text('Contact: ' + contactName, margin + 5, yPos + 36)
    doc.text('Employees: ' + employeeCount, pageWidth / 2, yPos + 20)
    doc.text('State: ' + state, pageWidth / 2, yPos + 28)
    doc.text('Report ID: ' + data.id.substring(0, 20) + '...', pageWidth / 2, yPos + 36)

    yPos += 50

    // Overall Score
    const statusColour = getStatusColour(overallScore)
    const statusText = getStatusText(overallScore)

    doc.setFillColor(statusColour[0], statusColour[1], statusColour[2])
    doc.roundedRect(margin, yPos, contentWidth, 35, 3, 3, 'F')

    doc.setTextColor(255, 255, 255)
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('Overall Compliance Score', margin + 10, yPos + 15)

    doc.setFontSize(32)
    doc.text(overallScore + '%', pageWidth - margin - 10, yPos + 25, { align: 'right' })

    doc.setFontSize(11)
    doc.text(statusText, margin + 10, yPos + 28)

    yPos += 45

    // Category Summary Table
    doc.setTextColor(31, 41, 55)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text('Compliance Summary by Category', margin, yPos)
    yPos += 8

    // Table header
    doc.setFillColor(243, 244, 246)
    doc.rect(margin, yPos, contentWidth, 8, 'F')
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    doc.text('Category', margin + 3, yPos + 5.5)
    doc.text('Score', margin + 100, yPos + 5.5)
    doc.text('Status', margin + 130, yPos + 5.5)
    yPos += 8

    // Table rows
    doc.setFont('helvetica', 'normal')
    Object.entries(categoryScores).forEach(([cat, scoreData]) => {
      const percentage = typeof scoreData === 'number' ? scoreData : scoreData.percentage || 0
      const catStatus = getStatusText(percentage)
      const catColour = getStatusColour(percentage)

      doc.setDrawColor(229, 231, 235)
      doc.line(margin, yPos, margin + contentWidth, yPos)

      doc.setTextColor(55, 65, 81)
      doc.text(CATEGORY_LABELS[cat] || cat, margin + 3, yPos + 5)
      doc.text(percentage + '%', margin + 100, yPos + 5)
      
      doc.setTextColor(catColour[0], catColour[1], catColour[2])
      doc.text(catStatus, margin + 130, yPos + 5)
      yPos += 8
    })

    yPos += 10

    // ========================================================================
    // PAGE 2+: DETAILED FINDINGS
    // ========================================================================

    doc.addPage()
    yPos = margin

    // What You're Doing Right
    const compliantItems: string[] = []
    const nonCompliantItems: { questionId: string; rule: ComplianceRule }[] = []

    Object.entries(answers).forEach(([questionId, answer]) => {
      const rule = COMPLIANCE_RULES[questionId]
      if (!rule) return

      const isCompliant = answer === 'yes'
      
      if (isCompliant) {
        compliantItems.push(questionId)
      } else if (answer === 'no') {
        nonCompliantItems.push({ questionId, rule })
      }
    })

    // SECTION: What You're Doing Right (ASCII safe)
    if (compliantItems.length > 0) {
      drawSectionHeader('[COMPLIANT] What You Are Doing Right', [5, 150, 105])

      compliantItems.forEach((questionId) => {
        const rule = COMPLIANCE_RULES[questionId]
        if (!rule) return

        checkPageBreak(25)

        doc.setFillColor(236, 253, 245)
        doc.roundedRect(margin, yPos, contentWidth, 18, 2, 2, 'F')

        doc.setTextColor(5, 150, 105)
        doc.setFontSize(9)
        doc.setFont('helvetica', 'bold')
        doc.text('[PASS] ' + rule.requirement, margin + 3, yPos + 6)

        doc.setTextColor(55, 65, 81)
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(8)
        yPos = addText(rule.actionIfCompliant, margin + 3, yPos + 12, contentWidth - 6, 4)
        yPos += 5
      })
    }

    // SECTION: Areas Requiring Attention (ASCII safe)
    if (nonCompliantItems.length > 0) {
      yPos += 5
      drawSectionHeader('[ACTION REQUIRED] Areas Needing Immediate Attention', [220, 38, 38])

      nonCompliantItems.forEach(({ rule }) => {
        checkPageBreak(70)

        // Issue box
        doc.setFillColor(254, 242, 242)
        doc.setDrawColor(252, 165, 165)
        doc.roundedRect(margin, yPos, contentWidth, 8, 2, 2, 'FD')

        doc.setTextColor(185, 28, 28)
        doc.setFontSize(9)
        doc.setFont('helvetica', 'bold')
        doc.text('[FAIL] ' + rule.requirement + ' - Non-Compliant', margin + 3, yPos + 5.5)
        yPos += 12

        // Details
        doc.setTextColor(75, 85, 99)
        doc.setFontSize(8)
        doc.setFont('helvetica', 'normal')

        // Legal Reference
        doc.setFont('helvetica', 'bold')
        doc.text('Legal Reference:', margin, yPos)
        doc.setFont('helvetica', 'normal')
        yPos = addText(rule.governmentRef, margin + 28, yPos, contentWidth - 28, 4)
        yPos += 2

        // Deadline
        doc.setFont('helvetica', 'bold')
        doc.text('Deadline:', margin, yPos)
        doc.setFont('helvetica', 'normal')
        doc.text(rule.deadline, margin + 20, yPos)
        yPos += 5

        // Penalty
        doc.setTextColor(185, 28, 28)
        doc.setFont('helvetica', 'bold')
        doc.text('Penalty for Non-Compliance:', margin, yPos)
        doc.setFont('helvetica', 'normal')
        yPos = addText(rule.penalty, margin + 48, yPos, contentWidth - 48, 4)
        yPos += 3

        // Action Items
        doc.setTextColor(31, 41, 55)
        doc.setFont('helvetica', 'bold')
        doc.text('Remediation Steps:', margin, yPos)
        yPos += 5

        doc.setFont('helvetica', 'normal')
        rule.actionIfNonCompliant.forEach((action, idx) => {
          checkPageBreak(8)
          yPos = addText((idx + 1) + '. ' + action, margin + 3, yPos, contentWidth - 6, 4)
          yPos += 2
        })

        // Official Link
        doc.setTextColor(30, 64, 175)
        doc.setFont('helvetica', 'italic')
        doc.text('Official Portal: ' + rule.officialLink, margin, yPos)
        yPos += 10

        // Separator
        doc.setDrawColor(229, 231, 235)
        doc.line(margin, yPos, margin + contentWidth, yPos)
        yPos += 8
      })
    }

    // ========================================================================
    // FINAL PAGE: REFERENCES & DISCLAIMER
    // ========================================================================

    doc.addPage()
    yPos = margin

    drawSectionHeader('Government References and Official Portals', [30, 64, 175])

    const references = [
      { name: 'EPFO Unified Portal', url: 'https://unifiedportal-emp.epfindia.gov.in', desc: 'EPF registration, challan, returns' },
      { name: 'ESIC Portal', url: 'https://www.esic.gov.in', desc: 'ESI registration, contributions, claims' },
      { name: 'Ministry of Labour', url: 'https://labour.gov.in', desc: 'Labour laws, notifications, forms' },
      { name: 'Shram Suvidha Portal', url: 'https://shramsuvidha.gov.in', desc: 'Single registration for labour laws' },
      { name: 'Maharashtra PT Portal', url: 'https://mahagst.gov.in', desc: 'Professional Tax (Maharashtra)' },
      { name: 'Karnataka PT Portal', url: 'https://gst.kar.nic.in', desc: 'Professional Tax (Karnataka)' },
      { name: 'LIC Group Gratuity', url: 'https://licindia.in/Products/Group-Insurance', desc: 'Gratuity insurance schemes' },
    ]

    doc.setFontSize(8)
    references.forEach((ref) => {
      checkPageBreak(12)
      doc.setTextColor(30, 64, 175)
      doc.setFont('helvetica', 'bold')
      doc.text(ref.name, margin, yPos)
      doc.setTextColor(75, 85, 99)
      doc.setFont('helvetica', 'normal')
      doc.text(' - ' + ref.desc, margin + 45, yPos)
      doc.setTextColor(100, 116, 139)
      doc.text(ref.url, margin, yPos + 4)
      yPos += 10
    })

    yPos += 10

    // Key Legislation
    drawSectionHeader('Applicable Legislation', [75, 85, 99])

    const laws = [
      'Employees Provident Funds and Miscellaneous Provisions Act, 1952',
      'Employees State Insurance Act, 1948',
      'Payment of Gratuity Act, 1972',
      'Payment of Bonus Act, 1965',
      'Code on Wages, 2019 (effective upon notification)',
      'Code on Social Security, 2020 (effective upon notification)',
      'State Professional Tax Acts (varies by state)',
    ]

    doc.setFontSize(8)
    doc.setTextColor(55, 65, 81)
    laws.forEach((law) => {
      checkPageBreak(6)
      doc.text('* ' + law, margin + 3, yPos)
      yPos += 5
    })

    yPos += 10

    // Disclaimer
    checkPageBreak(35)
    doc.setFillColor(254, 243, 199)
    doc.roundedRect(margin, yPos, contentWidth, 30, 3, 3, 'F')

    doc.setTextColor(146, 64, 14)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.text('Important Disclaimer', margin + 5, yPos + 8)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7)
    const disclaimer = 'This report is generated based on your self-assessment responses and is intended for informational purposes only. It does not constitute legal, tax, or professional advice. Compliance requirements may vary based on specific circumstances, recent amendments, and state-specific rules. We strongly recommend consulting with a qualified Company Secretary, Labour Law Consultant, or Chartered Accountant for specific compliance advice. ComplianceCheck and its affiliates assume no liability for actions taken based on this report.'
    addText(disclaimer, margin + 5, yPos + 14, contentWidth - 10, 3.5)

    // Footer on all pages
    const totalPages = doc.getNumberOfPages()
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i)
      doc.setFontSize(7)
      doc.setTextColor(156, 163, 175)
      doc.text('ComplianceCheck | compliancecheck.in | Simplifying compliance for Indian businesses', margin, pageHeight - 8)
      doc.text('Page ' + i + ' of ' + totalPages, pageWidth - margin, pageHeight - 8, { align: 'right' })
    }

    return doc.output('blob')
  }

  // ==========================================================================
  // LABOUR CODE PDF GENERATION
  // ==========================================================================

  const generateLabourCodePDF = (data: AssessmentData): Blob => {
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const margin = 15
    const contentWidth = pageWidth - (margin * 2)
    let yPos = margin

    // Get data
    const userDetails = data.userDetails || data.responses?.userDetails || {}
    const overallScore = data.overall_score ?? 50
    const categoryScores = data.category_scores || {}
    const actionItems: ActionItem[] = data.action_items || []

    // Helper functions
    const addText = (text: string, x: number, y: number, maxWidth: number, lineHeight: number = 5): number => {
      const lines = doc.splitTextToSize(text, maxWidth)
      doc.text(lines, x, y)
      return y + (lines.length * lineHeight)
    }

    const checkPageBreak = (requiredSpace: number): void => {
      if (yPos + requiredSpace > pageHeight - 25) {
        doc.setFontSize(8)
        doc.setTextColor(150)
        doc.text('Page ' + doc.getNumberOfPages(), pageWidth / 2, pageHeight - 10, { align: 'center' })
        doc.addPage()
        yPos = margin
      }
    }

    const drawSectionHeader = (title: string, bgColor: [number, number, number] = [30, 64, 175]): void => {
      checkPageBreak(20)
      doc.setFillColor(bgColor[0], bgColor[1], bgColor[2])
      doc.rect(margin, yPos, contentWidth, 10, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      doc.text(title, margin + 5, yPos + 7)
      yPos += 15
    }

    // Header
    doc.setFillColor(30, 64, 175)
    doc.rect(0, 0, pageWidth, 45, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(22)
    doc.setFont('helvetica', 'bold')
    doc.text('ComplianceCheck', margin, 25)
    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    doc.text('Labour Code Readiness Assessment Report', margin, 36)
    doc.setFontSize(10)
    doc.text(new Date().toLocaleDateString('en-IN'), pageWidth - margin, 36, { align: 'right' })

    yPos = 55

    // Company Details
    doc.setFillColor(249, 250, 251)
    doc.roundedRect(margin, yPos, contentWidth, 40, 3, 3, 'F')
    doc.setTextColor(31, 41, 55)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text('Organisation Details', margin + 5, yPos + 10)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.text('Company: ' + (userDetails.companyName || 'N/A'), margin + 5, yPos + 20)
    doc.text('Industry: ' + (userDetails.industry || 'N/A'), margin + 5, yPos + 28)
    doc.text('Employees: ' + (userDetails.employeeCount || 'N/A'), pageWidth / 2, yPos + 20)
    doc.text('State: ' + (userDetails.state || 'N/A'), pageWidth / 2, yPos + 28)

    yPos += 50

    // Overall Score
    const scoreColor: [number, number, number] = overallScore >= 80 ? [5, 150, 105] : overallScore >= 50 ? [217, 119, 6] : [220, 38, 38]
    doc.setFillColor(scoreColor[0], scoreColor[1], scoreColor[2])
    doc.roundedRect(margin, yPos, contentWidth, 25, 3, 3, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text('Overall Readiness: ' + Math.round(overallScore) + '%', pageWidth / 2, yPos + 12, { align: 'center' })
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    const status = overallScore >= 80 ? 'Ready' : overallScore >= 50 ? 'Needs Attention' : 'At Risk'
    doc.text(status, pageWidth / 2, yPos + 19, { align: 'center' })

    yPos += 35

    // Category Scores
    drawSectionHeader('Category Breakdown')
    const categories = {
      'wages': 'Code on Wages',
      'social_security': 'Social Security Code',
      'osh': 'OSH Code',
      'industrial_relations': 'Industrial Relations Code'
    }

    Object.entries(categories).forEach(([key, label]) => {
      const score = categoryScores[key]
      const percentage = typeof score === 'number' ? score : (score?.percentage || 0)
      checkPageBreak(12)
      doc.setTextColor(31, 41, 55)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(9)
      doc.text(label + ': ' + Math.round(percentage) + '%', margin, yPos)
      doc.setFillColor(229, 231, 235)
      doc.rect(margin, yPos + 2, contentWidth, 4, 'F')
      const barColor = percentage >= 80 ? [5, 150, 105] : percentage >= 50 ? [217, 119, 6] : [220, 38, 38]
      doc.setFillColor(barColor[0], barColor[1], barColor[2])
      doc.rect(margin, yPos + 2, (contentWidth * percentage) / 100, 4, 'F')
      yPos += 10
    })

    yPos += 10

    // Action Items
    if (actionItems.length > 0) {
      drawSectionHeader('Priority Action Items', [220, 38, 38])
      const priorityOrder: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 }
      actionItems.sort((a, b) => {
        return (priorityOrder[a.priority] ?? 3) - (priorityOrder[b.priority] ?? 3)
      })

      actionItems.forEach((item) => {
        checkPageBreak(15)
        const badgeColor = item.priority === 'high' || item.priority === 'critical' 
          ? [220, 38, 38] 
          : item.priority === 'medium' 
            ? [217, 119, 6] 
            : [107, 114, 128]
        doc.setFillColor(badgeColor[0], badgeColor[1], badgeColor[2])
        doc.setTextColor(255, 255, 255)
        doc.setFontSize(7)
        doc.setFont('helvetica', 'bold')
        const badgeText = item.priority.toUpperCase()
        const badgeWidth = doc.getTextWidth(badgeText) + 4
        doc.rect(margin, yPos, badgeWidth, 5, 'F')
        doc.text(badgeText, margin + 2, yPos + 3.5)
        doc.setTextColor(31, 41, 55)
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(8)
        const itemText = item.text || item.title || item.description || ''
        yPos = addText(itemText, margin + badgeWidth + 3, yPos + 3, contentWidth - badgeWidth - 3, 4)
        yPos += 6
      })
    }

    // Disclaimer
    doc.addPage()
    yPos = margin
    doc.setFillColor(254, 243, 199)
    doc.roundedRect(margin, yPos, contentWidth, 35, 3, 3, 'F')
    doc.setTextColor(146, 64, 14)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.text('Important Disclaimer', margin + 5, yPos + 8)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7)
    const disclaimer = 'This report is based on your self-reported responses and is for informational purposes only. It does not constitute legal advice. Compliance requirements vary by state and specific circumstances. Consult a qualified Labour Law Consultant for specific advice. ComplianceCheck assumes no liability for actions taken based on this report.'
    addText(disclaimer, margin + 5, yPos + 14, contentWidth - 10, 3.5)

    // Footer
    const totalPages = doc.getNumberOfPages()
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i)
      doc.setFontSize(7)
      doc.setTextColor(156, 163, 175)
      doc.text('ComplianceCheck | compliancecheck.in', margin, pageHeight - 8)
      doc.text('Page ' + i + ' of ' + totalPages, pageWidth - margin, pageHeight - 8, { align: 'right' })
    }

    return doc.output('blob')
  }

  // ==========================================================================
  // DPDP PDF GENERATION
  // ==========================================================================

  const generateDPDPPDF = (data: AssessmentData): Blob => {
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const margin = 15
    const contentWidth = pageWidth - (margin * 2)
    let yPos = margin

    const userDetails = data.userDetails || data.responses?.userDetails || {}
    const answers = data.responses?.answers || {}
    const overallScore = data.overall_score ?? 50  // Use ?? to preserve 0 scores
    const categoryScores = data.category_scores || {}

    const addText = (text: string, x: number, y: number, maxWidth: number, lineHeight: number = 5): number => {
      const lines = doc.splitTextToSize(text, maxWidth)
      doc.text(lines, x, y)
      return y + (lines.length * lineHeight)
    }

    const checkPageBreak = (requiredSpace: number): void => {
      if (yPos + requiredSpace > pageHeight - 25) {
        doc.setFontSize(8)
        doc.setTextColor(150)
        doc.text('Page ' + doc.getNumberOfPages(), pageWidth / 2, pageHeight - 10, { align: 'center' })
        doc.addPage()
        yPos = margin
      }
    }

    const drawSectionHeader = (title: string, bgColor: [number, number, number] = [147, 51, 234]): void => {
      checkPageBreak(20)
      doc.setFillColor(bgColor[0], bgColor[1], bgColor[2])
      doc.rect(margin, yPos, contentWidth, 10, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      doc.text(title, margin + 5, yPos + 7)
      yPos += 15
    }

    // ========== COVER PAGE ==========
    doc.setFillColor(147, 51, 234) // Purple
    doc.rect(0, 0, pageWidth, 45, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(22)
    doc.setFont('helvetica', 'bold')
    doc.text('ComplianceCheck', margin, 25)
    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    doc.text('DPDP Act 2023 Gap Assessment Report', margin, 36)
    doc.setFontSize(10)
    doc.text(new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }), pageWidth - margin, 36, { align: 'right' })
    yPos = 55

    // Company Info
    doc.setFillColor(249, 250, 251)
    doc.roundedRect(margin, yPos, contentWidth, 40, 3, 3, 'F')
    doc.setDrawColor(229, 231, 235)
    doc.roundedRect(margin, yPos, contentWidth, 40, 3, 3, 'S')
    doc.setTextColor(31, 41, 55)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text('Organisation Details', margin + 5, yPos + 10)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.text('Company: ' + (userDetails.companyName || 'Not specified'), margin + 5, yPos + 20)
    doc.text('Industry: ' + (userDetails.industry || 'Not specified'), margin + 5, yPos + 28)
    doc.text('State: ' + (userDetails.state || 'Not specified'), margin + 5, yPos + 36)
    doc.text('Report ID: ' + data.id.substring(0, 20) + '...', pageWidth / 2, yPos + 20)
    yPos += 50

    // Deadline Warning
    doc.setFillColor(254, 243, 199)
    doc.roundedRect(margin, yPos, contentWidth, 15, 3, 3, 'F')
    doc.setTextColor(146, 64, 14)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text('COMPLIANCE DEADLINE: 13 May 2027', margin + 5, yPos + 10)
    yPos += 20

    // Overall Score
    const statusColour: [number, number, number] = overallScore >= 80 ? [5, 150, 105] : overallScore >= 60 ? [217, 119, 6] : overallScore >= 40 ? [234, 88, 12] : [220, 38, 38]
    const statusText = overallScore >= 80 ? 'Ready' : overallScore >= 60 ? 'Needs Attention' : overallScore >= 40 ? 'At Risk' : 'Critical'
    doc.setFillColor(statusColour[0], statusColour[1], statusColour[2])
    doc.roundedRect(margin, yPos, contentWidth, 35, 3, 3, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('Overall DPDP Readiness Score', margin + 10, yPos + 15)
    doc.setFontSize(32)
    doc.text(overallScore + '%', pageWidth - margin - 10, yPos + 25, { align: 'right' })
    doc.setFontSize(11)
    doc.text(statusText, margin + 10, yPos + 28)
    yPos += 45

    // Category Summary Table
    doc.setTextColor(31, 41, 55)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text('Compliance by Category', margin, yPos)
    yPos += 8
    doc.setFillColor(243, 244, 246)
    doc.rect(margin, yPos, contentWidth, 8, 'F')
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    doc.text('Category', margin + 3, yPos + 5.5)
    doc.text('Score', margin + 100, yPos + 5.5)
    doc.text('Penalty', margin + 125, yPos + 5.5)
    yPos += 8

    const penaltyMap: Record<string, string> = {
      inventory: 'Rs.50Cr', consent: 'Rs.50Cr', notices: 'Rs.50Cr', rights: 'Rs.200Cr',
      security: 'Rs.250Cr', breach: 'Rs.200Cr', children: 'Rs.200Cr', thirdparty: 'Rs.250Cr'
    }

    doc.setFont('helvetica', 'normal')
    Object.entries(categoryScores).forEach(([cat, scoreData]) => {
      const percentage = typeof scoreData === 'number' ? scoreData : (scoreData as { percentage?: number })?.percentage || 0
      const catColour: [number, number, number] = percentage >= 80 ? [5, 150, 105] : percentage >= 60 ? [217, 119, 6] : [220, 38, 38]
      doc.setDrawColor(229, 231, 235)
      doc.line(margin, yPos, margin + contentWidth, yPos)
      doc.setTextColor(55, 65, 81)
      doc.text(DPDP_CATEGORY_LABELS[cat] || cat, margin + 3, yPos + 5)
      doc.setTextColor(catColour[0], catColour[1], catColour[2])
      doc.text(percentage + '%', margin + 100, yPos + 5)
      doc.setTextColor(220, 38, 38)
      doc.text(penaltyMap[cat] || '-', margin + 125, yPos + 5)
      yPos += 8
    })
    yPos += 10

    // ========== PAGE 2+: DETAILED FINDINGS ==========
    doc.addPage()
    yPos = margin

    const compliantItems: string[] = []
    const nonCompliantItems: { questionId: string; rule: typeof DPDP_COMPLIANCE_RULES[string] }[] = []

    Object.entries(answers).forEach(([questionId, answer]) => {
      const rule = DPDP_COMPLIANCE_RULES[questionId]
      if (!rule) return
      if (answer === 'yes') compliantItems.push(questionId)
      else if (answer === 'no') nonCompliantItems.push({ questionId, rule })
    })

    // Compliant Items
    if (compliantItems.length > 0) {
      drawSectionHeader('[COMPLIANT] Areas Meeting Requirements', [5, 150, 105])
      compliantItems.forEach((questionId) => {
        const rule = DPDP_COMPLIANCE_RULES[questionId]
        if (!rule) return
        checkPageBreak(25)
        doc.setFillColor(236, 253, 245)
        doc.roundedRect(margin, yPos, contentWidth, 18, 2, 2, 'F')
        doc.setTextColor(5, 150, 105)
        doc.setFontSize(9)
        doc.setFont('helvetica', 'bold')
        doc.text('[PASS] ' + rule.requirement, margin + 3, yPos + 6)
        doc.setTextColor(55, 65, 81)
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(8)
        yPos = addText(rule.actionIfCompliant, margin + 3, yPos + 12, contentWidth - 6, 4)
        yPos += 5
      })
    }

    // Non-Compliant Items
    if (nonCompliantItems.length > 0) {
      yPos += 5
      drawSectionHeader('[ACTION REQUIRED] Gaps Requiring Remediation', [220, 38, 38])
      nonCompliantItems.forEach(({ rule }) => {
        checkPageBreak(70)
        doc.setFillColor(254, 242, 242)
        doc.setDrawColor(252, 165, 165)
        doc.roundedRect(margin, yPos, contentWidth, 8, 2, 2, 'FD')
        doc.setTextColor(185, 28, 28)
        doc.setFontSize(9)
        doc.setFont('helvetica', 'bold')
        doc.text('[GAP] ' + rule.requirement, margin + 3, yPos + 5.5)
        yPos += 12
        doc.setTextColor(75, 85, 99)
        doc.setFontSize(8)
        doc.setFont('helvetica', 'normal')
        doc.setFont('helvetica', 'bold')
        doc.text('Legal Reference:', margin, yPos)
        doc.setFont('helvetica', 'normal')
        yPos = addText(rule.governmentRef, margin + 28, yPos, contentWidth - 28, 4)
        yPos += 2
        doc.setFont('helvetica', 'bold')
        doc.text('Deadline:', margin, yPos)
        doc.setFont('helvetica', 'normal')
        doc.text(rule.deadline, margin + 20, yPos)
        yPos += 5
        doc.setTextColor(185, 28, 28)
        doc.setFont('helvetica', 'bold')
        doc.text('Penalty:', margin, yPos)
        doc.setFont('helvetica', 'normal')
        yPos = addText(rule.penalty, margin + 18, yPos, contentWidth - 18, 4)
        yPos += 3
        doc.setTextColor(31, 41, 55)
        doc.setFont('helvetica', 'bold')
        doc.text('Remediation Steps:', margin, yPos)
        yPos += 5
        doc.setFont('helvetica', 'normal')
        rule.actionIfNonCompliant.forEach((action, idx) => {
          checkPageBreak(8)
          yPos = addText((idx + 1) + '. ' + action, margin + 3, yPos, contentWidth - 6, 4)
          yPos += 2
        })
        doc.setTextColor(147, 51, 234)
        doc.setFont('helvetica', 'italic')
        doc.text('Official Portal: ' + rule.officialLink, margin, yPos)
        yPos += 10
        doc.setDrawColor(229, 231, 235)
        doc.line(margin, yPos, margin + contentWidth, yPos)
        yPos += 8
      })
    }

    // ========== REFERENCES PAGE ==========
    doc.addPage()
    yPos = margin
    drawSectionHeader('Government References and Official Portals', [147, 51, 234])
    const dpdpRefs = [
      { name: 'MeitY Data Protection', url: 'https://www.meity.gov.in/data-protection-framework', desc: 'Official DPDP documentation' },
      { name: 'Data Protection Board', url: 'https://dpb.gov.in', desc: 'Complaints and enforcement' },
      { name: 'DigiLocker', url: 'https://digilocker.gov.in', desc: 'Verifiable credentials for consent' },
      { name: 'CERT-In', url: 'https://www.cert-in.org.in', desc: 'Cyber incident reporting' },
    ]
    doc.setFontSize(8)
    dpdpRefs.forEach((ref) => {
      checkPageBreak(12)
      doc.setTextColor(147, 51, 234)
      doc.setFont('helvetica', 'bold')
      doc.text(ref.name, margin, yPos)
      doc.setTextColor(75, 85, 99)
      doc.setFont('helvetica', 'normal')
      doc.text(' - ' + ref.desc, margin + 45, yPos)
      doc.setTextColor(100, 116, 139)
      doc.text(ref.url, margin, yPos + 4)
      yPos += 10
    })
    yPos += 10

    drawSectionHeader('Applicable Legislation', [75, 85, 99])
    const dpdpLaws = [
      'Digital Personal Data Protection Act, 2023',
      'Digital Personal Data Protection Rules, 2025',
      'Information Technology Act, 2000 (as amended)',
      'IT (Reasonable Security Practices) Rules, 2011',
    ]
    doc.setFontSize(8)
    doc.setTextColor(55, 65, 81)
    dpdpLaws.forEach((law) => {
      checkPageBreak(6)
      doc.text('* ' + law, margin + 3, yPos)
      yPos += 5
    })
    yPos += 10

    // Disclaimer
    checkPageBreak(35)
    doc.setFillColor(254, 243, 199)
    doc.roundedRect(margin, yPos, contentWidth, 35, 3, 3, 'F')
    doc.setTextColor(146, 64, 14)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.text('Important Disclaimer', margin + 5, yPos + 8)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7)
    const disclaimer = 'This report is generated based on your self-assessment responses and is intended for informational purposes only. It does not constitute legal advice. The DPDP Act 2023 and its Rules are subject to amendment. Compliance requirements may vary based on specific circumstances. Penalties up to Rs.250 Crore apply for non-compliance. We strongly recommend consulting with a qualified Data Protection professional for specific guidance. ComplianceCheck assumes no liability for actions taken based on this report.'
    addText(disclaimer, margin + 5, yPos + 14, contentWidth - 10, 3.5)

    // Footer
    const totalPages = doc.getNumberOfPages()
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i)
      doc.setFontSize(7)
      doc.setTextColor(156, 163, 175)
      doc.text('ComplianceCheck | compliancecheck.in | DPDP Gap Assessment', margin, pageHeight - 8)
      doc.text('Page ' + i + ' of ' + totalPages, pageWidth - margin, pageHeight - 8, { align: 'right' })
    }

    return doc.output('blob')
  }

  // ==========================================================================
  // DOWNLOAD HANDLER
  // ==========================================================================

  const handleDownload = async () => {
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
      
      let blob: Blob
      if (assessmentType === ASSESSMENT_TYPES.DPDP) {
        blob = generateDPDPPDF(data)
      } else if (assessmentType === ASSESSMENT_TYPES.LABOUR_CODE) {
        blob = generateLabourCodePDF(data)
      } else {
        blob = generatePDF(data)
      }
      
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      const reportPrefix = assessmentType === ASSESSMENT_TYPES.DPDP ? 'DPDP-Gap-Assessment' : 
                          assessmentType === ASSESSMENT_TYPES.LABOUR_CODE ? 'Labour-Code-Readiness' : 
                          'ComplianceCheck-Report'
      link.download = reportPrefix + '-' + new Date().toISOString().split('T')[0] + '.pdf'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      setDownloadSuccess(true)
      setTimeout(() => setDownloadSuccess(false), 3000)
    } catch (err) {
      console.error('Download error:', err)
      setError('Download failed. Please try again.')
    } finally {
      setIsDownloading(false)
    }
  }

  // ==========================================================================
  // EMAIL HANDLER
  // ==========================================================================

  const handleEmailReport = async () => {
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

      if (!email) {
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
      
      let blob: Blob
      if (assessmentType === ASSESSMENT_TYPES.DPDP) {
        blob = generateDPDPPDF(data)
      } else if (assessmentType === ASSESSMENT_TYPES.LABOUR_CODE) {
        blob = generateLabourCodePDF(data)
      } else {
        blob = generatePDF(data)
      }
      
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
          email,
          assessmentId: id,
          pdfBase64,
          companyName: userDetails.companyName || 'Your Company',
          score: data.overall_score || 0,
          assessmentType,
        }),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to send email')
      }

      setEmailSuccess(true)
      setTimeout(() => setEmailSuccess(false), 5000)
    } catch (err) {
      console.error('Email error:', err)
      setEmailError(err instanceof Error ? err.message : 'Failed to send email. Please try again.')
    } finally {
      setIsEmailing(false)
    }
  }

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
    </div>
  )
}
