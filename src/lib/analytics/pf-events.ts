/**
 * Typed PostHog events for the PF calculator (/calculator/pf).
 *
 * Goes through the shared trackEvent wrapper (no-op until PostHog loads).
 * Every event carries calc_version and params_version. Payloads must never
 * contain email, name, phone or exact salary/balance — only bands. sanitize()
 * drops any such key defensively; `salary_band` is the one allowed key
 * because it is a coarse band, not a value.
 *
 * Event dictionary: docs/analytics/pf-calculator.md
 */

import posthog from 'posthog-js'
import { trackEvent } from './tracking'
import { ENGINE_VERSION } from '@/lib/calculators/epf/types'

export const PF_EVENTS = {
  VIEWED: 'pf_calculator_viewed',
  INPUTS_CHANGED: 'pf_inputs_changed',
  CALCULATION_COMPLETED: 'pf_calculation_completed',
  SCENARIO_TOGGLED: 'pf_scenario_toggled',
  VIEW_TOGGLED: 'pf_view_toggled',
  ADVANCED_OPENED: 'pf_advanced_opened',
  PDF_DOWNLOADED: 'pf_pdf_downloaded',
  CSV_DOWNLOADED: 'pf_csv_downloaded',
  SHARE_CLICKED: 'pf_share_clicked',
  SAVED: 'pf_saved',
  LEAD_CAPTURED: 'pf_lead_captured',
  CROSS_LINK_CLICKED: 'pf_cross_link_clicked',
  CALC_ERROR: 'pf_calc_error',
} as const

export type PfEventName = (typeof PF_EVENTS)[keyof typeof PF_EVENTS]

export interface PfInputsChangedProps {
  fields_changed: string[]
  salary_band: string
  hike_pct: number
  basis: 'capped' | 'actual'
  vpf_on: boolean
  labour_code_mode: boolean
}

export interface PfCalculationCompletedProps {
  years: number
  corpus_band: string
  xirr_corpus: number | null
  xirr_own: number | null
  pension_eligible: boolean
  tax_threshold_hit: boolean
  cap_freeze: boolean
  engine_ms: number
}

export const PII_KEY = /email|name|phone|salary|balance/i
const ALLOWED_KEYS = new Set(['salary_band'])

/** Drop any key that could carry PII or exact money values. */
export function sanitize(props: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(props)) {
    if (PII_KEY.test(k) && !ALLOWED_KEYS.has(k)) continue
    out[k] = v
  }
  return out
}

let paramsVersion = 'unknown'

/** Set once by the page with the loaded params version. */
export function setPfEventContext(ctx: { paramsVersion: string }) {
  paramsVersion = ctx.paramsVersion
}

export function pfCommonProps() {
  return { calc_version: ENGINE_VERSION, params_version: paramsVersion }
}

function send(event: PfEventName, props: Record<string, unknown> = {}) {
  const payload = sanitize({ ...props, ...pfCommonProps() })
  trackEvent(event, payload)
  // E2E seam: tests/pf-calculator.spec.ts sets window.__pfEvents = [] before load.
  const sink = typeof window !== 'undefined' ? (window as unknown as { __pfEvents?: unknown[] }).__pfEvents : undefined
  if (Array.isArray(sink)) sink.push({ event, properties: payload })
}

export const pfEvents = {
  viewed: (p: { entry_source: string; has_shared_state: boolean; utm?: Record<string, string> }) =>
    send(PF_EVENTS.VIEWED, { entry_source: p.entry_source, has_shared_state: p.has_shared_state, ...(p.utm ?? {}) }),
  inputsChanged: (p: PfInputsChangedProps) => send(PF_EVENTS.INPUTS_CHANGED, { ...p }),
  calculationCompleted: (p: PfCalculationCompletedProps) => send(PF_EVENTS.CALCULATION_COMPLETED, { ...p }),
  scenarioToggled: (p: { scenario: string; custom_rate: number | null }) => send(PF_EVENTS.SCENARIO_TOGGLED, p),
  viewToggled: (p: { view: 'nominal' | 'real' }) => send(PF_EVENTS.VIEW_TOGGLED, p),
  advancedOpened: () => send(PF_EVENTS.ADVANCED_OPENED),
  pdfDownloaded: (p: { gated: boolean; gen_ms: number }) => send(PF_EVENTS.PDF_DOWNLOADED, p),
  csvDownloaded: () => send(PF_EVENTS.CSV_DOWNLOADED),
  shareClicked: (p: { channel: 'copy' | 'whatsapp' | 'linkedin' }) => send(PF_EVENTS.SHARE_CLICKED, p),
  saved: () => send(PF_EVENTS.SAVED),
  leadCaptured: (p: { purpose: string; team_size_band: string | null }) => send(PF_EVENTS.LEAD_CAPTURED, p),
  crossLinkClicked: (p: { target: string }) => send(PF_EVENTS.CROSS_LINK_CLICKED, p),
  calcError: (p: { error_code: string; field: string }, error?: unknown) => {
    send(PF_EVENTS.CALC_ERROR, p)
    if (error && typeof window !== 'undefined' && posthog.__loaded && typeof posthog.captureException === 'function') {
      posthog.captureException(error, pfCommonProps())
    }
  },
}

/**
 * Debounced pf_inputs_changed: collects changed fields and sends one event
 * `waitMs` after the last change, using the latest snapshot.
 */
export function createInputsChangedTracker(waitMs = 1000, sendFn: (p: PfInputsChangedProps) => void = (p) => send(PF_EVENTS.INPUTS_CHANGED, { ...p })) {
  const fields = new Set<string>()
  let timer: ReturnType<typeof setTimeout> | null = null
  let snapshot: Omit<PfInputsChangedProps, 'fields_changed'> | null = null
  return {
    change(field: string, snap: Omit<PfInputsChangedProps, 'fields_changed'>) {
      fields.add(field)
      snapshot = snap
      if (timer) clearTimeout(timer)
      timer = setTimeout(() => {
        if (snapshot) sendFn({ fields_changed: Array.from(fields), ...snapshot })
        fields.clear()
        timer = null
      }, waitMs)
    },
    cancel() {
      if (timer) clearTimeout(timer)
      timer = null
      fields.clear()
    },
  }
}
