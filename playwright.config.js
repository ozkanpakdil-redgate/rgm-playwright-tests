const { defineConfig, devices } = require('@playwright/test');
const performanceReporter = require('./utils/performance-reporter');

module.exports = defineConfig({
  testDir: './tests',
  // Increase global timeout for CI environment
  timeout: process.env.CI ? 900000 : 600000,
  expect: {
    // Increase expect timeout for slower environments
    timeout: process.env.CI ? 30000 : 10000
  },
  // Increase retries in CI for flaky tests
  retries: process.env.CI ? 2 : 0,
  // Reduce parallel workers in CI to prevent resource contention
  workers: process.env.CI ? 2 : undefined,
  // Enhanced test result reporting
  reportSlowTests: {
    max: 10,
    threshold: 15000
  },
  // Keep test artifacts for analysis
  preserveOutput: 'always',
  // Enhanced error reporting
  quietMode: false,
  reporter: [
    ['list'],
    ['html', { 
      open: 'never', 
      outputFolder: 'test-reports',
      // Enhanced HTML report settings for more details
      attachmentsBaseURL: 'data/',
      host: 'localhost',
      port: 9323
    }],
    ['json', { 
      outputFile: 'test-reports/test-results.json'
    }],
    ['junit', { 
      outputFile: 'test-reports/junit-results.xml',
      stripANSIControlSequences: true
    }],
    ['dot'],
    ['./utils/performance-test-reporter.js'],
  ],
  use: {
    // Base URL for the Red Gate Monitor application
    baseURL: 'https://monitor.red-gate.com',
    // Enhanced tracing and debugging for detailed reports
    trace: process.env.CI ? 'on' : 'retain-on-failure',
    screenshot: process.env.CI ? 'on' : 'only-on-failure',
    video: process.env.CI ? 'on' : 'retain-on-failure',
    // This prevents the page context from being reused between tests
    contextOptions: {
      ignoreHTTPSErrors: true
    },
    // Add navigation timeout
    navigationTimeout: 30000,
    // Add action timeout
    actionTimeout: 15000,
    // Viewport defaults
    viewport: { width: 1920, height: 1080 },
    // Enhanced test metadata collection
    extraHTTPHeaders: {
      'X-Test-Runner': 'Playwright',
      'X-Test-Environment': process.env.CI ? 'CI' : 'Local'
    },
    // Enable detailed request/response logging
    recordHar: process.env.CI ? undefined : { 
      path: 'test-results/network-logs.har',
      mode: 'minimal'
    },
  },
  projects: [
    {
      name: 'Chrome',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: {
          args: [
            '--disable-gpu',
            '--disable-dev-shm-usage',
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-web-security',
            '--disable-features=IsolateOrigins,site-per-process'
          ]
        }
      }
    },
    {
      name: 'Firefox',
      use: {
        ...devices['Desktop Firefox'],
        viewport: { width: 1920, height: 1080 }
      }
    },
    {
      name: 'Safari',
      use: {
        ...devices['Desktop Safari'],
        viewport: { width: 1920, height: 1080 }
      }
    },
    {
      name: 'Edge',
      use: {
        channel: 'msedge',
        viewport: { width: 1920, height: 1080 }
      }
    },
    // Mobile browsers
    {
      name: 'Mobile Chrome',
      use: {
        ...devices['Pixel 5']
      }
    },
    {
      name: 'Mobile Safari',
      use: {
        ...devices['iPhone 12']
      }
    }
  ]
});
