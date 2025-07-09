const base = require('@playwright/test/reporter');
const performanceReporter = require('./performance-reporter');

class PerformanceTestReporter {
    onBegin(config, suite) {
        this.startTime = Date.now();
    }

    onTestBegin(test) {
        test.startTime = Date.now();
    }

    onTestEnd(test, result) {
        const duration = Date.now() - test.startTime;

        // Track page load times
        if (test.title.includes('page load')) {
            const pageName = test.title.match(/(\w+) page load/)?.[1];
            if (pageName) {
                performanceReporter.addPageTime(pageName, duration);
            }
        }

        // Track navigation times
        if (test.title.includes('navigation')) {
            const pageName = test.title.match(/(\w+) navigation/)?.[1];
            if (pageName) {
                performanceReporter.addNavigationTime(pageName, duration);
            }
        }

        // Track critical operations
        if (test.title.includes('operation')) {
            const operation = test.title.match(/(\w+) operation/)?.[1];
            if (operation) {
                performanceReporter.addCriticalOperation(operation, duration);
            }
        }

        // Track performance alerts
        if (duration > test.timeout) {
            performanceReporter.addAlert('Timeout Alerts', `${test.title} exceeded timeout of ${test.timeout}ms`);
        }

        // Track failures
        if (result.status === 'failed') {
            performanceReporter.addFailure(test.title, result.error?.message || 'Unknown error');
        }
    }

    onEnd(result) {
        const duration = Date.now() - this.startTime;
        performanceReporter.updateTestResults({
            duration,
            passed: result.passed,
            failed: result.failed,
            total: result.total
        });
        performanceReporter.saveReport();
    }
}

module.exports = PerformanceTestReporter;
