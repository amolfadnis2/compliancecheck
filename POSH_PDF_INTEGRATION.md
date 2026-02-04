# POSH PDF Generator - Integration Guide

## Quick Setup

The PDF generator has been added to: `src/lib/pdf/posh-report-generator.ts`

### 1. Ensure jsPDF is installed

```bash
npm install jspdf
# or
pnpm add jspdf
```

### 2. Update Your POSH Results Component

In your POSH assessment results page, replace the existing PDF generation:

```typescript
import { generatePOSHReport } from '@/lib/pdf/posh-report-generator';

// In your component where you have the results...

const handleDownloadReport = () => {
  // Map your existing data to the expected format
  const poshResult = {
    overallScore,           // number: 60
    riskLevel,              // string: "High Risk"  
    penaltyExposure,        // string: "Rs.1,00,000+"
    categoryScores,         // CategoryScore[]
    actionItems,            // ActionItem[]
    compliantItems,         // CompliantItem[]
  };

  const userDetails = {
    fullName: companyDetails.fullName || '',
    email: companyDetails.email || '',
    phone: companyDetails.phone || '',
    companyName: companyDetails.name,
    state: companyDetails.state,
    employeeCount: companyDetails.employeeCount,
    industry: companyDetails.industry,
  };

  generatePOSHReport(poshResult, userDetails);
};

// Then in your JSX:
<button onClick={handleDownloadReport}>
  Download Full Report
</button>
```

### 3. Data Mapping

If your current data structure differs:

```typescript
// Your existing action item → Expected format
const mappedActionItems = yourActionItems.map(item => ({
  priority: item.priority,           // 'high' | 'medium' | 'low'
  category: item.category,           // string
  questionId: item.questionId,       // string
  title: item.title,                 // string: requirement/action title
  description: item.question,        // string: original question text
  remediation: item.steps,           // string[]: array of steps
  governmentRef: item.legalRef,      // string: "POSH Act 2013, Section X"
  penalty: item.penalty,             // string: penalty description
  deadline: item.deadline,           // string: deadline description
}));

// Your compliant items → Expected format
const mappedCompliantItems = yourCompliantItems.map(item => ({
  questionId: item.id,
  category: item.category,
  text: item.questionText,
}));
```

## What the PDF Includes

| Page | Content |
|------|---------|
| 1 | Cover page with company details |
| 2 | Executive summary with score, risk, category breakdown |
| 3-6 | High priority action items (full details) |
| 7-9 | Medium priority action items |
| 10 | Low priority action items |
| 11 | Compliant areas checklist by category |
| 12 | Next steps, resources, disclaimer |

## For Email Attachments

Use `generatePOSHReportBlob()` to get a Blob for email:

```typescript
import { generatePOSHReportBlob } from '@/lib/pdf/posh-report-generator';

const pdfBlob = generatePOSHReportBlob(result, userDetails);
// Use with Resend or other email service
```

## Testing

1. Complete a POSH assessment
2. Click "Download Full Report"
3. Verify PDF has 8-12 pages
4. Check all action items have steps, deadlines, penalties, legal refs
5. Verify compliant areas are listed
6. Check for Unicode errors (₹ → Rs., etc.)
