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
    return NextResponse.redirect(new URL('/blog?subscribed=invalid', request.url));
  }

  try {
    const supabase = getSupabase();
    const { error } = await supabase
      .from('newsletter_subscribers')
      .update({ confirmed_at: new Date().toISOString() })
      .eq('confirmation_token', token)
      .is('confirmed_at', null);

    if (error) {
      return NextResponse.redirect(new URL('/blog?subscribed=invalid', request.url));
    }

    return NextResponse.redirect(new URL('/blog?subscribed=confirmed', request.url));
  } catch {
    return NextResponse.redirect(new URL('/blog?subscribed=invalid', request.url));
  }
}
