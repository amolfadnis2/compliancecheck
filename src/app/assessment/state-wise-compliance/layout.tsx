import type { Metadata } from 'next'
import { DEFAULT_OPEN_GRAPH } from '@/lib/seo/site'

export const metadata: Metadata = {
  robots: { index: false, follow: true },
  title: 'State-Wise Compliance Check | Professional Tax, LWF, S&E Act | ComplianceCheck',
  description: 'Find out exactly what compliance requirements apply in your state. Professional Tax, Labour Welfare Fund, Shops & Establishments Act, and more.',
  alternates: {
    canonical: 'https://compliancecheck.co.in/assessment/state-wise-compliance',
  },
  openGraph: {
    ...DEFAULT_OPEN_GRAPH,
    title: 'State-Wise Compliance Check | ComplianceCheck',
    description: 'State-specific compliance requirements for Indian businesses. 36 states & UTs, 20+ compliance areas.',
    type: 'website',
    url: 'https://compliancecheck.co.in/assessment/state-wise-compliance',
    siteName: 'ComplianceCheck',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
