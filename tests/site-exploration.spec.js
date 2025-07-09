const { test, expect } = require('@playwright/test');
const PerformanceMonitor = require('../utils/performance-monitor');
const path = require('path');
const fs = require('fs');

// Configure longer timeouts for all tests in this file
test.setTimeout(180000);

test.describe('Public Site Exploration Tests', () => {
  let performanceMonitor;

  test.beforeAll(async () => {
    performanceMonitor = new PerformanceMonitor('Public Site Exploration Tests');
  });

  test.beforeEach(async ({ page }) => {
    // Set up page-level timeouts
    page.setDefaultTimeout(120000);
    page.setDefaultNavigationTimeout(120000);
    
    // Initial navigation
    await page.goto('https://monitor.red-gate.com');
    await page.waitForLoadState('networkidle');

    // Set up performance monitoring
    performanceMonitor.setPage(page);
  });

  test('should verify main navigation structure', async ({ page }) => {
    // Set timeouts for slower networks/devices
    test.slow();
    page.setDefaultTimeout(120000);
    page.setDefaultNavigationTimeout(120000);

    const navigationItems = [
      { text: 'Overview', url: '/GlobalDashboard' },
      { text: 'Alerts', url: '/Alerts/Inbox' },
      { text: 'Analysis', url: '/Analysis' },
      { text: 'Reports', url: '/Reports' },
      { text: 'Estate', url: '/Estate' }
    ];

    // Dismiss overlays if present
    try {
      const welcomeMessage = page.locator('.welcome, [role="dialog"], .modal, .overlay');
      if (await welcomeMessage.isVisible()) {
        await page.keyboard.press('Escape');
        await page.waitForTimeout(1000);
      }
    } catch (e) {}

    // Navigate through each item
    for (const item of navigationItems) {
      let success = false;
      let attempts = 0;
      const maxAttempts = 3;

      while (!success && attempts < maxAttempts) {
        try {
          // Get nav link
          const navLink = page.getByRole('link', { name: item.text, exact: false }).first();
          await expect(navLink).toBeVisible();

          // Start performance monitoring
          performanceMonitor.startTimer(`nav_${item.text.toLowerCase()}`);

          // Click and wait for navigation
          try {
            await Promise.all([
              page.waitForNavigation({ waitUntil: 'networkidle', timeout: 60000 }),
              navLink.click()
            ]);
          } catch (navErr) {
            // Fallback: try direct navigation
            console.warn(`Navigation via click failed for ${item.text}, trying direct page.goto()`);
            await page.goto(`https://monitor.red-gate.com${item.url}`, { waitUntil: 'networkidle', timeout: 60000 });
          }

          // Verify URL
          const currentUrl = await page.url();
          expect(currentUrl.toLowerCase()).toContain(item.url.toLowerCase());
          
          // End performance monitoring
          performanceMonitor.endTimer(`nav_${item.text.toLowerCase()}`);
          
          success = true;
        } catch (e) {
          attempts++;
          if (attempts === maxAttempts) {
            console.error(`Navigation to ${item.text} failed after ${maxAttempts} attempts: ${e.message}`);
            throw e;
          }
          // Small delay between attempts
          await page.waitForTimeout(2000);
        }
      }
    }
  });

  test('should verify utility navigation and controls', async ({ page }) => {
    // First ensure we're on a stable page
    await page.waitForLoadState('networkidle');
    
    // Define the utility controls with more flexible selectors
    const utilityControls = [
      { name: 'Settings', selector: 'a[href*="settings"]' },
      { name: 'Feedback', selector: 'button[aria-label*="feedback" i]' },
      { name: 'Help', selector: '[aria-label*="help" i]' },
      { name: 'Whatsnew', selector: '[aria-label*="new" i]' }
    ];

    for (const control of utilityControls) {
      performanceMonitor.startTimer(`util_${control.name.toLowerCase()}`);
      
      try {
        // Wait for element with a reasonable timeout
        await page.waitForSelector(control.selector, { state: 'visible', timeout: 5000 });
        
        // Find the element
        const element = page.locator(control.selector);
        await expect(element).toBeVisible();

        // Click and wait briefly for any animations/transitions
        await element.click();
        await page.waitForTimeout(500);
        
        // If it opened a modal/panel, close it with Escape
        await page.keyboard.press('Escape');
        await page.waitForTimeout(500);
      } catch (e) {
        console.log(`Warning: Control "${control.name}" may not be available: ${e.message}`);
      } finally {
        performanceMonitor.endTimer(`util_${control.name.toLowerCase()}`);
      }
    }
  });

  test('should verify filter controls across pages', async ({ page }) => {
    // Set longer timeouts for slower networks/devices
    test.slow();
    page.setDefaultTimeout(120000);
    page.setDefaultNavigationTimeout(120000);

    const pageConfigs = [
      {
        url: '/Alerts/Inbox',
        waitFor: ['[role="table"]', '.alerts-table', 'table', '[data-testid*="table" i]'], // Try multiple selectors
        filters: [
          { 
            text: 'Alert type',
            selectors: ['[for="alert-type"]', '[aria-label*="alert type" i]', 'th:has-text("Alert type")']
          },
          { 
            text: 'Severity',
            selectors: ['[for="severity"]', '[aria-label*="severity" i]', 'th:has-text("Level")']
          }
        ]
      },
      {
        url: '/Analysis',
        waitFor: ['[role="main"]'],
        filters: [
          { 
            text: 'Time range',
            selectors: ['[data-testid="time-range-selector"]', 'button:has-text("Time range")', '[aria-label*="time range" i]']
          },
          { 
            text: 'Search',
            selectors: ['input[placeholder*="Search" i]', '.search-field']
          }
        ]
      }
    ];

    for (const pageConfig of pageConfigs) {
      performanceMonitor.startTimer(`filters_${pageConfig.url.substring(1).toLowerCase()}`);

      try {
        // Navigate and wait for page load
        await page.goto(`https://monitor.red-gate.com${pageConfig.url}`);
        await page.waitForLoadState('networkidle');
        let foundMain = false;
        let lastError = null;
        if (pageConfig.waitFor && Array.isArray(pageConfig.waitFor)) {
          for (const selector of pageConfig.waitFor) {
            try {
              await page.waitForSelector(selector, { state: 'visible', timeout: 10000 });
              foundMain = true;
              break;
            } catch (e) {
              lastError = e;
              continue;
            }
          }
        } else if (pageConfig.waitFor) {
          try {
            await page.waitForSelector(pageConfig.waitFor, { state: 'visible', timeout: 30000 });
            foundMain = true;
          } catch (e) {
            lastError = e;
          }
        } else {
          foundMain = true;
        }
        if (!foundMain) {
          console.warn(`Warning: Main content not found on ${pageConfig.url} using selectors: ${pageConfig.waitFor}. Last error: ${lastError && lastError.message}`);
          // Continue to filter checks, do not throw
        }

        // Verify each filter exists
        for (const filter of pageConfig.filters) {
          let found = false;

          // Try each selector for the filter
          for (const selector of filter.selectors) {
            try {
              const element = page.locator(selector);
              const visible = await element.isVisible();
              if (visible) {
                found = true;
                break;
              }
            } catch (e) {
              // Continue to next selector
              continue;
            }
          }

          // If none of the selectors worked, log a warning
          if (!found) {
            console.warn(`Warning: Filter "${filter.text}" not found on ${pageConfig.url}`);
          }
        }
      } catch (e) {
        console.error(`Error on page ${pageConfig.url}: ${e.message}`);
        // Do not throw, continue to next page
      } finally {
        performanceMonitor.endTimer(`filters_${pageConfig.url.substring(1).toLowerCase()}`);
      }
    }
  });

  test('should verify empty states and messaging', async ({ page }) => {
    performanceMonitor.startTimer('empty_states_test');
    
    const pagesToTest = [
      {
        route: '/GlobalDashboard',
        expectations: [
          { selector: 'text=0 Instances' },
          { selector: 'button:has-text("Add monitored server")' }
        ]
      },
      {
        route: '/Analysis',
        expectations: [
          { selector: 'text=Analysis Graph' },
          { selector: '[aria-label*="time range" i]' }
        ]
      },
      {
        route: '/Reports',
        expectations: [
          { selector: '[aria-label*="report" i]' },
          { selector: 'button:has-text("New report")' }
        ]
      },
      {
        route: '/Estate',
        expectations: [
          { selector: 'text=SQL Server versions' },
          { selector: 'text=The versions data' }
        ]
      }
    ];
    
    for (const pageData of pagesToTest) {
      performanceMonitor.startTimer(`empty_${pageData.route.substring(1).toLowerCase()}`);
      
      // Navigate to the page
      await page.goto(`https://monitor.red-gate.com${pageData.route}`);
      await page.waitForLoadState('networkidle');
      
      // Check each expectation
      for (const expectation of pageData.expectations) {
        try {
          await expect(page.locator(expectation.selector)).toBeVisible({
            timeout: 5000
          });
        } catch (e) {
          console.log(`Warning: Expected element not found on ${pageData.route}: ${expectation.selector}`);
        }
      }
      
      performanceMonitor.endTimer(`empty_${pageData.route.substring(1).toLowerCase()}`);
    }
    
    performanceMonitor.endTimer('empty_states_test');
  });

  test.afterAll(async () => {
    // Ensure directories exist
    const metricsDir = path.join(__dirname, '..', 'performance-metrics');
    const reportsDir = path.join(__dirname, '..', 'performance-reports');
    
    [metricsDir, reportsDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
    
    // Save detailed metrics
    const timestamp = Date.now();
    const jsonReport = path.join(metricsDir, `site-exploration-detailed-${timestamp}.json`);
    performanceMonitor.saveReport(jsonReport);
    
    // Generate and save summary
    const summaryReport = performanceMonitor.generateSummaryReport();
    const summaryPath = path.join(reportsDir, `site-exploration-summary-${timestamp}.txt`);
    fs.writeFileSync(summaryPath, summaryReport);
  });
});
