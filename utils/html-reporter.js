const fs = require('fs');
const path = require('path');

class HTMLReporter {
    generateHTMLReport(testResults, performanceData) {
        const html = `
<!DOCTYPE html>
<html>
<head>
    <title>Performance Test Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background-color: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .metric-card { background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #007bff; }
        .metric-value { font-size: 2em; font-weight: bold; color: #007bff; }
        .metric-label { color: #666; margin-top: 5px; }
        .section { margin-bottom: 30px; }
        .section h2 { color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background-color: #f8f9fa; font-weight: bold; }
        .status-good { color: #28a745; font-weight: bold; }
        .status-warning { color: #ffc107; font-weight: bold; }
        .status-slow { color: #dc3545; font-weight: bold; }
        .alert { padding: 10px; margin: 10px 0; border-radius: 4px; }
        .alert-warning { background-color: #fff3cd; border: 1px solid #ffeaa7; color: #856404; }
        .alert-error { background-color: #f8d7da; border: 1px solid #f5c6cb; color: #721c24; }
        .timestamp { color: #666; font-size: 0.9em; }
        .chart-container { margin: 20px 0; }
        .progress-bar { width: 100%; height: 20px; background-color: #e9ecef; border-radius: 10px; overflow: hidden; }
        .progress-fill { height: 100%; background-color: #28a745; transition: width 0.3s ease; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 Performance Test Report</h1>
            <p class="timestamp">Generated: ${new Date().toLocaleString()}</p>
        </div>

        <div class="metrics">
            <div class="metric-card">
                <div class="metric-value">${testResults.passed}</div>
                <div class="metric-label">Tests Passed</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${testResults.failed}</div>
                <div class="metric-label">Tests Failed</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${testResults.total}</div>
                <div class="metric-label">Total Tests</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${(testResults.duration / 1000).toFixed(1)}s</div>
                <div class="metric-label">Total Duration</div>
            </div>
        </div>

        <div class="section">
            <h2>Success Rate</h2>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${(testResults.passed / testResults.total) * 100}%"></div>
            </div>
            <p>${((testResults.passed / testResults.total) * 100).toFixed(1)}% of tests passed</p>
        </div>

        ${this.generatePerformanceSection('Page Load Performance', performanceData.pageLoadTimes, 5000, 3000)}
        ${this.generatePerformanceSection('Navigation Performance', performanceData.navigationTimes, 3000, 1500)}
        ${this.generatePerformanceSection('Critical Operations', performanceData.criticalOperations, 2000, 1000)}
        ${this.generateAlertsSection(performanceData.alerts)}
        ${this.generateFailuresSection(performanceData.failures)}
    </div>
</body>
</html>`;
        return html;
    }

    generatePerformanceSection(title, dataMap, slowThreshold, warningThreshold) {
        if (!dataMap || dataMap.size === 0) {
            return '';
        }

        let rows = '';
        for (const [name, times] of dataMap) {
            const avg = times.reduce((a, b) => a + b, 0) / times.length;
            const status = avg > slowThreshold ? 'status-slow' : avg > warningThreshold ? 'status-warning' : 'status-good';
            const statusText = avg > slowThreshold ? '🔴 Slow' : avg > warningThreshold ? '🟡 Warning' : '🟢 Good';
            
            rows += `
                <tr>
                    <td>${name}</td>
                    <td>${avg.toFixed(2)}ms</td>
                    <td>${times.length}</td>
                    <td>${Math.min(...times)}ms</td>
                    <td>${Math.max(...times)}ms</td>
                    <td class="${status}">${statusText}</td>
                </tr>
            `;
        }

        return `
            <div class="section">
                <h2>${title}</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Average</th>
                            <th>Count</th>
                            <th>Min</th>
                            <th>Max</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rows}
                    </tbody>
                </table>
            </div>
        `;
    }

    generateAlertsSection(alerts) {
        if (!alerts || alerts.length === 0) {
            return '';
        }

        const alertsHTML = alerts.map(alert => `
            <div class="alert alert-warning">
                <strong>${alert.category}:</strong> ${alert.message}
            </div>
        `).join('');

        return `
            <div class="section">
                <h2>⚠️ Performance Alerts</h2>
                ${alertsHTML}
            </div>
        `;
    }

    generateFailuresSection(failures) {
        if (!failures || failures.length === 0) {
            return '';
        }

        const failuresHTML = failures.map(failure => `
            <div class="alert alert-error">
                <strong>${failure.testName}:</strong><br>
                <pre style="white-space: pre-wrap; margin-top: 10px;">${failure.error}</pre>
            </div>
        `).join('');

        return `
            <div class="section">
                <h2>❌ Test Failures</h2>
                ${failuresHTML}
            </div>
        `;
    }

    saveHTMLReport(content, filename = 'performance-report.html') {
        const reportsDir = path.join(process.cwd(), 'test-reports');
        if (!fs.existsSync(reportsDir)) {
            fs.mkdirSync(reportsDir, { recursive: true });
        }
        
        const filePath = path.join(reportsDir, filename);
        fs.writeFileSync(filePath, content);
        console.log(`HTML report saved to: ${filePath}`);
        return filePath;
    }
}

module.exports = HTMLReporter;
