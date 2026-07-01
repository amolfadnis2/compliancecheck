import { NextRequest, NextResponse } from 'next/server'
import { generateAssessmentPdf } from '@/lib/pdf/server-report'

/**
 * GET /api/report/[id]/pdf?email=<owner email>
 *
 * Server-side PDF for DB-backed unified assessments (Statutory Health, Labour
 * Code, DPDP, State-Wise, Food Business). Mirrors the email-match ownership
 * gate used by /api/assessment/[id]. POSH and local/temp assessments are
 * generated client-side and never hit this route.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const email = request.nextUrl.searchParams.get('email')

    const result = await generateAssessmentPdf(id, email)

    if ('error' in result) {
      if (result.error === 'not_found') {
        return NextResponse.json({ error: 'Assessment not found' }, { status: 404 })
      }
      if (result.error === 'payment_required') {
        return NextResponse.json({ error: 'Payment required to download this report' }, { status: 402 })
      }
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    return new NextResponse(Buffer.from(result.bytes), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${result.filename}"`,
        'Cache-Control': 'private, no-cache',
      },
    })
  } catch (error) {
    console.error('Report PDF generation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
