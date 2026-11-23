/**
 * Launches to announce in the weekly newsletter -- new calculators,
 * assessments and features. Blog posts are picked up automatically from
 * content/blog (by their `date`), so do NOT list them here.
 *
 * Add one line when something ships. An entry goes into the issue built in
 * the 7 days after its `date` (IST), then drops out on its own.
 *
 * Example:
 *   {
 *     date: '2026-11-10',
 *     kind: 'calculator',
 *     title: 'Bonus Calculator',
 *     description: 'Work out statutory bonus under the Code on Wages in seconds.',
 *     href: '/calculator/bonus',
 *   },
 */

export type WhatsNewKind = 'calculator' | 'assessment' | 'feature'

export interface WhatsNewItem {
  /** Launch date, 'YYYY-MM-DD'. */
  date: string
  kind: WhatsNewKind
  title: string
  description: string
  /** Site-relative path ('/calculator/pf') or absolute URL. */
  href: string
}

export const WHATS_NEW: WhatsNewItem[] = []
