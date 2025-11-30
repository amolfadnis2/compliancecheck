import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { renderToBuffer } from '@react-pdf/renderer'
import { ComplianceReport } from '@/lib/pdf/report-template'
import { STATUTORY_HEALTH_QUESTIONS, CATEGORY_INFO } from '@/lib/assessments/statutory-health-questions'
import { 
  LABOUR_CODE_CATEGORIES, 
  calculateLabourCodeScore, 
  generateLabourCodeActionItems, 
  getComplianceStatus 
} from '@/lib/assessments/labour-code-questions'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params

    // Handle temporary IDs with demo data
    if (id.startsWith('temp_')) {
      return generateDemoPDF()
    }

    // Fetch from Supabase
    if (!supabaseUrl || !supabaseServiceKey) {
      return generateDemoPDF()
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const { data: assessment, error } = await supabase
      .from('assessments')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !assessment) {
      return NextResponse.json({ error: 'Assessment not found' }, { status: 404 })
    }

    // Generate PDF based on assessment type
    const pdfBuffer = await generatePDFFromAssessment(assessment)

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="compliance-report-${id}.pdf"`,
      },
    })
  } catch (error) {
    console.error('PDF generation error:', error)
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 })
  }
}


async function generatePDFFromAssessment(assessment: Record<string, unknown>) {
  const isLabourCode = assessment.assessment_type === 'labour_code'
  const responses = (assessment.responses as { userDetails?: Record<string, string>; answers?: Record<string, string> }) || {}
  const userDetails = responses.userDetails || {}
  const answers = responses.answers || {}

  let reportData

  if (isLabourCode) {
    const scores = calculateLabourCodeScore(answers)
    const status = getComplianceStatus(scores.overallScore)
    const actionItems = generateLabourCodeActionItems(answers)

    reportData = {
      assessmentType: 'labour_code' as const,
      companyName: userDetails.companyName || userDetails.company_name || 'Company',
      industry: userDetails.industry,
      employeeCount: userDetails.employeeCount || userDetails.employee_count,
      state: userDetails.state,
      overallScore: scores.overallScore,
      status: status.status,
      categoryScores: LABOUR_CODE_CATEGORIES.map(cat => ({
        name: cat.name,
        score: scores.categoryScores[cat.id] || 0,
      })),
      actionItems: actionItems.map(item => ({
        priority: item.priority,
        text: item.text,
        category: item.category.replace(/_/g, ' '),
      })),
      generatedAt: new Date().toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
    }
  } else {
    // Statutory Health
    const categoryScores = calculateStatutoryCategoryScores(answers)
    const overallScore = Math.round(
      Object.values(categoryScores).reduce((sum, cat) => sum + cat.percentage, 0) /
      Object.keys(categoryScores).length
    )
    const status = overallScore >= 70 ? 'Compliant' : overallScore >= 40 ? 'Needs Attention' : 'Non-Compliant'
    const actionItems = generateStatutoryActionItems(answers)

    reportData = {
      assessmentType: 'statutory_health' as const,
      companyName: userDetails.companyName || 'Company',
      industry: userDetails.industry,
      employeeCount: userDetails.employeeCount,
      state: userDetails.state,
      overallScore,
      status,
      categoryScores: Object.entries(categoryScores).map(([key, data]) => ({
        name: CATEGORY_INFO[key as keyof typeof CATEGORY_INFO]?.name || key,
        score: data.percentage,
      })),
      actionItems,
      generatedAt: new Date().toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
    }
  }

  const pdfBuffer = await renderToBuffer(<ComplianceReport data={reportData} />)
  return Buffer.from(pdfBuffer)
}


function calculateStatutoryCategoryScores(answers: Record<string, string>) {
  const scores: Record<string, { score: number; max: number; percentage: number }> = {}

  Object.keys(CATEGORY_INFO).forEach(cat => {
    const categoryQuestions = STATUTORY_HEALTH_QUESTIONS.filter(q => q.category === cat)
    let score = 0
    let max = 0

    categoryQuestions.forEach(q => {
      max += q.weight
      const answer = answers[q.id]
      if (q.complianceAnswer && answer === q.complianceAnswer) {
        score += q.weight
      } else if (!q.complianceAnswer) {
        score += q.weight * 0.5
      }
    })

    scores[cat] = {
      score,
      max,
      percentage: max > 0 ? Math.round((score / max) * 100) : 0,
    }
  })

  return scores
}

function generateStatutoryActionItems(answers: Record<string, string>) {
  const items: { priority: 'high' | 'medium' | 'low'; text: string; category: string }[] = []
  
  const actionMap: Record<string, string> = {
    'pf_1': 'Register with EPFO if your establishment has 20+ employees',
    'pf_2': 'Set up automated PF payment by 15th of each month',
    'esi_1': 'Register with ESIC if you have 10+ employees',
    'esi_2': 'Ensure ESI contributions are deposited by 15th of each month',
    'pt_2': 'Obtain Professional Tax Registration Certificate',
    'pt_3': 'Implement monthly PT deduction and deposit process',
    'gratuity_1': 'Maintain gratuity liability records for employees with 4+ years service',
    'gratuity_2': 'Consider LIC group gratuity scheme or create book reserves',
    'bonus_1': 'Calculate and pay statutory bonus (min 8.33%) to eligible employees',
    'bonus_2': 'Maintain bonus registers and pay bonus by November 30th',
  }

  STATUTORY_HEALTH_QUESTIONS.forEach(q => {
    const answer = answers[q.id]
    if (q.complianceAnswer && answer !== q.complianceAnswer) {
      const priority = q.weight >= 10 ? 'high' : q.weight >= 6 ? 'medium' : 'low'
      items.push({
        priority,
        text: actionMap[q.id] || `Review compliance for: ${q.id}`,
        category: CATEGORY_INFO[q.category as keyof typeof CATEGORY_INFO]?.name || q.category,
      })
    }
  })

  return items.sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 }
    return order[a.priority] - order[b.priority]
  })
}

async function generateDemoPDF() {
  const demoData = {
    assessmentType: 'statutory_health' as const,
    companyName: 'Demo Company',
    industry: 'Information Technology',
    employeeCount: '11-50',
    state: 'Maharashtra',
    overallScore: 65,
    status: 'Needs Attention',
    categoryScores: [
      { name: 'Provident Fund', score: 80 },
      { name: 'ESI', score: 60 },
      { name: 'Professional Tax', score: 70 },
      { name: 'Gratuity', score: 50 },
      { name: 'Bonus', score: 65 },
    ],
    actionItems: [
      { priority: 'high' as const, text: 'Review PF compliance status', category: 'Provident Fund' },
      { priority: 'medium' as const, text: 'Update ESI registration', category: 'ESI' },
    ],
    generatedAt: new Date().toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }),
  }

  const pdfBuffer = await renderToBuffer(<ComplianceReport data={demoData} />)
  
  return new NextResponse(Buffer.from(pdfBuffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="demo-compliance-report.pdf"',
    },
  })
}
