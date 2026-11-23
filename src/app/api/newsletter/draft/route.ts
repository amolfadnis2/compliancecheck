/**
 * POST /api/newsletter/draft  (Authorization: Bearer NEWSLETTER_SECRET)
 *
 * Called every Monday by netlify/functions/newsletter-weekly.mts. Builds this
 * week's issue from new blog posts + WHATS_NEW, saves it as a draft, and
 * emails NEWSLETTER_APPROVER_EMAIL a preview with a "Review and send" link.
 * Nothing goes to subscribers until that link is used.
 *
 * Skips quietly when nothing new shipped this week or the week's draft exists.
 */

import crypto from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getAllPosts } from '@/lib/blog/posts'
import { WHATS_NEW } from '@/lib/newsletter/whats-new'
import { buildDigest, istDate, personalise } from '@/lib/newsletter/digest'
import { approveUrl, baseUrl, getResend, newsletterFrom } from '@/lib/newsletter/server'

export const dynamic = 'force-dynamic'

function authorised(request: NextRequest): boolean {
  const secret = process.env.NEWSLETTER_SECRET
  const header = request.headers.get('authorization') ?? ''
  if (!secret || !header.startsWith('Bearer ')) return false
  const given = Buffer.from(header.slice('Bearer '.length))
  const expected = Buffer.from(secret)
  return given.length === expected.length && crypto.timingSafeEqual(given, expected)
}

export async function POST(request: NextRequest) {
  if (!authorised(request)) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  try {
    const approver = process.env.NEWSLETTER_APPROVER_EMAIL
    if (!approver || !process.env.RESEND_API_KEY) {
      return NextResponse.json({ error: 'NEWSLETTER_APPROVER_EMAIL / RESEND_API_KEY not configured' }, { status: 503 })
    }

    const today = istDate()
    const digest = buildDigest({ posts: getAllPosts(), whatsNew: WHATS_NEW, today, baseUrl: baseUrl() })
    if (!digest) return NextResponse.json({ skipped: 'nothing new this week' })

    const supabase = createAdminClient()
    const { data: issue, error: insertError } = await supabase
      .from('newsletter_issues')
      .insert({ week_of: today, subject: digest.subject, html: digest.html, text_body: digest.text })
      .select('id')
      .single()
    if (insertError?.code === '23505') return NextResponse.json({ skipped: 'already drafted this week' })
    if (insertError || !issue) throw insertError ?? new Error('insert returned no row')

    const { count } = await supabase
      .from('newsletter_subscribers')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'active')

    const reviewLink = approveUrl(issue.id as string)
    const banner = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fef3c7;"><tr><td align="center" style="padding:20px 12px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <p style="margin:0 0 6px 0;font-size:15px;font-weight:600;color:#78350f;">This week's newsletter is ready for your approval</p>
  <p style="margin:0 0 14px 0;font-size:13px;color:#92400e;">${digest.launchCount} launch(es), ${digest.postCount} blog post(s). It will go to ${count ?? 0} confirmed subscriber(s). Nothing is sent until you approve.</p>
  <a href="${reviewLink}" style="display:inline-block;background:#15803d;color:#ffffff;padding:12px 20px;border-radius:6px;text-decoration:none;font-weight:600;">Review and send</a>
  <p style="margin:12px 0 0 0;font-size:12px;color:#92400e;">Preview below. The link expires in 7 days.</p>
</td></tr></table>`

    const { error: sendError } = await getResend().emails.send({
      from: newsletterFrom(),
      to: [approver],
      subject: `[Approve] ${digest.subject}`,
      html: personalise(digest.html, '#').replace(/(<body[^>]*>)/, `$1${banner}`),
      text: `This week's newsletter is ready. It will go to ${count ?? 0} confirmed subscriber(s).\nReview and send: ${reviewLink}\n\n${personalise(digest.text, '(unsubscribe link)')}`,
    })
    if (sendError) {
      // Remove the draft so a re-run of this week's job can try again.
      await supabase.from('newsletter_issues').delete().eq('id', issue.id)
      throw new Error(`Resend: ${sendError.message}`)
    }

    return NextResponse.json({ drafted: issue.id, subscribers: count ?? 0 })
  } catch (err) {
    console.error('newsletter/draft failed:', err instanceof Error ? err.message : err)
    return NextResponse.json({ error: 'Draft failed' }, { status: 500 })
  }
}
