import { afterEach, describe, expect, it, vi } from 'vitest'

async function load(env: Record<string, string | undefined>) {
  vi.resetModules()
  for (const [k, v] of Object.entries(env)) vi.stubEnv(k, v as string)
  return import('@/lib/analytics/google-ads')
}

describe('trackGoogleAdsPurchase', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
  })

  it('sends a conversion with value, INR and transaction id when configured', async () => {
    const gtag = vi.fn()
    vi.stubGlobal('window', { gtag })
    const { trackGoogleAdsPurchase } = await load({
      NEXT_PUBLIC_GOOGLE_ADS_ID: 'AW-123',
      NEXT_PUBLIC_GOOGLE_ADS_PURCHASE_LABEL: 'abc',
    })
    trackGoogleAdsPurchase({ valueInr: 2499, transactionId: 'pay_1' })
    expect(gtag).toHaveBeenCalledWith('event', 'conversion', {
      send_to: 'AW-123/abc',
      value: 2499,
      currency: 'INR',
      transaction_id: 'pay_1',
    })
  })

  it('does nothing when the purchase label is not set', async () => {
    const gtag = vi.fn()
    vi.stubGlobal('window', { gtag })
    const { trackGoogleAdsPurchase } = await load({
      NEXT_PUBLIC_GOOGLE_ADS_ID: 'AW-123',
      NEXT_PUBLIC_GOOGLE_ADS_PURCHASE_LABEL: '',
    })
    trackGoogleAdsPurchase({ valueInr: 2499, transactionId: 'pay_1' })
    expect(gtag).not.toHaveBeenCalled()
  })

  it('does not throw when gtag has not loaded (e.g. blocked by an ad blocker)', async () => {
    vi.stubGlobal('window', {})
    const { trackGoogleAdsPurchase } = await load({
      NEXT_PUBLIC_GOOGLE_ADS_ID: 'AW-123',
      NEXT_PUBLIC_GOOGLE_ADS_PURCHASE_LABEL: 'abc',
    })
    expect(() => trackGoogleAdsPurchase({ valueInr: 499, transactionId: 'pay_2' })).not.toThrow()
  })
})
