import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sample Results | ComplianceCheck',
  robots: { index: false, follow: false },
}

export default function DemoResultsLayout({ children }: { children: React.ReactNode }) {
  return children
}
