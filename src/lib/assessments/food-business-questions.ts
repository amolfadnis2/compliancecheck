/**
 * ComplianceCheck - Food Business Compliance Questions
 * 
 * Main compliance questions for Restaurant & Food Business Compliance Check
 * Questions are dynamically filtered based on applicability results
 * 
 * Slug: food-business
 * Target: Restaurants, Cafés, QSRs, Cloud Kitchens, Caterers
 * 
 * Total possible: ~67 questions across 8 compliance areas
 * Typical user sees: 25-50 questions based on their profile
 */

// ============================================================================
// TYPES
// ============================================================================

export interface FoodBusinessDetails {
  companyName: string;
  email: string;
  phone: string;
  fullName: string;
  primaryState: string;
  cityType: string;
  businessFormat: string;
  annualTurnover: string;
  employeeCount: string;
  seatingCapacity: string;
  servesAlcohol: boolean;
  isAggregatorListed: boolean;
  hasOutdoorSeating: boolean;
  hasLiveEntertainment: boolean;
  lateNightOperations: boolean;
  employsWomen: boolean;
  // Applicability codes that apply
  applicableCodes: string[];
}

export interface Question {
  id: string;
  text: string;
  type: 'yes_no' | 'multiple_choice' | 'text' | 'number';
  category: string;
  weight: number;
  complianceAnswer?: string;
  helpText?: string;
  options?: string[];
  applicabilityCode: string;
}

export interface CategoryInfo {
  name: string;
  description: string;
  weight: number;
}

// ============================================================================
// CATEGORY DEFINITIONS
// ============================================================================

export const FOOD_BUSINESS_CATEGORIES: Record<string, CategoryInfo> = {
  'FSSAI': {
    name: 'Food Safety (FSSAI)',
    description: 'FSSAI licence, food safety standards, and hygiene compliance',
    weight: 20,
  },
  'GST': {
    name: 'GST & Taxation',
    description: 'GST registration, returns, and tax compliance',
    weight: 10,
  },
  'BUSINESS_REG': {
    name: 'Business Registration',
    description: 'Shop Act, Trade Licence, and municipal registrations',
    weight: 15,
  },
  'FIRE_SAFETY': {
    name: 'Fire Safety',
    description: 'Fire NOC, equipment, and emergency preparedness',
    weight: 10,
  },
  'LABOR': {
    name: 'Labour Compliance',
    description: 'EPF, ESI, Gratuity, Professional Tax, and employee welfare',
    weight: 15,
  },
  'LIQUOR': {
    name: 'Liquor & Excise',
    description: 'State excise licence, permit conditions, and alcohol regulations',
    weight: 15,
  },
  'HEALTH': {
    name: 'Health & Hygiene',
    description: 'Health trade licence, sanitation, pest control, and food handling',
    weight: 10,
  },
  'SPECIAL': {
    name: 'Special Permits',
    description: 'Entertainment, late night, outdoor seating, and special operation permits',
    weight: 5,
  },
};

// ============================================================================
// QUESTIONS - FSSAI (8 questions)
// ============================================================================

const FSSAI_QUESTIONS: Question[] = [
  {
    id: 'fssai_license_obtained',
    text: 'Do you have a valid FSSAI licence/registration?',
    type: 'yes_no',
    category: 'FSSAI',
    weight: 10,
    complianceAnswer: 'yes',
    helpText: 'FSSAI licence is mandatory for all food businesses. Basic registration for <Rs.12L turnover, State licence for Rs.12L-Rs.20Cr, Central licence for >Rs.20Cr.',
    applicabilityCode: 'FSSAI',
  },
  {
    id: 'fssai_displayed',
    text: 'Is your FSSAI licence number prominently displayed at the premises?',
    type: 'yes_no',
    category: 'FSSAI',
    weight: 6,
    complianceAnswer: 'yes',
    helpText: 'FSSAI licence must be displayed at a prominent location visible to customers.',
    applicabilityCode: 'FSSAI',
  },
  {
    id: 'fssai_validity_check',
    text: 'Is your FSSAI licence valid for at least 6 more months?',
    type: 'yes_no',
    category: 'FSSAI',
    weight: 7,
    complianceAnswer: 'yes',
    helpText: 'Renewal application must be filed 30 days before expiry. Late renewal attracts Rs.100/day penalty.',
    applicabilityCode: 'FSSAI',
  },
  {
    id: 'fssai_food_handler_training',
    text: 'Have your food handlers completed FSSAI-approved food safety training (FOSTAC)?',
    type: 'yes_no',
    category: 'FSSAI',
    weight: 7,
    complianceAnswer: 'yes',
    helpText: 'At least one trained food safety supervisor (FOSTAC certified) is mandatory for licensed premises.',
    applicabilityCode: 'FSSAI',
  },
  {
    id: 'fssai_records_maintained',
    text: 'Do you maintain daily food safety records (temperature logs, cleaning schedules)?',
    type: 'yes_no',
    category: 'FSSAI',
    weight: 6,
    complianceAnswer: 'yes',
    helpText: 'Food safety records must be maintained and available for inspection.',
    applicabilityCode: 'FSSAI',
  },
  {
    id: 'fssai_supplier_verification',
    text: 'Do you verify FSSAI licence numbers of all your suppliers?',
    type: 'yes_no',
    category: 'FSSAI',
    weight: 5,
    complianceAnswer: 'yes',
    helpText: 'Sourcing from unlicensed suppliers can result in penalties and licence cancellation.',
    applicabilityCode: 'FSSAI',
  },
  {
    id: 'fssai_labelling_compliance',
    text: 'Do packaged items sold by you have proper FSSAI-compliant labelling?',
    type: 'yes_no',
    category: 'FSSAI',
    weight: 5,
    complianceAnswer: 'yes',
    helpText: 'All packaged food must display FSSAI logo, licence number, ingredients, allergens, and expiry date.',
    applicabilityCode: 'FSSAI',
  },
  {
    id: 'fssai_hygiene_rating',
    text: 'Have you applied for or obtained FSSAI Hygiene Rating?',
    type: 'multiple_choice',
    category: 'FSSAI',
    weight: 4,
    options: [
      'Yes, currently rated (displayed)',
      'Applied, audit pending',
      'Planning to apply',
      'Not yet initiated',
    ],
    complianceAnswer: 'Yes, currently rated (displayed)',
    helpText: 'Voluntary hygiene rating (1-5 stars) enhances customer trust. Increasingly required by aggregators.',
    applicabilityCode: 'FSSAI',
  },
];

// ============================================================================
// QUESTIONS - GST (5 questions)
// ============================================================================

const GST_QUESTIONS: Question[] = [
  {
    id: 'gst_registered',
    text: 'Is your business registered under GST?',
    type: 'yes_no',
    category: 'GST',
    weight: 9,
    complianceAnswer: 'yes',
    helpText: 'GST registration is mandatory for turnover above Rs.20 lakh or if listed on aggregators.',
    applicabilityCode: 'GST',
  },
  {
    id: 'gst_returns_filed',
    text: 'Are your GST returns (GSTR-1, GSTR-3B) filed on time?',
    type: 'yes_no',
    category: 'GST',
    weight: 8,
    complianceAnswer: 'yes',
    helpText: 'Late filing attracts Rs.50/day penalty (CGST + SGST) plus interest at 18% p.a.',
    applicabilityCode: 'GST',
  },
  {
    id: 'gst_invoicing',
    text: 'Do you issue proper GST-compliant invoices for all transactions?',
    type: 'yes_no',
    category: 'GST',
    weight: 7,
    complianceAnswer: 'yes',
    helpText: 'Invoice must contain GSTIN, HSN/SAC code, and proper tax bifurcation.',
    applicabilityCode: 'GST',
  },
  {
    id: 'gst_rate_correct',
    text: 'Are you charging the correct GST rate (5% without ITC or 18% with ITC)?',
    type: 'yes_no',
    category: 'GST',
    weight: 6,
    complianceAnswer: 'yes',
    helpText: 'Restaurants typically charge 5% GST (no ITC) or 18% GST (with ITC for AC/liquor establishments).',
    applicabilityCode: 'GST',
  },
  {
    id: 'gst_aggregator_tcs',
    text: 'Are you tracking 1% TCS deducted by food aggregators (Swiggy/Zomato)?',
    type: 'yes_no',
    category: 'GST',
    weight: 5,
    complianceAnswer: 'yes',
    helpText: 'Aggregators deduct 1% TCS which must be claimed while filing returns.',
    applicabilityCode: 'GST',
  },
];

// ============================================================================
// QUESTIONS - BUSINESS REGISTRATION (6 questions)
// ============================================================================

const BUSINESS_REG_QUESTIONS: Question[] = [
  {
    id: 'shop_act_registration',
    text: 'Is your establishment registered under the Shops & Establishment Act?',
    type: 'yes_no',
    category: 'BUSINESS_REG',
    weight: 8,
    complianceAnswer: 'yes',
    helpText: 'Registration required within 30 days of commencing business. Covers working hours, leave, and employee welfare.',
    applicabilityCode: 'BUSINESS_REG',
  },
  {
    id: 'trade_license',
    text: 'Do you have a valid Trade Licence from the municipal corporation?',
    type: 'yes_no',
    category: 'BUSINESS_REG',
    weight: 8,
    complianceAnswer: 'yes',
    helpText: 'Trade licence is mandatory for operating any commercial establishment.',
    applicabilityCode: 'BUSINESS_REG',
  },
  {
    id: 'signage_permit',
    text: 'Do you have proper permits for signage/hoardings displayed?',
    type: 'yes_no',
    category: 'BUSINESS_REG',
    weight: 5,
    complianceAnswer: 'yes',
    helpText: 'Unauthorised signage can result in fines and removal by municipal authorities.',
    applicabilityCode: 'BUSINESS_REG',
  },
  {
    id: 'eating_house_license',
    text: 'Do you have Police Eating House Licence (if required in your state)?',
    type: 'multiple_choice',
    category: 'BUSINESS_REG',
    weight: 6,
    options: [
      'Yes, obtained',
      'Application pending',
      'Not required in my state',
      'Not yet applied',
    ],
    complianceAnswer: 'Yes, obtained',
    helpText: 'Required in Delhi, Maharashtra, Karnataka, Tamil Nadu, West Bengal for restaurants with seating.',
    applicabilityCode: 'BUSINESS_REG',
  },
  {
    id: 'land_use_compliance',
    text: 'Is your premises located in a commercially-zoned area?',
    type: 'yes_no',
    category: 'BUSINESS_REG',
    weight: 6,
    complianceAnswer: 'yes',
    helpText: 'Operating in residential zones without conversion can lead to sealing/closure.',
    applicabilityCode: 'BUSINESS_REG',
  },
  {
    id: 'building_stability',
    text: 'Do you have a building stability certificate (for premises above ground floor)?',
    type: 'multiple_choice',
    category: 'BUSINESS_REG',
    weight: 5,
    options: [
      'Yes, obtained',
      'Ground floor - not required',
      'Application pending',
      'Not yet applied',
    ],
    complianceAnswer: 'Yes, obtained',
    helpText: 'Structural safety certificate required for restaurants on upper floors.',
    applicabilityCode: 'BUSINESS_REG',
  },
];

// ============================================================================
// QUESTIONS - FIRE SAFETY (8 questions)
// ============================================================================

const FIRE_SAFETY_QUESTIONS: Question[] = [
  {
    id: 'fire_noc_obtained',
    text: 'Do you have a valid Fire NOC from the State Fire Department?',
    type: 'yes_no',
    category: 'FIRE_SAFETY',
    weight: 10,
    complianceAnswer: 'yes',
    helpText: 'Fire NOC is mandatory for restaurants with seating capacity, LPG storage, or alcohol service.',
    applicabilityCode: 'FIRE_SAFETY',
  },
  {
    id: 'fire_extinguishers',
    text: 'Are fire extinguishers installed at required locations with valid refill dates?',
    type: 'yes_no',
    category: 'FIRE_SAFETY',
    weight: 8,
    complianceAnswer: 'yes',
    helpText: 'ABC-type extinguishers required in kitchen, dining area, and storage. Annual refill mandatory.',
    applicabilityCode: 'FIRE_SAFETY',
  },
  {
    id: 'fire_exit_signage',
    text: 'Are emergency exit routes clearly marked with illuminated signs?',
    type: 'yes_no',
    category: 'FIRE_SAFETY',
    weight: 7,
    complianceAnswer: 'yes',
    helpText: 'Exit signs must be illuminated and visible even during power failure.',
    applicabilityCode: 'FIRE_SAFETY',
  },
  {
    id: 'fire_alarm_system',
    text: 'Is there a functional fire alarm/smoke detection system?',
    type: 'yes_no',
    category: 'FIRE_SAFETY',
    weight: 7,
    complianceAnswer: 'yes',
    helpText: 'Smoke detectors mandatory in kitchen and dining areas above 500 sq ft.',
    applicabilityCode: 'FIRE_SAFETY',
  },
  {
    id: 'emergency_exit_clear',
    text: 'Are emergency exits unobstructed and doors opening outward?',
    type: 'yes_no',
    category: 'FIRE_SAFETY',
    weight: 8,
    complianceAnswer: 'yes',
    helpText: 'Emergency exits must never be blocked. Doors must open outward.',
    applicabilityCode: 'FIRE_SAFETY',
  },
  {
    id: 'kitchen_hood_suppression',
    text: 'Is your kitchen equipped with hood fire suppression system?',
    type: 'multiple_choice',
    category: 'FIRE_SAFETY',
    weight: 6,
    options: [
      'Yes, installed and maintained',
      'Installed but maintenance due',
      'Not required for my kitchen size',
      'Not yet installed',
    ],
    complianceAnswer: 'Yes, installed and maintained',
    helpText: 'Automatic fire suppression required for commercial kitchens with deep fryers.',
    applicabilityCode: 'FIRE_SAFETY',
  },
  {
    id: 'fire_drill_conducted',
    text: 'Have you conducted fire safety drills with staff in the last 6 months?',
    type: 'yes_no',
    category: 'FIRE_SAFETY',
    weight: 5,
    complianceAnswer: 'yes',
    helpText: 'Staff should know evacuation routes and fire extinguisher operation.',
    applicabilityCode: 'FIRE_SAFETY',
  },
  {
    id: 'lpg_storage_compliant',
    text: 'Is your LPG cylinder storage area properly ventilated and away from ignition sources?',
    type: 'yes_no',
    category: 'FIRE_SAFETY',
    weight: 7,
    complianceAnswer: 'yes',
    helpText: 'LPG storage must be in ventilated area, away from electrical points and cooking area.',
    applicabilityCode: 'FIRE_SAFETY',
  },
];

// ============================================================================
// QUESTIONS - LABOUR COMPLIANCE (15 questions)
// ============================================================================

const LABOR_QUESTIONS: Question[] = [
  // Base questions (always shown)
  {
    id: 'minimum_wages_compliance',
    text: 'Are all employees paid at least the state-mandated minimum wages?',
    type: 'yes_no',
    category: 'LABOR',
    weight: 9,
    complianceAnswer: 'yes',
    helpText: 'Minimum wages vary by state and skill category. Non-compliance attracts penalty up to Rs.50,000.',
    applicabilityCode: 'LABOR',
  },
  {
    id: 'salary_account_payment',
    text: 'Are wages paid through bank transfer/account for employees earning above Rs.15,000?',
    type: 'yes_no',
    category: 'LABOR',
    weight: 6,
    complianceAnswer: 'yes',
    helpText: 'Payment of Wages Act mandates bank payment for wages above Rs.15,000.',
    applicabilityCode: 'LABOR',
  },
  {
    id: 'wage_slip_provided',
    text: 'Do you provide wage slips to all employees?',
    type: 'yes_no',
    category: 'LABOR',
    weight: 5,
    complianceAnswer: 'yes',
    helpText: 'Wage slip showing all deductions is mandatory under labour codes.',
    applicabilityCode: 'LABOR',
  },
  // EPF questions
  {
    id: 'epf_registered',
    text: 'Is your establishment registered with EPFO?',
    type: 'yes_no',
    category: 'LABOR',
    weight: 9,
    complianceAnswer: 'yes',
    helpText: 'EPF registration mandatory for establishments with 20+ employees.',
    applicabilityCode: 'LABOR',
  },
  {
    id: 'epf_contributions_timely',
    text: 'Are EPF contributions (12% + 12%) deposited by 15th of following month?',
    type: 'yes_no',
    category: 'LABOR',
    weight: 8,
    complianceAnswer: 'yes',
    helpText: 'Late payment attracts interest (12%) and damages (up to 100%).',
    applicabilityCode: 'LABOR',
  },
  {
    id: 'epf_uan_allotted',
    text: 'Have UAN numbers been allotted to all eligible employees?',
    type: 'yes_no',
    category: 'LABOR',
    weight: 6,
    complianceAnswer: 'yes',
    helpText: 'Universal Account Number enables portability across employers.',
    applicabilityCode: 'LABOR',
  },
  {
    id: 'epf_kyc_updated',
    text: 'Is KYC (Aadhaar, PAN, Bank) updated for all employees in EPFO portal?',
    type: 'yes_no',
    category: 'LABOR',
    weight: 5,
    complianceAnswer: 'yes',
    helpText: 'KYC mandatory for online claims and transfers.',
    applicabilityCode: 'LABOR',
  },
  // ESI questions
  {
    id: 'esi_registered',
    text: 'Is your establishment registered with ESIC?',
    type: 'yes_no',
    category: 'LABOR',
    weight: 8,
    complianceAnswer: 'yes',
    helpText: 'ESI registration mandatory for establishments with 10+ employees in notified areas.',
    applicabilityCode: 'LABOR',
  },
  {
    id: 'esi_contributions_timely',
    text: 'Are ESI contributions deposited by 15th of following month?',
    type: 'yes_no',
    category: 'LABOR',
    weight: 7,
    complianceAnswer: 'yes',
    helpText: 'Employer contributes 3.25%, employee contributes 0.75% (for wages up to Rs.21,000).',
    applicabilityCode: 'LABOR',
  },
  {
    id: 'esi_returns_filed',
    text: 'Are half-yearly ESI returns filed on time?',
    type: 'yes_no',
    category: 'LABOR',
    weight: 6,
    complianceAnswer: 'yes',
    helpText: 'Returns due by 12th May (Oct-Mar) and 11th Nov (Apr-Sep).',
    applicabilityCode: 'LABOR',
  },
  // Gratuity questions
  {
    id: 'gratuity_provision',
    text: 'Have you made provisions for gratuity payment (4.81% of basic)?',
    type: 'yes_no',
    category: 'LABOR',
    weight: 7,
    complianceAnswer: 'yes',
    helpText: 'Gratuity payable after 5 years of service. Provision should be made from day one.',
    applicabilityCode: 'LABOR',
  },
  {
    id: 'gratuity_insurance',
    text: 'Have you obtained gratuity insurance or created a trust fund?',
    type: 'multiple_choice',
    category: 'LABOR',
    weight: 5,
    options: [
      'Yes, LIC group gratuity policy',
      'Yes, gratuity trust created',
      'Provisions made in accounts',
      'Not yet addressed',
    ],
    complianceAnswer: 'Yes, LIC group gratuity policy',
    helpText: 'Insurance or trust ensures funds available for gratuity payment.',
    applicabilityCode: 'LABOR',
  },
  // Professional Tax questions
  {
    id: 'pt_registered',
    text: 'Is your business registered for Professional Tax deduction?',
    type: 'yes_no',
    category: 'LABOR',
    weight: 6,
    complianceAnswer: 'yes',
    helpText: 'Professional Tax applicable in most states. Employer must deduct and deposit.',
    applicabilityCode: 'LABOR',
  },
  {
    id: 'pt_deducted_deposited',
    text: 'Is Professional Tax deducted from salaries and deposited monthly?',
    type: 'yes_no',
    category: 'LABOR',
    weight: 5,
    complianceAnswer: 'yes',
    helpText: 'PT rates vary by state (Rs.200-2,500/month). Late payment attracts penalty.',
    applicabilityCode: 'LABOR',
  },
  // POSH questions
  {
    id: 'posh_icc_constituted',
    text: 'Have you constituted an Internal Complaints Committee (ICC) under POSH Act?',
    type: 'yes_no',
    category: 'LABOR',
    weight: 8,
    complianceAnswer: 'yes',
    helpText: 'ICC mandatory for establishments with 10+ employees. Must include external member.',
    applicabilityCode: 'LABOR',
  },
];

// ============================================================================
// QUESTIONS - LIQUOR & EXCISE (12 questions)
// ============================================================================

const LIQUOR_QUESTIONS: Question[] = [
  {
    id: 'liquor_license_obtained',
    text: 'Do you have a valid State Excise licence for serving alcohol?',
    type: 'yes_no',
    category: 'LIQUOR',
    weight: 10,
    complianceAnswer: 'yes',
    helpText: 'Operating without excise licence is a criminal offence with imprisonment.',
    applicabilityCode: 'LIQUOR',
  },
  {
    id: 'liquor_license_displayed',
    text: 'Is your excise licence displayed at a prominent location?',
    type: 'yes_no',
    category: 'LIQUOR',
    weight: 5,
    complianceAnswer: 'yes',
    helpText: 'Licence must be displayed for inspection by excise officials.',
    applicabilityCode: 'LIQUOR',
  },
  {
    id: 'liquor_license_validity',
    text: 'Is your excise licence valid (renewed before March 31)?',
    type: 'yes_no',
    category: 'LIQUOR',
    weight: 8,
    complianceAnswer: 'yes',
    helpText: 'Most state licences expire on March 31 and must be renewed annually.',
    applicabilityCode: 'LIQUOR',
  },
  {
    id: 'liquor_stock_register',
    text: 'Do you maintain daily stock register for alcohol inventory?',
    type: 'yes_no',
    category: 'LIQUOR',
    weight: 7,
    complianceAnswer: 'yes',
    helpText: 'Stock register showing opening stock, purchases, sales, and closing stock is mandatory.',
    applicabilityCode: 'LIQUOR',
  },
  {
    id: 'liquor_purchase_authorized',
    text: 'Do you purchase alcohol only from authorised wholesalers/distributors?',
    type: 'yes_no',
    category: 'LIQUOR',
    weight: 8,
    complianceAnswer: 'yes',
    helpText: 'Purchasing from unauthorised sources can lead to licence cancellation.',
    applicabilityCode: 'LIQUOR',
  },
  {
    id: 'liquor_dry_day_compliance',
    text: 'Do you strictly observe dry days and election day restrictions?',
    type: 'yes_no',
    category: 'LIQUOR',
    weight: 7,
    complianceAnswer: 'yes',
    helpText: 'Serving alcohol on dry days is a serious offence. Check state calendar.',
    applicabilityCode: 'LIQUOR',
  },
  {
    id: 'liquor_serving_hours',
    text: 'Do you serve alcohol only during permitted hours?',
    type: 'yes_no',
    category: 'LIQUOR',
    weight: 7,
    complianceAnswer: 'yes',
    helpText: 'Most states allow service between 11 AM - 11 PM. Extended hours need permit.',
    applicabilityCode: 'LIQUOR',
  },
  {
    id: 'liquor_age_verification',
    text: 'Do you verify age before serving alcohol (21/25 years depending on state)?',
    type: 'yes_no',
    category: 'LIQUOR',
    weight: 8,
    complianceAnswer: 'yes',
    helpText: 'Legal drinking age varies: 21 years in most states, 25 in Delhi, Maharashtra, Punjab.',
    applicabilityCode: 'LIQUOR',
  },
  {
    id: 'liquor_distance_norms',
    text: 'Does your premises comply with distance norms from schools/religious places?',
    type: 'yes_no',
    category: 'LIQUOR',
    weight: 9,
    complianceAnswer: 'yes',
    helpText: 'Minimum 100m distance from schools, colleges, hospitals, and religious places.',
    applicabilityCode: 'LIQUOR',
  },
  {
    id: 'liquor_brand_listed',
    text: 'Do you serve only brands listed in your licence category?',
    type: 'yes_no',
    category: 'LIQUOR',
    weight: 6,
    complianceAnswer: 'yes',
    helpText: 'FL-3 licence for IMFL, FL-4 for foreign liquor. Check permitted brands.',
    applicabilityCode: 'LIQUOR',
  },
  {
    id: 'liquor_inspection_ready',
    text: 'Are you prepared for surprise excise inspections?',
    type: 'yes_no',
    category: 'LIQUOR',
    weight: 5,
    complianceAnswer: 'yes',
    helpText: 'Keep all documents, stock registers, and bills ready for inspection.',
    applicabilityCode: 'LIQUOR',
  },
  {
    id: 'liquor_no_smuggled',
    text: 'Have you verified that no smuggled/spurious alcohol is in your stock?',
    type: 'yes_no',
    category: 'LIQUOR',
    weight: 9,
    complianceAnswer: 'yes',
    helpText: 'Possession of spurious liquor can result in criminal prosecution.',
    applicabilityCode: 'LIQUOR',
  },
];

// ============================================================================
// QUESTIONS - HEALTH & HYGIENE (5 questions)
// ============================================================================

const HEALTH_QUESTIONS: Question[] = [
  {
    id: 'health_trade_license',
    text: 'Do you have a Health Trade Licence from the municipal health department?',
    type: 'yes_no',
    category: 'HEALTH',
    weight: 8,
    complianceAnswer: 'yes',
    helpText: 'Health licence ensures premises meets sanitation and hygiene standards.',
    applicabilityCode: 'HEALTH',
  },
  {
    id: 'pest_control_contract',
    text: 'Do you have an annual pest control contract with a licensed operator?',
    type: 'yes_no',
    category: 'HEALTH',
    weight: 7,
    complianceAnswer: 'yes',
    helpText: 'Quarterly pest control with documentation required for FSSAI compliance.',
    applicabilityCode: 'HEALTH',
  },
  {
    id: 'water_quality_testing',
    text: 'Is your water tested periodically for potability?',
    type: 'yes_no',
    category: 'HEALTH',
    weight: 7,
    complianceAnswer: 'yes',
    helpText: 'Water testing every 6 months recommended. Mandatory in some states.',
    applicabilityCode: 'HEALTH',
  },
  {
    id: 'staff_health_checkup',
    text: 'Have food handlers undergone medical fitness examination?',
    type: 'yes_no',
    category: 'HEALTH',
    weight: 6,
    complianceAnswer: 'yes',
    helpText: 'Annual health checkup for food handlers mandatory. Keep medical certificates.',
    applicabilityCode: 'HEALTH',
  },
  {
    id: 'waste_disposal_arrangement',
    text: 'Do you have proper wet/dry waste segregation and disposal arrangements?',
    type: 'yes_no',
    category: 'HEALTH',
    weight: 6,
    complianceAnswer: 'yes',
    helpText: 'Waste segregation mandatory. Tie-up with authorised waste collector required.',
    applicabilityCode: 'HEALTH',
  },
];

// ============================================================================
// QUESTIONS - SPECIAL PERMITS (8 questions)
// ============================================================================

const SPECIAL_QUESTIONS: Question[] = [
  // Music/Entertainment
  {
    id: 'music_license_ppl',
    text: 'Do you have PPL (Phonographic Performance Limited) licence for playing recorded music?',
    type: 'yes_no',
    category: 'SPECIAL',
    weight: 6,
    complianceAnswer: 'yes',
    helpText: 'Playing commercial music without PPL licence is copyright infringement.',
    applicabilityCode: 'SPECIAL',
  },
  {
    id: 'music_license_iprs',
    text: 'Do you have IPRS (Indian Performing Right Society) licence?',
    type: 'yes_no',
    category: 'SPECIAL',
    weight: 5,
    complianceAnswer: 'yes',
    helpText: 'IPRS covers composers and lyricists. Required in addition to PPL.',
    applicabilityCode: 'SPECIAL',
  },
  {
    id: 'entertainment_permit',
    text: 'Do you have entertainment/performance permit for live music/DJ?',
    type: 'yes_no',
    category: 'SPECIAL',
    weight: 6,
    complianceAnswer: 'yes',
    helpText: 'Live entertainment requires permit from local police/entertainment authority.',
    applicabilityCode: 'SPECIAL',
  },
  {
    id: 'sound_decibel_compliance',
    text: 'Does your sound system comply with noise pollution norms (decibel limits)?',
    type: 'yes_no',
    category: 'SPECIAL',
    weight: 5,
    complianceAnswer: 'yes',
    helpText: 'Noise levels must be within 55-75 dB depending on zone and time.',
    applicabilityCode: 'SPECIAL',
  },
  // Late Night
  {
    id: 'late_night_permit',
    text: 'Do you have police permission for operating after 11 PM?',
    type: 'yes_no',
    category: 'SPECIAL',
    weight: 7,
    complianceAnswer: 'yes',
    helpText: 'Late night operation requires NOC from local police station.',
    applicabilityCode: 'SPECIAL',
  },
  {
    id: 'late_night_security',
    text: 'Do you have adequate security arrangements for late night operations?',
    type: 'yes_no',
    category: 'SPECIAL',
    weight: 5,
    complianceAnswer: 'yes',
    helpText: 'Security guards and CCTV often mandatory for late night establishments.',
    applicabilityCode: 'SPECIAL',
  },
  // Outdoor Seating
  {
    id: 'outdoor_seating_permit',
    text: 'Do you have municipal permit for outdoor/pavement seating?',
    type: 'yes_no',
    category: 'SPECIAL',
    weight: 6,
    complianceAnswer: 'yes',
    helpText: 'Outdoor seating on municipal land requires permit and may attract fees.',
    applicabilityCode: 'SPECIAL',
  },
  {
    id: 'outdoor_encroachment_free',
    text: 'Is your outdoor seating within permitted boundaries (no encroachment)?',
    type: 'yes_no',
    category: 'SPECIAL',
    weight: 6,
    complianceAnswer: 'yes',
    helpText: 'Encroachment on public space can lead to sealing and heavy fines.',
    applicabilityCode: 'SPECIAL',
  },
];

// ============================================================================
// COMBINE ALL QUESTIONS
// ============================================================================

export const ALL_FOOD_BUSINESS_QUESTIONS: Question[] = [
  ...FSSAI_QUESTIONS,
  ...GST_QUESTIONS,
  ...BUSINESS_REG_QUESTIONS,
  ...FIRE_SAFETY_QUESTIONS,
  ...LABOR_QUESTIONS,
  ...LIQUOR_QUESTIONS,
  ...HEALTH_QUESTIONS,
  ...SPECIAL_QUESTIONS,
];

// ============================================================================
// FILTER QUESTIONS BASED ON APPLICABILITY
// ============================================================================

export function filterQuestionsByApplicability(
  applicableCodes: string[]
): Question[] {
  return ALL_FOOD_BUSINESS_QUESTIONS.filter(q => 
    applicableCodes.includes(q.applicabilityCode)
  );
}

// ============================================================================
// SCORING FUNCTIONS
// ============================================================================

export function calculateFoodBusinessScore(
  questions: Question[],
  responses: Record<string, string>
): {
  overallScore: number;
  categoryScores: Record<string, { score: number; maxScore: number; percentage: number }>;
  complianceStatus: 'compliant' | 'needs_attention' | 'non_compliant';
  actionItems: Array<{
    questionId: string;
    category: string;
    text: string;
    priority: 'high' | 'medium' | 'low';
  }>;
} {
  const categoryScores: Record<string, { score: number; maxScore: number; percentage: number }> = {};
  const actionItems: Array<{
    questionId: string;
    category: string;
    text: string;
    priority: 'high' | 'medium' | 'low';
  }> = [];
  
  let totalScore = 0;
  let totalMaxScore = 0;
  
  questions.forEach(q => {
    const answer = responses[q.id];
    const category = q.category;
    
    // Initialize category if not exists
    if (!categoryScores[category]) {
      categoryScores[category] = { score: 0, maxScore: 0, percentage: 0 };
    }
    
    categoryScores[category].maxScore += q.weight;
    totalMaxScore += q.weight;
    
    // Calculate score based on answer
    let questionScore = 0;
    let isCompliant = false;
    
    if (q.type === 'yes_no') {
      if (q.complianceAnswer) {
        isCompliant = answer === q.complianceAnswer;
        questionScore = isCompliant ? q.weight : 0;
      } else {
        questionScore = q.weight;
        isCompliant = true;
      }
    } else if (q.type === 'multiple_choice' && q.options) {
      if (q.complianceAnswer) {
        isCompliant = answer === q.complianceAnswer;
        if (isCompliant) {
          questionScore = q.weight;
        } else {
          const optionIndex = q.options.indexOf(answer);
          const totalOptions = q.options.length;
          questionScore = Math.round(q.weight * (1 - (optionIndex / (totalOptions - 1))));
        }
      } else {
        questionScore = q.weight;
        isCompliant = true;
      }
    }
    
    categoryScores[category].score += questionScore;
    totalScore += questionScore;
    
    // Add to action items if non-compliant
    if (!isCompliant && q.weight >= 5) {
      actionItems.push({
        questionId: q.id,
        category: q.category,
        text: q.text,
        priority: q.weight >= 8 ? 'high' : q.weight >= 6 ? 'medium' : 'low',
      });
    }
  });
  
  // Calculate percentages
  Object.keys(categoryScores).forEach(cat => {
    const cs = categoryScores[cat];
    cs.percentage = cs.maxScore > 0 ? Math.round((cs.score / cs.maxScore) * 100) : 0;
  });
  
  const overallScore = totalMaxScore > 0 ? Math.round((totalScore / totalMaxScore) * 100) : 0;
  
  const complianceStatus: 'compliant' | 'needs_attention' | 'non_compliant' = 
    overallScore >= 80 ? 'compliant' :
    overallScore >= 60 ? 'needs_attention' : 'non_compliant';
  
  // Sort action items by priority
  actionItems.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
  
  return {
    overallScore,
    categoryScores,
    complianceStatus,
    actionItems,
  };
}

// ============================================================================
// QUESTION COUNT HELPER
// ============================================================================

export function getQuestionCountByCategory(questions: Question[]): Record<string, number> {
  const counts: Record<string, number> = {};
  questions.forEach(q => {
    counts[q.category] = (counts[q.category] || 0) + 1;
  });
  return counts;
}
