import type { Metadata } from 'next'
import HomePageClient from './HomePageClient'

export const metadata: Metadata = {
  title: 'Compliance Assessment for Indian SMEs | ComplianceCheck',
}

export default function HomePage() {
  return <HomePageClient />
}
