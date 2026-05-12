import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createAdminClient } from '@/lib/supabase/admin'
import { getPostBySlug } from '@/lib/blog/posts'

let _resend: Resend | null = null

function getResend(): Resend {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY)
  return _resend
}

function buildEmailHtml(params: {
  title: string
  excerpt: string
  slug: string
  coverImage?: string
  unsubscribeToken: string
}): string {
  const { title, excerpt, slug, coverImage, unsubscribeToken } = params
  const articleUrl = `https://compliancecheck.co.in/blog/${slug}`
  const unsubscribeUrl = `https://compliancecheck.co.in/api/newsletter/unsubscribe?token=${unsubscribeToken}`

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #374151; max-width: 600px; margin: 0 auto; padding: 20px;">

  <div style="background: linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 24px;">ComplianceCheck</h1>
    <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 14px;">Simplifying compliance for Indian businesses</p>
  </div>

  <div style="background: #ffffff; padding: 30px; border: 1px solid #E5E7EB; border-top: none;">
    <p style="color: #6B7280; font-size: 13px; margin: 0 0 16px 0; text-transform: uppercase; letter-spacing: 0.05em;">New Article</p>
    <h2 style="color: #1F2937; margin: 0 0 16px 0; font-size: 22px; line-height: 1.3;">${title}</h2>
    ${coverImage ? `<img src="${coverImage}" alt="${title}" style="width: 100%; border-radius: 8px; margin: 0 0 20px 0; display: block;" />` : ''}
    <p style="color: #374151; margin: 0 0 24px 0; font-size: 15px;">${excerpt}</p>
    <div style="text-align: center; margin: 32px 0;">
      <a href="${articleUrl}" style="display: inline-block; background: #1E40AF; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px;">Read article</a>
    </div>
  </div>

  <div style="background: #F9FAFB; padding: 20px; border-radius: 0 0 12px 12px; text-align: center; border: 1px solid #E5E7EB; border-top: none;">
    <p style="color: #9CA3AF; margin: 0; font-size: 12px;">ComplianceCheck | Workplace Safety &amp; Compliance Platform</p>
    <p style="color: #9CA3AF; margin: 10px 0 0 0; font-size: 12px;">
      <a href="https://compliancecheck.co.in/privacy" style="color: #6B7280; text-decoration: none;">Privacy Policy</a>
      &nbsp;|&nbsp;
      <a href="${unsubscribeUrl}" style="color: #6B7280; text-decoration: none;">Unsubscribe</a>
    </p>
  </div>

</body>
</html>`
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Auth: verify broadcast secret
    const secret = request.headers.get('x-broadcast-secret')
    if (!secret || secret !== process.env.NEWSLETTER_BROADCAST_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse + validate body
    let body: { slug?: string }
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const { slug } = body
    if (!slug || typeof slug !== 'string') {
      return NextResponse.json({ error: 'slug is required' }, { status: 400 })
    }

    // Validate post exists and is not a draft
    const post = getPostBySlug(slug)
    if (!post) {
      return NextResponse.json({ error: `Post not found: ${slug}` }, { status: 404 })
    }
    if (post.draft) {
      return NextResponse.json({ error: `Post is a draft: ${slug}` }, { status: 400 })
    }

    // Guard: missing env vars → return 200 with warning (never 500 on missing config)
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({ success: true, sent: 0, skipped: 0, warning: 'RESEND_API_KEY not configured' })
    }

    // Fetch active subscribers
    let supabase
    try {
      supabase = createAdminClient()
    } catch {
      return NextResponse.json({ success: true, sent: 0, skipped: 0, warning: 'Supabase not configured' })
    }

    const { data: subscribers, error: fetchError } = await supabase
      .from('newsletter_subscribers')
      .select('email, unsubscribe_token')
      .not('confirmed_at', 'is', null)
      .is('unsubscribed_at', null)

    if (fetchError) {
      console.error('Failed to fetch subscribers:', fetchError)
      return NextResponse.json({ success: true, sent: 0, skipped: 0, warning: 'Failed to fetch subscribers' })
    }

    const active = subscribers ?? []
    if (active.length === 0) {
      return NextResponse.json({ success: true, sent: 0, skipped: 0 })
    }

    const resend = getResend()
    const BATCH_SIZE = 100
    let sentCount = 0

    for (let i = 0; i < active.length; i += BATCH_SIZE) {
      if (i > 0) await sleep(1000)

      const chunk = active.slice(i, i + BATCH_SIZE)
      const messages = chunk.map((sub) => ({
        from: 'ComplianceCheck <noreply@compliancecheck.co.in>',
        to: sub.email as string,
        subject: `New on ComplianceCheck: ${post.title}`,
        html: buildEmailHtml({
          title: post.title,
          excerpt: post.excerpt,
          slug: post.slug,
          coverImage: post.coverImage,
          unsubscribeToken: sub.unsubscribe_token as string,
        }),
      }))

      const { error: batchError } = await resend.batch.send(messages)
      if (batchError) {
        console.error(`Batch ${i / BATCH_SIZE + 1} failed:`, batchError)
      } else {
        sentCount += chunk.length
      }
    }

    const skippedCount = active.length - sentCount

    // Log the broadcast
    try {
      await supabase.from('newsletter_broadcasts').insert({
        slug: post.slug,
        sent_count: sentCount,
      })
    } catch (logErr) {
      console.error('Failed to log broadcast:', logErr)
    }

    return NextResponse.json({ success: true, sent: sentCount, skipped: skippedCount })
  } catch (err) {
    console.error('Broadcast error:', err)
    return NextResponse.json({ success: false, error: 'Unexpected error' }, { status: 500 })
  }
}
