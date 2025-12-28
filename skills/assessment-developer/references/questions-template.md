# Questions File Template

Template for creating `src/lib/assessments/{type}-questions.ts`

## Question Interface

```typescript
export interface Question {
  id: string;
  text: string;
  type: 'yes_no' | 'multiple_choice' | 'text' | 'number';
  category: string;
  weight: number;
  complianceAnswer?: string;
  helpText?: string;
  options?: string[];
  conditionalFilter?: (details: UserDetails) => boolean;
}

interface UserDetails {
  fullName: string;
  email: string;
  phone: string;
  companyName: string;
  state: string;
  employeeCount: string;
  industry: string;
}

export interface CategoryInfo {
  name: string;
  description: string;
  icon?: string;
}
```

## Category Info Export

```typescript
export const CATEGORY_INFO: Record<string, CategoryInfo> = {
  'Registration': {
    name: 'Registration & Documentation',
    description: 'Statutory registrations and required documentation',
  },
  'Compliance': {
    name: 'Compliance Requirements',
    description: 'Ongoing compliance obligations',
  },
  'Records': {
    name: 'Record Keeping',
    description: 'Required registers and records',
  },
  'Reporting': {
    name: 'Reporting & Filing',
    description: 'Periodic returns and filings',
  },
};
```

## Questions Array

```typescript
export const NEW_ASSESSMENT_QUESTIONS: Question[] = [
  // ========================================
  // CATEGORY: Registration
  // ========================================
  {
    id: 'registration_completed',
    text: 'Have you completed the required statutory registration?',
    type: 'yes_no',
    category: 'Registration',
    weight: 10,
    complianceAnswer: 'yes',
    helpText: 'Registration is mandatory within 30 days of starting operations.',
  },
  {
    id: 'certificate_obtained',
    text: 'Do you have a valid registration certificate?',
    type: 'yes_no',
    category: 'Registration',
    weight: 8,
    complianceAnswer: 'yes',
  },

  // ========================================
  // CATEGORY: Compliance (with filtering)
  // ========================================
  {
    id: 'compliance_officer_appointed',
    text: 'Have you appointed a compliance officer?',
    type: 'yes_no',
    category: 'Compliance',
    weight: 7,
    complianceAnswer: 'yes',
    helpText: 'Required for organizations with 50+ employees.',
    conditionalFilter: (details) => {
      const count = parseInt(details.employeeCount.split('-')[0]) || 0;
      return count >= 50;
    },
  },
  {
    id: 'committee_formed',
    text: 'Have you formed the required statutory committee?',
    type: 'yes_no',
    category: 'Compliance',
    weight: 6,
    complianceAnswer: 'yes',
    conditionalFilter: (details) => {
      const count = parseInt(details.employeeCount.split('-')[0]) || 0;
      return count >= 100;
    },
  },

  // ========================================
  // CATEGORY: Records
  // ========================================
  {
    id: 'registers_maintained',
    text: 'Do you maintain all required registers?',
    type: 'yes_no',
    category: 'Records',
    weight: 5,
    complianceAnswer: 'yes',
    helpText: 'Includes attendance, wages, leave, and other statutory registers.',
  },

  // ========================================
  // CATEGORY: Reporting
  // ========================================
  {
    id: 'returns_filed',
    text: 'Are all periodic returns filed on time?',
    type: 'yes_no',
    category: 'Reporting',
    weight: 8,
    complianceAnswer: 'yes',
  },

  // ========================================
  // INFORMATIONAL QUESTION (no complianceAnswer)
  // These don't affect scoring
  // ========================================
  {
    id: 'previous_audit',
    text: 'Have you undergone a compliance audit in the last 12 months?',
    type: 'yes_no',
    category: 'Reporting',
    weight: 0, // Informational - doesn't affect score
    // No complianceAnswer = informational question
  },
];
```

## Filtering Helper Function

```typescript
/**
 * Filter questions based on user details
 */
export function filterQuestions(
  questions: Question[],
  userDetails: UserDetails
): Question[] {
  return questions.filter(q => {
    if (!q.conditionalFilter) return true;
    return q.conditionalFilter(userDetails);
  });
}
```

## Employee Count Parser

```typescript
/**
 * Parse employee count string to number
 * Handles: "1-9 employees", "10-19 employees", "500+ employees"
 */
export function parseEmployeeCount(countStr: string): number {
  const match = countStr.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

// Usage in conditionalFilter:
conditionalFilter: (details) => {
  const count = parseEmployeeCount(details.employeeCount);
  return count >= 20; // EPF threshold
}
```

## Industry-Specific Filtering

```typescript
// Manufacturing-specific question
{
  id: 'factory_license',
  text: 'Do you have a valid Factory License?',
  type: 'yes_no',
  category: 'Registration',
  weight: 10,
  complianceAnswer: 'yes',
  conditionalFilter: (details) => {
    return details.industry === 'Manufacturing';
  },
},

// IT/Services-specific question
{
  id: 'shop_establishment',
  text: 'Do you have a valid Shop & Establishment registration?',
  type: 'yes_no',
  category: 'Registration',
  weight: 8,
  complianceAnswer: 'yes',
  conditionalFilter: (details) => {
    return ['Information Technology', 'Professional Services', 'Retail'].includes(details.industry);
  },
},
```

## Common Thresholds Reference

```typescript
// Employee count thresholds for conditionalFilter
const THRESHOLDS = {
  ESI: 10,           // ESI applicable at 10+ employees
  GRATUITY: 10,      // Gratuity applicable at 10+ employees
  EPF: 20,           // EPF applicable at 20+ employees
  BONUS: 20,         // Bonus applicable at 20+ employees
  POSH: 10,          // ICC required at 10+ employees
  CRECHE: 50,        // Creche required at 50+ employees
  CANTEEN: 100,      // Canteen required at 100+ employees
  WELFARE_OFFICER: 250,  // Welfare Officer at 250+
  STANDING_ORDERS: 300,  // Standing Orders at 300+
};
```

## Multiple Choice Question Example

```typescript
{
  id: 'compliance_frequency',
  text: 'How frequently do you conduct compliance reviews?',
  type: 'multiple_choice',
  category: 'Compliance',
  weight: 5,
  options: [
    'Monthly',
    'Quarterly',
    'Annually',
    'Never',
  ],
  complianceAnswer: 'Monthly', // Best practice
},
```
