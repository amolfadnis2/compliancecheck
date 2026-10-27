import type { Metadata } from 'next'
import { DEFAULT_OPEN_GRAPH } from '@/lib/seo/site'

export const metadata: Metadata = {
  robots: { index: false, follow: true },
  title: 'Labour Code Readiness Assessment | 4 Labour Codes in Force | ComplianceCheck',
  description: "Prepare for India's 4 new Labour Codes. Get implementation cost estimates, gap analysis, and an action plan to close your gaps.",
  alternates: {
    canonical: 'https://compliancecheck.co.in/assessment/labour-code',
  },
  openGraph: {
    ...DEFAULT_OPEN_GRAPH,
    title: 'Labour Code Readiness Assessment | ComplianceCheck',
    description: 'Are you ready for the 4 new Labour Codes? Assessment with cost estimates and implementation roadmap.',
    type: 'website',
    url: 'https://compliancecheck.co.in/assessment/labour-code',
    siteName: 'ComplianceCheck',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
