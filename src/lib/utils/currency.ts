/**
 * Currency Utilities for ComplianceCheck
 * Handles proper Rupee (₹) symbol encoding and formatting
 */

// Unicode code point for Indian Rupee symbol
export const RUPEE_SYMBOL = '\u20B9';  // ₹

// HTML entity (use in HTML strings)
export const RUPEE_HTML_ENTITY = '&#8377;';

// Alternative representations
export const RUPEE_ALT = {
  unicode: '\u20B9',
  htmlEntity: '&#8377;',
  htmlName: '&rupee;',
  cssContent: '\\20B9',
};

/**
 * Format amount as Indian Rupees with proper symbol
 */
export function formatINR(
  amount: number,
  options: {
    showSymbol?: boolean;
    showDecimals?: boolean;
    useIndianNumbering?: boolean;
  } = {}
): string {
  const { 
    showSymbol = true, 
    showDecimals = false, 
    useIndianNumbering = true 
  } = options;

  let formatted: string;
  
  if (useIndianNumbering) {
    formatted = new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: showDecimals ? 2 : 0,
      maximumFractionDigits: showDecimals ? 2 : 0,
    }).format(amount);
  } else {
    formatted = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: showDecimals ? 2 : 0,
      maximumFractionDigits: showDecimals ? 2 : 0,
    }).format(amount);
  }

  return showSymbol ? `${RUPEE_SYMBOL}${formatted}` : formatted;
}

/**
 * Convert paise to rupees and format
 */
export function formatPaise(paise: number): string {
  const rupees = paise / 100;
  return formatINR(rupees, { showDecimals: paise % 100 !== 0 });
}


/**
 * Product pricing with proper Rupee formatting
 */
export const PRODUCT_PRICING = {
  statutory_health: {
    name: 'Statutory Health Check',
    basePrice: 847,
    gst: 152,
    total: 999,
    totalPaise: 99900,
    formatted: `${RUPEE_SYMBOL}999`,
    formattedWithGST: `${RUPEE_SYMBOL}999 (incl. 18% GST)`,
  },
  labour_code: {
    name: 'Labour Code Readiness',
    basePrice: 1694,
    gst: 305,
    total: 1999,
    totalPaise: 199900,
    formatted: `${RUPEE_SYMBOL}1,999`,
    formattedWithGST: `${RUPEE_SYMBOL}1,999 (incl. 18% GST)`,
  },
  dpdp: {
    name: 'DPDP Gap Assessment',
    basePrice: 2118,
    gst: 381,
    total: 2499,
    totalPaise: 249900,
    formatted: `${RUPEE_SYMBOL}2,499`,
    formattedWithGST: `${RUPEE_SYMBOL}2,499 (incl. 18% GST)`,
  },
} as const;

/**
 * Validate that a string contains properly encoded Rupee symbol
 */
export function hasValidRupeeSymbol(str: string): boolean {
  if (str.includes('\u20B9')) return true;
  
  const misencoded = [
    'â‚¹',
    '₹',
    '\u00E2\u0082\u00B9',
  ];
  
  return !misencoded.some(bad => str.includes(bad));
}

/**
 * Fix misencoded Rupee symbols in a string
 */
export function fixRupeeEncoding(str: string): string {
  return str
    .replace(/â‚¹/g, RUPEE_SYMBOL)
    .replace(/&#8377;/g, RUPEE_SYMBOL)
    .replace(/\u00E2\u0082\u00B9/g, RUPEE_SYMBOL);
}
