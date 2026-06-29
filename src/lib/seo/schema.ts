/**
 * schema.org JSON-LD builders.
 *
 * Keep all structured-data shapes here so every page emits consistent markup and
 * answer engines (Google rich results, ChatGPT/Perplexity, etc.) get clean,
 * machine-readable facts. Render the output with <JsonLd data={...} />.
 */

import { SITE_NAME, SITE_URL, absoluteUrl } from './site'

const organization = {
  '@type': 'Organization',
  name: SITE_NAME,
  url: SITE_URL,
}

/** Org/WebApplication block for the site root. */
export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: SITE_NAME,
    url: SITE_URL,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'AggregateOffer',
      lowPrice: '499',
      highPrice: '2999',
      priceCurrency: 'INR',
      offerCount: 7,
    },
    description:
      'Pay-as-you-go compliance assessments for Indian SMEs. Labour Codes, DPDP Act, POSH, Food Business & more.',
    provider: organization,
    areaServed: { '@type': 'Country', name: 'India' },
  }
}

/** A single assessment / paid service. */
export function serviceSchema(params: {
  name: string
  description: string
  url: string
  pricePaise: number
  isFree: boolean
}) {
  const price = (params.pricePaise / 100).toString()
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: 'Compliance assessment',
    name: params.name,
    description: params.description,
    url: absoluteUrl(params.url),
    provider: organization,
    areaServed: { '@type': 'Country', name: 'India' },
    offers: {
      '@type': 'Offer',
      price: params.isFree ? '0' : price,
      priceCurrency: 'INR',
      availability: 'https://schema.org/InStock',
      url: absoluteUrl(params.url),
    },
  }
}

/** Breadcrumb trail. Pass items in order from root to current page. */
export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  }
}

/** FAQ rich result. */
export function faqSchema(items: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  }
}

/** Blog post / article. */
export function articleSchema(params: {
  title: string
  description: string
  url: string
  datePublished: string
  dateModified?: string
  author?: string
  image?: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: params.title,
    description: params.description,
    url: absoluteUrl(params.url),
    mainEntityOfPage: { '@type': 'WebPage', '@id': absoluteUrl(params.url) },
    datePublished: params.datePublished,
    dateModified: params.dateModified ?? params.datePublished,
    author: { '@type': 'Organization', name: params.author ?? SITE_NAME },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
    },
    image: params.image ? absoluteUrl(params.image) : undefined,
  }
}
