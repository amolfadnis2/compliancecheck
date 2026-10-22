import { NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { verifyAdmin } from '@/lib/admin/verify-admin'
import { EPF_PARAMS_TAG } from '@/lib/calculators/epf/params.server'

/** POST — drop the cached EPF statutory params so the PF calculator re-reads Supabase. */
export async function POST() {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }
  revalidateTag(EPF_PARAMS_TAG)
  return NextResponse.json({ ok: true, revalidatedAt: new Date().toISOString() })
}
