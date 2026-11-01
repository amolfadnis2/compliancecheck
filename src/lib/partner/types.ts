/**
 * Partner mode — a CA / CS / lawyer / consultant fills in a paid assessment
 * for their client and the summary, PDF and emails carry the partner's
 * branding (with a small "Powered by ComplianceCheck" credit).
 *
 * `PreparedBy` is the branding snapshot stored on the assessment row
 * (`prepared_by` JSONB) at submit time. Shared by client and server.
 */

import { z } from 'zod'
import { PREPARER_DESIGNATIONS, type PreparerDesignation } from '@/lib/constants/india'

export const SUBMISSION_MODES = {
  SELF: 'self',
  PARTNER_ON_BEHALF: 'partner_on_behalf',
  CLIENT_VIA_PARTNER_LINK: 'client_via_partner_link',
} as const

export type SubmissionMode = (typeof SUBMISSION_MODES)[keyof typeof SUBMISSION_MODES]

const DESIGNATION_VALUES = PREPARER_DESIGNATIONS.map((d) => d.value) as [PreparerDesignation, ...PreparerDesignation[]]

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => (v ? v : undefined))

export const preparedBySchema = z.object({
  firmName: z.string().trim().min(2, 'Firm name is required').max(120),
  preparerName: z.string().trim().min(2, 'Your name is required').max(100),
  designation: z.enum(DESIGNATION_VALUES, { message: 'Please select your designation' }),
  email: z.string().trim().email('Enter a valid email').max(200),
  phone: optionalText(20),
  website: optionalText(200),
  city: optionalText(80),
  /** Public URL of the logo in the `report-logos` bucket (from /api/partner/logo). */
  logoUrl: z
    .string()
    .url()
    .max(500)
    .optional()
    .refine((v) => !v || /\/storage\/v1\/object\/public\/report-logos\//.test(v), 'Logo must be uploaded here'),
  brandColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Use a hex colour like #1E40AF')
    .optional(),
})

export type PreparedBy = z.infer<typeof preparedBySchema>

/** PreparedBy plus the logo already fetched as a data URL (see ./logo). */
export type ReportPreparer = PreparedBy & { logoDataUrl?: string }

/** Label for a designation value, e.g. 'CA' -> 'Chartered Accountant (CA)'. */
export function designationLabel(value: string | undefined): string {
  return PREPARER_DESIGNATIONS.find((d) => d.value === value)?.label ?? value ?? ''
}

/** Short credential line shown under the firm name: "Asha Rao, CA". */
export function preparerLine(pb: Pick<PreparedBy, 'preparerName' | 'designation'>): string {
  const designation = pb.designation === 'Other' ? '' : pb.designation
  return [pb.preparerName, designation].filter(Boolean).join(', ')
}

/** Contact line for reports and emails: phone / email / website, whichever exist. */
export function preparerContactLine(pb: Pick<PreparedBy, 'phone' | 'email' | 'website'>): string {
  return [pb.phone, pb.email, pb.website].filter(Boolean).join('  |  ')
}

/** Parse an unknown value (row JSONB, request body) into PreparedBy, or null. */
export function parsePreparedBy(value: unknown): PreparedBy | null {
  if (!value || typeof value !== 'object') return null
  const parsed = preparedBySchema.safeParse(value)
  return parsed.success ? parsed.data : null
}

/** "#1E40AF" -> [30, 64, 175]; null for anything invalid. */
export function hexToRgb(hex: string | undefined): [number, number, number] | null {
  if (!hex || !/^#[0-9A-Fa-f]{6}$/.test(hex)) return null
  return [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)]
}

/** Required-checkbox wording; also the version recorded via attested_at. */
export const PARTNER_ATTESTATION_TEXT =
  'These are my own professional details and I am authorised to issue this report to my client. I understand ComplianceCheck does not verify them.'

/** Disclaimer clause added to branded reports. */
export const PARTNER_DISCLAIMER =
  "Preparer details on this report were self-declared by the preparer and have not been verified by ComplianceCheck. The preparer is responsible for any advice given to their client on the basis of this report."
