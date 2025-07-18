const fs = require('fs');
const path = require('path');
const performanceReporter = require('./performance-reporter');
const GitHubSummaryReporter = require('./github-summary-reporter');
const GitHubAnnotationsReporter = require('./github-annotations-reporter');
const HTMLReporter = require('./html-reporter');
const PerformanceTrendReporter = require('./performance-trend-reporter');

// Function to parse performance data from console output or log files
function parsePerformanceFromLogs() {
    try {
        // Try to read from test output or console logs
        const possibleLogPaths = [
            path.join(process.cwd(), 'test-reports', 'test-output.log'),
            path.join(process.cwd(), 'playwright-report', 'index.html'),
            path.join(process.cwd(), 'test-results')
        ];
        
        // For now, just return empty - we'll rely on the performance-test-reporter.js
        // to collect metrics during test execution
        return {};
    } catch (error) {
        console.log('No additional log data found');
        return {};
    }
}

// Read the test results from Playwright's output
try {
    const testResultsPath = path.join(process.cwd(), 'test-reports', 'test-results.json');
    
    // Check if test results file exists
    if (!fs.existsSync(testResultsPath)) {
        console.log('No test-results.json found, generating basic report...');
        
        // Try to parse any performance data from logs
        parsePerformanceFromLogs();
        
        // Generate a basic report without detailed test results
        const basicSummary = {
            passed: 0,
            failed: 0,
            total: 0,
            duration: 0
        };
        
        performanceReporter.updateTestResults(basicSummary);
        performanceReporter.saveReport();
        console.log('Basic performance report generated successfully');
        return;
    }
    
    const results = JSON.parse(fs.readFileSync(testResultsPath, 'utf8'));
    
    // Process test results - Handle Playwright's JSON reporter format
    const testSummary = {
        passed: 0,
        failed: 0,
        total: 0,
        duration: 0
    };

    // Use the stats from the results if available
    if (results.stats) {
        testSummary.passed = results.stats.expected || 0;
        testSummary.failed = results.stats.unexpected || 0;
        testSummary.total = (results.stats.expected || 0) + (results.stats.unexpected || 0);
        testSummary.duration = results.stats.duration || 0;
    }

    // Process suites for additional data
    if (results.suites) {
        results.suites.forEach(suite => {
            suite.specs.forEach(spec => {
                spec.tests.forEach(test => {
                    test.results.forEach(result => {
                        if (result.stdout) {
                            parsePerformanceMetrics(result.stdout);
                        }
                        if (result.stderr) {
                            parsePerformanceMetrics(result.stderr);
                        }
                    });
                });
            });
        });
    }

    // Function to parse performance metrics from output
    function parsePerformanceMetrics(output) {
        const lines = output.split('\n');
        lines.forEach(line => {
            if (line.includes('page loaded in')) {
                const matches = line.match(/(\w+) page loaded in (\d+)ms/);
                if (matches) {
                    performanceReporter.addPageTime(matches[1], parseInt(matches[2]));
                }
            }
            if (line.includes('SLOW PERFORMANCE:')) {
                const matches = line.match(/⚠️\s*SLOW PERFORMANCE: (\w+) took (\d+)ms \(threshold: (\d+)ms\)/);
                if (matches) {
                    const operation = matches[1];
                    const duration = parseInt(matches[2]);
                    const threshold = parseInt(matches[3]);
                    performanceReporter.addCriticalOperation(operation, duration);
                    performanceReporter.addAlert('Performance Warning', `${operation} took ${duration}ms (threshold: ${threshold}ms)`);
                }
            }
            if (line.includes('✅')) {
                const matches = line.match(/✅ (\w+) completed in (\d+)ms/);
                if (matches) {
                    performanceReporter.addCriticalOperation(matches[1], parseInt(matches[2]));
                }
            }
        });
    }

    // Update test summary in the performance reporter
    performanceReporter.updateTestResults(testSummary);
    
    // The performance data should already be collected by the performance-test-reporter
    // during test execution, so we just need to save the report
    performanceReporter.saveReport();
    
    // Generate additional reports for GitHub Actions
    if (process.env.CI) {
        // Generate GitHub Actions Summary
        const summaryReporter = new GitHubSummaryReporter();
        const performanceData = {
            pageLoadTimes: performanceReporter.pageLoadTimes,
            navigationTimes: performanceReporter.navigationTimes,
            criticalOperations: performanceReporter.criticalOperations,
            alerts: performanceReporter.alerts,
            failures: performanceReporter.failures
        };
        
        const summaryContent = summaryReporter.generatePerformanceSummary(testSummary, performanceData);
        summaryReporter.writeToGitHubSummary(summaryContent);
        
        // Generate GitHub Annotations
        GitHubAnnotationsReporter.reportPerformanceMetrics(performanceData);
        GitHubAnnotationsReporter.setOutputs(testSummary, performanceData);
        
        // Generate HTML Report
        const htmlReporter = new HTMLReporter();
        const htmlContent = htmlReporter.generateHTMLReport(testSummary, performanceData);
        htmlReporter.saveHTMLReport(htmlContent);
        
        // Generate Performance Trends Report
        const trendReporter = new PerformanceTrendReporter();
        trendReporter.addTrendData(testSummary, performanceData);
        trendReporter.saveTrendReport();
        
        console.log('GitHub Actions reports generated successfully');
    }
    
    console.log('Performance report updated successfully');
    console.log(`Test Summary: ${testSummary.passed} passed, ${testSummary.failed} failed, ${testSummary.total} total`);
    console.log(`Duration: ${testSummary.duration}ms`);
    
} catch (error) {
    console.error('Error updating performance report:', error);
    
    // Try to generate a basic report even if there's an error
    try {
        console.log('Attempting to generate fallback report...');
        const fallbackSummary = {
            passed: 0,
            failed: 0,
            total: 0,
            duration: 0
        };
        performanceReporter.updateTestResults(fallbackSummary);
        performanceReporter.saveReport();
        console.log('Fallback performance report generated');
    } catch (fallbackError) {
        console.error('Failed to generate fallback report:', fallbackError);
        process.exit(1);
    }
}
