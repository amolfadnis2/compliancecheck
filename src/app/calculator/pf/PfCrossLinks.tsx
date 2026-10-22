'use client'

import Link from 'next/link'
import { pfEvents } from '@/lib/analytics/pf-events'

const LINKS = [
  { href: '/calculator/gratuity', label: 'Gratuity calculator', target: 'gratuity' },
  { href: '/calculator/ctc', label: 'CTC to in-hand calculator', target: 'ctc' },
  { href: '/assessments/landing/statutory-health-check', label: 'Check your company’s PF compliance', target: 'statutory_health' },
]

export function PfCrossLinks() {
  return (
    <nav aria-label="Related tools" className="flex flex-wrap gap-3">
      {LINKS.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          onClick={() => pfEvents.crossLinkClicked({ target: l.target })}
          className="inline-flex min-h-[44px] items-center rounded-lg border-2 border-gray-300 px-4 font-medium text-gray-900 hover:border-green-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-700 focus-visible:ring-offset-2 dark:border-gray-600 dark:text-gray-100"
        >
          {l.label}
        </Link>
      ))}
    </nav>
  )
}
