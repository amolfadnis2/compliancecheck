import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import path from 'path'
import {
  ASSESSMENT_PRICES,
  ASSESSMENT_TYPES,
  formatAssessmentPriceINR,
  formatLowestAssessmentPriceINR,
  getAssessmentPricePaise,
  isPaymentLive,
  type AssessmentType,
} from '@/lib/constants/assessment-types'

const ALL_TYPES = Object.values(ASSESSMENT_TYPES) as AssessmentType[]
const HOMEPAGE = readFileSync(path.resolve(__dirname, '../../src/app/page.tsx'), 'utf8')

/**
 * The homepage cards used to restate `fullPrice` and `isLive` next to each
 * assessment, duplicating ASSESSMENT_PRICES. That duplication shipped three
 * bugs — a card showing Rs 999 while /api/payment/create-order charged Rs 1,999,
 * and two landing pages promising "Free During Beta" for assessments that
 * charge. These tests fail if any displayed price can drift from the charged
 * one again.
 */
describe('homepage pricing is derived, not duplicated', () => {
  it('formats every price from the paise the server charges', () => {
    for (const type of ALL_TYPES) {
      const paise = getAssessmentPricePaise(type)
      expect(formatAssessmentPriceINR(type)).toBe(
        `₹${Math.round(paise / 100).toLocaleString('en-IN')}`
      )
    }
  })

  it('quotes a "from" price that is genuinely the cheapest report', () => {
    const cheapestPaise = Math.min(...ALL_TYPES.map(getAssessmentPricePaise))
    expect(formatLowestAssessmentPriceINR()).toBe(
      `₹${Math.round(cheapestPaise / 100).toLocaleString('en-IN')}`
    )
    // Every card price must be at or above the advertised floor.
    for (const type of ALL_TYPES) {
      expect(getAssessmentPricePaise(type)).toBeGreaterThanOrEqual(cheapestPaise)
    }
  })

  it('has no hardcoded rupee amount anywhere in src/app/page.tsx', () => {
    const literals = HOMEPAGE.match(/₹\s*[\d,]+/g) ?? []
    expect(literals).toEqual([])
  })

  it('no longer carries per-card fullPrice or isLive fields', () => {
    expect(HOMEPAGE).not.toMatch(/\bfullPrice\b/)
    expect(HOMEPAGE).not.toMatch(/\bisLive\b/)
  })

  it('gives every assessment card a type drawn from ASSESSMENT_TYPES', () => {
    const declared = [...HOMEPAGE.matchAll(/type: ASSESSMENT_TYPES\.(\w+)/g)].map((m) => m[1])
    const expected = Object.keys(ASSESSMENT_PRICES).map(
      (value) =>
        Object.entries(ASSESSMENT_TYPES).find(([, v]) => v === value)![0]
    )
    expect(declared.sort()).toEqual(expected.sort())
  })

  it('derives the card price and early-access badge from the constants module', () => {
    expect(HOMEPAGE).toMatch(/Full report: \{formatAssessmentPriceINR\(assessment\.type\)\}/)
    expect(HOMEPAGE).toMatch(/isPaymentLive\(assessment\.type\)/)
  })

  it('shows the early-access badge exactly for assessments whose payment is not live', () => {
    // Guards the semantics the card relies on: badge shown iff not live.
    for (const type of ALL_TYPES) {
      expect(isPaymentLive(type)).toBe(ASSESSMENT_PRICES[type].live)
    }
  })
})
