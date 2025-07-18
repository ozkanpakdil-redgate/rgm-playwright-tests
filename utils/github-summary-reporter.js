const fs = require('fs');
const path = require('path');

class GitHubSummaryReporter {
    constructor() {
        this.summary = [];
    }

    addToSummary(content) {
        this.summary.push(content);
    }

    generatePerformanceSummary(testResults, performanceData) {
        let summary = '';
        
        // Add header
        summary += '# 🚀 Performance Test Results\n\n';
        
        // Test summary
        summary += `## 📊 Test Summary\n`;
        summary += `| Metric | Value |\n`;
        summary += `|--------|-------|\n`;
        summary += `| ✅ Tests Passed | ${testResults.passed} |\n`;
        summary += `| ❌ Tests Failed | ${testResults.failed} |\n`;
        summary += `| 📝 Total Tests | ${testResults.total} |\n`;
        summary += `| ⏱️ Duration | ${(testResults.duration / 1000).toFixed(2)}s |\n\n`;

        // Performance metrics
        if (performanceData.pageLoadTimes && performanceData.pageLoadTimes.size > 0) {
            summary += `## 🏃 Page Load Performance\n`;
            summary += `| Page | Average Load Time | Status |\n`;
            summary += `|------|-------------------|--------|\n`;
            
            for (const [page, times] of performanceData.pageLoadTimes) {
                const avg = times.reduce((a, b) => a + b, 0) / times.length;
                const status = avg > 5000 ? '🔴 Slow' : avg > 3000 ? '🟡 Warning' : '🟢 Good';
                summary += `| ${page} | ${avg.toFixed(2)}ms | ${status} |\n`;
            }
            summary += '\n';
        }

        // Navigation performance
        if (performanceData.navigationTimes && performanceData.navigationTimes.size > 0) {
            summary += `## 🧭 Navigation Performance\n`;
            summary += `| Navigation | Average Time | Status |\n`;
            summary += `|------------|--------------|--------|\n`;
            
            for (const [nav, times] of performanceData.navigationTimes) {
                const avg = times.reduce((a, b) => a + b, 0) / times.length;
                const status = avg > 3000 ? '🔴 Slow' : avg > 1500 ? '🟡 Warning' : '🟢 Good';
                summary += `| ${nav} | ${avg.toFixed(2)}ms | ${status} |\n`;
            }
            summary += '\n';
        }

        // Critical operations
        if (performanceData.criticalOperations && performanceData.criticalOperations.size > 0) {
            summary += `## ⚡ Critical Operations\n`;
            summary += `| Operation | Average Time | Status |\n`;
            summary += `|-----------|--------------|--------|\n`;
            
            for (const [op, times] of performanceData.criticalOperations) {
                const avg = times.reduce((a, b) => a + b, 0) / times.length;
                const status = avg > 2000 ? '🔴 Slow' : avg > 1000 ? '🟡 Warning' : '🟢 Good';
                summary += `| ${op} | ${avg.toFixed(2)}ms | ${status} |\n`;
            }
            summary += '\n';
        }

        // Performance alerts
        if (performanceData.alerts && performanceData.alerts.length > 0) {
            summary += `## ⚠️ Performance Alerts\n`;
            performanceData.alerts.forEach(alert => {
                summary += `- **${alert.category}**: ${alert.message}\n`;
            });
            summary += '\n';
        }

        // Failed tests
        if (performanceData.failures && performanceData.failures.length > 0) {
            summary += `## ❌ Test Failures\n`;
            summary += `<details>\n<summary>Click to see failed tests (${performanceData.failures.length})</summary>\n\n`;
            performanceData.failures.forEach(failure => {
                summary += `**${failure.testName}**\n`;
                summary += `\`\`\`\n${failure.error}\n\`\`\`\n\n`;
            });
            summary += `</details>\n\n`;
        }

        // Add trend info
        summary += `## 📈 Trend Information\n`;
        summary += `- **Run Date**: ${new Date().toISOString()}\n`;
        summary += `- **Total Duration**: ${(testResults.duration / 1000 / 60).toFixed(2)} minutes\n`;
        summary += `- **Success Rate**: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%\n\n`;

        return summary;
    }

    writeToGitHubSummary(content) {
        if (process.env.GITHUB_STEP_SUMMARY) {
            fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, content);
        } else {
            console.log('GitHub Step Summary not available, writing to console:');
            console.log(content);
        }
    }
}

module.exports = GitHubSummaryReporter;
