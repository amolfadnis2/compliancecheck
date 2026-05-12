export const CATEGORIES = [
  { slug: 'labour-codes', label: 'Labour Codes', color: 'blue' },
  { slug: 'dpdp-act', label: 'DPDP Act', color: 'purple' },
  { slug: 'posh', label: 'POSH', color: 'pink' },
  { slug: 'gst', label: 'GST', color: 'green' },
  { slug: 'state-wise', label: 'State-wise', color: 'orange' },
  { slug: 'industry-guides', label: 'Industry Guides', color: 'teal' },
  { slug: 'calculators', label: 'Calculator Guides', color: 'indigo' },
] as const;

export type CategorySlug = (typeof CATEGORIES)[number]['slug'];

export const POSTS_PER_PAGE = 12;
export const BLOG_URL = 'https://compliancecheck.co.in/blog';
export const BASE_URL = 'https://compliancecheck.co.in';

export const CATEGORY_COLOR_MAP: Record<string, { bg: string; text: string; border: string }> = {
  blue:   { bg: 'bg-blue-100 dark:bg-blue-900/30',   text: 'text-blue-700 dark:text-blue-300',   border: 'border-blue-200 dark:border-blue-800' },
  purple: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-300', border: 'border-purple-200 dark:border-purple-800' },
  pink:   { bg: 'bg-pink-100 dark:bg-pink-900/30',   text: 'text-pink-700 dark:text-pink-300',   border: 'border-pink-200 dark:border-pink-800' },
  green:  { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-300', border: 'border-green-200 dark:border-green-800' },
  orange: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-300', border: 'border-orange-200 dark:border-orange-800' },
  teal:   { bg: 'bg-teal-100 dark:bg-teal-900/30',   text: 'text-teal-700 dark:text-teal-300',   border: 'border-teal-200 dark:border-teal-800' },
  indigo: { bg: 'bg-indigo-100 dark:bg-indigo-900/30', text: 'text-indigo-700 dark:text-indigo-300', border: 'border-indigo-200 dark:border-indigo-800' },
};
