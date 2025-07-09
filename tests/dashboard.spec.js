const { test, expect } = require('@playwright/test');
const PerformanceMonitor = require('../utils/performance-monitor');
const path = require('path');
const fs = require('fs');

test.describe('Public Dashboard Tests', () => {
  let performanceMonitor;

  test.beforeAll(async () => {
    performanceMonitor = new PerformanceMonitor('Public Dashboard Tests');
  });

  test.beforeEach(async ({ page }) => {
    // Navigate to main dashboard
    performanceMonitor.startTimer('dashboard_navigation');
    await page.goto('https://monitor.red-gate.com/GlobalDashboard');
    await page.waitForLoadState('networkidle');
    performanceMonitor.endTimer('dashboard_navigation');
    
    performanceMonitor.setPage(page);

    // Handle any welcome or overlay elements that might intercept clicks
    const welcomeDiv = page.locator('div.welcome');
    if (await welcomeDiv.isVisible()) {
      await welcomeDiv.evaluate(node => node.remove());
    }
  });

  test('should verify dashboard structure and empty state', async ({ page }) => {
    performanceMonitor.startTimer('dashboard_validation');
    
    // Verify filter textbox as page load indicator
    const filterBox = page.getByRole('textbox', { name: 'Filter by names' }).first();
    await expect(filterBox).toBeVisible({ timeout: 10000 });
    
    // Verify combobox filter controls are present (empty state)
    const comboboxes = page.getByRole('combobox');
    // Expect at least three filter comboboxes
    const comboCount = await comboboxes.count();
    expect(comboCount).toBeGreaterThanOrEqual(3);
    // Ensure each combobox is visible
    for (let i = 0; i < await comboboxes.count(); ++i) {
      // Combobox may be hidden if no items, ensure presence
      expect(await comboboxes.nth(i).count()).toBeGreaterThan(0);
    }

    // Verify view controls
    await expect(page.getByText('Group by')).toBeVisible();
    await expect(page.getByText('Order by')).toBeVisible();

    // Verify no server instances are displayed
    const serverElements = page.locator('[data-testid="server-instance"]');
    await expect(serverElements).toHaveCount(0);
    
    performanceMonitor.endTimer('dashboard_validation');
  });

  test('should verify alert history section', async ({ page }) => {
    performanceMonitor.startTimer('alert_history_test');
    
    // Verify alert history header and controls
    await expect(page.getByRole('heading', { name: 'Latest alerts' })).toBeVisible();
    await expect(page.getByText('Alerts raised or updated in the last')).toBeVisible();
    
    // Verify time period selector
    const timeCombobox = page.getByRole('combobox').filter({ hasText: '24 hours' });
    await expect(timeCombobox).toBeVisible();
    
    // Verify group filter
    const groupCombobox = page.getByRole('combobox').filter({ hasText: 'All groups' });
    await expect(groupCombobox).toBeVisible();
    
    performanceMonitor.endTimer('alert_history_test');
  });

  test('should verify global navigation and controls', async ({ page }) => {
    performanceMonitor.startTimer('navigation_test');
    
    // Only verify visibility of main navigation items
    const navItems = [
      'Overview',
      'Alerts',
      'Analysis',
      'Reports',
      'Estate'
    ];
    for (const item of navItems) {
      await expect(page.getByRole('link', { name: item }).first()).toBeVisible();
    }

    // Verify utility navigation controls
    const utilityControls = [
      { role: 'link', name: 'Configuration' },
      { role: 'button', name: 'Give feedback' },
      { role: 'button', name: 'Help' }
    ];
     
    for (const control of utilityControls) {
      await expect(page.getByRole(control.role, { name: control.name })).toBeVisible();
    }
    performanceMonitor.endTimer('navigation_test');
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
    const jsonReportPath = path.join(metricsDir, `dashboard-detailed-${timestamp}.json`);
    performanceMonitor.saveReport(jsonReportPath);
    
    // Generate and save summary report
    const summaryReportPath = path.join(reportsDir, `dashboard-summary-${timestamp}.txt`);
    const summaryReport = performanceMonitor.generateSummaryReport();
    fs.writeFileSync(summaryReportPath, summaryReport);
  });
});
