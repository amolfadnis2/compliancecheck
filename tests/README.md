# Playwright Tests for ComplianceCheck

## Comprehensive Test Suite

This test suite covers all aspects of the ComplianceCheck platform including:
- Assessment flows for all 4 assessment types
- Summary/Results page validation
- PDF generation and email delivery
- Supabase data persistence
- PostHog analytics tracking
- Security validation
- SEO compliance
- Accessibility (WCAG 2.0 AA)
- Performance benchmarks
- Calculator functionality
- Cross-assessment UI consistency

## Quick Start

### 1. One-Click Setup (Recommended)
```bash
setup-tests.bat
```

### 2. Manual Setup
```bash
npm install -D @playwright/test @axe-core/playwright
npx playwright install
```

## Running Tests

### All Tests
```bash
npx playwright test
```

### Watch Mode (See tests running)
```bash
npx playwright test --headed
```

### Interactive UI
```bash
npx playwright test --ui
```

### By Category
```bash
# Assessment flows
npx playwright test statutory-health-assessment
npx playwright test labour-code-assessment
npx playwright test dpdp-assessment
npx playwright test state-wise-compliance

# Summary and PDF/Email
npx playwright test summary-pdf-email

# Data persistence
npx playwright test supabase-persistence

# Analytics
npx playwright test posthog-analytics

# Security
npx playwright test security-validation

# SEO
npx playwright test seo-comprehensive

# Accessibility & Performance
npx playwright test accessibility-performance

# Calculators
npx playwright test calculator

# Cross-assessment consistency
npx playwright test cross-assessment-consistency

# API tests
npx playwright test api-integration
```

### By Browser
```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
npx playwright test --project="Mobile Chrome"
npx playwright test --project="Mobile Safari"
```

## View Results
```bash
npx playwright show-report
```

## Test Files Structure

```
tests/
├── fixtures/
│   ├── company-profiles.ts     # Reusable test data profiles
│   └── index.ts                # Fixtures export
│
├── Assessment Flow Tests
│   ├── statutory-health-assessment.spec.ts
│   ├── labour-code-assessment.spec.ts
│   ├── dpdp-assessment.spec.ts
│   └── state-wise-compliance.spec.ts
│
├── Validation Tests
│   ├── summary-pdf-email.spec.ts      # Results page, PDF, Email
│   ├── supabase-persistence.spec.ts   # Database storage
│   ├── posthog-analytics.spec.ts      # Event tracking
│   ├── security-validation.spec.ts    # Input validation, XSS
│   └── seo-comprehensive.spec.ts      # Meta tags, keywords
│
├── Quality Tests
│   ├── accessibility-performance.spec.ts  # A11y + Performance
│   ├── cross-assessment-consistency.spec.ts
│   └── calculator.spec.ts              # CTC & Gratuity calculators
│
├── API Tests
│   └── api-integration.spec.ts
│
└── Utilities
    └── test-helpers.ts
```

## Test Coverage Matrix

| Category | Coverage | File |
|----------|----------|------|
| Statutory Health Flow | ✅ Full | statutory-health-assessment.spec.ts |
| Labour Code Flow | ✅ Full | labour-code-assessment.spec.ts |
| DPDP Flow | ✅ Full | dpdp-assessment.spec.ts |
| State-wise Flow | ✅ Full | state-wise-compliance.spec.ts |
| Summary Page | ✅ Full | summary-pdf-email.spec.ts |
| PDF Download | ✅ Full | summary-pdf-email.spec.ts |
| Email Delivery | ✅ Full | summary-pdf-email.spec.ts |
| Score Calculation | ✅ Full | summary-pdf-email.spec.ts |
| Supabase Storage | ✅ Full | supabase-persistence.spec.ts |
| PostHog Events | ✅ Full | posthog-analytics.spec.ts |
| Security | ✅ Full | security-validation.spec.ts |
| SEO | ✅ Full | seo-comprehensive.spec.ts |
| Accessibility | ✅ Full | accessibility-performance.spec.ts |
| Performance | ✅ Full | accessibility-performance.spec.ts |
| CTC Calculator | ✅ Full | calculator.spec.ts |
| Gratuity Calculator | ✅ Full | calculator.spec.ts |
| UI Consistency | ✅ Full | cross-assessment-consistency.spec.ts |
| API Endpoints | ✅ Full | api-integration.spec.ts |

## Company Profile Fixtures

Pre-defined test profiles in `fixtures/company-profiles.ts`:

| Profile | Employees | Industry | Use Case |
|---------|-----------|----------|----------|
| TINY_IT | 1-9 | IT | Below EPF threshold |
| SMALL_SERVICES | 10-19 | Services | ESI applicable only |
| MID_IT | 20-49 | IT | All basic compliances |
| MID_MANUFACTURING | 50-99 | Manufacturing | Factory Act applicable |
| LARGE_SERVICES | 100-299 | Services | Canteen required |
| ENTERPRISE | 500+ | IT | All thresholds exceeded |
| EDTECH_CHILDREN | 50-99 | Education | DPDP children data |
| HEALTHCARE | 100-299 | Healthcare | Sensitive data SDF |

## Adding Tests for New Assessments

1. Copy `statutory-health-assessment.spec.ts` as template
2. Update form fields if different
3. Update expected question count
4. Add profile to `fixtures/company-profiles.ts` if needed
5. Add entry to cross-assessment-consistency.spec.ts

## Common Issues

### "Error: No tests found"
Run: `npx playwright test`

### "Browser not installed"
Run: `npx playwright install chromium`

### Tests timeout
Increase timeout in `playwright.config.ts`: `timeout: 90000`

### Flaky tests
Add retries: `npx playwright test --retries=2`

## CI/CD Integration

Tests run automatically on:
- Push to `main` or `develop`
- Pull requests to `main`
- Weekly schedule (legal accuracy check)

See `.github/workflows/playwright.yml`

## Need Help?

- Playwright Docs: https://playwright.dev
- Test Reports: `npx playwright show-report`
- Email: compliancecheck@zohomail.in
