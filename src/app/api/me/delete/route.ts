import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createClient } from '@/lib/supabase/server'

let resend: Resend | null = null
function getResend() {
  if (!resend) resend = new Resend(process.env.RESEND_API_KEY)
  return resend
}

export async function DELETE() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const deletionRequestedAt = new Date().toISOString()

  const { error } = await supabase
    .from('profiles')
    .update({ deletion_requested_at: deletionRequestedAt })
    .eq('id', user.id)

  if (error) {
    return NextResponse.json({ error: 'Failed to request deletion' }, { status: 500 })
  }

  await supabase.from('events').insert({
    user_id: user.id,
    event_name: 'deletion_requested',
    properties: { requested_at: deletionRequestedAt },
  })

  if (process.env.RESEND_API_KEY && user.email) {
    await getResend().emails.send({
      from: process.env.EMAIL_FROM ?? 'ComplianceCheck <noreply@compliancecheck.co.in>',
      to: user.email,
      subject: 'Your data deletion request has been received',
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px">
          <h2>Data Deletion Confirmation</h2>
          <p>We received your request to delete your ComplianceCheck account and all associated data.</p>
          <p><strong>What happens next:</strong></p>
          <ul>
            <li>Your account will be deactivated immediately.</li>
            <li>All your personal data will be permanently deleted within 30 days.</li>
            <li>You will not receive any further emails from us after this date.</li>
          </ul>
          <p>If you did not make this request, please contact us immediately at
            <a href="mailto:compliancecheck@zohomail.in">compliancecheck@zohomail.in</a>.
          </p>
          <p style="color:#6b7280;font-size:12px;margin-top:24px">
            ComplianceCheck — DPDP Act 2023 compliant data handling
          </p>
        </div>
      `.trim(),
    }).catch(() => {
      // Non-fatal — deletion proceeds regardless
    })
  }

  return new NextResponse(null, { status: 204 })
}
