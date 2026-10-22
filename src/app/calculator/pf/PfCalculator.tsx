'use client'

import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import posthog from 'posthog-js'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { project, validateInput, ENGINE_VERSION, type EpfFieldError, type ProjectionResult } from '@/lib/calculators/epf'
import type { LoadedEpfParams } from '@/lib/calculators/epf/params'
import { encodeState, toProjectInput, type PfState } from '@/lib/calculators/epf/url-state'
import {
  TABLE_HEADERS,
  callouts as buildCallouts,
  chartPoints,
  compact,
  employerCostNote,
  factsFrom,
  headline as buildHeadline,
  headlineText,
  fmtDate,
  inr,
  lakh,
  ratePct,
  resultsSummary,
  salaryBand,
  scenarioLabel,
  sessionInputs,
  sourceRows,
  stats as buildStats,
  tableRow,
  yearTableCsv,
} from '@/lib/calculators/epf/view'
import { createInputsChangedTracker, pfEvents, setPfEventContext } from '@/lib/analytics/pf-events'
import { usePfFlags } from '@/lib/feature-flags/pf'
import dynamic from 'next/dynamic'
import { PfLeadDialog, type LeadPurpose } from './PfLeadDialog'
import { logCalcSession, savePfCalc, sharePfCalc } from './actions'

// recharts is ~100 kB; load it after the page is interactive. The table below is the text alternative.
const PfChart = dynamic(() => import('./PfChart').then((m) => m.PfChart), {
  ssr: false,
  loading: () => <div className="h-[300px] w-full animate-pulse rounded-lg bg-gray-100 motion-reduce:animate-none dark:bg-gray-900" aria-hidden="true" />,
})

// ---------------------------------------------------------------------------
// Small building blocks
// ---------------------------------------------------------------------------

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const APPRAISAL_ORDER = [4, 5, 6, 7, 8, 9, 10, 11, 12, 1, 2, 3]
const SLABS = [0, 5, 10, 15, 20, 30] as const

const inputCls = 'h-11 text-base'
const selectCls =
  'flex h-11 w-full rounded-md border border-input bg-transparent px-3 text-base shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-700 dark:bg-gray-900'
const hintCls = 'mt-1 text-sm text-gray-600 dark:text-gray-400'
const errCls = 'mt-1 text-sm text-red-700 dark:text-red-400'
const labelCls = 'mb-1.5 block text-sm font-medium text-gray-900 dark:text-gray-100'

function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
  columns = 4,
}: {
  label: string
  value: T
  options: { value: T; label: string; sub?: string }[]
  onChange: (v: T) => void
  columns?: 2 | 4
}) {
  const id = useId()
  return (
    <div>
      <span id={id} className={labelCls}>{label}</span>
      <div role="group" aria-labelledby={id} className={`grid gap-1.5 ${columns === 2 ? 'grid-cols-2' : 'grid-cols-4'}`}>
        {options.map((o) => {
          const on = o.value === value
          return (
            <button
              key={o.value}
              type="button"
              aria-pressed={on}
              onClick={() => onChange(o.value)}
              className={`min-h-[44px] rounded-lg border-2 px-1.5 py-1 text-sm font-medium leading-tight transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-700 focus-visible:ring-offset-2 ${
                on
                  ? 'border-green-700 bg-green-700 text-white hover:bg-green-800'
                  : 'border-gray-300 bg-white text-gray-900 hover:border-green-700 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100'
              }`}
            >
              {o.label}
              {o.sub && <small className={`block text-xs font-normal ${on ? 'text-white/90' : 'text-gray-500 dark:text-gray-400'}`}>{o.sub}</small>}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function describedBy(...ids: (string | false | undefined)[]) {
  const v = ids.filter(Boolean).join(' ')
  return v || undefined
}

const parseMoney = (s: string) => {
  const v = Number(String(s).replace(/[^0-9.]/g, ''))
  return Number.isFinite(v) ? v : 0
}
const fmtMoney = (n: number) => (n ? Math.round(n).toLocaleString('en-IN') : '0')

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

type Draft = Record<'age' | 'retirementAge' | 'basic' | 'opening' | 'allowances' | 'customRate' | 'pastEpsYears', string>

const draftFrom = (s: PfState): Draft => ({
  age: String(s.age),
  retirementAge: String(s.retirementAge),
  basic: fmtMoney(s.basic),
  opening: fmtMoney(s.opening),
  allowances: fmtMoney(s.allowances),
  customRate: s.customRate.toFixed(2),
  pastEpsYears: String(s.pastEpsYears),
})

export interface PfCalculatorProps {
  initialState: PfState
  start: { startY: number; startM: number }
  loaded: LoadedEpfParams
  hasSharedState: boolean
  isLoggedIn: boolean
}

export function PfCalculator({ initialState, start, loaded, hasSharedState, isLoggedIn }: PfCalculatorProps) {
  const router = useRouter()
  const pathname = usePathname()
  const flags = usePfFlags()
  const { params } = loaded
  const facts = useMemo(() => factsFrom(params, loaded.rateRows), [params, loaded.rateRows])
  const uid = useId()

  // Typed fields live in `form`; free-text number fields keep their raw text in `draft`.
  const [form, setForm] = useState<PfState>(initialState)
  const [draft, setDraft] = useState<Draft>(() => draftFrom(initialState))
  const [valid, setValid] = useState<PfState>(initialState)
  const [errors, setErrors] = useState<EpfFieldError[]>([])
  const [advancedOpen, setAdvancedOpen] = useState(false)
  const lastField = useRef<string | null>(null)

  // Candidate state from form + draft text.
  const candidate = useMemo<PfState>(
    () => ({
      ...form,
      age: Number(draft.age),
      retirementAge: Number(draft.retirementAge),
      basic: parseMoney(draft.basic),
      opening: parseMoney(draft.opening),
      allowances: parseMoney(draft.allowances),
      customRate: Number(draft.customRate),
      pastEpsYears: Number(draft.pastEpsYears) || 0,
    }),
    [form, draft]
  )

  // Validate with the engine schema; on success it becomes the committed state.
  const lastErrorKey = useRef('')
  useEffect(() => {
    const v = validateInput(toProjectInput(candidate, start))
    if (v.ok) {
      setErrors([])
      setValid(candidate)
      lastErrorKey.current = ''
    } else {
      setErrors(v.errors)
      // One event per distinct error set, not per keystroke.
      const key = v.errors.map((e) => `${e.code}:${e.field}`).join('|')
      if (key !== lastErrorKey.current) {
        lastErrorKey.current = key
        pfEvents.calcError({ error_code: 'validation', field: v.errors.map((e) => e.field).join(',') })
      }
    }
  }, [candidate, start])

  const errorFor = (field: string) => errors.find((e) => e.field === field)

  // Projection (+ scenario comparison). Engine errors are reported, never thrown to the UI.
  const computed = useMemo(() => {
    try {
      const base = toProjectInput(valid, start)
      const res = project(base, params)
      const scen: { key: PfState['scenario']; corpus: number }[] = (['conservative', 'base', 'optimistic'] as const).map((s) => ({
        key: s,
        corpus: project({ ...base, scenario: s }, params).corpus,
      }))
      if (valid.scenario === 'custom') scen.push({ key: 'custom', corpus: res.corpus })
      return { res, scen, error: null as unknown }
    } catch (error) {
      return { res: null, scen: [], error }
    }
  }, [valid, start, params])
  const res: ProjectionResult | null = computed.res

  useEffect(() => {
    if (computed.error) pfEvents.calcError({ error_code: (computed.error as { code?: string }).code ?? 'ENGINE_ERROR', field: 'engine' }, computed.error)
  }, [computed.error])

  // ---- URL sync (router.replace, no scroll) ----
  useEffect(() => {
    const t = setTimeout(() => {
      const qs = encodeState(valid)
      const target = qs ? `${pathname}?${qs}` : pathname
      if (window.location.pathname + window.location.search !== target) router.replace(target, { scroll: false })
    }, 300)
    return () => clearTimeout(t)
  }, [valid, pathname, router])

  // ---- Analytics ----
  const tracker = useRef<ReturnType<typeof createInputsChangedTracker> | null>(null)
  const summaryRef = useRef(res ? resultsSummary(res) : null)
  summaryRef.current = res ? resultsSummary(res) : null

  useEffect(() => {
    setPfEventContext({ paramsVersion: params.version })
    tracker.current = createInputsChangedTracker(1000, (p) => {
      pfEvents.inputsChanged(p)
      if (summaryRef.current) pfEvents.calculationCompleted(summaryRef.current)
    })
    const sp = new URLSearchParams(window.location.search)
    const utm: Record<string, string> = {}
    ;['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'].forEach((k) => {
      const v = sp.get(k)
      if (v) utm[k] = v.slice(0, 100)
    })
    let entry = 'direct'
    if (hasSharedState) entry = 'share_link'
    else if (utm.utm_source) entry = 'utm'
    else if (document.referrer) {
      try {
        entry = new URL(document.referrer).host === window.location.host ? 'internal' : 'referral'
      } catch {
        entry = 'referral'
      }
    }
    pfEvents.viewed({ entry_source: entry, has_shared_state: hasSharedState, utm })
    if (summaryRef.current) pfEvents.calculationCompleted(summaryRef.current)
    return () => tracker.current?.cancel()
  }, [params.version, hasSharedState])

  useEffect(() => {
    if (!lastField.current) return
    tracker.current?.change(lastField.current, {
      salary_band: salaryBand(valid.basic),
      hike_pct: valid.hikePct,
      basis: valid.basis,
      vpf_on: valid.vpfPct > 0,
      labour_code_mode: valid.labourCode,
    })
  }, [valid])

  // ---- Session log: ≥5 s after the last change, plus sendBeacon on hide ----
  const anonId = useRef<string>('')
  const pendingSession = useRef<object | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)

  useEffect(() => {
    const ph = posthog.__loaded ? posthog.get_distinct_id() : null
    if (ph) anonId.current = ph
    else {
      try {
        anonId.current = localStorage.getItem('pf_anon_id') ?? ''
        if (!anonId.current) {
          anonId.current = `anon_${Math.random().toString(36).slice(2, 12)}`
          localStorage.setItem('pf_anon_id', anonId.current)
        }
      } catch {
        anonId.current = `anon_${Math.random().toString(36).slice(2, 12)}`
      }
    }
  }, [])

  useEffect(() => {
    if (!res) return
    pendingSession.current = {
      anonId: anonId.current || 'anon_unknown',
      paramsVersion: params.version,
      salaryBand: salaryBand(valid.basic),
      inputs: sessionInputs(valid),
      summary: resultsSummary(res),
    }
    const t = setTimeout(async () => {
      const payload = pendingSession.current
      if (!payload) return
      pendingSession.current = null
      const r = await logCalcSession(payload)
      if (r.ok && 'id' in r && r.id && !r.id.startsWith('local_')) setSessionId(r.id)
    }, 5000)
    return () => clearTimeout(t)
  }, [res, valid, params.version])

  useEffect(() => {
    const flush = () => {
      if (document.visibilityState !== 'hidden' || !pendingSession.current) return
      const blob = new Blob([JSON.stringify(pendingSession.current)], { type: 'application/json' })
      navigator.sendBeacon?.('/api/calculator/pf-session', blob)
      pendingSession.current = null
    }
    document.addEventListener('visibilitychange', flush)
    window.addEventListener('pagehide', flush)
    return () => {
      document.removeEventListener('visibilitychange', flush)
      window.removeEventListener('pagehide', flush)
    }
  }, [])

  // ---- Change handlers ----
  const setField = <K extends keyof PfState>(key: K, value: PfState[K]) => {
    lastField.current = key
    setForm((f) => ({ ...f, [key]: value }))
  }
  const setText = (key: keyof Draft, value: string) => {
    lastField.current = key
    setDraft((d) => ({ ...d, [key]: value }))
  }
  const blurMoney = (key: 'basic' | 'opening' | 'allowances') => setDraft((d) => ({ ...d, [key]: fmtMoney(parseMoney(d[key])) }))

  const chooseScenario = (s: PfState['scenario']) => {
    setField('scenario', s)
    pfEvents.scenarioToggled({ scenario: s, custom_rate: s === 'custom' ? Number(draft.customRate) : null })
  }

  // Flag-driven default chart view, unless the URL already set one.
  const viewTouched = useRef(initialState.view !== 'nominal')
  useEffect(() => {
    if (!viewTouched.current && flags.pf_default_chart === 'real' && form.view !== 'real') {
      setForm((f) => ({ ...f, view: 'real' }))
    }
  }, [flags.pf_default_chart, form.view])

  const setView = (v: 'nominal' | 'real') => {
    viewTouched.current = true
    setField('view', v)
    pfEvents.viewToggled({ view: v })
  }

  // ---- Share / save / exports ----
  const chartRef = useRef<HTMLDivElement>(null)
  const [shareUrl, setShareUrl] = useState<string | null>(null)
  const [shareMsg, setShareMsg] = useState<string | null>(null)
  const [saveName, setSaveName] = useState('My PF plan')
  const [saveMsg, setSaveMsg] = useState<string | null>(null)
  const [savePrompt, setSavePrompt] = useState(false)
  const [lead, setLead] = useState<{ open: boolean; purpose: LeadPurpose }>({ open: false, purpose: 'pdf_report' })
  const [busy, setBusy] = useState<string | null>(null)

  const createShare = async () => {
    setBusy('share')
    setShareMsg(null)
    const r = await sharePfCalc(valid)
    setBusy(null)
    if (r.ok) setShareUrl(`${window.location.origin}${r.path}`)
    else setShareMsg(r.reason === 'rate_limited' ? 'Too many share links. Try again later.' : 'Couldn’t create a link right now. You can copy this page’s address instead.')
  }

  const copyShare = async () => {
    if (!shareUrl) return
    try {
      await navigator.clipboard.writeText(shareUrl)
      setShareMsg('Link copied.')
    } catch {
      setShareMsg('Copy failed. Select the link and copy it.')
    }
    pfEvents.shareClicked({ channel: 'copy' })
  }

  const save = async () => {
    setBusy('save')
    const r = await savePfCalc({ name: saveName, state: valid })
    setBusy(null)
    if (r.ok) {
      setSaveMsg('Saved to your account.')
      setSavePrompt(false)
      pfEvents.saved()
    } else if (r.reason === 'auth') {
      setSaveMsg('Sign in to save your calculation.')
    } else {
      setSaveMsg('Couldn’t save right now. Please try again.')
    }
  }

  const downloadCsv = () => {
    if (!res) return
    const blob = new Blob([yearTableCsv(res.rows, { engineVersion: ENGINE_VERSION, paramsVersion: params.version })], { type: 'text/csv;charset=utf-8' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `pf-forecast-${params.version}.csv`
    a.click()
    URL.revokeObjectURL(a.href)
    pfEvents.csvDownloaded()
  }

  const generatePdf = useCallback(
    async (gated: boolean) => {
      if (!res) return
      setBusy('pdf')
      const t0 = performance.now()
      try {
        const [{ buildPfPdf, svgToImage }, { SERIES }] = await Promise.all([import('@/lib/calculators/epf/pdf'), import('./PfChart')])
        const svg = chartRef.current?.querySelector('svg.recharts-surface') as SVGSVGElement | null
        const toLight = Object.fromEntries((Object.keys(SERIES.dark) as (keyof typeof SERIES.dark)[]).map((k) => [SERIES.dark[k].toUpperCase(), SERIES.light[k]]))
        const chartPng = svg ? await svgToImage(svg, toLight) : null
        const doc = buildPfPdf({
          state: valid,
          result: res,
          headline: headlineText(buildHeadline(res, valid.retirementAge)),
          callouts: buildCallouts(res, valid, facts),
          sources: sourceRows(loaded.paramRows, loaded.rateRows, valid, params),
          paramsVersion: params.version,
          verifiedAt: loaded.verifiedAt,
          futureRateLabel: ratePct(valid.scenario === 'custom' ? valid.customRate : params.scenarios[valid.scenario]),
          chartPng,
        })
        doc.save(`pf-forecast-${params.version}.pdf`)
        pfEvents.pdfDownloaded({ gated, gen_ms: Math.round(performance.now() - t0) })
      } catch (err) {
        pfEvents.calcError({ error_code: 'PDF_FAILED', field: 'pdf' }, err)
      } finally {
        setBusy(null)
      }
    },
    [res, valid, facts, loaded, params]
  )

  const onPdfClick = () => {
    if (flags.pf_pdf_gate === 'none') void generatePdf(false)
    else setLead({ open: true, purpose: 'pdf_report' })
  }

  const onLeadDone = ({ captured, teamSizeBand }: { captured: boolean; teamSizeBand: string | null }) => {
    const purpose = lead.purpose
    setLead((l) => ({ ...l, open: false }))
    if (captured) pfEvents.leadCaptured({ purpose, team_size_band: teamSizeBand })
    if (purpose === 'pdf_report') void generatePdf(captured)
  }

  // ---- Derived view data ----
  const head = res ? buildHeadline(res, valid.retirementAge) : null
  const statList = res ? buildStats(res) : []
  const calloutList = res ? buildCallouts(res, valid, facts) : []
  const points = useMemo(() => (res ? chartPoints(res.rows, valid.view === 'real') : []), [res, valid.view])
  const sources = useMemo(() => sourceRows(loaded.paramRows, loaded.rateRows, valid, params), [loaded, valid, params])
  const loginHref = `/login?next=${encodeURIComponent(`${pathname}${encodeState(valid) ? `?${encodeState(valid)}` : ''}`)}`

  const err = (f: string) => errorFor(f)
  const errId = (f: string) => `${uid}-${f}-err`

  const numberField = (key: 'age' | 'retirementAge', label: string, min: number, max: number) => (
    <div>
      <label htmlFor={`${uid}-${key}`} className={labelCls}>{label}</label>
      <Input id={`${uid}-${key}`} type="number" inputMode="numeric" min={min} max={max} className={inputCls} value={draft[key]}
        onChange={(e) => setText(key, e.target.value)} aria-invalid={!!err(key)} aria-describedby={describedBy(!!err(key) && errId(key))} />
      {err(key) && <p id={errId(key)} className={errCls}>{err(key)!.message}</p>}
    </div>
  )

  const moneyField = (key: 'basic' | 'opening' | 'allowances', label: string, hint?: string) => (
    <div>
      <label htmlFor={`${uid}-${key}`} className={labelCls}>{label}</label>
      <div className="relative">
        <span aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
        <Input id={`${uid}-${key}`} type="text" inputMode="numeric" className={`${inputCls} pl-7`} value={draft[key]}
          onChange={(e) => setText(key, e.target.value)} onBlur={() => blurMoney(key)} aria-invalid={!!err(key)}
          aria-describedby={describedBy(hint && `${uid}-${key}-hint`, !!err(key) && errId(key))} />
      </div>
      {hint && <p id={`${uid}-${key}-hint`} className={hintCls}>{hint}</p>}
      {err(key) && <p id={errId(key)} className={errCls}>{err(key)!.message}</p>}
    </div>
  )

  const slider = (key: 'hikePct' | 'vpfPct' | 'inflationPct', label: string, min: number, max: number, step: number, hint?: string) => (
    <div>
      <label htmlFor={`${uid}-${key}`} className={labelCls}>{label}</label>
      <div className="flex items-center gap-3">
        <input id={`${uid}-${key}`} type="range" min={min} max={max} step={step} value={form[key]}
          onChange={(e) => setField(key, Number(e.target.value))} className="h-11 flex-1 accent-green-700"
          aria-describedby={hint ? `${uid}-${key}-hint` : undefined} aria-valuetext={`${form[key]}%`} />
        <output htmlFor={`${uid}-${key}`} className="min-w-[56px] text-right font-semibold tabular-nums">{form[key]}%</output>
      </div>
      {hint && <p id={`${uid}-${key}-hint`} className={hintCls}>{hint}</p>}
    </div>
  )

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
      {/* ------------------------------ Inputs ------------------------------ */}
      <form className="space-y-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800 lg:sticky lg:top-20" noValidate
        aria-label="Calculator inputs" onSubmit={(e) => e.preventDefault()}>
        <div className="grid grid-cols-2 gap-3">
          {numberField('age', 'Your age', 18, 57)}
          {numberField('retirementAge', 'Retire at', 45, 60)}
        </div>
        {moneyField('basic', 'Monthly Basic + DA', 'PF is calculated on this, not your full CTC.')}
        {slider('hikePct', 'Salary hike each year', 0, 20, 0.5)}
        <div>
          <label htmlFor={`${uid}-month`} className={labelCls}>Appraisal month</label>
          <select id={`${uid}-month`} className={selectCls} value={form.stepUpMonth} onChange={(e) => setField('stepUpMonth', Number(e.target.value))}>
            {APPRAISAL_ORDER.map((m) => <option key={m} value={m}>{MONTHS[m - 1]}</option>)}
          </select>
        </div>
        {moneyField('opening', 'Current PF balance', 'From your EPFO passbook. Enter 0 if you’re just starting.')}
        {slider('vpfPct', 'Voluntary PF (VPF)', 0, 50, 1, 'Extra % of Basic + DA, on top of the mandatory 12%.')}
        <div>
          <Segmented
            label="Interest rate for future years"
            value={form.scenario}
            onChange={chooseScenario}
            options={[
              { value: 'conservative', label: ratePct(params.scenarios.conservative), sub: 'Low' },
              { value: 'base', label: ratePct(params.scenarios.base), sub: 'Current' },
              { value: 'optimistic', label: ratePct(params.scenarios.optimistic), sub: 'High' },
              { value: 'custom', label: 'Custom', sub: 'Your rate' },
            ]}
          />
          {form.scenario === 'custom' && (
            <div className="mt-2.5">
              <label htmlFor={`${uid}-customRate`} className={labelCls}>Custom rate (%)</label>
              <Input id={`${uid}-customRate`} type="number" step={0.05} min={5} max={12} className={inputCls} value={draft.customRate}
                onChange={(e) => setText('customRate', e.target.value)} aria-invalid={!!err('customRate')}
                aria-describedby={describedBy(!!err('customRate') && errId('customRate'))} />
              {err('customRate') && <p id={errId('customRate')} className={errCls}>{err('customRate')!.message}</p>}
            </div>
          )}
        </div>
        {slider('inflationPct', 'Inflation, for today’s-money values', 0, 10, 0.5)}

        <details className="border-t border-gray-200 pt-3 dark:border-gray-700" open={advancedOpen}
          onToggle={(e) => {
            const open = (e.target as HTMLDetailsElement).open
            setAdvancedOpen(open)
            if (open) pfEvents.advancedOpened()
          }}>
          <summary className="flex min-h-[44px] cursor-pointer items-center font-semibold">More options</summary>
          <div className="mt-2 space-y-4">
            <div>
              <Segmented
                label="Your employer pays PF on"
                columns={2}
                value={form.basis}
                onChange={(v) => setField('basis', v)}
                options={[
                  { value: 'capped', label: 'Capped wage', sub: `Up to ${inr(facts.ceiling)}` },
                  { value: 'actual', label: 'Full Basic', sub: 'No cap' },
                ]}
              />
              <p className={hintCls}>Check your payslip: if PF is {inr(facts.maxEe)} a month with Basic above {inr(facts.ceiling)}, it’s capped.</p>
            </div>
            <label className="flex min-h-[44px] items-start gap-3 text-sm">
              <input type="checkbox" className="mt-0.5 h-5 w-5 flex-none accent-green-700" checked={form.epsMember} onChange={(e) => setField('epsMember', e.target.checked)} />
              <span>I’m in the Employees’ Pension Scheme (EPS). Most people are; new joiners with wages above the ceiling are not.</span>
            </label>
            <div>
              <label htmlFor={`${uid}-pastEps`} className={labelCls}>EPS service so far (years)</label>
              <Input id={`${uid}-pastEps`} type="number" min={0} max={40} step={0.5} className={inputCls} value={draft.pastEpsYears}
                onChange={(e) => setText('pastEpsYears', e.target.value)} aria-invalid={!!err('pastEpsYears')}
                aria-describedby={describedBy(!!err('pastEpsYears') && errId('pastEpsYears'))} />
              {err('pastEpsYears') && <p id={errId('pastEpsYears')} className={errCls}>{err('pastEpsYears')!.message}</p>}
            </div>
            <label className="flex min-h-[44px] items-start gap-3 text-sm">
              <input type="checkbox" className="mt-0.5 h-5 w-5 flex-none accent-green-700" checked={form.reduced} onChange={(e) => setField('reduced', e.target.checked)} />
              <span>My employer contributes 10%, not 12% (certain notified industries and units under an approved IBC plan)</span>
            </label>
            <label className="flex min-h-[44px] items-start gap-3 text-sm">
              <input type="checkbox" className="mt-0.5 h-5 w-5 flex-none accent-green-700" checked={form.labourCode} onChange={(e) => setField('labourCode', e.target.checked)} />
              <span>Apply the Labour Code 50% wage rule. Allowances above half your pay are added back to PF wages.</span>
            </label>
            {form.labourCode && moneyField('allowances', 'Other monthly allowances (HRA, special, etc.)')}
            <div>
              <label htmlFor={`${uid}-epsReading`} className={labelCls}>EPS wage ceiling after {fmtDate(facts.ceilingFrom)}</label>
              <select id={`${uid}-epsReading`} className={selectCls} value={form.epsCeilingReading} aria-describedby={`${uid}-epsReading-hint`}
                onChange={(e) => setField('epsCeilingReading', e.target.value as PfState['epsCeilingReading'])}>
                <option value="25000">{inr(params.epsCeiling[params.epsCeiling.length - 1].v)} ({facts.epsPrimarySrc})</option>
                <option value="15000">{inr(facts.epsAlt)} (one reading of {facts.epsAltSrc.replace(/, .*$/, '')})</option>
              </select>
              <p id={`${uid}-epsReading-hint`} className={hintCls}>The {facts.epsAltSrc.replace(/^.*?, /, '')} notification is being read two ways. This changes your pension estimate and the EPF/EPS split.</p>
            </div>
            <div>
              <label htmlFor={`${uid}-timing`} className={labelCls}>Monthly contribution earns interest from</label>
              <select id={`${uid}-timing`} className={selectCls} value={form.interestTiming} onChange={(e) => setField('interestTiming', e.target.value as PfState['interestTiming'])}>
                <option value="next_month">The following month (conservative)</option>
                <option value="same_month">The same month</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor={`${uid}-regime`} className={labelCls}>Tax regime</label>
                <select id={`${uid}-regime`} className={selectCls} value={form.taxRegime} onChange={(e) => setField('taxRegime', e.target.value as PfState['taxRegime'])}>
                  <option value="new">New</option>
                  <option value="old">Old</option>
                </select>
              </div>
              <div>
                <label htmlFor={`${uid}-slab`} className={labelCls}>Tax slab</label>
                <select id={`${uid}-slab`} className={selectCls} value={form.slabPct} onChange={(e) => setField('slabPct', Number(e.target.value) as PfState['slabPct'])}>
                  {SLABS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          </div>
        </details>
      </form>

      {/* ------------------------------ Results ----------------------------- */}
      <section aria-label="Results" className="flex min-w-0 flex-col gap-5">
        <Card className="p-6 dark:border-gray-700 dark:bg-gray-800">
          <p className="max-w-[60ch] text-xl leading-relaxed text-gray-900 dark:text-gray-100 md:text-[22px]" aria-live="polite" data-testid="pf-headline">
            {!res || !head ? (
              'Fix the highlighted inputs to see your forecast.'
            ) : flags.pf_hero_metric === 'return' && head.multiple ? (
              <>Every ₹1 you put in becomes <strong className="text-green-700 dark:text-green-500">{head.multiple}</strong>, a return of {head.xirrOwn} a year on your own money. By {head.ageEnd}, your PF could grow to <strong className="text-green-700 dark:text-green-500">{head.corpus}</strong>, which is {head.realCorpus} in today’s money.</>
            ) : (
              <>By {head.ageEnd}, your PF could grow to <strong className="text-green-700 dark:text-green-500">{head.corpus}</strong>, which is {head.realCorpus} in today’s money.{head.multiple && <> Every ₹1 you put in becomes <strong className="text-green-700 dark:text-green-500">{head.multiple}</strong>, a return of {head.xirrOwn} a year on your own money.</>}</>
            )}
          </p>
          {res && (
            <>
              <dl className="mt-5 grid grid-cols-2 border-t border-gray-200 dark:border-gray-700 sm:grid-cols-4">
                {statList.map((s) => (
                  <div key={s.label} className="flex flex-col pr-3 pt-3.5">
                    <dt className="text-sm text-gray-600 dark:text-gray-400">{s.label}</dt>
                    <dd className="order-first text-[22px] font-bold tabular-nums">{s.value}</dd>
                  </div>
                ))}
              </dl>
              <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Compare interest rate scenarios">
                {computed.scen.map((s) => (
                  <button key={s.key} type="button" aria-pressed={s.key === valid.scenario} onClick={() => chooseScenario(s.key)}
                    className={`min-h-[44px] rounded-lg px-3 py-2 text-left text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-700 ${
                      s.key === valid.scenario ? 'border-2 border-green-700 bg-green-50 dark:bg-green-900/30' : 'border border-gray-300 bg-gray-50 dark:border-gray-600 dark:bg-gray-900'
                    }`}>
                    <span>{scenarioLabel(s.key, params, valid.customRate)}</span>
                    <b className="block tabular-nums">{compact(s.corpus)}</b>
                  </button>
                ))}
              </div>
            </>
          )}
        </Card>

        {calloutList.length > 0 && (
          <div className="flex flex-col gap-2.5" aria-live="polite">
            {calloutList.map((c) => (
              <div key={c.id} data-callout={c.id} className="rounded-lg border border-amber-200 bg-amber-50 px-3.5 py-3 text-sm text-gray-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-gray-100">
                <strong className="text-amber-800 dark:text-amber-300">{c.title}</strong> {c.body}
              </div>
            ))}
          </div>
        )}

        {res && (
          <>
            <Card className="p-5 dark:border-gray-700 dark:bg-gray-800">
              <div className="mb-2.5 flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-lg font-bold">How your PF builds up</h2>
                <div role="group" aria-label="Value basis" className="grid grid-cols-2 gap-1.5">
                  {(['nominal', 'real'] as const).map((v) => (
                    <button key={v} type="button" aria-pressed={valid.view === v} onClick={() => setView(v)}
                      className={`min-h-[44px] rounded-lg border-2 px-3.5 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-700 focus-visible:ring-offset-2 ${
                        valid.view === v ? 'border-green-700 bg-green-700 text-white' : 'border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-900'
                      }`}>
                      {v === 'nominal' ? 'Future ₹' : 'Today’s ₹'}
                    </button>
                  ))}
                </div>
              </div>
              <div className="mb-2 flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400" aria-hidden="true">
                <span><i className="mr-1.5 inline-block h-3 w-3 rounded-sm bg-blue-800 align-[-1px] dark:bg-blue-400" />Your contributions</span>
                <span><i className="mr-1.5 inline-block h-3 w-3 rounded-sm bg-blue-400 align-[-1px] dark:bg-blue-200" />Employer’s share to PF</span>
                <span><i className="mr-1.5 inline-block h-3 w-3 rounded-sm bg-green-700 align-[-1px] dark:bg-green-500" />Interest earned</span>
              </div>
              <div ref={chartRef}>
                <PfChart points={points} />
              </div>
            </Card>

            <div className="grid gap-4 md:grid-cols-3">
              <Card className="p-5 dark:border-gray-700 dark:bg-gray-800">
                <h3 className="text-[15px] font-semibold">Pension from EPS</h3>
                <div className="my-1 text-2xl font-bold tabular-nums" data-testid="pf-pension">{res.pension != null ? `${inr(res.pension)} / month` : 'None'}</div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{res.pensionNote}</p>
              </Card>
              <Card className="p-5 dark:border-gray-700 dark:bg-gray-800">
                <h3 className="text-[15px] font-semibold">Life cover (EDLI)</h3>
                <div className="my-1 text-2xl font-bold tabular-nums">{res.edliCover != null ? inr(res.edliCover) : '—'}</div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Paid to your nominee by EPFO if you die in service. No premium from you.</p>
              </Card>
              <Card className="p-5 dark:border-gray-700 dark:bg-gray-800">
                <h3 className="text-[15px] font-semibold">Employer’s monthly cost</h3>
                <div className="my-1 text-2xl font-bold tabular-nums">{res.first ? inr(res.first.empCost) : '—'}</div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{employerCostNote(res)}</p>
              </Card>
            </div>

            {/* Actions */}
            <Card className="p-5 dark:border-gray-700 dark:bg-gray-800">
              <h2 className="mb-3 text-lg font-bold">Keep or share this forecast</h2>
              <div className="flex flex-wrap gap-2">
                <Button type="button" onClick={onPdfClick} disabled={busy === 'pdf'} className="min-h-[44px] bg-green-700 text-white hover:bg-green-800">
                  {busy === 'pdf' ? 'Preparing PDF…' : 'Download PDF'}
                </Button>
                <Button type="button" variant="outline" onClick={downloadCsv} className="min-h-[44px]">Download CSV</Button>
                <Button type="button" variant="outline" onClick={createShare} disabled={busy === 'share'} className="min-h-[44px]">
                  {busy === 'share' ? 'Creating link…' : 'Share'}
                </Button>
                <Button type="button" variant="outline" className="min-h-[44px]" onClick={() => (isLoggedIn ? setSavePrompt(true) : setSaveMsg('Sign in to save your calculation.'))}>
                  Save
                </Button>
              </div>

              {shareUrl && (
                <div className="mt-3 space-y-2">
                  <label htmlFor={`${uid}-share`} className={labelCls}>Share link (valid for 90 days)</label>
                  <Input id={`${uid}-share`} readOnly value={shareUrl} className={inputCls} onFocus={(e) => e.target.select()} />
                  <div className="flex flex-wrap gap-2">
                    <Button type="button" variant="outline" className="min-h-[44px]" onClick={copyShare}>Copy link</Button>
                    <a className="inline-flex min-h-[44px] items-center rounded-md border border-input px-4 text-sm font-medium hover:bg-accent" target="_blank" rel="noopener noreferrer"
                      href={`https://wa.me/?text=${encodeURIComponent(`My PF forecast — ComplianceCheck ${shareUrl}`)}`} onClick={() => pfEvents.shareClicked({ channel: 'whatsapp' })}>
                      WhatsApp
                    </a>
                    <a className="inline-flex min-h-[44px] items-center rounded-md border border-input px-4 text-sm font-medium hover:bg-accent" target="_blank" rel="noopener noreferrer"
                      href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`} onClick={() => pfEvents.shareClicked({ channel: 'linkedin' })}>
                      LinkedIn
                    </a>
                  </div>
                </div>
              )}
              {shareMsg && <p role="status" className="mt-2 text-sm text-gray-700 dark:text-gray-300">{shareMsg}</p>}

              {savePrompt && isLoggedIn && (
                <div className="mt-3 flex flex-wrap items-end gap-2">
                  <div className="min-w-[200px] flex-1">
                    <label htmlFor={`${uid}-saveName`} className={labelCls}>Name this calculation</label>
                    <Input id={`${uid}-saveName`} className={inputCls} value={saveName} maxLength={120} onChange={(e) => setSaveName(e.target.value)} />
                  </div>
                  <Button type="button" onClick={save} disabled={busy === 'save' || !saveName.trim()} className="min-h-[44px] bg-green-700 text-white hover:bg-green-800">
                    {busy === 'save' ? 'Saving…' : 'Save'}
                  </Button>
                </div>
              )}
              {saveMsg && (
                <p role="status" className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                  {saveMsg}{' '}
                  {saveMsg.startsWith('Sign in') && (
                    <><Link href={loginHref} className="font-medium text-green-700 underline dark:text-green-500">Sign in</Link> or <Link href="/register" className="font-medium text-green-700 underline dark:text-green-500">create a free account</Link>.</>
                  )}
                </p>
              )}
            </Card>

            {flags.pf_employer_view_cta === 'on' && (
              <Card className="border-green-700/40 p-5 dark:border-green-800 dark:bg-gray-800">
                <h2 className="text-lg font-bold">Running payroll for a team?</h2>
                <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">Get the employer pack: what the {inr(facts.ceiling)} ceiling does to your PF cost per employee, and the filings to check.</p>
                <Button type="button" className="mt-3 min-h-[44px] bg-green-700 text-white hover:bg-green-800" onClick={() => setLead({ open: true, purpose: 'employer_pack' })}>
                  Get the employer pack
                </Button>
              </Card>
            )}

            {/* Year table — also the chart's text alternative */}
            <Card className="p-5 dark:border-gray-700 dark:bg-gray-800">
              <h2 id={`${uid}-table-h`} className="mb-3 text-lg font-bold">Year by year</h2>
              <div className="max-h-[460px] overflow-auto rounded-lg border border-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-700 dark:border-gray-700"
                tabIndex={0} role="region" aria-labelledby={`${uid}-table-h`}>
                <table className="w-full border-collapse text-sm" data-testid="pf-year-table">
                  <caption className="sr-only">PF balance by financial year: contributions, interest and balance, in future and today’s rupees.</caption>
                  <thead>
                    <tr>
                      {TABLE_HEADERS.map((h, i) => (
                        <th key={h} scope="col" className={`sticky top-0 z-[1] whitespace-nowrap border-b border-gray-200 bg-gray-100 px-3 py-2 text-[13px] font-semibold text-gray-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 ${i === 0 ? 'text-left' : 'text-right'}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {res.rows.map((r) => (
                      <tr key={r.fy} className="hover:bg-gray-50 dark:hover:bg-gray-900/60">
                        {tableRow(r).map((cell, i) =>
                          i === 0 ? (
                            <th key={i} scope="row" className="whitespace-nowrap border-b border-gray-200 px-3 py-2 text-left font-normal dark:border-gray-700">{cell}</th>
                          ) : (
                            <td key={i} className="whitespace-nowrap border-b border-gray-200 px-3 py-2 text-right tabular-nums dark:border-gray-700">{cell}</td>
                          )
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </>
        )}
      </section>

      {/* -------------------------- Methodology & sources -------------------------- */}
      <section className="lg:col-span-2" aria-labelledby={`${uid}-method-h`}>
        <h2 id={`${uid}-method-h`} className="mb-3 text-xl font-bold">How this is calculated</h2>
        <Card className="p-5 text-[15px] text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
          <p className="mb-2.5 max-w-[80ch]">
            The calculator steps through every month until you retire. Each month, you put in 12% of your PF wage (plus any VPF). Your employer’s 12% is split: {facts.epsShare} of wages up to the ceiling goes to your pension (EPS), and the rest goes to your PF.
          </p>
          <ul className="mb-2.5 max-w-[80ch] list-disc space-y-1 pl-5">
            <li>Your salary rises by the hike % in your appraisal month each year. If your employer caps PF at {inr(facts.ceiling)}, raises above that don’t increase your PF.</li>
            <li>Interest is worked out monthly on your running balance but added only on 31 March, as EPFO does. That’s why the effective return comes out slightly under the declared rate.</li>
            <li>Past years use declared rates ({ratePct(facts.latestRate)} for FY {facts.latestFy}). Future years use the rate you choose. EPFO declares the rate every year, so it isn’t guaranteed.</li>
            <li><em>Return on your money</em> is the yearly rate at which only what you put in (opening balance plus your contributions) grows into the final corpus. It’s higher than the PF rate because your employer’s share comes free. In the old regime, it counts your 80C tax saving.</li>
            <li>Interest on your own contributions above {lakh(facts.taxThreshold)} a year is taxable. We track that portion separately and show the tax at your slab.</li>
            <li>EPS pension = pensionable salary × years of service ÷ 70, capped at the ceiling for each period, with 2 bonus years if you serve 20+ years to 58. Minimum {inr(facts.epsMinPension)} a month. The EPS 2026 paragraph text is still being confirmed, so treat this as an estimate.</li>
          </ul>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <caption className="sr-only">Statutory values used, with sources and dates</caption>
              <thead>
                <tr className="text-left text-gray-600 dark:text-gray-400">
                  <th scope="col" className="border-b border-gray-200 px-2 py-2 dark:border-gray-700">Value</th>
                  <th scope="col" className="border-b border-gray-200 px-2 py-2 dark:border-gray-700">Used here</th>
                  <th scope="col" className="border-b border-gray-200 px-2 py-2 dark:border-gray-700">Source</th>
                  <th scope="col" className="border-b border-gray-200 px-2 py-2 dark:border-gray-700">Effective</th>
                  <th scope="col" className="border-b border-gray-200 px-2 py-2 dark:border-gray-700">Verified</th>
                </tr>
              </thead>
              <tbody>
                {sources.map((s, i) => (
                  <tr key={`${s.value}-${i}`} className="align-top">
                    <td className="border-b border-gray-200 px-2 py-2 dark:border-gray-700">{s.value}</td>
                    <td className="border-b border-gray-200 px-2 py-2 tabular-nums dark:border-gray-700">{s.used}</td>
                    <td className="border-b border-gray-200 px-2 py-2 dark:border-gray-700">{s.source}</td>
                    <td className="border-b border-gray-200 px-2 py-2 dark:border-gray-700">{s.effective}</td>
                    <td className="border-b border-gray-200 px-2 py-2 dark:border-gray-700">{s.verified}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
            Future interest rates are assumptions, not guarantees. Engine v{ENGINE_VERSION} · params {params.version}
            {loaded.fromFallback && ' (offline copy)'}.
          </p>
        </Card>
      </section>

      <PfLeadDialog
        open={lead.open}
        purpose={lead.purpose}
        gate={flags.pf_pdf_gate === 'required' ? 'required' : 'optional'}
        sessionId={sessionId}
        ceilingLabel={inr(facts.ceiling)}
        onOpenChange={(open) => setLead((l) => ({ ...l, open }))}
        onDone={onLeadDone}
      />
    </div>
  )
}
