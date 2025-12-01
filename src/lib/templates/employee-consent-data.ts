/**
 * Employee Data Consent Form - Template Data
 * DPDP Act 2023 Compliant
 */

export interface DataCategory {
  id: string
  label: string
  description: string
  examples: string[]
}

export interface ProcessingPurpose {
  id: string
  label: string
  description: string
}

export const DATA_CATEGORIES: DataCategory[] = [
  {
    id: 'personal',
    label: 'Personal Information',
    description: 'Basic identification and contact details',
    examples: [
      'Full name, date of birth, gender',
      'Contact number, email address',
      'Permanent and correspondence address',
      'Emergency contact details',
      'Photograph'
    ]
  },
  {
    id: 'identity',
    label: 'Identity Documents',
    description: 'Government-issued identification proof',
    examples: [
      'Aadhaar number',
      'PAN card number',
      'Passport details',
      'Driving license',
      'Voter ID'
    ]
  },
  {
    id: 'financial',
    label: 'Financial Information',
    description: 'Bank and salary-related data',
    examples: [
      'Bank account details (for salary credit)',
      'IFSC code',
      'PF account number',
      'ESI number',
      'Previous salary details'
    ]
  },
  {
    id: 'employment',
    label: 'Employment History',
    description: 'Past employment and reference information',
    examples: [
      'Previous employer details',
      'Experience letters',
      'Relieving letters',
      'Reference contact information',
      'Educational qualifications'
    ]
  },
  {
    id: 'health',
    label: 'Health Information',
    description: 'Medical and health-related data',
    examples: [
      'Pre-employment medical test results',
      'Health insurance details',
      'Disability status (if voluntarily disclosed)',
      'Medical leave records',
      'Vaccination status'
    ]
  },
  {
    id: 'biometric',
    label: 'Biometric Data',
    description: 'Unique biological identifiers',
    examples: [
      'Fingerprints for attendance system',
      'Facial recognition data',
      'Retina scan (if applicable)',
      'Voice samples (if applicable)'
    ]
  },
  {
    id: 'performance',
    label: 'Performance Data',
    description: 'Work performance and conduct records',
    examples: [
      'Performance appraisal records',
      'Training completion certificates',
      'Disciplinary records',
      'Attendance and leave records',
      'Productivity metrics'
    ]
  }
]

export const PROCESSING_PURPOSES: ProcessingPurpose[] = [
  {
    id: 'employment',
    label: 'Employment Contract Administration',
    description: 'Managing the employment relationship and contractual obligations'
  },
  {
    id: 'payroll',
    label: 'Payroll and Salary Processing',
    description: 'Processing monthly salary, deductions, and reimbursements'
  },
  {
    id: 'statutory',
    label: 'Statutory Compliance',
    description: 'Complying with EPF, ESI, Income Tax, Professional Tax, and other legal requirements'
  },
  {
    id: 'benefits',
    label: 'Benefits Administration',
    description: 'Managing health insurance, gratuity, leave encashment, and other employee benefits'
  },
  {
    id: 'attendance',
    label: 'Attendance and Leave Management',
    description: 'Recording attendance, managing leave applications, and generating reports'
  },
  {
    id: 'performance',
    label: 'Performance Management',
    description: 'Conducting appraisals, training, and career development activities'
  },
  {
    id: 'security',
    label: 'Workplace Security',
    description: 'Maintaining workplace security through access control and visitor management'
  },
  {
    id: 'communication',
    label: 'Internal Communication',
    description: 'Sending work-related emails, circulars, and announcements'
  },
  {
    id: 'legal',
    label: 'Legal and Regulatory Reporting',
    description: 'Responding to legal inquiries, government inspections, and audits'
  }
]

export const RETENTION_PERIODS = [
  { value: '3_years', label: '3 years post-employment' },
  { value: '5_years', label: '5 years post-employment' },
  { value: '7_years', label: '7 years post-employment (recommended for statutory compliance)' },
  { value: '10_years', label: '10 years post-employment' },
  { value: 'permanent', label: 'Permanent (for select records only)' }
]

export const THIRD_PARTY_CATEGORIES = [
  'Payroll service providers',
  'Insurance companies (for health/group insurance)',
  'Background verification agencies',
  'Government authorities (EPF, ESI, Income Tax)',
  'Banks (for salary transfer)',
  'Training and development vendors',
  'IT service providers (for system access)',
  'Legal and tax consultants'
]

// Standard legal clauses
export const LEGAL_CLAUSES = {
  dataSecurityStatement: `The Company implements appropriate technical and organizational security measures to protect your personal data against unauthorized access, loss, or misuse. These measures include:

* Access controls and authentication mechanisms
* Encryption of sensitive data
* Regular security audits and vulnerability assessments
* Employee training on data protection
* Incident response procedures

Despite our best efforts, no method of transmission or storage is 100% secure. The Company cannot guarantee absolute security of your data.`,

  dataSubjectRights: `As per the Digital Personal Data Protection Act, 2023, you have the following rights:

1. Right to Access: You can request a copy of your personal data held by the Company.

2. Right to Correction: You can request correction of inaccurate or incomplete personal data.

3. Right to Erasure: You can request deletion of your personal data, subject to legal retention requirements.

4. Right to Nominate: You can nominate another individual to exercise your rights in case of death or incapacity.

5. Right to Grievance Redressal: You can raise complaints regarding processing of your personal data.`,

  consentWithdrawal: `You have the right to withdraw this consent at any time by sending a written request to [Company Email] or [Company Address].

Please note that withdrawal of consent may affect your employment relationship, as certain data processing is necessary for fulfilling employment obligations and statutory compliance.

In case of withdrawal, the Company will cease processing your personal data, except where:
* Retention is required by law (e.g., 7 years for tax/statutory records)
* Processing is necessary to complete ongoing contractual obligations
* Data is required for legal defense or regulatory inquiries`,

  grievanceRedressal: `For any queries, complaints, or requests regarding your personal data, please contact:

Grievance Officer: [Name]
Email: [Email]
Phone: [Phone]
Address: [Company Address]

We will acknowledge your complaint within 48 hours and resolve it within 30 days. If you are not satisfied with our response, you may escalate to the Data Protection Board of India.`
}

export const COMPANY_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi', 'Puducherry'
]
