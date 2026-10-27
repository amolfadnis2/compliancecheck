import type { Metadata } from 'next'
import { DEFAULT_OPEN_GRAPH } from '@/lib/seo/site'

export const metadata: Metadata = {
  robots: { index: false, follow: true },
  title: 'Statutory Health Check | PF, ESI, PT, Gratuity & Bonus Compliance | ComplianceCheck',
  description: 'Quick 10-minute assessment for PF, ESI, Professional Tax, Gratuity & Bonus compliance. Get instant compliance score and action items.',
  alternates: {
    canonical: 'https://compliancecheck.co.in/assessment/statutory-health',
  },
  openGraph: {
    ...DEFAULT_OPEN_GRAPH,
    title: 'Statutory Health Check | ComplianceCheck',
    description: 'Quick 10-minute compliance assessment for Indian SMEs. Check PF, ESI, PT, Gratuity & Bonus status instantly.',
    type: 'website',
    url: 'https://compliancecheck.co.in/assessment/statutory-health',
    siteName: 'ComplianceCheck',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
