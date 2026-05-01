import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

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

const MAX_ATTEMPTS = 5

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { email?: string; otp?: string; assessmentId?: string }
    const { email, otp, assessmentId } = body

    if (!email || !otp || !assessmentId) {
      return NextResponse.json({ success: false, error: 'email, otp and assessmentId are required' }, { status: 400 })
    }

    if (!/^\d{6}$/.test(otp)) {
      return NextResponse.json({ success: false, error: 'Invalid OTP format' }, { status: 400 })
    }

    const emailLower = email.toLowerCase().trim()
    const supabase = getSupabase()

    // Find the most recent valid OTP for this email+assessment
    const { data: otpRecords, error: fetchErr } = await supabase
      .from('otp_attempts')
      .select('*')
      .eq('email', emailLower)
      .eq('assessment_id', assessmentId)
      .eq('action', 'request')
      .eq('used', false)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)

    if (fetchErr) {
      console.error('OTP fetch error:', fetchErr)
      return NextResponse.json({ success: false, error: 'Failed to verify OTP' }, { status: 500 })
    }

    if (!otpRecords || otpRecords.length === 0) {
      return NextResponse.json({ success: false, error: 'OTP expired or not found. Please request a new code.' }, { status: 400 })
    }

    const record = otpRecords[0] as {
      id: string; otp_hash: string; attempt_count: number; expires_at: string
    }

    // Check attempt count
    if ((record.attempt_count ?? 0) >= MAX_ATTEMPTS) {
      await supabase.from('otp_attempts').update({ used: true }).eq('id', record.id)
      return NextResponse.json({ success: false, error: 'Too many failed attempts. Please request a new code.' }, { status: 400 })
    }

    // Compare OTP (simplified — in production use bcrypt.compare)
    if (record.otp_hash !== otp) {
      await supabase
        .from('otp_attempts')
        .update({ attempt_count: (record.attempt_count ?? 0) + 1 })
        .eq('id', record.id)

      const remaining = MAX_ATTEMPTS - (record.attempt_count ?? 0) - 1
      return NextResponse.json({
        success: false,
        error: remaining > 0
          ? `Incorrect code. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`
          : 'Incorrect code. Please request a new one.',
      }, { status: 400 })
    }

    // Mark OTP as used
    await supabase.from('otp_attempts').update({ used: true }).eq('id', record.id)

    // Mark assessment email_verified = true
    const { error: updateErr } = await supabase
      .from('auto_dealer_assessments')
      .update({ email_verified: true })
      .eq('id', assessmentId)
      .eq('user_email', emailLower)

    if (updateErr) {
      console.error('Assessment update error:', updateErr)
      // Non-fatal — verification still succeeded
    }

    // Log verification attempt
    await supabase.from('otp_attempts').insert({
      email: emailLower,
      assessment_id: assessmentId,
      otp_hash: '',
      action: 'verify',
      ip_address: request.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown',
      expires_at: new Date(Date.now() + 3600000).toISOString(),
      used: true,
      attempt_count: 0,
    })

    return NextResponse.json({ success: true, emailVerified: true })
  } catch (err) {
    console.error('OTP verify error:', err)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
