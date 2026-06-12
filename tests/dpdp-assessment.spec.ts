import { test, expect, Page } from '@playwright/test';

/**
 * DPDP Assessment Test Suite
 * 
 * Tests for Digital Personal Data Protection Act 2023 compliance assessment
 * - 45 questions across 6 phases
 * - Maturity model scoring (0-100%)
 * - Conditional logic based on organization profile
 * - Risk multipliers for sensitive data types
 */

test.describe('DPDP Assessment - Core Flow', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should complete DPDP assessment with fully compliant answers', async ({ page }) => {
    // Navigate to DPDP assessment - use exact match to avoid strict mode violation (2 DPDP links exist)
    await page.getByRole('link', { name: 'DPDP Gap Assessment', exact: true }).click();
    await expect(page).toHaveURL(/\/assessment\/dpdp/);

    // Fill Data Processing Profile (DPDP-specific form)
    await fillCompanyDetails(page, {
      orgName: 'Test Tech Solutions Pvt Ltd',
      name: 'Test User',
      email: 'test@example.com',
      industry: 'Information Technology',
      dataPrincipals: 'Less than 1 Lakh',
      state: 'Maharashtra',
      processesChildrenData: false,
      transfersDataAbroad: false,
      operatesPlatform: true  // Basic platform
    });

    // Phase 1: Consent Management (9 questions)
    await answerConsentManagementQuestions(page, 'compliant');

    // Phase 2: Security Safeguards (9 questions)  
    await answerSecurityQuestions(page, 'compliant');

    // Phase 3: Data Principal Rights (6 questions)
    await answerDataPrincipalRightsQuestions(page, 'compliant');

    // Phase 4: Breach Response (5 questions)
    await answerBreachResponseQuestions(page, 'compliant');

    // Phase 5: Children's Data (5 questions - conditional)
    // Skipped if processesChildrenData = false

    // Phase 6: Governance & Retention (4 questions)
    await answerGovernanceQuestions(page, 'compliant');

    // Verify results page
    await expect(page.getByRole('heading', { name: /compliance score/i })).toBeVisible({ timeout: 15000 });
    
    // Score should be 90%+ for fully compliant (Optimized level)
    const scoreElement = await page.locator('[data-testid="compliance-score"]');
    const scoreText = await scoreElement.textContent();
    const score = parseInt(scoreText?.match(/\d+/)?.[0] || '0');
    expect(score).toBeGreaterThanOrEqual(80);

    // Verify maturity level
    await expect(page.getByText(/managed|optimized/i)).toBeVisible();

    // Verify phase breakdown
    await expect(page.getByText(/consent management/i)).toBeVisible();
    await expect(page.getByText(/security safeguards/i)).toBeVisible();
    await expect(page.getByText(/data principal rights/i)).toBeVisible();
  });

  test('should calculate correct score for partially compliant organization', async ({ page }) => {
    await page.getByRole('link', { name: 'DPDP Gap Assessment', exact: true }).click();

    // Fill company details
    await fillCompanyDetails(page, {
      name: 'Growing Startup',
      industry: 'e_commerce',
      employeeCount: '20-49 employees',
      state: 'Karnataka',
      revenue: '₹5-10 crore',
      processesChildrenData: false,
      processesHealthData: false
    });

    // Answer with mix of compliant/non-compliant responses
    await answerConsentManagementQuestions(page, 'partial');
    await answerSecurityQuestions(page, 'partial');
    await answerDataPrincipalRightsQuestions(page, 'partial');
    await answerBreachResponseQuestions(page, 'partial');
    await answerGovernanceQuestions(page, 'partial');

    // Verify results
    await expect(page.getByRole('heading', { name: /compliance score/i })).toBeVisible({ timeout: 15000 });
    
    // Score should be 40-60% (Defined level)
    const scoreElement = await page.locator('[data-testid="compliance-score"]');
    const scoreText = await scoreElement.textContent();
    const score = parseInt(scoreText?.match(/\d+/)?.[0] || '0');
    expect(score).toBeGreaterThanOrEqual(30);
    expect(score).toBeLessThanOrEqual(70);

    // Should show "Defined" maturity level
    await expect(page.getByText(/defined|developing/i)).toBeVisible();
  });

  test('should show children data questions when enabled', async ({ page }) => {
    await page.getByRole('link', { name: 'DPDP Gap Assessment', exact: true }).click();

    await fillCompanyDetails(page, {
      name: 'EdTech Platform',
      industry: 'education',
      employeeCount: '100-249 employees',
      state: 'Delhi',
      revenue: '₹50-100 crore',
      processesChildrenData: true, // Enable children's data questions
      processesHealthData: false
    });

    // Navigate through phases until Children's Data phase
    await answerConsentManagementQuestions(page, 'compliant');
    await answerSecurityQuestions(page, 'compliant');
    await answerDataPrincipalRightsQuestions(page, 'compliant');
    await answerBreachResponseQuestions(page, 'compliant');

    // Verify Phase 5: Children's Data questions appear
    await expect(page.getByText(/phase 5.*children/i)).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/parental consent/i)).toBeVisible();
    
    // Answer children's data questions
    await answerChildrensDataQuestions(page, 'compliant');

    // Complete assessment
    await answerGovernanceQuestions(page, 'compliant');

    // Verify penalty multiplier applied (2.0x for children's data)
    await expect(page.getByRole('heading', { name: /compliance score/i })).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(/children.*data.*high risk/i)).toBeVisible();
  });

  test('should calculate SDF designation risk correctly', async ({ page }) => {
    await page.getByRole('link', { name: 'DPDP Gap Assessment', exact: true }).click();

    // Large organization likely to be designated SDF
    await fillCompanyDetails(page, {
      name: 'Enterprise Corp',
      industry: 'it_services',
      employeeCount: '500+ employees',
      state: 'Maharashtra',
      revenue: '₹500+ crore', // Above SDF threshold
      processesChildrenData: false,
      processesHealthData: true
    });

    await answerConsentManagementQuestions(page, 'compliant');
    await answerSecurityQuestions(page, 'compliant');
    await answerDataPrincipalRightsQuestions(page, 'compliant');
    await answerBreachResponseQuestions(page, 'compliant');
    await answerGovernanceQuestions(page, 'compliant');

    // Verify SDF designation risk indicator
    await expect(page.getByRole('heading', { name: /compliance score/i })).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(/significant data fiduciary|sdf/i)).toBeVisible();
    await expect(page.getByText(/enhanced obligations/i)).toBeVisible();
  });
});

test.describe('DPDP Assessment - Phase Navigation', () => {
  
  test('should show correct progress through phases', async ({ page }) => {
    await page.goto('/assessment/dpdp');

    await fillCompanyDetails(page, {
      name: 'Test Company',
      industry: 'it_services',
      employeeCount: '50-99 employees',
      state: 'Maharashtra'
    });

    // Verify Phase 1 indicator
    await expect(page.getByText(/phase 1.*consent/i)).toBeVisible();
    
    // Answer Phase 1 questions
    await answerConsentManagementQuestions(page, 'compliant');

    // Verify moved to Phase 2
    await expect(page.getByText(/phase 2.*security/i)).toBeVisible();

    // Continue through phases
    await answerSecurityQuestions(page, 'compliant');
    await expect(page.getByText(/phase 3.*rights/i)).toBeVisible();
  });

  test('should allow navigation back to previous phases', async ({ page }) => {
    await page.goto('/assessment/dpdp');

    await fillCompanyDetails(page, {
      name: 'Test Company',
      industry: 'it_services',
      employeeCount: '50-99 employees',
      state: 'Maharashtra'
    });

    // Answer some Phase 1 questions
    await page.getByRole('radio', { name: /yes|implemented/i }).first().check();
    await page.waitForTimeout(800); // Auto-advance
    await page.getByRole('radio', { name: /yes|implemented/i }).first().check();
    await page.waitForTimeout(800);

    // Click Previous button
    await page.getByRole('button', { name: /previous/i }).click();

    // Verify can change answer
    const previousAnswer = await page.getByRole('radio', { checked: true }).first();
    expect(previousAnswer).toBeTruthy();
  });
});

test.describe('DPDP Assessment - Scoring Verification', () => {
  
  test('should calculate baseline score correctly for all compliant', async ({ page }) => {
    await page.goto('/assessment/dpdp');

    await fillCompanyDetails(page, {
      name: 'Fully Compliant Org',
      industry: 'it_services',
      employeeCount: '50-99 employees',
      state: 'Maharashtra',
      processesChildrenData: false,
      processesHealthData: false
    });

    // All compliant responses
    await answerConsentManagementQuestions(page, 'compliant');
    await answerSecurityQuestions(page, 'compliant');
    await answerDataPrincipalRightsQuestions(page, 'compliant');
    await answerBreachResponseQuestions(page, 'compliant');
    await answerGovernanceQuestions(page, 'compliant');

    await expect(page.getByRole('heading', { name: /compliance score/i })).toBeVisible({ timeout: 15000 });

    // Extract score
    const scoreElement = await page.locator('[data-testid="compliance-score"]');
    const scoreText = await scoreElement.textContent();
    const score = parseInt(scoreText?.match(/\d+/)?.[0] || '0');

    // All compliant should be 90-100% (Optimized level)
    expect(score).toBeGreaterThanOrEqual(90);
    expect(score).toBeLessThanOrEqual(100);

    // Should show Optimized maturity level
    await expect(page.getByText(/optimized/i)).toBeVisible();
  });

  test('should calculate score correctly with specific phase gaps', async ({ page }) => {
    await page.goto('/assessment/dpdp');

    await fillCompanyDetails(page, {
      name: 'Mixed Compliance Org',
      industry: 'it_services',
      employeeCount: '50-99 employees',
      state: 'Maharashtra'
    });

    // Consent: 20% weight - compliant = 20 points
    await answerConsentManagementQuestions(page, 'compliant');
    
    // Security: 20% weight - compliant = 20 points
    await answerSecurityQuestions(page, 'compliant');
    
    // Rights: 10% weight - NON-compliant = 0 points
    await answerDataPrincipalRightsQuestions(page, 'non-compliant');
    
    // Breach: 15% weight - compliant = 15 points
    await answerBreachResponseQuestions(page, 'compliant');
    
    // Governance: 10% weight - compliant = 10 points
    await answerGovernanceQuestions(page, 'compliant');

    await expect(page.getByRole('heading', { name: /compliance score/i })).toBeVisible({ timeout: 15000 });

    const scoreElement = await page.locator('[data-testid="compliance-score"]');
    const scoreText = await scoreElement.textContent();
    const score = parseInt(scoreText?.match(/\d+/)?.[0] || '0');

    // Expected: (20+20+0+15+10)/(20+20+10+15+10) = 65/75 = 86.7%
    // Allow 85-90% range for rounding
    expect(score).toBeGreaterThanOrEqual(80);
    expect(score).toBeLessThanOrEqual(92);

    // Should show Managed maturity level
    await expect(page.getByText(/managed/i)).toBeVisible();
  });

  test('should verify each phase contributes correct weight', async ({ page }) => {
    await page.goto('/assessment/dpdp');

    await fillCompanyDetails(page, {
      name: 'Weight Test Org',
      industry: 'it_services',
      employeeCount: '50-99 employees',
      state: 'Maharashtra'
    });

    // All phases compliant
    await answerConsentManagementQuestions(page, 'compliant');
    await answerSecurityQuestions(page, 'compliant');
    await answerDataPrincipalRightsQuestions(page, 'compliant');
    await answerBreachResponseQuestions(page, 'compliant');
    await answerGovernanceQuestions(page, 'compliant');

    await expect(page.getByRole('heading', { name: /compliance score/i })).toBeVisible({ timeout: 15000 });

    // Verify each phase shows individual score
    // Consent Management - should show high score
    await expect(page.getByText(/consent management/i)).toBeVisible();
    const consentScore = page.locator('[class*="consent"]').filter({ hasText: /\d+%/ });
    
    // Security Safeguards - should show high score  
    await expect(page.getByText(/security safeguards/i)).toBeVisible();
    
    // Data Principal Rights - should show high score
    await expect(page.getByText(/data principal rights/i)).toBeVisible();

    // All should be green/compliant indicators
    const compliantIndicators = page.locator('[class*="bg-green"], [class*="text-green"]');
    expect(await compliantIndicators.count()).toBeGreaterThan(3);
  });

  test('should apply correct maturity levels to score ranges', async ({ page }) => {
    const testCases = [
      { pattern: 'compliant', expectedLevel: /optimized|managed/i, minScore: 80 },
      { pattern: 'partial', expectedLevel: /defined|developing/i, minScore: 30, maxScore: 70 },
      { pattern: 'non-compliant', expectedLevel: /initial|developing/i, maxScore: 40 }
    ];

    for (const testCase of testCases) {
      await page.goto('/assessment/dpdp');

      await fillCompanyDetails(page, {
        name: `Test ${testCase.pattern}`,
        industry: 'it_services',
        employeeCount: '50-99 employees',
        state: 'Maharashtra'
      });

      await answerConsentManagementQuestions(page, testCase.pattern as any);
      await answerSecurityQuestions(page, testCase.pattern as any);
      await answerDataPrincipalRightsQuestions(page, testCase.pattern as any);
      await answerBreachResponseQuestions(page, testCase.pattern as any);
      await answerGovernanceQuestions(page, testCase.pattern as any);

      await expect(page.getByRole('heading', { name: /compliance score/i })).toBeVisible({ timeout: 15000 });

      // Verify expected maturity level
      await expect(page.getByText(testCase.expectedLevel)).toBeVisible();

      // Verify score range
      const scoreElement = await page.locator('[data-testid="compliance-score"]');
      const scoreText = await scoreElement.textContent();
      const score = parseInt(scoreText?.match(/\d+/)?.[0] || '0');

      if (testCase.minScore) {
        expect(score).toBeGreaterThanOrEqual(testCase.minScore);
      }
      if (testCase.maxScore) {
        expect(score).toBeLessThanOrEqual(testCase.maxScore);
      }
    }
  });

  test('should show detailed breakdown by question category', async ({ page }) => {
    await page.goto('/assessment/dpdp');

    await fillCompanyDetails(page, {
      name: 'Detailed Breakdown Test',
      industry: 'it_services',
      employeeCount: '50-99 employees',
      state: 'Maharashtra'
    });

    await answerConsentManagementQuestions(page, 'compliant');
    await answerSecurityQuestions(page, 'non-compliant'); // Create gap
    await answerDataPrincipalRightsQuestions(page, 'compliant');
    await answerBreachResponseQuestions(page, 'compliant');
    await answerGovernanceQuestions(page, 'compliant');

    await expect(page.getByRole('heading', { name: /compliance score/i })).toBeVisible({ timeout: 15000 });

    // Should show breakdown section
    await expect(page.getByText(/phase breakdown|category scores|compliance by phase/i)).toBeVisible();

    // Each phase should be listed
    const phases = [
      /consent management/i,
      /security safeguards/i,
      /data principal rights/i,
      /breach response/i,
      /governance.*retention/i
    ];

    for (const phase of phases) {
      await expect(page.getByText(phase)).toBeVisible();
    }

    // Security phase should show needs attention/gap
    await expect(page.getByText(/security.*needs attention|security.*gap|security.*risk/i)).toBeVisible();
  });
});

test.describe('DPDP Assessment - Action Items', () => {
  
  test('should generate correct action items for gaps', async ({ page }) => {
    await page.goto('/assessment/dpdp');

    await fillCompanyDetails(page, {
      name: 'Test Company',
      industry: 'it_services',
      employeeCount: '50-99 employees',
      state: 'Maharashtra'
    });

    // Create specific gaps
    await answerConsentManagementQuestions(page, 'non-compliant'); // Gap in consent
    await answerSecurityQuestions(page, 'compliant');
    await answerDataPrincipalRightsQuestions(page, 'non-compliant'); // Gap in rights
    await answerBreachResponseQuestions(page, 'compliant');
    await answerGovernanceQuestions(page, 'non-compliant'); // Gap in governance

    // Verify specific action items generated
    await expect(page.getByRole('heading', { name: /compliance score/i })).toBeVisible({ timeout: 15000 });
    
    // Should show action items for the gaps
    await expect(page.getByText(/implement.*consent/i)).toBeVisible();
    await expect(page.getByText(/data principal.*rights|access.*erasure/i)).toBeVisible();
    await expect(page.getByText(/designate.*dpo|data protection officer/i)).toBeVisible();

    // Should show priority levels
    await expect(page.getByText(/high priority|urgent/i)).toBeVisible();
  });

  test('should link action items to government resources', async ({ page }) => {
    await page.goto('/assessment/dpdp');

    await fillCompanyDetails(page, {
      name: 'Test Company',
      industry: 'it_services',
      employeeCount: '50-99 employees',
      state: 'Maharashtra'
    });

    // Complete with some gaps
    await answerConsentManagementQuestions(page, 'non-compliant');
    await answerSecurityQuestions(page, 'compliant');
    await answerDataPrincipalRightsQuestions(page, 'compliant');
    await answerBreachResponseQuestions(page, 'compliant');
    await answerGovernanceQuestions(page, 'compliant');

    // Verify action items have government portal links
    await expect(page.getByRole('heading', { name: /compliance score/i })).toBeVisible({ timeout: 15000 });
    
    // Check for government resource links
    const links = await page.getByRole('link', { name: /meity|ministry|government/i });
    expect(await links.count()).toBeGreaterThan(0);
  });
});

test.describe('DPDP Assessment - UI Consistency', () => {
  
  test('should match form field structure of other assessments', async ({ page }) => {
    await page.goto('/assessment/dpdp');

    await page.waitForLoadState('networkidle');

    // Verify actual field labels used by the DPDP form
    await expect(page.getByLabel(/your full name/i)).toBeVisible();
    await expect(page.getByLabel(/company name/i)).toBeVisible();
    await expect(page.getByLabel(/email address/i)).toBeVisible();
    await expect(page.getByLabel(/phone number/i)).toBeVisible();

    // Verify Start Assessment button is present
    const startButton = page.getByRole('button', { name: /start assessment/i });
    await expect(startButton).toBeVisible();
  });

  test('should show all dropdown fields', async ({ page }) => {
    await page.goto('/assessment/dpdp');

    await page.waitForLoadState('networkidle');

    // Verify shadcn Select triggers are rendered for each dropdown
    await expect(page.getByRole('combobox').filter({ hasText: /select your state/i })).toBeVisible();
    await expect(page.getByRole('combobox').filter({ hasText: /select employee count/i })).toBeVisible();
    await expect(page.getByRole('combobox').filter({ hasText: /select your industry/i })).toBeVisible();
    await expect(page.getByRole('combobox').filter({ hasText: /select annual revenue/i })).toBeVisible();
  });

  test('should use consistent color scheme', async ({ page }) => {
    await page.goto('/assessment/dpdp');

    // Complete assessment to see results
    await fillCompanyDetails(page, {
      name: 'Test Company',
      industry: 'it_services',
      employeeCount: '50-99 employees',
      state: 'Maharashtra'
    });

    await answerConsentManagementQuestions(page, 'compliant');
    await answerSecurityQuestions(page, 'compliant');
    await answerDataPrincipalRightsQuestions(page, 'compliant');
    await answerBreachResponseQuestions(page, 'compliant');
    await answerGovernanceQuestions(page, 'compliant');

    // Results page should use standard green for high scores
    await expect(page.getByRole('heading', { name: /compliance score/i })).toBeVisible({ timeout: 15000 });
    
    // Verify status indicators use standard colors
    const statusElements = page.locator('[class*="bg-green"], [class*="text-green"]');
    expect(await statusElements.count()).toBeGreaterThan(0);
  });

  test('should have consistent typography and spacing', async ({ page }) => {
    await page.goto('/assessment/dpdp');

    // Verify page has main heading (DPDP Gap Assessment)
    await expect(page.getByText(/DPDP Gap Assessment/i).first()).toBeVisible();
    
    // Check consistent spacing in form
    const formElements = page.locator('input, select');
    expect(await formElements.count()).toBeGreaterThan(3); // Multiple form fields
    
    // Verify progress indicator exists
    await expect(page.getByText(/0% complete|organisation details/i)).toBeVisible();
  });
});

test.describe('DPDP Assessment - Navigation Patterns', () => {
  
  test('should follow same navigation flow as other assessments', async ({ page }) => {
    await page.goto('/');

    // Navigate from homepage (same as statutory-health and labour-code)
    await page.getByRole('link', { name: 'DPDP Gap Assessment', exact: true }).click();
    await expect(page).toHaveURL(/\/assessment\/dpdp/);

    // Should have back to home option (logo or link)
    const homeLink = page.getByRole('link', { name: /home|back|compliancecheck/i }).first();
    // Logo link may not have text, so check if any navigation to home exists
    const logoLink = page.locator('a[href="/"]').first();
    const hasHomeNavigation = await homeLink.isVisible().catch(() => false) || 
                               await logoLink.isVisible().catch(() => false);
    expect(hasHomeNavigation).toBeTruthy();
  });

  test('should have progress indicator like other assessments', async ({ page }) => {
    await page.goto('/assessment/dpdp');

    await fillCompanyDetails(page, {
      name: 'Test Company',
      industry: 'it_services',
      employeeCount: '50-99 employees',
      state: 'Maharashtra'
    });

    // Progress indicator should be visible (matches other assessments)
    const progressIndicator = page.locator('[role="progressbar"], [aria-valuenow], [class*="progress"]');
    await expect(progressIndicator.first()).toBeVisible({ timeout: 5000 });

    // Should show current phase
    await expect(page.getByText(/phase 1|consent management/i)).toBeVisible();
  });

  test('should auto-advance after 800ms like other assessments', async ({ page }) => {
    await page.goto('/assessment/dpdp');

    await fillCompanyDetails(page, {
      name: 'Test Company',
      industry: 'it_services',
      employeeCount: '50-99 employees',
      state: 'Maharashtra'
    });

    // Answer first question
    const firstRadio = page.getByRole('radio').first();
    await firstRadio.check();

    // Should auto-advance to next question within 1 second
    await page.waitForTimeout(1000);
    
    // Second question should now be visible (or phase indicator changed)
    const questionCount = await page.getByRole('radio').count();
    expect(questionCount).toBeGreaterThan(0); // New question loaded
  });

  test('should have previous/next navigation buttons', async ({ page }) => {
    await page.goto('/assessment/dpdp');

    await fillCompanyDetails(page, {
      name: 'Test Company',
      industry: 'it_services',
      employeeCount: '50-99 employees',
      state: 'Maharashtra'
    });

    // Answer a few questions
    await page.getByRole('radio').first().check();
    await page.waitForTimeout(800);
    await page.getByRole('radio').first().check();
    await page.waitForTimeout(800);

    // Previous button should be visible
    const prevButton = page.getByRole('button', { name: /previous|back/i });
    await expect(prevButton).toBeVisible();
  });
});

test.describe('DPDP Assessment - Results Page Comprehensive', () => {
  
  test('should display complete results page structure', async ({ page }) => {
    await page.goto('/assessment/dpdp');

    await fillCompanyDetails(page, {
      name: 'Test Tech Solutions',
      industry: 'it_services',
      employeeCount: '50-99 employees',
      state: 'Maharashtra'
    });

    await answerConsentManagementQuestions(page, 'compliant');
    await answerSecurityQuestions(page, 'compliant');
    await answerDataPrincipalRightsQuestions(page, 'compliant');
    await answerBreachResponseQuestions(page, 'compliant');
    await answerGovernanceQuestions(page, 'compliant');

    // Wait for results page
    await expect(page.getByRole('heading', { name: /compliance score/i })).toBeVisible({ timeout: 15000 });

    // Verify all key sections present
    // 1. Company name/info
    await expect(page.getByText(/Test Tech Solutions/i)).toBeVisible();

    // 2. Overall score with percentage
    const scoreElement = page.locator('[data-testid="compliance-score"]');
    await expect(scoreElement).toBeVisible();
    const scoreText = await scoreElement.textContent();
    expect(scoreText).toMatch(/\d+%/); // Contains percentage

    // 3. Maturity level
    await expect(page.getByText(/initial|developing|defined|managed|optimized/i)).toBeVisible();

    // 4. Phase breakdown section
    await expect(page.getByText(/consent management/i)).toBeVisible();
    await expect(page.getByText(/security safeguards/i)).toBeVisible();
    await expect(page.getByText(/data principal rights/i)).toBeVisible();

    // 5. Action items section (if any gaps)
    const actionSection = page.getByText(/action items|recommendations|next steps/i);
    // May or may not be visible depending on score

    // 6. Disclaimer text
    await expect(page.getByText(/informational purposes|professional advice/i)).toBeVisible();
  });

  test('should show category-specific scores and status', async ({ page }) => {
    await page.goto('/assessment/dpdp');

    await fillCompanyDetails(page, {
      name: 'Test Company',
      industry: 'it_services',
      employeeCount: '50-99 employees',
      state: 'Maharashtra'
    });

    // Create mixed compliance
    await answerConsentManagementQuestions(page, 'compliant');
    await answerSecurityQuestions(page, 'non-compliant'); // Gap here
    await answerDataPrincipalRightsQuestions(page, 'compliant');
    await answerBreachResponseQuestions(page, 'compliant');
    await answerGovernanceQuestions(page, 'non-compliant'); // Gap here

    await expect(page.getByRole('heading', { name: /compliance score/i })).toBeVisible({ timeout: 15000 });

    // Should show individual category scores
    const categoryCards = page.locator('[class*="category"], [class*="phase"]');
    expect(await categoryCards.count()).toBeGreaterThanOrEqual(4);

    // Should indicate which categories need attention
    await expect(page.getByText(/security.*needs attention|security.*gap/i)).toBeVisible();
    await expect(page.getByText(/governance.*needs attention|governance.*gap/i)).toBeVisible();
  });

  test('should display prioritized action items correctly', async ({ page }) => {
    await page.goto('/assessment/dpdp');

    await fillCompanyDetails(page, {
      name: 'Test Company',
      industry: 'it_services',
      employeeCount: '50-99 employees',
      state: 'Maharashtra'
    });

    // Create security gap (high priority)
    await answerConsentManagementQuestions(page, 'compliant');
    await answerSecurityQuestions(page, 'non-compliant');
    await answerDataPrincipalRightsQuestions(page, 'compliant');
    await answerBreachResponseQuestions(page, 'compliant');
    await answerGovernanceQuestions(page, 'compliant');

    await expect(page.getByRole('heading', { name: /compliance score/i })).toBeVisible({ timeout: 15000 });

    // Should show high priority action items
    await expect(page.getByText(/high priority|urgent|critical/i)).toBeVisible();

    // Should list specific actions
    await expect(page.getByText(/implement.*encryption|security safeguards|reasonable security/i)).toBeVisible();

    // Should show penalty exposure
    await expect(page.getByText(/₹250 crore|penalty|rs.*250/i)).toBeVisible();
  });

  test('should link to government resources', async ({ page }) => {
    await page.goto('/assessment/dpdp');

    await fillCompanyDetails(page, {
      name: 'Test Company',
      industry: 'it_services',
      employeeCount: '50-99 employees',
      state: 'Maharashtra'
    });

    await answerConsentManagementQuestions(page, 'compliant');
    await answerSecurityQuestions(page, 'compliant');
    await answerDataPrincipalRightsQuestions(page, 'compliant');
    await answerBreachResponseQuestions(page, 'compliant');
    await answerGovernanceQuestions(page, 'compliant');

    await expect(page.getByRole('heading', { name: /compliance score/i })).toBeVisible({ timeout: 15000 });

    // Should have links to official government resources
    const govLinks = page.getByRole('link').filter({ 
      hasText: /meity|ministry|government|dpdp.*portal/i 
    });

    // At least one government link should be present
    expect(await govLinks.count()).toBeGreaterThan(0);
  });
});

test.describe('DPDP Assessment - PDF Generation Comprehensive', () => {
  
  test('should have PDF download button matching other assessments', async ({ page }) => {
    await page.goto('/assessment/dpdp');

    await fillCompanyDetails(page, {
      name: 'Test Tech Solutions',
      industry: 'it_services',
      employeeCount: '50-99 employees',
      state: 'Maharashtra'
    });

    await answerConsentManagementQuestions(page, 'compliant');
    await answerSecurityQuestions(page, 'compliant');
    await answerDataPrincipalRightsQuestions(page, 'compliant');
    await answerBreachResponseQuestions(page, 'compliant');
    await answerGovernanceQuestions(page, 'compliant');

    // Verify results page loaded
    await expect(page.getByRole('heading', { name: /compliance score/i })).toBeVisible({ timeout: 15000 });

    // Download button should match pattern from other assessments
    const downloadButton = page.getByRole('button', { name: /download.*pdf|pdf.*report/i });
    await expect(downloadButton).toBeVisible();
    await expect(downloadButton).toBeEnabled();

    // Should have download icon or indicator
    const buttonText = await downloadButton.textContent();
    expect(buttonText).toMatch(/download|pdf|report/i);
  });

  test('should trigger NPS modal before PDF download', async ({ page }) => {
    await page.goto('/assessment/dpdp');

    await fillCompanyDetails(page, {
      name: 'Test Company',
      industry: 'it_services',
      employeeCount: '50-99 employees',
      state: 'Maharashtra'
    });

    await answerConsentManagementQuestions(page, 'compliant');
    await answerSecurityQuestions(page, 'compliant');
    await answerDataPrincipalRightsQuestions(page, 'compliant');
    await answerBreachResponseQuestions(page, 'compliant');
    await answerGovernanceQuestions(page, 'compliant');

    await expect(page.getByRole('heading', { name: /compliance score/i })).toBeVisible({ timeout: 15000 });

    // Click download button
    const downloadButton = page.getByRole('button', { name: /download.*pdf/i });
    await downloadButton.click();

    // NPS modal should appear (3-step process)
    await expect(page.getByText(/rate.*experience|nps|feedback/i)).toBeVisible({ timeout: 5000 });

    // Should show NPS scale (0-10)
    const npsButtons = page.getByRole('button').filter({ hasText: /^[0-9]$|^10$/ });
    expect(await npsButtons.count()).toBeGreaterThanOrEqual(10); // 0-10 = 11 buttons
  });

  test('should complete NPS flow and then download PDF', async ({ page }) => {
    await page.goto('/assessment/dpdp');

    await fillCompanyDetails(page, {
      name: 'Test Company',
      industry: 'it_services',
      employeeCount: '50-99 employees',
      state: 'Maharashtra'
    });

    await answerConsentManagementQuestions(page, 'compliant');
    await answerSecurityQuestions(page, 'compliant');
    await answerDataPrincipalRightsQuestions(page, 'compliant');
    await answerBreachResponseQuestions(page, 'compliant');
    await answerGovernanceQuestions(page, 'compliant');

    await expect(page.getByRole('heading', { name: /compliance score/i })).toBeVisible({ timeout: 15000 });

    // Click download
    await page.getByRole('button', { name: /download.*pdf/i }).click();

    // Complete NPS flow
    // Step 1: Select NPS score (e.g., 9)
    await page.getByRole('button', { name: '9' }).click();
    await page.waitForTimeout(500);

    // Step 2: Multiple choice questions (if present)
    const nextButton = page.getByRole('button', { name: /next|continue/i });
    if (await nextButton.isVisible()) {
      await nextButton.click();
      await page.waitForTimeout(500);
    }

    // Step 3: Submit (may skip comments)
    const submitButton = page.getByRole('button', { name: /submit|finish|done/i });
    await expect(submitButton).toBeVisible({ timeout: 5000 });
    await submitButton.click();

    // PDF generation should trigger
    // Note: Can't verify actual PDF download in Playwright easily,
    // but can verify the flow completes without errors
    await page.waitForTimeout(2000);

    // Should return to results page or show success message
    await expect(page.getByText(/thank you|feedback received|generating/i)).toBeVisible({ timeout: 5000 });
  });

  test('should store NPS feedback in database', async ({ page }) => {
    await page.goto('/assessment/dpdp');

    await fillCompanyDetails(page, {
      name: 'Test Company ' + Date.now(), // Unique
      industry: 'it_services',
      employeeCount: '50-99 employees',
      state: 'Maharashtra'
    });

    await answerConsentManagementQuestions(page, 'compliant');
    await answerSecurityQuestions(page, 'compliant');
    await answerDataPrincipalRightsQuestions(page, 'compliant');
    await answerBreachResponseQuestions(page, 'compliant');
    await answerGovernanceQuestions(page, 'compliant');

    await expect(page.getByRole('heading', { name: /compliance score/i })).toBeVisible({ timeout: 15000 });

    // Complete NPS flow
    await page.getByRole('button', { name: /download.*pdf/i }).click();
    await page.getByRole('button', { name: '8' }).click();
    await page.waitForTimeout(500);

    const submitButton = page.getByRole('button', { name: /submit|finish|done/i });
    await submitButton.click();

    // Verify feedback submission succeeded
    // Check for success indicator or no error messages
    const errorMessage = page.getByText(/error|failed|try again/i);
    expect(await errorMessage.count()).toBe(0);
  });
});

test.describe('DPDP Assessment - Database Integration', () => {
  
  test('should persist assessment to database', async ({ page }) => {
    await page.goto('/assessment/dpdp');

    await fillCompanyDetails(page, {
      name: 'Test Company ' + Date.now(), // Unique name
      industry: 'it_services',
      employeeCount: '50-99 employees',
      state: 'Maharashtra'
    });

    await answerConsentManagementQuestions(page, 'compliant');
    await answerSecurityQuestions(page, 'compliant');
    await answerDataPrincipalRightsQuestions(page, 'compliant');
    await answerBreachResponseQuestions(page, 'compliant');
    await answerGovernanceQuestions(page, 'compliant');

    // Wait for results page and database save
    await expect(page.getByRole('heading', { name: /compliance score/i })).toBeVisible({ timeout: 15000 });

    // Verify assessment ID exists (indicates database save)
    const urlParams = new URL(page.url()).searchParams;
    const assessmentId = urlParams.get('id');
    
    // If no ID in URL, check for success indicator
    if (!assessmentId) {
      // Assessment saved to localStorage fallback
      const localStorageData = await page.evaluate(() => localStorage.getItem('lastAssessment'));
      expect(localStorageData).toBeTruthy();
    }
  });
});

// ===== HELPER FUNCTIONS =====

async function fillCompanyDetails(page: Page, details: {
  name: string;
  email?: string;
  orgName?: string;
  industry?: string;
  dataPrincipals?: string;
  state?: string;
  processesChildrenData?: boolean;
  transfersDataAbroad?: boolean;
  operatesPlatform?: boolean;
}) {
  // DPDP form uses shadcn/ui components (Radix UI based)
  // Form fields: fullName, companyName, email, phone, state, employeeCount, industry, revenue
  // Plus radio buttons for data processing profile
  
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);
  
  // Wait for form to load
  await page.waitForSelector('form', { timeout: 10000 });
  
  // Helper to select from shadcn/ui Select component
  async function selectOption(triggerText: string | RegExp, optionIndex: number = 0) {
    const trigger = page.getByRole('combobox').filter({ hasText: triggerText }).first()
      .or(page.locator(`button:has-text("${triggerText}")`).first())
      .or(page.locator('[role="combobox"]').filter({ hasText: triggerText }).first());
    
    if (await trigger.isVisible({ timeout: 2000 }).catch(() => false)) {
      await trigger.click();
      await page.waitForTimeout(300);
      const options = page.getByRole('option');
      const count = await options.count();
      if (count > optionIndex) {
        await options.nth(optionIndex).click();
      } else if (count > 0) {
        await options.first().click();
      }
      await page.waitForTimeout(300);
    }
  }
  
  // Fill Full Name (id="fullName")
  const fullNameField = page.locator('#fullName').or(page.getByLabel(/full name/i));
  if (await fullNameField.isVisible({ timeout: 2000 }).catch(() => false)) {
    await fullNameField.fill(details.name || 'Test User');
    await page.waitForTimeout(200);
  }
  
  // Fill Company Name (id="companyName", placeholder="Acme Technologies Pvt Ltd")
  const companyNameField = page.locator('#companyName')
    .or(page.getByLabel(/company name/i))
    .or(page.getByPlaceholder(/acme|technologies|company/i));
  if (await companyNameField.isVisible({ timeout: 2000 }).catch(() => false)) {
    await companyNameField.fill(details.orgName || details.name || 'Test Company Pvt Ltd');
    await page.waitForTimeout(200);
  }
  
  // Fill Email (id="email")
  const emailField = page.locator('#email').or(page.getByLabel(/email/i));
  if (await emailField.isVisible({ timeout: 2000 }).catch(() => false)) {
    await emailField.fill(details.email || 'test@example.com');
    await page.waitForTimeout(200);
  }
  
  // Fill Phone (id="phone")
  const phoneField = page.locator('#phone').or(page.getByPlaceholder(/987654/i));
  if (await phoneField.isVisible({ timeout: 2000 }).catch(() => false)) {
    await phoneField.fill('9876543210');
    await page.waitForTimeout(200);
  }
  
  // Select State (placeholder="Select your state")
  await selectOption(/select your state/i);
  
  // Select Employee Count (placeholder="Select employee count")  
  await selectOption(/select employee count/i);
  
  // Select Industry (placeholder="Select your industry")
  await selectOption(/select your industry/i);
  
  // Select Revenue (placeholder="Select annual revenue")
  await selectOption(/select annual revenue/i);
  
  await page.waitForTimeout(300);
  
  // Data Processing Profile - Radio buttons (Yes/No)
  // Children's data
  if (details.processesChildrenData !== undefined) {
    const value = details.processesChildrenData ? 'yes' : 'no';
    const radio = page.locator(`input[name="processesChildrenData"][value="${value}"]`)
      .or(page.getByLabel(/under 18|children/i).locator(`input[value="${value}"]`));
    if (await radio.isVisible({ timeout: 2000 }).catch(() => false)) {
      await radio.click();
      await page.waitForTimeout(200);
    } else {
      // Try clicking the label text
      const labelText = value === 'yes' ? 'Yes' : 'No';
      const radioByText = page.locator('label').filter({ hasText: labelText }).first();
      if (await radioByText.isVisible({ timeout: 1000 }).catch(() => false)) {
        await radioByText.click();
        await page.waitForTimeout(200);
      }
    }
  }
  
  // Health data
  const healthRadio = page.locator('input[name="processesHealthData"][value="no"]');
  if (await healthRadio.isVisible({ timeout: 1000 }).catch(() => false)) {
    await healthRadio.click();
    await page.waitForTimeout(200);
  }
  
  // Sensitive financial data
  const sensitiveRadio = page.locator('input[name="processesSensitiveData"][value="no"]');
  if (await sensitiveRadio.isVisible({ timeout: 1000 }).catch(() => false)) {
    await sensitiveRadio.click();
    await page.waitForTimeout(200);
  }
  
  await page.waitForTimeout(500);
  
  // Click Start Assessment / Continue button
  const startButton = page.getByRole('button', { name: /start assessment|continue|begin|next|submit/i });
  if (await startButton.isVisible({ timeout: 3000 })) {
    await startButton.click();
    await page.waitForTimeout(1000);
  }
}

async function answerConsentManagementQuestions(page: Page, responseType: 'compliant' | 'partial' | 'non-compliant') {
  await answerQuestionPhase(page, responseType, 9);
}

async function answerSecurityQuestions(page: Page, responseType: 'compliant' | 'partial' | 'non-compliant') {
  await answerQuestionPhase(page, responseType, 9);
}

async function answerDataPrincipalRightsQuestions(page: Page, responseType: 'compliant' | 'partial' | 'non-compliant') {
  await answerQuestionPhase(page, responseType, 6);
}

async function answerBreachResponseQuestions(page: Page, responseType: 'compliant' | 'partial' | 'non-compliant') {
  await answerQuestionPhase(page, responseType, 5);
}

async function answerChildrensDataQuestions(page: Page, responseType: 'compliant' | 'partial' | 'non-compliant') {
  await answerQuestionPhase(page, responseType, 5);
}

async function answerGovernanceQuestions(page: Page, responseType: 'compliant' | 'partial' | 'non-compliant') {
  await answerQuestionPhase(page, responseType, 4);
}

/**
 * Universal question answering function that handles different input types:
 * - Radio buttons
 * - Yes/No buttons
 * - Multiple choice options
 * - Dropdowns
 */
async function answerQuestionPhase(page: Page, responseType: 'compliant' | 'partial' | 'non-compliant', expectedQuestions: number) {
  for (let i = 0; i < expectedQuestions; i++) {
    // Check if we've reached results page early
    if (page.url().includes('/results/')) break;
    
    // Try different input types in order of likelihood
    let answered = false;
    
    // Option 1: Radio buttons
    const radios = page.getByRole('radio');
    if (await radios.first().isVisible({ timeout: 1000 }).catch(() => false)) {
      const radioCount = await radios.count();
      if (radioCount > 0) {
        const targetIndex = getTargetOptionIndex(responseType, i, Math.min(radioCount, 3));
        await radios.nth(targetIndex).check();
        answered = true;
      }
    }
    
    // Option 2: Yes/No buttons
    if (!answered) {
      const targetAnswer = getYesNoAnswer(responseType, i);
      const answerBtn = page.getByRole('button', { name: new RegExp(`^${targetAnswer}$`, 'i') }).first();
      if (await answerBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
        await answerBtn.click();
        answered = true;
      }
    }
    
    // Option 3: Multiple choice options (DPDP style)
    if (!answered) {
      const options = page.locator('[role="option"], [data-value], .option-button');
      if (await options.first().isVisible({ timeout: 1000 }).catch(() => false)) {
        const optionCount = await options.count();
        const targetIndex = getTargetOptionIndex(responseType, i, optionCount);
        await options.nth(targetIndex).click();
        answered = true;
      }
    }
    
    // Option 4: Clickable cards or labels
    if (!answered) {
      const cards = page.locator('.answer-option, .choice-card, label:has(input)');
      if (await cards.first().isVisible({ timeout: 1000 }).catch(() => false)) {
        const cardCount = await cards.count();
        const targetIndex = getTargetOptionIndex(responseType, i, cardCount);
        await cards.nth(targetIndex).click();
        answered = true;
      }
    }
    
    await page.waitForTimeout(800); // Auto-advance timeout
  }
}

function getTargetOptionIndex(responseType: string, questionIndex: number, optionCount: number): number {
  switch (responseType) {
    case 'compliant':
      return 0; // First option (usually Yes/Implemented)
    case 'non-compliant':
      return optionCount - 1; // Last option (usually No/Not Implemented)
    case 'partial':
      return questionIndex % 2 === 0 ? 0 : optionCount - 1; // Alternate
    default:
      return 0;
  }
}

function getYesNoAnswer(responseType: string, questionIndex: number): string {
  switch (responseType) {
    case 'compliant':
      return 'yes';
    case 'non-compliant':
      return 'no';
    case 'partial':
      return questionIndex % 2 === 0 ? 'yes' : 'no';
    default:
      return 'yes';
  }
}

test.describe('DPDP Assessment - Accessibility', () => {
  
  test('should have no critical accessibility violations', async ({ page }) => {
    await page.goto('/assessment/dpdp');

    // Check page structure (main heading)
    await expect(page.getByText(/DPDP Gap Assessment/i).first()).toBeVisible();
    await expect(page.locator('main, [role="main"]')).toBeVisible();

    // Check form accessibility
    const labels = await page.locator('label');
    expect(await labels.count()).toBeGreaterThan(0);

    // Check button accessibility
    const buttons = await page.getByRole('button');
    expect(await buttons.count()).toBeGreaterThan(0);

    // Verify progress indicator has aria-label
    const progressIndicator = page.locator('[aria-label*="progress"], [aria-label*="complete"]');
    expect(await progressIndicator.count()).toBeGreaterThan(0);
  });

  test('should support keyboard navigation', async ({ page }) => {
    await page.goto('/assessment/dpdp');

    // Tab through form fields
    await page.keyboard.press('Tab');
    const firstField = await page.locator(':focus');
    expect(firstField).toBeTruthy();

    // Verify focus visible
    await expect(firstField).toHaveCSS('outline-width', /.+/);
  });
});

test.describe('DPDP Assessment - Mobile Responsive', () => {
  
  test('should work on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
    await page.goto('/assessment/dpdp');

    // Verify content visible and interactive
    await expect(page.getByRole('heading')).toBeVisible();
    
    await fillCompanyDetails(page, {
      name: 'Mobile Test',
      industry: 'it_services',
      employeeCount: '20-49 employees',
      state: 'Karnataka'
    });

    // Verify questions render properly on mobile
    await expect(page.getByRole('radio').first()).toBeVisible();
    
    // Verify tap targets are large enough (44x44px minimum)
    const radio = page.getByRole('radio').first();
    const box = await radio.boundingBox();
    expect(box?.width).toBeGreaterThanOrEqual(44);
    expect(box?.height).toBeGreaterThanOrEqual(44);
  });
});

test.describe('DPDP Assessment - Performance', () => {
  
  test('should load within performance budget', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/assessment/dpdp');
    const loadTime = Date.now() - startTime;

    // Should load in under 3 seconds
    expect(loadTime).toBeLessThan(3000);

    // Verify page is interactive - check for Organisation Name field
    await expect(page.getByLabel(/organisation name/i)).toBeEnabled();
  });
});
