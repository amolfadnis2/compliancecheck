import type { Metadata } from 'next'
import { NewsletterActionCard } from '@/components/newsletter/newsletter-action-card'

export const metadata: Metadata = {
  title: 'Confirm newsletter subscription | ComplianceCheck',
  robots: { index: false, follow: false },
}

export default function ConfirmNewsletterPage({ searchParams }: { searchParams: { token?: string } }) {
  return (
    <NewsletterActionCard
      token={searchParams.token ?? ''}
      endpoint="/api/newsletter/confirm"
      title="Confirm your subscription"
      description="One click and you will get the ComplianceCheck weekly newsletter: new calculators, assessments and compliance articles."
      buttonLabel="Confirm subscription"
      successTitle="You are subscribed"
      successBody="The newsletter arrives once a week. Every issue has a one-click unsubscribe link."
    />
  )
}
