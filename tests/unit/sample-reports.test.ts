import { describe, it, expect } from 'vitest'
import { buildSampleReport, SAMPLE_REPORT_BUILDERS } from '@/lib/pdf/sample-report-fixtures'
import {
  SAMPLE_REPORT_SLUGS,
  getSampleReportPath,
  hasSampleReport,
} from '@/lib/pdf/sample-report-paths'
import { generateUnifiedReportBytes } from '@/lib/pdf/unified-report-generator'
import { ASSESSMENT_TYPES } from '@/lib/constants/assessment-types'

/**
 * The sample reports are a public sales asset built from the real scoring
 * functions and rules. These tests guard the two ways they can silently rot:
 * a question/rule change that empties the report, and a scoring change that
 * pushes the demo score to an unusable extreme (0% or 100% shows a buyer
 * nothing).
 */
describe('sample reports', () => {
  const entries = Object.entries(SAMPLE_REPORT_SLUGS)

  it('covers every assessment that has a live paywall', () => {
    expect(hasSampleReport(ASSESSMENT_TYPES.STATUTORY_HEALTH)).toBe(true)
    expect(hasSampleReport(ASSESSMENT_TYPES.DPDP)).toBe(true)
    expect(hasSampleReport(ASSESSMENT_TYPES.POSH)).toBe(true)
  })

  /**
   * The slugs (light module, safe for pages) and the builders (pulls in jsPDF)
   * are deliberately in separate files. A slug with no builder would 404 from a
   * link we advertise, so keep them in lockstep.
   */
  it('has a builder for every advertised slug, and vice versa', () => {
    const slugTypes = Object.values(SAMPLE_REPORT_SLUGS).sort()
    const builderTypes = Object.keys(SAMPLE_REPORT_BUILDERS).sort()
    expect(slugTypes).toEqual(builderTypes)
  })

  it.each(entries)('%s builds a credible, clearly-marked report', (slug, type) => {
    const data = buildSampleReport(type)
    expect(data).not.toBeNull()
    if (!data) return

    // Always flagged as a sample — this drives the cover banner that stops a
    // fictional demo being mistaken for a real company's assessment.
    expect(data.isSample).toBe(true)
    expect(data.userDetails.companyName).toContain('Demo')

    // A mid-range score: a sample at 0% or 100% demonstrates nothing.
    expect(data.overallScore).toBeGreaterThanOrEqual(30)
    expect(data.overallScore).toBeLessThanOrEqual(85)

    // Must show both what is wrong and what is right, with real remediation.
    expect(data.actionItems.length).toBeGreaterThanOrEqual(3)
    expect(data.compliantItems.length).toBeGreaterThanOrEqual(3)
    expect(data.categoryScores.length).toBeGreaterThanOrEqual(4)
    expect(data.actionItems[0].remediation.length).toBeGreaterThan(0)
    expect(data.actionItems[0].title.length).toBeGreaterThan(0)

    // And it must actually render.
    const bytes = generateUnifiedReportBytes(data)
    expect(bytes.length).toBeGreaterThan(10_000)

    expect(getSampleReportPath(type)).toBe(`/api/sample-report/${slug}`)
  })

  it('returns null for an assessment with no sample', () => {
    expect(buildSampleReport(ASSESSMENT_TYPES.AUTO_DEALER)).toBeNull()
    expect(getSampleReportPath(ASSESSMENT_TYPES.AUTO_DEALER)).toBeNull()
  })
})
