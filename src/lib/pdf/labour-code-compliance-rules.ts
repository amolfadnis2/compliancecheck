/**
 * Labour Code Compliance Rules for PDF Report Generation
 * Based on India's Four Labour Codes (effective November 2025)
 * 
 * Comprehensive rules with:
 * - Legal references (Code/Section)
 * - Penalties for non-compliance
 * - Deadlines
 * - Step-by-step remediation actions
 * - Official portal links
 * 
 * @version 1.0
 * @created December 31, 2025
 */

import type { ComplianceRule } from '@/types/compliance';

export type LabourCodeComplianceRule = ComplianceRule;

export const LABOUR_CODE_COMPLIANCE_RULES: Record<string, LabourCodeComplianceRule> = {
  // ==========================================================================
  // CODE ON WAGES QUESTIONS
  // ==========================================================================

  wages_1: {
    questionId: 'wages_1',
    category: 'Code on Wages',
    requirement: 'Minimum Wage Compliance',
    governmentRef: 'Code on Wages 2019 - Section 9 | Schedule to the Code',
    officialLink: 'https://labour.gov.in/sites/default/files/THE%20CODE%20ON%20WAGES%2C%202019.pdf',
    deadline: 'Immediate - applicable from day one of employment',
    penalty: 'Up to Rs.50,000 fine for first offense; up to Rs.1 Lakh for subsequent offenses',
    actionIfNonCompliant: [
      'Identify applicable minimum wage for your geographic area (Central/State)',
      'Check wage category by skill level: unskilled, semi-skilled, skilled, highly skilled',
      'Verify floor wage notification from Central Government',
      'Review all employee salaries against applicable minimum wage',
      'Pay differential to employees below minimum wage immediately',
      'Update payroll systems to prevent future violations',
    ],
    actionIfCompliant: 'Minimum wage compliant. Monitor quarterly notifications for revisions. Document compliance in wage registers.',
  },

  wages_2: {
    questionId: 'wages_2',
    category: 'Code on Wages',
    requirement: 'Wage Payment Timeline (7 days)',
    governmentRef: 'Code on Wages 2019 - Section 17',
    officialLink: 'https://labour.gov.in/sites/default/files/THE%20CODE%20ON%20WAGES%2C%202019.pdf',
    deadline: 'Within 7 days of wage period end for monthly wages',
    penalty: 'Up to Rs.50,000 fine; workers entitled to compensation for delayed payment',
    actionIfNonCompliant: [
      'Review current payroll processing timeline',
      'Monthly wages: must be paid within 7 days of month end',
      'Weekly wages: must be paid on last working day of the week',
      'Daily wages: must be paid at the end of the shift',
      'Automate payroll processing to ensure timely disbursement',
      'Establish backup procedures for system failures',
    ],
    actionIfCompliant: 'Wage payment timely. Maintain records of payment dates. Document any exceptional delays with reasons.',
  },

  wages_3: {
    questionId: 'wages_3',
    category: 'Code on Wages',
    requirement: 'Full & Final Settlement (2 working days)',
    governmentRef: 'Code on Wages 2019 - Section 17(2)',
    officialLink: 'https://labour.gov.in/sites/default/files/THE%20CODE%20ON%20WAGES%2C%202019.pdf',
    deadline: '2 working days from date of termination/resignation',
    penalty: 'Compensation payable to employee for delay; fine up to Rs.50,000',
    actionIfNonCompliant: [
      'Revise separation policy to enable 2-day settlement',
      'Pre-compute leave encashment, gratuity, bonus during notice period',
      'Streamline no-dues clearance process',
      'Establish emergency settlement fund for immediate payouts',
      'Train HR team on accelerated F&F processing',
      'Automate calculation of all final dues',
    ],
    actionIfCompliant: 'F&F process within timeline. Document settlement dates. Keep acknowledgment receipts from separated employees.',
  },

  wages_4: {
    questionId: 'wages_4',
    category: 'Code on Wages',
    requirement: '50% Basic + DA Rule',
    governmentRef: 'Code on Wages 2019 - Section 2(y) definition of wages',
    officialLink: 'https://labour.gov.in/sites/default/files/THE%20CODE%20ON%20WAGES%2C%202019.pdf',
    deadline: 'From date Labour Codes are notified (expected November 2025)',
    penalty: 'Excess allowances reclassified as wages; back-dues for PF, ESI, Gratuity; interest and penalties',
    actionIfNonCompliant: [
      'Audit current salary structure for all employees',
      'Calculate: Basic + DA as percentage of gross remuneration',
      'If below 50%, restructure CTC to comply',
      'Allowances excluded from wages: HRA, conveyance, overtime, gratuity, bonus, commissions',
      'Model financial impact: higher PF/Gratuity cost vs non-compliance risk',
      'Communicate restructuring to employees with benefits explanation',
    ],
    actionIfCompliant: 'Wage structure compliant. Document current structure for audit readiness. Review annually.',
  },

  wages_5: {
    questionId: 'wages_5',
    category: 'Code on Wages',
    requirement: 'Overtime at 2x Normal Rate',
    governmentRef: 'Code on Wages 2019 - Section 14',
    officialLink: 'https://labour.gov.in/sites/default/files/THE%20CODE%20ON%20WAGES%2C%202019.pdf',
    deadline: 'Continuous compliance',
    penalty: 'Up to Rs.50,000 fine; workers entitled to claim unpaid overtime',
    actionIfNonCompliant: [
      'Review overtime calculation methodology',
      'Overtime rate = 2x normal hourly wage (uniform across establishments)',
      'Normal hourly rate = Monthly wages / (4.33 weeks x weekly hours)',
      'Update payroll system for correct OT calculation',
      'Maintain overtime register with worker signatures',
      'Ensure overtime hours recorded accurately via biometric/attendance system',
    ],
    actionIfCompliant: 'Overtime correctly compensated. Monitor quarterly overtime reports. Review workers approaching maximum limits.',
  },

  wages_6: {
    questionId: 'wages_6',
    category: 'Code on Wages',
    requirement: 'Gender Pay Parity',
    governmentRef: 'Code on Wages 2019 - Section 3 (Equal Remuneration)',
    officialLink: 'https://labour.gov.in/sites/default/files/THE%20CODE%20ON%20WAGES%2C%202019.pdf',
    deadline: 'Immediate - continuous compliance',
    penalty: 'Up to Rs.50,000 fine; compensation to affected employees; reputational damage',
    actionIfNonCompliant: [
      'Conduct pay equity audit across all roles and grades',
      'Compare compensation for same or similar work irrespective of gender',
      'Identify and document any legitimate differentiators (experience, performance, tenure)',
      'Close unjustified pay gaps through salary revision',
      'Implement structured pay bands to prevent future disparities',
      'Document audit findings and corrective actions taken',
    ],
    actionIfCompliant: 'Pay parity maintained. Conduct annual pay equity audit. Include in diversity reporting.',
  },

  wages_7: {
    questionId: 'wages_7',
    category: 'Code on Wages',
    requirement: 'Statutory Bonus Payment',
    governmentRef: 'Code on Wages 2019 - Section 26-35 (Bonus Chapter)',
    officialLink: 'https://labour.gov.in/sites/default/files/THE%20CODE%20ON%20WAGES%2C%202019.pdf',
    deadline: '8 months from end of accounting year (typically November for March year-end)',
    penalty: 'Up to Rs.50,000 fine; imprisonment up to 1 month for willful default',
    actionIfNonCompliant: [
      'Identify eligible employees: earning up to Rs.21,000/month',
      'Calculate allocable surplus from P&L statement',
      'Minimum bonus: 8.33% of wages',
      'Maximum bonus: 20% of wages',
      'Maintain bonus register (Form D) with individual calculations',
      'Pay bonus within 8 months of year end',
      'File Form C (Annual Return) with Labour Department',
    ],
    actionIfCompliant: 'Bonus paid timely. Maintain records for 8 years. File annual returns as required.',
  },

  // ==========================================================================
  // CODE ON SOCIAL SECURITY QUESTIONS
  // ==========================================================================

  ss_1: {
    questionId: 'ss_1',
    category: 'Social Security',
    requirement: 'EPF Enrollment for Eligible Employees',
    governmentRef: 'Code on Social Security 2020 - Section 16 | EPF Scheme Para 26',
    officialLink: 'https://unifiedportal-emp.epfindia.gov.in',
    deadline: 'Within 1 month of crossing 20 employees or joining date of eligible employee',
    penalty: '1% monthly damage + 12% p.a. interest on delayed contributions; prosecution for willful default',
    actionIfNonCompliant: [
      'Identify all employees earning up to Rs.15,000/month basic + DA',
      'Register missing employees on EPFO Unified Portal',
      'Generate and verify Universal Account Numbers (UANs)',
      'Deposit arrear contributions with interest',
      'Update employee records with UAN and KYC',
      'Set up monthly ECR filing process by 15th',
    ],
    actionIfCompliant: 'EPF enrollment compliant. Verify UAN activation for all members. Conduct quarterly reconciliation.',
  },

  ss_2: {
    questionId: 'ss_2',
    category: 'Social Security',
    requirement: 'EPF Contribution Remittance by 15th',
    governmentRef: 'Code on Social Security 2020 - Section 16 | EPF Scheme Para 38',
    officialLink: 'https://unifiedportal-emp.epfindia.gov.in',
    deadline: '15th of month following wage month',
    penalty: '1% damage per month + 12% p.a. interest; prosecution for persistent default',
    actionIfNonCompliant: [
      'Generate ECR (Electronic Challan cum Return) on EPFO portal',
      'Total contribution: 24% (12% employee + 12% employer)',
      'Breakup: EPF 3.67%, EPS 8.33%, Admin 0.5%, EDLI 0.5%',
      'Pay through EPFO-approved banks before 15th',
      'Verify TRRN (Transaction Reference Number) after payment',
      'Download ECR receipt for records',
    ],
    actionIfCompliant: 'EPF contributions timely. Maintain 6-year record retention. Reconcile annual account statements.',
  },

  ss_3: {
    questionId: 'ss_3',
    category: 'Social Security',
    requirement: 'ESIC Registration for Eligible Employees',
    governmentRef: 'Code on Social Security 2020 - Section 45 | ESI Act Section 2(9)',
    officialLink: 'https://www.esic.gov.in',
    deadline: 'Within 15 days of crossing 10 employees threshold',
    penalty: '12% p.a. interest + 5-25% damages on contribution; prosecution for willful evasion',
    actionIfNonCompliant: [
      'Identify all employees earning up to Rs.21,000/month gross',
      'Register on ESIC portal with establishment details',
      'Enroll all eligible employees with Aadhaar linkage',
      'Collect employee family details for IP card generation',
      'Deposit arrear contributions with applicable interest',
      'Set up monthly contribution filing by 15th',
    ],
    actionIfCompliant: 'ESIC registration compliant. Ensure IP cards distributed. File half-yearly returns (11th May/Nov).',
  },

  ss_4: {
    questionId: 'ss_4',
    category: 'Social Security',
    requirement: 'Compulsory Gratuity Insurance',
    governmentRef: 'Code on Social Security 2020 - Section 53 | Payment of Gratuity Act Section 4A',
    officialLink: 'https://licindia.in/Products/Group-Insurance/Group-Gratuity',
    deadline: 'From date of applicability (10+ employees)',
    penalty: 'Up to Rs.50,000 fine; employer personally liable for gratuity payment',
    actionIfNonCompliant: [
      'NEW REQUIREMENT: Insurance for gratuity liability is now mandatory',
      'Option 1: LIC Group Gratuity Scheme (most popular)',
      'Option 2: Private insurer gratuity plans (ICICI Prudential, HDFC Life)',
      'Option 3: Approved gratuity trust (for larger organizations)',
      'Annual premium approximately 4.81% of salary',
      'Actuarial valuation for liability assessment',
    ],
    actionIfCompliant: 'Gratuity insurance in place. Review adequacy annually. Update for salary revisions.',
  },

  ss_5: {
    questionId: 'ss_5',
    category: 'Social Security',
    requirement: 'Pro-rata Gratuity for Fixed-Term Employees',
    governmentRef: 'Code on Social Security 2020 - Section 53(2)(b)',
    officialLink: 'https://labour.gov.in/sites/default/files/SS_Code_Gazette.pdf',
    deadline: 'Upon completion of 1 year service by fixed-term employee',
    penalty: 'Non-payment treated as gratuity denial; penalties under Gratuity Act',
    actionIfNonCompliant: [
      'NEW PROVISION: Fixed-term employees eligible after 1 year (vs 5 years for regular)',
      'Calculate pro-rata gratuity: 15 days wages per year of service',
      'Wages = last drawn basic + DA',
      'Include in final settlement for fixed-term contract completion',
      'Update HR policies and employment contracts',
      'Budget for enhanced gratuity liability',
    ],
    actionIfCompliant: 'Fixed-term gratuity policy updated. Include in employment contracts. Track tenure for eligibility.',
  },

  ss_6: {
    questionId: 'ss_6',
    category: 'Social Security',
    requirement: '26 Weeks Maternity Leave',
    governmentRef: 'Code on Social Security 2020 - Section 60-65 | Maternity Benefit Act 2017',
    officialLink: 'https://labour.gov.in/sites/default/files/MB%20Amendment%20Act%2C2017.pdf',
    deadline: 'Applicable for first two children; 12 weeks for third child onwards',
    penalty: 'Up to Rs.50,000 fine or 3 months imprisonment; compensation to affected employee',
    actionIfNonCompliant: [
      'Update maternity leave policy to provide 26 weeks for first two children',
      '12 weeks for third child onwards',
      '12 weeks for adoptive and commissioning mothers',
      'Leave can start up to 8 weeks before expected delivery',
      'Medical bonus of Rs.3,500 if no pre/post-natal care provided',
      'Work from home option where nature of work permits',
    ],
    actionIfCompliant: 'Maternity policy compliant. Communicate to all female employees. Train HR on implementation.',
  },

  ss_7: {
    questionId: 'ss_7',
    category: 'Social Security',
    requirement: 'Social Security Fund for Gig/Platform Workers',
    governmentRef: 'Code on Social Security 2020 - Section 114',
    officialLink: 'https://labour.gov.in/sites/default/files/SS_Code_Gazette.pdf',
    deadline: 'From date of notification by Central Government',
    penalty: 'Penalties as specified in rules (to be notified)',
    actionIfNonCompliant: [
      'NEW PROVISION for aggregators (ride-sharing, food delivery, logistics)',
      'Contribution: 1-2% of annual turnover to Social Security Fund',
      'Fund provides life insurance, disability cover, health insurance to gig workers',
      'Register with e-Shram portal for gig worker database',
      'Await Central Government notification for implementation rules',
      'Prepare systems for contribution calculation and remittance',
    ],
    actionIfCompliant: 'Prepared for gig worker compliance. Monitor MoL notifications. Budget for contribution.',
  },

  ss_8: {
    questionId: 'ss_8',
    category: 'Social Security',
    requirement: 'Creche Facility (50+ employees)',
    governmentRef: 'Code on Social Security 2020 - Section 67 | OSH Code Section 24',
    officialLink: 'https://labour.gov.in',
    deadline: 'From date organization crosses 50 employees threshold',
    penalty: 'Penalty under OSH Code; inspection findings; employee grievances',
    actionIfNonCompliant: [
      'Mandatory for establishments with 50+ employees',
      'Gender-neutral requirement (not just for women employees)',
      'Option 1: In-house creche within prescribed distance',
      'Option 2: Common creche facility tie-up',
      'Option 3: Creche allowance as interim arrangement',
      'Allow mother 4 visits per day to creche facility',
    ],
    actionIfCompliant: 'Creche facility available. Maintain quality standards. Communicate to employees.',
  },

  // ==========================================================================
  // OSH CODE QUESTIONS
  // ==========================================================================

  osh_1: {
    questionId: 'osh_1',
    category: 'OSH Code',
    requirement: 'Single Registration via Shram Suvidha Portal',
    governmentRef: 'OSH Code 2020 - Section 3 | Single Registration Rules',
    officialLink: 'https://shramsuvidha.gov.in',
    deadline: 'Within 60 days of establishment or crossing 10 workers threshold',
    penalty: 'Up to Rs.50,000 fine for first offense; Rs.2 Lakh for subsequent offenses',
    actionIfNonCompliant: [
      'Single registration replaces 6 previous separate registrations',
      'Visit shramsuvidha.gov.in and create employer account',
      'Submit establishment details: name, address, nature of business',
      'Upload required documents: PAN, address proof, employee list',
      'Registration valid for lifetime (no renewal needed)',
      'Update within 30 days for any change in particulars',
    ],
    actionIfCompliant: 'Registration complete. Update for material changes. Use LIN for all statutory filings.',
  },

  osh_2: {
    questionId: 'osh_2',
    category: 'OSH Code',
    requirement: 'Working Hours Limit (8 hours/day, 48 hours/week)',
    governmentRef: 'OSH Code 2020 - Section 25-26',
    officialLink: 'https://labour.gov.in/sites/default/files/OSHCODE2020.pdf',
    deadline: 'Continuous compliance',
    penalty: 'Up to Rs.2 Lakh fine for willful default; prosecution for persistent violation',
    actionIfNonCompliant: [
      'Maximum working hours: 8 hours/day, 48 hours/week (reduced from 9 hours)',
      'Spread-over (including intervals): maximum 12 hours',
      'Weekly off mandatory - cannot work more than 10 consecutive days',
      'Review shift patterns and schedules',
      'Update attendance and time tracking systems',
      'Consider 4-day week option under flexi-work provisions',
    ],
    actionIfCompliant: 'Working hours compliant. Monitor via attendance system. Review overtime patterns monthly.',
  },

  osh_3: {
    questionId: 'osh_3',
    category: 'OSH Code',
    requirement: 'Mandatory Consent for Overtime',
    governmentRef: 'OSH Code 2020 - Section 27',
    officialLink: 'https://labour.gov.in/sites/default/files/OSHCODE2020.pdf',
    deadline: 'Before assigning any overtime work',
    penalty: 'Overtime without consent is forced labour; criminal prosecution possible',
    actionIfNonCompliant: [
      'NEW REQUIREMENT: Worker consent mandatory for overtime',
      'Implement written/digital consent mechanism',
      'Maximum overtime: 125 hours per quarter (with exemption: 175 hours)',
      'Maintain overtime register with worker signatures',
      'Pay overtime at 2x normal rate',
      'Cannot force overtime as condition of employment',
    ],
    actionIfCompliant: 'Consent mechanism in place. Track quarterly limits. Document all overtime instances.',
  },

  osh_4: {
    questionId: 'osh_4',
    category: 'OSH Code',
    requirement: 'Women Night Shift Safety Provisions',
    governmentRef: 'OSH Code 2020 - Section 43',
    officialLink: 'https://labour.gov.in/sites/default/files/OSHCODE2020.pdf',
    deadline: 'Before deploying women on night shifts (7PM-6AM)',
    penalty: 'Up to Rs.2 Lakh fine; employer liable for safety incidents',
    actionIfNonCompliant: [
      'NEW PROVISION: Women allowed on night shifts with safety measures',
      'Obtain written consent from women employees',
      'Provide safe transportation (not public transport)',
      'Ensure adequate lighting, security at workplace',
      'Implement panic buttons, CCTV monitoring',
      'Train security staff on women safety protocols',
      'File night shift roster with local Labour Department',
    ],
    actionIfCompliant: 'Safety measures in place. Review periodically. Collect feedback from women employees.',
  },

  osh_5: {
    questionId: 'osh_5',
    category: 'OSH Code',
    requirement: 'Contract Labour - Contractor Licensing',
    governmentRef: 'OSH Code 2020 - Section 45-58',
    officialLink: 'https://shramsuvidha.gov.in',
    deadline: 'Before engaging 50+ contract workers',
    penalty: 'Up to Rs.1 Lakh fine; unlicensed contractor deployment is illegal',
    actionIfNonCompliant: [
      'Threshold raised from 20 to 50 contract workers',
      'Principal employer must register if engaging 50+ contract workers',
      'Contractor must have valid licence (now 5-year all-India validity)',
      'Verify contractor licence on Shram Suvidha Portal',
      'Maintain contractor compliance register',
      'Ensure contractor provides statutory benefits to workers',
    ],
    actionIfCompliant: 'Contractor licensing compliant. Verify licences annually. Maintain centralized contractor register.',
  },

  osh_6: {
    questionId: 'osh_6',
    category: 'OSH Code',
    requirement: 'Contract Labour - Non-Core Activities Only',
    governmentRef: 'OSH Code 2020 - Section 57',
    officialLink: 'https://labour.gov.in/sites/default/files/OSHCODE2020.pdf',
    deadline: 'Continuous compliance',
    penalty: 'Contract workers may claim permanent employment; back-wages liability',
    actionIfNonCompliant: [
      'Contract labour PROHIBITED in core activities of the establishment',
      'Permissible: sanitation, security, canteen, housekeeping',
      'Exception: sudden volume spikes, intermittent work',
      'Audit current contract worker deployment',
      'Reclassify core activity workers as regular employees or outsource function',
      'Document justification for any non-standard contract deployment',
    ],
    actionIfCompliant: 'Contract deployment in permitted areas. Review annually. Document work nature for all contract workers.',
  },

  osh_7: {
    questionId: 'osh_7',
    category: 'OSH Code',
    requirement: 'Canteen Facility (100+ workers)',
    governmentRef: 'OSH Code 2020 - Section 24',
    officialLink: 'https://labour.gov.in/sites/default/files/OSHCODE2020.pdf',
    deadline: 'From date organization crosses 100 workers threshold',
    penalty: 'Penalty under OSH Code; inspection findings',
    actionIfNonCompliant: [
      'Threshold reduced from 250 to 100 workers',
      'Option 1: In-house canteen with prescribed space and hygiene standards',
      'Option 2: Contracted canteen services',
      'Option 3: Subsidized meal vouchers (interim arrangement)',
      'Canteen must offer subsidized rates (employer contribution mandatory)',
      'FSSAI registration required for canteen operator',
    ],
    actionIfCompliant: 'Canteen facility available. Monitor quality and hygiene. Employee satisfaction surveys.',
  },

  osh_8: {
    questionId: 'osh_8',
    category: 'OSH Code',
    requirement: 'Inter-State Migrant Worker Benefits',
    governmentRef: 'OSH Code 2020 - Section 59-64',
    officialLink: 'https://shramsuvidha.gov.in',
    deadline: 'For establishments with 10+ inter-state migrant workers earning up to Rs.18,000',
    penalty: 'Up to Rs.50,000 fine; migrant workers may claim additional benefits',
    actionIfNonCompliant: [
      'Identify inter-state migrant workers (different domicile state from workplace)',
      'Wage ceiling: Rs.18,000/month for migrant worker status',
      'Mandatory benefits: journey allowance (home and return)',
      'Annual medical checkup at employer cost',
      'Suitable accommodation or allowance',
      'Register migrant workers on e-Shram portal',
    ],
    actionIfCompliant: 'Migrant worker benefits provided. Maintain separate register. File returns as required.',
  },

  // ==========================================================================
  // INDUSTRIAL RELATIONS CODE QUESTIONS
  // ==========================================================================

  ir_1: {
    questionId: 'ir_1',
    category: 'Industrial Relations',
    requirement: 'Grievance Redressal Committee (20+ workers)',
    governmentRef: 'Industrial Relations Code 2020 - Section 4',
    officialLink: 'https://labour.gov.in/sites/default/files/IR_Code_Gazette.pdf',
    deadline: 'Within 60 days of Labour Codes notification',
    penalty: 'Up to Rs.50,000 fine; adverse impact in industrial disputes',
    actionIfNonCompliant: [
      'Constitute GRC with equal employer-worker representation',
      'Maximum 10 members (5 employer + 5 worker representatives)',
      'Women representation mandatory in proportion to workforce',
      'Chairperson elected from GRC members',
      'Written grievance procedure with defined timelines',
      'Grievances must be resolved within 30 days',
      'Maintain minutes of all GRC meetings',
    ],
    actionIfCompliant: 'GRC operational. Conduct quarterly meetings. Review effectiveness annually.',
  },

  ir_2: {
    questionId: 'ir_2',
    category: 'Industrial Relations',
    requirement: 'Standing Orders (300+ workers)',
    governmentRef: 'Industrial Relations Code 2020 - Section 29-34',
    officialLink: 'https://labour.gov.in/sites/default/files/IR_Code_Gazette.pdf',
    deadline: 'Within 6 months of crossing 300 workers threshold',
    penalty: 'Up to Rs.50,000 fine; model standing orders apply by default',
    actionIfNonCompliant: [
      'Threshold raised from 100 to 300 workers',
      'Option 1: Adopt Model Standing Orders (deemed certified on adoption)',
      'Option 2: Draft custom standing orders and get certified',
      'Standing orders cover: working hours, shifts, attendance, leave, termination, misconduct',
      'Display standing orders prominently at workplace',
      'Provide copy in English and regional language',
    ],
    actionIfCompliant: 'Standing orders in place. Display prominently. Review when regulations change.',
  },

  ir_3: {
    questionId: 'ir_3',
    category: 'Industrial Relations',
    requirement: 'Works Committee (100+ workers)',
    governmentRef: 'Industrial Relations Code 2020 - Section 3',
    officialLink: 'https://labour.gov.in/sites/default/files/IR_Code_Gazette.pdf',
    deadline: 'Within 60 days of Labour Codes notification or crossing 100 workers',
    penalty: 'Up to Rs.10,000 fine; poor industrial relations',
    actionIfNonCompliant: [
      'Constitute Works Committee with equal employer-worker representation',
      'Purpose: promote good relations, discuss matters of common interest',
      'Worker representatives elected by workers',
      'Meet at least once a quarter',
      'Cannot discuss matters covered by collective bargaining',
      'Maintain minutes and action items from meetings',
    ],
    actionIfCompliant: 'Works Committee functional. Quarterly meetings documented. Use for employee engagement.',
  },

  ir_4: {
    questionId: 'ir_4',
    category: 'Industrial Relations',
    requirement: 'Strike Definition - Concerted Casual Leave',
    governmentRef: 'Industrial Relations Code 2020 - Section 2(zk)',
    officialLink: 'https://labour.gov.in/sites/default/files/IR_Code_Gazette.pdf',
    deadline: 'Immediate awareness and policy update',
    penalty: 'Employer can take disciplinary action for illegal strike',
    actionIfNonCompliant: [
      'NEW DEFINITION: 50%+ workers taking casual leave = strike',
      'Update leave policy to address concerted leave',
      'Train supervisors to identify and report mass leave patterns',
      'Implement leave approval workflow',
      'Document attendance patterns for evidence',
      'Have contingency plan for sudden mass absences',
    ],
    actionIfCompliant: 'Policy updated. Attendance monitoring in place. HR trained on new definition.',
  },

  ir_5: {
    questionId: 'ir_5',
    category: 'Industrial Relations',
    requirement: '14-Day Strike Notice Mechanism',
    governmentRef: 'Industrial Relations Code 2020 - Section 62',
    officialLink: 'https://labour.gov.in/sites/default/files/IR_Code_Gazette.pdf',
    deadline: 'Mechanism must be in place before any potential strike situation',
    penalty: 'Strike without notice is illegal; workers can be disciplined',
    actionIfNonCompliant: [
      'NEW REQUIREMENT: Strike notice mandatory for ALL establishments (not just public utilities)',
      'Notice period: 14 days in advance',
      'Notice must specify: reasons, date/time of strike, expected duration',
      'Establish designated authority to receive notices',
      'Communicate notice requirement to workers and unions',
      'Document any notices received and response actions',
    ],
    actionIfCompliant: 'Notice mechanism established. Contact points defined. HR prepared for dispute resolution.',
  },

  ir_6: {
    questionId: 'ir_6',
    category: 'Industrial Relations',
    requirement: 'Fixed-Term Employee Equal Treatment',
    governmentRef: 'Industrial Relations Code 2020 - Section 2(o)',
    officialLink: 'https://labour.gov.in/sites/default/files/IR_Code_Gazette.pdf',
    deadline: 'Immediate - applies to all fixed-term contracts',
    penalty: 'Fixed-term employees may claim discrimination; back-wages liability',
    actionIfNonCompliant: [
      'Fixed-term employees entitled to SAME treatment as permanent workers',
      'Same wages for same work',
      'Same working hours and conditions',
      'Same statutory benefits (PF, ESI, leave)',
      'Gratuity after 1 year (not 5 years)',
      'Update employment contracts and policies',
      'Review current fixed-term arrangements for compliance',
    ],
    actionIfCompliant: 'Equal treatment policy in place. Contracts updated. HR processes aligned.',
  },

  ir_7: {
    questionId: 'ir_7',
    category: 'Industrial Relations',
    requirement: 'LIFO Principle for Retrenchment',
    governmentRef: 'Industrial Relations Code 2020 - Section 70',
    officialLink: 'https://labour.gov.in/sites/default/files/IR_Code_Gazette.pdf',
    deadline: 'Before any retrenchment exercise',
    penalty: 'Retrenchment can be challenged; reinstatement with back wages',
    actionIfNonCompliant: [
      'Last-In-First-Out (LIFO) principle mandatory within worker categories',
      'Retrench junior workers first in each category',
      'Compensation: 15 days wages per year of service',
      'NEW: Contribution to Reskilling Fund (rate to be notified)',
      '60 days notice for closure to workers and government',
      '300+ workers: Prior government permission required for retrenchment/closure',
    ],
    actionIfCompliant: 'LIFO documented in policy. Retrenchment procedure formalized. HR trained.',
  },
};

// ==========================================================================
// CATEGORY LABELS FOR PDF DISPLAY
// ==========================================================================

export const LABOUR_CODE_CATEGORY_LABELS: Record<string, string> = {
  wages: 'Code on Wages',
  social_security: 'Code on Social Security',
  osh: 'OSH Code',
  industrial_relations: 'Industrial Relations Code',
};

// ==========================================================================
// HELPER FUNCTION TO GET RULE BY QUESTION ID
// ==========================================================================

export function getLabourCodeComplianceRule(questionId: string): LabourCodeComplianceRule | undefined {
  return LABOUR_CODE_COMPLIANCE_RULES[questionId];
}

// ==========================================================================
// GET ALL RULES FOR A CATEGORY
// ==========================================================================

export function getLabourCodeRulesByCategory(category: string): LabourCodeComplianceRule[] {
  return Object.values(LABOUR_CODE_COMPLIANCE_RULES).filter(rule => 
    (rule.category ?? '').toLowerCase().includes(category.toLowerCase())
  );
}
