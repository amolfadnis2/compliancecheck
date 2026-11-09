/**
 * POST /api/newsletter/send  { token, action: 'send' | 'discard' }
 *
 * Driven by the buttons on /newsletter/approve (the approval link emailed to
 * NEWSLETTER_APPROVER_EMAIL). 'send' delivers the issue to the next batch of
 * up to BATCH_SIZE active subscribers and returns { done, sentCount }; the page
 * calls again until done. Keeping each call to one Resend batch keeps it well
 * inside the serverless timeout, and if the page is closed mid-way, opening
 * the approval link again resumes where it stopped.
 *
 * No double sends: the batch is keyed by (issue, cursor) as a Resend
 * idempotency key, and the cursor only advances if nobody else moved it.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyNewsletterToken } from '@/lib/newsletter/token'
import { personalise } from '@/lib/newsletter/digest'
import { getResend, newsletterFrom, oneClickUnsubscribeUrl, unsubscribePageUrl } from '@/lib/newsletter/server'

export const dynamic = 'force-dynamic'

/** Resend's batch endpoint accepts at most 100 emails per call. */
const BATCH_SIZE = 100

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const issueId = typeof body.token === 'string' ? verifyNewsletterToken(body.token, 'approve') : null
    if (!issueId) return NextResponse.json({ error: 'This approval link is invalid or has expired.' }, { status: 400 })
    const action = body.action === 'discard' ? 'discard' : 'send'

    const supabase = createAdminClient()
    const { data: issue, error: readError } = await supabase
      .from('newsletter_issues')
      .select('id, subject, html, text_body, status, send_cursor, sent_count')
      .eq('id', issueId)
      .maybeSingle()
    if (readError) throw readError
    if (!issue) return NextResponse.json({ error: 'Issue not found.' }, { status: 404 })

    if (issue.status === 'sent') return NextResponse.json({ done: true, sentCount: issue.sent_count })
    if (issue.status === 'discarded') return NextResponse.json({ error: 'This issue was discarded.' }, { status: 409 })

    if (action === 'discard') {
      if (issue.status !== 'draft') {
        return NextResponse.json({ error: 'Sending has already started; it cannot be discarded.' }, { status: 409 })
      }
      await supabase.from('newsletter_issues').update({ status: 'discarded' }).eq('id', issueId).eq('status', 'draft')
      return NextResponse.json({ discarded: true })
    }

    if (issue.status === 'draft') {
      await supabase
        .from('newsletter_issues')
        .update({ status: 'sending', approved_at: new Date().toISOString() })
        .eq('id', issueId)
        .eq('status', 'draft')
    }

    const cursor = Number(issue.send_cursor)
    const { data: recipients, error: listError } = await supabase
      .from('newsletter_subscribers')
      .select('id, email')
      .eq('status', 'active')
      .gt('id', cursor)
      .order('id', { ascending: true })
      .limit(BATCH_SIZE)
    if (listError) throw listError

    if (!recipients || recipients.length === 0) {
      await supabase
        .from('newsletter_issues')
        .update({ status: 'sent', sent_at: new Date().toISOString() })
        .eq('id', issueId)
      return NextResponse.json({ done: true, sentCount: issue.sent_count })
    }

    const from = newsletterFrom()
    const emails = recipients.map((r) => {
      const id = r.id as number
      const pageUrl = unsubscribePageUrl(id)
      return {
        from,
        to: [r.email as string],
        subject: issue.subject as string,
        html: personalise(issue.html as string, pageUrl),
        text: personalise(issue.text_body as string, pageUrl),
        headers: {
          'List-Unsubscribe': `<${oneClickUnsubscribeUrl(id)}>`,
          'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
        },
      }
    })

    const { error: sendError } = await getResend().batch.send(emails, {
      idempotencyKey: `newsletter-${issueId}-${cursor}`,
    })
    if (sendError) throw new Error(`Resend: ${sendError.message}`)

    const nextCursor = recipients[recipients.length - 1].id as number
    const sentCount = (issue.sent_count as number) + recipients.length
    await supabase
      .from('newsletter_issues')
      .update({ send_cursor: nextCursor, sent_count: sentCount })
      .eq('id', issueId)
      .eq('send_cursor', cursor)

    return NextResponse.json({ done: false, sentCount })
  } catch (err) {
    console.error('newsletter/send failed:', err instanceof Error ? err.message : err)
    return NextResponse.json({ error: 'Sending failed. Open the approval link again to resume.' }, { status: 500 })
  }
}
