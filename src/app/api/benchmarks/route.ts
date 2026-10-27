import { NextRequest, NextResponse } from 'next/server'
import { isValidAssessmentType } from '@/lib/constants/assessment-types'
import { getPeerAverages } from '@/lib/benchmarks/peer-averages'

/**
 * GET /api/benchmarks?type=<assessment_type>&id=<assessment id>[&industry=<industry>]
 *
 * Peer averages for the summary page of client-rendered results (POSH, Auto
 * Dealer). Returns only aggregates over at least MIN_PEERS other assessments —
 * never any individual row — or `{ peers: null }` when there are too few.
 */
export async function GET(request: NextRequest) {
  const type = request.nextUrl.searchParams.get('type') ?? ''
  if (!isValidAssessmentType(type)) {
    return NextResponse.json({ error: 'Invalid assessment type' }, { status: 400 })
  }
  const peers = await getPeerAverages(type, {
    excludeId: request.nextUrl.searchParams.get('id') ?? undefined,
    industry: request.nextUrl.searchParams.get('industry'),
  })
  return NextResponse.json(
    { peers },
    { headers: { 'Cache-Control': 'public, max-age=600, stale-while-revalidate=3000' } }
  )
}
