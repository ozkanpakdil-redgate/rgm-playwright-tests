const fs = require('fs');
const path = require('path');

class DetailedTestReportGenerator {
    constructor() {
        this.testData = null;
        this.performanceData = {};
    }

    async generateDetailedReport() {
        console.log('🎭 Generating detailed Playwright test report...');
        
        // Load test results
        const testResultsPath = path.join(process.cwd(), 'test-reports', 'test-results.json');
        if (!fs.existsSync(testResultsPath)) {
            console.error('❌ Test results file not found:', testResultsPath);
            return;
        }

        this.testData = JSON.parse(fs.readFileSync(testResultsPath, 'utf8'));
        
        // Load performance data
        await this.loadPerformanceData();
        
        // Generate HTML report
        const html = this.generateHTML();
        
        // Save the enhanced report
        const outputPath = path.join(process.cwd(), 'test-reports', 'detailed-test-report.html');
        fs.writeFileSync(outputPath, html, 'utf8');
        
        console.log('✅ Detailed test report generated:', outputPath);
        
        // Also create a JSON summary for easy consumption
        const summary = this.generateTestSummary();
        const summaryPath = path.join(process.cwd(), 'test-reports', 'test-summary.json');
        fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2), 'utf8');
        
        console.log('✅ Test summary JSON generated:', summaryPath);
        
        return { html: outputPath, summary: summaryPath };
    }

    async loadPerformanceData() {
        const metricsDir = path.join(process.cwd(), 'performance-metrics');
        if (fs.existsSync(metricsDir)) {
            const files = fs.readdirSync(metricsDir);
            for (const file of files) {
                if (file.endsWith('.json')) {
                    try {
                        const data = JSON.parse(fs.readFileSync(path.join(metricsDir, file), 'utf8'));
                        if (data.testName) {
                            this.performanceData[data.testName] = data;
                        }
                    } catch (error) {
                        // Skip invalid files
                    }
                }
            }
        }
    }

    generateTestSummary() {
        const summary = {
            overview: {
                totalTests: this.testData.stats.expected + this.testData.stats.unexpected,
                passed: this.testData.stats.expected,
                failed: this.testData.stats.unexpected,
                skipped: this.testData.stats.skipped || 0,
                duration: this.testData.stats.duration,
                startTime: this.testData.stats.startTime,
                successRate: ((this.testData.stats.expected / (this.testData.stats.expected + this.testData.stats.unexpected)) * 100).toFixed(1)
            },
            suites: [],
            tests: [],
            performance: {
                slowestTests: [],
                fastestTests: [],
                avgDuration: 0
            }
        };

        let totalTestDuration = 0;
        let testCount = 0;

        // Process each suite
        this.testData.suites.forEach(suite => {
            const suiteInfo = {
                title: suite.title,
                file: suite.file,
                tests: []
            };

            this.processSuiteTests(suite, suiteInfo.tests, summary.tests);
            summary.suites.push(suiteInfo);
        });

        // Calculate performance metrics
        summary.tests.forEach(test => {
            totalTestDuration += test.duration;
            testCount++;
        });

        if (testCount > 0) {
            summary.performance.avgDuration = totalTestDuration / testCount;
        }

        // Sort tests by duration for performance insights
        const sortedTests = [...summary.tests].sort((a, b) => b.duration - a.duration);
        summary.performance.slowestTests = sortedTests.slice(0, 10);
        summary.performance.fastestTests = sortedTests.slice(-10).reverse();

        return summary;
    }

    processSuiteTests(suite, suiteTests, allTests) {
        if (suite.specs) {
            suite.specs.forEach(spec => {
                spec.tests.forEach(test => {
                    const testInfo = {
                        title: test.title || spec.title,
                        fullTitle: `${suite.title} > ${spec.title}`,
                        status: this.getTestStatus(test),
                        duration: this.getTestDuration(test),
                        browser: test.projectName || 'Unknown',
                        file: suite.file,
                        projectId: test.projectId,
                        results: test.results.map(result => ({
                            status: result.status,
                            duration: result.duration,
                            error: result.errors && result.errors.length > 0 ? {
                                message: result.errors[0].message,
                                stack: result.errors[0].stack
                            } : null,
                            retry: result.retry || 0,
                            startTime: result.startTime,
                            attachments: result.attachments ? result.attachments.length : 0,
                            workerIndex: result.workerIndex,
                            stdout: result.stdout ? result.stdout.join('\n') : '',
                            stderr: result.stderr ? result.stderr.join('\n') : ''
                        }))
                    };

                    // Add performance data if available
                    const testKey = test.title || spec.title;
                    if (this.performanceData[testKey]) {
                        testInfo.performance = this.performanceData[testKey];
                    }

                    suiteTests.push(testInfo);
                    allTests.push(testInfo);
                });
            });
        }

        // Process nested suites
        if (suite.suites) {
            suite.suites.forEach(nestedSuite => {
                this.processSuiteTests(nestedSuite, suiteTests, allTests);
            });
        }
    }

    getTestStatus(test) {
        // Check the test's overall status first
        if (test.status) {
            return test.status;
        }
        
        // Fallback to checking results
        const statuses = test.results.map(r => r.status);
        if (statuses.includes('passed')) return 'passed';
        if (statuses.includes('failed')) return 'failed';
        if (statuses.includes('skipped')) return 'skipped';
        return 'unknown';
    }

    getTestDuration(test) {
        return test.results.reduce((sum, result) => sum + (result.duration || 0), 0);
    }

    getBrowserFromTitle(title) {
        if (!title || typeof title !== 'string') {
            return 'Unknown';
        }
        
        const browsers = ['Chrome', 'Firefox', 'Safari', 'Edge', 'Mobile Chrome', 'Mobile Safari'];
        for (const browser of browsers) {
            if (title.includes(browser)) return browser;
        }
        return 'Unknown';
    }

    getBrowserFromResults(results) {
        if (!results || !Array.isArray(results) || results.length === 0) {
            return 'Unknown';
        }
        
        // Try to get browser from the first result's projectName
        const firstResult = results[0];
        if (firstResult.projectName) {
            return firstResult.projectName;
        }
        
        // Fallback to extracting from other properties if available
        if (firstResult.workerIndex !== undefined) {
            // This is just a fallback - in real scenarios you'd map worker index to browser
            const browsers = ['Chrome', 'Firefox', 'Safari', 'Edge', 'Mobile Chrome', 'Mobile Safari'];
            return browsers[firstResult.workerIndex % browsers.length] || 'Unknown';
        }
        
        return 'Unknown';
    }

    generateHTML() {
        const summary = this.generateTestSummary();
        
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Detailed Playwright Test Report</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            background: #f5f7fa;
        }

        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 2rem;
            text-align: center;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }

        .header h1 {
            font-size: 2.5rem;
            margin-bottom: 0.5rem;
        }

        .header p {
            font-size: 1.2rem;
            opacity: 0.9;
        }

        .container {
            max-width: 1400px;
            margin: 0 auto;
            padding: 2rem;
        }

        .overview-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
            margin-bottom: 2rem;
        }

        .stat-card {
            background: white;
            padding: 1.5rem;
            border-radius: 8px;
            text-align: center;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            border-left: 4px solid #667eea;
        }

        .stat-card.passed {
            border-left-color: #10b981;
        }

        .stat-card.failed {
            border-left-color: #ef4444;
        }

        .stat-card.skipped {
            border-left-color: #f59e0b;
        }

        .stat-value {
            font-size: 2rem;
            font-weight: bold;
            margin-bottom: 0.5rem;
        }

        .stat-label {
            color: #6b7280;
            font-size: 0.9rem;
        }

        .section {
            background: white;
            margin-bottom: 2rem;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }

        .section-header {
            padding: 1.5rem;
            border-bottom: 1px solid #e5e7eb;
            background: #f9fafb;
            border-radius: 8px 8px 0 0;
        }

        .section-title {
            font-size: 1.5rem;
            font-weight: 600;
            margin-bottom: 0.5rem;
        }

        .section-content {
            padding: 1.5rem;
        }

        .tabs {
            display: flex;
            border-bottom: 1px solid #e5e7eb;
            margin-bottom: 1rem;
        }

        .tab {
            padding: 0.75rem 1.5rem;
            cursor: pointer;
            border: none;
            background: none;
            font-size: 1rem;
            color: #6b7280;
            border-bottom: 2px solid transparent;
            transition: all 0.3s;
        }

        .tab.active {
            color: #667eea;
            border-bottom-color: #667eea;
        }

        .tab-content {
            display: none;
        }

        .tab-content.active {
            display: block;
        }

        .test-grid {
            display: grid;
            gap: 1rem;
        }

        .test-item {
            border: 1px solid #e5e7eb;
            border-radius: 6px;
            padding: 1rem;
            background: white;
            transition: box-shadow 0.3s;
        }

        .test-item:hover {
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        .test-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 0.5rem;
        }

        .test-title {
            font-weight: 600;
            font-size: 1rem;
        }

        .test-status {
            padding: 0.25rem 0.75rem;
            border-radius: 12px;
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
        }

        .test-status.passed {
            background: #dcfce7;
            color: #166534;
        }

        .test-status.failed {
            background: #fef2f2;
            color: #991b1b;
        }

        .test-status.skipped {
            background: #fef3c7;
            color: #92400e;
        }

        .test-meta {
            display: flex;
            gap: 1rem;
            color: #6b7280;
            font-size: 0.9rem;
            margin-bottom: 0.5rem;
        }

        .test-browser {
            font-weight: 500;
        }

        .test-duration {
            color: #4b5563;
        }

        .test-file {
            font-family: monospace;
            font-size: 0.8rem;
            color: #6b7280;
        }

        .error-details {
            background: #fef2f2;
            border: 1px solid #fecaca;
            border-radius: 4px;
            padding: 1rem;
            margin-top: 0.5rem;
        }

        .error-message {
            color: #991b1b;
            font-weight: 600;
            margin-bottom: 0.5rem;
        }

        .error-stack {
            font-family: monospace;
            font-size: 0.8rem;
            color: #6b7280;
            overflow-x: auto;
            white-space: pre-wrap;
        }

        .filters {
            display: flex;
            gap: 1rem;
            margin-bottom: 1rem;
            flex-wrap: wrap;
        }

        .filter-input {
            padding: 0.5rem;
            border: 1px solid #d1d5db;
            border-radius: 4px;
            font-size: 0.9rem;
        }

        .filter-select {
            padding: 0.5rem;
            border: 1px solid #d1d5db;
            border-radius: 4px;
            font-size: 0.9rem;
            background: white;
        }

        .performance-insight {
            background: #f0f9ff;
            border: 1px solid #bae6fd;
            border-radius: 4px;
            padding: 0.75rem;
            margin-top: 0.5rem;
            font-size: 0.9rem;
        }

        .suite-header {
            background: #f3f4f6;
            padding: 1rem;
            border-radius: 6px;
            margin-bottom: 1rem;
            border-left: 4px solid #667eea;
        }

        .suite-title {
            font-weight: 600;
            font-size: 1.1rem;
            color: #374151;
        }

        .suite-file {
            font-family: monospace;
            font-size: 0.9rem;
            color: #6b7280;
            margin-top: 0.25rem;
        }

        @media (max-width: 768px) {
            .overview-grid {
                grid-template-columns: repeat(2, 1fr);
            }
            
            .filters {
                flex-direction: column;
            }
            
            .test-header {
                flex-direction: column;
                align-items: flex-start;
                gap: 0.5rem;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🎭 Playwright Test Report</h1>
        <p>Detailed test execution results and performance insights</p>
    </div>

    <div class="container">
        <!-- Overview Cards -->
        <div class="overview-grid">
            <div class="stat-card">
                <div class="stat-value">${summary.overview.totalTests}</div>
                <div class="stat-label">Total Tests</div>
            </div>
            <div class="stat-card passed">
                <div class="stat-value">${summary.overview.passed}</div>
                <div class="stat-label">Tests Passed</div>
            </div>
            <div class="stat-card failed">
                <div class="stat-value">${summary.overview.failed}</div>
                <div class="stat-label">Tests Failed</div>
            </div>
            <div class="stat-card skipped">
                <div class="stat-value">${summary.overview.skipped}</div>
                <div class="stat-label">Tests Skipped</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${(summary.overview.duration / 1000).toFixed(1)}s</div>
                <div class="stat-label">Total Duration</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${summary.overview.successRate}%</div>
                <div class="stat-label">Success Rate</div>
            </div>
        </div>

        <!-- Main Content -->
        <div class="section">
            <div class="section-header">
                <h2 class="section-title">Test Results</h2>
                <p>Detailed breakdown of all test executions</p>
            </div>
            <div class="section-content">
                <div class="tabs">
                    <button class="tab active" onclick="showTab('all')">All Tests (${summary.overview.totalTests})</button>
                    <button class="tab" onclick="showTab('passed')">Passed (${summary.overview.passed})</button>
                    <button class="tab" onclick="showTab('failed')">Failed (${summary.overview.failed})</button>
                    <button class="tab" onclick="showTab('performance')">Performance</button>
                    <button class="tab" onclick="showTab('suites')">By Suite</button>
                </div>

                <div class="filters">
                    <input type="text" class="filter-input" id="searchFilter" placeholder="Search tests..." onkeyup="filterTests()">
                    <select class="filter-select" id="browserFilter" onchange="filterTests()">
                        <option value="">All Browsers</option>
                        <option value="Chrome">Chrome</option>
                        <option value="Firefox">Firefox</option>
                        <option value="Safari">Safari</option>
                        <option value="Edge">Edge</option>
                        <option value="Mobile Chrome">Mobile Chrome</option>
                        <option value="Mobile Safari">Mobile Safari</option>
                    </select>
                    <select class="filter-select" id="statusFilter" onchange="filterTests()">
                        <option value="">All Status</option>
                        <option value="passed">Passed</option>
                        <option value="failed">Failed</option>
                        <option value="skipped">Skipped</option>
                    </select>
                </div>

                <!-- All Tests Tab -->
                <div id="tab-all" class="tab-content active">
                    <div class="test-grid" id="allTestsGrid">
                        ${this.generateTestItems(summary.tests)}
                    </div>
                </div>

                <!-- Passed Tests Tab -->
                <div id="tab-passed" class="tab-content">
                    <div class="test-grid">
                        ${this.generateTestItems(summary.tests.filter(t => t.status === 'passed'))}
                    </div>
                </div>

                <!-- Failed Tests Tab -->
                <div id="tab-failed" class="tab-content">
                    <div class="test-grid">
                        ${this.generateTestItems(summary.tests.filter(t => t.status === 'failed'))}
                    </div>
                </div>

                <!-- Performance Tab -->
                <div id="tab-performance" class="tab-content">
                    <div style="display: grid; gap: 2rem; grid-template-columns: 1fr 1fr;">
                        <div>
                            <h3>Slowest Tests</h3>
                            <div class="test-grid">
                                ${this.generateTestItems(summary.performance.slowestTests.slice(0, 10))}
                            </div>
                        </div>
                        <div>
                            <h3>Fastest Tests</h3>
                            <div class="test-grid">
                                ${this.generateTestItems(summary.performance.fastestTests.slice(0, 10))}
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Suites Tab -->
                <div id="tab-suites" class="tab-content">
                    ${this.generateSuiteItems(summary.suites)}
                </div>
            </div>
        </div>
    </div>

    <script>
        function showTab(tabName) {
            // Hide all tab contents
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            
            // Remove active class from all tabs
            document.querySelectorAll('.tab').forEach(tab => {
                tab.classList.remove('active');
            });
            
            // Show selected tab content
            document.getElementById('tab-' + tabName).classList.add('active');
            
            // Add active class to clicked tab
            event.target.classList.add('active');
        }

        function filterTests() {
            const searchTerm = document.getElementById('searchFilter').value.toLowerCase();
            const browserFilter = document.getElementById('browserFilter').value;
            const statusFilter = document.getElementById('statusFilter').value;
            
            const testItems = document.querySelectorAll('.test-item');
            
            testItems.forEach(item => {
                const title = item.querySelector('.test-title').textContent.toLowerCase();
                const browser = item.querySelector('.test-browser').textContent;
                const status = item.querySelector('.test-status').textContent.toLowerCase();
                
                const matchesSearch = title.includes(searchTerm);
                const matchesBrowser = !browserFilter || browser === browserFilter;
                const matchesStatus = !statusFilter || status === statusFilter;
                
                if (matchesSearch && matchesBrowser && matchesStatus) {
                    item.style.display = 'block';
                } else {
                    item.style.display = 'none';
                }
            });
        }

        // Auto-refresh functionality
        function checkForUpdates() {
            // This could be enhanced to poll for new results
            console.log('Checking for report updates...');
        }
        
        // Check for updates every 30 seconds
        setInterval(checkForUpdates, 30000);
    </script>
</body>
</html>`;
    }

    generateTestItems(tests) {
        return tests.map(test => `
            <div class="test-item" data-browser="${test.browser}" data-status="${test.status}">
                <div class="test-header">
                    <div class="test-title">${test.title}</div>
                    <div class="test-status ${test.status}">${test.status}</div>
                </div>
                <div class="test-meta">
                    <span class="test-browser">🌐 ${test.browser}</span>
                    <span class="test-duration">⏱️ ${(test.duration / 1000).toFixed(2)}s</span>
                    <span class="test-file">📁 ${path.basename(test.file)}</span>
                </div>
                ${test.results.map(result => {
                    if (result.error) {
                        return `
                            <div class="error-details">
                                <div class="error-message">❌ ${result.error.message}</div>
                                ${result.error.stack ? `<div class="error-stack">${result.error.stack.split('\n').slice(0, 5).join('\n')}...</div>` : ''}
                            </div>
                        `;
                    }
                    return '';
                }).join('')}
                ${test.performance ? `
                    <div class="performance-insight">
                        ⚡ Performance data available - Check individual metrics
                    </div>
                ` : ''}
            </div>
        `).join('');
    }

    generateSuiteItems(suites) {
        return suites.map(suite => `
            <div class="suite-header">
                <div class="suite-title">${suite.title}</div>
                <div class="suite-file">${suite.file}</div>
            </div>
            <div class="test-grid">
                ${this.generateTestItems(suite.tests)}
            </div>
        `).join('');
    }
}

// Export for use in other modules
module.exports = DetailedTestReportGenerator;

// Run if called directly
if (require.main === module) {
    const generator = new DetailedTestReportGenerator();
    generator.generateDetailedReport().catch(console.error);
}
