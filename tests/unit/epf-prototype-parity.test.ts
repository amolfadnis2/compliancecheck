import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import path from 'path'
import { project, FALLBACK_PARAMS, type ProjectInput } from '@/lib/calculators/epf'

/**
 * Parity with the approved prototype: runs the prototype's own engine (the
 * first <script> in docs/prototypes/pf-calculator.html) and the TypeScript
 * port on the same random inputs and requires identical results.
 */
const html = readFileSync(path.resolve(__dirname, '../../docs/prototypes/pf-calculator.html'), 'utf8')
const start = html.indexOf('<script>') + '<script>'.length
const src = html.slice(start, html.indexOf('</script>', start))
// eslint-disable-next-line @typescript-eslint/no-implied-eval
const proto = new Function(`${src}; return { project, goldenTests };`)() as {
  project: (i: Record<string, unknown>) => { corpus: number; rows: { closing: number; ee: number; eps: number }[]; pension: number | null; edliCover: number | null; xirrOwn: number | null; flags: object }
  goldenTests: () => { id: string; pass: boolean }[]
}

function rng(seed: number) {
  let s = seed >>> 0
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 2 ** 32)
}

describe('prototype parity', () => {
  it('the prototype passes its own goldens', () => {
    expect(proto.goldenTests().every((t) => t.pass)).toBe(true)
  })

  it('port matches the prototype exactly on 300 random inputs', () => {
    const r = rng(12345)
    const pick = <T,>(xs: T[]) => xs[Math.floor(r() * xs.length)]
    for (let k = 0; k < 300; k++) {
      const age = 18 + Math.floor(r() * 40)
      const inp: ProjectInput = {
        age,
        retirementAge: Math.min(60, age + 1 + Math.floor(r() * 30)),
        startY: pick([2025, 2026, 2027]),
        startM: 1 + Math.floor(r() * 12),
        basic: 5000 + Math.round(r() * 200000),
        allowances: Math.round(r() * 80000),
        hikePct: Math.round(r() * 40) / 2,
        stepUpMonth: 1 + Math.floor(r() * 12),
        opening: Math.round(r() * 2000000),
        vpfPct: pick([0, 0, 5, 10]),
        scenario: pick(['conservative', 'base', 'optimistic', 'custom'] as const),
        customRate: 5 + Math.round(r() * 140) / 20,
        inflationPct: Math.round(r() * 20) / 2,
        basis: pick(['capped', 'actual'] as const),
        epsMember: r() > 0.2,
        pastEpsYears: Math.round(r() * 20) / 2,
        contributionRate: pick([0.12, 0.12, 0.1] as const),
        labourCode: r() > 0.7,
        epsCeilingReading: pick(['25000', '15000'] as const),
        interestTiming: pick(['next_month', 'same_month'] as const),
        taxRegime: pick(['new', 'old'] as const),
        slabPct: pick([0, 5, 10, 20, 30]),
        rounding: pick(['rupee', 'paise'] as const),
      }
      const a = project(inp, FALLBACK_PARAMS)
      const b = proto.project(inp as unknown as Record<string, unknown>)
      expect(a.corpus, `case ${k}`).toBe(b.corpus)
      expect(a.rows.map((x) => [x.closing, x.ee, x.eps])).toEqual(b.rows.map((x) => [x.closing, x.ee, x.eps]))
      expect(a.pension).toBe(b.pension)
      expect(a.edliCover).toBe(b.edliCover)
      expect(a.xirrOwn).toBe(b.xirrOwn)
      expect(a.flags).toEqual(b.flags)
    }
  })
})
