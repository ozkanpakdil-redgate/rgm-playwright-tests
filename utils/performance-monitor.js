const fs = require('fs');
const path = require('path');

class PerformanceMonitor {
  constructor(testName) {
    this.testName = testName;
    this.metrics = [];
    this.startTimes = new Map();
    this.thresholds = {
      pageLoad: 5000, // 5 seconds
      userAction: 3000, // 3 seconds
      apiCall: 2000 // 2 seconds
    };
  }

  setPage(page) {
    this.page = page;
  }

  setThresholds(newThresholds) {
    this.thresholds = { ...this.thresholds, ...newThresholds };
  }

  // Adding support for both naming conventions
  startTimer(actionName) {
    this.startTiming(actionName);
  }

  endTimer(actionName, category = 'userAction') {
    return this.endTiming(actionName, category);
  }

  startTiming(actionName) {
    this.startTimes.set(actionName, Date.now());
  }

  async endTiming(actionName, category = 'userAction') {
    const startTime = this.startTimes.get(actionName);
    if (!startTime) {
      console.warn(`No start time found for action: ${actionName}`);
      return;
    }

    const duration = Date.now() - startTime;
    const metric = {
      name: actionName,
      duration,
      category,
      timestamp: new Date().toISOString(),
      url: this.page?.url() || 'N/A',
      isSlowPerformance: duration > this.thresholds[category],
      threshold: this.thresholds[category]
    };

    this.metrics.push(metric);
    
    if (metric.isSlowPerformance) {
      console.warn(`⚠️  SLOW PERFORMANCE: ${actionName} took ${duration}ms (threshold: ${this.thresholds[category]}ms)`);
    } else {
      console.log(`✅ ${actionName} completed in ${duration}ms`);
    }

    this.startTimes.delete(actionName);
    return metric;
  }

  async recordPageLoad(pageName) {
    const navigationTiming = await this.page.evaluate(() => {
      const timing = performance.timing;
      return {
        loadTime: timing.loadEventEnd - timing.navigationStart,
        domContentLoadedTime: timing.domContentLoadedEventEnd - timing.navigationStart,
        firstPaintTime: timing.responseEnd - timing.navigationStart
      };
    });

    const metric = {
      name: `Page Load: ${pageName}`,
      ...navigationTiming,
      category: 'pageLoad',
      timestamp: new Date().toISOString(),
      url: this.page.url(),
      isSlowPerformance: navigationTiming.loadTime > this.thresholds.pageLoad,
      threshold: this.thresholds.pageLoad
    };

    this.metrics.push(metric);
    return metric;
  }

  async recordApiCall(apiName, url, startTime) {
    const endTime = Date.now();
    const duration = endTime - startTime;

    const metric = {
      name: `API Call: ${apiName}`,
      duration,
      category: 'apiCall',
      timestamp: new Date().toISOString(),
      url,
      isSlowPerformance: duration > this.thresholds.apiCall,
      threshold: this.thresholds.apiCall
    };

    this.metrics.push(metric);
    return metric;
  }

  async measureNetworkPerformance() {
    if (!this.page) {
      console.warn('No page set for network performance measurement');
      return;
    }
    try {
      const context = this.page.context();
      if (typeof context.newCDPSession === 'function') {
        const client = await context.newCDPSession(this.page);
        await client.send('Network.enable');
        const metrics = await client.send('Network.getMetrics');
        const networkMetric = {
          name: 'Network Performance',
          metrics,
          category: 'network',
          timestamp: new Date().toISOString(),
          url: this.page.url()
        };
        this.metrics.push(networkMetric);
        return networkMetric;
      } else {
        console.warn('CDP session not supported in this browser context');
      }
    } catch (error) {
      console.warn('Error measuring network performance:', error);
    }
  }

  getSlowPerformanceMetrics() {
    return this.metrics.filter(metric => metric.isSlowPerformance);
  }

  async logMetrics(page, testName) {
    if (page) {
      this.setPage(page);
    }

    // Ensure the directories exist
    const reportsDir = path.join(process.cwd(), 'test-reports');
    const metricsDir = path.join(reportsDir, 'metrics');
    fs.mkdirSync(metricsDir, { recursive: true });

    // Save detailed metrics
    const timestamp = Date.now();
    const sanitizedTestName = testName.replace(/[^a-zA-Z0-9-]/g, '-').toLowerCase();
    const jsonReport = path.join(metricsDir, `${sanitizedTestName}-${timestamp}.json`);
    await this.saveReport(jsonReport);

    // Generate and save summary
    const summaryReport = this.generateSummaryReport();
    const summaryPath = path.join(reportsDir, `${sanitizedTestName}-summary-${timestamp}.txt`);
    fs.writeFileSync(summaryPath, summaryReport);
  }

  generateSummaryReport() {
    let report = `Performance Summary for ${this.testName}\n`;
    report += '='.repeat(50) + '\n\n';

    const categories = [...new Set(this.metrics.map(m => m.category))];
    for (const category of categories) {
      const categoryMetrics = this.metrics.filter(m => m.category === category);
      report += `${category} Metrics:\n`;
      report += '-'.repeat(30) + '\n';

      for (const metric of categoryMetrics) {
        report += `${metric.name}:\n`;
        report += `  Duration: ${metric.duration}ms\n`;
        report += `  Threshold: ${metric.threshold}ms\n`;
        report += `  Status: ${metric.isSlowPerformance ? '⚠️ Slow' : '✅ OK'}\n`;
        report += `  URL: ${metric.url}\n\n`;
      }
    }

    return report;
  }

  async saveReport(filePath) {
    const report = {
      testName: this.testName,
      timestamp: new Date().toISOString(),
      metrics: this.metrics,
      thresholds: this.thresholds
    };

    fs.writeFileSync(filePath, JSON.stringify(report, null, 2));
  }

  clearMetrics() {
    this.metrics = [];
    this.startTimes.clear();
  }
}

module.exports = PerformanceMonitor;
