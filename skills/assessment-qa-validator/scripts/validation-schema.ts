/**
 * Assessment QA Validator - Validation Schema
 * Use this to validate assessment questions programmatically
 */

export interface QuestionValidation {
  questionId: string;
  questionText: string;
  
  // Legal basis - REQUIRED
  legalReference: {
    act: string;              // e.g., "EPF Act 1952"
    section: string;          // e.g., "Section 6"
    rule?: string;            // e.g., "Rule 38"
    notification?: string;    // For amendments
  };
  
  // Threshold - if applicable
  threshold?: {
    type: 'employee_count' | 'wage' | 'turnover' | 'other';
    value: number | string;
    unit: string;             // e.g., "employees", "Rs./month", "Rs. crore"
    verified: boolean;
    verifiedDate: string;     // ISO date
    source: string;           // URL or document reference
  };
  
  // Penalty - REQUIRED for compliance questions
  penalty?: {
    firstOffence: string;     // e.g., "Rs.50,000"
    repeatOffence?: string;   // e.g., "Rs.1,00,000"
    imprisonment?: string;    // e.g., "6 months"
    responsiblePerson: string; // e.g., "Managing Director"
    compoundable: boolean;
  };
  
  // Deadline - if applicable
  deadline?: {
    type: 'registration' | 'filing' | 'renewal' | 'one-time';
    dueDate: string;          // e.g., "15th of following month"
    gracePeriod?: string;     // e.g., "5 days"
    lateFeePer: string;       // e.g., "Rs.50/day"
  };
  
  // Remediation - REQUIRED
  remediation: {
    steps: string[];          // Action steps
    governmentPortal?: string; // Official URL
    formNumber?: string;      // e.g., "Form 5A"
    estimatedTime?: string;   // e.g., "2-3 days"
  };
  
  // Validation metadata
  validation: {
    lastVerified: string;     // ISO date
    verifiedBy: string;       // "Claude QA" or expert name
    nextReviewDate: string;   // ISO date
    status: 'verified' | 'needs_review' | 'outdated';
    issues: string[];         // Any flagged issues
  };
}

export interface PDFValidation {
  assessmentType: string;
  generatedAt: string;
  
  sections: {
    executiveSummary: {
      hasOverallScore: boolean;
      hasStatusBadge: boolean;
      hasKeyHighlights: boolean;
    };
    requirements: {
      hasLegalMandate: boolean;
      hasApplicability: boolean;
      hasTriggers: boolean;
    };
    benefits: {
      hasExemptions: boolean;
      hasIncentives: boolean;
      hasRiskMitigation: boolean;
    };
    penalties: {
      hasFineAmounts: boolean;
      hasImprisonment: boolean;
      hasResponsiblePersons: boolean;
      hasCompounding: boolean;
    };
    deadlines: {
      hasRegistrationDates: boolean;
      hasFilingDates: boolean;
      hasRenewalPeriods: boolean;
      hasGracePeriods: boolean;
    };
    actionItems: {
      hasPriority: boolean;
      hasWhatToFix: boolean;
      hasWhyItMatters: boolean;
      hasHowToFix: boolean;
      hasPortalLinks: boolean;
    };
    governmentRefs: {
      hasActNames: boolean;
      hasSectionNumbers: boolean;
      hasOfficialURLs: boolean;
      hasFormNumbers: boolean;
    };
    disclaimer: {
      hasNotLegalAdvice: boolean;
      hasConsultExpert: boolean;
      hasTimestamp: boolean;
    };
  };
  
  technicalChecks: {
    unicodeRendered: boolean;
    linksClickable: boolean;
    tablesFormatted: boolean;
    pageBreaksCorrect: boolean;
  };
}

export interface ScoringValidation {
  assessmentType: string;
  
  testCases: {
    name: string;
    input: Record<string, string>;
    expectedScore: number;
    actualScore: number;
    expectedStatus: 'compliant' | 'needs_attention' | 'non_compliant';
    actualStatus: string;
    passed: boolean;
  }[];
  
  categoryBreakdown: {
    category: string;
    questionsCount: number;
    maxScore: number;
    calculationCorrect: boolean;
  }[];
  
  edgeCases: {
    allNA: boolean;           // Handles all N/A correctly
    emptyResponses: boolean;  // Handles missing answers
    partialCompletion: boolean; // Handles incomplete assessment
  };
}

// Validation Report Generator
export function generateValidationReport(
  questions: QuestionValidation[],
  pdf: PDFValidation,
  scoring: ScoringValidation
): ValidationReport {
  const issues: ValidationIssue[] = [];
  
  // Check questions
  questions.forEach(q => {
    if (!q.legalReference.act) {
      issues.push({
        questionId: q.questionId,
        severity: 'high',
        type: 'missing_legal_reference',
        message: `Question ${q.questionId} missing legal reference`
      });
    }
    if (q.validation.status === 'outdated') {
      issues.push({
        questionId: q.questionId,
        severity: 'high',
        type: 'outdated_info',
        message: `Question ${q.questionId} needs review`
      });
    }
  });
  
  // Check PDF sections
  Object.entries(pdf.sections).forEach(([section, checks]) => {
    Object.entries(checks).forEach(([check, passed]) => {
      if (!passed) {
        issues.push({
          section,
          severity: 'medium',
          type: 'missing_pdf_section',
          message: `PDF missing: ${section}.${check}`
        });
      }
    });
  });
  
  // Check scoring
  scoring.testCases.forEach(tc => {
    if (!tc.passed) {
      issues.push({
        testCase: tc.name,
        severity: 'high',
        type: 'scoring_error',
        message: `Scoring test failed: ${tc.name} (expected ${tc.expectedScore}, got ${tc.actualScore})`
      });
    }
  });
  
  return {
    timestamp: new Date().toISOString(),
    totalQuestions: questions.length,
    issuesFound: issues.length,
    highSeverity: issues.filter(i => i.severity === 'high').length,
    mediumSeverity: issues.filter(i => i.severity === 'medium').length,
    lowSeverity: issues.filter(i => i.severity === 'low').length,
    issues,
    overallStatus: issues.filter(i => i.severity === 'high').length === 0 ? 'PASS' : 'FAIL'
  };
}

interface ValidationIssue {
  questionId?: string;
  section?: string;
  testCase?: string;
  severity: 'high' | 'medium' | 'low';
  type: string;
  message: string;
}

interface ValidationReport {
  timestamp: string;
  totalQuestions: number;
  issuesFound: number;
  highSeverity: number;
  mediumSeverity: number;
  lowSeverity: number;
  issues: ValidationIssue[];
  overallStatus: 'PASS' | 'FAIL';
}
