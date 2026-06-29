/**
 * SEO metadata for each assessment — single source of truth for routes, blurbs,
 * and FAQ content used across llms.txt, the sitemap, and landing-page schema.
 *
 * Names and prices are pulled from the assessment-types constants (CLAUDE.md §9);
 * only the SEO-specific fields (slugs, marketing blurb, FAQs) live here.
 */

import {
  ASSESSMENT_TYPES,
  ASSESSMENT_PRICES,
  ASSESSMENT_PRICING,
  getAssessmentDisplayName,
  type AssessmentType,
} from '@/lib/constants/assessment-types'

export interface AssessmentMeta {
  type: AssessmentType
  /** /assessments/landing/<landingSlug> */
  landingSlug: string
  /** /assessment/<assessmentRoute> — where the assessment itself runs */
  assessmentRoute: string
  /** Who it's for / what it covers — one sentence, citable. */
  blurb: string
  faqs: { question: string; answer: string }[]
}

export const ASSESSMENT_META: AssessmentMeta[] = [
  {
    type: ASSESSMENT_TYPES.STATUTORY_HEALTH,
    landingSlug: 'statutory-health-check',
    assessmentRoute: 'statutory-health',
    blurb:
      'A 12-question health check of PF, ESI, Professional Tax, Gratuity and Bonus compliance for Indian employers.',
    faqs: [
      {
        question: 'What does the Statutory Health Check cover?',
        answer:
          'It checks your compliance with Provident Fund (EPF), Employee State Insurance (ESI), Professional Tax, Payment of Gratuity and Payment of Bonus obligations applicable to Indian employers.',
      },
      {
        question: 'How long does the Statutory Health Check take?',
        answer:
          'About 5-10 minutes. You answer 12 guided questions and receive a free compliance summary instantly, with the option to unlock a full report.',
      },
    ],
  },
  {
    type: ASSESSMENT_TYPES.LABOUR_CODE,
    landingSlug: 'labour-code-readiness',
    assessmentRoute: 'labour-code',
    blurb:
      'Readiness assessment for India\'s 4 new Labour Codes (Wages, Social Security, OSH, Industrial Relations), with implementation cost estimates.',
    faqs: [
      {
        question: 'When do the new Labour Codes take effect in India?',
        answer:
          'The 4 Labour Codes consolidate 29 existing labour laws and are expected to take effect from November 2025. Every employer should assess readiness across wages, working hours, leave, and social security.',
      },
      {
        question: 'What are the 4 new Labour Codes?',
        answer:
          'The Code on Wages 2019, the Code on Social Security 2020, the Occupational Safety, Health and Working Conditions Code 2020, and the Industrial Relations Code 2020.',
      },
    ],
  },
  {
    type: ASSESSMENT_TYPES.DPDP,
    landingSlug: 'dpdp-gap-assessment',
    assessmentRoute: 'dpdp',
    blurb:
      'A 45-question gap assessment for the Digital Personal Data Protection (DPDP) Act 2023, scoring data-protection maturity across 6 phases.',
    faqs: [
      {
        question: 'What is the DPDP Act 2023?',
        answer:
          'The Digital Personal Data Protection Act 2023 is India\'s first comprehensive data protection law. It governs how organisations collect, process and protect personal data, with penalties of up to Rs. 250 crore for breaches.',
      },
      {
        question: 'When does the DPDP Act come into force?',
        answer:
          'The DPDP Act\'s rules and obligations are being phased in, with enforcement expected around 2027. Organisations should assess their readiness now given the scale of the changes required.',
      },
    ],
  },
  {
    type: ASSESSMENT_TYPES.STATE_WISE_COMPLIANCE,
    landingSlug: 'state-wise-compliance',
    assessmentRoute: 'state-wise-compliance',
    blurb:
      'Identifies which state-specific laws apply to your business — Professional Tax, Labour Welfare Fund, and Shops & Establishment deadlines.',
    faqs: [
      {
        question: 'Which compliance requirements vary by Indian state?',
        answer:
          'Professional Tax slabs, Labour Welfare Fund rates, and Shops & Establishment registration and renewal deadlines all vary by state. Some states, such as Delhi and Haryana, do not levy Professional Tax at all.',
      },
    ],
  },
  {
    type: ASSESSMENT_TYPES.FOOD_BUSINESS,
    landingSlug: 'restaurant-food-business',
    assessmentRoute: 'food-business',
    blurb:
      'Compliance assessment for restaurants and food businesses covering FSSAI, Fire NOC, liquor licence, GST and labour requirements.',
    faqs: [
      {
        question: 'What licences does a restaurant need in India?',
        answer:
          'Most food businesses need an FSSAI licence or registration, GST registration, a Fire NOC, a trade/health licence from the local authority, and — where alcohol is served — a liquor licence, alongside labour registrations.',
      },
    ],
  },
  {
    type: ASSESSMENT_TYPES.POSH,
    landingSlug: 'posh-act-compliance',
    assessmentRoute: 'posh',
    blurb:
      'Prevention of Sexual Harassment (POSH) Act 2013 compliance assessment, including Internal Committee (ICC) requirements.',
    faqs: [
      {
        question: 'Who must comply with the POSH Act 2013?',
        answer:
          'Every workplace in India with 10 or more employees must constitute an Internal Committee (ICC), conduct awareness training, and file annual reports under the POSH Act 2013.',
      },
    ],
  },
  {
    type: ASSESSMENT_TYPES.AUTO_DEALER,
    landingSlug: 'auto-dealer-compliance',
    assessmentRoute: 'auto-dealer',
    blurb:
      'A multi-phase compliance assessment for 2-wheeler and 4-wheeler dealers spanning labour, CMVR, EHS, IRDAI MISP, ELV, GST and DPDP.',
    faqs: [
      {
        question: 'What compliance areas do auto dealers in India need to cover?',
        answer:
          'Vehicle dealers must manage labour law, Central Motor Vehicle Rules (CMVR), environment/health/safety (EHS), IRDAI MISP for insurance, End-of-Life Vehicle (ELV) rules, GST and DPDP data-protection obligations.',
      },
    ],
  },
]

export function getAssessmentMeta(type: AssessmentType): AssessmentMeta {
  const meta = ASSESSMENT_META.find((m) => m.type === type)
  if (!meta) throw new Error(`No assessment meta for type: ${type}`)
  return meta
}

/** Convenience: full display + pricing + routing record for a meta entry. */
export function describeAssessment(meta: AssessmentMeta) {
  const isFree = ASSESSMENT_PRICING[meta.type] === 'free'
  return {
    name: getAssessmentDisplayName(meta.type),
    pricePaise: ASSESSMENT_PRICES[meta.type].amountPaise,
    isFree,
    landingPath: `/assessments/landing/${meta.landingSlug}`,
    assessmentPath: `/assessment/${meta.assessmentRoute}`,
    blurb: meta.blurb,
    faqs: meta.faqs,
  }
}
