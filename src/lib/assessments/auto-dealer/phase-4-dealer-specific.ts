// ============================================================================
// Phase 4 — Auto-Dealer Specific (~20 questions)
// Source: Research §4.1 Trade Certificate, §4.9 MISP (EoM-Reg-2024 framing),
//         §4.10 DSA, §4.12 Consumer Protection / Right to Repair
//
// IMPORTANT — MISP FRAMING:
//   The legacy 22.5%/19.5% IRDAI MISP caps were WITHDRAWN in 2023.
//   Distribution fees are now governed by IRDAI EoM Regulations 2024 (eff. 1
//   Apr 2024) and the individual sponsor insurer's Board-approved EoM policy.
//   All MISP questions below reflect EoM-Reg-2024 framing, NOT the old caps.
// ============================================================================

import type { AutoDealerQuestion, ApplicabilityProfile } from '@/types/auto-dealer'

export const PHASE4_DEALER_SPECIFIC_QUESTIONS: AutoDealerQuestion[] = [
  // --------------------------------------------------------------------------
  // Trade Certificate (CMVR Form 16/16A/17/19A)
  // Source: Research §4.1, CMVR GSR 703(E) 14 Sep 2022
  // --------------------------------------------------------------------------
  {
    id: 'AD_P4_001',
    phase: 4,
    text: 'Do you hold a valid Form 17 Trade Certificate for each class of vehicle (2W, 4W, commercial, EV) you sell and move on public roads?',
    helpText: 'Trade Certificate under CMVR Rule 33 authorises dealers to use vehicles on public roads without individual registration. A separate certificate is required for each class of vehicle. Moving vehicles without a valid Trade Certificate is a criminal offence under MV Act §177.',
    type: 'yes_no',
    weight: 10,
    complianceArea: 'trade_certificate',
    source: 'Research §4.1, CMVR Rule 33-43A; MV Act §177',
    gapTemplate: {
      finding: 'Trade Certificate (Form 17) may be absent, expired, or not covering all vehicle classes.',
      recommendation: 'Apply for / renew Trade Certificate via VAHAN portal (registering authority). Obtain separate certificate for each vehicle class. Renew >=30 days before expiry.',
      timeline: '30_days',
      penaltyExposure: 'Rs.1,000 to Rs.5,000 + seizure under MV Act s.177; CMVR Rule 44 suspension',
    },
    compliantAnswers: ['yes'],
    appliesWhen: (_p: ApplicabilityProfile) => true,
  },
  {
    id: 'AD_P4_002',
    phase: 4,
    text: 'Is the Form 16A OEM Dealer Authorisation displayed prominently in the showroom and uploaded on the VAHAN portal?',
    helpText: 'Form 16A (introduced via CMVR GSR 703(E) 14 Sep 2022) is the OEM\'s authorisation letter confirming the dealer relationship. It must be displayed in the showroom and uploaded on VAHAN to validate trade plate operations.',
    type: 'yes_no',
    weight: 8,
    complianceArea: 'trade_certificate',
    source: 'Research §4.1, CMVR GSR 703(E) 14 Sep 2022',
    gapTemplate: {
      finding: 'Form 16A not displayed or not uploaded on VAHAN.',
      recommendation: 'Obtain current Form 16A from OEM; display at showroom reception; upload on VAHAN. Update when OEM renews the authorisation letter.',
      timeline: '30_days',
      penaltyExposure: 'Trade Certificate suspension; MV Act penalty',
    },
    compliantAnswers: ['yes'],
    appliesWhen: (_p: ApplicabilityProfile) => true,
  },
  {
    id: 'AD_P4_003',
    phase: 4,
    text: 'Is the Form 19A digital inventory register on VAHAN maintained in real-time — showing all vehicles under the Trade Certificate at any given time?',
    helpText: 'Form 19A (effective 1 Nov 2022) requires dealers to maintain a live digital inventory on VAHAN of all vehicles on their premises under the Trade Certificate. Physical stock must match VAHAN records at all times.',
    type: 'yes_no',
    weight: 9,
    complianceArea: 'trade_certificate',
    source: 'Research §4.1, CMVR Form 19A; VAHAN integration',
    gapTemplate: {
      finding: 'Form 19A digital inventory not maintained or not matching physical stock.',
      recommendation: 'Log into VAHAN and reconcile Form 19A; update in real-time when vehicles arrive or leave; reconcile physical stock with VAHAN records weekly.',
      timeline: '30_days',
      penaltyExposure: 'Trade Certificate suspension; MV Act §177 penalty for unregistered vehicle',
    },
    compliantAnswers: ['yes'],
    appliesWhen: (_p: ApplicabilityProfile) => true,
  },
  {
    id: 'AD_P4_004',
    phase: 4,
    text: 'Are trade-registration plates used only on vehicles being moved by dealership staff — never by customers or third parties?',
    helpText: 'CMVR Rule 42 strictly prohibits allowing customers to use trade plates. Test drives must be accompanied by a licensed dealer employee. Lending trade plates to third parties (logistics companies, transporters) is a criminal offence.',
    type: 'yes_no',
    weight: 9,
    complianceArea: 'trade_certificate',
    source: 'Research §4.1, CMVR Rule 42',
    gapTemplate: {
      finding: 'Trade plates used by customers or third parties — serious CMVR violation.',
      recommendation: 'Issue strict written policy prohibiting customer / third-party use of trade plates. Accompany all test drives. Maintain test-drive log with employee name and licence number.',
      timeline: '30_days',
      penaltyExposure: 'Rs.1,000 to Rs.5,000 + vehicle seizure under MV Act s.177; Trade Certificate suspension',
    },
    compliantAnswers: ['yes'],
    appliesWhen: (_p: ApplicabilityProfile) => true,
  },
  {
    id: 'AD_P4_005',
    phase: 4,
    text: 'For each retail sale, are Form 20 (application), Form 21 (delivery note), Form 22 (road-worthiness certificate), and Form 21-23 (OEM certificates) issued and uploaded electronically to VAHAN?',
    helpText: 'CMVR requires specific forms for every vehicle sold: Form 20 (registration application), Form 21 (sale certificate), Form 22 (roadworthiness), Form 23 (inspector certificate). Electronic upload to VAHAN is mandatory since 2022.',
    type: 'yes_no',
    weight: 8,
    complianceArea: 'trade_certificate',
    source: 'Research §4.1, CMVR Forms 20-23',
    gapTemplate: {
      finding: 'Vehicle sale forms (20-23) not consistently issued or uploaded to VAHAN.',
      recommendation: 'Set up DMS to auto-generate all CMVR forms at billing; train sales team; verify VAHAN upload for each transaction; maintain physical file for 3 years.',
      timeline: '30_days',
      penaltyExposure: 'Delayed or non-registration triggers MV Act §177 penalties; buyer complaint risk',
    },
    compliantAnswers: ['yes'],
    appliesWhen: (_p: ApplicabilityProfile) => true,
  },

  // --------------------------------------------------------------------------
  // HSRP
  // --------------------------------------------------------------------------
  {
    id: 'AD_P4_006',
    phase: 4,
    text: 'Is a High-Security Registration Plate (HSRP) affixed to every new vehicle at the time of delivery — at no extra charge to the customer?',
    helpText: 'HSRP is mandatory for all new vehicles at delivery (Supreme Court Order). Several states (Maharashtra: deadline 30 Jun 2025; others rolling) require retro-fitment on pre-HSRP vehicles. No dealership may charge separately for HSRP — it must be included in the on-road price.',
    type: 'yes_no',
    weight: 8,
    complianceArea: 'hsrp',
    source: 'Research §4.1 / §6 (HSRP retro-fit), MV Act §41; Supreme Court order',
    gapTemplate: {
      finding: 'HSRP not affixed at delivery or extra charge levied — MV Act and Consumer Protection violation.',
      recommendation: 'Ensure HSRP is affixed before vehicle leaves premises; include HSRP cost in on-road price; do not charge separately; train delivery team.',
      timeline: '30_days',
      penaltyExposure: 'Rs.5,000 to Rs.10,000 per vehicle under MV Act s.192; CCPA action for unfair trade practice',
    },
    compliantAnswers: ['yes'],
    appliesWhen: (_p: ApplicabilityProfile) => true,
  },
  {
    id: 'AD_P4_007',
    phase: 4,
    text: 'Where a retro-fitment HSRP mandate applies in your state (Maharashtra deadline: 30 Jun 2025) — do you have a process to guide existing customers for retro-fitment?',
    helpText: 'State enforcement of HSRP retro-fitment on pre-HSRP vehicles is accelerating. Maharashtra deadline was 30 Jun 2025. Dealers can facilitate retro-fitment as a service revenue opportunity while helping customers avoid fines.',
    type: 'yes_no',
    weight: 5,
    complianceArea: 'hsrp',
    source: 'Research §6 (HSRP retro-fit), MV Act §41',
    gapTemplate: {
      finding: 'No process for guiding customers on HSRP retro-fitment where state mandates apply.',
      recommendation: 'Communicate HSRP retro-fitment requirement to relevant customer base via SMS/email; set up retro-fitment service at dealership via VAHAN-authorised supplier.',
      timeline: '30_days',
      penaltyExposure: 'Customer fines of Rs.5,000 to Rs.10,000 may create service disputes',
    },
    compliantAnswers: ['yes'],
    appliesWhen: (_p: ApplicabilityProfile) => true,
  },

  // --------------------------------------------------------------------------
  // Bharat NCAP / BIS
  // --------------------------------------------------------------------------
  {
    id: 'AD_P4_008',
    phase: 4,
    text: 'For 4-wheel passenger vehicles with a Bharat NCAP safety rating — is the star rating disclosed in all showroom and digital marketing collateral?',
    helpText: 'Bharat NCAP (AIS-197) became mandatory for new passenger car models from 1 Oct 2023. If a vehicle has been rated, non-disclosure in marketing is a misleading-omission under Consumer Protection Act and ASCI guidelines.',
    type: 'yes_no',
    weight: 6,
    complianceArea: 'bncap_bis',
    source: 'Research §4.1 / §6 (BNCAP), bncap.in',
    gapTemplate: {
      finding: 'Bharat NCAP star rating not disclosed in marketing for rated vehicles.',
      recommendation: 'Check bncap.in for ratings of vehicles you sell; display star rating in showroom POS material and website; train sales staff to disclose rating to customers.',
      timeline: '30_days',
      penaltyExposure: 'CCPA misleading advertising penalty up to Rs.10 lakh (first) / Rs.50 lakh (repeat)',
    },
    compliantAnswers: ['yes'],
    appliesWhen: (p: ApplicabilityProfile) =>
      ['4w_only', 'both_2w_4w', 'mixed'].includes(p.vehicleType),
  },
  {
    id: 'AD_P4_009',
    phase: 4,
    text: 'Do you verify that all helmets (IS 4151), tyres (mandatory QCOs), seat belts, and child restraint systems sold carry a valid BIS mark?',
    helpText: 'Selling helmets, tyres, or seat belts without a valid BIS/ISI mark is an offence under BIS Act 2016. CMVR also prohibits fitment of non-ISI helmets. BIS conducts surprise inspections at dealerships.',
    type: 'yes_no',
    weight: 7,
    complianceArea: 'bncap_bis',
    source: 'Research §4.1, BIS Act 2016 §17',
    gapTemplate: {
      finding: 'BIS-mark verification not done at time of procurement for helmets/tyres/accessories.',
      recommendation: 'Check BIS licence number of all helmet/tyre suppliers on bis.gov.in; reject non-BIS stock; maintain supplier declarations; train procurement team.',
      timeline: '30_days',
      penaltyExposure: 'Up to Rs.2 lakh per batch / 2 yr imprisonment under BIS Act §17; product seizure',
    },
    compliantAnswers: ['yes'],
    appliesWhen: (p: ApplicabilityProfile) => p.sellsAccessories,
  },

  // --------------------------------------------------------------------------
  // IRDAI MISP (EoM Regulations 2024 framing)
  // NOTE: Withdrawn 22.5%/19.5% caps are NOT referenced below.
  // Source: IRDAI MISP Guidelines 2017, IRDAI EoM Regulations 2024 (eff. 1 Apr 2024)
  // --------------------------------------------------------------------------
  {
    id: 'AD_P4_010',
    phase: 4,
    text: 'Does your dealership hold a valid MISP appointment letter (Annexure 1 format) from ONE and only one intermediary or insurer (single-sponsor rule)?',
    helpText: 'IRDAI MISP Guidelines require every MISP to be appointed by a single sponsor (insurer or intermediary). A MISP cannot have multiple sponsor agreements simultaneously. The appointment letter must be in the prescribed Annexure 1 format.',
    type: 'yes_no',
    weight: 9,
    complianceArea: 'misp',
    source: 'Research §4.9, IRDAI MISP Guidelines 2017 (eff. 1 Nov 2017)',
    gapTemplate: {
      finding: 'MISP appointment letter not confirmed or multiple sponsors engaged — IRDAI non-compliance.',
      recommendation: 'Obtain Annexure 1 appointment letter from your single sponsor; terminate any other sponsor relationships; file UIN mapping on IIB.',
      timeline: '30_days',
      penaltyExposure: 'MISP cancellation; insurer/intermediary penalty up to Rs.1 crore u/s 102 Insurance Act',
    },
    compliantAnswers: ['yes'],
    appliesWhen: (p: ApplicabilityProfile) => p.misp,
  },
  {
    id: 'AD_P4_011',
    phase: 4,
    text: 'Is your MISP UIN registered and mapped to the dealership\'s PAN on the Insurance Information Bureau (IIB) portal?',
    helpText: 'Every MISP must have a Unique Identification Number (UIN) issued by the IRDAI/IIB. The UIN must be mapped to the dealership PAN. MISP operations without a valid UIN are illegal.',
    type: 'yes_no',
    weight: 8,
    complianceArea: 'misp',
    source: 'Research §4.9, IRDAI MISP Guidelines 2017 §5',
    gapTemplate: {
      finding: 'MISP UIN not confirmed or not mapped to PAN on IIB.',
      recommendation: 'Log into IIB portal; verify UIN status; if absent, apply through sponsor for UIN allotment. Map UIN to correct PAN.',
      timeline: '30_days',
      penaltyExposure: 'Operating as MISP without UIN: cancellation + Rs.1 crore penalty',
    },
    compliantAnswers: ['yes'],
    appliesWhen: (p: ApplicabilityProfile) => p.misp,
  },
  {
    id: 'AD_P4_012',
    phase: 4,
    text: 'Has the Designated Person (DP) of your MISP completed the prescribed POS examination and does their certificate remain valid?',
    helpText: 'Every MISP must designate a trained "Designated Person" with a valid POS (Point-of-Sales) certificate. The DP is responsible for MISP compliance. Certificate validity should be checked with the sponsor/intermediary.',
    type: 'yes_no',
    weight: 7,
    complianceArea: 'misp',
    source: 'Research §4.9, IRDAI MISP Guidelines 2017 §6',
    gapTemplate: {
      finding: 'Designated Person POS certificate not current.',
      recommendation: 'Identify current DP; verify POS certificate validity; arrange re-examination if expired; update DP details with sponsor.',
      timeline: '30_days',
      penaltyExposure: 'MISP suspension; insurer/sponsor regulatory risk',
    },
    compliantAnswers: ['yes'],
    appliesWhen: (p: ApplicabilityProfile) => p.misp,
  },
  {
    id: 'AD_P4_013',
    phase: 4,
    text: 'Is the distribution fee / commission paid to your MISP in line with your sponsor\'s Board-approved EoM policy under the IRDAI (Expenses of Management) Regulations 2024 — not based on the legacy 22.5% / 19.5% MISP caps (which were withdrawn in 2023)?',
    helpText: 'The 2023 IRDAI circular (on payment of distribution fees) withdrew the specific 22.5%/19.5% MISP fee caps from the MISP Guidelines. Distribution fees are now governed by each insurer\'s Board-approved Expenses of Management (EoM) policy under the IRDAI EoM Regulations 2024 (eff. 1 Apr 2024). The overall insurer EoM cap is 30% (Life)/35% (Non-Life). Your MISP agreement should reference the sponsor\'s EoM policy, not the legacy caps.',
    type: 'yes_no',
    weight: 8,
    complianceArea: 'misp',
    source: 'Research §4.9 / §B.22, IRDAI EoM Regulations 2024 (eff. 1 Apr 2024)',
    gapTemplate: {
      finding: 'MISP distribution fee structure may reference withdrawn 22.5%/19.5% caps rather than sponsor\'s current EoM policy.',
      recommendation: 'Request copy of sponsor\'s Board-approved EoM policy; ensure MISP agreement references EoM Regulations 2024, not the withdrawn MISP-specific caps; review fee arrangements with sponsor.',
      timeline: '90_days',
      penaltyExposure: 'MISP guideline breach: cancellation + Rs.1 crore penalty u/s 102 Insurance Act if IRDAI investigation finds non-compliance',
    },
    compliantAnswers: ['yes'],
    appliesWhen: (p: ApplicabilityProfile) => p.misp,
  },
  {
    id: 'AD_P4_014',
    phase: 4,
    text: 'Do you offer customers a choice of insurer (no-panel rule) and avoid soliciting insurance for vehicles not sold by you?',
    helpText: 'MISP Guidelines prohibit: creating a panel of insurers from which customers must choose; soliciting insurance for vehicles not sold at your premises (except renewal of own-book customers). Customer must be free to choose any insurer.',
    type: 'yes_no',
    weight: 7,
    complianceArea: 'misp',
    source: 'Research §4.9, IRDAI MISP Guidelines 2017 §15',
    gapTemplate: {
      finding: 'Customer insurer choice not offered or insurance solicited for non-own-sale vehicles.',
      recommendation: 'Train sales staff: no insurer panel; present all available options; do not solicit for vehicles not sold here (except renewal); document customer\'s choice.',
      timeline: '30_days',
      penaltyExposure: 'IRDAI action on sponsor; MISP cancellation',
    },
    compliantAnswers: ['yes'],
    appliesWhen: (p: ApplicabilityProfile) => p.misp,
  },

  // --------------------------------------------------------------------------
  // RBI DSA
  // --------------------------------------------------------------------------
  {
    id: 'AD_P4_015',
    phase: 4,
    text: 'Are current signed DSA agreements held with each lender, and are you NOT sub-delegating DSA activities to agents without the lender\'s explicit consent?',
    helpText: 'RBI\'s Master Direction on Outsourcing of Financial Services 2023 requires registered DSA agreements. Sub-DSA arrangements without lender consent violate RBI directions and may trigger cancellation.',
    type: 'yes_no',
    weight: 7,
    complianceArea: 'dsa',
    source: 'Research §4.10, RBI Master Direction on Outsourcing 2023',
    gapTemplate: {
      finding: 'DSA agreement not current or sub-DSA arrangement without lender consent.',
      recommendation: 'Obtain current signed DSA agreements from each lender; no sub-DSA without written lender consent; maintain original agreements for 7 years.',
      timeline: '30_days',
      penaltyExposure: 'Lender cancellation of DSA; potential RBI regulatory action on lender for outsourcing control failure',
    },
    compliantAnswers: ['yes'],
    appliesWhen: (p: ApplicabilityProfile) => p.facilitatesVehicleFinance,
  },

  // --------------------------------------------------------------------------
  // Consumer Protection / Right to Repair
  // --------------------------------------------------------------------------
  {
    id: 'AD_P4_016',
    phase: 4,
    text: 'Is a Grievance Officer appointed with contact details displayed at every outlet and on your website, and is a 30-day complaint response SLA in place?',
    helpText: 'Consumer Protection Act 2019 and the CCPA (Central Consumer Protection Authority) require businesses to appoint a Grievance Officer and display contact prominently. CCPA can issue guidelines and penalties for non-display.',
    type: 'yes_no',
    weight: 6,
    complianceArea: 'consumer_protection',
    source: 'Research §4.12, Consumer Protection Act 2019 §2(18)',
    gapTemplate: {
      finding: 'Grievance Officer not appointed or not displayed at outlets and website.',
      recommendation: 'Appoint Grievance Officer (senior manager); display name, email, phone at each outlet reception and on website footer; set up 30-day resolution SLA; log all complaints.',
      timeline: '30_days',
      penaltyExposure: 'CCPA notice; Rs.10 lakh fine (first) for unfair trade practice; Rs.50 lakh for repeat',
    },
    compliantAnswers: ['yes'],
    appliesWhen: (_p: ApplicabilityProfile) => true,
  },
  {
    id: 'AD_P4_017',
    phase: 4,
    text: 'Is a spare-parts price list available to customers on demand (Right to Repair obligation), and are repair manuals / FAQs accessible?',
    helpText: 'Automobile sector was formally onboarded to the Right to Repair portal (righttorepairindia.gov.in) in July 2024. Dealers must provide: spare-parts price list on demand; maintenance manuals (or OEM links); no refusal to service vehicles repaired elsewhere with genuine parts.',
    type: 'yes_no',
    weight: 6,
    complianceArea: 'consumer_protection',
    source: 'Research §4.12 / §6, righttorepairindia.gov.in',
    gapTemplate: {
      finding: 'Spare-parts price list not available or Right to Repair obligations not met.',
      recommendation: 'Print / display current spare-parts price list at service reception; link to OEM repair manuals on website; do not refuse service to vehicles repaired outside under warranty voiding pretext.',
      timeline: '30_days',
      penaltyExposure: 'Consumer Commission complaint; CCPA investigation; adverse publicity',
    },
    compliantAnswers: ['yes'],
    appliesWhen: (_p: ApplicabilityProfile) => true,
  },
  {
    id: 'AD_P4_018',
    phase: 4,
    text: 'When an OEM issues a vehicle recall, are recall communications executed in time and a customer tracking log maintained?',
    helpText: 'Consumer Protection Act requires dealers to cooperate in product recalls. Failure to inform customers of safety recalls (especially airbag or steering defects) can lead to CCPA proceedings and significant liability in any resultant accident.',
    type: 'yes_no',
    weight: 7,
    complianceArea: 'consumer_protection',
    source: 'Research §4.12, Consumer Protection Act 2019 §2(34)',
    gapTemplate: {
      finding: 'OEM recall execution process not documented.',
      recommendation: 'Set up OEM recall notification alerts (OEM portal, VAHAN recall bulletin); maintain customer contact database; communicate recall via SMS/email within 48 hrs of notification; log completion.',
      timeline: '30_days',
      penaltyExposure: 'CCPA action; civil/criminal liability if injury occurs post-recall notice to dealer',
    },
    compliantAnswers: ['yes'],
    appliesWhen: (_p: ApplicabilityProfile) => true,
  },
  {
    id: 'AD_P4_019',
    phase: 4,
    text: 'Are all accessories, oils, and coolants sold at the dealership displaying MRP (no overcharging above MRP)?',
    helpText: 'Legal Metrology Act 2009 requires all packaged commodities to display MRP. Dealerships routinely charge above MRP on engine oil, coolant, and accessories — a common consumer complaint and legal metrology violation.',
    type: 'yes_no',
    weight: 6,
    complianceArea: 'consumer_protection',
    source: 'Research §4.12, Legal Metrology Act 2009 §18',
    gapTemplate: {
      finding: 'Overcharging above MRP on accessories/oils or MRP not displayed.',
      recommendation: 'Audit all shelf prices vs. MRP; strictly enforce no overcharging policy; train sales/service staff; display "We charge only MRP" notice at service counter.',
      timeline: '30_days',
      penaltyExposure: 'Rs.25,000 first offence / Rs.50,000 second / Rs.1 lakh third + forfeiture under Legal Metrology Act',
    },
    compliantAnswers: ['yes'],
    appliesWhen: (p: ApplicabilityProfile) => p.sellsAccessories,
  },
  {
    id: 'AD_P4_020',
    phase: 4,
    text: 'Is all marketing and advertising (digital, print, social) truthful and compliant with ASCI guidelines — including no misleading mileage, EMI, or exchange-value claims?',
    helpText: 'CCPA (Central Consumer Protection Authority) has issued guidelines on misleading advertisements. ASCI (Advertising Standards Council of India) adjudicates complaints against dealers. Common violations: understated on-road price, inflated exchange value, "guaranteed mileage" claims not backed by test data.',
    type: 'yes_no',
    weight: 5,
    complianceArea: 'consumer_protection',
    source: 'Research §4.12, CCPA Guidelines 2022, ASCI Code',
    gapTemplate: {
      finding: 'Marketing claims may be misleading — CCPA and ASCI risk.',
      recommendation: 'Review all digital and print ads against ASCI code; add disclaimers to mileage/EMI claims; stop using "guaranteed" for figures that depend on usage; appoint compliance reviewer for marketing.',
      timeline: '30_days',
      penaltyExposure: 'CCPA misleading ad penalty: Rs.10 lakh (first) / Rs.50 lakh (repeat); director imprisonment up to 2 yrs on repeat',
    },
    compliantAnswers: ['yes'],
    appliesWhen: (_p: ApplicabilityProfile) => true,
  },
]
