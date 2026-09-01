/**
 * Assessment-specific report configurations for the unified PDF generator.
 * Each config defines the titles, resources, legislation, and deadlines
 * that are unique to each assessment type.
 */

import type { ReportConfig } from './unified-report-generator'

// ============================================================================
// STATUTORY HEALTH CHECK
// ============================================================================

export const STATUTORY_HEALTH_CONFIG: ReportConfig = {
  assessmentTitle: 'Statutory Health Check',
  assessmentSubtitle: 'Assessment Report',
  legislationDescription: 'EPF, ESI, Professional Tax, Gratuity & Bonus Compliance',
  legislationLine2: 'Key Labour Statutes for Indian Businesses',
  filenamePrefix: 'ComplianceCheck-Report',
  resources: [
    { name: 'EPFO Unified Portal', url: 'https://unifiedportal-emp.epfindia.gov.in' },
    { name: 'ESIC Portal', url: 'https://www.esic.gov.in' },
    { name: 'Income Tax (Prof. Tax)', url: 'https://incometaxindia.gov.in' },
    { name: 'Ministry of Labour', url: 'https://labour.gov.in' },
    { name: 'Shram Suvidha Portal', url: 'https://shramsuvidha.gov.in' },
  ],
  legislation: [
    'Employees Provident Funds and Miscellaneous Provisions Act, 1952',
    'Employees State Insurance Act, 1948',
    'Payment of Gratuity Act, 1972',
    'Payment of Bonus Act, 1965',
    'State Professional Tax Acts',
    'Code on Social Security, 2020 (when notified)',
  ],
  deadlines: [
    { item: 'EPF/ESI Monthly Deposit', date: '15th of following month' },
    { item: 'ECR Filing (EPF)', date: '15th of following month' },
    { item: 'ESI Half-yearly Return (Form 6)', date: '11th May / 11th November' },
    { item: 'Professional Tax (Monthly)', date: 'State-specific (typically 21st)' },
    { item: 'Gratuity Payment', date: 'Within 30 days of becoming payable' },
    { item: 'Bonus Payment', date: 'Within 8 months of close of accounting year' },
  ],
}

// ============================================================================
// LABOUR CODE READINESS
// ============================================================================

export const LABOUR_CODE_CONFIG: ReportConfig = {
  assessmentTitle: 'Labour Code Readiness',
  assessmentSubtitle: 'Assessment Report',
  legislationDescription: 'India\'s Four New Labour Codes (2019-2020)',
  legislationLine2: 'Code on Wages | Social Security | OSH | Industrial Relations',
  filenamePrefix: 'Labour-Code-Readiness',
  resources: [
    { name: 'Ministry of Labour & Employment', url: 'https://labour.gov.in' },
    { name: 'Shram Suvidha Portal', url: 'https://shramsuvidha.gov.in' },
    { name: 'EPFO Portal', url: 'https://unifiedportal-emp.epfindia.gov.in' },
    { name: 'ESIC Portal', url: 'https://www.esic.gov.in' },
    { name: 'e-Shram Portal', url: 'https://eshram.gov.in' },
  ],
  legislation: [
    'Code on Wages, 2019',
    'Code on Social Security, 2020',
    'Occupational Safety, Health and Working Conditions Code, 2020',
    'Industrial Relations Code, 2020',
  ],
  deadlines: [
    { item: 'Labour Code Implementation', date: 'Expected November 2025' },
    { item: 'Salary Restructuring (50% Basic)', date: 'Before enforcement date' },
    { item: 'New PF/Gratuity Calculations', date: 'From enforcement date' },
    { item: 'Updated Standing Orders', date: 'Within 6 months of enforcement' },
    { item: 'OSH Compliance', date: 'Immediate upon enforcement' },
  ],
}

// ============================================================================
// DPDP ACT COMPLIANCE
// ============================================================================

export const DPDP_CONFIG: ReportConfig = {
  assessmentTitle: 'DPDP Act Compliance',
  assessmentSubtitle: 'Gap Assessment Report',
  legislationDescription: 'Digital Personal Data Protection Act, 2023',
  legislationLine2: 'DPDP Rules, 2025',
  filenamePrefix: 'DPDP-Gap-Assessment',
  resources: [
    { name: 'MeitY Data Protection Framework', url: 'https://www.meity.gov.in/data-protection-framework' },
    { name: 'Data Protection Board of India', url: 'https://www.dataprotection.gov.in' },
    { name: 'DPDP Act Full Text', url: 'https://www.meity.gov.in/writereaddata/files/Digital%20Personal%20Data%20Protection%20Act%202023.pdf' },
    { name: 'CERT-In (Breach Reporting)', url: 'https://www.cert-in.org.in' },
  ],
  legislation: [
    'Digital Personal Data Protection Act, 2023',
    'DPDP Rules, 2025',
    'Information Technology Act, 2000',
    'IT (Reasonable Security Practices) Rules, 2011',
    'CERT-In Directions (April 2022)',
  ],
  deadlines: [
    { item: 'DPDP Act Full Compliance', date: '13 May 2027' },
    { item: 'Consent Manager Registration', date: 'Before processing personal data' },
    { item: 'Data Breach Notification to Board', date: 'Within 72 hours of discovery' },
    { item: 'Data Breach Notification to Principal', date: 'Without undue delay' },
    { item: 'Response to Data Erasure Request', date: 'Without unreasonable delay' },
    { item: 'Grievance Redressal Response', date: 'As prescribed by Rules' },
  ],
  deadlineWarning: {
    text: 'DPDP Act compliance deadline: 13 May 2027. All Data Fiduciaries must be fully compliant by this date. Penalties up to Rs. 250 Crore for non-compliance.',
  },
}

// ============================================================================
// STATE-WISE COMPLIANCE
// ============================================================================

export const STATE_WISE_CONFIG: ReportConfig = {
  assessmentTitle: 'State-Wise Compliance',
  assessmentSubtitle: 'Assessment Report',
  legislationDescription: 'Central & State Labour Law Compliance',
  legislationLine2: 'EPF, ESI, Professional Tax, Shops & Establishments',
  filenamePrefix: 'State-Wise-Compliance',
  resources: [
    { name: 'EPFO Portal', url: 'https://unifiedportal-emp.epfindia.gov.in' },
    { name: 'ESIC Portal', url: 'https://www.esic.gov.in' },
    { name: 'Shram Suvidha Portal', url: 'https://shramsuvidha.gov.in' },
    { name: 'Ministry of Labour', url: 'https://labour.gov.in' },
    { name: 'State Labour Dept Portals', url: 'Check your state government website' },
  ],
  legislation: [
    'Employees Provident Funds and Miscellaneous Provisions Act, 1952',
    'Employees State Insurance Act, 1948',
    'Payment of Gratuity Act, 1972',
    'Payment of Bonus Act, 1965',
    'State Professional Tax Acts',
    'State Shops and Establishments Acts',
    'Contract Labour (Regulation and Abolition) Act, 1970',
    'State-specific Labour Welfare Fund Acts',
  ],
  deadlines: [
    { item: 'EPF/ESI Monthly Deposit', date: '15th of following month' },
    { item: 'Professional Tax (Monthly)', date: 'State-specific (typically 21st)' },
    { item: 'Shops & Establishments Registration', date: 'Within 30 days of commencement' },
    { item: 'Labour Welfare Fund', date: 'Half-yearly (June 30 / December 31)' },
    { item: 'Contract Labour License Renewal', date: 'Before expiry' },
    { item: 'Annual Returns Filing', date: 'January 31 / February 1 (varies by state)' },
  ],
}

// ============================================================================
// POSH ACT COMPLIANCE
// ============================================================================

export const POSH_CONFIG: ReportConfig = {
  assessmentTitle: 'POSH Act 2013 Compliance',
  assessmentSubtitle: 'Assessment Report',
  legislationDescription: 'Sexual Harassment of Women at Workplace Act, 2013',
  legislationLine2: 'Prevention, Prohibition and Redressal',
  filenamePrefix: 'POSH-Compliance-Report',
  resources: [
    { name: 'WCD Ministry (POSH)', url: 'https://wcd.nic.in' },
    { name: 'SHe-Box Portal', url: 'https://shebox.nic.in' },
    { name: 'State Labour Dept Portals', url: 'Check your state government website' },
    { name: 'National Commission for Women', url: 'https://ncw.nic.in' },
  ],
  legislation: [
    'Sexual Harassment of Women at Workplace (Prevention, Prohibition and Redressal) Act, 2013',
    'POSH Rules, 2013',
    'IPC Section 354A (Sexual Harassment)',
    'Companies Act, 2013 (Annual Report Disclosure)',
  ],
  deadlines: [
    { item: 'ICC Annual Report to District Officer', date: 'January 31 annually' },
    { item: 'ICC Board/Company Annual Report', date: 'Before Annual General Meeting' },
    { item: 'ICC Inquiry Completion', date: 'Within 90 days of complaint receipt' },
    { item: 'Action on ICC Recommendations', date: 'Within 60 days of report receipt' },
    { item: 'ICC Member Tenure', date: '3 years (reappointment required)' },
  ],
}

// ============================================================================
// AUTO DEALERSHIP COMPLIANCE (sample report only — live report generation
// stays on its own standalone route per CLAUDE.md sec 14)
// ============================================================================

export const AUTO_DEALER_CONFIG: ReportConfig = {
  assessmentTitle: 'Auto Dealership Compliance',
  assessmentSubtitle: 'Assessment Report',
  legislationDescription: 'Labour Codes, CMVR, EHS, IRDAI MISP, ELV, GST & DPDP Compliance',
  legislationLine2: '2-Wheeler & 4-Wheeler Dealerships',
  filenamePrefix: 'Auto-Dealer-Compliance',
  resources: [
    { name: 'Ministry of Road Transport & Highways', url: 'https://morth.nic.in' },
    { name: 'IRDAI Portal', url: 'https://irdai.gov.in' },
    { name: 'Ministry of Labour', url: 'https://labour.gov.in' },
    { name: 'CPCB E-Waste/EPR Portal', url: 'https://cpcb.nic.in' },
  ],
  legislation: [
    'Code on Wages, 2019',
    'Occupational Safety, Health and Working Conditions Code, 2020',
    'Central Motor Vehicles Rules, 1989',
    'IRDAI (Insurance Web Aggregators/MISP) Regulations',
    'E-Waste (Management) Rules, 2022 (EPR)',
    'Digital Personal Data Protection Act, 2023',
  ],
  deadlines: [
    { item: 'PF/ESI Monthly Deposit', date: '15th of following month' },
    { item: 'POSH Annual Report', date: 'January 31 annually' },
    { item: 'EPR (E-Waste) Annual Return', date: 'As prescribed by CPCB' },
    { item: 'DPDP Act Full Compliance', date: '13 May 2027' },
  ],
}

// ============================================================================
// FOOD BUSINESS COMPLIANCE
// ============================================================================

export const FOOD_BUSINESS_CONFIG: ReportConfig = {
  assessmentTitle: 'Food Business Compliance',
  assessmentSubtitle: 'Assessment Report',
  legislationDescription: 'FSSAI, GST, Fire Safety & Labour Law Compliance',
  legislationLine2: 'Restaurant & Food Service Business',
  filenamePrefix: 'Food-Business-Compliance',
  resources: [
    { name: 'FSSAI FoSCoS Portal', url: 'https://foscos.fssai.gov.in' },
    { name: 'FOSTAC Training', url: 'https://fostac.fssai.gov.in' },
    { name: 'FSSAI Hygiene Rating', url: 'https://hygiene.fssai.gov.in' },
    { name: 'GST Portal', url: 'https://gst.gov.in' },
    { name: 'EPFO Portal', url: 'https://unifiedportal-emp.epfindia.gov.in' },
    { name: 'ESIC Portal', url: 'https://www.esic.gov.in' },
    { name: 'Ministry of Labour', url: 'https://labour.gov.in' },
  ],
  legislation: [
    'Food Safety and Standards Act, 2006',
    'FSS (Licensing and Registration) Regulations, 2011',
    'FSS (Packaging and Labeling) Regulations, 2011',
    'Central Goods and Services Tax Act, 2017',
    'Employees Provident Funds and Miscellaneous Provisions Act, 1952',
    'Employees State Insurance Act, 1948',
    'Payment of Gratuity Act, 1972',
    'Sexual Harassment of Women at Workplace (POSH) Act, 2013',
    'State Shops and Establishments Acts',
    'State Excise Acts (for liquor service)',
    'National Building Code 2016 (Fire Safety)',
  ],
  deadlines: [
    { item: 'FSSAI Annual Return (Form D-1)', date: 'May 31 annually' },
    { item: 'FSSAI License Renewal', date: '30 days before expiry' },
    { item: 'EPF/ESI Monthly Deposit', date: '15th of following month' },
    { item: 'GST Returns (GSTR-1, GSTR-3B)', date: '11th/20th monthly' },
    { item: 'Fire NOC Renewal', date: 'Annually (state-specific)' },
    { item: 'Trade License Renewal', date: 'March 31 annually' },
    { item: 'POSH Annual Report', date: 'January 31' },
  ],
}
