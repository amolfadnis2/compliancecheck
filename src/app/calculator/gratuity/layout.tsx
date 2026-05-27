import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Gratuity Calculator | Payment of Gratuity Act India | ComplianceCheck',
  description: 'Free gratuity calculator for Indian employees and employers. Calculate gratuity entitlement under the Payment of Gratuity Act 1972 instantly.',
  alternates: {
    canonical: 'https://compliancecheck.co.in/calculator/gratuity',
  },
  openGraph: {
    title: 'Gratuity Calculator | ComplianceCheck',
    description: 'Free gratuity calculator for India. Calculate entitlement under the Payment of Gratuity Act 1972.',
    type: 'website',
    url: 'https://compliancecheck.co.in/calculator/gratuity',
    siteName: 'ComplianceCheck',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
