const fs = require('fs');
const path = require('path');

class PerformanceReporter {
    constructor() {
        this.performanceData = {
            testSummary: {
                duration: 0,
                passed: 0,
                failed: 0,
                total: 0
            },
            pageTimes: {},
            navigationTimes: {},
            criticalOps: {},
            performanceAlerts: [],
            failedTests: []
        };
        this.startTime = Date.now();
    }

    updateTestSummary(results) {
        const duration = (Date.now() - this.startTime) / 1000 / 60; // in minutes
        this.performanceData.testSummary = {
            duration: duration.toFixed(1),
            passed: results.passed,
            failed: results.failed,
            total: results.total
        };
    }

    recordPageTime(page, time) {
        if (!this.performanceData.pageTimes[page]) {
            this.performanceData.pageTimes[page] = { min: time, max: time };
        } else {
            this.performanceData.pageTimes[page].min = Math.min(this.performanceData.pageTimes[page].min, time);
            this.performanceData.pageTimes[page].max = Math.max(this.performanceData.pageTimes[page].max, time);
        }
    }

    recordNavigationTime(page, time) {
        if (!this.performanceData.navigationTimes[page]) {
            this.performanceData.navigationTimes[page] = { min: time, max: time };
        } else {
            this.performanceData.navigationTimes[page].min = Math.min(this.performanceData.navigationTimes[page].min, time);
            this.performanceData.navigationTimes[page].max = Math.max(this.performanceData.navigationTimes[page].max, time);
        }
    }

    recordCriticalOperation(operation, time) {
        if (!this.performanceData.criticalOps[operation]) {
            this.performanceData.criticalOps[operation] = { min: time, max: time };
        } else {
            this.performanceData.criticalOps[operation].min = Math.min(this.performanceData.criticalOps[operation].min, time);
            this.performanceData.criticalOps[operation].max = Math.max(this.performanceData.criticalOps[operation].max, time);
        }
    }

    addPerformanceAlert(category, message) {
        this.performanceData.performanceAlerts.push({ category, message });
    }

    addFailedTest(testName, error) {
        this.performanceData.failedTests.push({ testName, error });
    }

    generateMarkdownReport() {
        const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        let report = `# Performance Report\n\n`;
        report += `## Overview\n\n`;
        report += `This file contains the performance metrics for the RGM Playwright tests. Metrics are updated after each test run.\n\n`;
        report += `## Latest Test Results (${date})\n\n`;
        report += `### Test Summary\n\n`;
        report += `- Total Duration: ${this.performanceData.testSummary.duration} minutes\n`;
        report += `- Tests Passed: ${this.performanceData.testSummary.passed}\n`;
        report += `- Tests Failed: ${this.performanceData.testSummary.failed}\n`;
        report += `- Total Tests: ${this.performanceData.testSummary.total}\n\n`;

        // Page Load Times
        report += `### Page Load Times\n\n`;
        Object.entries(this.performanceData.pageTimes).forEach(([page, times]) => {
            report += `- ${page}: ${times.min}ms - ${times.max}ms\n`;
        });
        report += '\n';

        // Navigation Performance
        report += `### Navigation Performance\n\n`;
        Object.entries(this.performanceData.navigationTimes).forEach(([page, times]) => {
            report += `- ${page}: ${times.min}ms - ${times.max}ms\n`;
        });
        report += '\n';

        // Critical Operations
        report += `### Critical Operations\n\n`;
        Object.entries(this.performanceData.criticalOps).forEach(([op, times]) => {
            report += `- ${op}: ${times.min}ms - ${times.max}ms\n`;
        });
        report += '\n';

        // Performance Alerts
        if (this.performanceData.performanceAlerts.length > 0) {
            report += `### Performance Alerts\n\n`;
            const alertsByCategory = {};
            this.performanceData.performanceAlerts.forEach(alert => {
                if (!alertsByCategory[alert.category]) {
                    alertsByCategory[alert.category] = [];
                }
                alertsByCategory[alert.category].push(alert.message);
            });
            Object.entries(alertsByCategory).forEach(([category, messages], index) => {
                report += `${index + 1}. ${category}:\n`;
                messages.forEach(msg => {
                    report += `   - ${msg}\n`;
                });
            });
            report += '\n';
        }

        // Failed Tests
        if (this.performanceData.failedTests.length > 0) {
            report += `### Failed Tests Analysis\n\n`;
            this.performanceData.failedTests.forEach(test => {
                report += `- ${test.testName}: ${test.error}\n`;
            });
            report += '\n';
        }

        // Historical Data section
        report += `## Historical Data\n\n`;
        report += `Last updated on ${date}. Historical trends will be tracked in subsequent runs.\n\n`;

        // How to Read section
        report += `## How to Read This Report\n\n`;
        report += `1. All times are in milliseconds (ms)\n`;
        report += `2. Ranges show minimum - maximum observed times\n`;
        report += `3. Performance alerts highlight areas exceeding thresholds:\n`;
        report += `   - Page Load: > 2000ms\n`;
        report += `   - Navigation: > 3000ms\n`;
        report += `   - Operations: > 3000ms\n`;
        report += `4. Test failures are highlighted with their root cause\n\n`;

        report += `---\n\n`;
        report += `*Note: This consolidated report replaces the previous multi-folder reporting structure for better readability and reduced disk usage.*\n`;

        return report;
    }

    saveReport() {
        const report = this.generateMarkdownReport();
        const reportPath = path.join(process.cwd(), 'performance.md');
        fs.writeFileSync(reportPath, report);
    }
}

module.exports = new PerformanceReporter();
const path = require('path');

class PerformanceReporter {
    constructor() {
        this.performanceMdPath = path.join(__dirname, '..', 'performance.md');
        this.maxHistoricalEntries = 5;
        this.currentResults = {
            date: new Date().toLocaleDateString(),
            summary: {
                duration: 0,
                passed: 0,
                failed: 0,
                total: 0
            },
            pageTimes: {},
            navigationTimes: {},
            criticalOps: {},
            alerts: [],
            failures: []
        };
    }

    updateTestResults(results) {
        this.currentResults.summary = {
            duration: results.duration,
            passed: results.passed,
            failed: results.failed,
            total: results.total
        };
    }

    addPageTime(page, time) {
        if (!this.currentResults.pageTimes[page]) {
            this.currentResults.pageTimes[page] = { min: time, max: time };
        } else {
            this.currentResults.pageTimes[page].min = Math.min(this.currentResults.pageTimes[page].min, time);
            this.currentResults.pageTimes[page].max = Math.max(this.currentResults.pageTimes[page].max, time);
        }
    }

    addNavigationTime(page, time) {
        if (!this.currentResults.navigationTimes[page]) {
            this.currentResults.navigationTimes[page] = { min: time, max: time };
        } else {
            this.currentResults.navigationTimes[page].min = Math.min(this.currentResults.navigationTimes[page].min, time);
            this.currentResults.navigationTimes[page].max = Math.max(this.currentResults.navigationTimes[page].max, time);
        }
    }

    addCriticalOperation(operation, time) {
        if (!this.currentResults.criticalOps[operation]) {
            this.currentResults.criticalOps[operation] = { min: time, max: time };
        } else {
            this.currentResults.criticalOps[operation].min = Math.min(this.currentResults.criticalOps[operation].min, time);
            this.currentResults.criticalOps[operation].max = Math.max(this.currentResults.criticalOps[operation].max, time);
        }
    }

    addAlert(category, message) {
        this.currentResults.alerts.push({ category, message });
    }

    addFailure(test, error) {
        this.currentResults.failures.push({ test, error });
    }

    generateReport() {
        let report = '# Performance Report\n\n';
        report += '## Overview\n\n';
        report += 'This file contains the performance metrics for the RGM Playwright tests. Metrics are updated after each test run.\n\n';
        
        report += `## Latest Test Results (${this.currentResults.date})\n\n`;
        report += '### Test Summary\n\n';
        report += `- Total Duration: ${(this.currentResults.summary.duration / 60000).toFixed(1)} minutes\n`;
        report += `- Tests Passed: ${this.currentResults.summary.passed}\n`;
        report += `- Tests Failed: ${this.currentResults.summary.failed}\n`;
        report += `- Total Tests: ${this.currentResults.summary.total}\n\n`;

        // Page Load Times
        report += '### Page Load Times\n\n';
        Object.entries(this.currentResults.pageTimes).forEach(([page, times]) => {
            report += `- ${page}: ${times.min}ms - ${times.max}ms\n`;
        });
        report += '\n';

        // Navigation Performance
        report += '### Navigation Performance\n\n';
        Object.entries(this.currentResults.navigationTimes).forEach(([page, times]) => {
            report += `- ${page}: ${times.min}ms - ${times.max}ms\n`;
        });
        report += '\n';

        // Critical Operations
        report += '### Critical Operations\n\n';
        Object.entries(this.currentResults.criticalOps).forEach(([operation, times]) => {
            report += `- ${operation}: ${times.min}ms - ${times.max}ms\n`;
        });
        report += '\n';

        // Performance Alerts
        report += '### Performance Alerts\n\n';
        const groupedAlerts = this.currentResults.alerts.reduce((acc, alert) => {
            if (!acc[alert.category]) acc[alert.category] = [];
            acc[alert.category].push(alert.message);
            return acc;
        }, {});

        Object.entries(groupedAlerts).forEach(([category, messages], index) => {
            report += `${index + 1}. ${category}:\n`;
            messages.forEach(msg => {
                report += `   - ${msg}\n`;
            });
        });
        report += '\n';

        // Failed Tests
        if (this.currentResults.failures.length > 0) {
            report += '### Failed Tests Analysis\n\n';
            this.currentResults.failures.forEach(failure => {
                report += `- ${failure.test}: ${failure.error}\n`;
            });
            report += '\n';
        }

        // Historical Data section
        report += '## Historical Data\n\n';
        report += 'Performance metrics are tracked across test runs. Check the git history of this file for historical data.\n\n';

        // How to Read
        report += '## How to Read This Report\n\n';
        report += '1. All times are in milliseconds (ms)\n';
        report += '2. Ranges show minimum - maximum observed times\n';
        report += '3. Performance alerts highlight areas exceeding thresholds:\n';
        report += '   - Page Load: > 2000ms\n';
        report += '   - Navigation: > 3000ms\n';
        report += '   - Operations: > 3000ms\n';
        report += '4. Test failures are highlighted with their root cause\n\n';

        report += '---\n\n';
        report += '*Note: This consolidated report replaces the previous multi-folder reporting structure for better readability and reduced disk usage.*\n';

        return report;
    }

    saveReport() {
        const report = this.generateReport();
        fs.writeFileSync(this.performanceMdPath, report);
    }
}

module.exports = new PerformanceReporter();
