import { NextRequest, NextResponse } from 'next/server'
import { isValidAssessmentType } from '@/lib/constants/assessment-types'
import { generatePaidReportPdf, getReportOwner } from '@/lib/report/paid-report'
import { verifyReportToken } from '@/lib/report/share-token'

/**
 * GET /api/report/share/<token> — the link sent on WhatsApp and in the report
 * email. Opens the paid PDF for whoever holds an authentic, unexpired token
 * (the owner chose to share it). The entitlement is re-checked on every
 * request, so a token can never unlock an unpaid report.
 */
export async function GET(_request: NextRequest, { params }: { params: { token: string } }) {
  const payload = verifyReportToken(params.token)
  if (!payload || !isValidAssessmentType(payload.type)) {
    return new NextResponse('This report link is invalid or has expired. Open your results page to get a new one.', {
      status: 410,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    })
  }

  try {
    const owner = await getReportOwner(payload.type, payload.id)
    if (!owner?.email) return new NextResponse('Report not found', { status: 404 })

    const result = await generatePaidReportPdf(payload.type, payload.id, owner.email)
    if ('error' in result) {
      const status = result.error === 'payment_required' ? 402 : 404
      return new NextResponse(result.error === 'payment_required' ? 'This report has not been unlocked.' : 'Report not found', { status })
    }

    return new NextResponse(Buffer.from(result.bytes), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${result.filename}"`,
        'Cache-Control': 'private, no-store',
        'X-Robots-Tag': 'noindex',
      },
    })
  } catch (err) {
    console.error('[share] error:', err)
    return new NextResponse('Could not generate the report. Please try again.', { status: 500 })
  }
}
