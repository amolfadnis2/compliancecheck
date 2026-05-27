import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Statutory Health Check | PF, ESI, PT, Gratuity & Bonus Compliance | ComplianceCheck',
  description: 'Quick 10-minute assessment for PF, ESI, Professional Tax, Gratuity & Bonus compliance. Get instant compliance score and action items.',
  alternates: {
    canonical: 'https://compliancecheck.co.in/assessment/statutory-health',
  },
  openGraph: {
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
