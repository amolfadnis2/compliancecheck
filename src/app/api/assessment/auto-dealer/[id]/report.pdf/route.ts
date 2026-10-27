import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

import type { PTSlab, StateAndE, GSTRate, GapItem } from '@/types/auto-dealer'
import {
  computeAutoDealerResults,
  generateAutoDealerPdfForRow,
  type AutoDealerRow,
} from '@/lib/pdf/auto-dealer-report'
import { ASSESSMENT_TYPES, isPaymentLive } from '@/lib/constants/assessment-types'
import { getEntitlement } from '@/lib/payment/entitlement'
import { getPeerAverages } from '@/lib/benchmarks/peer-averages'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _supabase: any = null
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getSupabase(): any {
  if (!_supabase) {
    _supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
  }
  return _supabase
}

function teaserGap(gap: GapItem): GapItem {
  return {
    ...gap,
    finding: '',
    recommendation: '',
    penaltyExposure: '',
    source: '',
  }
}

// --------------------------------------------------------------------------
// Route handler
// --------------------------------------------------------------------------

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const assessmentId = params.id
  const acceptJson = request.headers.get('accept')?.includes('application/json')

  try {
    const supabase = getSupabase()

    const { data: row, error: fetchErr } = await supabase
      .from('auto_dealer_assessments')
      .select('*')
      .eq('id', assessmentId)
      .single()

    if (fetchErr || !row) {
      return NextResponse.json({ error: 'Assessment not found' }, { status: 404 })
    }

    const a = row as AutoDealerRow

    const {
      responses, profile, phaseScores, overallScore, gapAnalysis,
      applicabilityChecks, priceTier: tier, totalQuestions,
    } = computeAutoDealerResults(a)

    // Unified entitlement gate — auto-dealer converged onto assessment_entitlements
    // (framework O-2). When payment is live, the shared entitlement is the source
    // of truth for paid/waived; at live:false we fall back to the legacy inline
    // payment_status column so the current "free in beta" behaviour is unchanged.
    const autoDealerPaid = isPaymentLive(ASSESSMENT_TYPES.AUTO_DEALER)
      ? (await getEntitlement(assessmentId, ASSESSMENT_TYPES.AUTO_DEALER)) !== 'none'
      : a.payment_status === 'paid'

    // Fetch state reference data for verified + paid users
    let ptSlabs: PTSlab[] = []
    let sandE: StateAndE[] = []
    let gstRates: GSTRate[] = []

    if (a.email_verified && autoDealerPaid) {
      const [ptResult, sandEResult, gstResult] = await Promise.all([
        supabase.from('state_pt_slabs').select('*').in('state_code', profile.statesOfOperation),
        supabase.from('state_s_and_e').select('*').in('state_code', profile.statesOfOperation),
        supabase.from('gst_rates_by_hsn').select('*').order('hsn'),
      ])
      if (ptResult.data) ptSlabs = ptResult.data as PTSlab[]
      if (sandEResult.data) sandE = sandEResult.data as StateAndE[]
      if (gstResult.data) gstRates = gstResult.data as GSTRate[]
    }

    // Require email verification for both JSON and PDF responses
    if (!a.email_verified) {
      return NextResponse.json({ error: 'Email verification required' }, { status: 403 })
    }

    // JSON response for the results page metadata fetch
    if (acceptJson) {
      return NextResponse.json({
        email: a.user_email,
        phone: a.phone,
        companyName: a.company_name,
        fullName: a.full_name,
        labourRegime: a.labour_regime,
        responses,
        phaseScores,
        overallScore,
        // Findings, recommendations, penalties and citations are the paid
        // report: before payment only the headline, severity and phase of each
        // gap leave the server (enough for the summary teaser).
        gapAnalysis: autoDealerPaid ? gapAnalysis : gapAnalysis.map(teaserGap),
        applicabilityChecks,
        profile,
        ptSlabs,
        sandE,
        gstRates,
        emailVerified: a.email_verified,
        paymentStatus: autoDealerPaid ? 'paid' : a.payment_status,
        priceTier: tier,
        totalQuestions,
      })
    }

    // Binary PDF is the paid deliverable: when payment is live, require a
    // paid/waived entitlement. Skipped at live:false (free in beta).
    if (isPaymentLive(ASSESSMENT_TYPES.AUTO_DEALER) && !autoDealerPaid) {
      return NextResponse.json({ error: 'Payment required to download this report' }, { status: 402 })
    }

    const peers = await getPeerAverages(ASSESSMENT_TYPES.AUTO_DEALER, { excludeId: assessmentId })
    const pdfData = generateAutoDealerPdfForRow(a, peers?.categories)

    // Mark PDF generated
    await supabase
      .from('auto_dealer_assessments')
      .update({ pdf_generated_at: new Date().toISOString() })
      .eq('id', assessmentId)

    return new NextResponse(Buffer.from(pdfData), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="compliance-report-${assessmentId.slice(0, 8)}.pdf"`,
        'Cache-Control': 'private, no-cache',
      },
    })
  } catch (err) {
    console.error('Report route error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
