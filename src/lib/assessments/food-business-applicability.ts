/**
 * ComplianceCheck - Food Business Compliance Applicability Questions
 * 
 * These questions determine WHICH compliance requirements apply to a food business
 * based on business format, location, scale, alcohol service, and other factors.
 * 
 * Run these FIRST to filter the compliance assessment to relevant areas only.
 * 
 * Slug: food-business
 * Target: Restaurants, Cafés, QSRs, Cloud Kitchens, Caterers
 */

// ============================================================================
// TYPES
// ============================================================================

export type QuestionType = 'single_choice' | 'multiple_choice' | 'number' | 'yes_no' | 'text';

export interface ApplicabilityQuestion {
  id: string;
  text: string;
  type: QuestionType;
  options?: { value: string; label: string }[];
  helpText?: string;
  required: boolean;
  category: 'business_basics' | 'business_format' | 'scale_operations' | 'alcohol_service' | 'geographic' | 'workforce' | 'special_operations';
}

export interface ApplicabilityResult {
  code: string;
  name: string;
  applies: boolean;
  reason: string;
  threshold?: string;
  keyRequirements?: string[];
  estimatedCost?: string;
  timeline?: string;
  penaltyRisk?: string;
  questionCount: number;
}

// ============================================================================
// CONSTANTS - STATE CLASSIFICATIONS
// ============================================================================

export const PROHIBITION_STATES = ['Bihar', 'Gujarat', 'Lakshadweep', 'Mizoram', 'Nagaland'];
export const PARTIAL_PROHIBITION_STATES = ['Manipur']; // Imphal valley prohibited, hill districts allowed

export const ILP_REQUIRED_STATES = ['Arunachal Pradesh', 'Manipur', 'Mizoram', 'Nagaland'];

export const PROFESSIONAL_TAX_STATES = [
  'Andhra Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat',
  'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra',
  'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Puducherry',
  'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'West Bengal'
];

export const POLICE_LICENSE_STATES = ['Delhi', 'Karnataka', 'Maharashtra', 'Tamil Nadu', 'West Bengal'];

// ============================================================================
// APPLICABILITY QUESTIONS - 25 QUESTIONS ACROSS 7 CATEGORIES
// ============================================================================

export const FOOD_BUSINESS_APPLICABILITY_QUESTIONS: ApplicabilityQuestion[] = [
  // ---------------------------------------------------------------------------
  // SECTION 1: BUSINESS BASICS (4 questions)
  // ---------------------------------------------------------------------------
  {
    id: 'entity_type',
    text: 'What is your business entity type?',
    type: 'single_choice',
    category: 'business_basics',
    required: true,
    options: [
      { value: 'pvt_ltd', label: 'Private Limited Company' },
      { value: 'llp', label: 'Limited Liability Partnership (LLP)' },
      { value: 'partnership', label: 'Partnership Firm' },
      { value: 'proprietorship', label: 'Proprietorship / Sole Owner' },
      { value: 'opc', label: 'One Person Company (OPC)' },
      { value: 'trust', label: 'Trust / Society' },
    ],
    helpText: 'Entity type affects GST registration, compliance returns, and audit requirements.',
  },
  {
    id: 'business_stage',
    text: 'What is your current business stage?',
    type: 'single_choice',
    category: 'business_basics',
    required: true,
    options: [
      { value: 'planning', label: 'Planning / Pre-launch (no operations yet)' },
      { value: 'under_setup', label: 'Under setup (premises identified, licences in progress)' },
      { value: 'operational_new', label: 'Operational (less than 1 year)' },
      { value: 'operational_established', label: 'Operational (1-5 years)' },
      { value: 'operational_mature', label: 'Operational (5+ years)' },
    ],
    helpText: 'Helps prioritise immediate vs. future compliance requirements.',
  },
  {
    id: 'is_franchise',
    text: 'Is this a franchise or chain outlet?',
    type: 'single_choice',
    category: 'business_basics',
    required: true,
    options: [
      { value: 'independent', label: 'Independent / Own brand' },
      { value: 'franchise', label: 'Franchise of another brand' },
      { value: 'chain_owned', label: 'Company-owned chain outlet' },
      { value: 'foco', label: 'FOCO (Franchise Owned, Company Operated)' },
    ],
    helpText: 'Franchises may have additional compliance through franchisor agreements.',
  },
  {
    id: 'msme_registered',
    text: 'Is your business registered under MSME/Udyam?',
    type: 'yes_no',
    category: 'business_basics',
    required: true,
    helpText: 'MSME registration provides priority sector lending, subsidy access, and easier compliance.',
  },

  // ---------------------------------------------------------------------------
  // SECTION 2: BUSINESS FORMAT (3 questions)
  // ---------------------------------------------------------------------------
  {
    id: 'primary_business_format',
    text: 'What is your primary food business format?',
    type: 'single_choice',
    category: 'business_format',
    required: true,
    options: [
      { value: 'restaurant_dine_in', label: 'Restaurant (Dine-in only)' },
      { value: 'restaurant_delivery', label: 'Restaurant (Dine-in + Delivery)' },
      { value: 'qsr_fast_food', label: 'QSR / Fast Food outlet' },
      { value: 'cloud_kitchen', label: 'Cloud Kitchen / Dark Kitchen' },
      { value: 'food_truck', label: 'Food Truck / Mobile Food Unit' },
      { value: 'bakery', label: 'Bakery / Cake Shop' },
      { value: 'sweet_shop', label: 'Sweet Shop / Mithai Shop' },
      { value: 'cafe', label: 'Cafe / Coffee Shop' },
      { value: 'bar_restaurant', label: 'Bar & Restaurant / Pub' },
      { value: 'fine_dining', label: 'Fine Dining Restaurant' },
      { value: 'catering', label: 'Catering Services' },
      { value: 'canteen', label: 'Canteen / Cafeteria (B2B)' },
      { value: 'food_court_stall', label: 'Food Court Stall / Kiosk' },
      { value: 'ice_cream_parlor', label: 'Ice Cream Parlour / Dessert Shop' },
      { value: 'juice_smoothie', label: 'Juice Bar / Smoothie Shop' },
    ],
    helpText: 'Different formats have different licensing requirements. Cloud kitchens have fewer requirements than dine-in restaurants.',
  },
  {
    id: 'cuisine_type',
    text: 'What type of food do you primarily serve?',
    type: 'single_choice',
    category: 'business_format',
    required: true,
    options: [
      { value: 'vegetarian_only', label: 'Vegetarian only' },
      { value: 'non_veg', label: 'Non-vegetarian (includes meat/poultry)' },
      { value: 'seafood', label: 'Seafood / Fish' },
      { value: 'bakery_confectionery', label: 'Bakery & Confectionery' },
      { value: 'dairy_based', label: 'Dairy-based products (ice cream, cheese)' },
      { value: 'multi_cuisine', label: 'Multi-cuisine' },
    ],
    helpText: 'Non-veg and seafood have additional FSSAI requirements.',
  },
  {
    id: 'is_aggregator_listed',
    text: 'Are you listed on Swiggy, Zomato, or other food aggregators?',
    type: 'yes_no',
    category: 'business_format',
    required: true,
    helpText: 'Aggregator listing requires mandatory GST registration and 1% TCS deduction.',
  },

  // ---------------------------------------------------------------------------
  // SECTION 3: SCALE & OPERATIONS (5 questions)
  // ---------------------------------------------------------------------------
  {
    id: 'annual_turnover',
    text: 'What is your expected/actual annual turnover?',
    type: 'single_choice',
    category: 'scale_operations',
    required: true,
    options: [
      { value: 'below_12_lakh', label: 'Below Rs. 12 lakh' },
      { value: '12_to_20_lakh', label: 'Rs. 12 lakh to Rs. 20 lakh' },
      { value: '20_lakh_to_1_cr', label: 'Rs. 20 lakh to Rs. 1 crore' },
      { value: '1_cr_to_5_cr', label: 'Rs. 1 crore to Rs. 5 crore' },
      { value: '5_cr_to_20_cr', label: 'Rs. 5 crore to Rs. 20 crore' },
      { value: 'above_20_cr', label: 'Above Rs. 20 crore' },
    ],
    helpText: 'Turnover determines FSSAI licence type, GST registration requirement, and audit obligations.',
  },
  {
    id: 'employee_count',
    text: 'How many employees (including contract staff) do you have?',
    type: 'single_choice',
    category: 'scale_operations',
    required: true,
    options: [
      { value: '1_4', label: '1-4 employees' },
      { value: '5_9', label: '5-9 employees' },
      { value: '10_19', label: '10-19 employees' },
      { value: '20_49', label: '20-49 employees' },
      { value: '50_99', label: '50-99 employees' },
      { value: '100_plus', label: '100+ employees' },
    ],
    helpText: 'Employee count triggers EPF (20+), ESI (10+), and Gratuity (10+) requirements.',
  },
  {
    id: 'seating_capacity',
    text: 'What is your seating capacity (if applicable)?',
    type: 'single_choice',
    category: 'scale_operations',
    required: true,
    options: [
      { value: 'no_seating', label: 'No seating (takeaway/delivery only)' },
      { value: 'below_20', label: 'Below 20 seats' },
      { value: '20_50', label: '20-50 seats' },
      { value: '50_100', label: '50-100 seats' },
      { value: 'above_100', label: 'Above 100 seats' },
    ],
    helpText: 'Seating capacity affects Fire NOC requirements and Police Eating House licence.',
  },
  {
    id: 'premises_area',
    text: 'What is your total premises area?',
    type: 'single_choice',
    category: 'scale_operations',
    required: true,
    options: [
      { value: 'below_500', label: 'Below 500 sq ft' },
      { value: '500_1000', label: '500-1,000 sq ft' },
      { value: '1000_2500', label: '1,000-2,500 sq ft' },
      { value: '2500_5000', label: '2,500-5,000 sq ft' },
      { value: 'above_5000', label: 'Above 5,000 sq ft' },
    ],
    helpText: 'Larger premises have additional fire safety and building compliance requirements.',
  },
  {
    id: 'uses_lpg_gas',
    text: 'Do you use LPG gas cylinders or piped gas for cooking?',
    type: 'single_choice',
    category: 'scale_operations',
    required: true,
    options: [
      { value: 'lpg_cylinders', label: 'LPG cylinders' },
      { value: 'piped_gas', label: 'Piped natural gas (PNG)' },
      { value: 'electric_only', label: 'Electric cooking only (no gas)' },
      { value: 'both', label: 'Both LPG and electric' },
    ],
    helpText: 'LPG storage above certain limits requires additional safety permits.',
  },

  // ---------------------------------------------------------------------------
  // SECTION 4: ALCOHOL SERVICE (3 questions)
  // ---------------------------------------------------------------------------
  {
    id: 'serves_alcohol',
    text: 'Do you serve or plan to serve alcoholic beverages?',
    type: 'yes_no',
    category: 'alcohol_service',
    required: true,
    helpText: 'Alcohol service requires State Excise licence with significant compliance obligations.',
  },
  {
    id: 'alcohol_type',
    text: 'What type of alcohol do you serve?',
    type: 'single_choice',
    category: 'alcohol_service',
    required: false,
    options: [
      { value: 'beer_wine_only', label: 'Beer and wine only' },
      { value: 'full_bar', label: 'Full bar (IMFL, beer, wine)' },
      { value: 'foreign_liquor', label: 'Foreign liquor licence' },
      { value: 'toddy_country', label: 'Toddy / Country liquor' },
    ],
    helpText: 'Different licence types have different fees and requirements.',
  },
  {
    id: 'alcohol_timing',
    text: 'What are your alcohol service hours?',
    type: 'single_choice',
    category: 'alcohol_service',
    required: false,
    options: [
      { value: 'standard', label: 'Standard hours (till 11 PM)' },
      { value: 'extended', label: 'Extended hours (till 1 AM)' },
      { value: 'late_night', label: 'Late night permit (after 1 AM)' },
    ],
    helpText: 'Extended hours require additional permits and higher fees.',
  },

  // ---------------------------------------------------------------------------
  // SECTION 5: GEOGRAPHIC (3 questions)
  // ---------------------------------------------------------------------------
  {
    id: 'primary_state',
    text: 'In which state is your food business located?',
    type: 'single_choice',
    category: 'geographic',
    required: true,
    options: [
      { value: 'Andaman and Nicobar Islands', label: 'Andaman and Nicobar Islands' },
      { value: 'Andhra Pradesh', label: 'Andhra Pradesh' },
      { value: 'Arunachal Pradesh', label: 'Arunachal Pradesh' },
      { value: 'Assam', label: 'Assam' },
      { value: 'Bihar', label: 'Bihar' },
      { value: 'Chandigarh', label: 'Chandigarh' },
      { value: 'Chhattisgarh', label: 'Chhattisgarh' },
      { value: 'Dadra and Nagar Haveli and Daman and Diu', label: 'Dadra and Nagar Haveli and Daman and Diu' },
      { value: 'Delhi', label: 'Delhi' },
      { value: 'Goa', label: 'Goa' },
      { value: 'Gujarat', label: 'Gujarat' },
      { value: 'Haryana', label: 'Haryana' },
      { value: 'Himachal Pradesh', label: 'Himachal Pradesh' },
      { value: 'Jammu and Kashmir', label: 'Jammu and Kashmir' },
      { value: 'Jharkhand', label: 'Jharkhand' },
      { value: 'Karnataka', label: 'Karnataka' },
      { value: 'Kerala', label: 'Kerala' },
      { value: 'Ladakh', label: 'Ladakh' },
      { value: 'Lakshadweep', label: 'Lakshadweep' },
      { value: 'Madhya Pradesh', label: 'Madhya Pradesh' },
      { value: 'Maharashtra', label: 'Maharashtra' },
      { value: 'Manipur', label: 'Manipur' },
      { value: 'Meghalaya', label: 'Meghalaya' },
      { value: 'Mizoram', label: 'Mizoram' },
      { value: 'Nagaland', label: 'Nagaland' },
      { value: 'Odisha', label: 'Odisha' },
      { value: 'Puducherry', label: 'Puducherry' },
      { value: 'Punjab', label: 'Punjab' },
      { value: 'Rajasthan', label: 'Rajasthan' },
      { value: 'Sikkim', label: 'Sikkim' },
      { value: 'Tamil Nadu', label: 'Tamil Nadu' },
      { value: 'Telangana', label: 'Telangana' },
      { value: 'Tripura', label: 'Tripura' },
      { value: 'Uttar Pradesh', label: 'Uttar Pradesh' },
      { value: 'Uttarakhand', label: 'Uttarakhand' },
      { value: 'West Bengal', label: 'West Bengal' },
    ],
    helpText: 'State determines Professional Tax, Excise rules, and specific local compliance.',
  },
  {
    id: 'city_type',
    text: 'What type of area is your business located in?',
    type: 'single_choice',
    category: 'geographic',
    required: true,
    options: [
      { value: 'metro', label: 'Metro city (Delhi, Mumbai, Chennai, Kolkata, Bangalore, Hyderabad)' },
      { value: 'tier1', label: 'Tier 1 city (State capital / Large city)' },
      { value: 'tier2', label: 'Tier 2 city (District headquarters)' },
      { value: 'tier3', label: 'Tier 3 / Semi-urban' },
      { value: 'rural', label: 'Rural area' },
      { value: 'industrial', label: 'Industrial zone / SEZ' },
      { value: 'tourist', label: 'Tourist / Heritage area' },
    ],
    helpText: 'Metro cities often have stricter enforcement and additional permits.',
  },
  {
    id: 'near_sensitive_area',
    text: 'Is your premises near any restricted/sensitive areas?',
    type: 'single_choice',
    category: 'geographic',
    required: true,
    options: [
      { value: 'none', label: 'No restricted areas nearby' },
      { value: 'school_college', label: 'Near school/college (within 100m)' },
      { value: 'religious', label: 'Near religious place (within 100m)' },
      { value: 'hospital', label: 'Near hospital (within 100m)' },
      { value: 'highway', label: 'On national/state highway' },
      { value: 'multiple', label: 'Multiple sensitive areas nearby' },
    ],
    helpText: 'Proximity to schools, religious places affects alcohol licence eligibility.',
  },

  // ---------------------------------------------------------------------------
  // SECTION 6: WORKFORCE (3 questions)
  // ---------------------------------------------------------------------------
  {
    id: 'employs_women',
    text: 'Do you employ women workers?',
    type: 'yes_no',
    category: 'workforce',
    required: true,
    helpText: 'Employing 10+ women requires Internal Complaints Committee under POSH Act.',
  },
  {
    id: 'women_count',
    text: 'How many women employees do you have?',
    type: 'single_choice',
    category: 'workforce',
    required: false,
    options: [
      { value: '0', label: 'None' },
      { value: '1_9', label: '1-9 women employees' },
      { value: '10_plus', label: '10 or more women employees' },
    ],
    helpText: '10+ women employees triggers mandatory ICC constitution.',
  },
  {
    id: 'contract_workers',
    text: 'Do you engage contract workers or outsourced staff?',
    type: 'yes_no',
    category: 'workforce',
    required: true,
    helpText: 'Contract workers (20+) require licence under Contract Labour Act.',
  },

  // ---------------------------------------------------------------------------
  // SECTION 7: SPECIAL OPERATIONS (4 questions)
  // ---------------------------------------------------------------------------
  {
    id: 'has_outdoor_seating',
    text: 'Do you have outdoor seating or pavement dining?',
    type: 'yes_no',
    category: 'special_operations',
    required: true,
    helpText: 'Outdoor seating requires additional municipal permits.',
  },
  {
    id: 'has_live_entertainment',
    text: 'Do you have live music, DJ, or entertainment?',
    type: 'yes_no',
    category: 'special_operations',
    required: true,
    helpText: 'Live entertainment requires PPL/IPRS music licence and entertainment permit.',
  },
  {
    id: 'late_night_operations',
    text: 'Do you operate past 11 PM?',
    type: 'yes_no',
    category: 'special_operations',
    required: true,
    helpText: 'Late night operations require special permit from local police.',
  },
  {
    id: 'home_delivery',
    text: 'Do you offer home delivery service?',
    type: 'single_choice',
    category: 'special_operations',
    required: true,
    options: [
      { value: 'no_delivery', label: 'No delivery service' },
      { value: 'own_delivery', label: 'Own delivery fleet' },
      { value: 'aggregator_only', label: 'Only through Swiggy/Zomato' },
      { value: 'both', label: 'Both own fleet and aggregators' },
    ],
    helpText: 'Own delivery fleet has motor vehicle and insurance compliance.',
  },
];

// ============================================================================
// COMPLIANCE AREA DEFINITIONS WITH QUESTION COUNTS
// ============================================================================

export interface ComplianceArea {
  code: string;
  name: string;
  description: string;
  baseQuestionCount: number;
  icon: string;
}

export const COMPLIANCE_AREAS: ComplianceArea[] = [
  {
    code: 'FSSAI',
    name: 'Food Safety (FSSAI)',
    description: 'FSSAI licence, food handler training, hygiene rating, and food safety records',
    baseQuestionCount: 8,
    icon: '🍽️',
  },
  {
    code: 'GST',
    name: 'GST & Taxation',
    description: 'GST registration, returns, e-invoicing, and aggregator TCS compliance',
    baseQuestionCount: 5,
    icon: '📋',
  },
  {
    code: 'BUSINESS_REG',
    name: 'Business Registration',
    description: 'Shop & Establishment Act, Trade Licence, and municipal registrations',
    baseQuestionCount: 6,
    icon: '🏪',
  },
  {
    code: 'FIRE_SAFETY',
    name: 'Fire Safety',
    description: 'Fire NOC, fire equipment, emergency exits, and fire drills',
    baseQuestionCount: 8,
    icon: '🔥',
  },
  {
    code: 'LABOR',
    name: 'Labour Compliance',
    description: 'EPF, ESI, Gratuity, Professional Tax, minimum wages, and POSH',
    baseQuestionCount: 15,
    icon: '👷',
  },
  {
    code: 'LIQUOR',
    name: 'Liquor & Excise',
    description: 'State excise licence, permit conditions, dry days, and stock registers',
    baseQuestionCount: 12,
    icon: '🍷',
  },
  {
    code: 'HEALTH',
    name: 'Health & Hygiene',
    description: 'Health trade licence, pest control, water testing, and waste disposal',
    baseQuestionCount: 5,
    icon: '🏥',
  },
  {
    code: 'SPECIAL',
    name: 'Special Permits',
    description: 'Music licence, late night permit, outdoor seating, and signage',
    baseQuestionCount: 8,
    icon: '🎵',
  },
];

// ============================================================================
// APPLICABILITY ENGINE
// ============================================================================

export interface ApplicabilityResponse {
  [questionId: string]: string;
}

export function calculateApplicability(responses: ApplicabilityResponse): ApplicabilityResult[] {
  const results: ApplicabilityResult[] = [];
  
  // Parse responses
  const turnover = responses.annual_turnover || 'below_12_lakh';
  const employeeCount = parseEmployeeCount(responses.employee_count || '1_4');
  const servesAlcohol = responses.serves_alcohol === 'yes';
  const primaryState = responses.primary_state || '';
  const seatingCapacity = responses.seating_capacity || 'no_seating';
  const hasOutdoorSeating = responses.has_outdoor_seating === 'yes';
  const hasLiveEntertainment = responses.has_live_entertainment === 'yes';
  const lateNightOps = responses.late_night_operations === 'yes';
  const isAggregatorListed = responses.is_aggregator_listed === 'yes';
  const employsWomen = responses.employs_women === 'yes';
  const womenCount = responses.women_count || '0';
  const premisesArea = responses.premises_area || 'below_500';
  
  // ---------------------------------------------------------------------------
  // FSSAI (Always applies)
  // ---------------------------------------------------------------------------
  const fssaiType = getFssaiType(turnover);
  results.push({
    code: 'FSSAI',
    name: 'Food Safety (FSSAI)',
    applies: true,
    reason: `${fssaiType} required based on Rs. ${getTurnoverLabel(turnover)} turnover.`,
    threshold: 'All food businesses',
    keyRequirements: [
      `${fssaiType} on FoSCoS portal`,
      'FOSTAC trained food safety supervisor',
      'Hygiene rating (recommended)',
      'Daily food safety records',
    ],
    estimatedCost: fssaiType === 'Basic Registration' ? 'Rs. 100/year' : 'Rs. 2,000-5,000/year',
    timeline: '7-60 days',
    penaltyRisk: 'Rs. 5-10 lakh fine + imprisonment',
    questionCount: 8,
  });

  // ---------------------------------------------------------------------------
  // GST REGISTRATION
  // ---------------------------------------------------------------------------
  const gstRequired = isGstRequired(turnover, isAggregatorListed);
  results.push({
    code: 'GST',
    name: 'GST & Taxation',
    applies: gstRequired,
    reason: gstRequired 
      ? isAggregatorListed 
        ? 'Mandatory due to aggregator listing (Swiggy/Zomato).' 
        : `Mandatory for turnover above Rs. 20 lakh (Rs. 40 lakh for goods).`
      : 'Optional below Rs. 20 lakh turnover without aggregator listing.',
    threshold: 'Rs. 20 lakh turnover OR aggregator listing',
    keyRequirements: gstRequired ? [
      'GSTIN registration',
      'Monthly GSTR-1 and GSTR-3B filing',
      'E-invoicing (if turnover > Rs. 5 Cr)',
      '1% TCS on aggregator orders',
    ] : [],
    estimatedCost: gstRequired ? 'Rs. 2,000-5,000 (registration)' : 'N/A',
    timeline: '3-7 days',
    penaltyRisk: gstRequired ? 'Rs. 10,000 or 10% of tax due' : 'N/A',
    questionCount: gstRequired ? 5 : 0,
  });

  // ---------------------------------------------------------------------------
  // BUSINESS REGISTRATION (Always applies)
  // ---------------------------------------------------------------------------
  results.push({
    code: 'BUSINESS_REG',
    name: 'Business Registration',
    applies: true,
    reason: 'Shop & Establishment Act and Trade Licence mandatory for all food outlets.',
    threshold: 'All establishments with employees',
    keyRequirements: [
      'Shop & Establishment registration',
      'Trade Licence from municipal corporation',
      'Signage/hoarding permit',
      'Health Trade Licence',
    ],
    estimatedCost: 'Rs. 1,000-10,000',
    timeline: '7-30 days',
    penaltyRisk: 'Rs. 5,000-50,000 fine + closure',
    questionCount: 6,
  });

  // ---------------------------------------------------------------------------
  // FIRE SAFETY
  // ---------------------------------------------------------------------------
  const fireNocRequired = isFireNocRequired(seatingCapacity, premisesArea, servesAlcohol);
  results.push({
    code: 'FIRE_SAFETY',
    name: 'Fire Safety',
    applies: fireNocRequired,
    reason: fireNocRequired
      ? 'Fire NOC required for restaurants with seating, larger premises, or alcohol service.'
      : 'Fire NOC optional for small takeaway-only outlets.',
    threshold: '20+ seats OR 500+ sq ft OR alcohol service',
    keyRequirements: fireNocRequired ? [
      'Fire NOC from Fire Department',
      'Fire extinguishers (ABC type)',
      'Emergency exit signage',
      'Annual fire safety audit',
      'Staff fire safety training',
    ] : [],
    estimatedCost: fireNocRequired ? 'Rs. 5,000-25,000' : 'N/A',
    timeline: '15-45 days',
    penaltyRisk: fireNocRequired ? 'Closure + criminal liability' : 'N/A',
    questionCount: fireNocRequired ? 8 : 0,
  });

  // ---------------------------------------------------------------------------
  // LABOUR COMPLIANCE
  // ---------------------------------------------------------------------------
  const epfApplies = employeeCount >= 20;
  const esiApplies = employeeCount >= 10;
  const gratuityApplies = employeeCount >= 10;
  const ptApplies = PROFESSIONAL_TAX_STATES.includes(primaryState);
  const poshApplies = employsWomen && (womenCount === '10_plus' || employeeCount >= 10);
  
  const laborQuestionCount = calculateLaborQuestions(epfApplies, esiApplies, gratuityApplies, ptApplies, poshApplies);
  
  results.push({
    code: 'LABOR',
    name: 'Labour Compliance',
    applies: employeeCount >= 5,
    reason: employeeCount >= 5
      ? `Labour compliance required with ${employeeCount} employees. ${epfApplies ? 'EPF applicable. ' : ''}${esiApplies ? 'ESI applicable. ' : ''}${ptApplies ? 'Professional Tax applicable.' : ''}`
      : 'Limited labour compliance with fewer than 5 employees.',
    threshold: 'EPF: 20+ | ESI: 10+ | Gratuity: 10+ | PT: State-specific',
    keyRequirements: [
      ...(epfApplies ? ['EPF registration and 12% contribution'] : []),
      ...(esiApplies ? ['ESI registration (employees earning < Rs. 21,000)'] : []),
      ...(gratuityApplies ? ['Gratuity provision (4.81% of basic)'] : []),
      ...(ptApplies ? ['Professional Tax registration and deduction'] : []),
      ...(poshApplies ? ['POSH Internal Complaints Committee'] : []),
      'Minimum wages compliance',
    ],
    estimatedCost: 'Ongoing payroll cost',
    timeline: 'Within 30 days of threshold',
    penaltyRisk: epfApplies || esiApplies ? 'Up to 100% damages on delayed payments' : 'Rs. 5,000-20,000',
    questionCount: laborQuestionCount,
  });

  // ---------------------------------------------------------------------------
  // LIQUOR & EXCISE
  // ---------------------------------------------------------------------------
  const isProhibitionState = PROHIBITION_STATES.includes(primaryState);
  results.push({
    code: 'LIQUOR',
    name: 'Liquor & Excise',
    applies: servesAlcohol && !isProhibitionState,
    reason: servesAlcohol
      ? isProhibitionState
        ? `ALCOHOL PROHIBITED in ${primaryState}. Cannot obtain liquor licence.`
        : 'State Excise licence required for alcohol service.'
      : 'Not applicable - no alcohol service.',
    threshold: 'Any alcohol service',
    keyRequirements: servesAlcohol && !isProhibitionState ? [
      'State Excise licence (L-1/L-2/FL-3 etc.)',
      'Distance norms compliance (100m from schools/religious places)',
      'Stock register maintenance',
      'Dry day compliance',
      'Serving hours restrictions',
    ] : [],
    estimatedCost: servesAlcohol && !isProhibitionState ? 'Rs. 1-15 lakh (varies by state)' : 'N/A',
    timeline: '60-180 days',
    penaltyRisk: servesAlcohol && !isProhibitionState ? 'Rs. 50,000-5 lakh + imprisonment' : 'N/A',
    questionCount: servesAlcohol && !isProhibitionState ? 12 : 0,
  });

  // ---------------------------------------------------------------------------
  // HEALTH & HYGIENE (Always applies)
  // ---------------------------------------------------------------------------
  results.push({
    code: 'HEALTH',
    name: 'Health & Hygiene',
    applies: true,
    reason: 'Health trade licence and sanitation compliance mandatory for all food businesses.',
    threshold: 'All food establishments',
    keyRequirements: [
      'Health Trade Licence from municipal health dept',
      'Pest control contract',
      'Water quality testing',
      'Staff health checkups',
      'Waste disposal arrangement',
    ],
    estimatedCost: 'Rs. 1,000-5,000',
    timeline: '7-30 days',
    penaltyRisk: 'Closure for health code violations',
    questionCount: 5,
  });

  // ---------------------------------------------------------------------------
  // SPECIAL PERMITS
  // ---------------------------------------------------------------------------
  const specialPermitsApply = hasOutdoorSeating || hasLiveEntertainment || lateNightOps;
  const specialQuestionCount = calculateSpecialQuestions(hasOutdoorSeating, hasLiveEntertainment, lateNightOps);
  
  results.push({
    code: 'SPECIAL',
    name: 'Special Permits',
    applies: specialPermitsApply,
    reason: specialPermitsApply
      ? `Special permits required for: ${[
          hasOutdoorSeating ? 'outdoor seating' : '',
          hasLiveEntertainment ? 'live entertainment' : '',
          lateNightOps ? 'late night operations' : '',
        ].filter(Boolean).join(', ')}.`
      : 'No special permits required based on your operations.',
    threshold: 'Outdoor seating / Live entertainment / Late night',
    keyRequirements: [
      ...(hasOutdoorSeating ? ['Municipal outdoor seating permit'] : []),
      ...(hasLiveEntertainment ? ['PPL/IPRS music licence', 'Entertainment permit'] : []),
      ...(lateNightOps ? ['Police permission for late night'] : []),
    ],
    estimatedCost: specialPermitsApply ? 'Rs. 5,000-50,000' : 'N/A',
    timeline: '15-60 days',
    penaltyRisk: specialPermitsApply ? 'Rs. 10,000-1 lakh + permit revocation' : 'N/A',
    questionCount: specialQuestionCount,
  });

  return results;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function parseEmployeeCount(countStr: string): number {
  const map: Record<string, number> = {
    '1_4': 4,
    '5_9': 9,
    '10_19': 19,
    '20_49': 49,
    '50_99': 99,
    '100_plus': 100,
  };
  return map[countStr] || 0;
}

function getFssaiType(turnover: string): string {
  if (turnover === 'below_12_lakh') return 'Basic Registration';
  if (['12_to_20_lakh', '20_lakh_to_1_cr', '1_cr_to_5_cr', '5_cr_to_20_cr'].includes(turnover)) {
    return 'State Licence';
  }
  return 'Central Licence';
}

function getTurnoverLabel(turnover: string): string {
  const labels: Record<string, string> = {
    'below_12_lakh': '< 12 lakh',
    '12_to_20_lakh': '12-20 lakh',
    '20_lakh_to_1_cr': '20L - 1 Cr',
    '1_cr_to_5_cr': '1-5 Cr',
    '5_cr_to_20_cr': '5-20 Cr',
    'above_20_cr': '> 20 Cr',
  };
  return labels[turnover] || turnover;
}

function isGstRequired(turnover: string, isAggregator: boolean): boolean {
  if (isAggregator) return true;
  return !['below_12_lakh', '12_to_20_lakh'].includes(turnover);
}

function isFireNocRequired(seating: string, area: string, alcohol: boolean): boolean {
  if (alcohol) return true;
  if (seating !== 'no_seating' && seating !== 'below_20') return true;
  if (['1000_2500', '2500_5000', 'above_5000'].includes(area)) return true;
  return false;
}

function calculateLaborQuestions(epf: boolean, esi: boolean, gratuity: boolean, pt: boolean, posh: boolean): number {
  let count = 3; // Base minimum wages questions
  if (epf) count += 4;
  if (esi) count += 3;
  if (gratuity) count += 2;
  if (pt) count += 2;
  if (posh) count += 3;
  return count;
}

function calculateSpecialQuestions(outdoor: boolean, entertainment: boolean, lateNight: boolean): number {
  let count = 0;
  if (outdoor) count += 2;
  if (entertainment) count += 4;
  if (lateNight) count += 2;
  return count;
}

// ============================================================================
// SUMMARY GENERATOR
// ============================================================================

export function generateApplicabilitySummary(results: ApplicabilityResult[]): {
  totalQuestions: number;
  applicableAreas: ApplicabilityResult[];
  notApplicableAreas: ApplicabilityResult[];
  estimatedTime: string;
  criticalAreas: string[];
} {
  const applicableAreas = results.filter(r => r.applies);
  const notApplicableAreas = results.filter(r => !r.applies);
  const totalQuestions = applicableAreas.reduce((sum, r) => sum + r.questionCount, 0);
  
  // Estimate 30 seconds per question
  const minutes = Math.ceil((totalQuestions * 30) / 60);
  const estimatedTime = minutes < 5 ? '3-5 minutes' : `${minutes - 2}-${minutes + 2} minutes`;
  
  const criticalAreas = applicableAreas
    .filter(r => r.penaltyRisk && r.penaltyRisk.includes('lakh'))
    .map(r => r.name);
  
  return {
    totalQuestions,
    applicableAreas,
    notApplicableAreas,
    estimatedTime,
    criticalAreas,
  };
}

// ============================================================================
// BASE QUESTION COUNTS (ALL AREAS)
// ============================================================================

export const TOTAL_POSSIBLE_QUESTIONS = COMPLIANCE_AREAS.reduce(
  (sum, area) => sum + area.baseQuestionCount, 0
); // 67 questions total

export function getBaseQuestionCounts(): Record<string, number> {
  return COMPLIANCE_AREAS.reduce((acc, area) => {
    acc[area.code] = area.baseQuestionCount;
    return acc;
  }, {} as Record<string, number>);
}
