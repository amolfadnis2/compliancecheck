/**
 * ComplianceCheck - POSH Act 2013 Compliance Rules
 * 
 * Complete compliance knowledge base for POSH Assessment
 * Maps each question ID to penalties, deadlines, government references, and remediation steps
 * 
 * Sources: POSH Act 2013, POSH Rules 2013, Companies (Accounts) Rules 2014,
 * Key Judgments: Vishaka, Aureliano Fernandes, Ruchika Singh, ISG Novasoft
 * 
 * Total: 45 rules across 6 categories
 * Last Updated: January 2025
 */

// ============================================================================
// COMPLIANCE RULE INTERFACE
// ============================================================================

export interface POSHComplianceRule {
  questionId: string;
  requirement: string;
  governmentRef: string;
  officialLink: string;
  deadline: string;
  penalty: string;
  actionIfNonCompliant: string[];
  actionIfCompliant: string;
  applicabilityNote?: string;
}

// ============================================================================
// SECTION A: ICC CONSTITUTION RULES (10 rules)
// ============================================================================

const ICC_CONSTITUTION_RULES: POSHComplianceRule[] = [
  {
    questionId: 'POSH_ICC_001',
    requirement: 'Constitute Internal Complaints Committee (ICC) with All Required Members',
    governmentRef: 'POSH Act 2013, Section 4(2)',
    officialLink: 'https://wcd.nic.in/act/sexual-harassment-women-workplace-prevention-prohibition-and-redressal-act-2013',
    deadline: 'Immediate (mandatory for organizations with 10+ employees)',
    penalty: 'Rs. 50,000 (first offense); Rs. 1,00,000 (repeat offense); License cancellation (continued non-compliance). Judicial awards up to Rs. 1.68 crore (ISG Novasoft case).',
    actionIfNonCompliant: [
      'Identify senior woman employee for Presiding Officer role',
      'Nominate minimum 2 employee members (preferably with social work/legal background)',
      'Engage qualified external member from NGO or with 5+ years women\'s empowerment experience',
      'Issue formal nomination orders with member names, roles, and effective dates',
      'Ensure at least 50% of ICC members are women',
      'Display ICC constitution order at conspicuous workplace locations',
    ],
    actionIfCompliant: 'Track member tenure for 3-year reconstitution requirement. Review ICC composition annually. Maintain nomination orders and qualification documentation.',
    applicabilityNote: 'Mandatory for all organizations with 10+ employees (including contract, temporary, and intern workers)',
  },
  {
    questionId: 'POSH_ICC_002',
    requirement: 'Appoint Senior Woman Employee as Presiding Officer',
    governmentRef: 'POSH Act 2013, Section 4(2)(a)',
    officialLink: 'https://wcd.nic.in/act/sexual-harassment-women-workplace-prevention-prohibition-and-redressal-act-2013',
    deadline: 'Part of ICC constitution (immediate)',
    penalty: 'ICC may be deemed improperly constituted; Rs. 50,000+ penalty under Section 26',
    actionIfNonCompliant: [
      'Identify senior-level woman employee at your workplace',
      'If no senior woman available at current location, nominate from another office of the same employer',
      'Issue formal nomination order specifying Presiding Officer role',
      'Document selection rationale and seniority level',
      'Ensure Presiding Officer is available for ICC proceedings (quorum requirement)',
    ],
    actionIfCompliant: 'Maintain succession plan for Presiding Officer. Document seniority criteria. Update nomination if Presiding Officer changes role or leaves.',
    applicabilityNote: 'Presiding Officer must attend all ICC proceedings; minimum quorum of 3 includes Presiding Officer',
  },
  {
    questionId: 'POSH_ICC_003',
    requirement: 'Appoint Qualified External Member to ICC',
    governmentRef: 'POSH Act 2013, Section 4(2)(c); POSH Rules 2013, Rule 4',
    officialLink: 'https://wcd.nic.in/act/sexual-harassment-women-workplace-prevention-prohibition-and-redressal-act-2013',
    deadline: 'Part of ICC constitution (immediate for 10+ employees)',
    penalty: 'ICC may be invalidated entirely (Ruchika Singh v. Air France precedent); Rs. 50,000+ penalty',
    actionIfNonCompliant: [
      'Identify NGOs working on women\'s issues in your district/city',
      'Alternatively, find person with 5+ years documented experience in women\'s empowerment',
      'Third option: Person familiar with labor/civil/criminal law AND connection to women\'s causes',
      'Verify qualification: NGO membership certificate OR experience letters OR legal credentials plus women\'s cause connection',
      'Issue formal nomination order with term dates (max 3 years)',
      'Arrange payment: Rs. 200/day sitting fee + travel (3-tier AC equivalent) per Rule 6',
      'Document external member\'s qualification in ICC records',
    ],
    actionIfCompliant: 'Verify external member qualification is documented. Track tenure for reconstitution. Review engagement and payment records annually.',
    applicabilityNote: 'External member is MANDATORY; Delhi HC invalidated ICC in Ruchika Singh case for unqualified external member',
  },
  {
    questionId: 'POSH_ICC_004',
    requirement: 'Maintain at Least 50% Women Composition in ICC',
    governmentRef: 'POSH Act 2013, Section 4(2) Proviso',
    officialLink: 'https://wcd.nic.in/act/sexual-harassment-women-workplace-prevention-prohibition-and-redressal-act-2013',
    deadline: 'Immediate and ongoing',
    penalty: 'ICC may be deemed improperly constituted; Section 26 penalties applicable',
    actionIfNonCompliant: [
      'Calculate current ICC composition by gender',
      'Identify additional women employees who can serve as ICC members',
      'Nominate sufficient women members to achieve 50%+ composition',
      'Issue updated nomination orders reflecting compliant composition',
      'Update displayed ICC constitution order',
    ],
    actionIfCompliant: 'Verify gender composition when any member changes. Document composition ratio in ICC records. Plan succession to maintain compliance.',
  },
  {
    questionId: 'POSH_ICC_005',
    requirement: 'Reconstitute ICC Within 3-Year Maximum Tenure',
    governmentRef: 'POSH Act 2013, Section 4(3)',
    officialLink: 'https://wcd.nic.in/act/sexual-harassment-women-workplace-prevention-prohibition-and-redressal-act-2013',
    deadline: 'Every 3 years from constitution date',
    penalty: 'Expired ICC = No valid ICC; Section 26 penalties for operating without ICC',
    actionIfNonCompliant: [
      'Check constitution date of current ICC from nomination orders',
      'If tenure exceeded 3 years, initiate immediate reconstitution',
      'Identify eligible members (existing may be reappointed)',
      'Issue fresh nomination orders with new 3-year term dates',
      'Update displayed ICC constitution order with new dates',
      'Maintain calendar reminders for next reconstitution',
    ],
    actionIfCompliant: 'Set calendar reminder 3 months before tenure expiry. Maintain nomination order archive. Plan for smooth reconstitution.',
  },
  {
    questionId: 'POSH_ICC_006',
    requirement: 'Issue Written Nomination Orders for All ICC Members',
    governmentRef: 'POSH Act 2013, Section 4; POSH Rules 2013, Rule 4',
    officialLink: 'https://wcd.nic.in/act/sexual-harassment-women-workplace-prevention-prohibition-and-redressal-act-2013',
    deadline: 'At time of ICC constitution',
    penalty: 'Informal appointments may not constitute valid ICC; Section 26 penalties if ICC deemed invalid',
    actionIfNonCompliant: [
      'Create formal nomination order template covering member name, designation, ICC role, effective date',
      'Issue individual nomination orders for each ICC member',
      'Obtain signed acceptance from each member',
      'Specify external member fee and travel reimbursement arrangements',
      'Maintain nomination orders in ICC records file',
      'Display updated ICC constitution order at workplace',
    ],
    actionIfCompliant: 'Archive all nomination orders securely. Update orders when members change. Include nomination order copies in annual compliance documentation.',
  },
  {
    questionId: 'POSH_ICC_007',
    requirement: 'Pay External Member Fees and Travel Reimbursement',
    governmentRef: 'POSH Rules 2013, Rule 6',
    officialLink: 'https://wcd.nic.in/act/sexual-harassment-women-workplace-prevention-prohibition-and-redressal-act-2013',
    deadline: 'Ongoing (as services rendered)',
    penalty: 'External member may disengage; potential Section 26 penalty if ICC becomes non-functional',
    actionIfNonCompliant: [
      'Review Rule 6 requirements: Rs. 200/day sitting fee + travel reimbursement',
      'Travel reimbursement is 3-tier AC train fare or equivalent',
      'Establish payment process with finance/accounts team',
      'Create attendance and payment register for external member',
      'Process payments within 30 days of ICC meetings/proceedings',
    ],
    actionIfCompliant: 'Maintain payment records for audit. Review fee adequacy annually. Document any pro bono arrangement in writing.',
    applicabilityNote: 'Fees to be paid by employer; external member entitled to fees and travel for all ICC meetings and inquiry proceedings',
  },
  {
    questionId: 'POSH_ICC_008',
    requirement: 'Constitute Separate ICCs at Each Location with 10+ Employees',
    governmentRef: 'POSH Act 2013, Section 4(1) Proviso',
    officialLink: 'https://wcd.nic.in/act/sexual-harassment-women-workplace-prevention-prohibition-and-redressal-act-2013',
    deadline: 'Immediate for all qualifying locations',
    penalty: 'Centralized ICC model is explicitly non-compliant; Section 26 penalties per non-covered location',
    actionIfNonCompliant: [
      'Audit all office locations and count employees (including contract/temporary)',
      'Identify locations with 10+ employees requiring separate ICC',
      'Constitute ICC at each qualifying location following Section 4(2) requirements',
      'Issue location-specific nomination orders',
      'Display ICC constitution order at each location',
      'Establish coordination mechanism between ICCs for multi-location complaints',
    ],
    actionIfCompliant: 'Review location headcount quarterly. Constitute new ICC when any location crosses 10 employees. Maintain location-wise ICC register.',
    applicabilityNote: 'Single centralized ICC is NOT compliant for multi-location organizations; each office/administrative unit with 10+ employees needs separate ICC',
  },
  {
    questionId: 'POSH_ICC_009',
    requirement: 'Document ICC Member Qualifications and Selection Criteria',
    governmentRef: 'POSH Act 2013, Section 4(2); POSH Rules 2013, Rule 4',
    officialLink: 'https://wcd.nic.in/act/sexual-harassment-women-workplace-prevention-prohibition-and-redressal-act-2013',
    deadline: 'At time of ICC constitution',
    penalty: 'ICC may be challenged in legal proceedings; Ruchika Singh precedent shows qualification scrutiny',
    actionIfNonCompliant: [
      'Document Presiding Officer\'s seniority level and designation',
      'Record internal members\' credentials (social work/legal background preferred)',
      'Obtain external member\'s NGO membership certificate OR experience letters OR legal credentials',
      'Create ICC member profile file with supporting documents',
      'Include qualification summary in ICC constitution order',
    ],
    actionIfCompliant: 'Update documentation when members change. Retain qualification records for 7+ years. Review external member credentials at each reconstitution.',
  },
  {
    questionId: 'POSH_ICC_010',
    requirement: 'Establish ICC Member Replacement and Succession Process',
    governmentRef: 'POSH Act 2013, Section 4',
    officialLink: 'https://wcd.nic.in/act/sexual-harassment-women-workplace-prevention-prohibition-and-redressal-act-2013',
    deadline: 'Before any vacancy arises',
    penalty: 'ICC may become non-functional during vacancy; complaints may be delayed or mishandled',
    actionIfNonCompliant: [
      'Draft documented replacement procedure for ICC vacancies',
      'Identify backup candidates for each ICC role',
      'Define timeline for filling vacancies (recommended: within 30 days)',
      'Include process for emergency interim appointments',
      'Communicate process to HR and management',
      'Review and test process annually',
    ],
    actionIfCompliant: 'Maintain backup candidate list. Document any member changes promptly. Ensure ICC remains functional during transitions.',
  },
];

// ============================================================================
// SECTION B: POLICY & DOCUMENTATION RULES (8 rules)
// ============================================================================

const POLICY_DOCUMENTATION_RULES: POSHComplianceRule[] = [
  {
    questionId: 'POSH_POL_001',
    requirement: 'Maintain Comprehensive Written POSH Policy',
    governmentRef: 'POSH Act 2013, Section 19(a)',
    officialLink: 'https://wcd.nic.in/act/sexual-harassment-women-workplace-prevention-prohibition-and-redressal-act-2013',
    deadline: 'Before commencing operations (immediate if not existing)',
    penalty: 'Rs. 50,000+ for Section 19 violation; employer liability in harassment incidents',
    actionIfNonCompliant: [
      'Draft comprehensive POSH policy covering all Section 3 harassment types',
      'Include ICC composition, contact details, and complaint procedure',
      'Specify inquiry process, timelines (90-day completion, 60-day implementation)',
      'Add interim relief provisions, confidentiality clause, and anti-retaliation measures',
      'Cover appeal mechanism (90-day appeal right under Section 18)',
      'Get policy approved by management/Board',
      'Communicate to all employees with acknowledgment',
    ],
    actionIfCompliant: 'Review policy every 2 years. Update for virtual harassment scenarios. Incorporate new judicial interpretations.',
  },
  {
    questionId: 'POSH_POL_002',
    requirement: 'Define All Five Types of Sexual Harassment per Section 3',
    governmentRef: 'POSH Act 2013, Section 3(2)',
    officialLink: 'https://wcd.nic.in/act/sexual-harassment-women-workplace-prevention-prohibition-and-redressal-act-2013',
    deadline: 'Part of policy creation',
    penalty: 'Incomplete policy may not meet Section 19 requirements; Rs. 50,000+ penalty',
    actionIfNonCompliant: [
      'Review current policy against Section 3(2) requirements',
      'Include Type 1: Physical contact and advances',
      'Include Type 2: Demand or request for sexual favors',
      'Include Type 3: Making sexually colored remarks',
      'Include Type 4: Showing pornography',
      'Include Type 5: Any other unwelcome physical, verbal or non-verbal conduct of sexual nature',
      'Add examples for each type for employee understanding',
    ],
    actionIfCompliant: 'Verify all five types are covered in training materials. Update examples for modern scenarios (digital harassment).',
  },
  {
    questionId: 'POSH_POL_003',
    requirement: 'Communicate POSH Policy to All Employees with Acknowledgment',
    governmentRef: 'POSH Act 2013, Section 19(c)',
    officialLink: 'https://wcd.nic.in/act/sexual-harassment-women-workplace-prevention-prohibition-and-redressal-act-2013',
    deadline: 'Upon joining (new employees) and annually (all employees)',
    penalty: 'Rs. 50,000+ for Section 19 violation; employees may claim ignorance',
    actionIfNonCompliant: [
      'Circulate POSH policy via email to all current employees',
      'Request and track policy acknowledgment (digital signature or form)',
      'Include POSH policy in employee onboarding packet',
      'Obtain acknowledgment from new joiners during induction',
      'Maintain central register of acknowledgments',
      'Follow up with employees who haven\'t acknowledged',
    ],
    actionIfCompliant: 'Circulate policy annually even if unchanged. Update acknowledgment register. Include acknowledgment status in employee files.',
  },
  {
    questionId: 'POSH_POL_004',
    requirement: 'Ensure POSH Policy is Easily Accessible to All Employees',
    governmentRef: 'POSH Act 2013, Section 19',
    officialLink: 'https://wcd.nic.in/act/sexual-harassment-women-workplace-prevention-prohibition-and-redressal-act-2013',
    deadline: 'Ongoing',
    penalty: 'Section 19 violation; employees may claim difficulty in accessing complaint mechanism',
    actionIfNonCompliant: [
      'Upload POSH policy to company intranet/employee portal',
      'Keep physical copies at HR office and common areas',
      'Include policy in employee handbook (print and digital)',
      'Ensure policy is available without needing to request from HR',
      'Make available in multiple formats (PDF, print) for different access needs',
    ],
    actionIfCompliant: 'Verify accessibility points quarterly. Update all copies when policy changes. Test that new employees can easily locate policy.',
  },
  {
    questionId: 'POSH_POL_005',
    requirement: 'Review and Update POSH Policy Periodically',
    governmentRef: 'Best Practice; POSH Act 2013, Section 19',
    officialLink: 'https://wcd.nic.in/act/sexual-harassment-women-workplace-prevention-prohibition-and-redressal-act-2013',
    deadline: 'At least every 2 years',
    penalty: 'Outdated policy may not cover modern scenarios; potential liability',
    actionIfNonCompliant: [
      'Schedule policy review with HR and legal team',
      'Incorporate recent judicial developments (e.g., virtual harassment coverage)',
      'Update ICC member details if changed',
      'Review and revise complaint procedure if needed',
      'Document review date and changes made',
      'Re-communicate updated policy to all employees',
    ],
    actionIfCompliant: 'Set calendar reminder for biennial review. Monitor significant judgments for policy implications. Document all revisions.',
  },
  {
    questionId: 'POSH_POL_006',
    requirement: 'Include Sexual Harassment as Misconduct in Service Rules',
    governmentRef: 'POSH Act 2013, Section 19(j)',
    officialLink: 'https://wcd.nic.in/act/sexual-harassment-women-workplace-prevention-prohibition-and-redressal-act-2013',
    deadline: 'Mandatory requirement under Section 19(j)',
    penalty: 'Disciplinary action may not be enforceable without this; Section 19 violation',
    actionIfNonCompliant: [
      'Review current service rules/standing orders',
      'Amend to explicitly include sexual harassment as misconduct',
      'Define disciplinary consequences for proven harassment (warning, suspension, termination)',
      'Update employment contract templates with POSH misconduct clause',
      'Get amended standing orders certified if applicable (factories, etc.)',
      'Communicate changes to all employees',
    ],
    actionIfCompliant: 'Ensure new employment contracts include POSH clause. Verify standing orders reflect amendment. Review disciplinary framework periodically.',
  },
  {
    questionId: 'POSH_POL_007',
    requirement: 'Cover Third-Party Harassment in POSH Policy',
    governmentRef: 'POSH Act 2013, Section 19(a)',
    officialLink: 'https://wcd.nic.in/act/sexual-harassment-women-workplace-prevention-prohibition-and-redressal-act-2013',
    deadline: 'Part of comprehensive policy',
    penalty: 'Employer liable for failing to provide safe environment from third parties',
    actionIfNonCompliant: [
      'Add section in policy addressing harassment by customers, vendors, visitors',
      'Specify complaint procedure for third-party incidents',
      'Define employer actions: blocking access, terminating vendor relationships, police assistance',
      'Include in training that third-party harassment is covered',
      'Establish vendor code of conduct referencing POSH compliance',
    ],
    actionIfCompliant: 'Review third-party complaint procedures annually. Include in vendor agreements. Train customer-facing employees on reporting.',
    applicabilityNote: 'Particularly important for hospitality, retail, healthcare, and BPO industries',
  },
  {
    questionId: 'POSH_POL_008',
    requirement: 'Address Virtual/Remote Workplace Harassment in Policy',
    governmentRef: 'Sanjeev Mishra v. Bank of Baroda (Rajasthan HC, 2021)',
    officialLink: 'https://wcd.nic.in/act/sexual-harassment-women-workplace-prevention-prohibition-and-redressal-act-2013',
    deadline: 'Immediate (especially for remote/hybrid workplaces)',
    penalty: 'May not cover modern harassment scenarios; employer liability',
    actionIfNonCompliant: [
      'Add explicit section covering digital/virtual harassment in policy',
      'Include harassment via email, chat applications, video calls',
      'Cover social media messages related to work',
      'Address inappropriate behavior during screen-sharing',
      'Specify that work-from-home environment is "workplace" under POSH',
      'Update complaint mechanism for virtual complaint filing',
    ],
    actionIfCompliant: 'Review virtual harassment scenarios in training. Update policy as new digital platforms emerge. Include virtual harassment examples in awareness programs.',
    applicabilityNote: 'Rajasthan HC confirmed digital platforms constitute workplace; essential for organizations with remote workers',
  },
];

// ============================================================================
// SECTION C: TRAINING & AWARENESS RULES (8 rules)
// ============================================================================

const TRAINING_AWARENESS_RULES: POSHComplianceRule[] = [
  {
    questionId: 'POSH_TRN_001',
    requirement: 'Conduct Annual POSH Awareness Training for All Employees',
    governmentRef: 'POSH Act 2013, Section 19(c)',
    officialLink: 'https://wcd.nic.in/act/sexual-harassment-women-workplace-prevention-prohibition-and-redressal-act-2013',
    deadline: 'Annual (ongoing requirement)',
    penalty: 'Rs. 50,000+ for Section 19(c) violation; Training without records = no compliance evidence',
    actionIfNonCompliant: [
      'Schedule annual POSH awareness training for all employees',
      'Include all worker categories: regular, contract, temporary, interns, trainees',
      'Cover: policy overview, harassment types, complaint procedure, ICC details, consequences',
      'Use engaging format: workshops, e-learning, or facilitated sessions',
      'Maintain attendance records with dates and content covered',
      'Issue training completion certificates or acknowledgments',
    ],
    actionIfCompliant: 'Schedule next annual training in advance. Update content for new scenarios (virtual harassment). Track employee coverage rate.',
  },
  {
    questionId: 'POSH_TRN_002',
    requirement: 'Provide Specialized Training for ICC Members',
    governmentRef: 'POSH Act 2013, Section 19(c)',
    officialLink: 'https://wcd.nic.in/act/sexual-harassment-women-workplace-prevention-prohibition-and-redressal-act-2013',
    deadline: 'Upon ICC constitution and periodically thereafter',
    penalty: 'Improperly conducted inquiries may be set aside on appeal; Section 19(c) violation',
    actionIfNonCompliant: [
      'Identify specialized POSH training providers for ICC members',
      'Cover: inquiry procedures, evidence handling, natural justice principles',
      'Include: timeline management, report writing, confidentiality obligations',
      'Address: interim relief recommendations, conciliation process',
      'Train on: legal aspects, recent judgments, common procedural errors',
      'Document training with certificates and content covered',
    ],
    actionIfCompliant: 'Provide refresher training annually or when new members join. Update content for new judicial developments. Maintain ICC member training register.',
  },
  {
    questionId: 'POSH_TRN_003',
    requirement: 'Include POSH Awareness in New Joiner Induction',
    governmentRef: 'POSH Act 2013, Section 19(c)',
    officialLink: 'https://wcd.nic.in/act/sexual-harassment-women-workplace-prevention-prohibition-and-redressal-act-2013',
    deadline: 'During onboarding (within first week)',
    penalty: 'New employees may be unaware of policy and complaint mechanism',
    actionIfNonCompliant: [
      'Add POSH module to employee onboarding/induction program',
      'Cover: policy overview, harassment types, ICC details, complaint procedure',
      'Make POSH induction mandatory (not optional)',
      'Obtain acknowledgment from new joiners',
      'Provide POSH policy document during induction',
      'Include emergency contact information for ICC',
    ],
    actionIfCompliant: 'Review onboarding content annually. Track new joiner completion rate. Update HR checklist to verify POSH induction.',
  },
  {
    questionId: 'POSH_TRN_004',
    requirement: 'Maintain Training Attendance Records and Documentation',
    governmentRef: 'Best Practice; Section 19(c) compliance evidence',
    officialLink: 'https://wcd.nic.in/act/sexual-harassment-women-workplace-prevention-prohibition-and-redressal-act-2013',
    deadline: 'At each training session',
    penalty: 'Training without records = no compliance evidence in legal proceedings',
    actionIfNonCompliant: [
      'Create training attendance register template',
      'Record: date, attendee names, employee IDs, session topic',
      'Document: trainer details, content outline, duration',
      'Obtain attendee signatures or digital acknowledgments',
      'Archive training materials (presentations, videos)',
      'Retain records for minimum 7 years',
    ],
    actionIfCompliant: 'Digitize records where possible. Conduct monthly internal audits of training documentation. Generate training coverage reports quarterly.',
  },
  {
    questionId: 'POSH_TRN_005',
    requirement: 'Include Virtual/Remote Harassment Scenarios in Training',
    governmentRef: 'Sanjeev Mishra v. Bank of Baroda (Rajasthan HC, 2021)',
    officialLink: 'https://wcd.nic.in/act/sexual-harassment-women-workplace-prevention-prohibition-and-redressal-act-2013',
    deadline: 'Immediate for organizations with remote workers',
    penalty: 'Employees may not recognize virtual harassment as covered; incidents may go unreported',
    actionIfNonCompliant: [
      'Update training content to include virtual workplace scenarios',
      'Cover: harassment via email, chat, video calls, social media',
      'Include: inappropriate behavior during screen-sharing',
      'Explain: work-from-home environment as "workplace" under POSH',
      'Provide examples specific to digital communication',
      'Address boundaries in virtual meetings',
    ],
    actionIfCompliant: 'Review and update virtual scenarios annually. Include case studies from recent judgments. Address new platforms as they emerge.',
    applicabilityNote: 'Essential for organizations with remote/hybrid work arrangements',
  },
  {
    questionId: 'POSH_TRN_006',
    requirement: 'Include Contract Workers, Interns, and Trainees in Training',
    governmentRef: 'POSH Act 2013, Section 2(f)',
    officialLink: 'https://wcd.nic.in/act/sexual-harassment-women-workplace-prevention-prohibition-and-redressal-act-2013',
    deadline: 'During their onboarding',
    penalty: 'These workers are covered under POSH; excluding them violates Section 19(c)',
    actionIfNonCompliant: [
      'Identify all non-regular employee categories at workplace',
      'Include contract workers in annual POSH training',
      'Provide interns and trainees with POSH induction',
      'Coordinate with contractor/staffing agencies for coverage',
      'Maintain separate training register for non-regular employees',
      'Ensure their complaints can be received by ICC',
    ],
    actionIfCompliant: 'Track non-regular employee training coverage. Include requirement in contractor agreements. Brief new contractors on POSH compliance.',
    applicabilityNote: 'Section 2(f) includes contract workers, interns, trainees, apprentices in "employee" definition',
  },
  {
    questionId: 'POSH_TRN_007',
    requirement: 'Cover Complaint Process and Timelines in Training',
    governmentRef: 'POSH Act 2013, Sections 9-18',
    officialLink: 'https://wcd.nic.in/act/sexual-harassment-women-workplace-prevention-prohibition-and-redressal-act-2013',
    deadline: 'Part of regular training',
    penalty: 'Employees may miss filing deadlines or not understand their rights',
    actionIfNonCompliant: [
      'Include complaint filing process in training content',
      'Explain 3-month filing deadline (with extension provision)',
      'Cover 90-day inquiry completion timeline',
      'Explain interim relief options available',
      'Communicate 90-day appeal right under Section 18',
      'Provide step-by-step guide for filing complaints',
    ],
    actionIfCompliant: 'Review timeline information for accuracy. Update if any changes in judicial interpretation. Test employee understanding periodically.',
  },
  {
    questionId: 'POSH_TRN_008',
    requirement: 'Provide Industry-Specific Training for Third-Party Harassment',
    governmentRef: 'POSH Act 2013, Section 19(a)',
    officialLink: 'https://wcd.nic.in/act/sexual-harassment-women-workplace-prevention-prohibition-and-redressal-act-2013',
    deadline: 'Part of training for customer-facing roles',
    penalty: 'Employees may not recognize third-party harassment as covered; incidents unreported',
    actionIfNonCompliant: [
      'Identify customer/client/patient-facing roles in organization',
      'Develop industry-specific harassment scenarios',
      'Include third-party harassment examples in training',
      'Train on reporting procedures for non-employee harassment',
      'Explain employer actions (blocking access, vendor termination)',
      'Provide de-escalation and safety guidance',
    ],
    actionIfCompliant: 'Update industry-specific content annually. Gather feedback from customer-facing employees. Include in specialized role training.',
    applicabilityNote: 'Particularly important for hospitality, healthcare, retail, BPO, and education industries',
  },
];

// ============================================================================
// SECTION D: DISPLAY & COMMUNICATION RULES (5 rules)
// ============================================================================

const DISPLAY_COMMUNICATION_RULES: POSHComplianceRule[] = [
  {
    questionId: 'POSH_DSP_001',
    requirement: 'Display Penal Consequences at Conspicuous Workplace Locations',
    governmentRef: 'POSH Act 2013, Section 19(b)',
    officialLink: 'https://wcd.nic.in/act/sexual-harassment-women-workplace-prevention-prohibition-and-redressal-act-2013',
    deadline: 'Immediate and ongoing',
    penalty: 'Rs. 50,000+ for Section 19(b) violation',
    actionIfNonCompliant: [
      'Create posters/notices with penal consequences of sexual harassment',
      'Include Section 26 penalties: Rs. 50,000 first offense, Rs. 1,00,000 repeat',
      'Mention license cancellation for continued non-compliance',
      'Display at prominent locations: reception, notice boards, cafeteria, restroom entrances',
      'Ensure visibility in common areas accessible to all employees',
      'Update displays when penalty provisions change',
    ],
    actionIfCompliant: 'Inspect displays quarterly for visibility and condition. Replace faded or damaged posters. Verify coverage at all locations.',
  },
  {
    questionId: 'POSH_DSP_002',
    requirement: 'Display ICC Constitution Order with Member Details',
    governmentRef: 'POSH Act 2013, Section 19(b)',
    officialLink: 'https://wcd.nic.in/act/sexual-harassment-women-workplace-prevention-prohibition-and-redressal-act-2013',
    deadline: 'Immediate upon ICC constitution',
    penalty: 'Rs. 50,000+ for Section 19(b) violation; employees may not know how to reach ICC',
    actionIfNonCompliant: [
      'Create display board with ICC constitution details',
      'Include: all member names, their roles (Presiding Officer, members, external member)',
      'Provide contact information: email, phone, location',
      'Display at prominent locations alongside penal consequences',
      'Update immediately when ICC composition changes',
      'Consider bilingual display if workforce speaks multiple languages',
    ],
    actionIfCompliant: 'Update display when any ICC member changes. Verify accuracy monthly. Ensure contact information is current.',
  },
  {
    questionId: 'POSH_DSP_003',
    requirement: 'Display Information in Languages Understood by Employees',
    governmentRef: 'POSH Act 2013, Section 19(b)',
    officialLink: 'https://wcd.nic.in/act/sexual-harassment-women-workplace-prevention-prohibition-and-redressal-act-2013',
    deadline: 'Part of display implementation',
    penalty: 'Section 19(b) non-compliance if employees cannot understand displays',
    actionIfNonCompliant: [
      'Identify languages understood by majority of workforce',
      'Create displays in English plus local language(s)',
      'For multi-lingual workforce, consider Hindi as common language',
      'Ensure translation accuracy (use professional translation if needed)',
      'Update all language versions when content changes',
    ],
    actionIfCompliant: 'Review workforce language composition annually. Add new language versions if workforce composition changes. Verify translation accuracy.',
  },
  {
    questionId: 'POSH_DSP_004',
    requirement: 'Make ICC Details Available on Company Intranet/Website',
    governmentRef: 'POSH Act 2013, Section 19',
    officialLink: 'https://wcd.nic.in/act/sexual-harassment-women-workplace-prevention-prohibition-and-redressal-act-2013',
    deadline: 'Ongoing',
    penalty: 'Remote workers may not have access to physical displays',
    actionIfNonCompliant: [
      'Create POSH compliance section on company intranet/employee portal',
      'Upload ICC member details with contact information',
      'Post complete POSH policy document',
      'Include complaint filing procedure and forms',
      'Add FAQ section addressing common questions',
      'Ensure accessibility for remote/WFH employees',
    ],
    actionIfCompliant: 'Update digital content when changes occur. Verify links are working. Track page visits for engagement metrics.',
    applicabilityNote: 'Essential for organizations with remote workers or multiple office locations',
  },
  {
    questionId: 'POSH_DSP_005',
    requirement: 'Provide Multiple Complaint Filing Channels',
    governmentRef: 'POSH Act 2013, Section 9',
    officialLink: 'https://wcd.nic.in/act/sexual-harassment-women-workplace-prevention-prohibition-and-redressal-act-2013',
    deadline: 'Part of complaint mechanism setup',
    penalty: 'Single channel may be inaccessible; complaints may be deterred',
    actionIfNonCompliant: [
      'Establish dedicated email ID for POSH complaints',
      'Create online complaint form on intranet',
      'Enable written complaint submission to ICC or HR',
      'Allow direct approach to Presiding Officer',
      'Consider anonymous reporting channel for initial concerns',
      'Document all channels in policy and displays',
    ],
    actionIfCompliant: 'Test all channels periodically. Ensure all channels reach ICC promptly. Monitor channel usage and accessibility.',
  },
];

// ============================================================================
// SECTION E: REPORTING & MONITORING RULES (7 rules)
// ============================================================================

const REPORTING_MONITORING_RULES: POSHComplianceRule[] = [
  {
    questionId: 'POSH_RPT_001',
    requirement: 'Submit Annual Report to District Officer',
    governmentRef: 'POSH Act 2013, Section 21',
    officialLink: 'https://wcd.nic.in/act/sexual-harassment-women-workplace-prevention-prohibition-and-redressal-act-2013',
    deadline: 'January 31 each year (for previous calendar year)',
    penalty: 'Rs. 50,000+ for non-filing; NIL reports also mandatory',
    actionIfNonCompliant: [
      'Identify District Officer for your jurisdiction',
      'Compile annual report data: complaints received, disposed, pending >90 days',
      'Include awareness programs conducted during the year',
      'Submit NIL report if no complaints received',
      'File by January 31 deadline',
      'Obtain acknowledgment and retain copy',
    ],
    actionIfCompliant: 'Set calendar reminder for November (data compilation) and January (submission). Maintain filing archive. Track year-over-year trends.',
  },
  {
    questionId: 'POSH_RPT_002',
    requirement: 'Include All Required Information in Annual Report',
    governmentRef: 'POSH Act 2013, Section 21',
    officialLink: 'https://wcd.nic.in/act/sexual-harassment-women-workplace-prevention-prohibition-and-redressal-act-2013',
    deadline: 'With annual report submission',
    penalty: 'Incomplete report may not satisfy Section 21 requirements',
    actionIfNonCompliant: [
      'Review Section 21 requirements for report contents',
      'Include: (a) Number of complaints received during year',
      'Include: (b) Number of complaints disposed during year',
      'Include: (c) Number of cases pending beyond 90 days',
      'Include: (d) Workshops and awareness programs conducted',
      'Include: (e) Nature of actions taken by employer/District Officer',
      'Use prescribed format if available from state',
    ],
    actionIfCompliant: 'Create annual report template with all required fields. Maintain supporting documentation for each data point.',
  },
  {
    questionId: 'POSH_RPT_003',
    requirement: 'Disclose POSH Compliance in Directors\' Report',
    governmentRef: 'Companies (Accounts) Rules 2014; POSH Act 2013, Section 22',
    officialLink: 'https://www.mca.gov.in',
    deadline: 'Part of annual Directors\' Report filing',
    penalty: 'Non-compliance with Companies Act requirements; MCA scrutiny',
    actionIfNonCompliant: [
      'Include POSH compliance statement in Board\'s Directors\' Report',
      'Confirm ICC constitution and functioning',
      'Disclose number of complaints received and resolved',
      'Report cases pending beyond 90 days (now mandatory)',
      'Coordinate with Company Secretary for inclusion in Annual Report',
    ],
    actionIfCompliant: 'Add to Directors\' Report checklist. Coordinate ICC data with CS/CFO team. Review MCA requirements annually.',
    applicabilityNote: 'Applicable to companies under Companies Act; not required for LLPs, proprietorships, partnerships',
  },
  {
    questionId: 'POSH_RPT_004',
    requirement: 'Submit Periodic ICC Reports to Management/Employer',
    governmentRef: 'POSH Act 2013, Section 21; Best Practice',
    officialLink: 'https://wcd.nic.in/act/sexual-harassment-women-workplace-prevention-prohibition-and-redressal-act-2013',
    deadline: 'Quarterly or annual (as per organization practice)',
    penalty: 'Management may be unaware of compliance status and risks',
    actionIfNonCompliant: [
      'Establish periodic ICC reporting mechanism to management',
      'Recommended: Quarterly reports to senior management/HR Head',
      'Include: complaints received, status, training conducted',
      'Highlight any compliance gaps or resource needs',
      'Present compliance overview without breaching confidentiality',
    ],
    actionIfCompliant: 'Schedule regular ICC review meetings. Document management engagement. Escalate resource needs promptly.',
  },
  {
    questionId: 'POSH_RPT_005',
    requirement: 'Establish Board-Level or Senior Management Monitoring',
    governmentRef: 'Aureliano Fernandes v. State of Goa (SC, 2023)',
    officialLink: 'https://wcd.nic.in/act/sexual-harassment-women-workplace-prevention-prohibition-and-redressal-act-2013',
    deadline: 'Ongoing',
    penalty: 'Supreme Court emphasized organizational accountability; significant liability without oversight',
    actionIfNonCompliant: [
      'Include ICC reporting in Board/Audit Committee agenda',
      'For non-corporate entities, establish senior management review',
      'Present annual POSH compliance report to Board',
      'Escalate critical compliance gaps to Board/senior leadership',
      'Document Board engagement and decisions',
    ],
    actionIfCompliant: 'Add POSH to standing Board agenda items. Maintain records of Board discussions. Implement Board recommendations promptly.',
    applicabilityNote: 'Aureliano Fernandes case (2023) emphasized that organizational leadership must demonstrate compliance commitment',
  },
  {
    questionId: 'POSH_RPT_006',
    requirement: 'Register ICC with State Portal (Where Required)',
    governmentRef: 'State-specific mandates (Maharashtra 2017, Telangana 2019, Delhi 2025)',
    officialLink: 'https://shebox.wcd.gov.in',
    deadline: 'As per state notification (typically 30-60 days)',
    penalty: 'State-specific penalties; may affect license renewals',
    actionIfNonCompliant: [
      'Check if your state requires ICC registration',
      'Maharashtra: Register with District Women & Child Development Officer',
      'Telangana: Register on T-She Box portal (tshebox.telangana.gov.in)',
      'Delhi: Register on SHe-Box portal per June 2025 direction',
      'Haryana: Submit detailed compliance checklist per December 2023 order',
      'Complete registration with ICC details and supporting documents',
      'Update registration when ICC changes',
    ],
    actionIfCompliant: 'Monitor state notifications for new requirements. Update registration when ICC reconstituted. Retain registration acknowledgments.',
    applicabilityNote: 'Requirements vary by state; Maharashtra, Telangana, Haryana, Delhi have specific registration mandates',
  },
  {
    questionId: 'POSH_RPT_007',
    requirement: 'Retain ICC Records and Inquiry Documents',
    governmentRef: 'Best Practice; Limitation Act considerations',
    officialLink: 'https://wcd.nic.in/act/sexual-harassment-women-workplace-prevention-prohibition-and-redressal-act-2013',
    deadline: 'Minimum 7 years retention',
    penalty: 'Inability to defend employer actions in subsequent legal proceedings',
    actionIfNonCompliant: [
      'Establish ICC record retention policy (minimum 7 years)',
      'Maintain complaint documents, evidence, inquiry proceedings',
      'Retain ICC reports, recommendations, and action taken',
      'Secure physical records in locked storage',
      'Protect digital records with access controls',
      'Include annual reports, training records, and acknowledgments',
    ],
    actionIfCompliant: 'Conduct annual record audit. Implement secure destruction for expired records. Maintain retention schedule compliance.',
  },
];

// ============================================================================
// SECTION F: COMPLAINT HANDLING RULES (7 rules)
// ============================================================================

const COMPLAINT_HANDLING_RULES: POSHComplianceRule[] = [
  {
    questionId: 'POSH_CMP_001',
    requirement: 'Establish Clear Complaint Filing Mechanism',
    governmentRef: 'POSH Act 2013, Section 9',
    officialLink: 'https://wcd.nic.in/act/sexual-harassment-women-workplace-prevention-prohibition-and-redressal-act-2013',
    deadline: 'Before receiving any complaint',
    penalty: 'Complaints may be mishandled or delayed; Section 19 violation',
    actionIfNonCompliant: [
      'Document step-by-step complaint filing procedure',
      'Specify who to approach (ICC, HR, Presiding Officer)',
      'Define accepted formats: written, email, online form, in-person',
      'List information required in complaint',
      'Explain timeline: 3-month filing deadline with extension provision',
      'Create complaint form template for consistency',
      'Communicate procedure to all employees',
    ],
    actionIfCompliant: 'Test complaint mechanism annually. Update procedure based on learnings. Ensure all channels are monitored.',
  },
  {
    questionId: 'POSH_CMP_002',
    requirement: 'Establish Confidentiality Protocols for Complaints',
    governmentRef: 'POSH Act 2013, Section 16; POSH Rules 2013, Rule 12',
    officialLink: 'https://wcd.nic.in/act/sexual-harassment-women-workplace-prevention-prohibition-and-redressal-act-2013',
    deadline: 'Before receiving any complaint',
    penalty: 'Rs. 5,000 per breach of confidentiality under Section 17',
    actionIfNonCompliant: [
      'Establish case code system for complaint tracking (not names)',
      'Implement restricted access to complaint files',
      'Require NDAs from all ICC members',
      'Secure physical storage: locked cabinets, restricted access room',
      'Protect digital files: password protection, access logs',
      'Train ICC on confidentiality obligations',
      'Document confidentiality breach consequences',
    ],
    actionIfCompliant: 'Review and test confidentiality protocols periodically. Audit access logs. Refresh ICC NDA training annually.',
  },
  {
    questionId: 'POSH_CMP_003',
    requirement: 'Track 90-Day Inquiry Completion Timeline',
    governmentRef: 'POSH Act 2013, Section 11(4)',
    officialLink: 'https://wcd.nic.in/act/sexual-harassment-women-workplace-prevention-prohibition-and-redressal-act-2013',
    deadline: '90 days from complaint receipt',
    penalty: 'Cases pending beyond 90 days must be reported; delay may be challenged',
    actionIfNonCompliant: [
      'Create case tracking system with timeline alerts',
      'Record complaint receipt date as Day 1',
      'Set milestone alerts: 30 days, 60 days, 75 days',
      'Track interim stages: respondent reply (10 days), hearings',
      'Escalate approaching deadlines to ICC and management',
      'Document any extension requests with reasons',
    ],
    actionIfCompliant: 'Review timeline tracking system quarterly. Analyze cases for timeline patterns. Improve process to avoid delays.',
  },
  {
    questionId: 'POSH_CMP_004',
    requirement: 'Communicate Appeal Mechanism to Employees',
    governmentRef: 'POSH Act 2013, Section 18',
    officialLink: 'https://wcd.nic.in/act/sexual-harassment-women-workplace-prevention-prohibition-and-redressal-act-2013',
    deadline: 'Part of complaint mechanism communication',
    penalty: 'Employees may not know their appeal rights; potential legal challenge',
    actionIfNonCompliant: [
      'Include appeal rights information in POSH policy',
      'Specify 90-day appeal period from ICC recommendations',
      'Identify appellate authority for your jurisdiction',
      'Inform both complainant and respondent of appeal right after inquiry',
      'Include appeal information in training content',
    ],
    actionIfCompliant: 'Verify appeal authority information is current. Include in all inquiry completion communications. Document that parties were informed.',
  },
  {
    questionId: 'POSH_CMP_005',
    requirement: 'Document and Enable Interim Relief Options',
    governmentRef: 'POSH Act 2013, Section 12',
    officialLink: 'https://wcd.nic.in/act/sexual-harassment-women-workplace-prevention-prohibition-and-redressal-act-2013',
    deadline: 'Before receiving complaints',
    penalty: 'Complainant safety may be compromised during inquiry',
    actionIfNonCompliant: [
      'Document interim relief options in policy: transfer, leave, no-contact',
      'Include: transfer of complainant or respondent (complainant\'s choice)',
      'Include: paid leave up to 3 months (additional to regular entitlement)',
      'Include: restraining/no-contact orders',
      'Include: work-from-home arrangements',
      'Empower ICC to recommend interim relief',
      'Define approval process and implementation timeline',
    ],
    actionIfCompliant: 'Review interim relief provisions annually. Document all interim relief recommendations and implementations. Track effectiveness.',
  },
  {
    questionId: 'POSH_CMP_006',
    requirement: 'Establish Anti-Retaliation Protection',
    governmentRef: 'POSH Act 2013, Section 19(f)',
    officialLink: 'https://wcd.nic.in/act/sexual-harassment-women-workplace-prevention-prohibition-and-redressal-act-2013',
    deadline: 'Part of comprehensive POSH framework',
    penalty: 'Complaints may be deterred; employer liability for victimization',
    actionIfNonCompliant: [
      'Add explicit anti-retaliation clause in POSH policy',
      'Define retaliation: adverse action against complainant/witness',
      'Provide separate reporting channel for retaliation concerns',
      'Specify consequences for proven retaliation',
      'Train managers on anti-retaliation obligations',
      'Monitor complainant/witness situation during and after inquiry',
    ],
    actionIfCompliant: 'Review anti-retaliation effectiveness. Check in with complainants/witnesses post-inquiry. Address any concerns promptly.',
  },
  {
    questionId: 'POSH_CMP_007',
    requirement: 'Assist with Filing Police Complaints (FIR) When Requested',
    governmentRef: 'POSH Act 2013, Section 19(g)',
    officialLink: 'https://wcd.nic.in/act/sexual-harassment-women-workplace-prevention-prohibition-and-redressal-act-2013',
    deadline: 'When aggrieved woman requests',
    penalty: 'Section 19 violation; woman\'s access to criminal justice impeded',
    actionIfNonCompliant: [
      'Document process for assisting with police complaints',
      'Identify relevant IPC sections (354A, 509, etc.)',
      'Prepare guidance document for complainants',
      'Designate person to accompany complainant if needed',
      'Coordinate with local police station contacts',
      'Document all assistance provided',
    ],
    actionIfCompliant: 'Maintain guidance document current with legal provisions. Train designated personnel. Document any assistance provided.',
    applicabilityNote: 'Employer obligation is to assist, not to file on behalf of; woman retains choice on criminal proceedings',
  },
];

// ============================================================================
// COMBINED EXPORT
// ============================================================================

export const POSH_COMPLIANCE_RULES: POSHComplianceRule[] = [
  ...ICC_CONSTITUTION_RULES,
  ...POLICY_DOCUMENTATION_RULES,
  ...TRAINING_AWARENESS_RULES,
  ...DISPLAY_COMMUNICATION_RULES,
  ...REPORTING_MONITORING_RULES,
  ...COMPLAINT_HANDLING_RULES,
];

// ============================================================================
// HELPER: Get Rule by Question ID
// ============================================================================

export function getRuleByQuestionId(questionId: string): POSHComplianceRule | undefined {
  return POSH_COMPLIANCE_RULES.find(rule => rule.questionId === questionId);
}

// ============================================================================
// HELPER: Get Rules by Category
// ============================================================================

export function getRulesByCategory(category: string): POSHComplianceRule[] {
  const categoryMapping: Record<string, POSHComplianceRule[]> = {
    'icc_constitution': ICC_CONSTITUTION_RULES,
    'policy_documentation': POLICY_DOCUMENTATION_RULES,
    'training_awareness': TRAINING_AWARENESS_RULES,
    'display_communication': DISPLAY_COMMUNICATION_RULES,
    'reporting_monitoring': REPORTING_MONITORING_RULES,
    'complaint_handling': COMPLAINT_HANDLING_RULES,
  };
  
  return categoryMapping[category] || [];
}

// ============================================================================
// HELPER: Get High Priority Rules (weight >= 4)
// ============================================================================

export function getHighPriorityRules(): POSHComplianceRule[] {
  const highPriorityQuestionIds = [
    // ICC Constitution (weight 4-5)
    'POSH_ICC_001', 'POSH_ICC_002', 'POSH_ICC_003', 'POSH_ICC_008',
    // Policy & Documentation (weight 4-5)
    'POSH_POL_001', 'POSH_POL_003', 'POSH_POL_006',
    // Training & Awareness (weight 5-6)
    'POSH_TRN_001', 'POSH_TRN_002', 'POSH_TRN_003',
    // Reporting & Monitoring (weight 4-5)
    'POSH_RPT_001', 'POSH_RPT_005',
  ];
  
  return POSH_COMPLIANCE_RULES.filter(rule => 
    highPriorityQuestionIds.includes(rule.questionId)
  );
}

// ============================================================================
// HELPER: Get Rules as Map (for PDF generation)
// ============================================================================

export function getComplianceRulesMap(): Record<string, POSHComplianceRule> {
  const rulesMap: Record<string, POSHComplianceRule> = {};
  POSH_COMPLIANCE_RULES.forEach(rule => {
    rulesMap[rule.questionId] = rule;
  });
  return rulesMap;
}

// ============================================================================
// GOVERNMENT PORTALS FOR PDF REFERENCE
// ============================================================================

export const POSH_GOVERNMENT_PORTALS = [
  // Central
  { name: 'WCD POSH Act', url: 'https://wcd.nic.in/act/sexual-harassment-women-workplace-prevention-prohibition-and-redressal-act-2013', category: 'Central' },
  { name: 'SHe-Box Online Complaints', url: 'https://shebox.wcd.gov.in', category: 'Central' },
  { name: 'Ministry of Labour', url: 'https://labour.gov.in', category: 'Central' },
  { name: 'Ministry of Corporate Affairs', url: 'https://www.mca.gov.in', category: 'Central' },
  
  // State Portals
  { name: 'T-She Box (Telangana)', url: 'https://tshebox.telangana.gov.in', category: 'State' },
  { name: 'Maharashtra WCD', url: 'https://womenchild.maharashtra.gov.in', category: 'State' },
  { name: 'Delhi WCD', url: 'https://wcd.delhi.gov.in', category: 'State' },
  { name: 'Karnataka WCD', url: 'https://dwcd.karnataka.gov.in', category: 'State' },
  { name: 'Tamil Nadu WCD', url: 'https://icds.tn.gov.in', category: 'State' },
  { name: 'Haryana WCD', url: 'https://wcdhry.gov.in', category: 'State' },
];

// ============================================================================
// APPLICABLE LEGISLATION FOR PDF REFERENCE
// ============================================================================

export const POSH_LEGISLATION = [
  // Primary Legislation
  { name: 'Sexual Harassment of Women at Workplace (Prevention, Prohibition and Redressal) Act, 2013', category: 'Primary' },
  { name: 'Sexual Harassment of Women at Workplace (Prevention, Prohibition and Redressal) Rules, 2013', category: 'Primary' },
  
  // Related Legislation
  { name: 'Companies (Accounts) Rules, 2014 (POSH Disclosure)', category: 'Corporate' },
  { name: 'Indian Penal Code, Sections 354A, 354D, 509', category: 'Criminal' },
  { name: 'Information Technology Act, 2000 (Cyber Harassment)', category: 'Digital' },
  
  // Landmark Judgments
  { name: 'Vishaka v. State of Rajasthan (1997) - Foundational Guidelines', category: 'Judicial' },
  { name: 'Aureliano Fernandes v. State of Goa (SC, 2023) - Nationwide ICC Verification', category: 'Judicial' },
  { name: 'Ruchika Singh v. Air France (Delhi HC) - External Member Qualification', category: 'Judicial' },
  { name: 'ISG Novasoft (Madras HC) - Rs. 1.68 Crore Damages', category: 'Judicial' },
  { name: 'Sanjeev Mishra v. Bank of Baroda (Rajasthan HC, 2021) - Virtual Workplace', category: 'Judicial' },
  { name: 'Dr. Susmita Banerjee v. Kolkata Port Trust - Section 14 Safeguards', category: 'Judicial' },
];

// ============================================================================
// PENALTY SUMMARY FOR PDF REFERENCE
// ============================================================================

export const POSH_PENALTY_SUMMARY = {
  firstOffense: 'Rs. 50,000',
  repeatOffense: 'Rs. 1,00,000 (double)',
  continuedNonCompliance: 'License cancellation, withdrawal of registration, non-renewal of approvals',
  confidentialityBreach: 'Rs. 5,000 per breach',
  judicialAwards: {
    isgNovasoft: 'Rs. 1.68 crore (Madras HC)',
    medantaIndore: 'Rs. 25 lakhs + statutory penalties (MP HC)',
  },
  stateSpecificPenalties: 'Additional penalties may apply based on state notifications',
};
