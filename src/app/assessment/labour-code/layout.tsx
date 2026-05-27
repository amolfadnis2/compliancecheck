import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Labour Code Readiness Assessment | 4 New Labour Codes 2025 | ComplianceCheck',
  description: "Prepare for India's 4 new Labour Codes. Get implementation cost estimates, gap analysis, and an action plan before the deadline.",
  alternates: {
    canonical: 'https://compliancecheck.co.in/assessment/labour-code',
  },
  openGraph: {
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
