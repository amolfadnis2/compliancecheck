import type { Metadata } from 'next'
import { DEFAULT_OPEN_GRAPH } from '@/lib/seo/site'
import { CalculatorGuide } from '@/components/site/CalculatorGuide'

export const metadata: Metadata = {
  title: 'CTC Calculator | Cost to Company Calculator India | ComplianceCheck',
  description: 'Free CTC to take-home salary calculator for Indian employees. Break down gross salary, deductions, PF, ESI, professional tax, and net take-home pay instantly.',
  alternates: {
    canonical: 'https://compliancecheck.co.in/calculator/ctc',
  },
  openGraph: {
    ...DEFAULT_OPEN_GRAPH,
    title: 'CTC Calculator | ComplianceCheck',
    description: 'Free CTC to take-home salary calculator for India. Instant breakdown of PF, ESI, professional tax, and net pay.',
    type: 'website',
    url: 'https://compliancecheck.co.in/calculator/ctc',
    siteName: 'ComplianceCheck',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <CalculatorGuide id="ctc" />
    </>
  )
}
