// ============================================================================
// Phase 6 — Data & Corporate (~10 questions)
// Source: Research §4.11 DPDP, §4.10 DSA (partial), §4.13 Companies Act,
//         §4.10 Lease Registration
//
// DPDP NOTE: DPDP Act 2023 and DPDP Rules 2025 (gazette 14 Nov 2025).
//   Phased timeline: DPB live; consent managers Nov 2026; substantive
//   compliance obligations from 13 May 2027. All DPDP questions below are
//   marked status: 'prepare-by-2027' in gapTemplate — weight 7 max.
// ============================================================================

import type { AutoDealerQuestion, ApplicabilityProfile } from '@/types/auto-dealer'

export const PHASE6_DATA_CORPORATE_QUESTIONS: AutoDealerQuestion[] = [
  // --------------------------------------------------------------------------
  // DPDP Act 2023 / Rules 2025 (advisory until 13 May 2027)
  // --------------------------------------------------------------------------
  {
    id: 'AD_P6_001',
    phase: 6,
    text: 'Is a privacy notice (in any 8th-Schedule language requested by the customer) issued at every point of personal data collection — test-drive form, KYC, finance application, service intake?',
    helpText: 'DPDP Rules 2025 require the privacy notice to be clear, understandable, and accessible in all 22 Scheduled languages if requested. Substantive obligations begin 13 May 2027, but implementing notices now avoids retrofitting at scale.',
    type: 'yes_no',
    weight: 7,
    complianceArea: 'dpdp',
    source: 'Research §4.11, DPDP Act 2023 §5, DPDP Rules 2025 Rule 3 (gazette 14 Nov 2025)',
    gapTemplate: {
      finding: 'Privacy notice not issued at all customer data-collection touchpoints.',
      recommendation: 'Design a compliant privacy notice covering: purpose, data categories, retention, rights, grievance mechanism. Embed in test-drive form, KYC, service intake. Prepare translations for dominant local language.',
      timeline: 'prepare_by_2027',
      penaltyExposure: 'Advisory until 13 May 2027; post that: up to Rs.200 crore per violation for breach notification failure; up to Rs.50 crore for other violations (DPDP Act §33)',
    },
    compliantAnswers: ['yes'],
    appliesWhen: (p: ApplicabilityProfile) => p.processesPersonalData,
  },
  {
    id: 'AD_P6_002',
    phase: 6,
    text: 'Is customer consent for personal data processing captured separately from terms and conditions — with granular, purpose-specific consent for each use (KYC, marketing, telematics, finance)?',
    helpText: 'DPDP Act 2023 §6 requires: consent that is free, specific, informed, unconditional, and unambiguous. Bundled consent (one checkbox for T&C and data processing) is non-compliant. Consent for marketing must be separate from consent for fulfilment.',
    type: 'yes_no',
    weight: 7,
    complianceArea: 'dpdp',
    source: 'Research §4.11, DPDP Act 2023 §6',
    gapTemplate: {
      finding: 'Customer consent is bundled with T&C or not purpose-specific.',
      recommendation: 'Implement separate consent checkboxes for each purpose (mandatory fulfilment vs. optional marketing); use positive opt-in for marketing; store consent records with timestamp.',
      timeline: 'prepare_by_2027',
      penaltyExposure: 'Advisory until 13 May 2027; post that: up to Rs.250 crore for security safeguards failure (DPDP Act §33)',
    },
    compliantAnswers: ['yes'],
    appliesWhen: (p: ApplicabilityProfile) => p.processesPersonalData,
  },
  {
    id: 'AD_P6_003',
    phase: 6,
    text: 'Has a data inventory been completed — mapping all customer personal data flows: KYC, finance docs, RTO forms, DMS, CRM, telematics, telesales?',
    helpText: 'Article 30 GDPR-equivalent in India: a data inventory (Records of Processing Activities) is not explicitly mandated by DPDP 2023 but is essential for: breach response, vendor DPA, and DPDP Rules 2025 Rule 6 (Data Processor agreements). Most dealer DMS platforms host data offshore.',
    type: 'yes_no',
    weight: 6,
    complianceArea: 'dpdp',
    source: 'Research §4.11, DPDP Rules 2025 Rule 6',
    gapTemplate: {
      finding: 'Data inventory not completed — customer data flows not mapped.',
      recommendation: 'Conduct data discovery workshop; map all data categories, systems (DMS, CRM, OEM portal), retention periods, and cross-border transfer points; document as ROPA (Records of Processing Activities).',
      timeline: 'prepare_by_2027',
      penaltyExposure: 'Advisory until 13 May 2027; ROPA essential for demonstrating accountability post-enforcement',
    },
    compliantAnswers: ['yes'],
    appliesWhen: (p: ApplicabilityProfile) => p.processesPersonalData,
  },
  {
    id: 'AD_P6_004',
    phase: 6,
    text: 'Are Data Processing Agreements (DPAs) in place with all third-party vendors who handle customer data — DMS provider, OEM portal, telecalling agency, finance company?',
    helpText: 'DPDP Rules 2025 Rule 6 requires Data Fiduciaries to engage only processors who can implement appropriate technical and organisational measures. DPAs with DMS providers and OEM portals (which typically host data on overseas servers) are critical.',
    type: 'yes_no',
    weight: 6,
    complianceArea: 'dpdp',
    source: 'Research §4.11, DPDP Rules 2025 Rule 6',
    gapTemplate: {
      finding: 'DPAs not in place with DMS vendor, OEM portal, or telecalling agency.',
      recommendation: 'Identify all data processors; request DPA from each; ensure DPA covers: purpose limitation, security obligations, breach notification, sub-processor restrictions, data deletion on termination.',
      timeline: 'prepare_by_2027',
      penaltyExposure: 'Advisory until 13 May 2027; post that: DPDP Board enforcement; liability under §8 for processor acts',
    },
    compliantAnswers: ['yes'],
    appliesWhen: (p: ApplicabilityProfile) => p.processesPersonalData,
  },
  {
    id: 'AD_P6_005',
    phase: 6,
    text: 'Is a personal data breach response playbook documented — covering internal escalation, communication to affected customers, and 72-hour detailed report to the Data Protection Board?',
    helpText: 'DPDP Act 2023 §8(6) requires notification of a personal data breach to both the Data Protection Board and affected Data Principals. The playbook must define: incident classification, 24-hour internal escalation, immediate customer notice, and detailed report within 72 hours.',
    type: 'yes_no',
    weight: 6,
    complianceArea: 'dpdp',
    source: 'Research §4.11, DPDP Act 2023 §8(6)',
    gapTemplate: {
      finding: 'Breach response playbook not documented.',
      recommendation: 'Draft incident-response procedure covering: detection, containment, assessment (threshold: >100 affected), notification to DPB (72 hrs) and customers (immediate). Test with tabletop exercise annually.',
      timeline: 'prepare_by_2027',
      penaltyExposure: 'Advisory until 13 May 2027; post that: up to Rs.200 crore for breach notification failure (DPDP Act §33)',
    },
    compliantAnswers: ['yes'],
    appliesWhen: (p: ApplicabilityProfile) => p.processesPersonalData,
  },
  {
    id: 'AD_P6_006',
    phase: 6,
    text: 'Are customer rights (access, correction, erasure, nomination, grievance) operationalised — with a designated grievance mechanism that responds within 30 days?',
    helpText: 'DPDP Act 2023 §12-14 confers rights on Data Principals: access to data summary, correction, erasure, grievance redressal within 30 days. DPO appointment is not mandatory for most dealerships unless the DPDP Board designates them as a Significant Data Fiduciary.',
    type: 'yes_no',
    weight: 5,
    complianceArea: 'dpdp',
    source: 'Research §4.11, DPDP Act 2023 §12-15',
    gapTemplate: {
      finding: 'Customer data rights process not operationalised.',
      recommendation: 'Set up a dedicated email / web form for data rights requests; assign a Privacy Officer to respond within 30 days; document all responses; link from privacy notice.',
      timeline: 'prepare_by_2027',
      penaltyExposure: 'Advisory until 13 May 2027; post that: up to Rs.50 crore per violation for failure to provide grievance mechanism',
    },
    compliantAnswers: ['yes'],
    appliesWhen: (p: ApplicabilityProfile) => p.processesPersonalData,
  },

  // --------------------------------------------------------------------------
  // Companies Act / Lease / CSR
  // --------------------------------------------------------------------------
  {
    id: 'AD_P6_007',
    phase: 6,
    text: 'Are annual MCA filings (AOC-4 financial statements + MGT-7 annual return) submitted within 30/60 days of AGM respectively?',
    helpText: 'Companies Act 2013 requires AOC-4 within 30 days of AGM and MGT-7 within 60 days. Late filings attract Rs.500/day penalty + additional filing fees. Many dealership companies miss MGT-7 because directors do not update DIN KYC (DIR-3 KYC) annually.',
    type: 'yes_no',
    weight: 7,
    complianceArea: 'companies_act',
    source: 'Research §4.13, Companies Act 2013 §92, §137',
    gapTemplate: {
      finding: 'MCA annual filings (AOC-4 / MGT-7) not confirmed as filed on time.',
      recommendation: 'File AOC-4 within 30 days of AGM; MGT-7 within 60 days; ensure all directors have updated DIN KYC (DIR-3 KYC) by 30 Sep. Engage company secretary for tracking.',
      timeline: '30_days',
      penaltyExposure: 'Rs.50,000 + Rs.500/day continuing default; director disqualification under §164(2) if 3 consecutive defaults',
    },
    compliantAnswers: ['yes'],
    appliesWhen: (p: ApplicabilityProfile) =>
      ['pvt_ltd', 'public_ltd', 'opc'].includes(p.legalForm),
  },
  {
    id: 'AD_P6_008',
    phase: 6,
    text: 'Are board meetings (minimum 4 per year) and the AGM held within the statutory timeline, and are statutory registers (members, directors, charges, debentures) maintained and updated?',
    helpText: 'Companies Act 2013 §173: minimum 4 board meetings with <=120 days gap. §96: AGM within 6 months of financial year-end (15 months from previous AGM). Register of Members (Form MGT-1) and other statutory registers must be up to date.',
    type: 'yes_no',
    weight: 6,
    complianceArea: 'companies_act',
    source: 'Research §4.13, Companies Act 2013 §88, §173, §96',
    gapTemplate: {
      finding: 'Board meetings or AGM not held within statutory timeline.',
      recommendation: 'Schedule all 4 board meetings at year start; hold AGM by 30 Sep (31 Dec for first year); update statutory registers; maintain minutes book.',
      timeline: '30_days',
      penaltyExposure: 'Rs.1 lakh fine per director; per-default NCLT action for non-compliance',
    },
    compliantAnswers: ['yes'],
    appliesWhen: (p: ApplicabilityProfile) =>
      ['pvt_ltd', 'public_ltd', 'opc'].includes(p.legalForm),
  },
  {
    id: 'AD_P6_009',
    phase: 6,
    text: 'If your dealership has crossed CSR thresholds (net worth >=Rs.500 crore, or turnover >=Rs.1,000 crore, or net profit >=Rs.5 crore) — is a CSR policy adopted and 2% spend executed?',
    helpText: 'Companies Act 2013 §135: CSR is mandatory if net worth >=Rs.500 crore, turnover >=Rs.1,000 crore, or net profit >=Rs.5 crore in the preceding FY. Most large dealer groups cross the turnover threshold. Unspent amount must be transferred to a scheduled fund within 6 months.',
    type: 'yes_no',
    weight: 6,
    complianceArea: 'csr',
    source: 'Research §4.13, Companies Act 2013 §135',
    gapTemplate: {
      finding: 'CSR threshold crossed but policy not adopted or 2% spend not executed.',
      recommendation: 'Adopt CSR policy; constitute CSR committee (>=3 directors); execute 2% average net-profit spend; file Form CSR-2 with ROC by 31 Mar.',
      timeline: '90_days',
      penaltyExposure: 'Rs.1 lakh to Rs.10 lakh company + Rs.10,000 to Rs.1 lakh per director; unspent amount forfeited to PM Relief Fund',
    },
    compliantAnswers: ['yes', 'not_applicable'],
    appliesWhen: (p: ApplicabilityProfile) =>
      ['pvt_ltd', 'public_ltd'].includes(p.legalForm),
  },
  {
    id: 'AD_P6_010',
    phase: 6,
    text: 'Are all lease deeds for business premises registered with the Sub-Registrar, stamped, and renewal dates tracked (with renewal initiated >=90 days before expiry)?',
    helpText: 'Registration Act 1908: leases >=12 months must be registered. An unregistered lease is inadmissible as evidence. Stamp duty must be paid upfront; paying stamp duty on discovery of non-registration attracts penalty. Most dealership properties are leased and many leases are unregistered.',
    type: 'yes_no',
    weight: 6,
    complianceArea: 'lease',
    source: 'Research §4.13, Registration Act 1908 §17',
    gapTemplate: {
      finding: 'Lease deed(s) not registered or renewal not tracked.',
      recommendation: 'Register all leases >=12 months with local Sub-Registrar; pay stamp duty (state-variable: typically 1-5% of annual rent x term); set 90-day renewal reminder; maintain executed lease file.',
      timeline: '90_days',
      penaltyExposure: 'Stamp duty arrears + penalty up to 10x stamp duty; unregistered lease void as evidence in court',
    },
    compliantAnswers: ['yes'],
    appliesWhen: (p: ApplicabilityProfile) => !p.premisesOwned,
  },
]
