class PerformanceReporter {
    constructor() {
        this.pageLoadTimes = new Map();
        this.navigationTimes = new Map();
        this.criticalOperations = new Map(); 
        this.alerts = [];
        this.failures = [];
        this.testResults = {};
    }

    addPageTime(pageName, duration) {
        if (!this.pageLoadTimes.has(pageName)) {
            this.pageLoadTimes.set(pageName, []);
        }
        this.pageLoadTimes.get(pageName).push(duration);
    }

    addNavigationTime(pageName, duration) {
        if (!this.navigationTimes.has(pageName)) {
            this.navigationTimes.set(pageName, []);
        }
        this.navigationTimes.get(pageName).push(duration);
    }

    addCriticalOperation(operation, duration) {
        if (!this.criticalOperations.has(operation)) {
            this.criticalOperations.set(operation, []);
        }
        this.criticalOperations.get(operation).push(duration);
    }

    addAlert(category, message) {
        this.alerts.push({ category, message, timestamp: new Date() });
    }

    addFailure(testName, error) {
        this.failures.push({ testName, error, timestamp: new Date() });
    }

    updateTestResults(results) {
        this.testResults = {
            ...this.testResults,
            ...results,
            timestamp: new Date()
        };
    }

    saveReport() {
        // Calculate averages
        const reportData = {
            pageLoadTimes: Object.fromEntries(this.pageLoadTimes),
            navigationTimes: Object.fromEntries(this.navigationTimes),
            criticalOperations: Object.fromEntries(this.criticalOperations),
            alerts: this.alerts,
            failures: this.failures,
            testResults: this.testResults
        };

        // Generate report content
        let report = '# Performance Test Report\n\n';
        report += `## Test Run Summary\n`;
        report += `- Total Duration: ${this.testResults.duration}ms\n`;
        report += `- Tests Passed: ${this.testResults.passed}\n`;
        report += `- Tests Failed: ${this.testResults.failed}\n`;
        report += `- Total Tests: ${this.testResults.total}\n\n`;

        report += `## Page Load Times\n`;
        for (const [page, times] of this.pageLoadTimes) {
            const avg = times.reduce((a, b) => a + b, 0) / times.length;
            report += `- ${page}: ${avg.toFixed(2)}ms average\n`;
        }

        report += `\n## Navigation Times\n`;
        for (const [page, times] of this.navigationTimes) {
            const avg = times.reduce((a, b) => a + b, 0) / times.length;
            report += `- ${page}: ${avg.toFixed(2)}ms average\n`;
        }

        report += `\n## Critical Operations\n`;
        for (const [op, times] of this.criticalOperations) {
            const avg = times.reduce((a, b) => a + b, 0) / times.length;
            report += `- ${op}: ${avg.toFixed(2)}ms average\n`;
        }

        if (this.alerts.length > 0) {
            report += `\n## Performance Alerts\n`;
            for (const alert of this.alerts) {
                report += `- [${alert.category}] ${alert.message}\n`;
            }
        }

        if (this.failures.length > 0) {
            report += `\n## Test Failures\n`;
            for (const failure of this.failures) {
                report += `- ${failure.testName}: ${failure.error}\n`;
            }
        }

        // Write to performance.md
        const fs = require('fs');
        fs.writeFileSync('performance.md', report);
    }
}

module.exports = new PerformanceReporter();
