/**
 * Itemised DPDP consent for the PF calculator lead form. Bump the version
 * whenever the wording changes; leads.consent_text_version records which
 * text the person agreed to.
 */

export const PF_LEAD_CONSENT = {
  version: 'pf-lead-v1-2026-10-22',
  items: [
    'Use my email to send the PF report or employer pack I asked for.',
    'Store my email, and the name, company and team size I choose to give, with the date of this consent.',
    'Contact me once about PF compliance for my team, if I asked for the employer pack.',
  ],
  notShared: 'We don’t sell your details or share them with anyone else.',
  withdrawal: 'You can withdraw consent at any time by emailing us with the subject “Withdraw consent”; we’ll delete your details.',
} as const

export const LEAD_PURPOSES = ['pdf_report', 'employer_pack'] as const
export const TEAM_SIZE_BANDS = ['1-10', '11-50', '51-100', '101-500', '500+'] as const
