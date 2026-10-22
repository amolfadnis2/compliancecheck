import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const sent = vi.hoisted(() => [] as { event: string; props: Record<string, unknown> }[])

vi.mock('@/lib/analytics/tracking', () => ({
  trackEvent: (event: string, props: Record<string, unknown>) => sent.push({ event, props }),
}))
vi.mock('posthog-js', () => ({
  default: { __loaded: false, getFeatureFlag: () => undefined, onFeatureFlags: () => () => {}, captureException: vi.fn() },
}))

import { PF_EVENTS, PII_KEY, createInputsChangedTracker, pfEvents, sanitize, setPfEventContext } from '@/lib/analytics/pf-events'
import { pfBeforeSend, stripPfQuery } from '@/lib/analytics/pf-url-sanitizer'
import { resolvePfFlags, PF_FLAG_DEFAULTS } from '@/lib/feature-flags/pf'

const FORBIDDEN = /email|name|phone|salary|balance/i
// salary_band is the one allowed match: a coarse band, never a value (see pf-events.ts).
const allowed = (k: string) => k === 'salary_band'

function fireAll() {
  pfEvents.viewed({ entry_source: 'direct', has_shared_state: false, utm: { utm_source: 'x' } })
  pfEvents.inputsChanged({ fields_changed: ['basic'], salary_band: '25k-50k', hike_pct: 8, basis: 'capped', vpf_on: false, labour_code_mode: false })
  pfEvents.calculationCompleted({ years: 30, corpus_band: '50L-1Cr', xirr_corpus: 8.23, xirr_own: 9.09, pension_eligible: true, tax_threshold_hit: false, cap_freeze: true, engine_ms: 1.2 })
  pfEvents.scenarioToggled({ scenario: 'custom', custom_rate: 8 })
  pfEvents.viewToggled({ view: 'real' })
  pfEvents.advancedOpened()
  pfEvents.pdfDownloaded({ gated: false, gen_ms: 120 })
  pfEvents.csvDownloaded()
  pfEvents.shareClicked({ channel: 'whatsapp' })
  pfEvents.saved()
  pfEvents.leadCaptured({ purpose: 'pdf_report', team_size_band: '11-50' })
  pfEvents.crossLinkClicked({ target: 'gratuity' })
  pfEvents.calcError({ error_code: 'INVALID_BASIC', field: 'basic' })
}

describe('PF PostHog events', () => {
  beforeEach(() => {
    sent.length = 0
    setPfEventContext({ paramsVersion: '2026-10-22' })
  })

  it('fires every dictionary event with calc_version and params_version', () => {
    fireAll()
    const names = new Set(sent.map((s) => s.event))
    expect([...names].sort()).toEqual(Object.values(PF_EVENTS).sort())
    for (const s of sent) {
      expect(s.props.calc_version).toBe('1.0.0')
      expect(s.props.params_version).toBe('2026-10-22')
    }
  })

  it('no payload has a key matching /email|name|phone|salary|balance/ (salary_band excepted)', () => {
    fireAll()
    for (const s of sent) {
      for (const k of Object.keys(s.props)) {
        expect(FORBIDDEN.test(k) && !allowed(k), `${s.event}.${k}`).toBe(false)
      }
    }
  })

  it('sanitize drops PII-looking keys defensively', () => {
    const out = sanitize({ email: 'a@b.c', full_name: 'x', phone: '1', basic_salary: 1, opening_balance: 2, salary_band: '1L+', ok: 1 })
    expect(out).toEqual({ salary_band: '1L+', ok: 1 })
    expect(PII_KEY.test('email')).toBe(true)
  })

  describe('pf_inputs_changed debounce', () => {
    beforeEach(() => vi.useFakeTimers())
    afterEach(() => vi.useRealTimers())

    it('sends one event 1000 ms after the last change with every changed field', () => {
      const calls: unknown[] = []
      const t = createInputsChangedTracker(1000, (p) => calls.push(p))
      const snap = { salary_band: '25k-50k', hike_pct: 8, basis: 'capped' as const, vpf_on: false, labour_code_mode: false }
      t.change('basic', snap)
      vi.advanceTimersByTime(600)
      t.change('hikePct', { ...snap, hike_pct: 10 })
      vi.advanceTimersByTime(999)
      expect(calls).toHaveLength(0)
      vi.advanceTimersByTime(1)
      expect(calls).toEqual([{ fields_changed: ['basic', 'hikePct'], ...snap, hike_pct: 10 }])
      t.change('vpfPct', snap)
      t.cancel()
      vi.advanceTimersByTime(2000)
      expect(calls).toHaveLength(1)
    })

    it('default sender emits pf_inputs_changed through trackEvent', () => {
      const t = createInputsChangedTracker()
      t.change('basic', { salary_band: '1L+', hike_pct: 5, basis: 'actual', vpf_on: true, labour_code_mode: true })
      vi.advanceTimersByTime(1000)
      expect(sent.at(-1)?.event).toBe('pf_inputs_changed')
    })
  })
})

describe('PostHog URL sanitiser', () => {
  it('strips calculator state but keeps utm params', () => {
    expect(stripPfQuery('https://compliancecheck.co.in/calculator/pf?b=95000&o=1200000&utm_source=li&s=abcDEF123')).toBe(
      'https://compliancecheck.co.in/calculator/pf?utm_source=li'
    )
    expect(stripPfQuery('https://compliancecheck.co.in/calculator/pf?b=95000')).toBe('https://compliancecheck.co.in/calculator/pf')
  })

  it('leaves other pages and non-URLs alone', () => {
    expect(stripPfQuery('https://compliancecheck.co.in/calculator/pf-esi-pt?x=1')).toBe('https://compliancecheck.co.in/calculator/pf-esi-pt?x=1')
    expect(stripPfQuery('not a url')).toBe('not a url')
  })

  it('scrubs current_url, referrer and $set/$set_once copies', () => {
    const ev = pfBeforeSend({
      properties: {
        $current_url: 'https://x.in/calculator/pf?b=1',
        $referrer: 'https://x.in/calculator/pf?o=2',
        $set_once: { $initial_current_url: 'https://x.in/calculator/pf?b=3' },
      },
      $set: { $initial_referrer: 'https://x.in/calculator/pf?b=4' },
    })
    expect(ev.properties!.$current_url).toBe('https://x.in/calculator/pf')
    expect(ev.properties!.$referrer).toBe('https://x.in/calculator/pf')
    expect((ev.properties!.$set_once as Record<string, string>).$initial_current_url).toBe('https://x.in/calculator/pf')
    expect(ev.$set!.$initial_referrer).toBe('https://x.in/calculator/pf')
    expect(pfBeforeSend(null)).toBeNull()
  })
})

describe('PF feature flags', () => {
  it('defaults when PostHog and env give nothing', () => {
    expect(resolvePfFlags()).toEqual(PF_FLAG_DEFAULTS)
  })

  it('takes valid PostHog values and ignores invalid ones', () => {
    const ph: Record<string, unknown> = { pf_pdf_gate: 'required', pf_default_chart: 'sideways', pf_hero_metric: 'return', pf_employer_view_cta: true }
    expect(resolvePfFlags((k) => ph[k])).toEqual({ pf_pdf_gate: 'required', pf_default_chart: 'nominal', pf_hero_metric: 'return', pf_employer_view_cta: 'on' })
  })
})
