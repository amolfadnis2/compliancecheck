import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { ASSESSMENT_TYPES } from '@/lib/constants/assessment-types'
import {
  adaptStatutoryHealth,
  adaptLabourCode,
  adaptDPDP,
  adaptStateWise,
  adaptFoodBusiness,
} from '@/lib/pdf/report-data-adapter'
import { buildReportHtml, getPdfRenderOptions } from '@/lib/pdf/html-report-builder'
import { renderHtmlToPdf } from '@/lib/pdf/html-renderer'
import { STATUTORY_HEALTH_RULES } from '@/lib/assessments/statutory-health-rules'

// Lazy-init Supabase (CLAUDE.md rule 3)
let _supabase: ReturnType<typeof createClient> | null = null
function getSupabase() {
  if (!_supabase) {
    _supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
  }
  return _supabase
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    // Require env vars — return 503 rather than throw at module level
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
    }

    const supabase = getSupabase()

    type AssessmentRow = {
      id: string
      assessment_type: string
      overall_score: number
      category_scores: Record<string, unknown>
      responses: { userDetails?: Record<string, string> } & Record<string, unknown>
      user_details?: Record<string, string>
      userDetails?: Record<string, string>
      users?: { email?: string }
    }
    const { data: row, error } = await supabase
      .from('assessments')
      .select('*')
      .eq('id', id)
      .single() as unknown as { data: AssessmentRow | null; error: unknown }

    if (error || !row) {
      return NextResponse.json({ error: 'Assessment not found' }, { status: 404 })
    }

    // Ownership gate: caller must supply matching email as query param
    const emailParam = request.nextUrl.searchParams.get('email')
    const rowEmail =
      row.responses?.userDetails?.email ||
      row.responses?.userDetails?.contactEmail ||
      row.user_details?.email ||
      row.users?.email

    if (emailParam && rowEmail && emailParam.toLowerCase() !== rowEmail.toLowerCase()) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Flatten row into the shape expected by adapters
    const data = {
      id: row.id,
      assessment_type: row.assessment_type,
      overall_score: row.overall_score,
      category_scores: row.category_scores,
      responses: row.responses,
      userDetails: row.userDetails || row.user_details || row.responses?.userDetails,
    }

    const assessmentType: string = row.assessment_type ?? ASSESSMENT_TYPES.STATUTORY_HEALTH
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
      // statutory_health and fallback
      reportData = adaptStatutoryHealth(data, STATUTORY_HEALTH_RULES)
    }

    const html = buildReportHtml(reportData)
    const pdfBytes = await renderHtmlToPdf(html, getPdfRenderOptions(reportData))

    const filename = `${reportData.config.filenamePrefix}-${new Date().toISOString().split('T')[0]}.pdf`

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return new NextResponse(pdfBytes as any, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'private, no-cache',
      },
    })
  } catch (err) {
    console.error('PDF generation error:', err)
    return NextResponse.json({ error: 'PDF generation failed' }, { status: 500 })
  }
}
