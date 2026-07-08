import { NextRequest, NextResponse } from 'next/server'
import { generatePoshAssessmentPdf } from '@/lib/pdf/server-posh-report'

/**
 * GET /api/report/posh/[id]/pdf?email=<owner email>
 *
 * Server-side gated PDF for POSH (posh_assessments table). Counterpart to
 * /api/report/[id]/pdf for the DB-backed unified assessments — POSH has its
 * own table/shape so it gets its own route rather than sharing that one.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const email = request.nextUrl.searchParams.get('email')

    const result = await generatePoshAssessmentPdf(id, email)

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
    console.error('POSH report PDF generation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
