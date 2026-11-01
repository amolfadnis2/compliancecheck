/**
 * POST /api/partner/logo — upload a partner (report preparer) logo.
 *
 * Partner mode only (7 paid assessments). Accepts one PNG or JPEG of at most
 * 300 KB as multipart field `file`, checks the magic bytes (not just the
 * declared type), stores it in the public `report-logos` bucket under a random
 * name and returns its public URL. The URL is what the browser later sends as
 * `preparedBy.logoUrl`; the PDF generators fetch it back as a data URL.
 *
 * Service role only (the bucket has no anon write policy). Rate-limited by IP.
 */

import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { createAdminClient } from '@/lib/supabase/admin'
import { checkRateLimit } from '@/lib/rate-limit'

const MAX_LOGO_BYTES = 300 * 1024
const BUCKET = 'report-logos'

function sniff(bytes: Uint8Array): 'png' | 'jpg' | null {
  if (bytes.length > 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return 'png'
  if (bytes.length > 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'jpg'
  return null
}

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'
    if (!checkRateLimit(`partner-logo:${ip}`, 10, 60 * 60_000)) {
      return NextResponse.json({ error: 'Too many uploads. Try again later.' }, { status: 429 })
    }

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: 'Logo upload is unavailable right now' }, { status: 503 })
    }

    const form = await request.formData()
    const file = form.get('file')
    if (!(file instanceof Blob)) {
      return NextResponse.json({ error: 'No file received' }, { status: 400 })
    }
    if (file.size > MAX_LOGO_BYTES) {
      return NextResponse.json({ error: 'Logo must be 300 KB or smaller' }, { status: 413 })
    }

    const bytes = new Uint8Array(await file.arrayBuffer())
    const kind = sniff(bytes)
    if (!kind) {
      return NextResponse.json({ error: 'Logo must be a PNG or JPG image' }, { status: 415 })
    }

    const path = `${randomUUID()}.${kind}`
    const supabase = createAdminClient()
    const { error } = await supabase.storage.from(BUCKET).upload(path, bytes, {
      contentType: kind === 'png' ? 'image/png' : 'image/jpeg',
      cacheControl: '31536000',
      upsert: false,
    })
    if (error) {
      console.error('[partner/logo] upload failed:', error.message)
      return NextResponse.json({ error: 'Upload failed. Please try again.' }, { status: 500 })
    }

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
    return NextResponse.json({ url: data.publicUrl, sizeKb: Math.round(file.size / 1024), fileType: kind })
  } catch (err) {
    console.error('[partner/logo] error:', err)
    return NextResponse.json({ error: 'Upload failed. Please try again.' }, { status: 500 })
  }
}
