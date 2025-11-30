/**
 * Server-side Validation Schemas for ComplianceCheck
 * Uses Zod for runtime validation
 */

import { z } from 'zod';

// Indian phone number regex: +91 followed by 10 digits
const indianPhoneRegex = /^(\+91)?[6-9]\d{9}$/;

// GSTIN format: 15 characters alphanumeric
const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

// PAN format: XXXXX0000X
const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

// Valid industries
const INDUSTRIES = [
  'it_services',
  'manufacturing',
  'retail',
  'healthcare',
  'fintech',
  'ecommerce',
  'education',
  'hospitality',
  'logistics',
  'other'
] as const;

// Valid employee count ranges
const EMPLOYEE_COUNTS = [
  '1-10',
  '11-20',
  '21-50',
  '51-100',
  '101-300',
  '301-500',
  '500+'
] as const;

// Email validation with common domain check
const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Please enter a valid email address')
  .refine(
    (email) => {
      const domain = email.split('@')[1]?.toLowerCase();
      const blockedDomains = ['tempmail.com', 'throwaway.com', '10minutemail.com'];
      return !blockedDomains.includes(domain);
    },
    { message: 'Please use a valid business email address' }
  );

// Company details schema
export const companyDetailsSchema = z.object({
  companyName: z
    .string()
    .min(2, 'Company name must be at least 2 characters')
    .max(200, 'Company name must be less than 200 characters')
    .regex(/^[a-zA-Z0-9\s\.\-\(\)&]+$/, 'Company name contains invalid characters'),
  
  industry: z.enum(INDUSTRIES, { 
    message: 'Please select a valid industry' 
  }),
  
  employeeCount: z.enum(EMPLOYEE_COUNTS, { 
    message: 'Please select employee count range' 
  }),
  
  state: z.string().min(1, 'Please select your registered state'),
  
  email: emailSchema,
  
  phone: z
    .string()
    .optional()
    .refine(
      (val) => !val || indianPhoneRegex.test(val.replace(/\s/g, '')),
      { message: 'Please enter a valid Indian mobile number' }
    ),
  
  gstin: z
    .string()
    .optional()
    .refine(
      (val) => !val || gstinRegex.test(val.toUpperCase()),
      { message: 'Please enter a valid 15-character GSTIN' }
    ),
  
  pan: z
    .string()
    .optional()
    .refine(
      (val) => !val || panRegex.test(val.toUpperCase()),
      { message: 'Please enter a valid PAN (format: XXXXX0000X)' }
    ),
});

// Assessment response schema
export const assessmentResponseSchema = z.object({
  questionId: z.string().min(1, 'Question ID is required'),
  answer: z.union([
    z.boolean(),
    z.string().min(1, 'Answer is required'),
    z.array(z.string()),
  ]),
  answeredAt: z.string().datetime().optional(),
});

// Full assessment submission schema
export const assessmentSubmissionSchema = z.object({
  assessmentType: z.enum(['statutory_health', 'labour_code', 'dpdp'], {
    message: 'Invalid assessment type',
  }),
  
  companyDetails: companyDetailsSchema,
  
  responses: z
    .array(assessmentResponseSchema)
    .min(1, 'At least one response is required'),
  
  completedAt: z.string().datetime().optional(),
  
  consentGiven: z
    .boolean()
    .refine((val) => val === true, {
      message: 'You must consent to data processing to submit the assessment',
    }),
});

// Validation helper function
export async function validateAssessmentSubmission(data: unknown) {
  try {
    const validated = await assessmentSubmissionSchema.parseAsync(data);
    return { success: true, data: validated, errors: null };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.issues.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      return { success: false, data: null, errors };
    }
    return {
      success: false,
      data: null,
      errors: [{ field: 'unknown', message: 'Validation failed' }],
    };
  }
}

// Validate company details only (for step 0)
export async function validateCompanyDetails(data: unknown) {
  try {
    const validated = await companyDetailsSchema.parseAsync(data);
    return { success: true, data: validated, errors: null };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.issues.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      return { success: false, data: null, errors };
    }
    return {
      success: false,
      data: null,
      errors: [{ field: 'unknown', message: 'Validation failed' }],
    };
  }
}

// Indian states list for validation
export const INDIAN_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Delhi',
  'Jammu and Kashmir',
  'Ladakh',
  'Puducherry',
  'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Lakshadweep',
  'Andaman and Nicobar Islands',
] as const;

export type CompanyDetails = z.infer<typeof companyDetailsSchema>;
export type AssessmentSubmission = z.infer<typeof assessmentSubmissionSchema>;
