import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'DPDP Act 2023 Gap Assessment | Data Protection Compliance | ComplianceCheck',
  description: 'Comprehensive DPDP Act 2023 compliance assessment. 6-phase evaluation with maturity scoring, gap analysis, and a prioritised remediation roadmap.',
  alternates: {
    canonical: 'https://compliancecheck.co.in/assessment/dpdp',
  },
  openGraph: {
    title: 'DPDP Gap Assessment | ComplianceCheck',
    description: "India's first data protection law. Assess your readiness with our 45-question gap analysis.",
    type: 'website',
    url: 'https://compliancecheck.co.in/assessment/dpdp',
    siteName: 'ComplianceCheck',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
