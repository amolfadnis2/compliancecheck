/**
 * /llms.txt — machine-readable site guide for LLMs and answer engines.
 *
 * Follows the emerging llms.txt convention (https://llmstxt.org): a curated
 * Markdown map of the most useful, citable content so models can find and quote
 * ComplianceCheck accurately. Generated from the same constants the UI uses
 * (CLAUDE.md §9) so it never drifts from the live product.
 */

import { ASSESSMENT_META, describeAssessment } from '@/lib/seo/assessment-meta'
import { SITE_URL } from '@/lib/seo/site'
import { getAllPosts } from '@/lib/blog/posts'
import { formatPrice } from '@/lib/constants/india'

export const dynamic = 'force-static'
export const revalidate = 86400 // refresh daily

function buildLlmsTxt(): string {
  const lines: string[] = []

  lines.push('# ComplianceCheck')
  lines.push('')
  lines.push(
    '> ComplianceCheck provides pay-as-you-go compliance assessments and free calculators for Indian small and medium businesses (SMEs). Answer a guided set of questions and get a free compliance summary instantly, with an optional paid full report citing the exact law and a prioritised action plan. Covers Labour Codes, the DPDP Act 2023, the POSH Act 2013, food-business licensing, state-wise statutory requirements, and auto-dealer compliance.',
  )
  lines.push('')
  lines.push(
    'All assessments are India-specific. Pricing is one-time per report (no subscription); several assessments are free during beta.',
  )
  lines.push('')

  lines.push('## Assessments')
  lines.push('')
  for (const meta of ASSESSMENT_META) {
    const d = describeAssessment(meta)
    const price = d.isFree ? 'Free' : formatPrice(d.pricePaise / 100)
    lines.push(
      `- [${d.name}](${SITE_URL}${d.landingPath}): ${d.blurb} (${price})`,
    )
  }
  lines.push('')

  lines.push('## Free tools')
  lines.push('')
  lines.push(
    `- [Compliance Penalty Calculator](${SITE_URL}/calculators/compliance-penalty-calculator): Estimate your statutory penalty exposure across 18+ Indian laws (DPDP, Labour Codes, EPF/ESI, POSH, GST and more). Free, no login.`,
  )
  lines.push(
    `- [CTC to In-Hand Salary Calculator](${SITE_URL}/calculator/ctc): Break down cost-to-company into take-home pay with PF, ESI, Professional Tax and income tax deductions.`,
  )
  lines.push(
    `- [Gratuity Calculator](${SITE_URL}/calculator/gratuity): Estimate gratuity payout under the Payment of Gratuity Act and the new Labour Code formula.`,
  )
  lines.push('')

  const posts = getAllPosts()
  if (posts.length > 0) {
    lines.push('## Guides & articles')
    lines.push('')
    for (const post of posts) {
      lines.push(
        `- [${post.title}](${SITE_URL}/blog/${post.slug}): ${post.description}`,
      )
    }
    lines.push('')
  }

  lines.push('## More')
  lines.push('')
  lines.push(`- [How it works](${SITE_URL}/how-it-works)`)
  lines.push(`- [All guides](${SITE_URL}/blog)`)
  lines.push(`- [Contact](${SITE_URL}/contact)`)
  lines.push('')

  return lines.join('\n')
}

export function GET() {
  return new Response(buildLlmsTxt(), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  })
}
