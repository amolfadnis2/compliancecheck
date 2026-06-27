/**
 * Statutory Health Compliance Rules for PDF Report Generation
 * EPF, ESI, Professional Tax, Gratuity & Statutory Bonus
 *
 * Previously declared inline in src/components/results/download-buttons.tsx;
 * extracted here so every assessment keeps its rules in a dedicated file.
 */

import type { ComplianceRule } from '@/types/compliance';

export const STATUTORY_HEALTH_COMPLIANCE_RULES: Record<string, ComplianceRule> = {
  // PF Rules
  pf_1: {
    questionId: 'pf_1',
    category: 'Provident Fund',
    requirement: 'EPFO Registration',
    governmentRef: 'Employees Provident Funds and Miscellaneous Provisions Act, 1952 - Section 1(3)',
    officialLink: 'https://www.epfindia.gov.in',
    deadline: 'Within 1 month of crossing 20 employees threshold',
    penalty: 'Up to Rs.25,000 fine and 1 year imprisonment for non-registration',
    actionIfNonCompliant: [
      'Register immediately on EPFO Unified Portal (unifiedportal-emp.epfindia.gov.in)',
      'Obtain Establishment Code Number',
      'Register all eligible employees (earning up to Rs.15,000/month basic + DA)',
      'Submit Form 5A (Return of Ownership) within 15 days of registration'
    ],
    actionIfCompliant: 'Your EPFO registration is in order. Ensure annual renewal of Digital Signature Certificate (DSC) for continued portal access.',
    applicabilityNote: 'Mandatory for establishments with 20+ employees. Voluntary registration allowed for smaller establishments.'
  },
  pf_2: {
    questionId: 'pf_2',
    category: 'Provident Fund',
    requirement: 'Monthly PF Contribution Deposit',
    governmentRef: 'EPF Scheme 1952 - Para 38 | EPS 1995 - Para 6',
    officialLink: 'https://unifiedportal-emp.epfindia.gov.in',
    deadline: '15th of following month',
    penalty: '12% p.a. interest on delayed deposits + damages up to 100% of arrears',
    actionIfNonCompliant: [
      'Calculate arrears with 12% interest immediately',
      'File ECR (Electronic Challan cum Return) on Unified Portal',
      'Pay via online challan (EPFO accepts only online payments)',
      'Submit IW-1 form if wage arrears are being paid',
      'Set up auto-reminders for 10th of each month to ensure timely deposit'
    ],
    actionIfCompliant: 'Excellent! Timely PF deposits demonstrate good governance. Continue maintaining deposit records for 6 years as per EPF Scheme para 36A.'
  },

  // ESI Rules
  esi_1: {
    questionId: 'esi_1',
    category: 'Employee State Insurance',
    requirement: 'ESIC Registration',
    governmentRef: 'ESI Act, 1948 - Section 2A | ESI (Central) Rules 1950 - Rule 10',
    officialLink: 'https://www.esic.gov.in',
    deadline: 'Within 15 days of becoming applicable (10+ employees)',
    penalty: 'Twice the contribution amount + interest at 12% p.a.',
    actionIfNonCompliant: [
      'Register on ESIC Portal (esic.gov.in/employerlogin)',
      'Obtain 17-digit Employer Code',
      'Generate Temporary IDs for all employees',
      'Link employees Aadhaar for permanent IP numbers',
      'Declare wages and pay first contribution within 15 days'
    ],
    actionIfCompliant: 'Your ESIC registration is compliant. Remember to file half-yearly returns (Form 6) by 11th May and 11th November.',
    applicabilityNote: 'Mandatory for 10+ employees in notified areas. Wage ceiling: Rs.21,000/month (Rs.25,000 for PWD).'
  },
  esi_2: {
    questionId: 'esi_2',
    category: 'Employee State Insurance',
    requirement: 'Monthly ESI Contribution Deposit',
    governmentRef: 'ESI Act, 1948 - Section 39(5) | ESI Rules - Rule 31',
    officialLink: 'https://www.esic.gov.in/contribution',
    deadline: '15th of following month',
    penalty: 'Simple interest at 12% p.a. on delayed payment + damages up to 25%',
    actionIfNonCompliant: [
      'Calculate arrears: Employee share (0.75%) + Employer share (3.25%) = 4% of gross wages',
      'Log into ESIC Portal and generate challan',
      'Pay via online banking only (cash/cheque not accepted)',
      'Update monthly contribution details on portal',
      'Automate salary processing to calculate ESI correctly'
    ],
    actionIfCompliant: 'Good compliance! Ensure IP numbers are generated for all new joiners within 10 days of joining.'
  },
  esi_3: {
    questionId: 'esi_3',
    category: 'Employee State Insurance',
    requirement: 'Wage Ceiling Compliance',
    governmentRef: 'ESI Act, 1948 - Section 2(9) | Notification dated 06.10.2016',
    officialLink: 'https://www.esic.gov.in',
    deadline: 'Ongoing monitoring',
    penalty: 'Non-coverage leads to denial of benefits and retrospective liability',
    actionIfNonCompliant: [
      'Review salary structure of all employees monthly',
      'Employees crossing Rs.21,000 exit ESI coverage',
      'Provide exit documentation to affected employees',
      'Consider group health insurance for employees above ESI ceiling'
    ],
    actionIfCompliant: 'Correct wage monitoring in place. Continue monthly review of wage brackets during salary revisions.'
  },

  // Professional Tax Rules
  pt_1: {
    questionId: 'pt_1',
    category: 'Professional Tax',
    requirement: 'State Applicability Check',
    governmentRef: 'Article 276 of Constitution of India | State-specific PT Acts',
    officialLink: 'State Commercial Tax Department websites',
    deadline: 'N/A - Depends on state of operation',
    penalty: 'Varies by state: Rs.5 to Rs.5,000 per month of non-compliance',
    actionIfNonCompliant: [
      'Verify if your operating state levies Professional Tax',
      'States WITH PT: Maharashtra, Karnataka, West Bengal, Tamil Nadu, Gujarat, Andhra Pradesh, Telangana, Kerala, Assam, Meghalaya, Odisha, Tripura, Sikkim, Jharkhand, Bihar',
      'States WITHOUT PT: Delhi, Haryana, UP, Rajasthan, Punjab (confirm current status)',
      'If applicable, register within 30 days of starting operations'
    ],
    actionIfCompliant: 'You have correctly identified PT applicability. Proceed with registration if in an applicable state.'
  },
  pt_2: {
    questionId: 'pt_2',
    category: 'Professional Tax',
    requirement: 'PTRC Registration',
    governmentRef: 'Maharashtra: MVAT Act 2002 | Karnataka: KPT Act 1976 | State-specific Acts',
    officialLink: 'State GST/Commercial Tax portal',
    deadline: 'Within 30 days of becoming liable',
    penalty: 'Maharashtra: Rs.5/day delay | Karnataka: Rs.100/month | Other states vary',
    actionIfNonCompliant: [
      'Apply for PTRC (Professional Tax Registration Certificate) on state portal',
      'Maharashtra: mahagst.gov.in | Karnataka: gst.kar.nic.in',
      'Submit required documents: PAN, Aadhaar, Bank details, Rent agreement',
      'Obtain PTEC (Enrollment Certificate) for proprietor/partners/directors separately',
      'Display certificate at business premises'
    ],
    actionIfCompliant: 'PTRC is in order. Renew annually if required by your state (e.g., Maharashtra requires no renewal).'
  },
  pt_3: {
    questionId: 'pt_3',
    category: 'Professional Tax',
    requirement: 'Monthly PT Deduction and Deposit',
    governmentRef: 'State PT Acts - Collection and deposit provisions',
    officialLink: 'State Commercial Tax portal',
    deadline: 'Maharashtra: 30th of following month | Karnataka: 20th | Others vary',
    penalty: 'Interest 1-2% per month + penalties for late filing',
    actionIfNonCompliant: [
      'Review state-specific PT slabs for salary brackets',
      'Configure payroll system to auto-deduct PT from salaries',
      'File monthly/quarterly PT returns as per state rules',
      'Maharashtra: Monthly if PT > Rs.50,000/year, else quarterly',
      'Maintain Form III-B register of employees liable for PT'
    ],
    actionIfCompliant: 'PT compliance maintained. File annual returns (Form IIIB in Maharashtra) by 31st May each year.'
  },

  // Gratuity Rules
  gratuity_1: {
    questionId: 'gratuity_1',
    category: 'Gratuity',
    requirement: 'Gratuity Liability Tracking',
    governmentRef: 'Payment of Gratuity Act, 1972 - Section 4',
    officialLink: 'https://labour.gov.in/sites/default/files/ThePaymentofGratuityAct1972.pdf',
    deadline: 'Continuous tracking; payment within 30 days of becoming due',
    penalty: 'Simple interest at 10% p.a. from due date + up to 6 months imprisonment for default',
    actionIfNonCompliant: [
      'Calculate gratuity liability: (15 x Last drawn salary x Years of service) / 26',
      'Create gratuity register with all employees having 4+ years service',
      'Maximum gratuity ceiling: Rs.20,00,000 (as of 2024)',
      'Include gratuity provision in annual financial statements',
      'Consider actuarial valuation for accurate liability assessment'
    ],
    actionIfCompliant: 'Good practice! Regular liability tracking helps with cash flow planning. Review valuations annually with an actuary for companies with 100+ employees.',
    applicabilityNote: 'Applies to establishments with 10+ employees. Once applicable, continues even if count falls below 10.'
  },
  gratuity_2: {
    questionId: 'gratuity_2',
    category: 'Gratuity',
    requirement: 'Gratuity Funding/Insurance',
    governmentRef: 'Payment of Gratuity Act, 1972 - Section 4A | Income Tax Act Section 36(1)(v)',
    officialLink: 'https://licindia.in/Products/Group-Insurance/Group-Gratuity',
    deadline: 'Recommended to provision annually',
    penalty: 'Non-payment of gratuity: imprisonment up to 2 years + fine up to Rs.20,000',
    actionIfNonCompliant: [
      'Option 1: LIC Group Gratuity Scheme - Most popular, tax-deductible contributions',
      'Option 2: Private insurer gratuity plans (ICICI, HDFC, SBI Life)',
      'Option 3: Book reserve method - Create internal provision',
      'Consult CFO/CA for tax-optimal funding strategy',
      'Ensure adequate funds available when gratuity becomes payable'
    ],
    actionIfCompliant: 'Excellent financial planning! Review coverage adequacy annually, especially after salary revisions or new hires.'
  },

  // Bonus Rules
  bonus_1: {
    questionId: 'bonus_1',
    category: 'Statutory Bonus',
    requirement: 'Minimum Bonus Payment',
    governmentRef: 'Payment of Bonus Act, 1965 - Section 10 | Bonus ceiling notification 2016',
    officialLink: 'https://labour.gov.in/sites/default/files/payment_of_bonus_act_1702.pdf',
    deadline: 'Within 8 months of closing the accounting year',
    penalty: 'Imprisonment up to 6 months and/or fine up to Rs.1,000',
    actionIfNonCompliant: [
      'Identify eligible employees: Worked 30+ days, earning up to Rs.21,000/month (basic + DA)',
      'Calculate minimum bonus: 8.33% of salary or Rs.100, whichever is higher',
      'Calculate allocable surplus and maximum bonus (up to 20%)',
      'Pay bonus by 30th November for March year-end companies',
      'New establishments exempted for first 5 years if incurring losses'
    ],
    actionIfCompliant: 'Compliant with bonus requirements. Document bonus calculation methodology in Form D for inspection purposes.',
    applicabilityNote: 'Applies to establishments with 20+ employees. Employees earning basic + DA > Rs.21,000/month are NOT eligible for statutory bonus (but may receive ex-gratia).'
  },
  bonus_2: {
    questionId: 'bonus_2',
    category: 'Statutory Bonus',
    requirement: 'Bonus Registers and Timely Payment',
    governmentRef: 'Payment of Bonus Rules, 1975 - Rule 4 | Form A, B, C, D registers',
    officialLink: 'https://labour.gov.in',
    deadline: 'Payment: 30th Nov (March YE) | Registers: Maintain for 8 years',
    penalty: 'Failure to maintain registers: Fine up to Rs.1,000 per instance',
    actionIfNonCompliant: [
      'Maintain Form A: Computation of allocable surplus',
      'Maintain Form B: Set on/set off statement',
      'Maintain Form C: Bonus paid to each employee',
      'Maintain Form D: Annual return (submit to Labour Inspector by 31st Jan)',
      'Issue bonus payment slips to all eligible employees'
    ],
    actionIfCompliant: 'Well-maintained records. Submit annual return (Form D) to local Labour Commissioner by 31st January each year.'
  }
};
