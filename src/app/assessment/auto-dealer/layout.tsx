import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Auto Dealer Compliance Assessment | Dealer License, GST, Labour, Environment | ComplianceCheck',
  description: 'Complete compliance assessment for automobile dealers in India. Dealer license, GST, labour laws, environmental norms, consumer protection, and service center compliance.',
  alternates: {
    canonical: 'https://compliancecheck.co.in/assessment/auto-dealer',
  },
  openGraph: {
    title: 'Auto Dealer Compliance Assessment | ComplianceCheck',
    description: 'Dealer license, GST, labour, environmental norms, and 8 compliance areas for automobile dealers. Gap analysis with action plan.',
    type: 'website',
    url: 'https://compliancecheck.co.in/assessment/auto-dealer',
    siteName: 'ComplianceCheck',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
