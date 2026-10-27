import type { Metadata } from 'next'
import { DEFAULT_OPEN_GRAPH } from '@/lib/seo/site'

export const metadata: Metadata = {
  title: 'Employee Data Consent Form Generator (DPDP Act 2023) | ComplianceCheck',
  description:
    'Generate a DPDP Act 2023 consent form for your employees. Pick the data categories and purposes you process and download a ready-to-sign PDF. Free, no login.',
  alternates: {
    canonical: 'https://compliancecheck.co.in/documents/employee-consent',
  },
  openGraph: {
    ...DEFAULT_OPEN_GRAPH,
    title: 'Employee Data Consent Form Generator (DPDP Act 2023) | ComplianceCheck',
    description: 'Generate a DPDP Act 2023 consent form for your employees. Free, no login.',
    url: 'https://compliancecheck.co.in/documents/employee-consent',
  },
}

export default function EmployeeConsentLayout({ children }: { children: React.ReactNode }) {
  return children
}
