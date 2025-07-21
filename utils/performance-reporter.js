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

        // Generate comprehensive report content
        let report = '# Performance Test Report\n\n';
        
        report += `## Test Run Summary\n`;
        report += `- **Total Duration**: ${this.testResults.duration}ms (${(this.testResults.duration / 1000).toFixed(2)}s)\n`;
        report += `- **Tests Passed**: ${this.testResults.passed}\n`;
        report += `- **Tests Failed**: ${this.testResults.failed}\n`;
        report += `- **Total Tests**: ${this.testResults.total}\n`;
        if (this.testResults.total > 0) {
            const successRate = (this.testResults.passed / this.testResults.total * 100).toFixed(1);
            report += `- **Success Rate**: ${successRate}%\n`;
        }
        report += `- **Report Generated**: ${new Date().toISOString()}\n\n`;

        // Page Load Times section
        report += `## Page Load Times\n`;
        if (this.pageLoadTimes.size > 0) {
            for (const [page, times] of this.pageLoadTimes) {
                const avg = times.reduce((a, b) => a + b, 0) / times.length;
                const min = Math.min(...times);
                const max = Math.max(...times);
                report += `### ${page}\n`;
                report += `- **Average**: ${avg.toFixed(2)}ms\n`;
                report += `- **Minimum**: ${min.toFixed(2)}ms\n`;
                report += `- **Maximum**: ${max.toFixed(2)}ms\n`;
                report += `- **Samples**: ${times.length}\n\n`;
            }
        } else {
            report += `*No page load time data captured in this run.*\n\n`;
        }

        // Navigation Times section  
        report += `## Navigation Times\n`;
        if (this.navigationTimes.size > 0) {
            for (const [page, times] of this.navigationTimes) {
                const avg = times.reduce((a, b) => a + b, 0) / times.length;
                const min = Math.min(...times);
                const max = Math.max(...times);
                report += `### ${page}\n`;
                report += `- **Average**: ${avg.toFixed(2)}ms\n`;
                report += `- **Minimum**: ${min.toFixed(2)}ms\n`;
                report += `- **Maximum**: ${max.toFixed(2)}ms\n`;
                report += `- **Samples**: ${times.length}\n\n`;
            }
        } else {
            report += `*No navigation time data captured in this run.*\n\n`;
        }

        // Critical Operations section
        report += `## Critical Operations\n`;
        if (this.criticalOperations.size > 0) {
            // Sort operations by average time (slowest first)
            const sortedOperations = Array.from(this.criticalOperations.entries())
                .map(([op, times]) => ({
                    name: op,
                    times,
                    avg: times.reduce((a, b) => a + b, 0) / times.length,
                    min: Math.min(...times),
                    max: Math.max(...times),
                    count: times.length
                }))
                .sort((a, b) => b.avg - a.avg);

            sortedOperations.forEach(op => {
                report += `### ${op.name}\n`;
                report += `- **Average**: ${op.avg.toFixed(2)}ms\n`;
                report += `- **Minimum**: ${op.min.toFixed(2)}ms\n`;
                report += `- **Maximum**: ${op.max.toFixed(2)}ms\n`;
                report += `- **Executions**: ${op.count}\n`;
                
                // Add performance classification
                if (op.avg > 10000) {
                    report += `- **Status**: ⚠️ Very Slow (>10s)\n`;
                } else if (op.avg > 5000) {
                    report += `- **Status**: ⚠️ Slow (>5s)\n`;
                } else if (op.avg > 2000) {
                    report += `- **Status**: ⚠️ Moderate (>2s)\n`;
                } else {
                    report += `- **Status**: ✅ Good (<2s)\n`;
                }
                report += `\n`;
            });
        } else {
            report += `*No critical operation data captured in this run.*\n\n`;
        }

        // Performance Alerts section
        if (this.alerts.length > 0) {
            report += `## Performance Alerts\n`;
            report += `*${this.alerts.length} performance alert(s) detected*\n\n`;
            
            // Group alerts by category
            const alertsByCategory = {};
            this.alerts.forEach(alert => {
                if (!alertsByCategory[alert.category]) {
                    alertsByCategory[alert.category] = [];
                }
                alertsByCategory[alert.category].push(alert);
            });
            
            Object.entries(alertsByCategory).forEach(([category, alerts]) => {
                report += `### ${category}\n`;
                alerts.forEach(alert => {
                    report += `- ${alert.message}\n`;
                });
                report += `\n`;
            });
        }

        // Test Failures section
        if (this.failures.length > 0) {
            report += `## Test Failures\n`;
            report += `*${this.failures.length} test failure(s) recorded*\n\n`;
            this.failures.forEach(failure => {
                report += `### ${failure.testName}\n`;
                report += `- **Error**: ${failure.error}\n`;
                report += `- **Time**: ${failure.timestamp.toISOString()}\n\n`;
            });
        }

        // Summary statistics
        if (this.criticalOperations.size > 0) {
            const allDurations = Array.from(this.criticalOperations.values()).flat();
            const totalOperations = allDurations.length;
            const avgDuration = allDurations.reduce((a, b) => a + b, 0) / totalOperations;
            
            report += `## Overall Performance Statistics\n`;
            report += `- **Total Operations Measured**: ${totalOperations}\n`;
            report += `- **Average Operation Time**: ${avgDuration.toFixed(2)}ms\n`;
            report += `- **Fastest Operation**: ${Math.min(...allDurations).toFixed(2)}ms\n`;
            report += `- **Slowest Operation**: ${Math.max(...allDurations).toFixed(2)}ms\n`;
        }

        // Write to performance.md
        const fs = require('fs');
        fs.writeFileSync('performance.md', report);
        
        console.log('📊 Performance report saved to performance.md');
        console.log(`   📈 ${this.criticalOperations.size} operation types tracked`);
        console.log(`   ⚠️ ${this.alerts.length} performance alerts`);
        console.log(`   ❌ ${this.failures.length} test failures`);
    }
}

module.exports = new PerformanceReporter();
