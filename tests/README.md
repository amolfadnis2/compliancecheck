# Playwright Tests for ComplianceCheck

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

### Specific Tests
```bash
# Just statutory health check
npx playwright test statutory-health-assessment

# Just accessibility
npx playwright test accessibility-performance

# Just API tests
npx playwright test api-integration
```

### By Browser
```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

## View Results
```bash
npx playwright show-report
```

## What Gets Tested

✅ Complete assessment flow (12 questions)
✅ Score calculations
✅ PDF download trigger
✅ NPS feedback modal
✅ Accessibility (WCAG 2.0 AA)
✅ Performance (page load < 3s)
✅ Mobile responsiveness
✅ API endpoints
✅ Database persistence
✅ Email validation
✅ SEO meta tags

## Test Files

- `statutory-health-assessment.spec.ts` - Main assessment flow
- `accessibility-performance.spec.ts` - A11y + performance
- `api-integration.spec.ts` - API + database tests

## Common Issues

### "Error: No tests found"
✅ Files are created! Just run: `npx playwright test`

### "Browser not installed"
Run: `npx playwright install chromium`

### Tests timeout
Increase timeout in `playwright.config.ts`: `timeout: 90000`

## Need Help?

- Playwright Docs: https://playwright.dev
- Email: compliancecheck@zohomail.in
