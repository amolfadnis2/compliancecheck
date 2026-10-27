import { describe, it, expect, vi } from 'vitest'

// The module reads through next/cache + the admin client; the pure helpers
// under test touch neither.
vi.mock('next/cache', () => ({ unstable_cache: (fn: unknown) => fn }))
vi.mock('@/lib/supabase/admin', () => ({ createAdminClient: () => { throw new Error('no db in tests') } }))

import { aggregatePeers, categoryPercentages, getPeerAverages, MIN_PEERS, type PeerRow } from '@/lib/benchmarks/peer-averages'

function rows(n: number, make: (i: number) => Partial<PeerRow>): PeerRow[] {
  return Array.from({ length: n }, (_, i) => ({ id: `r${i}`, overall_score: 50, scores: {}, ...make(i) }))
}

describe('categoryPercentages', () => {
  it('normalises every stored score shape', () => {
    expect(categoryPercentages({ wages: 40 })).toEqual({ wages: 40 })
    expect(categoryPercentages({ pf: { percentage: 55 } })).toEqual({ pf: 55 })
    expect(categoryPercentages({ FSSAI: { score: 3, maxScore: 4 } })).toEqual({ FSSAI: 75 })
    expect(categoryPercentages({ pf: { score: 1, max: 2 } })).toEqual({ pf: 50 })
    expect(categoryPercentages([{ category: 'icc', categoryName: 'ICC Constitution', percentage: 80 }]))
      .toEqual({ 'ICC Constitution': 80 })
    expect(categoryPercentages([{ phase: 2, phaseName: 'Statutory', score: 64 }])).toEqual({ '2': 64 })
    expect(categoryPercentages(null)).toEqual({})
  })

  it('keeps a genuine 0% score', () => {
    expect(categoryPercentages({ pf: { percentage: 0 } })).toEqual({ pf: 0 })
  })
})

describe('aggregatePeers', () => {
  it('returns null below the minimum peer count', () => {
    expect(aggregatePeers(rows(MIN_PEERS - 1, () => ({ scores: { pf: 50 } })), {})).toBeNull()
  })

  it('excludes the user’s own assessment from the pool', () => {
    const pool = rows(MIN_PEERS, () => ({ scores: { pf: 50 } }))
    expect(aggregatePeers(pool, { excludeId: 'r0' })).toBeNull()
  })

  it('averages categories and the overall score across all peers', () => {
    const pool = rows(MIN_PEERS, (i) => ({ overall_score: i % 2 ? 40 : 60, scores: { pf: i % 2 ? 20 : 80 } }))
    expect(aggregatePeers(pool, {})).toEqual({
      sampleSize: MIN_PEERS, scope: 'all', industry: undefined, overallAverage: 50, categories: { pf: 50 },
    })
  })

  it('narrows to the user’s industry only when it has enough peers', () => {
    const pool = [
      ...rows(MIN_PEERS, (i) => ({ id: `it${i}`, industry: 'it', scores: { pf: 90 } })),
      ...rows(MIN_PEERS, (i) => ({ id: `mf${i}`, industry: 'manufacturing', scores: { pf: 10 } })),
    ]
    expect(aggregatePeers(pool, { industry: 'it' })).toMatchObject({ scope: 'industry', industry: 'it', categories: { pf: 90 } })
    // 'retail' has no peers -> fall back to everyone
    expect(aggregatePeers(pool, { industry: 'retail' })).toMatchObject({ scope: 'all', categories: { pf: 50 } })
  })

  it('drops a category too few peers answered', () => {
    const pool = rows(MIN_PEERS, (i) => ({ scores: i < 3 ? { pf: 50, rare: 10 } : { pf: 50 } }))
    expect(aggregatePeers(pool, {})?.categories).toEqual({ pf: 50 })
  })
})

describe('getPeerAverages', () => {
  it('returns null (comparison hidden) when the database is unavailable', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(await getPeerAverages('statutory_health')).toBeNull()
    spy.mockRestore()
  })
})
