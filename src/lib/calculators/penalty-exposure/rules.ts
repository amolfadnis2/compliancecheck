import type { PenaltyRule } from './types'

export const PENALTY_RULES: PenaltyRule[] = [
  {
    id: 'epf_late_payment',
    law: 'EPF',
    lawFullName: "Employees' Provident Fund",
    violation: 'Late contribution payment',
    appliesIf: (i) => i.employeeCount >= 20,
    governmentRef: 'EPF Act 1952, Section 7Q + 14B',
    officialLink: 'https://epfindia.gov.in',
    // POST-JUNE-2024 RATES
    interestRate: 0.12,              // 12% p.a. under Section 7Q
    damagesRate: 0.01,               // 1% per month under Section 14B (amended 14 June 2024)
    damagesCap: 1.0,                 // Cannot exceed 100% of arrears
    karnatakaHCFloor: 0.25,          // Jan 2026: cannot reduce below 25% for >6mo defaults
    maxStatutory: null,              // Rate-based, no fixed ceiling
    relatedAssessment: 'statutory-health-check',
  },
  {
    id: 'epf_wilful_default',
    law: 'EPF',
    violation: 'Wilful default / false statement',
    appliesIf: (i) => i.employeeCount >= 20,
    governmentRef: 'EPF Act 1952, Section 14',
    maxStatutory: 'criminal',
    relatedAssessment: 'statutory-health-check',
  },
  {
    id: 'esi_late_payment',
    law: 'ESI',
    lawFullName: "Employees' State Insurance",
    violation: 'Late contribution',
    appliesIf: (i) => i.employeeCount >= 10,
    governmentRef: 'ESI Act 1948, Section 85',
    interestRate: 0.12,
    damagesRateMin: 0.05,
    damagesRateMax: 0.25,
    maxStatutory: 'criminal',
    relatedAssessment: 'statutory-health-check',
  },
  {
    id: 'code_on_wages',
    law: 'Code on Wages 2019',
    violation: 'Underpayment / contravention',
    appliesIf: () => true,
    governmentRef: 'Code on Wages 2019, Section 54',
    maxStatutory: 100_000,           // Rs.1 lakh + 3 months imprisonment
    note: 'Live since Nov 21, 2025',
    relatedAssessment: 'labour-code-readiness',
  },
  {
    id: 'osh_hazardous',
    law: 'OSH Code 2020',
    violation: 'Health/safety violation in hazardous process',
    appliesIf: (i) => i.industry === 'manufacturing' || i.industry === 'food',
    governmentRef: 'OSH Code 2020',
    maxStatutory: 500_000,           // Rs.5 lakh
    relatedAssessment: 'labour-code-readiness',
  },
  {
    id: 'osh_standing_orders',
    law: 'OSH Code 2020',
    violation: 'Standing Orders breach',
    appliesIf: (i) => i.employeeCount >= 300,
    governmentRef: 'OSH Code 2020 / IR Code 2020',
    maxStatutory: 200_000,           // Rs.2 lakh
    relatedAssessment: 'labour-code-readiness',
  },
  {
    id: 'posh_no_icc',
    law: 'POSH Act 2013',
    violation: 'No Internal Committee constituted',
    appliesIf: (i) => i.employeeCount >= 10 && i.hasWomenEmployees,
    governmentRef: 'POSH Act 2013, Section 26',
    maxStatutory: 50_000,            // Rs.50K first violation; licence cancellation on repeat
    relatedAssessment: 'posh-compliance',
  },
  {
    id: 'posh_annual_return',
    law: 'POSH Act 2013',
    violation: 'Annual return non-filing',
    appliesIf: (i) => i.employeeCount >= 10 && i.hasWomenEmployees,
    governmentRef: 'POSH Act 2013, Section 21',
    maxStatutory: 50_000,
    relatedAssessment: 'posh-compliance',
  },
  {
    id: 'gratuity_non_payment',
    law: 'Payment of Gratuity Act 1972',
    violation: 'Non-payment / delayed payment',
    appliesIf: (i) => i.employeeCount >= 10,
    governmentRef: 'Payment of Gratuity Act, Section 9',
    maxStatutory: 20_000,            // Rs.10K-20K + 6mo-2yr jail + 10% interest
    interestRate: 0.10,
    relatedAssessment: 'statutory-health-check',
  },
  {
    id: 'dpdp_security',
    law: 'DPDP Act 2023',
    lawFullName: 'Digital Personal Data Protection Act 2023',
    violation: 'Failure to implement reasonable security safeguards',
    appliesIf: (i) => i.processesPersonalData,
    governmentRef: 'DPDP Act 2023, Schedule',
    maxStatutory: 2_500_000_000,     // Rs.250 crore
    note: 'Full enforcement May 13, 2027. DPB live since Nov 13, 2025.',
    relatedAssessment: 'dpdp-gap-assessment',
  },
  {
    id: 'dpdp_breach_notification',
    law: 'DPDP Act 2023',
    violation: '72-hour breach notification failure',
    appliesIf: (i) => i.processesPersonalData,
    governmentRef: 'DPDP Act 2023, Schedule',
    maxStatutory: 2_000_000_000,     // Rs.200 crore
    relatedAssessment: 'dpdp-gap-assessment',
  },
  {
    id: 'dpdp_children',
    law: 'DPDP Act 2023',
    violation: "Children's data without verifiable parental consent",
    appliesIf: (i) => i.industry === 'edtech' || i.industry === 'healthcare',
    governmentRef: 'DPDP Act 2023, Schedule',
    maxStatutory: 2_000_000_000,
    relatedAssessment: 'dpdp-gap-assessment',
  },
  {
    id: 'dpdp_sdf',
    law: 'DPDP Act 2023',
    violation: 'SDF non-compliance (Significant Data Fiduciary)',
    appliesIf: (i) => i.processesPersonalData && i.annualTurnoverCr >= 500,
    governmentRef: 'DPDP Act 2023, Schedule',
    maxStatutory: 1_500_000_000,
    relatedAssessment: 'dpdp-gap-assessment',
  },
  {
    id: 'dpdp_rights',
    law: 'DPDP Act 2023',
    violation: 'Failure to honour Data Principal rights',
    appliesIf: (i) => i.processesPersonalData,
    governmentRef: 'DPDP Act 2023, Schedule',
    maxStatutory: 500_000_000,       // Rs.50 crore
    relatedAssessment: 'dpdp-gap-assessment',
  },
  {
    id: 'gst_late_filing',
    law: 'GST',
    lawFullName: 'Goods and Services Tax',
    violation: 'GSTR-1/3B late filing',
    appliesIf: (i) => i.annualTurnoverCr >= 0.4,
    governmentRef: 'CGST Act 2017, Section 47',
    perDayPenalty: 50,               // Rs.50/day
    perDayCap: 10_000,               // Capped Rs.5K-10K per return
    interestRate: 0.18,              // 18% p.a.
    maxStatutory: null,              // Per-return cap, no annual ceiling
    relatedAssessment: null,
  },
  {
    id: 'companies_act_late_filing',
    law: 'Companies Act 2013',
    violation: 'Late filing of returns',
    appliesIf: () => true,
    governmentRef: 'Companies Act 2013',
    perDayPenalty: 100,              // Rs.100/day, no cap
    maxStatutory: null,
    relatedAssessment: null,
  },
  {
    id: 'fssai_no_license',
    law: 'FSSAI',
    lawFullName: 'Food Safety and Standards Authority of India',
    violation: 'Operating without license',
    appliesIf: (i) => i.industry === 'food',
    governmentRef: 'FSS Act 2006, Section 63',
    maxStatutory: 500_000,           // Rs.5 lakh + 6 months jail
    relatedAssessment: 'food-business',
  },
  {
    id: 'factories_act',
    law: 'Factories Act 1948',
    violation: 'Hazardous process violation',
    appliesIf: (i) => i.industry === 'manufacturing' && i.employeeCount >= 10,
    governmentRef: 'Factories Act 1948',
    maxStatutory: 1_000_000,         // Rs.1L-10L (upper bound for SME estimate)
    relatedAssessment: 'state-wise-compliance',
  },
]
