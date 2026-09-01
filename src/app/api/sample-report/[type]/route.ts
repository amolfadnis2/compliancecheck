import { NextResponse } from 'next/server'
import { generateUnifiedReportBytes } from '@/lib/pdf/unified-report-generator'
import { buildSampleReport } from '@/lib/pdf/sample-report-fixtures'
import { SAMPLE_REPORT_SLUGS } from '@/lib/pdf/sample-report-paths'

/**
 * GET /api/sample-report/[type]
 *
 * Public, ungated sample report for a paid assessment — the "see exactly what
 * you get" asset linked from landing pages and the payment gate.
 *
 * Generated on demand from the same generator, adapters and compliance rules as
 * a real paid report (see sample-report-fixtures.ts), so the sample can never
 * drift from the product. The data is a fictional company and the cover carries
 * a SAMPLE banner — no real assessment is ever served here, so there is nothing
 * to gate.
 *
 * Rendered inline so it opens in the browser's PDF viewer rather than
 * downloading: a buyer evaluating the report should not have to open a file.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ type: string }> }
) {
  try {
    const { type } = await params
    const assessmentType = SAMPLE_REPORT_SLUGS[type]

    if (!assessmentType) {
      return NextResponse.json({ error: 'No sample report for this assessment' }, { status: 404 })
    }

    const reportData = buildSampleReport(assessmentType)
    if (!reportData) {
      return NextResponse.json({ error: 'No sample report for this assessment' }, { status: 404 })
    }

    const bytes = generateUnifiedReportBytes(reportData)

    return new NextResponse(Buffer.from(bytes), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${reportData.config.filenamePrefix}-SAMPLE.pdf"`,
        // Public and identical for everyone — safe to cache hard.
        'Cache-Control': 'public, max-age=3600, s-maxage=86400',
      },
    })
  } catch (error) {
    console.error('Sample report generation error:', error)
    return NextResponse.json({ error: 'Failed to generate sample report' }, { status: 500 })
  }
}
