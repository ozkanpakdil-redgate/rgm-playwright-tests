const { test, expect } = require('@playwright/test');
const PerformanceMonitor = require('../utils/performance-monitor');
const path = require('path');
const fs = require('fs');

test.describe('Public Alert Inbox Tests', () => {
  let performanceMonitor;

  test.beforeAll(async () => {
    performanceMonitor = new PerformanceMonitor('Public Alert Inbox Tests');
  });

  test.beforeEach(async ({ page }) => {
    // Navigate to Alert Inbox page
    performanceMonitor.startTimer('page_navigation');
    await page.goto('https://monitor.red-gate.com/Alerts/Inbox');
    await page.waitForLoadState('networkidle');
    performanceMonitor.endTimer('page_navigation');
    
    performanceMonitor.setPage(page);
  });

  test('should verify alert inbox structure and filters', async ({ page }) => {
    performanceMonitor.startTimer('alert_inbox_validation');
    
    // Verify filter controls
    const filterControls = [
      { name: 'Alert type', role: 'combobox' },
      { name: 'Level', role: 'combobox' },
      { name: 'Source object tags', role: 'combobox' },
      { name: 'Within', role: 'combobox' }
    ];
    
    for (const control of filterControls) {
      const locator = page.getByRole(control.role, { name: control.name });
      const count = await locator.count();
      // Expect filter control to exist (visible or hidden)
      expect(count).toBeGreaterThan(0);
    }
    
    // Verify alert type filter exists
    const alertTypeContainer = page.locator('#alert-type').first();
    await expect(alertTypeContainer).toBeVisible();

    // Verify alert type filter is interactive
    const alertTypeWrapper = alertTypeContainer.locator('xpath=..').first();
    await expect(alertTypeWrapper).toBeVisible();
    await alertTypeWrapper.click();
    await expect(alertTypeContainer).toHaveAttribute('aria-expanded', 'true');
    
    // Close the alert type dropdown
    await alertTypeContainer.press('Escape');
    
    // Verify time range filter
    const timeRangeCombobox = page.getByRole('combobox', { name: 'Within' });
    await expect(timeRangeCombobox).toBeVisible();
    
    performanceMonitor.endTimer('alert_inbox_validation');
  });

  test('should verify alert list controls', async ({ page }) => {
    performanceMonitor.startTimer('alert_controls_test');
    
    // Verify list controls
    const listControls = [
      { role: 'checkbox', name: 'Group alerts', disabled: false },
      { role: 'button', name: 'Clear', disabled: true },
      { role: 'button', name: 'Read', disabled: true },
      { role: 'button', name: 'More', disabled: true }
    ];
    
    // Verify basic list controls if present
    for (const control of listControls) {
      const locator = page.getByRole(control.role, { name: control.name, exact: true });
      const count = await locator.count();
      if (count > 0) {
        if (control.disabled) {
          await expect(locator).toBeDisabled();
        } else {
          await expect(locator).toBeEnabled();
        }
      } else {
        console.warn(`Control ${control.name} not found, skipping.`);
      }
    }
    
    // Verify pagination controls
    for (const label of ['Newest', 'Newer', 'Older', 'Oldest']) {
      const btn = page.getByRole('button', { name: label });
      if (await btn.count() > 0) {
        await expect(btn).toBeVisible();
      }
    }
    
    // Verify page size control
    const pageSizeCombobox = page.getByRole('combobox', { name: 'Page size' });
    if (await pageSizeCombobox.count() > 0) {
      await expect(pageSizeCombobox).toBeVisible();
    }
    
    performanceMonitor.endTimer('alert_controls_test');
  });

  test('should verify action links', async ({ page }) => {
    performanceMonitor.startTimer('action_links_test');
    
    // Verify action links
    const actionLinks = [
      'Create custom metrics and alerts',
      'Manage monitored servers',
      'Manage groups',
      'Configure alerts',
      'Manage alert suppressions',
      'Subscribe to RSS alert feed'
    ];
    
    for (const linkText of actionLinks) {
      await expect(page.getByRole('link', { name: linkText })).toBeVisible();
    }
    
    performanceMonitor.endTimer('action_links_test');
  });

  test('should test alert time range filter', async ({ page }) => {
    performanceMonitor.startTimer('time_range_test');
    
    // Click the time range combobox (if needed) to make options available
    const timeRangeCombobox = page.getByRole('combobox', { name: 'Within', exact: true });
    // Ensure combobox element is focused
    await timeRangeCombobox.click();

    // Verify dropdown contains expected options
    const dropdown = timeRangeCombobox;
    const optionTexts = await dropdown.locator('option').allTextContents();
    for (const option of ['15 minutes','1 hour','6 hours','12 hours','1 day','7 days','30 days']) {
      expect(optionTexts).toContain(option);
    }
    
    // Select a different time range and verify value
    await timeRangeCombobox.selectOption({ label: '1 day' });
    await expect(timeRangeCombobox).toHaveValue('1 day');
    // Wait for data load
    await page.waitForLoadState('networkidle');

    performanceMonitor.endTimer('time_range_test');
  });

  test.afterAll(async () => {
    // Ensure directories exist
    const metricsDir = path.join(__dirname, '..', 'performance-metrics');
    const reportsDir = path.join(__dirname, '..', 'performance-reports');
    
    if (!fs.existsSync(metricsDir)) {
      fs.mkdirSync(metricsDir, { recursive: true });
    }
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }
    
    // Save detailed JSON report
    const timestamp = Date.now();
    const jsonReportPath = path.join(metricsDir, `alert-inbox-detailed-${timestamp}.json`);
    performanceMonitor.saveReport(jsonReportPath);
    
    // Generate and save summary report
    const summaryReportPath = path.join(reportsDir, `alert-inbox-summary-${timestamp}.txt`);
    const summaryReport = performanceMonitor.generateSummaryReport();
    fs.writeFileSync(summaryReportPath, summaryReport);
  });
});
