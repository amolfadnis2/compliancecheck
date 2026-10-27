import { describe, it, expect, beforeEach } from 'vitest'
import { signReportToken, verifyReportToken, reportShareUrl, REPORT_SHARE_TTL_MS } from '@/lib/report/share-token'
import { normalizeIndianMobile } from '@/lib/identity/phone'
import { whatsappUrl } from '@/lib/report/whatsapp'

describe('report share tokens', () => {
  beforeEach(() => {
    process.env.REPORT_SHARE_SECRET = 'test-secret'
  })

  const ref = { id: '11111111-2222-3333-4444-555555555555', type: 'dpdp' }

  it('round-trips the assessment it was issued for', () => {
    const now = 1_700_000_000_000
    expect(verifyReportToken(signReportToken(ref, now), now + 1000)).toEqual({ ...ref, exp: now + REPORT_SHARE_TTL_MS })
  })

  it('expires after 30 days', () => {
    const now = 1_700_000_000_000
    const token = signReportToken(ref, now)
    expect(verifyReportToken(token, now + REPORT_SHARE_TTL_MS - 1)).not.toBeNull()
    expect(verifyReportToken(token, now + REPORT_SHARE_TTL_MS + 1)).toBeNull()
  })

  it('rejects a token pointed at another assessment', () => {
    const [, sig] = signReportToken(ref).split('.')
    const forged = Buffer.from(JSON.stringify({ i: 'other-id', t: 'dpdp', e: Date.now() + 1e9 })).toString('base64url')
    expect(verifyReportToken(`${forged}.${sig}`)).toBeNull()
  })

  it('rejects tokens signed with another secret, and garbage', () => {
    const token = signReportToken(ref)
    process.env.REPORT_SHARE_SECRET = 'different'
    expect(verifyReportToken(token)).toBeNull()
    expect(verifyReportToken('not-a-token')).toBeNull()
    expect(verifyReportToken('a.b.c')).toBeNull()
  })

  it('refuses to sign without a configured secret', () => {
    delete process.env.REPORT_SHARE_SECRET
    expect(() => signReportToken(ref)).toThrow(/REPORT_SHARE_SECRET/)
  })

  it('builds the share URL from the app origin', () => {
    expect(reportShareUrl('tok', 'https://example.test/')).toMatch(/\/api\/report\/share\/tok$/)
  })
})

describe('normalizeIndianMobile', () => {
  it.each([
    ['9876543210', '919876543210'],
    ['98765 43210', '919876543210'],
    ['+91-98765-43210', '919876543210'],
    ['09876543210', '919876543210'],
    ['919876543210', '919876543210'],
  ])('%s -> %s', (input, expected) => {
    expect(normalizeIndianMobile(input)).toBe(expected)
  })

  it.each(['', '12345', '5876543210', '+1 415 555 0100', null, undefined])('rejects %s', (input) => {
    expect(normalizeIndianMobile(input as string)).toBeNull()
  })
})

describe('whatsappUrl', () => {
  it('opens a chat with the number when known', () => {
    expect(whatsappUrl('hi there', '98765 43210')).toBe('https://wa.me/919876543210?text=hi%20there')
  })
  it('lets the user pick a chat when no number is known', () => {
    expect(whatsappUrl('hi', '')).toBe('https://wa.me/?text=hi')
  })
})
