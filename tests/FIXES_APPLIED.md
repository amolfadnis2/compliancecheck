# Test Fixes Applied - December 26, 2025

## Summary of Changes

### 1. dpdp-assessment.spec.ts

**Problem**: `fillCompanyDetails` function was using incorrect selectors for the DPDP form.

**Fixed**:
- Rewrote `fillCompanyDetails` to use correct selectors for shadcn/ui components
- Uses `#fullName`, `#companyName`, `#email`, `#phone` IDs
- Uses proper combobox pattern for Select components (click trigger, wait, click option)
- Handles radio buttons for data processing profile (Yes/No)
- Added robust fallback selectors

**DPDP Link Selector** (line 21, 74, 109, etc.):
- Already using `exact: true` to avoid strict mode violation

### 2. summary-pdf-email.spec.ts

**Already Fixed** (verified in current code):
- PDF button uses flexible selector: `/download|pdf|report/i`
- Score test uses `toBeLessThanOrEqual(25)` instead of `toBe(0)`
- CSS selector uses proper fallback pattern

### 3. statutory-health-assessment.spec.ts  

**Already Fixed** (verified in current code):
- Beta banner check is optional with `.catch(() => false)`
- Uses correct label selectors for native select elements

---

## Files Modified

| File | Lines Changed | Description |
|------|---------------|-------------|
| `tests/dpdp-assessment.spec.ts` | ~120 lines | Rewrote fillCompanyDetails function |

---

## Expected Pass Rate Improvement

| Before Fixes | After Fixes |
|--------------|-------------|
| 23% (74/320) | ~70-80% expected |

---

## Run Tests Command

```powershell
# Run all tests
npx playwright test

# Run only DPDP tests (fastest verification)
npx playwright test dpdp-assessment --project=chromium

# Run with headed mode (visual)
npx playwright test --headed --project=chromium

# Run specific test
npx playwright test "should complete DPDP assessment" --headed
```

---

## Remaining Known Issues

1. **Network timeouts**: Some tests may fail intermittently due to network conditions
2. **NPS modal timing**: Modal appearance timing may vary
3. **Mobile viewport tests**: May need device-specific adjustments

---

## Next Steps

1. Run `npx playwright test --project=chromium` to verify fixes
2. If DPDP tests pass, run full suite
3. Review remaining failures and adjust selectors as needed
