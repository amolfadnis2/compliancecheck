import type { Metadata } from 'next'
import { JsonLd } from '@/lib/seo/JsonLd'
import { faqSchema, webApplicationSchema } from '@/lib/seo/schema'
import { HOME_FAQS } from '@/lib/content/home-faq'
import { DEFAULT_OPEN_GRAPH, SITE_URL } from '@/lib/seo/site'
import HomePageClient from './HomePageClient'

export const metadata: Metadata = {
  title: 'Compliance Assessment for Indian SMEs | ComplianceCheck',
  alternates: { canonical: SITE_URL },
  openGraph: { ...DEFAULT_OPEN_GRAPH, url: SITE_URL },
}

export default function HomePage() {
  return (
    <>
      <JsonLd data={webApplicationSchema()} />
      <JsonLd data={faqSchema(HOME_FAQS)} />
      <HomePageClient />
    </>
  )
}
