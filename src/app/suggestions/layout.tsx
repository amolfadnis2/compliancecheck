import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Share an Idea | ComplianceCheck',
  description: 'Suggest a new assessment, calculator or guide you would like ComplianceCheck to build.',
  robots: { index: false, follow: true },
}

export default function SuggestionsLayout({ children }: { children: React.ReactNode }) {
  return children
}
