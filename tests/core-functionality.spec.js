const { test, expect } = require('@playwright/test');
const PerformanceMonitor = require('../utils/performance-monitor');
const fs = require('fs');
const path = require('path');

// Create screenshots directory if it doesn't exist
const screenshotsDir = path.join(__dirname, '../screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir);
}

// Create test reports directory if it doesn't exist
const reportsDir = path.join(__dirname, '../test-reports');
if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir);
}

test.describe('Public UI Functionality Tests', () => {
  let performanceMonitor;

  test.beforeAll(async () => {
    performanceMonitor = new PerformanceMonitor('Public UI Functionality Tests');
  });

  test.beforeEach(async ({ page }) => {
    performanceMonitor.setPage(page);
  });

  test.afterEach(async ({ page }) => {
    // Only take a screenshot on test failure
    const testInfo = test.info();
    if (testInfo.status !== 'passed') {
      const screenshotPath = path.join(
        screenshotsDir,
        `${testInfo.title.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.png`
      );
      await page.screenshot({ path: screenshotPath, fullPage: true });
    }

    // Log performance metrics
    await performanceMonitor.logMetrics(page, testInfo.title);
  });

  test('should verify basic navigation structure', async ({ page }) => {
    await page.goto('https://monitor.red-gate.com', { waitUntil: 'networkidle' });
    
    // Verify main navigation links within the nav section
    const mainNav = page.getByRole('navigation');
    for (const link of ['Overview', 'Alerts', 'Analysis', 'Reports', 'Estate']) {
      await expect(mainNav.getByRole('link', { name: link })).toBeVisible();
    }
    
    // Configuration link should be present
    await expect(page.getByRole('link', { name: 'Configuration' })).toBeVisible();
  });

  test('should test analysis page functionality', async ({ page }) => {
    performanceMonitor.startTiming('analysis-load');
    
    await page.goto('https://monitor.red-gate.com/analysis', { waitUntil: 'networkidle' });
    await performanceMonitor.endTiming('analysis-load', 'pageLoad');

    // Only check for combobox and first metric group presence
    const timeRange = page.getByRole('combobox').first();
    await expect(timeRange).toBeVisible({ timeout: 10000 });
    
    // Just verify any search textbox is present without checking specific placeholder
    const anySearchBox = page.getByRole('textbox').first();
    await expect(anySearchBox).toBeVisible({ timeout: 10000 });
  });

  test('should test reports page functionality', async ({ page }) => {
    performanceMonitor.startTiming('reports-load');
    
    await page.goto('https://monitor.red-gate.com/reports');
    await page.waitForLoadState('networkidle');
    await performanceMonitor.endTiming('reports-load', 'pageLoad');

    // Verify report controls
    await expect(page.getByRole('combobox').filter({ hasText: 'Example Report' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'New report' })).toBeVisible();

    // Verify time range controls
    const timeRangeOptions = [
      '30 minutes',
      '1 hour',
      '6 hours',
      '12 hours',
      '1 day'
    ];

    const timeCombobox = page.getByRole('combobox').filter({ hasText: timeRangeOptions[0] });
    await expect(timeCombobox).toBeVisible();
  });

  test('should test estate page functionality', async ({ page }) => {
    performanceMonitor.startTiming('estate-load');
    
    await page.goto('https://monitor.red-gate.com/estate');
    await page.waitForLoadState('networkidle');
    await performanceMonitor.endTiming('estate-load', 'pageLoad');

    // Verify version info is present
    await expect(page.getByText('SQL Server versions')).toBeVisible();
    
    // Verify filtering controls
    await expect(page.getByRole('textbox', { name: 'Filter' })).toBeVisible();
    await expect(page.getByText('All groups')).toBeVisible();
    await expect(page.getByText('All versions')).toBeVisible();
    await expect(page.getByText('All statuses')).toBeVisible();
  });

  test('should test alerts page functionality', async ({ page }) => {
    performanceMonitor.startTiming('alerts-load');
    
    // Navigate and wait for network response
    const response = await page.goto('https://monitor.red-gate.com/alerts/inbox');
    await performanceMonitor.endTiming('alerts-load', 'pageLoad');

    // Verify the page loaded successfully
    expect(response.status()).toBeLessThan(400);

    // First wait for the alert type filter as it's our indicator that the page has loaded
    await page.waitForSelector('#alert-type', { state: 'visible', timeout: 15000 });

    // Verify alert type filter is present
    const alertTypeFilter = page.locator('#alert-type');
    await expect(alertTypeFilter).toBeVisible();

    // Ensure we have at least one heading (title) on the page
    const pageTitle = page.getByRole('heading');
    await expect(pageTitle).toHaveCount(3); // We know there should be 3 headings

    // Look for any alert-related heading text
    const titleText = await page.evaluate(() => {
      // Get all text from heading elements
      return Array.from(document.querySelectorAll('h1, h2, h3, [role="heading"]'))
        .map(el => el.textContent)
        .join(' ');
    });
    expect(titleText).toContain('Monitor'); // Make sure one of the headings is about monitoring

    // Look for alert type label specifically since we know it should be present
    const alertTypeLabel = page.locator('label[for="alert-type"]');
    await expect(alertTypeLabel).toBeVisible();
  });
});
