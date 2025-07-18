const fs = require('fs');
const path = require('path');

class PerformanceTrendReporter {
    constructor() {
        this.trendsFile = path.join(process.cwd(), 'performance-reports', 'trends.json');
        this.trendsDir = path.dirname(this.trendsFile);
    }

    ensureTrendsDirectory() {
        if (!fs.existsSync(this.trendsDir)) {
            fs.mkdirSync(this.trendsDir, { recursive: true });
        }
    }

    loadTrends() {
        this.ensureTrendsDirectory();
        if (fs.existsSync(this.trendsFile)) {
            try {
                return JSON.parse(fs.readFileSync(this.trendsFile, 'utf8'));
            } catch (error) {
                console.warn('Could not load trends file:', error.message);
                return { runs: [] };
            }
        }
        return { runs: [] };
    }

    addTrendData(testResults, performanceData) {
        const trends = this.loadTrends();
        
        const newRun = {
            timestamp: new Date().toISOString(),
            commit: process.env.GITHUB_SHA || 'unknown',
            branch: process.env.GITHUB_REF_NAME || 'unknown',
            runId: process.env.GITHUB_RUN_ID || 'unknown',
            testResults: {
                passed: testResults.passed,
                failed: testResults.failed,
                total: testResults.total,
                duration: testResults.duration
            },
            performance: {
                pageLoadTimes: this.mapToObject(performanceData.pageLoadTimes),
                navigationTimes: this.mapToObject(performanceData.navigationTimes),
                criticalOperations: this.mapToObject(performanceData.criticalOperations),
                alertCount: performanceData.alerts ? performanceData.alerts.length : 0
            }
        };

        trends.runs.push(newRun);
        
        // Keep only last 50 runs to avoid file getting too large
        if (trends.runs.length > 50) {
            trends.runs = trends.runs.slice(-50);
        }

        fs.writeFileSync(this.trendsFile, JSON.stringify(trends, null, 2));
        console.log('Performance trends updated');
    }

    mapToObject(map) {
        if (!map || typeof map.entries !== 'function') return {};
        
        const obj = {};
        for (const [key, values] of map.entries()) {
            obj[key] = {
                average: values.reduce((a, b) => a + b, 0) / values.length,
                min: Math.min(...values),
                max: Math.max(...values),
                count: values.length
            };
        }
        return obj;
    }

    generateTrendReport() {
        const trends = this.loadTrends();
        if (trends.runs.length === 0) {
            return 'No trend data available yet.';
        }

        let report = '# Performance Trends Report\n\n';
        
        // Recent performance summary
        const latest = trends.runs[trends.runs.length - 1];
        const previous = trends.runs.length > 1 ? trends.runs[trends.runs.length - 2] : null;
        
        report += '## Latest Run vs Previous\n\n';
        report += '| Metric | Latest | Previous | Change |\n';
        report += '|--------|--------|----------|--------|\n';
        
        if (previous) {
            const durationChange = ((latest.testResults.duration - previous.testResults.duration) / previous.testResults.duration * 100).toFixed(1);
            const passedChange = latest.testResults.passed - previous.testResults.passed;
            const failedChange = latest.testResults.failed - previous.testResults.failed;
            
            report += `| Duration | ${(latest.testResults.duration / 1000).toFixed(2)}s | ${(previous.testResults.duration / 1000).toFixed(2)}s | ${durationChange > 0 ? '+' : ''}${durationChange}% |\n`;
            report += `| Passed | ${latest.testResults.passed} | ${previous.testResults.passed} | ${passedChange > 0 ? '+' : ''}${passedChange} |\n`;
            report += `| Failed | ${latest.testResults.failed} | ${previous.testResults.failed} | ${failedChange > 0 ? '+' : ''}${failedChange} |\n`;
        } else {
            report += `| Duration | ${(latest.testResults.duration / 1000).toFixed(2)}s | N/A | N/A |\n`;
            report += `| Passed | ${latest.testResults.passed} | N/A | N/A |\n`;
            report += `| Failed | ${latest.testResults.failed} | N/A | N/A |\n`;
        }
        
        report += '\n## Recent Performance History\n\n';
        report += '| Date | Commit | Passed | Failed | Duration | Alerts |\n';
        report += '|------|--------|--------|--------|----------|--------|\n';
        
        // Show last 10 runs
        const recentRuns = trends.runs.slice(-10);
        recentRuns.forEach(run => {
            const date = new Date(run.timestamp).toLocaleDateString();
            const commitShort = run.commit.substring(0, 7);
            const duration = (run.testResults.duration / 1000).toFixed(2);
            
            report += `| ${date} | ${commitShort} | ${run.testResults.passed} | ${run.testResults.failed} | ${duration}s | ${run.performance.alertCount} |\n`;
        });
        
        return report;
    }

    saveTrendReport() {
        const report = this.generateTrendReport();
        const reportPath = path.join(this.trendsDir, 'trend-report.md');
        fs.writeFileSync(reportPath, report);
        console.log('Trend report saved to:', reportPath);
    }
}

module.exports = PerformanceTrendReporter;
