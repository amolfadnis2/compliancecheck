/**
 * Programmatic state-compliance data — powers /guides/[state].
 *
 * Each Indian state/UT gets an indexable page covering the compliance items that
 * genuinely vary by state (Professional Tax, Labour Welfare Fund, Shops &
 * Establishment). Baseline facts are derived from the india constants
 * (CLAUDE.md §9); STATE_DETAILS layers in richer, hand-verified specifics for
 * priority states. Remaining states fall back to accurate generic guidance and
 * can be enriched over time.
 */

import { INDIAN_STATES, isPTApplicable } from '@/lib/constants/india'

export interface StateCompliance {
  state: string
  slug: string
  professionalTax: { applicable: boolean; note: string }
  labourWelfareFund: { applicable: boolean; note: string }
  shopsEstablishment: { note: string }
  highlights: string[]
}

/** URL-safe slug for a state name. */
export function stateSlug(state: string): string {
  return state
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

/** Hand-verified specifics for priority states. */
const STATE_DETAILS: Record<string, Partial<StateCompliance>> = {
  Maharashtra: {
    labourWelfareFund: {
      applicable: true,
      note: 'Maharashtra Labour Welfare Fund contributions are deducted twice a year (June and December).',
    },
    shopsEstablishment: {
      note: 'Establishments register under the Maharashtra Shops and Establishments (Regulation of Employment and Conditions of Service) Act, 2017. Units with fewer than 10 workers file an intimation instead of a full registration.',
    },
    highlights: [
      'Professional Tax is administered by the Maharashtra GST Department with monthly/annual returns.',
      'Labour Welfare Fund applies, contributed half-yearly.',
    ],
  },
  Karnataka: {
    labourWelfareFund: {
      applicable: true,
      note: 'Karnataka Labour Welfare Fund contributions are made annually (typically by January).',
    },
    shopsEstablishment: {
      note: 'Register under the Karnataka Shops and Commercial Establishments Act, 1961, via the e-services portal.',
    },
    highlights: [
      'Professional Tax applies, with employer registration and monthly remittance.',
      'Labour Welfare Fund applies on an annual cycle.',
    ],
  },
  'Tamil Nadu': {
    labourWelfareFund: {
      applicable: true,
      note: 'Tamil Nadu Labour Welfare Fund contributions are made annually (by December/January).',
    },
    shopsEstablishment: {
      note: 'Register under the Tamil Nadu Shops and Establishments Act, 1947.',
    },
    highlights: [
      'Professional Tax is levied by local bodies (municipalities/corporations) on a half-yearly basis.',
      'Labour Welfare Fund applies annually.',
    ],
  },
  Delhi: {
    labourWelfareFund: {
      applicable: true,
      note: 'Delhi Labour Welfare Fund contributions are made half-yearly (June and December).',
    },
    shopsEstablishment: {
      note: 'Register under the Delhi Shops and Establishments Act, 1954 within the prescribed period of commencing business.',
    },
    highlights: [
      'Delhi does NOT levy Professional Tax.',
      'Labour Welfare Fund applies, contributed half-yearly.',
    ],
  },
  Gujarat: {
    labourWelfareFund: {
      applicable: true,
      note: 'Gujarat Labour Welfare Fund contributions are made half-yearly (June and December).',
    },
    shopsEstablishment: {
      note: 'Register/intimate under the Gujarat Shops and Establishments (Regulation of Employment and Conditions of Service) Act, 2019.',
    },
    highlights: [
      'Professional Tax applies, collected by local authorities.',
      'Labour Welfare Fund applies half-yearly.',
    ],
  },
  'West Bengal': {
    labourWelfareFund: {
      applicable: true,
      note: 'West Bengal Labour Welfare Fund contributions are made half-yearly.',
    },
    shopsEstablishment: {
      note: 'Register under the West Bengal Shops and Establishments Act, 1963.',
    },
    highlights: [
      'Professional Tax applies, with online enrolment and registration.',
      'Labour Welfare Fund applies half-yearly.',
    ],
  },
}

function baseline(state: string): StateCompliance {
  const ptApplicable = isPTApplicable(state)
  return {
    state,
    slug: stateSlug(state),
    professionalTax: {
      applicable: ptApplicable,
      note: ptApplicable
        ? `Professional Tax is levied in ${state}. Employers must register, deduct tax per the state's salary slabs, and file periodic returns.`
        : `${state} does not levy Professional Tax, so no Professional Tax registration or deduction is required.`,
    },
    labourWelfareFund: {
      applicable: true,
      note: `Check the Labour Welfare Fund applicability and contribution cycle for ${state} based on your employee count.`,
    },
    shopsEstablishment: {
      note: `Most commercial establishments in ${state} must register under the applicable Shops and Establishments Act and renew as required.`,
    },
    highlights: [
      ptApplicable
        ? 'Professional Tax registration and periodic returns are required.'
        : 'No Professional Tax in this state.',
      'Shops & Establishment registration applies to most commercial premises.',
    ],
  }
}

/** Merged compliance facts for a state. */
export function getStateCompliance(state: string): StateCompliance {
  const base = baseline(state)
  const extra = STATE_DETAILS[state]
  if (!extra) return base
  return {
    ...base,
    ...extra,
    professionalTax: extra.professionalTax ?? base.professionalTax,
    labourWelfareFund: extra.labourWelfareFund ?? base.labourWelfareFund,
    shopsEstablishment: extra.shopsEstablishment ?? base.shopsEstablishment,
    highlights: extra.highlights ?? base.highlights,
  }
}

export function getAllStateSlugs(): string[] {
  return INDIAN_STATES.map(stateSlug)
}

export function getStateBySlug(slug: string): string | null {
  return INDIAN_STATES.find((s) => stateSlug(s) === slug) ?? null
}
