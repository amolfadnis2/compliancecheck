import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'How It Works | Compliance Assessment Process | ComplianceCheck',
  description: 'Learn how ComplianceCheck works. Complete your compliance assessment in 4 simple steps: enter company details, answer questions, get instant results, and download your PDF report.',
  keywords: [
    'compliance assessment process',
    'how compliance check works',
    'Indian business compliance',
    'EPF ESI compliance assessment',
    'labour code readiness',
    'DPDP compliance check',
    'POSH Act compliance',
    'statutory compliance India',
    'SME compliance tool'
  ],
  openGraph: {
    title: 'How ComplianceCheck Works | Simple 4-Step Compliance Assessment',
    description: 'From answering simple questions to downloading your detailed compliance report — complete your assessment in under 10 minutes.',
    type: 'website',
    url: 'https://compliancecheck.co.in/how-it-works',
    siteName: 'ComplianceCheck',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'How ComplianceCheck Works',
    description: 'Complete your compliance assessment in 4 simple steps. Get instant results and professional PDF report.',
  },
  alternates: {
    canonical: 'https://compliancecheck.co.in/how-it-works',
  },
}

export default function HowItWorksLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
