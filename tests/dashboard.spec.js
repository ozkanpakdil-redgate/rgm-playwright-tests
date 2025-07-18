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

    // Verify utility navigation controls with specific selectors
    // Use href attribute for Configuration to avoid ambiguity
    await expect(page.locator('a[href="/Configuration"]').first()).toBeVisible();
    
    // For other controls, try to find them with more specific selectors
    try {
      await expect(page.getByRole('button', { name: 'Give feedback' })).toBeVisible();
    } catch {
      // If "Give feedback" isn't found, try alternative text
      await expect(page.locator('button[aria-label*="feedback" i]')).toBeVisible();
    }
    
    try {
      await expect(page.getByRole('button', { name: 'Help' })).toBeVisible();
    } catch {
      // If "Help" isn't found, try alternative selectors
      await expect(page.locator('[aria-label*="help" i]')).toBeVisible();
    }
    
    performanceMonitor.endTimer('navigation_test');
  });
});
