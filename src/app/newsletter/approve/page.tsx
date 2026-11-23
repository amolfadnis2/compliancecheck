/**
 * /newsletter/approve?token=...  -- opened from the approval email sent to
 * NEWSLETTER_APPROVER_EMAIL. Shows the issue and how many confirmed
 * subscribers it will go to, with Send / Discard buttons.
 */

import type { Metadata } from 'next'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyNewsletterToken } from '@/lib/newsletter/token'
import { personalise } from '@/lib/newsletter/digest'
import { ApproveActions } from './approve-actions'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Approve newsletter | ComplianceCheck',
  robots: { index: false, follow: false },
}

function Message({ text }: { text: string }) {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <p className="text-gray-700 dark:text-gray-300">{text}</p>
    </main>
  )
}

export default async function ApproveNewsletterPage({ searchParams }: { searchParams: { token?: string } }) {
  const token = searchParams.token ?? ''
  const issueId = token ? verifyNewsletterToken(token, 'approve') : null
  if (!issueId) return <Message text="This approval link is invalid or has expired." />

  const supabase = createAdminClient()
  const { data: issue } = await supabase
    .from('newsletter_issues')
    .select('subject, html, status, sent_count, week_of')
    .eq('id', issueId)
    .maybeSingle()
  if (!issue) return <Message text="This newsletter issue no longer exists." />

  const { count } = await supabase
    .from('newsletter_subscribers')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'active')

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 px-4 py-10">
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <p className="text-sm text-gray-500">Newsletter for week of {issue.week_of as string}</p>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{issue.subject as string}</h1>
        </div>

        <ApproveActions
          token={token}
          initialStatus={issue.status as 'draft' | 'sending' | 'sent' | 'discarded'}
          initialSentCount={issue.sent_count as number}
          activeSubscribers={count ?? 0}
        />

        <iframe
          title="Newsletter preview"
          srcDoc={personalise(issue.html as string, '#')}
          sandbox=""
          className="w-full h-[900px] rounded-lg border border-gray-200 bg-white"
        />
      </div>
    </main>
  )
}
