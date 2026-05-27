import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Restaurant & Food Business Compliance | FSSAI, Fire NOC, Liquor License | ComplianceCheck',
  description: 'Complete compliance assessment for restaurants, cloud kitchens, and food businesses. FSSAI, Fire NOC, Liquor License, GST, and Labour compliance.',
  alternates: {
    canonical: 'https://compliancecheck.co.in/assessment/food-business',
  },
  openGraph: {
    title: 'Restaurant & Food Business Compliance | ComplianceCheck',
    description: 'FSSAI, Fire NOC, Liquor License, and 8 compliance areas for food businesses. Assessment with gap analysis.',
    type: 'website',
    url: 'https://compliancecheck.co.in/assessment/food-business',
    siteName: 'ComplianceCheck',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
