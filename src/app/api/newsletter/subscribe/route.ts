import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

const schema = z.object({
  email: z.string().email(),
  source: z.string().optional().default('unknown'),
});

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60 * 60 * 1000 });
    return false;
  }
  if (entry.count >= 5) return true;
  entry.count++;
  return false;
}

let _resend: Resend | null = null;
function getResend(): Resend {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY);
  return _resend;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _supabase: any = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getSupabase(): any {
  if (!_supabase) {
    _supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }
  return _supabase;
}

interface SubscriberRow {
  id: string;
  confirmed_at: string | null;
  confirmation_token: string;
  unsubscribed_at: string | null;
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ?? 'unknown';

  if (isRateLimited(ip)) {
    return NextResponse.json({ success: true }, { status: 200 });
  }

  const body = await request.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: 'Invalid email' }, { status: 400 });
  }

  const { email, source } = parsed.data;

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ success: true });
  }

  try {
    const supabase = getSupabase();
    const { data: existing } = await supabase
      .from('newsletter_subscribers')
      .select('id, confirmed_at, confirmation_token, unsubscribed_at')
      .eq('email', email)
      .single() as { data: SubscriberRow | null; error: unknown };

    let confirmationToken: string;

    if (existing) {
      if (existing.unsubscribed_at) {
        await supabase
          .from('newsletter_subscribers')
          .update({ unsubscribed_at: null, confirmed_at: null })
          .eq('id', existing.id);
      }
      if (existing.confirmed_at && !existing.unsubscribed_at) {
        return NextResponse.json({ success: true });
      }
      confirmationToken = existing.confirmation_token;
    } else {
      const { data: inserted, error } = await supabase
        .from('newsletter_subscribers')
        .insert({ email, source })
        .select('confirmation_token')
        .single() as { data: { confirmation_token: string } | null; error: unknown };
      if (error) {
        return NextResponse.json({ success: true });
      }
      confirmationToken = inserted?.confirmation_token ?? '';
    }

    if (process.env.RESEND_API_KEY && confirmationToken) {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://compliancecheck.co.in';
      const confirmUrl = `${siteUrl}/api/newsletter/confirm?token=${confirmationToken}`;
      await getResend().emails.send({
        from: 'ComplianceCheck <noreply@compliancecheck.co.in>',
        to: email,
        subject: 'Confirm your ComplianceCheck subscription',
        html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;line-height:1.6;color:#374151;max-width:600px;margin:0 auto;padding:20px">
  <div style="background:linear-gradient(135deg,#1E40AF,#3B82F6);padding:30px;border-radius:12px 12px 0 0;text-align:center">
    <h1 style="color:white;margin:0;font-size:22px">ComplianceCheck</h1>
    <p style="color:rgba(255,255,255,.9);margin:8px 0 0;font-size:13px">Indian Compliance Insights</p>
  </div>
  <div style="background:#fff;padding:30px;border:1px solid #E5E7EB;border-top:none;border-radius:0 0 12px 12px">
    <h2 style="color:#1F2937;margin-top:0">Confirm your subscription</h2>
    <p>Thanks for signing up! Click the button below to confirm your email address.</p>
    <div style="text-align:center;margin:30px 0">
      <a href="${confirmUrl}" style="display:inline-block;background:#1E40AF;color:white;padding:12px 30px;border-radius:8px;text-decoration:none;font-weight:600">Confirm subscription</a>
    </div>
    <p style="color:#6B7280;font-size:13px">If you didn&apos;t sign up, you can safely ignore this email.</p>
  </div>
  <p style="color:#9CA3AF;font-size:11px;text-align:center;margin-top:16px">
    <a href="https://compliancecheck.co.in/privacy" style="color:#6B7280;text-decoration:none">Privacy Policy</a>
  </p>
</body>
</html>`,
      }).catch((err: unknown) => console.error('Resend error:', err));
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Newsletter subscribe error:', err);
    return NextResponse.json({ success: true });
  }
}
