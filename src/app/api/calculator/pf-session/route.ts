import { NextRequest, NextResponse } from 'next/server'
import { insertPfSession } from '@/lib/calculators/epf/server'

/**
 * POST — navigator.sendBeacon target used when the PF calculator page is
 * hidden/unloaded (server actions can't run during unload). Same validation,
 * rate limits and storage as the logCalcSession server action.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const ip = request.headers.get('x-nf-client-connection-ip') ?? request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null
    const res = await insertPfSession(body, ip)
    return NextResponse.json(res, { status: res.ok ? 200 : res.reason === 'rate_limited' ? 429 : 400 })
  } catch {
    return NextResponse.json({ ok: false, reason: 'invalid' }, { status: 400 })
  }
}
