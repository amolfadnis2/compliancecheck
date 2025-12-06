# ComplianceCheck - New Assessment Development Checklist

**Use this checklist when building any new assessment**

---

## ✅ Phase 1: Planning & Design (2-4 hours)

### Research & Scoping
- [ ] Identify compliance area (which act/code/regulation)
- [ ] Research applicable thresholds (employee count, wage levels, etc.)
- [ ] Document legal references (act sections, penalties)
- [ ] Define target user persona (who needs this assessment)

### Question Design
- [ ] Draft 25-50 questions covering all aspects
- [ ] Organize into 3-5 logical categories
- [ ] Identify which questions apply to all vs some companies
- [ ] Define compliance answers (what's the "right" answer)
- [ ] Write help text for complex questions
- [ ] Assign weights (1-10) based on legal importance

### Filtering Logic
- [ ] Map employee count thresholds (10+, 20+, 50+, etc.)
- [ ] Map industry-specific requirements
- [ ] Create filtering decision tree
- [ ] Document expected question counts per scenario
  - Example: IT 50 employees = ~18 questions
  - Example: Manufacturing 100 employees = ~26 questions

### Scoring Design
- [ ] Define overall scoring algorithm
- [ ] Define category scoring
- [ ] Set status thresholds (90%+ = Compliant, etc.)
- [ ] Design action item generation logic

---

## ✅ Phase 2: Development (8-12 hours)

### File Setup
- [ ] Create `/src/app/assessment/{type}/page.tsx`
- [ ] Create `/src/app/assessment/{type}/questions.ts`
- [ ] Create `/src/app/assessment/{type}/scoring.ts` (if complex)
- [ ] Update homepage to include new assessment card

### Step 0: Company Details Form
- [ ] Add all 7 required fields:
  - [ ] Full Name (text input, 2-100 chars)
  - [ ] Email (validated email format)
  - [ ] Phone (10 digits with +91 prefix UI)
  - [ ] Company Name (text input, 2-200 chars)
  - [ ] State (dropdown, all Indian states)
  - [ ] Employee Count (dropdown, standard ranges)
  - [ ] Industry (dropdown, standard industries)
- [ ] Implement Zod validation schema
- [ ] Show dynamic question count on button
- [ ] Button text: "Start Assessment (X questions)"
- [ ] Button disabled until form valid

### Question Flow Implementation
- [ ] Create question state management
- [ ] Implement `handleResponse` with 800ms auto-advance
- [ ] **Remove manual Next button** (auto-advance only)
- [ ] Add progress bar with `aria-label="Assessment progress"`
- [ ] Show category indicator
- [ ] Show question number (X of Y)
- [ ] Implement Back button (optional, for first few questions)

### Yes/No Question Component
- [ ] Two large buttons (h-16)
- [ ] Visual feedback on selection (bg-green-700 for YES, bg-red-700 for NO)
- [ ] Clear icons (CheckCircle, XCircle)
- [ ] Auto-advance after click

### Multiple Choice Component
- [ ] Stack buttons vertically
- [ ] Full-width, left-aligned
- [ ] Clear selection state
- [ ] Auto-advance after click

### Scoring Implementation
- [ ] Calculate overall score (0-100)
- [ ] Calculate category scores
- [ ] Assign status based on thresholds
- [ ] Generate action items based on gaps
- [ ] Identify high-priority fixes

### Results Page
- [ ] Large, prominent overall score
- [ ] Status badge (Compliant/Needs Attention/Non-Compliant)
- [ ] Category breakdown cards
- [ ] Action items list (prioritized)
- [ ] Download PDF button
- [ ] NPS feedback modal integration

### PDF Generation
- [ ] Import jsPDF
- [ ] Create PDF template
- [ ] Add all required sections (see baseline doc)
- [ ] **Clean Unicode characters** before generation
- [ ] Test PDF renders correctly
- [ ] Include government references

### Database Integration
- [ ] Create API route `/api/assessment/{type}-submit`
- [ ] Save to `assessments` table with all fields
- [ ] Handle anonymous submissions (create temp user)
- [ ] Return UUID assessment ID
- [ ] Handle failures gracefully (localStorage fallback)

### NPS Feedback
- [ ] Integrate NPSFeedbackModal component
- [ ] Trigger on "Download PDF" first click
- [ ] Save feedback to database with assessment_id link
- [ ] Track PostHog event

---

## ✅ Phase 3: Styling & Accessibility (2-4 hours)

### Choose Assessment Color Theme
- [ ] Select primary color (green/blue/purple/orange/teal)
- [ ] **Use -700 shade for buttons** (not -600!)
- [ ] **Use -800 shade for badges** (not -600!)
- [ ] Define border color (-600 OK for borders)
- [ ] Define background highlights (-100 for light backgrounds)

### Apply Consistent Styling
- [ ] Header with assessment icon + title
- [ ] Color-coded FREE BETA badge
- [ ] Matching button colors throughout
- [ ] Consistent card styling
- [ ] Matching progress bar colors

### Accessibility Audit
- [ ] Run axe DevTools in browser
- [ ] Check all color contrast ratios (use WebAIM checker)
- [ ] Verify all buttons have accessible names
- [ ] Ensure keyboard navigation works
- [ ] Add aria-labels to progress bars
- [ ] Test with screen reader (optional but recommended)

### Mobile Optimization
- [ ] Test on 375px width (iPhone SE)
- [ ] Ensure touch targets ≥44px
- [ ] Check form inputs don't cause zoom (≥16px font)
- [ ] Verify buttons stack properly
- [ ] Test progress bar visibility

---

## ✅ Phase 4: Testing (4-6 hours)

### Create Test Files
- [ ] Create `tests/{type}-assessment.spec.ts`
- [ ] Create `tests/{type}-filtering.spec.ts` (if dynamic filtering)
- [ ] Create `tests/{type}-fixtures.ts` (test data)
- [ ] Create `tests/{TYPE}_TESTS.md` (documentation)

### Write Minimum Required Tests

**Test 1: Navigation**
```typescript
test('should navigate to {type} assessment', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: /{type}/i }).first().click();
  await expect(page).toHaveURL(/\/assessment\/{type}/);
});
```

**Test 2: Complete Assessment**
```typescript
test('should complete assessment with compliant answers', async ({ page }) => {
  // Fill all form fields
  // Answer all questions (use auto-advance timing)
  // Verify reaches results page
  // Check score is calculated
});
```

**Test 3: Score Calculation**
```typescript
test('should display correct score for all compliant answers', async ({ page }) => {
  // Complete with all compliant answers
  // Verify score is 90-100%
});
```

**Test 4: Dynamic Filtering (if applicable)**
```typescript
test('should show different question counts for different company sizes');
test('should filter questions based on industry');
```

**Test 5: Accessibility**
```typescript
test('should have no critical accessibility violations', async ({ page }) => {
  await page.goto('/assessment/{type}');
  const results = await new AxeBuilder({ page }).analyze();
  const critical = results.violations.filter(v => v.impact === 'critical');
  expect(critical).toEqual([]);
});
```

**Test 6: Mobile**
```typescript
test('should work on mobile viewport', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  // Complete assessment on mobile
});
```

### Run Tests
```bash
# Single browser first
npx playwright test {type}-assessment --project=chromium

# Then all browsers
npx playwright test {type}-assessment

# Then accessibility
npx playwright test accessibility-performance
```

### Fix All Failing Tests
- [ ] All functional tests passing (100%)
- [ ] Accessibility tests passing
- [ ] Mobile tests passing
- [ ] Performance acceptable (<3.5s)

---

## ✅ Phase 5: Documentation (1-2 hours)

### Code Documentation
- [ ] Add JSDoc comments to main functions
- [ ] Document filtering logic
- [ ] Document scoring algorithm
- [ ] Add inline comments for complex logic

### User Documentation (Future - for help section)
- [ ] What this assessment covers
- [ ] Who should take it
- [ ] How long it takes
- [ ] What the report includes
- [ ] How to interpret scores

### Developer Documentation
- [ ] Add to main README.md
- [ ] Create {TYPE}_TESTS.md
- [ ] Update ASSESSMENT_BASELINE_STANDARD.md if new patterns
- [ ] Document any deviations from baseline

---

## ✅ Phase 6: Deployment & Monitoring (Ongoing)

### Pre-Deployment
- [ ] All tests passing locally
- [ ] Accessibility audit clean
- [ ] Code reviewed (if team)
- [ ] Database migrations run (if schema changes)

### Deployment
```bash
git add .
git commit -m "Add {type} assessment - {brief description}"
git push origin main
```

- [ ] Wait for Netlify build (2-3 min)
- [ ] Check build logs for errors
- [ ] Verify deployment successful

### Post-Deployment Verification
- [ ] Run tests against live site:
  ```bash
  npx playwright test {type}-assessment --project=chromium
  ```
- [ ] Complete assessment manually (smoke test)
- [ ] Check database saved correctly
- [ ] Verify PDF downloads
- [ ] Submit NPS feedback (test flow)
- [ ] Check PostHog events tracking

### Monitoring (First 48 Hours)
- [ ] Monitor PostHog for assessment starts
- [ ] Monitor completion rate
- [ ] Check for JavaScript errors
- [ ] Review user feedback
- [ ] Check average time to complete
- [ ] Monitor NPS scores

---

## 🎯 Success Criteria

### Assessment is "Production Ready" When:

**Functionality:**
- ✅ 100% of tests passing
- ✅ Completes end-to-end without errors
- ✅ Score calculates accurately
- ✅ PDF generates correctly
- ✅ Database saves reliably

**Quality:**
- ✅ Zero critical accessibility violations
- ✅ Page load <3 seconds (or <3.5s acceptable)
- ✅ Works on all target browsers
- ✅ Mobile responsive

**User Experience:**
- ✅ Clear instructions
- ✅ Smooth auto-advance
- ✅ Helpful error messages
- ✅ Progress always visible
- ✅ Results are actionable

**Business:**
- ✅ Pricing defined
- ✅ PostHog tracking implemented
- ✅ NPS feedback collecting
- ✅ Ready for beta users

---

## 📊 Estimated Timeline

**Total time to build new assessment:** 20-30 hours

| Phase | Time | Can Parallelize |
|-------|------|----------------|
| Planning | 2-4 hours | No |
| Development | 8-12 hours | No |
| Styling/A11y | 2-4 hours | Partially |
| Testing | 4-6 hours | After dev |
| Documentation | 1-2 hours | Yes |
| Deploy/Monitor | 2-4 hours | After tests pass |

**With experience:** Can reduce to 15-20 hours per assessment

---

## 🎓 Appendix: Template Files

### Quick Start Template

When starting new assessment, copy from:
- `src/app/assessment/statutory-health/` - Simplest reference
- `src/app/assessment/labour-code/` - Complex filtering reference
- `tests/statutory-health-assessment.spec.ts` - Test template

### Checklist Template (Copy This)

```markdown
# {Assessment Name} - Development Checklist

## Research
- [ ] Legal research complete
- [ ] Questions drafted (X questions)
- [ ] Thresholds documented
- [ ] Scoring defined

## Development  
- [ ] Route created
- [ ] Form built
- [ ] Questions implemented
- [ ] Auto-advance working
- [ ] Scoring working
- [ ] Results page done
- [ ] PDF generation working

## Testing
- [ ] 6+ tests written
- [ ] All tests passing
- [ ] Accessibility clean
- [ ] Mobile working

## Launch
- [ ] Deployed to production
- [ ] Tests passing on live site
- [ ] Monitoring active
```

---

**Version:** 1.0  
**Status:** Active Standard  
**Compliance:** All new assessments MUST follow this baseline  
**Exceptions:** Must be documented and approved
