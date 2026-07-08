import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for ComplianceCheck testing
 * See https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests',

  /* Only *.spec.ts are Playwright specs. tests/unit/*.test.ts are vitest unit
   * tests (`import ... from 'vitest'`) — Playwright's default testMatch
   * would otherwise pick those up too, fail to import 'vitest' under its
   * CommonJS loader, and abort collection before running a single real
   * test. This bit CI's own unscoped `npx playwright test --project=X` job. */
  testMatch: '**/*.spec.ts',

  /* Run tests in files in parallel */
  fullyParallel: true,
  
  /* Fail the build on CI if you accidentally left test.only in the source code */
  forbidOnly: !!process.env.CI,
  
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  
  /* Opt out of parallel tests on CI */
  workers: process.env.CI ? 1 : undefined,
  
  /* Reporter to use */
  reporter: [
    ['html'],
    ['list'],
    ['json', { outputFile: 'test-results/results.json' }]
  ],
  
  /* Shared settings for all the projects below */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`.
     * Defaults to localhost, NOT production — most specs in this suite call
     * page.goto() with relative paths and depend entirely on this value, so
     * an unset BASE_URL must fail safe (connection refused against a dev
     * server that isn't running) rather than silently drive real browsers,
     * and write real data, against the live site. Always set BASE_URL
     * explicitly to target staging/production (CI already does this via
     * playwright.yml). */
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    
    /* Collect trace when retrying the failed test */
    trace: 'on-first-retry',
    
    /* Screenshot on failure */
    screenshot: 'only-on-failure',
    
    /* Video on failure */
    video: 'retain-on-failure',
    
    /* Timeout for each action */
    actionTimeout: 15000,
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    /* Test against mobile viewports */
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  /* Timeout for each test */
  timeout: 60000,
  
  /* Expect timeout */
  expect: {
    timeout: 10000
  },
});
