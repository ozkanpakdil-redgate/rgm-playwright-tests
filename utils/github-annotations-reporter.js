class GitHubAnnotationsReporter {
    static addNotice(message, title = 'Performance Notice') {
        console.log(`::notice title=${title}::${message}`);
    }

    static addWarning(message, title = 'Performance Warning') {
        console.log(`::warning title=${title}::${message}`);
    }

    static addError(message, title = 'Performance Error') {
        console.log(`::error title=${title}::${message}`);
    }

    static reportPerformanceMetrics(performanceData) {
        // Report slow page loads
        if (performanceData.pageLoadTimes) {
            for (const [page, times] of performanceData.pageLoadTimes) {
                const avg = times.reduce((a, b) => a + b, 0) / times.length;
                if (avg > 5000) {
                    this.addError(`${page} page is loading slowly: ${avg.toFixed(2)}ms`, 'Slow Page Load');
                } else if (avg > 3000) {
                    this.addWarning(`${page} page load time is concerning: ${avg.toFixed(2)}ms`, 'Page Load Warning');
                }
            }
        }

        // Report slow navigation
        if (performanceData.navigationTimes) {
            for (const [nav, times] of performanceData.navigationTimes) {
                const avg = times.reduce((a, b) => a + b, 0) / times.length;
                if (avg > 3000) {
                    this.addError(`${nav} navigation is slow: ${avg.toFixed(2)}ms`, 'Slow Navigation');
                } else if (avg > 1500) {
                    this.addWarning(`${nav} navigation time is concerning: ${avg.toFixed(2)}ms`, 'Navigation Warning');
                }
            }
        }

        // Report critical operation performance
        if (performanceData.criticalOperations) {
            for (const [op, times] of performanceData.criticalOperations) {
                const avg = times.reduce((a, b) => a + b, 0) / times.length;
                if (avg > 2000) {
                    this.addError(`${op} operation is slow: ${avg.toFixed(2)}ms`, 'Slow Operation');
                } else if (avg > 1000) {
                    this.addWarning(`${op} operation time is concerning: ${avg.toFixed(2)}ms`, 'Operation Warning');
                }
            }
        }

        // Report performance alerts
        if (performanceData.alerts && performanceData.alerts.length > 0) {
            performanceData.alerts.forEach(alert => {
                this.addWarning(alert.message, alert.category);
            });
        }
    }

    static setOutput(name, value) {
        console.log(`::set-output name=${name}::${value}`);
    }

    static setOutputs(testResults, performanceData) {
        this.setOutput('tests_passed', testResults.passed);
        this.setOutput('tests_failed', testResults.failed);
        this.setOutput('total_tests', testResults.total);
        this.setOutput('test_duration', testResults.duration);
        this.setOutput('success_rate', ((testResults.passed / testResults.total) * 100).toFixed(1));
        
        // Calculate performance score
        let performanceScore = 100;
        if (performanceData.alerts) {
            performanceScore -= performanceData.alerts.length * 5;
        }
        if (performanceData.failures) {
            performanceScore -= performanceData.failures.length * 10;
        }
        
        this.setOutput('performance_score', Math.max(0, performanceScore));
    }
}

module.exports = GitHubAnnotationsReporter;
