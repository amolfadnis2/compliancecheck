import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');

  if (!token || !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return new NextResponse(unsubscribeHtml('invalid'), {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }

  try {
    const supabase = getSupabase();
    const { error } = await supabase
      .from('newsletter_subscribers')
      .update({ unsubscribed_at: new Date().toISOString() })
      .eq('unsubscribe_token', token)
      .is('unsubscribed_at', null);

    if (error) {
      return new NextResponse(unsubscribeHtml('error'), {
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      });
    }

    return new NextResponse(unsubscribeHtml('success'), {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  } catch {
    return new NextResponse(unsubscribeHtml('error'), {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }
}

function unsubscribeHtml(state: 'success' | 'error' | 'invalid'): string {
  const messages: Record<string, { title: string; body: string }> = {
    success: {
      title: 'Unsubscribed',
      body: "You&apos;ve been successfully unsubscribed. You won&apos;t receive any more emails from us.",
    },
    error: {
      title: 'Something went wrong',
      body: 'We couldn&apos;t process your unsubscribe request. Please try again or contact us.',
    },
    invalid: {
      title: 'Invalid link',
      body: 'This unsubscribe link is invalid or has already been used.',
    },
  };

  const { title, body } = messages[state];

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${title} | ComplianceCheck</title>
  <style>
    body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#f9fafb;color:#374151}
    .card{background:#fff;border-radius:12px;padding:40px;max-width:400px;text-align:center;box-shadow:0 1px 3px rgba(0,0,0,.1)}
    h1{font-size:24px;margin-bottom:12px}
    p{color:#6B7280;margin-bottom:24px}
    a{display:inline-block;background:#1E40AF;color:#fff;padding:10px 24px;border-radius:8px;text-decoration:none;font-weight:600}
  </style>
</head>
<body>
  <div class="card">
    <h1>${title}</h1>
    <p>${body}</p>
    <a href="https://compliancecheck.co.in/blog">Back to Blog</a>
  </div>
</body>
</html>`;
}
