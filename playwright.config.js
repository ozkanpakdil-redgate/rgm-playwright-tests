const { defineConfig, devices } = require('@playwright/test');
const performanceReporter = require('./utils/performance-reporter');

module.exports = defineConfig({
  testDir: './tests',
  timeout: 60000,
  expect: {
    timeout: 10000
  },
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 3 : undefined,
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'test-reports' }],
    ['./utils/performance-test-reporter.js'],
  ],
  use: {
    // Base URL for the Red Gate Monitor application
    baseURL: 'https://monitor.red-gate.com',
    trace: 'off',
    screenshot: 'off',
    video: 'off',
    // This prevents the page context from being reused between tests
    contextOptions: {
      ignoreHTTPSErrors: true
    }
  },
  projects: [
    {
      name: 'Chrome',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
        launchOptions: {
          args: [
            '--disable-gpu',
            '--disable-dev-shm-usage',
            '--no-sandbox',
            '--disable-setuid-sandbox'
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
