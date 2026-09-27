import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'PF, ESI & Professional Tax Calculator for Employers | ComplianceCheck',
  description: 'Free PF, ESI and Professional Tax calculator for Indian employers. Check if EPF and ESI apply to your business and see the monthly employee and employer contribution per employee, by state.',
  alternates: {
    canonical: 'https://compliancecheck.co.in/calculator/pf-esi-pt',
  },
  openGraph: {
    title: 'PF, ESI & PT Calculator | ComplianceCheck',
    description: 'Check EPF and ESI applicability and monthly PF, ESI and Professional Tax per employee. Free, no signup.',
    type: 'website',
    url: 'https://compliancecheck.co.in/calculator/pf-esi-pt',
    siteName: 'ComplianceCheck',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
