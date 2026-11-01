/**
 * Partner-mode report email: the same report-delivery email, but headed by the
 * preparing firm (logo, name, contact) instead of ComplianceCheck, so a CA /
 * CS / lawyer / consultant can forward it to their client as-is. A small
 * "Powered by ComplianceCheck" line stays in the footer.
 */

import { preparerContactLine, preparerLine, type PreparedBy } from './types'
import { isAllowedLogoUrl } from './logo'

function esc(value: string | undefined | null): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export function partnerEmailHtml(opts: {
  preparedBy: PreparedBy
  reportLabel: string
  companyName?: string
  score: number
  status: string
  statusColour: string
}): string {
  const { preparedBy: pb, reportLabel, companyName, score, status, statusColour } = opts
  const accent = pb.brandColor ?? '#1E40AF'
  const logo = isAllowedLogoUrl(pb.logoUrl)
    ? `<img src="${esc(pb.logoUrl)}" alt="${esc(pb.firmName)}" style="max-height: 56px; max-width: 200px; margin-bottom: 12px; background: #ffffff; padding: 6px; border-radius: 6px;">`
    : ''
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #374151; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: ${esc(accent)}; padding: 28px; border-radius: 12px 12px 0 0; text-align: center;">
        ${logo}
        <h1 style="color: #ffffff; margin: 0; font-size: 22px;">${esc(pb.firmName)}</h1>
        <p style="color: rgba(255,255,255,0.9); margin: 6px 0 0 0; font-size: 14px;">${esc(preparerLine(pb))}${pb.city ? ` &middot; ${esc(pb.city)}` : ''}</p>
      </div>
      <div style="background: #ffffff; padding: 28px; border: 1px solid #E5E7EB; border-top: none;">
        <h2 style="color: #1F2937; margin-top: 0;">${esc(reportLabel)} Report</h2>
        ${companyName ? `<p style="color: #6B7280; margin-bottom: 20px;">Prepared for: <strong style="color: #1F2937;">${esc(companyName)}</strong></p>` : ''}
        <div style="background: #F9FAFB; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center; border-left: 4px solid ${esc(statusColour)};">
          <p style="color: #6B7280; margin: 0 0 5px 0; font-size: 14px;">Overall Compliance Score</p>
          <p style="font-size: 48px; font-weight: bold; color: ${esc(statusColour)}; margin: 0;">${score ?? 0}%</p>
          <p style="color: ${esc(statusColour)}; font-weight: 600; margin: 5px 0 0 0;">${esc(status)}</p>
        </div>
        <p>The detailed report is attached as a PDF: every gap found, the legal provision behind it, a 30 / 60 / 90-day action plan and the government portal for each action.</p>
        <div style="background: #F3F4F6; border-radius: 8px; padding: 16px; margin-top: 20px;">
          <p style="margin: 0 0 4px; font-weight: 600; color: #1F2937;">Questions about this report?</p>
          <p style="margin: 0; font-size: 14px;">Contact ${esc(pb.preparerName)} at ${esc(pb.firmName)}: ${esc(preparerContactLine(pb).replace(/ {2}\| {2}/g, ' | '))}</p>
        </div>
      </div>
      <div style="padding: 16px; text-align: center; font-size: 12px; color: #9CA3AF;">
        <p style="margin: 0;">This report is based on the answers provided and is not legal advice. Preparer details are self-declared and not verified by ComplianceCheck.</p>
        <p style="margin: 6px 0 0;">Powered by ComplianceCheck.co.in</p>
      </div>
    </body>
    </html>
  `
}

/** "Rao & Associates via ComplianceCheck <noreply@...>" — keeps our sending domain. */
export function partnerFromAddress(defaultFrom: string, firmName: string): string {
  const address = defaultFrom.match(/<([^>]+)>/)?.[1] ?? defaultFrom
  const name = firmName.replace(/["<>\r\n]/g, '').slice(0, 60)
  return `"${name} via ComplianceCheck" <${address}>`
}
