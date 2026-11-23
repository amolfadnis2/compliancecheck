// Labour Code Compliance Rules for PDF Generation
// Location: src/lib/assessments/labour-code-rules.ts
// Maps all 30 Labour Code assessment questions to detailed compliance metadata.
// Each key MUST equal the question id it describes (see labour-code-questions.ts);
// tests/unit/report-adapters.test.ts checks the pairing.

import { ComplianceRule } from '@/types/compliance';

/**
 * LABOUR CODE COMPLIANCE RULES
 * 
 * Structure follows established pattern from statutory-health rules:
 * - requirement: Short description of what must be done
 * - governmentRef: Legal citation (Act/Section)
 * - officialLink: Government portal URL
 * - deadline: When to comply
 * - penalty: Rs. amount or description
 * - actionIfNonCompliant: Array of remediation steps
 * - actionIfCompliant: Maintenance guidance
 * - applicabilityNote: Threshold info (optional)
 */

export const LABOUR_CODE_RULES: Record<string, ComplianceRule> = {
  // ============================================================================
  // CODE ON WAGES (7 Questions)
  // ============================================================================
  wages_1: {
    questionId: 'wages_1',
    requirement: 'Pay minimum wages as per Central/State notification',
    governmentRef: 'Code on Wages 2019, Section 9',
    officialLink: 'https://labour.gov.in/minimum-wages',
    deadline: 'Continuous compliance - wages due on 7th/10th of following month',
    penalty: 'Rs. 50,000 first offence; Rs. 1,00,000 repeat offence; up to 3 months imprisonment for subsequent violations',
    actionIfNonCompliant: [
      'Download latest minimum wage notification from labour.gov.in',
      'Audit current wages against applicable Central/State rates',
      'Identify shortfall for each employee category (unskilled, semi-skilled, skilled, highly skilled)',
      'Calculate arrears from date of notification',
      'Pay differential immediately with documented acknowledgement',
      'Update payroll system with new wage rates',
      'Set calendar reminder for bi-annual rate revisions',
      'Maharashtra: from 5 Nov 2026 the Maharashtra Wage Rules, 2026 replace the Maharashtra Minimum Wages Rules, 1963 and Payment of Wages Rules, 1963. Minimum wage is set per day for highly skilled, skilled, semi-skilled and unskilled workers (hourly = daily / 8; monthly = daily x 26), and VDA is revised before 1 April and 1 October'
    ],
    actionIfCompliant: 'Monitor government gazettes for minimum wage revisions (typically every 6 months). Maintain wage register as per Form I.',
    applicabilityNote: 'Applies to ALL establishments from 1 employee'
  },

  wages_2: {
    questionId: 'wages_2',
    requirement: 'Disburse wages within 7 days of wage period end',
    governmentRef: 'Code on Wages 2019, Section 17',
    officialLink: 'https://shramsuvidha.gov.in',
    deadline: '7th of following month (for monthly wage period)',
    penalty: 'Rs. 50,000 fine; interest payable to employee for delayed wages',
    actionIfNonCompliant: [
      'Review current payroll processing timeline',
      'Identify bottlenecks causing delay (attendance closure, approvals, bank processing)',
      'Set hard deadline: attendance closure by 2nd, processing by 4th, transfer by 6th',
      'Switch to NEFT/IMPS for same-day wage credit',
      'Automate attendance-to-payroll integration where possible',
      'Document and communicate revised timeline to all stakeholders',
      'Maintain proof of payment dates (bank statements, UTR numbers)'
    ],
    actionIfCompliant: 'Maintain bank transfer records. Issue wage slips on or before payday (mandatory in Maharashtra under the Maharashtra Wage Rules, 2026).',
    applicabilityNote: 'Applies to all employees; penalty increased from previous law'
  },

  wages_3: {
    questionId: 'wages_3',
    requirement: 'Settle full and final dues within 2 working days of separation',
    governmentRef: 'Code on Wages 2019, Section 17(2)',
    officialLink: 'https://labour.gov.in/sites/default/files/THE%20CODE%20ON%20WAGES%2C%202019.pdf',
    deadline: '2 working days from date of termination/resignation',
    penalty: 'Compensation payable to employee for delay; fine up to Rs. 50,000',
    actionIfNonCompliant: [
      'Revise separation policy to enable 2-day settlement',
      'Pre-compute leave encashment, gratuity, bonus during notice period',
      'Streamline no-dues clearance process',
      'Establish emergency settlement fund for immediate payouts',
      'Train HR team on accelerated F&F processing',
      'Automate calculation of all final dues'
    ],
    actionIfCompliant: 'F&F process within timeline. Document settlement dates. Keep acknowledgment receipts from separated employees.',
    applicabilityNote: 'Applies to all employees on removal, dismissal, retrenchment or resignation'
  },

  wages_4: {
    questionId: 'wages_4',
    requirement: 'Basic wages must constitute at least 50% of total remuneration',
    governmentRef: 'Code on Wages 2019, Section 2(y) - Definition of Wages',
    officialLink: 'https://labour.gov.in/code-wages-2019',
    deadline: 'Immediately - the Labour Codes have applied since 21 November 2025',
    penalty: 'Non-compliance may result in reclassification of allowances as wages, leading to increased PF/Gratuity liability with retrospective effect',
    actionIfNonCompliant: [
      'Export current salary structure for all employees',
      'Calculate basic wages as percentage of gross for each employee',
      'Identify employees with basic < 50% of gross',
      'Restructure salary: reduce HRA/Special Allowance, increase Basic',
      'Issue revised appointment letters with new salary structure',
      'Recalculate PF contributions at new basic wage',
      'Recalculate gratuity liability (15 days per year at new basic)',
      'If excluded components still exceed 50% of total pay, add the excess back to wages for gratuity, PF and other statutory benefits',
      'Update payroll software with revised structure',
      'Communicate changes to employees with comparison statement'
    ],
    actionIfCompliant: 'Review salary structure quarterly. Ensure new hires have compliant CTC breakdown from day one.',
    applicabilityNote: 'Applies to ALL employees - major impact on PF/Gratuity costs'
  },

  wages_5: {
    questionId: 'wages_5',
    requirement: 'Pay overtime at 2x normal wage rate',
    governmentRef: 'Code on Wages 2019, Section 14',
    officialLink: 'https://labour.gov.in/code-wages-2019',
    deadline: 'Immediate - payable with regular wages',
    penalty: 'Rs. 50,000 fine; repeat offences up to Rs. 1,00,000 with imprisonment up to 3 months',
    actionIfNonCompliant: [
      'Review current overtime policy and actual payment rates',
      'Calculate correct overtime rate: (Basic + DA) / 26 / 8 x 2',
      'Audit overtime hours for past 3 months',
      'Calculate differential between paid and due amounts',
      'Pay arrears immediately with documented breakdown',
      'Update overtime policy to reflect 2x rate',
      'Configure payroll system to auto-calculate at 2x',
      'Train supervisors on overtime approval and calculation',
      'Implement overtime tracking system (manual register or digital)',
      'Maharashtra: work on the weekly rest day also earns compensatory leave (Maharashtra Wage Rules, 2026)'
    ],
    actionIfCompliant: 'Maintain overtime register (Form IV). Ensure overtime does not exceed 125 hours per quarter.',
    applicabilityNote: 'Overtime limited to 125 hours per quarter under new codes'
  },

  wages_6: {
    questionId: 'wages_6',
    requirement: 'Ensure equal remuneration for equal work regardless of gender',
    governmentRef: 'Code on Wages 2019, Section 3',
    officialLink: 'https://labour.gov.in/equal-remuneration',
    deadline: 'Continuous compliance',
    penalty: 'Rs. 50,000 first offence; Rs. 1,00,000 repeat; up to 3 months imprisonment',
    actionIfNonCompliant: [
      'Conduct pay equity audit across all roles',
      'Compare compensation by gender for same job function',
      'Document legitimate differentials (experience, qualifications, performance)',
      'Eliminate unjustified gender-based pay gaps',
      'Update compensation policy with equal pay provisions',
      'Train HR and hiring managers on non-discriminatory compensation',
      'Implement structured pay bands for each role',
      'Review annually and document findings'
    ],
    actionIfCompliant: 'Conduct annual pay equity audit. Maintain documentation of pay decisions. Include equal pay clause in employment contracts.',
    applicabilityNote: 'Applies from first employee - statutory right'
  },

  wages_7: {
    questionId: 'wages_7',
    requirement: 'Pay annual bonus of 8.33% to 20% of wages',
    governmentRef: 'Code on Wages 2019, Section 26-32',
    officialLink: 'https://labour.gov.in/bonus',
    deadline: 'Within 8 months of accounting year close',
    penalty: 'Rs. 50,000 fine; up to 1 month imprisonment for repeat offence',
    actionIfNonCompliant: [
      'Identify all eligible employees (worked 30+ days, wages up to Rs. 21,000/month)',
      'Calculate allocable surplus from annual accounts',
      'Determine bonus percentage (minimum 8.33%, maximum 20%)',
      'Calculate individual bonus: (Salary or Rs. 7,000 whichever is lower) x bonus %',
      'Prepare bonus calculation sheet for each employee',
      'Disburse bonus before 8-month deadline',
      'Issue Form D (bonus receipt) to each employee',
      'Maintain bonus register (Form A) for inspection'
    ],
    actionIfCompliant: 'Calculate bonus by 6 months post year-end. Maintain Form A register. Issue Form D receipts.',
    applicabilityNote: 'Applies to establishments with 20+ employees'
  },

  // ============================================================================
  // CODE ON SOCIAL SECURITY (8 Questions)
  // ============================================================================
  ss_1: {
    questionId: 'ss_1',
    requirement: 'Register with EPFO and remit contributions by 15th of following month',
    governmentRef: 'Code on Social Security 2020, Section 6; EPF Act 1952',
    officialLink: 'https://unifiedportal-emp.epfindia.gov.in',
    deadline: 'Registration within 1 month of reaching 20 employees; contributions by 15th monthly',
    penalty: 'Rs. 5,000 - Rs. 25,000 fine; 1% interest per month on delayed contributions; up to 1 year imprisonment',
    actionIfNonCompliant: [
      'Register on EPFO Unified Portal (unifiedportal-emp.epfindia.gov.in)',
      'Obtain establishment code by submitting Form 5A',
      'Register all eligible employees (earning up to Rs. 25,000/month basic + DA)',
      'Generate UAN for each employee',
      'Calculate contributions: Employer 12% + Employee 12% of (Basic + DA)',
      'File Electronic Challan cum Return (ECR) by 15th',
      'Pay through online banking/SBI/authorized banks',
      'Submit monthly IW-1 return',
      'Obtain and retain challan receipts'
    ],
    actionIfCompliant: 'File ECR by 10th to allow buffer. Reconcile contributions monthly. Conduct annual compliance audit.',
    applicabilityNote: 'Mandatory for 20+ employees; voluntary below 20'
  },

  ss_2: {
    questionId: 'ss_2',
    requirement: 'Remit EPF contributions by the 15th of the following month',
    governmentRef: 'Code on Social Security 2020, Section 16; EPF Scheme Para 38',
    officialLink: 'https://unifiedportal-emp.epfindia.gov.in',
    deadline: '15th of month following wage month',
    penalty: '1% damage per month + 12% p.a. interest; prosecution for persistent default',
    actionIfNonCompliant: [
      'Generate ECR (Electronic Challan cum Return) on EPFO portal',
      'Total contribution: 24% (12% employee + 12% employer)',
      'Breakup: EPF 3.67%, EPS 8.33%, Admin 0.5%, EDLI 0.5%',
      'Pay through EPFO-approved banks before 15th',
      'Verify TRRN (Transaction Reference Number) after payment',
      'Download ECR receipt for records'
    ],
    actionIfCompliant: 'EPF contributions timely. Maintain 6-year record retention. Reconcile annual account statements.',
    applicabilityNote: 'Mandatory for 20+ employees'
  },

  ss_3: {
    questionId: 'ss_3',
    requirement: 'Register with ESIC and remit contributions by 15th of following month',
    governmentRef: 'Code on Social Security 2020, Section 28; ESI Act 1948',
    officialLink: 'https://esic.gov.in',
    deadline: 'Registration within 15 days of applicability; contributions by 15th monthly',
    penalty: 'Rs. 5,000 - Rs. 25,000 fine; 12% interest per annum on delayed contributions; imprisonment up to 2 years',
    actionIfNonCompliant: [
      'Register on ESIC portal (esic.gov.in)',
      'Obtain employer code number',
      'Register all employees earning up to Rs. 21,000/month (Rs. 25,000 for PwD)',
      'Generate Insurance Number (IP Number) for each employee',
      'Calculate contributions: Employer 3.25% + Employee 0.75% of gross wages',
      'File contribution through ESIC portal by 15th',
      'Submit half-yearly returns (RC-11)',
      'Display ESIC certificate at workplace',
      'Inform employees about nearest ESI dispensary/hospital'
    ],
    actionIfCompliant: 'File by 10th monthly. Submit RC-11 by January 11 and July 11. Update employee records promptly.',
    applicabilityNote: '10+ employees; No threshold for hazardous establishments'
  },

  ss_4: {
    questionId: 'ss_4',
    requirement: 'Maintain gratuity provision/insurance for eligible employees',
    governmentRef: 'Code on Social Security 2020, Section 53; Payment of Gratuity Act 1972',
    officialLink: 'https://labour.gov.in/gratuity',
    deadline: 'Provision from 10+ employees; payment within 30 days of becoming due',
    penalty: 'Rs. 10,000 - Rs. 1,00,000 fine; 6 months to 2 years imprisonment; interest on delayed payment',
    actionIfNonCompliant: [
      'Calculate gratuity liability for all employees with 5+ years service',
      'Formula: (15 x last drawn wages x years of service) / 26',
      'Wages = Basic + DA',
      'Consider obtaining gratuity insurance from LIC/approved insurer',
      'Create gratuity provision in books annually',
      'Maintain Form F nomination register',
      'Display Form U at workplace',
      'Process gratuity within 30 days of employee exit',
      'Pay interest at 10% for any delay beyond 30 days'
    ],
    actionIfCompliant: 'Review liability annually. Obtain actuarial valuation for large workforce. Maintain Form F nominations.',
    applicabilityNote: '10+ employees; Fixed-term workers eligible after 1 year (not 5)'
  },

  ss_5: {
    questionId: 'ss_5',
    requirement: 'Pay pro-rata gratuity to fixed-term employees after 1 year',
    governmentRef: 'Code on Social Security 2020, Section 53(2)(b)',
    officialLink: 'https://labour.gov.in/sites/default/files/SS_Code_Gazette.pdf',
    deadline: 'Upon completion of 1 year service by fixed-term employee',
    penalty: 'Non-payment treated as gratuity denial; penalties under Gratuity Act',
    actionIfNonCompliant: [
      'Fixed-term employees are eligible after 1 year (vs 5 years for regular)',
      'Calculate pro-rata gratuity: 15 days wages per year of service',
      'Wages = last drawn basic + DA, plus any excess of excluded allowances over 50% of total pay',
      'Include in final settlement for fixed-term contract completion',
      'Update HR policies and employment contracts',
      'Budget for enhanced gratuity liability'
    ],
    actionIfCompliant: 'Fixed-term gratuity policy updated. Include in employment contracts. Track tenure for eligibility.',
    applicabilityNote: 'Fixed-term employees in establishments covered by gratuity (10+ employees)'
  },

  ss_6: {
    questionId: 'ss_6',
    requirement: 'Provide maternity benefits as per statutory entitlements',
    governmentRef: 'Code on Social Security 2020, Section 60-67; Maternity Benefit Act 1961',
    officialLink: 'https://labour.gov.in/maternity-benefit',
    deadline: 'Continuous compliance; payments due on regular pay dates',
    penalty: 'Rs. 50,000 - Rs. 5,00,000 fine; 3 months to 1 year imprisonment',
    actionIfNonCompliant: [
      'Update maternity policy to reflect new entitlements',
      '26 weeks paid leave for first two children',
      '12 weeks for third child onwards',
      '12 weeks for adoptive/commissioning mothers (child < 3 months)',
      'Work from home option for 6 months post return (nature of work permitting)',
      'No termination during maternity period',
      'Calculate average daily wage for maternity payment',
      'Inform employees of entitlements in writing',
      'Maintain maternity benefit register'
    ],
    actionIfCompliant: 'Document policy clearly. Train managers on non-discrimination. Track maternity leave usage.',
    applicabilityNote: '10+ employees; ESI-covered employees get benefits via ESIC'
  },

  ss_7: {
    questionId: 'ss_7',
    requirement: 'Register gig/platform workers on social security portal',
    governmentRef: 'Code on Social Security 2020, Section 114',
    officialLink: 'https://labour.gov.in/code-social-security-2020',
    deadline: 'The Code on Social Security has applied since 21 November 2025; follow the scheme notifications for contribution dates',
    penalty: 'Rs. 1,00,000 - Rs. 5,00,000 fine for non-registration',
    actionIfNonCompliant: [
      'Identify all gig workers and platform workers engaged',
      'Gig worker: Works outside traditional employer-employee relationship',
      'Platform worker: Engaged via online platforms (delivery, ride-sharing)',
      'Register on Aadhaar-based National Portal (when launched)',
      'Contribute 1-2% of annual turnover to Social Security Fund',
      'Maximum contribution cap: 5% of amount payable to workers',
      'Covered: ride-sharing, food delivery, logistics, e-commerce, healthcare, fintech',
      'Maintain register of gig/platform workers engaged',
      'Provide platform workers with identity cards'
    ],
    actionIfCompliant: 'Monitor scheme notifications. Budget for contribution (1-2% of gig worker payments). Maintain payment records.',
    applicabilityNote: 'Applies to aggregators/platform companies engaging gig workers'
  },

  ss_8: {
    questionId: 'ss_8',
    requirement: 'Provide creche facility for establishments with 50+ employees',
    governmentRef: 'Code on Social Security 2020, Section 67',
    officialLink: 'https://labour.gov.in/code-social-security-2020',
    deadline: 'Within 6 months of reaching 50 employees',
    penalty: 'Rs. 50,000 - Rs. 2,00,000 fine',
    actionIfNonCompliant: [
      'Assess number of children requiring creche (age 0-6 years)',
      'Option 1: Establish on-site creche within 500 meters',
      'Option 2: Tie-up with approved creche facility nearby',
      'Option 3: Provide creche allowance (state-specific rules)',
      'Ensure facility meets prescribed standards (space, staff, safety)',
      'Allow 4 visits per day to creche during work hours',
      'Display creche location and timings at workplace',
      'Maintain attendance register for children'
    ],
    actionIfCompliant: 'Conduct annual inspection of creche facility. Get feedback from employee parents. Ensure staff training.',
    applicabilityNote: '50+ employees where women are employed'
  },

  // ============================================================================
  // OSH CODE (8 Questions)
  // ============================================================================
  osh_1: {
    questionId: 'osh_1',
    requirement: 'Register establishment on Shram Suvidha Portal',
    governmentRef: 'OSH Code 2020, Section 3',
    officialLink: 'https://shramsuvidha.gov.in',
    deadline: 'Within 60 days of commencement; deemed approved if not rejected in 7 days',
    penalty: 'Rs. 50,000 first offence; Rs. 2,00,000 repeat; up to 3 months imprisonment',
    actionIfNonCompliant: [
      'Visit shramsuvidha.gov.in',
      'Click "Register" and select establishment type',
      'Fill single registration form (replaces 6 previous registrations)',
      'Upload required documents (PAN, address proof, workforce details)',
      'Pay applicable fee online',
      'Track application status',
      'Deemed registration if no response within prescribed period',
      'Display registration certificate at workplace',
      'Update registration for any material changes'
    ],
    actionIfCompliant: 'Renew before expiry. Update workforce count changes. Display current certificate prominently.',
    applicabilityNote: '10+ workers for general establishments; lower thresholds for specific industries'
  },

  osh_2: {
    questionId: 'osh_2',
    requirement: 'Maintain working hours within statutory limits (8 hours/day, 48 hours/week)',
    governmentRef: 'OSH Code 2020, Section 25-26',
    officialLink: 'https://labour.gov.in/osh-code-2020',
    deadline: 'Continuous compliance',
    penalty: 'Rs. 2,00,000 fine; repeat violations up to Rs. 5,00,000 with 3 months imprisonment',
    actionIfNonCompliant: [
      'Audit current working hours using attendance records',
      'Maximum: 8 hours/day, 48 hours/week (including overtime)',
      'Overtime must not exceed 125 hours per quarter',
      'Spread over (including rest intervals) not to exceed 10.5 hours',
      'Mandatory weekly off (1 day in 7)',
      'Implement time tracking system',
      'Train supervisors on hour limits',
      'Schedule work to avoid regular overtime',
      'Consider shift rotations for extended operations',
      'Maharashtra: 8-hour normal working day for daily-wage employees, 48 hours a week, mandatory weekly rest (Maharashtra Wage Rules, 2026)'
    ],
    actionIfCompliant: 'Review attendance monthly. Maintain overtime register. Pre-approve all overtime.',
    applicabilityNote: 'Applies to all workers; special provisions for hazardous work'
  },

  osh_3: {
    questionId: 'osh_3',
    requirement: 'Obtain written consent for overtime work',
    governmentRef: 'OSH Code 2020, Section 27',
    officialLink: 'https://labour.gov.in/osh-code-2020',
    deadline: 'Before assigning overtime',
    penalty: 'Rs. 1,00,000 fine for forced overtime',
    actionIfNonCompliant: [
      'Create overtime consent form template',
      'Include: date, expected hours, reason, employee signature',
      'Obtain consent before each overtime assignment (or standing consent with opt-out)',
      'Maintain consent records for minimum 3 years',
      'Never force overtime - it must be voluntary',
      'Communicate overtime limits (125 hours/quarter)',
      'Pay overtime wages on regular pay date',
      'Allow employees to refuse overtime without penalty'
    ],
    actionIfCompliant: 'Review consent process quarterly. Train supervisors on voluntary nature. Audit compliance.',
    applicabilityNote: 'Mandatory written consent; verbal agreement insufficient'
  },

  osh_4: {
    questionId: 'osh_4',
    requirement: 'Provide safety measures for women working night shifts',
    governmentRef: 'OSH Code 2020, Section 43',
    officialLink: 'https://labour.gov.in/osh-code-2020',
    deadline: 'Before allowing women to work night shifts (7 PM - 6 AM)',
    penalty: 'Rs. 2,00,000 fine; criminal liability for any incident',
    actionIfNonCompliant: [
      'Obtain written consent from women employees for night work',
      'Provide safe transportation from residence to workplace and back',
      'Ensure adequate lighting in all work areas and pathways',
      'Deploy security personnel during night shift',
      'Install CCTV in common areas',
      'Provide separate rest rooms and sanitary facilities',
      'Ensure communication facility (phone, helpline) is available',
      'Train night shift supervisors on safety protocols',
      'Maintain register of women working night shifts'
    ],
    actionIfCompliant: 'Review safety measures quarterly. Conduct surprise checks. Get feedback from women employees.',
    applicabilityNote: 'Night work permitted with consent and adequate safeguards'
  },

  osh_5: {
    questionId: 'osh_5',
    requirement: 'Register as principal employer for contract labour (50+ workers)',
    governmentRef: 'OSH Code 2020, Section 45-54',
    officialLink: 'https://shramsuvidha.gov.in',
    deadline: 'Before engaging 50+ contract workers',
    penalty: 'Rs. 1,00,000 - Rs. 5,00,000 fine; imprisonment up to 3 months',
    actionIfNonCompliant: [
      'Count all contract workers engaged through contractors',
      'If 50+, register as principal employer on Shram Suvidha',
      'Ensure contractors have valid license',
      'Verify contractors wage payments monthly',
      'Maintain register of contractors and contract workers',
      'Display contract labour work order details',
      'Ensure contract workers get wages equal to regular workers for same work',
      'No contract labour in core activities',
      'Pay workers directly if contractor defaults'
    ],
    actionIfCompliant: 'Audit contractor compliance quarterly. Verify wage payments. Maintain contractor performance records.',
    applicabilityNote: 'Threshold raised from 20 to 50 contract workers under new code'
  },

  osh_6: {
    questionId: 'osh_6',
    requirement: 'Deploy contract labour only in non-core activities',
    governmentRef: 'OSH Code 2020, Section 57',
    officialLink: 'https://labour.gov.in/sites/default/files/OSHCODE2020.pdf',
    deadline: 'Continuous compliance',
    penalty: 'Contract workers may claim permanent employment; back-wages liability',
    actionIfNonCompliant: [
      'Contract labour is prohibited in core activities of the establishment',
      'Permissible: sanitation, security, canteen, housekeeping',
      'Exception: sudden volume spikes, intermittent work',
      'Audit current contract worker deployment',
      'Reclassify core activity workers as regular employees or outsource function',
      'Document justification for any non-standard contract deployment'
    ],
    actionIfCompliant: 'Contract deployment in permitted areas. Review annually. Document work nature for all contract workers.',
    applicabilityNote: 'Applies wherever contract labour is engaged'
  },

  osh_7: {
    questionId: 'osh_7',
    requirement: 'Provide canteen facility for 100+ workers',
    governmentRef: 'OSH Code 2020, Second Schedule',
    officialLink: 'https://labour.gov.in/osh-code-2020',
    deadline: 'Within 6 months of reaching 100 workers',
    penalty: 'Rs. 50,000 - Rs. 2,00,000 fine',
    actionIfNonCompliant: [
      'Assess canteen requirement based on worker count',
      'Option 1: Establish on-site canteen meeting standards',
      'Option 2: Contract with approved catering service',
      'Minimum standards: clean, adequate seating, hygienic food preparation',
      'Food must be subsidized or at no-profit basis',
      'Canteen committee with worker representation',
      'Display menu and prices prominently',
      'Maintain FSSAI compliance for food service',
      'Regular health inspection of canteen facility'
    ],
    actionIfCompliant: 'Monthly hygiene audit. Quarterly food quality check. Annual pest control inspection.',
    applicabilityNote: '100+ workers; may vary by state rules'
  },

  osh_8: {
    questionId: 'osh_8',
    requirement: 'Comply with inter-state migrant worker provisions',
    governmentRef: 'Code on Social Security 2020, Section 68-74',
    officialLink: 'https://labour.gov.in/code-social-security-2020',
    deadline: 'Continuous compliance for establishments engaging migrants',
    penalty: 'Rs. 50,000 - Rs. 2,00,000 fine',
    actionIfNonCompliant: [
      'Identify inter-state migrant workers (from other state for Rs. 18,000/month or less)',
      'Register migrant workers on Shram Suvidha Portal',
      'Provide displacement allowance (one-time)',
      'Ensure journey allowance for annual home visit',
      'Provide suitable accommodation or allowance',
      'Deduct and remit employee share of benefits',
      'Maintain register of inter-state migrant workers',
      'Display information about entitlements in workers language',
      'Facilitate banking and ration card portability'
    ],
    actionIfCompliant: 'Maintain updated register. Provide annual home journey facilitation. Ensure wage portability.',
    applicabilityNote: 'Applies to workers earning up to Rs. 18,000/month from different state'
  },

  // ============================================================================
  // INDUSTRIAL RELATIONS CODE (7 Questions)
  // ============================================================================
  ir_1: {
    questionId: 'ir_1',
    requirement: 'Constitute Grievance Redressal Committee (GRC) for 20+ workers',
    governmentRef: 'Industrial Relations Code 2020, Section 4',
    officialLink: 'https://labour.gov.in/industrial-relations-code-2020',
    deadline: 'Within 3 months of reaching 20 workers',
    penalty: 'Rs. 50,000 - Rs. 2,00,000 fine',
    actionIfNonCompliant: [
      'Form GRC with equal employer and worker representation',
      'Maximum 10 members total',
      'Include proportionate women representation',
      'Chairperson from employer side; Co-chair from worker side',
      'Term of members: 2 years',
      'GRC must resolve grievances within 30 days',
      'Unresolved grievances escalate to conciliation within 60 days',
      'Maintain grievance register and resolution records',
      'Display GRC member names and grievance procedure',
      'Train committee members on grievance handling'
    ],
    actionIfCompliant: 'Meet monthly. Track resolution time. Report to management on trends.',
    applicabilityNote: '20+ workers; mandatory for all establishments'
  },

  ir_2: {
    questionId: 'ir_2',
    requirement: 'Certify Standing Orders for 300+ workers',
    governmentRef: 'Industrial Relations Code 2020, Section 30',
    officialLink: 'https://labour.gov.in/industrial-relations-code-2020',
    deadline: 'Within 6 months of reaching 300 workers',
    penalty: 'Rs. 50,000 fine; Model Standing Orders deemed applicable',
    actionIfNonCompliant: [
      'Download Model Standing Orders from labour department',
      'Customize based on establishment needs (optional)',
      'Standing Orders must cover: worker classification, working hours, holidays, leave, termination, disciplinary procedure, grievance mechanism',
      'Submit to Certifying Officer for approval',
      'Deemed certified if no objection within 60 days',
      'Display certified Standing Orders prominently',
      'Provide copy to workers in vernacular language',
      'Any modification requires re-certification',
      'Workers can raise objections during certification'
    ],
    actionIfCompliant: 'Review Standing Orders annually. Update for any policy changes. Ensure worker awareness.',
    applicabilityNote: 'Threshold raised from 100 to 300 workers under new code'
  },

  ir_3: {
    questionId: 'ir_3',
    requirement: 'Constitute Works Committee for 100+ workers',
    governmentRef: 'Industrial Relations Code 2020, Section 3',
    officialLink: 'https://labour.gov.in/industrial-relations-code-2020',
    deadline: 'Within 3 months of reaching 100 workers',
    penalty: 'Rs. 50,000 fine',
    actionIfNonCompliant: [
      'Form Works Committee with equal employer-worker representation',
      'Worker representatives elected by workers (not nominated)',
      'Employer representatives nominated by management',
      'Functions: promote good relations, consult on matters of common interest',
      'Matters: productivity, welfare, training, safety, conditions of work',
      'Meet at least quarterly',
      'Maintain minutes of meetings',
      'Implement agreed recommendations',
      'Committee is consultative, not negotiating body'
    ],
    actionIfCompliant: 'Quarterly meetings minimum. Circulation of minutes within 7 days. Track implementation of recommendations.',
    applicabilityNote: '100+ workers; separate from GRC'
  },

  ir_4: {
    questionId: 'ir_4',
    requirement: 'Treat concerted casual leave by 50%+ workers as a strike in policy',
    governmentRef: 'Industrial Relations Code 2020, Section 2(zk)',
    officialLink: 'https://labour.gov.in/sites/default/files/IR_Code_Gazette.pdf',
    deadline: 'Immediate awareness and policy update',
    penalty: 'Employer can take disciplinary action for illegal strike',
    actionIfNonCompliant: [
      'Under the IR Code, 50%+ workers taking concerted casual leave on a day counts as a strike',
      'Update leave policy to address concerted leave',
      'Train supervisors to identify and report mass leave patterns',
      'Implement leave approval workflow',
      'Document attendance patterns for evidence',
      'Have contingency plan for sudden mass absences'
    ],
    actionIfCompliant: 'Policy updated. Attendance monitoring in place. HR trained on new definition.',
    applicabilityNote: 'Applies to all industrial establishments'
  },

  ir_5: {
    questionId: 'ir_5',
    requirement: 'Serve 14-day strike notice and inform government',
    governmentRef: 'Industrial Relations Code 2020, Section 62',
    officialLink: 'https://labour.gov.in/industrial-relations-code-2020',
    deadline: '14 days before any proposed work stoppage',
    penalty: 'Strike without notice: fine up to Rs. 50,000 and imprisonment up to 1 month for workers; illegal lockout: Rs. 5,00,000 fine for employer',
    actionIfNonCompliant: [
      'Understand new requirement: 14-day notice applies to ALL establishments (not just public utilities)',
      'Strike definition expanded: includes concerted casual leave by 50%+ workers',
      'Notice must be in prescribed format',
      'Submit copy to conciliation officer within 5 days of giving notice',
      'Notice valid for maximum 60 days',
      'Strike prohibited during: conciliation proceedings + 7 days after; tribunal proceedings + 60 days after',
      'Strike prohibited during operation of settlement/award',
      'Train managers on recognizing strike indicators early',
      'Establish early warning system for labor disputes'
    ],
    actionIfCompliant: 'Maintain open communication with workers. Address grievances promptly. Document all labor communications.',
    applicabilityNote: 'Now applies to ALL establishments, not just public utilities'
  },

  ir_6: {
    questionId: 'ir_6',
    requirement: 'Ensure equal treatment for fixed-term employees',
    governmentRef: 'Industrial Relations Code 2020, Section 2(p)',
    officialLink: 'https://labour.gov.in/industrial-relations-code-2020',
    deadline: 'Continuous compliance',
    penalty: 'Rs. 50,000 fine; employee claims for differential treatment',
    actionIfNonCompliant: [
      'Review all fixed-term contracts',
      'Compare terms with permanent employees in same category',
      'Ensure equal wages for equal work',
      'Provide pro-rata benefits: bonus, leave, provident fund',
      'Fixed-term contracts must specify duration clearly',
      'Cannot terminate before term without cause',
      'No conversion to permanent required regardless of renewals',
      'Document legitimate business reason for fixed-term engagement',
      'Issue proper appointment letter specifying fixed term'
    ],
    actionIfCompliant: 'Annual audit of fixed-term employment. Ensure benefit parity. Maintain proper documentation.',
    applicabilityNote: 'Fixed-term employees entitled to all statutory benefits proportionately'
  },

  ir_7: {
    questionId: 'ir_7',
    requirement: 'Follow LIFO (Last-In-First-Out) for retrenchment',
    governmentRef: 'Industrial Relations Code 2020, Section 70',
    officialLink: 'https://labour.gov.in/sites/default/files/IR_Code_Gazette.pdf',
    deadline: 'Before any retrenchment exercise',
    penalty: 'Retrenchment can be challenged; reinstatement with back wages',
    actionIfNonCompliant: [
      'Last-In-First-Out (LIFO) principle mandatory within worker categories',
      'Retrench junior workers first in each category',
      'Compensation: 15 days wages per year of service',
      'Contribute 15 days wages to Reskilling Fund within 45 days',
      '60 days notice for closure to workers and government',
      '300+ workers: Prior government permission required for retrenchment/closure'
    ],
    actionIfCompliant: 'LIFO documented in policy. Retrenchment procedure formalized. HR trained.',
    applicabilityNote: 'Applies to any retrenchment of workers'
  }
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get rules for a specific Labour Code category
 */
export function getRulesByCategory(category: 'wages' | 'social_security' | 'osh' | 'ir'): ComplianceRule[] {
  const prefixes: Record<string, string> = {
    wages: 'wages_',
    social_security: 'ss_',
    osh: 'osh_',
    ir: 'ir_'
  };
  
  const prefix = prefixes[category];
  return Object.values(LABOUR_CODE_RULES).filter(rule => rule.questionId.startsWith(prefix));
}

/**
 * Get all high-priority rules (penalty > Rs. 1 lakh or imprisonment)
 */
export function getHighPriorityRules(): ComplianceRule[] {
  return Object.values(LABOUR_CODE_RULES).filter(rule => 
    rule.penalty.includes('imprisonment') || 
    rule.penalty.includes('1,00,000') ||
    rule.penalty.includes('2,00,000') ||
    rule.penalty.includes('5,00,000')
  );
}

/**
 * Get rules by employee threshold
 */
export function getRulesByThreshold(employeeCount: number): ComplianceRule[] {
  const thresholdMap: Record<string, number> = {
    wages_1: 1,
    wages_2: 1,
    wages_3: 1,
    wages_4: 1,
    wages_5: 1,
    wages_6: 1,
    wages_7: 20,
    ss_1: 20,
    ss_2: 20,
    ss_3: 10,
    ss_4: 10,
    ss_5: 1,
    ss_6: 10,
    ss_7: 1,
    ss_8: 50,
    osh_1: 10,
    osh_2: 1,
    osh_3: 1,
    osh_4: 1,
    osh_5: 50,
    osh_6: 1,
    osh_7: 100,
    osh_8: 1,
    ir_1: 20,
    ir_2: 300,
    ir_3: 100,
    ir_4: 1,
    ir_5: 1,
    ir_6: 1,
    ir_7: 1
  };
  
  return Object.entries(LABOUR_CODE_RULES)
    .filter(([id]) => (thresholdMap[id] || 0) <= employeeCount)
    .map(([, rule]) => rule);
}

export default LABOUR_CODE_RULES;
