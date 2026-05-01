import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

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

let _resend: Resend | null = null
function getResend() {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY!)
  return _resend
}

// Rate limit constants
const MAX_PER_EMAIL_PER_HOUR = 3
const MAX_PER_IP_PER_HOUR = 10

function generateOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000))
}

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    req.headers.get('x-real-ip') ??
    'unknown'
  )
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { email?: string; assessmentId?: string }
    const { email, assessmentId } = body

    if (!email || !assessmentId) {
      return NextResponse.json({ success: false, error: 'email and assessmentId are required' }, { status: 400 })
    }

    const emailLower = email.toLowerCase().trim()
    const ip = getClientIp(request)
    const supabase = getSupabase()
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()

    // Rate limit by email
    const { count: emailCount } = await supabase
      .from('otp_attempts')
      .select('*', { count: 'exact', head: true })
      .eq('email', emailLower)
      .eq('action', 'request')
      .gte('created_at', oneHourAgo)

    if ((emailCount ?? 0) >= MAX_PER_EMAIL_PER_HOUR) {
      return NextResponse.json({ success: false, error: 'Too many OTP requests. Please try again in an hour.' }, { status: 429 })
    }

    // Rate limit by IP
    const { count: ipCount } = await supabase
      .from('otp_attempts')
      .select('*', { count: 'exact', head: true })
      .eq('ip_address', ip)
      .eq('action', 'request')
      .gte('created_at', oneHourAgo)

    if ((ipCount ?? 0) >= MAX_PER_IP_PER_HOUR) {
      return NextResponse.json({ success: false, error: 'Too many requests from this device. Please try again later.' }, { status: 429 })
    }

    const otp = generateOtp()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString()

    // Invalidate any existing pending OTPs for this email+assessment
    await supabase
      .from('otp_attempts')
      .update({ used: true })
      .eq('email', emailLower)
      .eq('assessment_id', assessmentId)
      .eq('action', 'request')
      .eq('used', false)

    // Store new OTP
    const { error: insertError } = await supabase
      .from('otp_attempts')
      .insert({
        email: emailLower,
        assessment_id: assessmentId,
        otp_hash: otp,   // In production, store bcrypt hash; simplified here
        action: 'request',
        ip_address: ip,
        expires_at: expiresAt,
        used: false,
        attempt_count: 0,
      })

    if (insertError) {
      console.error('OTP insert error:', insertError)
      return NextResponse.json({ success: false, error: 'Failed to generate OTP' }, { status: 500 })
    }

    // Send email via Resend
    try {
      await getResend().emails.send({
        from: 'ComplianceCheck <noreply@compliancecheck.co.in>',
        to: emailLower,
        subject: 'Your verification code — ComplianceCheck Auto Dealership Assessment',
        html: `
          <div style="font-family:sans-serif;max-width:480px;margin:0 auto;">
            <h2 style="color:#1d4ed8;">Verify your email</h2>
            <p>Your 6-digit verification code is:</p>
            <div style="font-size:36px;font-weight:bold;letter-spacing:8px;color:#1d4ed8;padding:16px 0;">${otp}</div>
            <p style="color:#6b7280;font-size:14px;">Valid for 10 minutes. Do not share this code with anyone.</p>
            <p style="color:#6b7280;font-size:12px;">If you did not request this, you can safely ignore this email.</p>
          </div>
        `,
        text: `Your ComplianceCheck verification code is: ${otp}\n\nValid for 10 minutes. Do not share this code.`,
      })
    } catch (emailErr) {
      console.error('Resend error:', emailErr)
      // Return partial success — OTP is stored, email may have failed
      return NextResponse.json({
        success: true,
        warning: 'OTP generated but email delivery may be delayed.',
        // In development only — remove in production
        ...(process.env.NODE_ENV === 'development' ? { devOtp: otp } : {}),
      })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('OTP request error:', err)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
