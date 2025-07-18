# 🎭 Playwright Test Reports - Access Guide

## 🔗 Quick Access to Reports

### 1. **Live Playwright HTML Report** 🌐
- **Direct Link**: [https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/playwright-report/](https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/playwright-report/)
- **What it shows**: Interactive HTML report with test results, timelines, traces, screenshots
- **When available**: After each workflow run (updates automatically)

### 2. **GitHub Actions Summary** 📊
- **Location**: Go to any workflow run → View the summary tab
- **What it shows**: Embedded performance reports, test statistics, alerts, trends
- **Benefits**: No download needed, all reports visible directly in GitHub

### 3. **Downloadable Artifacts** 📁
- **Location**: Go to workflow run → Scroll to "Artifacts" section
- **Available files**: 
  - `test-results` - Complete test data and JSON reports
  - `performance-reports` - Performance metrics and alerts
  - `html-performance-report` - Standalone HTML performance report
  - `performance-trends` - Historical trend data
  - `screenshots` - Test failure screenshots (when available)

## 🚀 How to Access Reports

### Method 1: Live Online Report (Recommended)
1. Go to: `https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/playwright-report/`
2. View interactive Playwright report with:
   - ✅ Test results by browser
   - 📊 Timeline and duration analysis
   - 🔍 Detailed traces and screenshots
   - 📱 Responsive design for mobile viewing

### Method 2: GitHub Actions Summary
1. Go to **Actions** tab in your repository
2. Click on any workflow run
3. View the **Summary** section with:
   - 📈 Performance statistics table
   - 📄 Complete performance report content (collapsible)
   - 📊 Performance trends analysis (collapsible)
   - ⚠️ Performance alerts with counts (collapsible)
   - 🎭 Playwright report statistics
   - 🏷️ Dynamic status badge

### Method 3: Download and View Locally
1. Go to **Actions** tab → Select workflow run
2. Scroll to **Artifacts** section
3. Download desired artifact
4. Extract and open `index.html` in your browser

## 🔄 Automatic Updates

- **Live Report**: Updates automatically after each workflow run
- **GitHub Actions Summary**: Shows results immediately after workflow completion
- **Artifacts**: Generated fresh for each run with 30-day retention

## 📱 Mobile Access

The live Playwright report is fully responsive and works great on:
- 📱 Mobile phones
- 📋 Tablets  
- 💻 Desktop browsers
- 🖥️ Large screens

## 🔧 Setup Requirements

To enable live reports, ensure:
1. ✅ GitHub Pages is enabled in repository settings
2. ✅ Workflow has `pages: write` and `id-token: write` permissions
3. ✅ Repository is public (or GitHub Pro/Team for private repos)

## 📊 Report Contents

### Playwright HTML Report Includes:
- **Test Results**: Pass/fail status by browser and test
- **Performance Metrics**: Duration, timing, resource usage
- **Visual Evidence**: Screenshots of failures
- **Traces**: Step-by-step execution traces
- **Filters**: Browser, status, search functionality
- **Timeline**: Visual test execution timeline

### Performance Reports Include:
- **Summary Statistics**: Pass/fail counts, duration, success rate
- **Trend Analysis**: Historical performance comparison
- **Performance Alerts**: Slow operations and threshold violations
- **Detailed Metrics**: Page load times, navigation times, critical operations

## 🎯 Best Practices

1. **Bookmark the live report URL** for quick access
2. **Check GitHub Actions summary first** for quick overview
3. **Download artifacts** for offline analysis or sharing
4. **Use mobile** to quickly check test status on the go
5. **Share live report URL** with team members for collaboration

## 🔗 Example URLs

Replace `YOUR_USERNAME` and `YOUR_REPO_NAME` with your actual values:

- **Live Report**: `https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/playwright-report/`
- **Workflow Runs**: `https://github.com/YOUR_USERNAME/YOUR_REPO_NAME/actions`
- **Latest Run**: `https://github.com/YOUR_USERNAME/YOUR_REPO_NAME/actions/workflows/playwright.yml`

---

💡 **Tip**: The live report link is also shown in every GitHub Actions summary for easy access!
