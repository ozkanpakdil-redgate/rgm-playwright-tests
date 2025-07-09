const fs = require('fs');
const path = require('path');
const performanceReporter = require('./performance-reporter');

// Read the test results from Playwright's output
try {
    const testResultsPath = path.join(process.cwd(), 'test-reports', 'test-results.json');
    const results = JSON.parse(fs.readFileSync(testResultsPath, 'utf8'));
    
    // Process test results
    const testSummary = {
        passed: 0,
        failed: 0,
        total: 0
    };

    // Process results and collect metrics
    results.suites.forEach(suite => {
        suite.specs.forEach(spec => {
            testSummary.total++;
            if (spec.ok) {
                testSummary.passed++;
            } else {
                testSummary.failed++;
                performanceReporter.addFailedTest(
                    spec.title,
                    spec.error?.message || 'Test failed'
                );
            }

            // Process performance metrics from test output
            spec.tests.forEach(test => {
                test.results.forEach(result => {
                    if (result.stdout) {
                        // Parse performance metrics from stdout
                        const lines = result.stdout.split('\n');
                        lines.forEach(line => {
                            if (line.includes('page loaded in')) {
                                const matches = line.match(/(\w+) page loaded in (\d+)ms/);
                                if (matches) {
                                    performanceReporter.recordPageTime(matches[1], parseInt(matches[2]));
                                }
                            }
                            if (line.includes('SLOW PERFORMANCE:')) {
                                const matches = line.match(/SLOW PERFORMANCE: (\w+) took (\d+)ms/);
                                if (matches) {
                                    performanceReporter.recordCriticalOperation(matches[1], parseInt(matches[2]));
                                }
                            }
                        });
                    }
                });
            });
        });
    });

    performanceReporter.updateTestSummary(testSummary);
    performanceReporter.saveReport();
    
    console.log('Performance report updated successfully');
} catch (error) {
    console.error('Error updating performance report:', error);
    process.exit(1);
}
