'use client'

/**
 * Client-side state for the "I'm filling this in for a client" section of
 * Step 0 (partner mode). One tiny store shared by the section component and
 * the assessment page's submit handler, so each page only has to:
 *   1. render <PreparedForClientSection assessmentType=... />
 *   2. call validatePartnerStep(contact) before leaving Step 0
 *   3. spread partnerSubmitFields(contact) into its submit body
 *
 * The partner's details are remembered in localStorage so the next client is
 * one click; whether the box is ticked (and the attestation) is kept in
 * sessionStorage so a refresh mid-assessment keeps it. Both accessors are wrapped in try/catch.
 */

import { useSyncExternalStore } from 'react'
import { preparedBySchema, SUBMISSION_MODES, type PreparedBy, type SubmissionMode } from './types'
import { analytics } from '@/lib/analytics/tracking'

export type PartnerDraft = Partial<Record<keyof PreparedBy, string>>

export interface PartnerState {
  enabled: boolean
  attested: boolean
  details: PartnerDraft
  /** Set when the details were restored from a previous visit. */
  prefilled: boolean
}

/** Contact fields the host form already collects (reused instead of asked twice). */
export interface PartnerContact {
  name?: string
  email?: string
  phone?: string
}

const DETAILS_KEY = 'cc_partner_details_v1'
const ENABLED_KEY = 'cc_partner_mode_v1'
const ATTESTED_KEY = 'cc_partner_attested_v1'

const EMPTY: PartnerState = { enabled: false, attested: false, details: {}, prefilled: false }

let state: PartnerState = EMPTY
let hydrated = false
const listeners = new Set<() => void>()

function read(storage: 'local' | 'session', key: string): string | null {
  try {
    return (storage === 'local' ? window.localStorage : window.sessionStorage).getItem(key)
  } catch {
    return null
  }
}

function write(storage: 'local' | 'session', key: string, value: string | null) {
  try {
    const s = storage === 'local' ? window.localStorage : window.sessionStorage
    if (value === null) s.removeItem(key)
    else s.setItem(key, value)
  } catch {
    /* storage blocked — partner mode still works for this page view */
  }
}

function hydrate() {
  if (hydrated || typeof window === 'undefined') return
  hydrated = true
  let details: PartnerDraft = {}
  try {
    const raw = read('local', DETAILS_KEY)
    if (raw) details = JSON.parse(raw) as PartnerDraft
  } catch {
    details = {}
  }
  const enabled = read('session', ENABLED_KEY) === '1'
  const attested = read('session', ATTESTED_KEY) === '1'
  state = { enabled, attested, details, prefilled: Object.keys(details).length > 0 }
}

function emit(next: PartnerState) {
  state = next
  listeners.forEach((l) => l())
}

function subscribe(listener: () => void) {
  hydrate()
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function getPartnerState(): PartnerState {
  hydrate()
  return state
}

export function usePartnerState(): PartnerState {
  return useSyncExternalStore(subscribe, getPartnerState, () => EMPTY)
}

/** True when the box is ticked — host forms use this to relabel their fields. */
export function usePartnerMode(): boolean {
  return usePartnerState().enabled
}

export function setPartnerEnabled(enabled: boolean) {
  hydrate()
  write('session', ENABLED_KEY, enabled ? '1' : null)
  emit({ ...state, enabled })
  analytics.registerPartnerContext(
    enabled
      ? { submission_mode: SUBMISSION_MODES.PARTNER_ON_BEHALF, preparer_designation: state.details.designation }
      : null
  )
}

export function updatePartnerDetails(patch: PartnerDraft) {
  hydrate()
  const details = { ...state.details, ...patch }
  write('local', DETAILS_KEY, JSON.stringify(details))
  emit({ ...state, details })
}

export function setPartnerAttested(attested: boolean) {
  hydrate()
  // Per tab session only: the attestation is asked again on the next visit.
  write('session', ATTESTED_KEY, attested ? '1' : null)
  emit({ ...state, attested })
}

function candidate(contact?: PartnerContact): Record<string, unknown> {
  const d = getPartnerState().details
  const clean = (v: string | undefined) => (v && v.trim() ? v.trim() : undefined)
  return {
    firmName: clean(d.firmName),
    preparerName: clean(d.preparerName) ?? clean(contact?.name),
    designation: clean(d.designation),
    email: clean(d.email) ?? clean(contact?.email),
    phone: clean(d.phone) ?? clean(contact?.phone),
    website: clean(d.website),
    city: clean(d.city),
    logoUrl: clean(d.logoUrl),
    brandColor: clean(d.brandColor),
  }
}

/**
 * Validate the partner section before leaving Step 0. Returns null when the
 * box is unticked or everything is fine, otherwise the first error message.
 * `contact` supplies the name/email/phone the host form already collected.
 */
export function validatePartnerStep(contact?: PartnerContact): string | null {
  const s = getPartnerState()
  if (!s.enabled) return null
  const parsed = preparedBySchema.safeParse(candidate(contact))
  if (!parsed.success) return parsed.error.issues[0]?.message ?? 'Please complete your details'
  if (!s.attested) return 'Please confirm the details on the report are your own'
  return null
}

/** The partner snapshot for the submit body, or null when not in partner mode. */
export function getPreparedBy(contact?: PartnerContact): PreparedBy | null {
  const s = getPartnerState()
  if (!s.enabled || !s.attested) return null
  const parsed = preparedBySchema.safeParse(candidate(contact))
  return parsed.success ? parsed.data : null
}

/** Fields to spread into an assessment submit body. */
export function partnerSubmitFields(contact?: PartnerContact): {
  submissionMode: SubmissionMode
  preparedBy?: PreparedBy
} {
  const preparedBy = getPreparedBy(contact)
  return preparedBy
    ? { submissionMode: SUBMISSION_MODES.PARTNER_ON_BEHALF, preparedBy }
    : { submissionMode: SUBMISSION_MODES.SELF }
}

/**
 * Call once the submit route answers: records the partner in PostHog
 * (super properties + group) using the preparer id the server assigned.
 */
export function onPartnerSubmitted(
  assessmentType: Parameters<typeof analytics.partnerDetailsSubmitted>[0]['assessment_type'],
  preparerId: string | undefined,
  contact?: PartnerContact
) {
  const pb = getPreparedBy(contact)
  if (!pb) return
  analytics.partnerDetailsSubmitted({
    assessment_type: assessmentType,
    designation: pb.designation,
    has_logo: !!pb.logoUrl,
    has_brand_color: !!pb.brandColor,
    has_website: !!pb.website,
  })
  analytics.registerPartnerContext({
    submission_mode: SUBMISSION_MODES.PARTNER_ON_BEHALF,
    preparer_designation: pb.designation,
    preparer_id: preparerId,
  })
  if (preparerId) {
    analytics.setPartnerGroup(preparerId, { firm_name: pb.firmName, designation: pb.designation, city: pb.city })
  }
}

/** Map a Step 0 details object (any assessment's field names) to PartnerContact. */
export function partnerContactOf(details: Record<string, unknown> | null | undefined): PartnerContact {
  const pick = (...keys: string[]) => {
    for (const k of keys) {
      const v = details?.[k]
      if (typeof v === 'string' && v.trim()) return v
    }
    return undefined
  }
  return {
    name: pick('fullName', 'contactName', 'name'),
    email: pick('email', 'contactEmail'),
    phone: pick('phone', 'phoneNumber', 'contactPhone'),
  }
}
