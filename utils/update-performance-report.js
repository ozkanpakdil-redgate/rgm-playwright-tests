const fs = require('fs');
const path = require('path');
const performanceReporter = require('./performance-reporter');

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
    
    // Process test results
    const testSummary = {
        passed: 0,
        failed: 0,
        total: 0,
        duration: 0
    };

    // Handle different JSON structures from Playwright
    const specs = results.suites || results.specs || [];
    
    // Process results and collect metrics
    specs.forEach(suite => {
        const testsToProcess = suite.specs || suite.tests || [suite];
        testsToProcess.forEach(spec => {
            testSummary.total++;
            
            // Check if test passed (handle different property names)
            const passed = spec.ok !== false && spec.outcome !== 'unexpected' && 
                          spec.status !== 'failed' && !spec.error;
            
            if (passed) {
                testSummary.passed++;
            } else {
                testSummary.failed++;
                performanceReporter.addFailure(
                    spec.title || spec.name || 'Unknown test',
                    spec.error?.message || spec.errors?.[0]?.message || 'Test failed'
                );
            }

            // Process performance metrics from test output
            const tests = spec.tests || [spec];
            tests.forEach(test => {
                const results = test.results || [];
                results.forEach(result => {
                    if (result.stdout) {
                        // Parse performance metrics from stdout
                        const lines = result.stdout.split('\n');
                        lines.forEach(line => {
                            if (line.includes('page loaded in')) {
                                const matches = line.match(/(\w+) page loaded in (\d+)ms/);
                                if (matches) {
                                    performanceReporter.addPageTime(matches[1], parseInt(matches[2]));
                                }
                            }
                            if (line.includes('SLOW PERFORMANCE:')) {
                                const matches = line.match(/SLOW PERFORMANCE: (\w+) took (\d+)ms/);
                                if (matches) {
                                    performanceReporter.addCriticalOperation(matches[1], parseInt(matches[2]));
                                }
                            }
                            if (line.includes('⚠️  SLOW PERFORMANCE:')) {
                                const matches = line.match(/⚠️  SLOW PERFORMANCE: (\w+) took (\d+)ms \(threshold: (\d+)ms\)/);
                                if (matches) {
                                    const operation = matches[1];
                                    const duration = parseInt(matches[2]);
                                    const threshold = parseInt(matches[3]);
                                    performanceReporter.addCriticalOperation(operation, duration);
                                    performanceReporter.addAlert('Timeout Alerts', `${operation} took ${duration}ms (threshold: ${threshold}ms)`);
                                }
                            }
                        });
                    }
                });
            });
        });
    });

    // Calculate total duration if available
    if (results.config && results.config.metadata && results.config.metadata.totalTime) {
        testSummary.duration = results.config.metadata.totalTime;
    }

    performanceReporter.updateTestResults(testSummary);
    performanceReporter.saveReport();
    
    console.log('Performance report updated successfully');
    console.log(`Test Summary: ${testSummary.passed} passed, ${testSummary.failed} failed, ${testSummary.total} total`);
    
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
