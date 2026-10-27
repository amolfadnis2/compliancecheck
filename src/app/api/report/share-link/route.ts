import { NextRequest, NextResponse } from 'next/server'
import { isPaymentLive, isValidAssessmentType } from '@/lib/constants/assessment-types'
import { getEntitlement, getEntitlementContact } from '@/lib/payment/entitlement'
import { getReportOwner } from '@/lib/report/paid-report'
import { reportShareUrl, signReportToken, REPORT_SHARE_TTL_MS } from '@/lib/report/share-token'
import { normalizeIndianMobile } from '@/lib/identity/phone'

/**
 * POST /api/report/share-link  { assessmentId, assessmentType, email }
 *
 * Issues a signed 30-day link to the paid PDF for the "Send on WhatsApp"
 * button. Only the owner gets one: `email` must match the assessment's stored
 * email, and the report must be paid or waived. Also returns the owner's
 * WhatsApp number (checkout first, then Step 0) to prefill the wa.me link.
 */
export async function POST(request: NextRequest) {
  try {
    const { assessmentId, assessmentType, email } = await request.json()
    if (!assessmentId || !email || !isValidAssessmentType(assessmentType)) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const owner = await getReportOwner(assessmentType, assessmentId)
    if (!owner) return NextResponse.json({ error: 'not_found' }, { status: 404 })
    if (!owner.email || owner.email.trim().toLowerCase() !== String(email).trim().toLowerCase()) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 403 })
    }
    if (isPaymentLive(assessmentType) && (await getEntitlement(assessmentId, assessmentType)) === 'none') {
      return NextResponse.json({ error: 'payment_required' }, { status: 402 })
    }

    const contact = await getEntitlementContact(assessmentId, assessmentType)
    const token = signReportToken({ id: assessmentId, type: assessmentType })
    return NextResponse.json({
      url: reportShareUrl(token, request.nextUrl.origin),
      phone: normalizeIndianMobile(contact?.phone) ?? normalizeIndianMobile(owner.phone),
      expiresAt: new Date(Date.now() + REPORT_SHARE_TTL_MS).toISOString(),
    })
  } catch (err) {
    console.error('[share-link] error:', err)
    return NextResponse.json({ error: 'Could not create a share link' }, { status: 500 })
  }
}
