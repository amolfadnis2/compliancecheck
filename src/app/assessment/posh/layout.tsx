import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'POSH Act 2013 Compliance | ICC Audit & Workplace Safety | ComplianceCheck',
  description: 'Complete POSH Act compliance assessment. ICC constitution audit, policy review, complaint mechanism check, and annual report requirements.',
  alternates: {
    canonical: 'https://compliancecheck.co.in/assessment/posh',
  },
  openGraph: {
    title: 'POSH Act 2013 Compliance | ComplianceCheck',
    description: 'Prevention of Sexual Harassment compliance assessment. ICC audit, policy review, and compliance roadmap.',
    type: 'website',
    url: 'https://compliancecheck.co.in/assessment/posh',
    siteName: 'ComplianceCheck',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
