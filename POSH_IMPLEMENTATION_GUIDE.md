# POSH Assessment - Add Category Breakdown Display

## Quick Implementation Guide

### Files to Create/Modify

1. **NEW FILE**: `src/lib/assessments/posh-category-breakdown-utils.ts`
   - Copy from: `posh-category-breakdown-utils.ts` (provided)

2. **NEW FILE**: `src/components/assessment/posh-category-breakdown.tsx`
   - Copy from: `posh-category-breakdown-component.tsx` (provided)

3. **MODIFY**: `src/app/assessment/posh/page.tsx`
   - Changes detailed below

---

## Changes to POSH Assessment Page

### Change 1: Add Imports (Top of File)

```typescript
// Add these imports
import { calculateCategoryBreakdown } from '@/lib/assessments/posh-category-breakdown-utils';
import { POSHCategoryBreakdown } from '@/components/assessment/posh-category-breakdown';
```

### Change 2: Add State Variables

```typescript
// BEFORE
const [currentStep, setCurrentStep] = useState(0);
const [responses, setResponses] = useState<Record<string, string>>({});

// AFTER - Add these new state variables
const [currentStep, setCurrentStep] = useState(0);
const [responses, setResponses] = useState<Record<string, string>>({});
const [categoryBreakdown, setCategoryBreakdown] = useState<Record<string, number>>({});
const [totalQuestions, setTotalQuestions] = useState(0);
```

### Change 3: Calculate Breakdown After Filtering

```typescript
// Add this useEffect after your filtering logic
useEffect(() => {
  if (filteredQuestions.length > 0) {
    const breakdown = calculateCategoryBreakdown(filteredQuestions);
    setCategoryBreakdown(breakdown);
    setTotalQuestions(filteredQuestions.length);
  }
}, [filteredQuestions]);
```

### Change 4: Add Summary Screen (Insert Between Steps)

Find where you handle `currentStep === 1` (after company details).

```typescript
// BEFORE
if (currentStep === 0) {
  // Company details form
}

// Immediately show first question
if (currentStep >= 1) {
  // Question display
}

// AFTER - Add summary screen between company details and questions
if (currentStep === 0) {
  // Company details form
  return <CompanyDetailsForm />;
}

// 🆕 NEW: Summary screen at step 1
if (currentStep === 1) {
  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          POSH Compliance Audit
        </h1>
        <p className="text-gray-600">
          Your personalized compliance assessment is ready
        </p>
      </div>

      {/* Category Breakdown Display */}
      <POSHCategoryBreakdown 
        totalQuestions={totalQuestions}
        categoryBreakdown={categoryBreakdown}
      />

      <button
        onClick={() => setCurrentStep(2)} // Move to first question
        className="w-full bg-blue-700 hover:bg-blue-800 text-white py-4 px-6 rounded-lg font-semibold mt-6"
      >
        Begin Assessment →
      </button>
    </div>
  );
}

// Questions now start from step 2
if (currentStep >= 2) {
  const questionIndex = currentStep - 2; // Adjust for new step
  // Your existing question display logic
}
```

---

## Visual Result

After implementation, users will see:

```
┌─────────────────────────────────────────────────┐
│ ℹ️ Your Personalised Assessment: 33 Questions   │
│                                                  │
│ Based on your data processing profile, we've    │
│ tailored the assessment to show only relevant   │
│ questions.                                       │
│                                                  │
│ ┌──────────────────┬──────────────────┐        │
│ │ 👥 ICC Constitution: 9                │        │
│ │ 🔒 Security Safeguards: 9             │        │
│ ├──────────────────┼──────────────────┤        │
│ │ 👤 Data Principal Rights: 6           │        │
│ │ 🚨 Breach Response: 5                 │        │
│ ├──────────────────┴──────────────────┤        │
│ │ 📋 Governance & Retention: 4          │        │
│ └──────────────────────────────────────┘        │
│                                                  │
│      [Begin Assessment →]                        │
└─────────────────────────────────────────────────┘
```

---

## Testing Checklist

- [ ] Category breakdown calculates correctly (sum equals totalQuestions)
- [ ] Icons display properly for each category
- [ ] Only categories with questions > 0 are shown
- [ ] Mobile responsive (2 columns on desktop, 1 on mobile)
- [ ] "Begin Assessment" button advances to first question
- [ ] Progress bar shows correct total (e.g., "1 of 33")

---

## Troubleshooting

**Issue**: Categories showing 0 questions
**Solution**: Check your filtering logic runs BEFORE calculating breakdown

**Issue**: Total doesn't match sum of categories
**Solution**: Verify all questions have a valid `category` field

**Issue**: Icons not displaying
**Solution**: Ensure emoji are in quotes and role="img" is present

**Issue**: Layout breaks on mobile
**Solution**: Use `grid-cols-1 md:grid-cols-2` for responsive grid
