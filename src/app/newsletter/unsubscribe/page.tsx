import type { Metadata } from 'next'
import { NewsletterActionCard } from '@/components/newsletter/newsletter-action-card'

export const metadata: Metadata = {
  title: 'Unsubscribe | ComplianceCheck',
  robots: { index: false, follow: false },
}

export default function UnsubscribeNewsletterPage({ searchParams }: { searchParams: { token?: string } }) {
  return (
    <NewsletterActionCard
      token={searchParams.token ?? ''}
      endpoint="/api/newsletter/unsubscribe"
      title="Unsubscribe from the newsletter"
      description="You will stop getting the ComplianceCheck weekly newsletter. Emails about reports you buy are not affected."
      buttonLabel="Unsubscribe"
      successTitle="You are unsubscribed"
      successBody="You will not get the weekly newsletter any more. You can subscribe again from our home page at any time."
    />
  )
}
