import type { Metadata } from 'next'
import { FAQ_ITEMS } from '@/lib/calculators/penalty-exposure/faq-content'
import { JsonLd } from '@/lib/seo/JsonLd'
import { faqSchema } from '@/lib/seo/schema'
import PenaltyCalculatorClient from './PenaltyCalculatorClient'

export const metadata: Metadata = {
  title: 'Free Compliance Penalty Calculator India 2026 — DPDP, Labour Codes, PF/ESI',
  description:
    'Calculate your Indian business\'s compliance penalty exposure across DPDP Act, Labour Codes 2025, EPF, ESI, POSH, GST & more. Free tool. No login required.',
  keywords: [
    'compliance penalty calculator India 2026',
    'DPDP penalty calculator',
    'Labour Code compliance penalty',
    'EPF ESI penalty calculator',
    'POSH penalty India',
    'GST penalty calculator',
    'Indian SME compliance risk',
    'statutory penalty exposure India',
  ],
  alternates: {
    canonical: '/calculators/compliance-penalty-calculator',
  },
  openGraph: {
    title: 'Free Compliance Penalty Calculator India 2026 — DPDP, Labour Codes, PF/ESI',
    description:
      'See your total statutory penalty exposure in 30 seconds. Covers DPDP Act, Labour Codes, EPF/ESI, POSH and more. Free, anonymous, no login.',
    url: 'https://compliancecheck.co.in/calculators/compliance-penalty-calculator',
    siteName: 'ComplianceCheck',
    locale: 'en_IN',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'ComplianceCheck Penalty Exposure Calculator',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Compliance Penalty Calculator India 2026',
    description: 'Calculate your statutory penalty exposure across DPDP, Labour Codes, EPF/ESI, POSH and more.',
    images: ['/og-image.png'],
  },
}

const webAppSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Indian Compliance Penalty Exposure Calculator',
  url: 'https://compliancecheck.co.in/calculators/compliance-penalty-calculator',
  description:
    'Free tool that estimates your business\'s financial exposure across Indian compliance laws including the DPDP Act 2023, Labour Codes 2025, EPF, ESI, POSH Act and more.',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Any',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'INR',
  },
  publisher: {
    '@type': 'Organization',
    name: 'ComplianceCheck',
    url: 'https://compliancecheck.co.in',
  },
}

export default function CompliancePenaltyCalculatorPage() {
  return (
    <>
      <JsonLd data={webAppSchema} />
      <JsonLd data={faqSchema(FAQ_ITEMS)} />
      <PenaltyCalculatorClient />
    </>
  )
}
