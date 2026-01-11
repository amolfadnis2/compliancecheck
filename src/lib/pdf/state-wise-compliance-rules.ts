/**
 * State-Wise Compliance Rules for PDF Report Generation
 * Comprehensive rules for all 39 Phase 2 questions with:
 * - Legal references (Act/Section)
 * - Penalties for non-compliance
 * - Deadlines
 * - Step-by-step remediation actions
 * - Official portal links
 * 
 * @version 1.0
 * @created December 31, 2025
 */

export interface StateWiseComplianceRule {
  questionId: string;
  category: string;
  requirement: string;
  governmentRef: string;
  officialLink: string;
  deadline: string;
  penalty: string;
  actionIfNonCompliant: string[];
  actionIfCompliant: string;
}

export const STATE_WISE_COMPLIANCE_RULES: Record<string, StateWiseComplianceRule> = {
  // ==========================================================================
  // EPF QUESTIONS (3 questions)
  // ==========================================================================

  EPF_01: {
    questionId: 'EPF_01',
    category: 'Provident Fund',
    requirement: 'EPFO Registration with Active Establishment Code',
    governmentRef: 'EPF & MP Act, 1952 - Section 1(3) | EPF Scheme Para 30',
    officialLink: 'https://unifiedportal-emp.epfindia.gov.in',
    deadline: 'Within 1 month of crossing 20 employees threshold',
    penalty: 'Up to Rs.25,000 fine and/or imprisonment up to 1 year. Continued default: additional Rs.100/day',
    actionIfNonCompliant: [
      'Register immediately on EPFO Unified Portal (unifiedportal-emp.epfindia.gov.in)',
      'Obtain Establishment Code Number by submitting Form 5A',
      'Register all eligible employees (earning up to Rs.15,000/month basic + DA)',
      'Apply for Digital Signature Certificate (DSC) for authorized signatory',
      'Submit establishment details including PAN, registered address, nature of business',
    ],
    actionIfCompliant: 'EPFO registration in order. Ensure annual renewal of Digital Signature Certificate (DSC) and update KYC of authorized signatory when changed.',
  },

  EPF_02: {
    questionId: 'EPF_02',
    category: 'Provident Fund',
    requirement: 'Monthly ECR Filing by 15th',
    governmentRef: 'EPF Scheme Para 38 | EPF (Amendment) Rules 2016',
    officialLink: 'https://unifiedportal-emp.epfindia.gov.in',
    deadline: '15th of each month for previous month contribution',
    penalty: '1% damage per month on delayed payment + 12% p.a. simple interest. Prosecution for willful default.',
    actionIfNonCompliant: [
      'Generate ECR immediately on EPFO Unified Portal',
      'Calculate arrears: Employee 12% + Employer 12% + Admin 0.5% on Basic + DA',
      'Pay using EPFO-approved bank challan (SBI, HDFC, ICICI, PNB)',
      'Update employee UAN details if pending',
      'Set calendar reminders for 10th of each month for ECR preparation',
      'Automate payroll system integration with EPFO portal',
    ],
    actionIfCompliant: 'ECR filing compliant. Maintain 6-year record retention as per EPF Scheme Para 36A. Reconcile monthly statements.',
  },

  EPF_03: {
    questionId: 'EPF_03',
    category: 'Provident Fund',
    requirement: 'Correct Contribution Rate (12%+12%+0.5%)',
    governmentRef: 'EPF Scheme Para 29-31 | EPS Para 32 | EDLI Para 21',
    officialLink: 'https://epfindia.gov.in/site_docs/PDFs/Circulars/Y2021-2022/FD_Wage_Ceiling_EDLI_01032021.pdf',
    deadline: 'Continuous compliance with each salary disbursement',
    penalty: 'Short contribution treated as arrears with 12% interest + damages up to 100% of arrears',
    actionIfNonCompliant: [
      'Audit current contribution calculation methodology',
      'Verify wage components: Basic + DA must form PF contribution base',
      'Correct rate: Employee 12%, Employer 12% (8.33% EPS + 3.67% EPF), Admin 0.5%, EDLI 0.5%',
      'Recalculate for all employees and deposit differential with interest',
      'Update payroll software configuration',
      'For employees earning above Rs.15,000, offer voluntary higher contribution',
    ],
    actionIfCompliant: 'Contribution rates correct. Monitor for wage revisions that may change contribution calculations.',
  },

  // ==========================================================================
  // ESI QUESTIONS (3 questions)
  // ==========================================================================

  ESI_01: {
    questionId: 'ESI_01',
    category: 'Employees State Insurance',
    requirement: 'ESIC Registration',
    governmentRef: 'ESI Act, 1948 - Section 2A | ESI (General) Regulations 1950',
    officialLink: 'https://www.esic.gov.in/employer-registration',
    deadline: 'Within 15 days of applicability (10+ employees with wages up to Rs.21,000)',
    penalty: 'Penalty up to 12% p.a. interest + 5-25% damages on contribution amount',
    actionIfNonCompliant: [
      'Register online at esic.gov.in using Shram Suvidha Portal credentials',
      'Obtain 17-digit ESIC Code for your establishment',
      'Register all eligible employees (earning up to Rs.21,000/month)',
      'Collect employee family details for IP registration',
      'Link Aadhaar for all insured persons',
      'Display ESIC registration certificate at workplace',
    ],
    actionIfCompliant: 'ESIC registration compliant. File half-yearly returns (Form 6) by 11th May and 11th November. Renew annually.',
  },

  ESI_02: {
    questionId: 'ESI_02',
    category: 'Employees State Insurance',
    requirement: 'Monthly ESI Contribution by 15th',
    governmentRef: 'ESI Act, 1948 - Section 39(5) | ESI Rules - Rule 31',
    officialLink: 'https://www.esic.gov.in/contribution',
    deadline: '15th of following month',
    penalty: 'Simple interest at 12% p.a. on delayed payment + damages up to 25% of contribution',
    actionIfNonCompliant: [
      'Calculate contribution arrears: Employee share 0.75% + Employer share 3.25% = 4% of gross wages',
      'Log into ESIC Portal and generate challan',
      'Pay via online banking only (cash/cheque not accepted)',
      'Update monthly contribution details on portal',
      'Automate salary processing to calculate ESI correctly',
      'File contribution through ESIC portal before 15th',
    ],
    actionIfCompliant: 'ESI contributions timely. Maintain records for 5 years. Ensure employees receive IP cards.',
  },

  ESI_03: {
    questionId: 'ESI_03',
    category: 'Employees State Insurance',
    requirement: 'ESI Coverage for Eligible Employees (up to Rs.21,000)',
    governmentRef: 'ESI Act, 1948 - Section 2(9) | ESI Wage Ceiling Notification 2017',
    officialLink: 'https://www.esic.gov.in',
    deadline: 'Immediate enrollment upon joining for eligible employees',
    penalty: 'Employer liable for medical expenses of unregistered employees + penal interest',
    actionIfNonCompliant: [
      'Review employee roster for all earning up to Rs.21,000/month',
      'Identify missed enrollments from date of eligibility',
      'Register all eligible employees on ESIC portal with Aadhaar',
      'Deposit back contributions with applicable interest and damages',
      'Update HR systems to auto-flag ESI-eligible hires',
      'Note: Rs.25,000 ceiling applies for disabled employees',
    ],
    actionIfCompliant: 'All eligible employees covered. Review coverage when salaries cross Rs.21,000 threshold.',
  },

  // ==========================================================================
  // GRATUITY QUESTIONS (2 questions)
  // ==========================================================================

  GRATUITY_01: {
    questionId: 'GRATUITY_01',
    category: 'Gratuity',
    requirement: 'Gratuity Provision/Fund Maintenance',
    governmentRef: 'Payment of Gratuity Act, 1972 - Section 4A | Income Tax Act Section 36(1)(v)',
    officialLink: 'https://licindia.in/Products/Group-Insurance/Group-Gratuity',
    deadline: 'Provision must be maintained from date of applicability (10+ employees)',
    penalty: 'Non-payment of gratuity: imprisonment 6 months to 2 years + fine up to Rs.20,000',
    actionIfNonCompliant: [
      'Option 1: LIC Group Gratuity Scheme - Most popular, tax-deductible contributions',
      'Option 2: Private insurer plans (ICICI Prudential, HDFC Life, SBI Life)',
      'Option 3: Book reserve method - Create internal accounting provision',
      'Annual provision: approximately 4.81% of salary per employee',
      'Ensure adequate funds when gratuity becomes payable (5 years service)',
      'Consult CFO/CA for tax-optimal funding strategy',
    ],
    actionIfCompliant: 'Gratuity provisioning in place. Review adequacy annually. Update actuarial valuation as required.',
  },

  GRATUITY_02: {
    questionId: 'GRATUITY_02',
    category: 'Gratuity',
    requirement: 'Employment Contract Gratuity Clause',
    governmentRef: 'Payment of Gratuity Act, 1972 - Section 4 | Code on Social Security 2020 - Section 53',
    officialLink: 'https://labour.gov.in/sites/default/files/SS_Code_Gazette.pdf',
    deadline: 'All employment contracts must include gratuity terms',
    penalty: 'Disputes and litigation risk; penalty for non-payment under the Act',
    actionIfNonCompliant: [
      'Update all employment contracts to include gratuity entitlement clause',
      'State formula: 15 days wages x years of service (wages = last drawn basic + DA)',
      'Clarify eligibility: 5 years continuous service (current law)',
      'Note: Under new Labour Codes, fixed-term employees eligible after 1 year',
      'Include forfeiture conditions as per Section 4(6) of the Act',
      'Have legal team review updated contract templates',
    ],
    actionIfCompliant: 'Contract gratuity clauses in place. Update when Labour Codes are notified for 1-year eligibility change.',
  },

  // ==========================================================================
  // PROFESSIONAL TAX QUESTIONS (3 questions)
  // ==========================================================================

  PT_01: {
    questionId: 'PT_01',
    category: 'Professional Tax',
    requirement: 'Professional Tax Registration',
    governmentRef: 'Article 276 of Constitution of India | State-specific PT Acts',
    officialLink: 'https://mahagst.gov.in (MH) | https://gst.kar.nic.in (KA)',
    deadline: 'Within 30 days of starting operations in applicable state',
    penalty: 'Varies by state: Rs.5 to Rs.5,000 per month of non-registration + interest',
    actionIfNonCompliant: [
      'Identify which operating states levy Professional Tax',
      'States WITH PT: Maharashtra, Karnataka, West Bengal, Tamil Nadu, Gujarat, Andhra Pradesh, Telangana, Kerala, Assam, Meghalaya, Odisha, Tripura, Sikkim, Jharkhand, Bihar',
      'States WITHOUT PT: Delhi, Haryana, Uttar Pradesh, Rajasthan, Punjab',
      'Register on respective state commercial tax portal',
      'Obtain PTEC (Enrollment Certificate) for company and PTRC (Registration Certificate) for employer',
      'Display registration at workplace as required by state law',
    ],
    actionIfCompliant: 'PT registration in order. Renew as per state requirements (most states have perpetual registration).',
  },

  PT_02: {
    questionId: 'PT_02',
    category: 'Professional Tax',
    requirement: 'PT Deduction as per State Slabs',
    governmentRef: 'State Professional Tax Acts - Deduction schedules',
    officialLink: 'https://mahagst.gov.in/en/professional-tax',
    deadline: 'Monthly deduction from salary',
    penalty: 'Interest 1-2% per month on late deduction + penalties for incorrect deduction',
    actionIfNonCompliant: [
      'Review state-specific PT slabs for salary brackets',
      'Maharashtra: Rs.0 (<Rs.7,500), Rs.175 (Rs.7,500-10,000), Rs.200/300 (>Rs.10,000)',
      'Karnataka: Rs.0 (<Rs.15,000), Rs.200 (>Rs.15,000)',
      'Tamil Nadu: Rs.0 (<Rs.21,000), Rs.135 (Rs.21,000-30,000), Rs.180 (Rs.30,001-45,000), Rs.200 (>Rs.45,000)',
      'Maximum deduction capped at Rs.2,500/year across all states',
      'Configure payroll system to auto-deduct PT from salaries',
    ],
    actionIfCompliant: 'PT deduction configured correctly. Review slabs when state government issues revisions.',
  },

  PT_03: {
    questionId: 'PT_03',
    category: 'Professional Tax',
    requirement: 'PT Return Filing',
    governmentRef: 'State PT Acts - Return filing provisions',
    officialLink: 'https://mahagst.gov.in (MH) | https://gst.kar.nic.in (KA)',
    deadline: 'Maharashtra: 30th of following month | Karnataka: 20th | Gujarat: 15th | Others vary',
    penalty: 'Late filing fee + interest 1-2% per month + penalty up to 25% of tax due',
    actionIfNonCompliant: [
      'Identify filing frequency for your state (monthly/quarterly/annually)',
      'Maharashtra: Monthly if PT > Rs.50,000/year, else quarterly',
      'Karnataka: Monthly by 20th',
      'West Bengal: Monthly by 21st',
      'File pending returns with interest and applicable penalties',
      'Maintain Form III-B register of employees liable for PT',
    ],
    actionIfCompliant: 'PT returns filed on time. Reconcile annual return with monthly deductions.',
  },

  // ==========================================================================
  // SHOPS & ESTABLISHMENTS QUESTIONS (3 questions)
  // ==========================================================================

  SE_01: {
    questionId: 'SE_01',
    category: 'Shops & Establishments',
    requirement: 'S&E Act Registration',
    governmentRef: 'State Shops & Commercial Establishments Acts | Model S&E Act 2016',
    officialLink: 'https://shramsuvidha.gov.in',
    deadline: 'Within 30-60 days of starting business (varies by state)',
    penalty: 'Rs.1,000 to Rs.25,000 depending on state; closure order for continued non-compliance',
    actionIfNonCompliant: [
      'Apply through state-specific portal or Shram Suvidha (for some states)',
      'Maharashtra: Shop and Establishment portal (lbt.midc.gov.in)',
      'Karnataka: Seva Sindhu portal (sevasindhu.karnataka.gov.in)',
      'Delhi: e-District portal (edistrict.delhigovt.nic.in)',
      'Submit establishment details: name, address, nature of business, employees',
      'Pay registration fee (typically Rs.100-500 depending on state)',
      'Obtain registration certificate valid for 1-5 years',
    ],
    actionIfCompliant: 'S&E registration valid. Track renewal date and file amendment if employee count changes significantly.',
  },

  SE_02: {
    questionId: 'SE_02',
    category: 'Shops & Establishments',
    requirement: 'Display of Registration Certificate',
    governmentRef: 'State S&E Acts - Display requirements',
    officialLink: 'https://shramsuvidha.gov.in',
    deadline: 'From date of registration - continuous requirement',
    penalty: 'Rs.500 to Rs.5,000 per instance of inspection finding',
    actionIfNonCompliant: [
      'Print registration certificate in A4 size (color preferred)',
      'Display prominently near main entrance of establishment',
      'Frame the certificate to protect from damage',
      'Ensure visibility to employees and inspecting officers',
      'For multiple premises, display copy at each location',
      'Keep original certificate safely in office records',
    ],
    actionIfCompliant: 'Certificate displayed correctly. Ensure it remains visible and legible. Replace if damaged.',
  },

  SE_03: {
    questionId: 'SE_03',
    category: 'Shops & Establishments',
    requirement: 'Attendance and Wage Records',
    governmentRef: 'State S&E Acts - Record maintenance provisions',
    officialLink: 'https://shramsuvidha.gov.in',
    deadline: 'Daily maintenance; retention for 3-5 years',
    penalty: 'Rs.500 to Rs.10,000 for non-maintenance; evidence issues in labour disputes',
    actionIfNonCompliant: [
      'Implement attendance tracking system (biometric/digital preferred)',
      'Maintain register of employees with joining date, designation, wage',
      'Record daily attendance with in-time and out-time',
      'Document overtime hours separately',
      'Maintain wage register with deductions (PF, ESI, PT)',
      'Keep records for minimum 3 years (5 years recommended)',
    ],
    actionIfCompliant: 'Records maintained properly. Digitize for easy retrieval during inspections. Backup regularly.',
  },

  // ==========================================================================
  // POSH QUESTIONS (3 questions)
  // ==========================================================================

  POSH_01: {
    questionId: 'POSH_01',
    category: 'Prevention of Sexual Harassment',
    requirement: 'Internal Complaints Committee (ICC) Constitution',
    governmentRef: 'POSH Act, 2013 - Section 4 | POSH Rules, 2013 - Rule 4',
    officialLink: 'https://wcd.nic.in/act/sexual-harassment-women-workplace',
    deadline: 'Within 30 days of establishment having 10+ employees',
    penalty: 'First offense: Rs.50,000 fine | Repeat offense: Fine doubles + license cancellation',
    actionIfNonCompliant: [
      'Constitute ICC with minimum 4 members:',
      '- Presiding Officer: Senior woman employee',
      '- Minimum 2 members from employees (preferably committed to women cause)',
      '- 1 external member from NGO/association committed to women issues',
      'Women must constitute at least 50% of ICC members',
      'Issue formal order constituting ICC with 3-year term',
      'Notify ICC details to all employees via email and notice board',
    ],
    actionIfCompliant: 'ICC properly constituted. Track member terms and reconstitute before expiry. Update when members change.',
  },

  POSH_02: {
    questionId: 'POSH_02',
    category: 'Prevention of Sexual Harassment',
    requirement: 'Annual POSH Awareness Training',
    governmentRef: 'POSH Act, 2013 - Section 19(c) | POSH Rules, 2013',
    officialLink: 'https://wcd.nic.in/act/sexual-harassment-women-workplace',
    deadline: 'Annual training for all employees; induction training for new joiners',
    penalty: 'Included in overall POSH compliance penalties; evidence of negligence in complaints',
    actionIfNonCompliant: [
      'Engage certified POSH trainer or reputed HR consulting firm',
      'Training must cover: definition of sexual harassment, types of harassment',
      'Include complaint filing process and role of ICC',
      'Explain consequences of harassment for perpetrators',
      'Training for ICC members on inquiry procedures',
      'Document attendance and maintain training records for 3 years',
      'Online training acceptable but maintain completion certificates',
    ],
    actionIfCompliant: 'Training conducted annually. Schedule next training and maintain refresher calendar.',
  },

  POSH_03: {
    questionId: 'POSH_03',
    category: 'Prevention of Sexual Harassment',
    requirement: 'Annual POSH Report Filing',
    governmentRef: 'POSH Act, 2013 - Section 21 | POSH Rules, 2013 - Rule 14',
    officialLink: 'https://shebox.nic.in',
    deadline: 'January 31 of each year for previous calendar year',
    penalty: 'Non-filing included in POSH violation penalties; adverse audit observations',
    actionIfNonCompliant: [
      'Prepare annual report with: number of complaints received, disposed, pending',
      'Include nature of action taken in each case',
      'File report with District Officer (usually District Collector/Magistrate)',
      'Register on SHe-Box portal for centralized complaint tracking',
      'Include report in company annual report/Board report',
      'Maintain copy of filed report for inspection',
    ],
    actionIfCompliant: 'Annual report filed on time. Maintain records of all reports filed for compliance history.',
  },

  // ==========================================================================
  // MATERNITY BENEFIT QUESTIONS (2 questions)
  // ==========================================================================

  MATERNITY_01: {
    questionId: 'MATERNITY_01',
    category: 'Maternity Benefits',
    requirement: '26 Weeks Paid Maternity Leave',
    governmentRef: 'Maternity Benefit Act, 1961 - Section 5 (as amended 2017)',
    officialLink: 'https://labour.gov.in/sites/default/files/MB%20Amendment%20Act%2C2017.pdf',
    deadline: 'Applicable from date of amendment (April 1, 2017)',
    penalty: 'Up to Rs.50,000 fine or 3 months imprisonment or both',
    actionIfNonCompliant: [
      'Update maternity leave policy to provide 26 weeks for first two children',
      '12 weeks for third child onwards',
      '12 weeks for adoptive and commissioning mothers (child below 3 months)',
      'Leave can start up to 8 weeks before expected delivery',
      'Medical bonus of Rs.3,500 if employer does not provide pre/post-natal care',
      'Work from home option mandated for nature of work permitting',
      'Communicate updated policy to all female employees',
    ],
    actionIfCompliant: 'Maternity policy compliant. Ensure HR team trained on implementation. Track leave utilization.',
  },

  MATERNITY_02: {
    questionId: 'MATERNITY_02',
    category: 'Maternity Benefits',
    requirement: 'Creche Facility (50+ employees)',
    governmentRef: 'Maternity Benefit Act, 1961 - Section 11A | OSH Code 2020 - Section 24',
    officialLink: 'https://labour.gov.in',
    deadline: 'From date organization crosses 50 employees threshold',
    penalty: 'Penalty under Maternity Benefit Act and future OSH Code provisions',
    actionIfNonCompliant: [
      'Option 1: In-house creche within prescribed distance from workplace',
      'Option 2: Tie-up with common creche facility in the locality',
      'Option 3: Creche allowance as interim arrangement (document approval)',
      'Creche must cater to children below 6 years of age',
      'Allow mother 4 visits per day to creche (including rest interval)',
      'Maintain creche with trained attendants and adequate facilities',
    ],
    actionIfCompliant: 'Creche facility available. Ensure quality standards and communicate facility details to employees.',
  },

  // ==========================================================================
  // GST QUESTIONS (3 questions)
  // ==========================================================================

  GST_01: {
    questionId: 'GST_01',
    category: 'Goods & Services Tax',
    requirement: 'GSTR-1 and GSTR-3B Timely Filing',
    governmentRef: 'CGST Act, 2017 - Section 37 (GSTR-1) & Section 39 (GSTR-3B)',
    officialLink: 'https://www.gst.gov.in',
    deadline: 'GSTR-1: 11th of following month | GSTR-3B: 20th of following month',
    penalty: 'Late fee: Rs.50/day (Rs.20 for nil return) capped at Rs.10,000 + 18% interest p.a.',
    actionIfNonCompliant: [
      'Log into GST portal and file pending GSTR-1 (outward supplies)',
      'Then file GSTR-3B (summary return with tax payment)',
      'Pay late fee and interest calculated automatically by portal',
      'Set up auto-drafted GSTR-1 from e-invoicing (if applicable)',
      'Use GST accounting software for automated return preparation',
      'Assign dedicated resource for GST compliance calendar',
    ],
    actionIfCompliant: 'GST returns filed on time. Reconcile with GSTR-2B monthly. Prepare for annual return by December.',
  },

  GST_02: {
    questionId: 'GST_02',
    category: 'Goods & Services Tax',
    requirement: 'ITC Reconciliation with GSTR-2B',
    governmentRef: 'CGST Act, 2017 - Section 16(2)(aa) | CGST Rules - Rule 36(4)',
    officialLink: 'https://www.gst.gov.in',
    deadline: 'Monthly reconciliation before GSTR-3B filing',
    penalty: 'Denial of ITC during assessment; interest on wrongly claimed ITC',
    actionIfNonCompliant: [
      'Download GSTR-2B from GST portal (auto-generated from supplier filings)',
      'Compare with purchase register and ITC claimed in books',
      'Identify mismatches: invoices not uploaded by suppliers, GSTIN errors',
      'Follow up with suppliers to correct their GSTR-1',
      'Reverse ineligible ITC in GSTR-3B',
      'Implement vendor GST compliance monitoring system',
    ],
    actionIfCompliant: 'ITC reconciliation in place. Consider vendor rating based on GST compliance.',
  },

  GST_03: {
    questionId: 'GST_03',
    category: 'Goods & Services Tax',
    requirement: 'E-Invoicing for Turnover Above Rs.5 Crore',
    governmentRef: 'CGST Notification 13/2020 (as amended) | Rule 48(4)',
    officialLink: 'https://einvoice.gst.gov.in',
    deadline: 'Mandatory from respective applicability date based on turnover',
    penalty: 'Invoice treated as invalid; denial of ITC to recipient; Rs.10,000 penalty per invoice',
    actionIfNonCompliant: [
      'Register on e-Invoice portal (einvoice.gst.gov.in)',
      'Integrate billing software with GST e-Invoice API',
      'Generate IRN (Invoice Reference Number) before printing invoice',
      'Print QR code on all B2B invoices',
      'Cannot upload invoice to e-invoice portal after 30 days',
      'Train accounts team on e-invoicing workflow',
    ],
    actionIfCompliant: 'E-invoicing implemented. Ensure 100% compliance for all B2B invoices. Monitor for threshold changes.',
  },

  // ==========================================================================
  // MSME PAYMENT QUESTIONS (2 questions)
  // ==========================================================================

  MSME_01: {
    questionId: 'MSME_01',
    category: 'MSME Payment Compliance',
    requirement: 'MSME Supplier Verification',
    governmentRef: 'MSME Development Act, 2006 - Section 15 | Income Tax Act - Section 43B(h)',
    officialLink: 'https://udyamregistration.gov.in',
    deadline: 'Verification required before each transaction with new supplier',
    penalty: 'Loss of tax deduction for payments delayed beyond 45 days',
    actionIfNonCompliant: [
      'Create process to verify Udyam Registration of suppliers',
      'Check on udyamregistration.gov.in using UDYAM number or GSTIN',
      'Maintain updated list of MSME-registered suppliers',
      'Include MSME status field in vendor master',
      'Request Udyam certificate from new suppliers during onboarding',
      'Periodically verify existing supplier MSME status',
    ],
    actionIfCompliant: 'MSME verification process in place. Maintain audit trail for tax assessment purposes.',
  },

  MSME_02: {
    questionId: 'MSME_02',
    category: 'MSME Payment Compliance',
    requirement: 'Payment to MSME within 45 Days',
    governmentRef: 'MSME Development Act, 2006 - Section 16 | Income Tax Act - Section 43B(h) (w.e.f. April 2024)',
    officialLink: 'https://samadhaan.msme.gov.in',
    deadline: '45 days from acceptance of goods/services (or agreed date if written)',
    penalty: 'Compound interest at 3x bank rate + Loss of expense deduction for income tax if paid after 45 days',
    actionIfNonCompliant: [
      'Review current payment cycles for MSME suppliers',
      'Identify payments pending beyond 45 days',
      'Pay compound interest on delayed payments as per Section 16',
      'Revise payment terms in contracts with MSME suppliers',
      'Configure ERP/accounting system for MSME payment alerts',
      'Monitor via MSME Samadhaan portal for complaints',
      'Budget for faster cash flow to meet 45-day requirement',
    ],
    actionIfCompliant: 'MSME payment timeline compliant. Critical for FY 2024-25 onwards due to Section 43B(h) tax implications.',
  },

  // ==========================================================================
  // DPDP QUESTIONS (3 questions)
  // ==========================================================================

  DPDP_01: {
    questionId: 'DPDP_01',
    category: 'Digital Personal Data Protection',
    requirement: 'Clear, Specific Consent Before Data Collection',
    governmentRef: 'DPDP Act 2023 - Section 6 | DPDP Rules 2025 - Rule 3',
    officialLink: 'https://www.meity.gov.in/data-protection-framework',
    deadline: 'Full compliance by May 13, 2027',
    penalty: 'Up to Rs.250 Crore for failure to obtain valid consent',
    actionIfNonCompliant: [
      'Implement granular consent mechanism for each data processing purpose',
      'Consent must be: free, specific, informed, unconditional, unambiguous',
      'Cannot use pre-ticked boxes or bundled consent',
      'Provide option to withdraw consent as easily as it was given',
      'Maintain consent records with timestamp and version of privacy notice',
      'Review third-party SDKs and forms for consent compliance',
    ],
    actionIfCompliant: 'Consent mechanism in place. Review annually and update when new processing purposes added.',
  },

  DPDP_02: {
    questionId: 'DPDP_02',
    category: 'Digital Personal Data Protection',
    requirement: 'Privacy Notice in Simple, Clear Language',
    governmentRef: 'DPDP Act 2023 - Section 5 | DPDP Rules 2025 - Rule 4',
    officialLink: 'https://www.meity.gov.in/data-protection-framework',
    deadline: 'Full compliance by May 13, 2027',
    penalty: 'Up to Rs.50 Crore for inadequate notice',
    actionIfNonCompliant: [
      'Draft privacy notice in simple language (avoid legal jargon)',
      'Must include: what data collected, purpose, how long retained',
      'Explain how to exercise rights (access, correction, deletion)',
      'Provide contact details of Data Protection Officer (if applicable)',
      'Make available in English and regional languages if user base requires',
      'Display prominently on website/app at point of data collection',
      'Update notice when processing purposes change',
    ],
    actionIfCompliant: 'Privacy notice published. Review quarterly for accuracy. Maintain version history.',
  },

  DPDP_03: {
    questionId: 'DPDP_03',
    category: 'Digital Personal Data Protection',
    requirement: 'Data Principal Rights (Access, Correction, Deletion)',
    governmentRef: 'DPDP Act 2023 - Section 11-13 | DPDP Rules 2025 - Rule 7',
    officialLink: 'https://www.meity.gov.in/data-protection-framework',
    deadline: 'Full compliance by May 13, 2027; respond to requests within reasonable time',
    penalty: 'Up to Rs.50 Crore for failure to enable rights exercise',
    actionIfNonCompliant: [
      'Create self-service portal for users to access their data',
      'Implement correction/update functionality for user profiles',
      'Enable deletion/erasure request mechanism',
      'Respond to requests within reasonable time (typically 30 days)',
      'Maintain log of all rights requests and responses',
      'Train customer support on handling data rights requests',
      'Document exceptions where rights cannot be exercised (legal obligation, etc.)',
    ],
    actionIfCompliant: 'Rights mechanism functional. Monitor request volumes and response times. Report in annual compliance.',
  },

  // ==========================================================================
  // LABOUR CODE READINESS QUESTIONS (4 questions)
  // ==========================================================================

  LC_01: {
    questionId: 'LC_01',
    category: 'Labour Codes Readiness',
    requirement: 'Wage Structure Compliance (50% Basic + DA)',
    governmentRef: 'Code on Wages 2019 - Section 2(y) definition of wages',
    officialLink: 'https://labour.gov.in/sites/default/files/THE%20CODE%20ON%20WAGES%2C%202019%20No.%2029%20of%202019.pdf',
    deadline: 'From date Labour Codes are notified (expected November 2025)',
    penalty: 'Non-compliant wage structure affects PF, Gratuity, Bonus calculations; risk of back claims',
    actionIfNonCompliant: [
      'Audit current salary structure for all employees',
      'Under new definition: Basic + DA must be minimum 50% of total remuneration',
      'Allowances excluded from wages: HRA, conveyance, overtime, gratuity, bonus, commissions',
      'Restructure CTC to ensure compliance (may increase statutory contributions)',
      'Model financial impact: higher PF/Gratuity cost vs non-compliance risk',
      'Communicate salary restructuring to employees with benefits explanation',
    ],
    actionIfCompliant: 'Wage structure already compliant. Document current structure for audit readiness.',
  },

  LC_02: {
    questionId: 'LC_02',
    category: 'Labour Codes Readiness',
    requirement: 'Grievance Redressal Committee (20+ employees)',
    governmentRef: 'Industrial Relations Code 2020 - Section 4 | IR Code Rules',
    officialLink: 'https://labour.gov.in/sites/default/files/IR_Code_Gazette.pdf',
    deadline: 'Within 60 days of Labour Codes notification',
    penalty: 'Fine up to Rs.50,000 for non-constitution; adverse impact in industrial disputes',
    actionIfNonCompliant: [
      'Constitute Grievance Redressal Committee with equal representation',
      'Include management representatives and worker representatives',
      'Chairperson to be elected from members',
      'Establish written grievance procedure with timelines',
      'Grievance to be addressed within 30 days of receipt',
      'Appeal mechanism to appropriate authority if unresolved',
      'Maintain records of all grievances and resolutions',
    ],
    actionIfCompliant: 'GRC in place. Review procedures for alignment with new IR Code requirements when notified.',
  },

  LC_03: {
    questionId: 'LC_03',
    category: 'Labour Codes Readiness',
    requirement: 'Updated Employment Contracts',
    governmentRef: 'All Four Labour Codes - Definitions of Wages, Worker, Employee',
    officialLink: 'https://labour.gov.in',
    deadline: 'Before Labour Codes effective date (expected November 2025)',
    penalty: 'Contractual disputes; non-compliance with new definitions',
    actionIfNonCompliant: [
      'Review employment contract templates for new definitions',
      'Wages: new definition with 50% basic + DA rule',
      'Worker: now includes sales/supervisory up to Rs.18,000/month',
      'Working hours: max 8 hours/day, flexibility in 4-day week',
      'Fixed-term: equal benefits, gratuity after 1 year',
      'Retrenchment: new thresholds (300 workers for prior approval)',
      'Engage legal counsel for comprehensive contract review',
    ],
    actionIfCompliant: 'Contracts updated. Maintain version control and issue fresh contracts before effective date.',
  },

  LC_04: {
    questionId: 'LC_04',
    category: 'Labour Codes Readiness',
    requirement: 'Unified Register Maintenance',
    governmentRef: 'All Four Labour Codes - Simplified compliance provisions',
    officialLink: 'https://shramsuvidha.gov.in',
    deadline: 'From date Labour Codes are notified',
    penalty: 'Fine for non-maintenance of registers; inspection findings',
    actionIfNonCompliant: [
      'Labour Codes replace 29 labour laws with 4 unified codes',
      'Unified register replaces multiple separate registers',
      'Single annual return instead of multiple returns',
      'Update HR/Payroll systems for unified format',
      'Register via Shram Suvidha Portal for single registration',
      'Train HR team on new compliance requirements',
      'Maintain digital records for easy inspection access',
    ],
    actionIfCompliant: 'Ready for unified compliance. Monitor MoL notifications for final register formats.',
  },

  // ==========================================================================
  // FSSAI QUESTIONS (2 questions) - Food & Beverage Industry
  // ==========================================================================

  FSSAI_01: {
    questionId: 'FSSAI_01',
    category: 'Food Safety (FSSAI)',
    requirement: 'Valid FSSAI License/Registration',
    governmentRef: 'Food Safety and Standards Act, 2006 - Section 31 | FSS (Licensing) Regulations 2011',
    officialLink: 'https://foscos.fssai.gov.in',
    deadline: 'Before commencing food business operations',
    penalty: 'Up to Rs.10 Lakh fine + imprisonment up to 6 months; business closure',
    actionIfNonCompliant: [
      'Determine license type based on annual turnover:',
      'Basic Registration: Turnover up to Rs.12 Lakh (free registration)',
      'State License: Turnover Rs.12 Lakh - Rs.20 Crore',
      'Central License: Turnover above Rs.20 Crore or operating in multiple states',
      'Apply on FoSCoS portal (foscos.fssai.gov.in)',
      'Submit Food Safety Management System (FSMS) plan',
      'Undergo inspection if required for license category',
    ],
    actionIfCompliant: 'FSSAI license valid. Track renewal date (1-5 years based on category). Maintain hygiene standards.',
  },

  FSSAI_02: {
    questionId: 'FSSAI_02',
    category: 'Food Safety (FSSAI)',
    requirement: 'FSSAI License Display on Products and Premises',
    governmentRef: 'FSS (Licensing) Regulations 2011 - Regulation 2.1.2(4)',
    officialLink: 'https://foscos.fssai.gov.in',
    deadline: 'From date of license - continuous requirement',
    penalty: 'Up to Rs.5 Lakh fine; product recall; license suspension',
    actionIfNonCompliant: [
      'Print 14-digit FSSAI license number on all product packaging',
      'Display FSSAI logo along with license number',
      'Display license certificate at business premises',
      'Include license number on menus (for restaurants/cloud kitchens)',
      'Add to website footer and online ordering platforms',
      'Train kitchen staff on compliance requirements',
    ],
    actionIfCompliant: 'License displayed correctly. Regular audits for packaging compliance. Update when license renewed.',
  },

  // ==========================================================================
  // FINTECH QUESTIONS (2 questions) - Fintech Industry
  // ==========================================================================

  FINTECH_01: {
    questionId: 'FINTECH_01',
    category: 'Fintech Regulatory',
    requirement: 'RBI License for Financial Services',
    governmentRef: 'RBI Act 1934 | NBFC Directions 2016 | Payment Aggregator Guidelines 2020',
    officialLink: 'https://www.rbi.org.in',
    deadline: 'Before commencing regulated financial services',
    penalty: 'Up to Rs.1 Crore + imprisonment up to 10 years for operating without license',
    actionIfNonCompliant: [
      'Identify applicable license type:',
      'NBFC: Net owned fund Rs.2 Crore minimum',
      'Payment Aggregator (PA): Net worth Rs.15 Crore (Rs.25 Crore by March 2025)',
      'Account Aggregator (AA): Rs.2 Crore net worth',
      'Apply through RBI COSMOS portal',
      'Engage compliance officer and statutory auditor',
      'Implement required technology and security infrastructure',
      'Consider Regulatory Sandbox participation for innovation',
    ],
    actionIfCompliant: 'RBI license valid. Maintain minimum net worth. File quarterly/annual returns on time.',
  },

  FINTECH_02: {
    questionId: 'FINTECH_02',
    category: 'Fintech Regulatory',
    requirement: 'RBI Digital Lending Guidelines Compliance',
    governmentRef: 'RBI Digital Lending Guidelines 2022 | Master Direction on IT Framework',
    officialLink: 'https://www.rbi.org.in/Scripts/NotificationUser.aspx?Id=12382',
    deadline: 'In effect from September 2022 (existing guidelines)',
    penalty: 'License revocation; prosecution under Banking Regulation Act',
    actionIfNonCompliant: [
      'Ensure all disbursements to borrower bank account only (no third-party)',
      'Provide Key Fact Statement (KFS) with APR before disbursal',
      'No automatic credit limit increase without explicit consent',
      'Store all data only in India (data localization)',
      'Implement grievance redressal with escalation to RBI Ombudsman',
      'Appoint Nodal Officer for regulatory liaison',
      'Annual audit by RBI-approved auditor',
    ],
    actionIfCompliant: 'Digital lending compliant. Stay updated on circular amendments. Maintain customer protection focus.',
  },

  // ==========================================================================
  // FACTORY ACT QUESTIONS (2 questions) - Manufacturing
  // ==========================================================================

  FACTORY_01: {
    questionId: 'FACTORY_01',
    category: 'Factory Compliance',
    requirement: 'Factory License and Occupier/Manager Appointment',
    governmentRef: 'Factories Act 1948 - Section 6-7 | OSH Code 2020 - Section 6',
    officialLink: 'https://shramsuvidha.gov.in',
    deadline: 'Before commencing manufacturing operations',
    penalty: 'Up to Rs.2 Lakh fine + imprisonment up to 2 years; closure order',
    actionIfNonCompliant: [
      'Factory defined as: 10+ workers with power OR 20+ workers without power',
      'Obtain factory plan approval from Chief Inspector of Factories',
      'Apply for factory license on state portal/Shram Suvidha',
      'Appoint Occupier (owner/lessee responsible for factory)',
      'Appoint Factory Manager (qualified person for compliance)',
      'Submit Form 2 for Manager appointment',
      'Renew license annually before December 31',
    ],
    actionIfCompliant: 'Factory license valid. Track renewal. Update when Occupier/Manager changes.',
  },

  FACTORY_02: {
    questionId: 'FACTORY_02',
    category: 'Factory Compliance',
    requirement: 'Working Hours Compliance (48 hrs/week)',
    governmentRef: 'Factories Act 1948 - Section 51-54 | OSH Code 2020 - Section 25-26',
    officialLink: 'https://labour.gov.in',
    deadline: 'Continuous compliance',
    penalty: 'Up to Rs.1 Lakh fine per violation; prosecution for willful default',
    actionIfNonCompliant: [
      'Maximum working hours: 48 hours/week, 9 hours/day',
      'Weekly holiday mandatory (cannot work more than 10 consecutive days)',
      'Overtime must be with worker consent',
      'Overtime rate: double the normal wages',
      'Maximum overtime: 50 hours per quarter (125 hours with exemption)',
      'Maintain attendance register with actual hours worked',
      'Night shift for women: permitted with safety measures',
    ],
    actionIfCompliant: 'Working hours compliant. Monitor via biometric/attendance system. Review overtime patterns.',
  },

  // ==========================================================================
  // POLLUTION CONTROL QUESTIONS (2 questions)
  // ==========================================================================

  PCB_01: {
    questionId: 'PCB_01',
    category: 'Pollution Control',
    requirement: 'Consent to Operate (CTO) from State Pollution Control Board',
    governmentRef: 'Water (Prevention & Control of Pollution) Act 1974 | Air Act 1981 | Environment Protection Act 1986',
    officialLink: 'https://parivesh.nic.in',
    deadline: 'Before commencing operations; renewal annually/5-yearly based on category',
    penalty: 'Up to Rs.1 Lakh/day for operation without consent; closure order',
    actionIfNonCompliant: [
      'Identify pollution category based on activity:',
      'White: IT/Software - No CTO needed, only self-declaration',
      'Green: Low pollution - Simplified consent process',
      'Orange: Medium pollution - CTO required with conditions',
      'Red: High pollution - Detailed EIA, CTO with strict conditions',
      'Apply through PARIVESH portal (parivesh.nic.in)',
      'Submit effluent/emission data and control measures',
      'Install required pollution control equipment',
    ],
    actionIfCompliant: 'CTO valid. Track renewal date. Submit annual environmental statement.',
  },

  PCB_02: {
    questionId: 'PCB_02',
    category: 'Pollution Control',
    requirement: 'Environmental Compliance Reports',
    governmentRef: 'Environment Protection Rules 1986 - Rule 14 | E-Waste Rules 2016 | Hazardous Waste Rules 2016',
    officialLink: 'https://cpcb.nic.in',
    deadline: 'Monthly (Red), Quarterly (Orange), Annual (Green)',
    penalty: 'Up to Rs.1 Lakh fine; adverse inspection report; CTO cancellation',
    actionIfNonCompliant: [
      'Identify applicable reporting requirements based on category',
      'Install Online Continuous Emission Monitoring System (OCEMS) if required',
      'Submit Annual Environmental Statement by September 30',
      'File Hazardous Waste returns if generating hazardous waste',
      'Report e-waste generated (if >1000 kg/year)',
      'Maintain pollution control equipment records',
      'Conduct periodic stack emission testing',
    ],
    actionIfCompliant: 'Reports filed on time. Maintain documentation for inspections. Consider ISO 14001 certification.',
  },
};

// ==========================================================================
// CATEGORY LABELS FOR PDF DISPLAY
// ==========================================================================

export const STATE_WISE_CATEGORY_LABELS: Record<string, string> = {
  EPF: 'Provident Fund',
  ESI: 'Employees State Insurance',
  GRATUITY: 'Gratuity',
  PT: 'Professional Tax',
  SE: 'Shops & Establishments',
  POSH: 'Prevention of Sexual Harassment',
  MATERNITY: 'Maternity Benefits',
  GST: 'Goods & Services Tax',
  MSME: 'MSME Payment Compliance',
  DPDP: 'Digital Personal Data Protection',
  LC: 'Labour Codes Readiness',
  FSSAI: 'Food Safety (FSSAI)',
  FINTECH: 'Fintech Regulatory',
  FACTORY: 'Factory Compliance',
  PCB: 'Pollution Control',
};

// ==========================================================================
// HELPER FUNCTION TO GET RULE BY QUESTION ID
// ==========================================================================

export function getStateWiseComplianceRule(questionId: string): StateWiseComplianceRule | undefined {
  return STATE_WISE_COMPLIANCE_RULES[questionId];
}

// ==========================================================================
// GET ALL RULES FOR A CATEGORY
// ==========================================================================

export function getRulesByCategory(category: string): StateWiseComplianceRule[] {
  return Object.values(STATE_WISE_COMPLIANCE_RULES).filter(rule => 
    rule.category.toLowerCase().includes(category.toLowerCase())
  );
}
