# ComplianceCheck - Testing Best Practices Guide

**Version:** 1.0  
**Last Updated:** December 4, 2025  
**Purpose:** Standard testing procedures for all future builds and deployments

---

## 🎯 Testing Philosophy

**Core Principle:** Every code change must pass automated tests before deployment.

**Quality Standards:**
- ✅ 100% of functional tests passing
- ✅ Zero critical accessibility violations (WCAG 2.0 AA)
- ✅ Page load times < 3 seconds (acceptable up to 3.5s)
- ✅ Works across Chrome, Firefox, Safari, Mobile

---

## 📋 Pre-Deployment Checklist

### Before EVERY Deployment

```bash
# 1. Run core assessment tests (2 minutes)
npx playwright test statutory-health-assessment --project=chromium

# 2. Run accessibility tests (1 minute)  
npx playwright test accessibility-performance --project=chromium

# 3. If both pass, deploy
git push origin main
```

### Before MAJOR Releases

```bash
# Run full test suite across all browsers (7 minutes)
npx playwright test

# Review report
npx playwright show-report
```

**Deploy only if:** >90% tests passing AND zero critical accessibility violations

---

## 🧪 Test Suite Overview

### Current Test Coverage (165 tests total)

| Suite | Tests | What It Tests | Run Time |
|-------|-------|---------------|----------|
| `statutory-health-assessment` | 6 | Complete assessment flow, scoring, NPS | 30s |
| `labour-code-assessment` | 12 | 30-question flow, dynamic filtering | 3min |
| `labour-code-filtering` | 5 | Industry/size-based question filtering | 2min |
| `accessibility-performance` | 6 | WCAG compliance, page speed, SEO | 30s |
| `api-integration` | 4 | Database, API endpoints, validation | 20s |

**Total per browser:** 33 tests  
**Total all browsers:** 165 tests (33 × 5 browsers)

---

## 🔧 Common Issues & Solutions

### Issue 1: "No tests found"
**Cause:** Test files not in `tests/` directory or wrong extension  
**Fix:** Ensure files end with `.spec.ts` in `tests/` folder

### Issue 2: "Timeout waiting for element"
**Cause:** Element selector changed or page structure changed  
**Fix:** 
```bash
# Run with headed mode to see what's happening
npx playwright test <test-name> --headed --project=chromium

# Update selectors to match actual page
```

**Common selector fixes:**
- Button text changed → Update regex pattern
- Form field renamed → Update `getByLabel` text
- Auto-advance added → Remove Next button clicks

### Issue 3: "Strict mode violation"
**Cause:** Selector matches multiple elements  
**Fix:** Add `.first()`, `.last()`, or be more specific

```typescript
// Before (fails if multiple matches)
await expect(page.getByText(/progress/i)).toBeVisible();

// After (works with multiple)
await expect(page.getByText(/progress/i).first()).toBeVisible();
```

### Issue 4: Accessibility violations after UI changes
**Cause:** New colors/styles don't meet WCAG standards  
**Check:** Color contrast ratio using browser dev tools  
**Fix:** Use darker shades for better contrast

**Quick reference:**
- Amber: Use `bg-amber-700` or darker
- Green: Use `bg-green-700` or darker  
- Gray text: Use `text-gray-600` or darker
- Small text (12px): Needs 4.5:1 ratio minimum

### Issue 5: Tests pass locally but fail on CI/Netlify
**Cause:** Cached old version on live site  
**Fix:**
```bash
# Clear Next.js cache before deploying
rm -rf .next
npm run build
git push
```

Or in Netlify: Trigger deploy → "Clear cache and deploy"

---

## 🎨 UI/UX Testing Standards

### Auto-Advance Pattern (Standard for All Assessments)

**Implementation:**
```typescript
const handleResponse = (questionId: string, value: string) => {
  setResponses(prev => ({ ...prev, [questionId]: value }));
  
  // Auto-advance after 800ms
  setTimeout(() => {
    handleNext();
  }, 800);
};
```

**Do NOT render Next button** - auto-advance handles navigation

**Why 800ms?**
- Gives user visual feedback (selection highlight)
- Feels intentional, not jarring
- Allows progress bar to update smoothly

### Progress Indicator (Required)

All assessments MUST have:
```typescript
<Progress 
  value={progress} 
  className="h-2" 
  aria-label="Assessment progress"  // Required for accessibility
  aria-valuenow={progress}           // Required for screen readers
/>
```

### Form Validation (Standard)

**Required fields:**
- Full Name (text)
- Email (validated format)
- Phone Number (10 digits, +91 prefix)
- Company Name (text)
- State (dropdown)
- Employee Count (dropdown)
- Industry (dropdown)

**Button state:**
- Disabled until all required fields filled
- Shows count: "Start Assessment (X questions)"

---

## 🎨 Accessibility Standards (WCAG 2.0 AA)

### Color Contrast Requirements

| Text Size | Minimum Ratio | Tailwind Classes to Use |
|-----------|---------------|------------------------|
| Regular (14px+) | 4.5:1 | `bg-green-700`, `bg-amber-700`, `text-gray-600` |
| Small (12px) | 4.5:1 | `bg-green-800`, darker shades |
| Large (18px+) | 3:1 | `bg-green-600` OK for large text |

### Approved Color Combinations

**Buttons (14px text):**
- ✅ `bg-green-700 text-white` (4.6:1)
- ✅ `bg-blue-700 text-white` (4.6:1)
- ✅ `bg-red-700 text-white` (4.6:1)
- ❌ `bg-green-600 text-white` (3.14:1 - FAILS)

**Badges (12px text):**
- ✅ `bg-green-800 text-white` (5.9:1)
- ❌ `bg-green-600 text-white` (3.29:1 - FAILS)

**Text on white background:**
- ✅ `text-gray-600` (4.8:1)
- ✅ `text-gray-700` (5.9:1)
- ❌ `text-gray-400` (2.53:1 - FAILS)

**Beta banners:**
- ✅ `bg-amber-700 text-white` (5.2:1)
- ❌ `bg-amber-500 text-white` (2.14:1 - FAILS)

### Required ARIA Labels

```typescript
// Progress bars
<Progress aria-label="Assessment progress" />

// Interactive elements without visible labels
<button aria-label="Download PDF">
  <DownloadIcon />
</button>

// Form inputs (must have labels)
<Label htmlFor="email">Email *</Label>
<Input id="email" />
```

---

## 🔄 Test-Driven Development Workflow

### When Adding New Features

1. **Write test first** (or immediately after)
2. **Run test** - should fail initially
3. **Implement feature**
4. **Run test again** - should pass
5. **Commit** both code and tests together

### When Fixing Bugs

1. **Write test that reproduces bug**
2. **Confirm test fails**
3. **Fix bug**
4. **Confirm test passes**
5. **Commit** - this prevents regression

### When Changing UI

1. **Run visual regression tests**
2. **Run accessibility tests**  
3. **Update tests if selectors changed**
4. **Verify all tests pass**
5. **Update visual baselines if intentional:**
   ```bash
   npx playwright test --update-snapshots
   ```

---

## 📦 Test File Organization

### Naming Convention

```
tests/
├── {feature}-assessment.spec.ts       # Main assessment flow
├── {feature}-filtering.spec.ts        # Logic/filtering tests
├── {feature}-fixtures.ts              # Test data
├── accessibility-performance.spec.ts  # Shared quality tests
├── api-integration.spec.ts           # Shared API tests
└── {FEATURE}_TESTS.md                # Feature-specific docs
```

### Test Structure Template

```typescript
import { test, expect, Page } from '@playwright/test';

test.describe('Feature Name', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should do something important', async ({ page }) => {
    // Arrange
    await page.goto('/feature');
    
    // Act
    await page.getByRole('button', { name: /action/i }).click();
    
    // Assert
    await expect(page.getByText(/result/i)).toBeVisible();
  });
});

// Helper functions at bottom
async function helperFunction(page: Page, params: any) {
  // Reusable test logic
}
```

---

## 🎯 Testing Priorities

### Priority 1: CRITICAL (Block Deployment)
- ❌ Core assessment flow broken
- ❌ Critical accessibility violations
- ❌ Database save failures
- ❌ Payment processing errors (when implemented)

### Priority 2: HIGH (Fix Within 24 Hours)
- ⚠️ Scoring calculation errors
- ⚠️ PDF generation failures
- ⚠️ Form validation not working
- ⚠️ Mobile layout broken

### Priority 3: MEDIUM (Fix This Week)
- ⚠️ Performance issues (>4s page load)
- ⚠️ Minor accessibility issues
- ⚠️ SEO meta tag issues
- ⚠️ Cross-browser quirks

### Priority 4: LOW (Nice to Have)
- Minor UI inconsistencies
- Edge case failures
- Visual regression differences (if intentional)

---

## 📊 Test Metrics to Track

### Weekly Metrics

| Metric | Target | How to Check |
|--------|--------|--------------|
| Test Pass Rate | >95% | `npx playwright test` |
| Accessibility Score | 100% | `npx playwright test accessibility-performance` |
| Page Load Time | <3s | Performance test results |
| Code Coverage | >80% | (Future: Add coverage tool) |

### Monthly Review

- Review failed test trends
- Update test data (new states, industries, etc.)
- Add tests for new features
- Remove obsolete tests
- Update documentation

---

## 🚨 When Tests Fail

### Step 1: Identify Scope
```bash
# How many tests failed?
npx playwright test | grep "failed"

# Which suites?
npx playwright show-report
```

### Step 2: Reproduce Locally
```bash
# Run failed test with browser visible
npx playwright test <failing-test> --headed --project=chromium
```

### Step 3: Debug
- Check screenshot in `test-results/`
- Check error message in terminal
- Compare expected vs actual behavior
- Check if page structure changed

### Step 4: Fix
**Option A:** Update code to fix bug  
**Option B:** Update test to match new behavior (if intentional change)

### Step 5: Verify
```bash
# Re-run the specific test
npx playwright test <fixed-test>

# If passes, run full suite
npx playwright test
```

---

## 🔄 CI/CD Integration

### GitHub Actions Setup (Optional but Recommended)

**File:** `.github/workflows/playwright.yml` (already created)

**Triggers:**
- Every push to `main` branch
- Every pull request
- Daily at 6 AM IST (catch production issues)

**What it does:**
- Runs all tests across browsers
- Generates HTML report
- Fails build if critical tests fail
- Saves screenshots/videos of failures

**Enable it:**
```bash
# File already exists, just commit it
git add .github/workflows/playwright.yml
git commit -m "Enable automated testing in GitHub Actions"
git push
```

---

## 📝 Test Maintenance Schedule

### Daily (Automated)
- GitHub Actions runs full suite
- Review failures in email/Slack notifications

### Before Each Deployment (Manual - 3 minutes)
```bash
npx playwright test statutory-health-assessment --project=chromium
npx playwright test accessibility-performance --project=chromium
```

### Weekly (Manual - 10 minutes)
```bash
# Full suite
npx playwright test

# Review report
npx playwright show-report

# Fix any new failures
```

### Monthly (Manual - 30 minutes)
- Review test coverage gaps
- Add tests for new features
- Update test data (company names, states, etc.)
- Check for flaky tests
- Update documentation

---

## 🎓 Learning Resources

### Playwright Docs
- Official docs: https://playwright.dev
- Best practices: https://playwright.dev/docs/best-practices
- Debugging: https://playwright.dev/docs/debug

### Accessibility
- WCAG 2.0 Guidelines: https://www.w3.org/WAI/WCAG21/quickref/
- Color contrast checker: https://webaim.org/resources/contrastchecker/
- axe DevTools: Browser extension for quick checks

### ComplianceCheck Specific
- This document
- Individual test suite docs (LABOUR_CODE_TESTS.md, etc.)
- ACCESSIBILITY_FIXES_APPLIED.md

---

## ⚡ Quick Commands Reference

```bash
# Run specific test suite
npx playwright test <suite-name> --project=chromium

# Run single test
npx playwright test <file>:<line-number> --project=chromium

# Run with visual browser
npx playwright test --headed

# Run with debugging
npx playwright test --debug

# Update visual baselines
npx playwright test --update-snapshots

# Generate/view HTML report
npx playwright show-report

# List all tests
npx playwright test --list

# Run only failed tests from last run
npx playwright test --last-failed
```

---

## 🎨 Code Review Checklist (For Test Changes)

### When Reviewing Test PRs

- [ ] Test names clearly describe what they test
- [ ] Tests are deterministic (no random failures)
- [ ] Proper use of `.first()` for strict mode
- [ ] Appropriate timeouts (not too short, not too long)
- [ ] Helper functions for repeated code
- [ ] Comments explain WHY, not just WHAT
- [ ] Tests clean up after themselves
- [ ] No hardcoded wait times >1000ms without good reason

### When Reviewing App Code PRs

- [ ] Tests updated for changed selectors
- [ ] New features have corresponding tests
- [ ] Accessibility standards maintained
- [ ] Color contrast meets WCAG 2.0 AA
- [ ] All interactive elements have labels
- [ ] Forms have proper validation

---

## 📈 Continuous Improvement

### Adding New Tests

**When to add tests:**
- New assessment type added
- New feature added (payments, documents, etc.)
- Bug found in production (write regression test)
- User reports issue (write test to catch it)

**How to add:**
1. Create new `.spec.ts` file in `tests/`
2. Follow naming convention: `{feature-name}.spec.ts`
3. Use existing tests as templates
4. Add to this documentation

### Removing Tests

**When to remove:**
- Feature deprecated/removed
- Test consistently flaky (>10% failure rate)
- Test no longer relevant

**How to remove:**
1. Comment out test with reason
2. Run full suite to ensure nothing breaks
3. Delete after 1 week if no issues
4. Update documentation

---

## 🏆 Success Metrics

### Definition of "Ready for Production"

- ✅ 100% functional tests passing
- ✅ 100% accessibility tests passing (or documented exceptions)
- ✅ Performance tests passing (or <5% over target)
- ✅ Works on Chrome, Firefox, Safari
- ✅ Works on mobile (iPhone, Android)
- ✅ Database operations successful
- ✅ No console errors
- ✅ SEO meta tags present

### Current Status

| Criteria | Status | Notes |
|----------|--------|-------|
| Functional | ✅ 30/30 | Statutory Health complete |
| Accessibility | 🟡 Pending retest | Fixes deployed, awaiting verification |
| Performance | ✅ Pass | Acceptable load times |
| Cross-browser | ✅ Pass | All browsers working |
| Mobile | ✅ Pass | Responsive design working |

---

## 🚀 Future Enhancements

### Recommended Additions

**Short-term (Next Month):**
- Visual regression testing (screenshot comparisons)
- API contract testing (schema validation)
- Load testing (concurrent users)
- E2E payment flow testing (when Razorpay integrated)

**Medium-term (Next Quarter):**
- Code coverage reporting (aim for >80%)
- Performance monitoring over time
- Automated accessibility scans in CI/CD
- Cross-browser visual testing

**Long-term (Next Year):**
- User behavior testing (analytics-driven)
- A/B testing framework
- Chaos engineering (deliberate failures)
- Production monitoring integration

---

## 📞 Support & Escalation

### When Tests Fail and You're Stuck

1. **Check test screenshots** in `test-results/`
2. **Read error messages** carefully
3. **Check recent code changes** (git log)
4. **Search Playwright docs** for error message
5. **Ask in Playwright Discord:** https://aka.ms/playwright/discord

### Emergency Hotfix Process

If production is broken and tests are blocking deploy:

1. **Fix the critical bug** in code
2. **Skip failing non-critical tests** temporarily:
   ```typescript
   test.skip('non-critical test', async ({ page }) => {
   ```
3. **Deploy hotfix**
4. **Fix tests** within 24 hours
5. **Remove `.skip`** and verify

---

## 📊 Test Reports

### After Each Run

Reports generated in:
- `playwright-report/` - HTML report (view with `npx playwright show-report`)
- `test-results/` - Screenshots, videos, traces

**Important files:**
- `test-results/{test-name}/test-failed-1.png` - Screenshot of failure
- `test-results/{test-name}/video.webm` - Video of test run
- `test-results/{test-name}/error-context.md` - Page snapshot

### Sharing Test Results

For team collaboration:
```bash
# Generate report
npx playwright test --reporter=html

# Share the playwright-report folder
# Or upload to company drive/wiki
```

---

## 🎯 Testing Culture

### Best Practices

1. **Test early, test often** - Don't wait until "feature complete"
2. **Fix failing tests immediately** - Don't let them accumulate
3. **Tests are documentation** - They show how features work
4. **Trust the tests** - If tests pass, feel confident deploying
5. **Update tests proactively** - When changing UI, update tests same day

### Anti-Patterns to Avoid

- ❌ Commenting out failing tests without fixing
- ❌ Increasing timeouts to "fix" slow tests
- ❌ Writing tests that depend on test execution order
- ❌ Hardcoding test data that changes frequently
- ❌ Testing implementation details instead of user behavior
- ❌ Skipping accessibility tests "just this once"

---

## 📋 Appendix: Test Data Standards

### Company Test Data

Use realistic but clearly fake data:
```typescript
companyName: 'Test Tech Pvt Ltd'  // ✅ Clear it's test data
email: 'test@example.com'          // ✅ Disposable
phone: '9876543210'                // ✅ Standard format

// Avoid
companyName: 'ABC'                 // ❌ Too generic
email: 'real.person@gmail.com'     // ❌ Looks real
```

### State/Industry Coverage

Test at least:
- 3 different states (Maharashtra, Karnataka, Delhi)
- 3 different industries (IT, Manufacturing, Retail)
- 3 different sizes (10-19, 50-99, 500+)

### Timing Standards

- Form filling: 500ms between fields
- Question answering: 800ms for auto-advance
- Page navigation: Wait for URL change
- Results loading: 10-15s timeout (database save)

---

**Version:** 1.0  
**Maintained by:** ComplianceCheck Dev Team  
**Last Review:** December 4, 2025  
**Next Review:** January 4, 2026
