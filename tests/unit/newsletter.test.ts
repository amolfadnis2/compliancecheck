import { describe, it, expect, beforeAll } from 'vitest'
import { signNewsletterToken, verifyNewsletterToken } from '@/lib/newsletter/token'
import { buildDigest, inWeekEnding, istDate, personalise, UNSUBSCRIBE_PLACEHOLDER } from '@/lib/newsletter/digest'
import type { WhatsNewItem } from '@/lib/newsletter/whats-new'

beforeAll(() => {
  process.env.NEWSLETTER_SECRET = 'test-secret'
})

describe('newsletter tokens', () => {
  it('round-trips a subject for the same purpose', () => {
    const t = signNewsletterToken('unsubscribe', '42')
    expect(verifyNewsletterToken(t, 'unsubscribe')).toBe('42')
  })

  it('rejects a token used for a different purpose', () => {
    const t = signNewsletterToken('unsubscribe', 'issue-1')
    expect(verifyNewsletterToken(t, 'approve')).toBeNull()
  })

  it('rejects an expired token', () => {
    const t = signNewsletterToken('confirm', '7', 1000, 0)
    expect(verifyNewsletterToken(t, 'confirm', 500)).toBe('7')
    expect(verifyNewsletterToken(t, 'confirm', 2000)).toBeNull()
  })

  it('rejects a tampered token', () => {
    const t = signNewsletterToken('approve', 'abc')
    const [payload, sig] = t.split('.')
    const forged = Buffer.from(JSON.stringify({ p: 'approve', s: 'other' })).toString('base64url')
    expect(verifyNewsletterToken(`${forged}.${sig}`, 'approve')).toBeNull()
    expect(verifyNewsletterToken(`${payload}.x${sig}`, 'approve')).toBeNull()
  })
})

describe('weekly digest', () => {
  const base = 'https://compliancecheck.co.in'

  it('uses IST for "today"', () => {
    // 2026-11-08 20:00 UTC is already 9 Nov in India
    expect(istDate(Date.UTC(2026, 10, 8, 20, 0))).toBe('2026-11-09')
  })

  it('window is the 7 days ending today', () => {
    expect(inWeekEnding('2026-11-09', '2026-11-09')).toBe(true)
    expect(inWeekEnding('2026-11-03', '2026-11-09')).toBe(true)
    expect(inWeekEnding('2026-11-02', '2026-11-09')).toBe(false)
    expect(inWeekEnding('2026-11-10', '2026-11-09')).toBe(false)
  })

  it('returns null when nothing new shipped', () => {
    const posts = [{ slug: 'old', title: 'Old', description: 'd', date: '2026-10-01' }]
    expect(buildDigest({ posts, whatsNew: [], today: '2026-11-09', baseUrl: base })).toBeNull()
  })

  it('includes new posts and launches, escapes HTML and keeps the unsubscribe placeholder', () => {
    const whatsNew: WhatsNewItem[] = [
      { date: '2026-11-05', kind: 'calculator', title: 'Bonus <Calculator>', description: 'x', href: '/calculator/bonus' },
    ]
    const posts = [
      { slug: 'new-post', title: 'New post', description: 'About things', date: '2026-11-08' },
      { slug: 'old-post', title: 'Old post', description: 'Old', date: '2026-10-01' },
    ]
    const d = buildDigest({ posts, whatsNew, today: '2026-11-09', baseUrl: base })!
    expect(d.launchCount).toBe(1)
    expect(d.postCount).toBe(1)
    expect(d.subject).toBe('Bonus <Calculator> + 1 more this week')
    expect(d.html).toContain('Bonus &lt;Calculator&gt;')
    expect(d.html).toContain(`${base}/calculator/bonus`)
    expect(d.html).toContain(`${base}/blog/new-post`)
    expect(d.html).not.toContain('old-post')
    expect(d.html).toContain(UNSUBSCRIBE_PLACEHOLDER)
    expect(d.text).toContain(UNSUBSCRIBE_PLACEHOLDER)

    const mine = personalise(d.html, 'https://x/unsub?token=abc')
    expect(mine).not.toContain(UNSUBSCRIBE_PLACEHOLDER)
    expect(mine).toContain('https://x/unsub?token=abc')
  })
})
