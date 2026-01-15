/**
 * Food Business Compliance Rules for PDF Report Generation
 * FSSAI, Fire Safety, GST, Labour Laws, and Liquor Licensing
 */

export interface FoodComplianceRule {
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

export const FOOD_CATEGORY_LABELS: Record<string, string> = {
  'FSSAI': 'Food Safety (FSSAI)',
  'GST': 'GST & Taxation',
  'Business_Registration': 'Business Registration',
  'Fire_Safety': 'Fire Safety',
  'Labor_Compliance': 'Labour Compliance',
  'Liquor_Excise': 'Liquor & Excise',
  'Health_Hygiene': 'Health & Hygiene',
  'Special_Permits': 'Special Permits',
};

export const FOOD_COMPLIANCE_RULES: Record<string, FoodComplianceRule> = {
  // ============================================================================
  // FSSAI COMPLIANCE
  // ============================================================================
  fssai_license_obtained: {
    questionId: 'fssai_license_obtained',
    category: 'FSSAI',
    requirement: 'Valid FSSAI License/Registration',
    governmentRef: 'Food Safety and Standards Act, 2006, Section 31',
    officialLink: 'https://foscos.fssai.gov.in',
    deadline: 'Before starting operations',
    penalty: 'Up to Rs.5-10 lakh fine and/or imprisonment up to 6 months',
    actionIfNonCompliant: [
      'Apply immediately via FoSCoS portal (foscos.fssai.gov.in)',
      'Choose license type based on turnover: Basic (<Rs.12L), State (Rs.12L-20Cr), Central (>Rs.20Cr)',
      'Prepare required documents: ID proof, address proof, food safety plan',
      'Pay applicable fee and await inspection',
    ],
    actionIfCompliant: 'Ensure timely renewal 30 days before expiry. Monitor validity.',
  },
  fssai_displayed: {
    questionId: 'fssai_displayed',
    category: 'FSSAI',
    requirement: 'FSSAI License Display at Premises',
    governmentRef: 'FSS (Licensing and Registration) Regulations 2011, Regulation 2.1.5',
    officialLink: 'https://fssai.gov.in',
    deadline: 'Continuous compliance',
    penalty: 'Rs.25,000-1 lakh fine. Warning notice first, then prosecution.',
    actionIfNonCompliant: [
      'Print FSSAI license on A4 or larger',
      'Display prominently at main entrance or cash counter',
      'Ensure 14-digit license number is clearly visible',
      'Include validity dates on display',
    ],
    actionIfCompliant: 'Update display immediately upon renewal.',
  },
  fssai_validity_check: {
    questionId: 'fssai_validity_check',
    category: 'FSSAI',
    requirement: 'FSSAI License Validity Management',
    governmentRef: 'FSS (Licensing and Registration) Regulations 2011',
    officialLink: 'https://foscos.fssai.gov.in',
    deadline: 'Renewal 30 days before expiry',
    penalty: 'Late renewal: Rs.100/day. After 90 days: 3x annual fee. After 180 days: License cancelled.',
    actionIfNonCompliant: [
      'Check license expiry date immediately',
      'If <30 days remaining: Apply for renewal now',
      'If expired <90 days: Apply with late fee',
      'If expired >90 days: Fresh application required',
    ],
    actionIfCompliant: 'Set calendar reminder 90 days before expiry. Initiate renewal at 60 days.',
  },
  fssai_food_handler_training: {
    questionId: 'fssai_food_handler_training',
    category: 'FSSAI',
    requirement: 'FOSTAC Trained Food Safety Supervisor',
    governmentRef: 'FSS (Licensing and Registration) Regulations 2011, Schedule 4',
    officialLink: 'https://fostac.fssai.gov.in',
    deadline: 'Within 60 days of license issuance',
    penalty: 'Rs.25,000-1 lakh fine. May affect license renewal. Mandatory for Hygiene Rating.',
    actionIfNonCompliant: [
      'Identify supervisor for FOSTAC training (1 per 25 food handlers)',
      'Register on FOSTAC portal (fostac.fssai.gov.in)',
      'Choose appropriate module: Catering, Manufacturing, Retail',
      'Complete 8-hour training program',
      'Pass assessment and obtain certificate',
    ],
    actionIfCompliant: 'Certificates now have indefinite validity per FSSAI July 2022 clarification.',
  },
  fssai_hygiene_rating: {
    questionId: 'fssai_hygiene_rating',
    category: 'FSSAI',
    requirement: 'FSSAI Hygiene Rating Certification',
    governmentRef: 'FSSAI Hygiene Rating Guidelines 2019',
    officialLink: 'https://hygiene.fssai.gov.in',
    deadline: 'Voluntary but increasingly required by aggregators',
    penalty: 'No direct penalty. Lower visibility on Swiggy/Zomato. Required for some municipal permits.',
    actionIfNonCompliant: [
      'Self-assess using FSSAI hygiene checklist',
      'Address gaps in food safety practices',
      'Register on FSSAI Hygiene Rating portal',
      'Choose FSSAI-recognized auditing agency',
      'Schedule and complete hygiene audit',
    ],
    actionIfCompliant: 'Maintain rating through annual re-audit. Target 4-5 stars for competitive advantage.',
  },
  fssai_records_maintained: {
    questionId: 'fssai_records_maintained',
    category: 'FSSAI',
    requirement: 'Food Safety Records and Documentation',
    governmentRef: 'FSS (Licensing and Registration) Regulations 2011, Schedule 4',
    officialLink: 'https://foscos.fssai.gov.in',
    deadline: 'Daily maintenance, retain for 2 years',
    penalty: 'Rs.1-2 lakh fine. May affect license renewal.',
    actionIfNonCompliant: [
      'Implement daily temperature log for refrigerators/freezers',
      'Create cleaning and sanitation schedule',
      'Maintain pest control service records',
      'Document supplier details with FSSAI numbers',
      'Keep stock rotation records (FIFO)',
    ],
    actionIfCompliant: 'Digitize records where possible. Conduct monthly internal audits.',
  },
  fssai_raw_material_sourcing: {
    questionId: 'fssai_raw_material_sourcing',
    category: 'FSSAI',
    requirement: 'FSSAI-Licensed Supplier Traceability',
    governmentRef: 'FSS Act 2006, Section 27; FSS (Food Recall) Regulations 2017',
    officialLink: 'https://foscos.fssai.gov.in/verify',
    deadline: 'Ongoing - verify each new supplier',
    penalty: 'Using unlicensed supplier: Rs.2-5 lakh fine. Strict liability in food safety incident.',
    actionIfNonCompliant: [
      'List all current suppliers of raw materials',
      'Verify each supplier FSSAI license on FoSCoS portal',
      'Request FSSAI license copy from unverified suppliers',
      'Replace suppliers without valid FSSAI license',
      'Maintain supplier FSSAI register',
    ],
    actionIfCompliant: 'Update supplier register quarterly. Verify before onboarding new suppliers.',
  },
  fssai_water_quality: {
    questionId: 'fssai_water_quality',
    category: 'FSSAI',
    requirement: 'Potable Water Meeting BIS Standards',
    governmentRef: 'FSS Act 2006; BIS IS 10500:2012 (Drinking Water)',
    officialLink: 'https://bis.gov.in',
    deadline: 'Ongoing - test twice annually minimum',
    penalty: 'Using unsafe water: Rs.5-10 lakh fine. Criminal liability if illness caused.',
    actionIfNonCompliant: [
      'Arrange water quality test from NABL-accredited lab',
      'Test parameters as per IS 10500:2012',
      'Install RO/UV purification if water fails standards',
      'Maintain water treatment equipment',
      'Test ice-making water separately',
    ],
    actionIfCompliant: 'Test water quality every 6 months. Service purification equipment quarterly.',
  },
  fssai_storage_compliance: {
    questionId: 'fssai_storage_compliance',
    category: 'FSSAI',
    requirement: 'Proper Food Storage with Temperature Control',
    governmentRef: 'FSS (Licensing and Registration) Regulations 2011, Schedule 4',
    officialLink: 'https://fssai.gov.in',
    deadline: 'Continuous compliance',
    penalty: 'Unsafe food storage: Rs.2-5 lakh fine. License suspension for repeat violations.',
    actionIfNonCompliant: [
      'Install temperature monitoring devices in all refrigerators/freezers',
      'Maintain cold storage at 0-5C for perishables',
      'Maintain frozen storage at -18C or below',
      'Implement FIFO (First In First Out) stock rotation',
      'Store raw and cooked food separately',
    ],
    actionIfCompliant: 'Calibrate thermometers monthly. Service cooling equipment per manufacturer schedule.',
  },

  // ============================================================================
  // GST COMPLIANCE
  // ============================================================================
  gst_registered: {
    questionId: 'gst_registered',
    category: 'GST',
    requirement: 'GST Registration',
    governmentRef: 'CGST Act 2017, Section 22',
    officialLink: 'https://gst.gov.in',
    deadline: 'Within 30 days of becoming liable (turnover >Rs.20L or aggregator listing)',
    penalty: 'Rs.10,000 or 10% of tax due, whichever is higher',
    actionIfNonCompliant: [
      'Register immediately via GST portal (gst.gov.in)',
      'Choose scheme: 5% (no ITC) or 18% (with ITC) for restaurants',
      'Obtain GSTIN and configure billing system',
      'Display GSTIN on all invoices and at premises',
    ],
    actionIfCompliant: 'File returns on time. Maintain proper invoices.',
  },
  gst_returns_filing: {
    questionId: 'gst_returns_filing',
    category: 'GST',
    requirement: 'Timely GST Return Filing',
    governmentRef: 'CGST Act 2017, Sections 37-39',
    officialLink: 'https://gst.gov.in',
    deadline: 'GSTR-1: 11th, GSTR-3B: 20th of following month',
    penalty: 'Late fee: Rs.50/day (Rs.20 for NIL). Interest: 18% p.a. on tax due.',
    actionIfNonCompliant: [
      'File all pending returns with late fees',
      'Reconcile sales data with GSTR-1',
      'Ensure GSTR-3B matches GSTR-1',
      'Set up automated reminders for filing dates',
    ],
    actionIfCompliant: 'Maintain calendar for GST compliance. Consider GST software for accuracy.',
  },
  gst_invoice_compliance: {
    questionId: 'gst_invoice_compliance',
    category: 'GST',
    requirement: 'GST-Compliant Tax Invoice',
    governmentRef: 'CGST Rules 2017, Rule 46',
    officialLink: 'https://gst.gov.in',
    deadline: 'Every transaction',
    penalty: 'Rs.25,000 per incorrect invoice. ITC denial to customers.',
    actionIfNonCompliant: [
      'Update POS/billing system with correct format',
      'Include: GSTIN, Invoice number, Date, HSN/SAC code',
      'Show tax breakup (CGST+SGST or IGST)',
      'Customer GSTIN for B2B transactions',
    ],
    actionIfCompliant: 'Periodic audit of invoice format. Train staff on correct invoicing.',
  },

  // ============================================================================
  // FIRE SAFETY
  // ============================================================================
  fire_noc_obtained: {
    questionId: 'fire_noc_obtained',
    category: 'Fire_Safety',
    requirement: 'Fire NOC from State Fire Department',
    governmentRef: 'National Building Code 2016, Part 4; State Fire Services Acts',
    officialLink: 'State fire department portal',
    deadline: 'Before commercial operations commence',
    penalty: 'Rs.25,000-5 lakh + 6 months imprisonment. Shutdown order. Death by negligence (IPC 304A): 2 years.',
    actionIfNonCompliant: [
      'Apply on state fire department portal',
      'Submit building plan, occupancy certificate',
      'Install required fire safety equipment before inspection',
      'Ensure minimum 2 exits, emergency lighting',
      'Schedule fire department inspection',
    ],
    actionIfCompliant: 'Renew annually. Maintain all equipment. Conduct quarterly fire drills.',
  },
  fire_extinguishers_maintained: {
    questionId: 'fire_extinguishers_maintained',
    category: 'Fire_Safety',
    requirement: 'Fire Extinguishers Installation and Maintenance',
    governmentRef: 'NBC 2016, Part 4; IS 15683',
    officialLink: 'State fire department',
    deadline: 'Before Fire NOC inspection; Annual refill',
    penalty: 'NOC rejection/cancellation. Rs.10,000-50,000 fine.',
    actionIfNonCompliant: [
      'Install ABC type extinguishers (1 per 200 sq.ft or as per NOC)',
      'Kitchen: K-class or CO2 for cooking oil fires',
      'Mount at accessible height (1-1.5m from floor)',
      'Ensure pressure gauge in green zone',
      'Annual inspection and refill by licensed agency',
    ],
    actionIfCompliant: 'Monthly visual check. Refill/replace as per schedule. Train all staff.',
  },
  fire_emergency_exits: {
    questionId: 'fire_emergency_exits',
    category: 'Fire_Safety',
    requirement: 'Emergency Exit Signage and Evacuation Plan',
    governmentRef: 'NBC 2016, Part 4; IS 12349',
    officialLink: 'State fire department',
    deadline: 'Before Fire NOC inspection',
    penalty: 'Rs.10,000-50,000 fine. Critical in evacuation failure.',
    actionIfNonCompliant: [
      'Install green EXIT signs at all exit points',
      'Use photoluminescent or LED-lit signs',
      'Ensure visibility from 30m distance',
      'Install directional arrows along escape routes',
      'Display evacuation plan near main entrance',
    ],
    actionIfCompliant: 'Test emergency lighting monthly. Replace batteries annually.',
  },
  fire_drill_conducted: {
    questionId: 'fire_drill_conducted',
    category: 'Fire_Safety',
    requirement: 'Fire Drill and Emergency Preparedness',
    governmentRef: 'NBC 2016, Part 4; State Fire Safety Rules',
    officialLink: 'State fire department',
    deadline: 'Quarterly (minimum twice annually)',
    penalty: 'No direct fine, but critical in incident investigation. May affect insurance claims.',
    actionIfNonCompliant: [
      'Plan quarterly fire drills',
      'Train all staff on evacuation procedure',
      'Designate fire wardens per floor/section',
      'Practice extinguisher usage annually',
      'Time evacuation and aim for <3 minutes',
    ],
    actionIfCompliant: 'Schedule next drill. Review and improve based on drill performance.',
  },

  // ============================================================================
  // LABOUR COMPLIANCE - EPF
  // ============================================================================
  epf_registered: {
    questionId: 'epf_registered',
    category: 'Labor_Compliance',
    requirement: 'EPFO Registration',
    governmentRef: 'EPF & MP Act 1952, Section 1(3)',
    officialLink: 'https://unifiedportal-emp.epfindia.gov.in',
    deadline: 'Within 1 month of crossing 20 employees threshold',
    penalty: 'Up to Rs.25,000 fine and 1 year imprisonment for non-registration',
    actionIfNonCompliant: [
      'Register on EPFO Unified Portal',
      'Obtain Establishment Code Number',
      'Register all eligible employees (earning up to Rs.15,000/month basic + DA)',
      'Submit Form 5A within 15 days of registration',
    ],
    actionIfCompliant: 'Ensure annual renewal of DSC for portal access.',
  },
  epf_contributions_timely: {
    questionId: 'epf_contributions_timely',
    category: 'Labor_Compliance',
    requirement: 'Monthly PF Contribution Deposit',
    governmentRef: 'EPF Scheme 1952 - Para 38',
    officialLink: 'https://unifiedportal-emp.epfindia.gov.in',
    deadline: '15th of following month',
    penalty: '12% p.a. interest + damages up to 100% of arrears',
    actionIfNonCompliant: [
      'Calculate arrears with 12% interest',
      'File ECR on Unified Portal',
      'Pay via online challan',
      'Set up auto-reminders for 10th of each month',
    ],
    actionIfCompliant: 'Continue timely deposits. Maintain records for 6 years.',
  },

  // ============================================================================
  // LABOUR COMPLIANCE - ESI
  // ============================================================================
  esi_registered: {
    questionId: 'esi_registered',
    category: 'Labor_Compliance',
    requirement: 'ESIC Registration',
    governmentRef: 'ESI Act 1948, Section 2A',
    officialLink: 'https://www.esic.gov.in',
    deadline: 'Within 15 days of becoming applicable (10+ employees)',
    penalty: 'Twice the contribution amount + interest at 12% p.a.',
    actionIfNonCompliant: [
      'Register on ESIC Portal (esic.gov.in/employerlogin)',
      'Obtain 17-digit Employer Code',
      'Generate Temporary IDs for all employees',
      'Link employees Aadhaar for permanent IP numbers',
    ],
    actionIfCompliant: 'File half-yearly returns by 11th May and 11th November.',
  },
  esi_contributions_timely: {
    questionId: 'esi_contributions_timely',
    category: 'Labor_Compliance',
    requirement: 'Monthly ESI Contribution Deposit',
    governmentRef: 'ESI Act 1948, Section 39(5)',
    officialLink: 'https://www.esic.gov.in/contribution',
    deadline: '15th of following month',
    penalty: 'Interest at 12% p.a. + damages up to 25%',
    actionIfNonCompliant: [
      'Calculate arrears: Employee (0.75%) + Employer (3.25%) = 4%',
      'Log into ESIC Portal and generate challan',
      'Pay via online banking',
      'Update monthly contribution details',
    ],
    actionIfCompliant: 'Generate IP numbers for new joiners within 10 days.',
  },

  // ============================================================================
  // LABOUR COMPLIANCE - GRATUITY
  // ============================================================================
  gratuity_policy: {
    questionId: 'gratuity_policy',
    category: 'Labor_Compliance',
    requirement: 'Gratuity Liability Tracking',
    governmentRef: 'Payment of Gratuity Act 1972, Section 4',
    officialLink: 'https://labour.gov.in',
    deadline: 'Continuous tracking; payment within 30 days of becoming due',
    penalty: 'Interest at 10% p.a. + up to 6 months imprisonment',
    actionIfNonCompliant: [
      'Calculate liability: (15 x Last salary x Years) / 26',
      'Create gratuity register for employees with 4+ years',
      'Maximum ceiling: Rs.20,00,000',
      'Include provision in annual financial statements',
    ],
    actionIfCompliant: 'Review valuations annually. Consider LIC Group Gratuity scheme.',
  },

  // ============================================================================
  // LABOUR COMPLIANCE - POSH
  // ============================================================================
  posh_icc_constituted: {
    questionId: 'posh_icc_constituted',
    category: 'Labor_Compliance',
    requirement: 'Internal Complaints Committee (ICC) Constitution',
    governmentRef: 'POSH Act 2013, Section 4',
    officialLink: 'https://wcd.nic.in',
    deadline: 'Mandatory when employing 10+ workers including women',
    penalty: 'Up to Rs.50,000 fine. Repeat offense: License cancellation.',
    actionIfNonCompliant: [
      'Constitute ICC with 4+ members',
      'Presiding Officer: Senior woman employee',
      'Include 1 external member from NGO/legal background',
      'File annual return by January 31',
    ],
    actionIfCompliant: 'Conduct annual POSH training. Display policy at workplace.',
  },

  // ============================================================================
  // LIQUOR LICENSE
  // ============================================================================
  liquor_license_obtained: {
    questionId: 'liquor_license_obtained',
    category: 'Liquor_Excise',
    requirement: 'State Excise Liquor License',
    governmentRef: 'State Excise Acts (varies by state)',
    officialLink: 'State excise department portal',
    deadline: 'Before serving alcohol',
    penalty: 'Rs.1-10 lakh fine + 3 months to 5 years imprisonment. Establishment closure.',
    actionIfNonCompliant: [
      'Apply to State Excise Commissioner',
      'Obtain NOC from Police, Fire, Municipal authorities',
      'Submit premises layout showing bar area',
      'Pay license fee (varies: Rs.5L-25L by state)',
      'Display license prominently at bar',
    ],
    actionIfCompliant: 'Renew annually by March 31. Maintain stock register daily.',
  },
  liquor_stock_register: {
    questionId: 'liquor_stock_register',
    category: 'Liquor_Excise',
    requirement: 'Daily Liquor Stock Register',
    governmentRef: 'State Excise Rules',
    officialLink: 'State excise department',
    deadline: 'Daily maintenance',
    penalty: 'Rs.10,000-50,000 fine. License suspension for repeat violations.',
    actionIfNonCompliant: [
      'Maintain daily opening and closing stock',
      'Record all purchases with permit numbers',
      'Document wastage and breakage',
      'Reconcile physical stock weekly',
      'Keep register for minimum 3 years',
    ],
    actionIfCompliant: 'Digital stock management recommended. Monthly reconciliation with supplier records.',
  },
  liquor_service_hours: {
    questionId: 'liquor_service_hours',
    category: 'Liquor_Excise',
    requirement: 'Liquor Service Hour Compliance',
    governmentRef: 'State Excise Acts - Service hour provisions',
    officialLink: 'State excise department',
    deadline: 'Continuous compliance',
    penalty: 'Rs.25,000-1 lakh fine. License suspension 7-30 days.',
    actionIfNonCompliant: [
      'Check state-specific service hours',
      'Most states: 11 AM to 11 PM',
      'Display permitted hours at bar',
      'Train staff on last-call timing',
      'No service on dry days',
    ],
    actionIfCompliant: 'Maintain dry day calendar. Strict adherence to cutoff time.',
  },

  // ============================================================================
  // BUSINESS REGISTRATION
  // ============================================================================
  shop_establishment_registered: {
    questionId: 'shop_establishment_registered',
    category: 'Business_Registration',
    requirement: 'Shop & Establishment Registration',
    governmentRef: 'State Shops and Establishments Acts',
    officialLink: 'State labour department portal',
    deadline: 'Within 30 days of commencement',
    penalty: 'Rs.1,000-10,000 fine depending on state. Daily penalty for continued default.',
    actionIfNonCompliant: [
      'Apply online on state labour department portal',
      'Submit: PAN, Aadhaar, rent agreement, photos',
      'Pay registration fee (typically Rs.500-5,000)',
      'Obtain registration certificate',
      'Display certificate at premises',
    ],
    actionIfCompliant: 'Renew as per state rules (some states: lifetime validity).',
  },
  trade_license_obtained: {
    questionId: 'trade_license_obtained',
    category: 'Business_Registration',
    requirement: 'Municipal Trade License',
    governmentRef: 'Municipal Corporation Acts; State Municipal Laws',
    officialLink: 'Municipal corporation portal',
    deadline: 'Before commencing operations',
    penalty: 'Rs.500-25,000 fine depending on city. Sealing of premises for continued default.',
    actionIfNonCompliant: [
      'Apply at municipal corporation office/portal',
      'Submit: ID proof, address proof, rent agreement, NOCs',
      'Pay fee based on area and nature of business',
      'Inspection by municipal officials',
      'Obtain and display trade license',
    ],
    actionIfCompliant: 'Renew annually by March 31. Update on change of ownership/location.',
  },
  health_trade_license: {
    questionId: 'health_trade_license',
    category: 'Health_Hygiene',
    requirement: 'Health Trade License for Food Business',
    governmentRef: 'Municipal Health Bylaws; State Food Safety Rules',
    officialLink: 'Municipal corporation health department',
    deadline: 'Before commencing food service',
    penalty: 'Rs.1,000-10,000 fine. Closure notice for hygiene violations.',
    actionIfNonCompliant: [
      'Apply to municipal health department',
      'Submit FSSAI license copy',
      'Pass health inspection',
      'Ensure pest control measures in place',
      'Maintain hygiene standards',
    ],
    actionIfCompliant: 'Prepare for surprise inspections. Annual renewal required.',
  },

  // ============================================================================
  // SPECIAL PERMITS
  // ============================================================================
  late_night_permit: {
    questionId: 'late_night_permit',
    category: 'Special_Permits',
    requirement: 'Late Night Operation Permit',
    governmentRef: 'State Police Acts; Municipal Bylaws',
    officialLink: 'Police commissioner/municipal office',
    deadline: 'Before operating past standard hours (typically 11 PM)',
    penalty: 'Rs.5,000-25,000 fine. Permit cancellation. Criminal proceedings.',
    actionIfNonCompliant: [
      'Apply to Police Commissioner or Municipal Commissioner',
      'Submit character certificate of owner/manager',
      'Obtain neighbor NOCs if required',
      'Install CCTV with 30-day recording',
      'Pay annual permit fee',
    ],
    actionIfCompliant: 'Maintain incident register. Ensure security staff trained.',
  },
  music_entertainment_license: {
    questionId: 'music_entertainment_license',
    category: 'Special_Permits',
    requirement: 'Music/Entertainment License',
    governmentRef: 'PPL/IPRS licensing; State Entertainment Tax Acts',
    officialLink: 'https://www.pplindia.org, https://www.iprs.org',
    deadline: 'Before playing music publicly',
    penalty: 'Rs.20,000-2 lakh per song copyright infringement. Criminal prosecution.',
    actionIfNonCompliant: [
      'Obtain PPL license for recorded music',
      'Obtain IPRS license for live performances',
      'Apply via respective portals',
      'Pay annual fee based on seating capacity',
      'Maintain playlist records',
    ],
    actionIfCompliant: 'Renew annually. Display license certificates.',
  },
  outdoor_seating_permit: {
    questionId: 'outdoor_seating_permit',
    category: 'Special_Permits',
    requirement: 'Outdoor/Footpath Seating Permit',
    governmentRef: 'Municipal Corporation Bylaws; Street Vending Acts',
    officialLink: 'Municipal corporation',
    deadline: 'Before setting up outdoor seating',
    penalty: 'Rs.500-5,000 daily fine. Removal of furniture. Trade license impact.',
    actionIfNonCompliant: [
      'Apply to municipal corporation',
      'Submit layout plan showing outdoor area',
      'Ensure minimum 1.5m footpath clearance',
      'Pay monthly/annual fee',
      'Maintain cleanliness of outdoor area',
    ],
    actionIfCompliant: 'Renew permit annually. Comply with permitted hours.',
  },
};

// Helper function to get rule by question ID
export function getFoodComplianceRule(questionId: string): FoodComplianceRule | undefined {
  return FOOD_COMPLIANCE_RULES[questionId];
}
