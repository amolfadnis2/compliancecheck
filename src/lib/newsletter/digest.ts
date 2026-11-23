/**
 * Builds the weekly newsletter email from new blog posts and WHATS_NEW
 * launches. Pure functions (no I/O) so they can be unit-tested.
 *
 * The HTML/text contain UNSUBSCRIBE_PLACEHOLDER; it is replaced per recipient
 * at send time with that recipient's own unsubscribe link.
 */

import type { WhatsNewItem, WhatsNewKind } from './whats-new'

export const UNSUBSCRIBE_PLACEHOLDER = '{{UNSUBSCRIBE_URL}}'

export interface DigestPost {
  slug: string
  title: string
  description: string
  date: string
}

export interface Digest {
  subject: string
  html: string
  text: string
  postCount: number
  launchCount: number
}

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000

/** Today's date in India as 'YYYY-MM-DD'. */
export function istDate(now: number = Date.now()): string {
  return new Date(now + IST_OFFSET_MS).toISOString().slice(0, 10)
}

function addDays(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

/** True when `date` falls in the 7 days ending `today` (inclusive). */
export function inWeekEnding(date: string, today: string): boolean {
  return date > addDays(today, -7) && date <= today
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function absolute(href: string, baseUrl: string): string {
  return /^https?:\/\//.test(href) ? href : `${baseUrl}${href.startsWith('/') ? href : `/${href}`}`
}

const KIND_LABEL: Record<WhatsNewKind, string> = {
  calculator: 'New calculator',
  assessment: 'New assessment',
  feature: 'New feature',
}

interface Entry {
  label: string
  title: string
  description: string
  url: string
}

function entryHtml(e: Entry): string {
  return `<tr><td style="padding:0 0 20px 0;">
  <p style="margin:0 0 4px 0;font-size:12px;font-weight:600;letter-spacing:0.04em;text-transform:uppercase;color:#15803d;">${escapeHtml(e.label)}</p>
  <p style="margin:0 0 6px 0;font-size:17px;font-weight:600;line-height:1.35;"><a href="${escapeHtml(e.url)}" style="color:#111827;text-decoration:none;">${escapeHtml(e.title)}</a></p>
  <p style="margin:0 0 6px 0;font-size:14px;line-height:1.5;color:#4b5563;">${escapeHtml(e.description)}</p>
  <a href="${escapeHtml(e.url)}" style="font-size:14px;color:#1d4ed8;">Read more &rarr;</a>
</td></tr>`
}

function sectionHtml(heading: string, entries: Entry[]): string {
  if (entries.length === 0) return ''
  return `<tr><td style="padding:8px 0 12px 0;"><h2 style="margin:0;font-size:15px;color:#111827;border-bottom:1px solid #e5e7eb;padding-bottom:8px;">${escapeHtml(heading)}</h2></td></tr>
${entries.map(entryHtml).join('\n')}`
}

function formatWeek(today: string): string {
  return new Date(`${today}T00:00:00Z`).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

/**
 * The issue for the week ending `today`, or null when nothing new shipped
 * (no email is sent that week).
 */
export function buildDigest(opts: {
  posts: DigestPost[]
  whatsNew: WhatsNewItem[]
  today: string
  baseUrl: string
}): Digest | null {
  const { today, baseUrl } = opts

  const launches: Entry[] = opts.whatsNew
    .filter((w) => inWeekEnding(w.date, today))
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .map((w) => ({ label: KIND_LABEL[w.kind], title: w.title, description: w.description, url: absolute(w.href, baseUrl) }))

  const posts: Entry[] = opts.posts
    .filter((p) => inWeekEnding(p.date, today))
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .map((p) => ({ label: 'Blog', title: p.title, description: p.description, url: `${baseUrl}/blog/${p.slug}` }))

  if (launches.length === 0 && posts.length === 0) return null

  const all = [...launches, ...posts]
  const lead = all[0].title
  const subject = all.length > 1 ? `${lead} + ${all.length - 1} more this week` : lead
  const week = formatWeek(today)

  const html = `<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(subject)}</title></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;"><tr><td align="center" style="padding:24px 12px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:8px;">
<tr><td style="padding:28px 28px 8px 28px;">
  <p style="margin:0;font-size:20px;font-weight:700;color:#111827;">ComplianceCheck Weekly</p>
  <p style="margin:4px 0 0 0;font-size:13px;color:#6b7280;">Week of ${escapeHtml(week)}</p>
</td></tr>
<tr><td style="padding:12px 28px 8px 28px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
${sectionHtml('New on ComplianceCheck', launches)}
${sectionHtml('New on the blog', posts)}
</table>
</td></tr>
<tr><td style="padding:16px 28px 28px 28px;border-top:1px solid #e5e7eb;">
  <p style="margin:0 0 6px 0;font-size:12px;line-height:1.5;color:#6b7280;">You are receiving this because you subscribed to the ComplianceCheck newsletter at <a href="${escapeHtml(baseUrl)}" style="color:#6b7280;">compliancecheck.co.in</a>.</p>
  <p style="margin:0;font-size:12px;color:#6b7280;"><a href="${UNSUBSCRIBE_PLACEHOLDER}" style="color:#6b7280;">Unsubscribe</a> with one click, any time.</p>
</td></tr>
</table>
</td></tr></table>
</body></html>`

  const textEntries = (heading: string, entries: Entry[]) =>
    entries.length === 0
      ? ''
      : `${heading}\n${'-'.repeat(heading.length)}\n${entries
          .map((e) => `${e.title}\n${e.description}\n${e.url}\n`)
          .join('\n')}\n`

  const text = `ComplianceCheck Weekly -- week of ${week}

${textEntries('New on ComplianceCheck', launches)}${textEntries('New on the blog', posts)}--
You are receiving this because you subscribed to the ComplianceCheck newsletter.
Unsubscribe: ${UNSUBSCRIBE_PLACEHOLDER}
`

  return { subject, html, text, postCount: posts.length, launchCount: launches.length }
}

/** Fill in one recipient's unsubscribe link. */
export function personalise(body: string, unsubscribeUrl: string): string {
  return body.split(UNSUBSCRIBE_PLACEHOLDER).join(unsubscribeUrl)
}
