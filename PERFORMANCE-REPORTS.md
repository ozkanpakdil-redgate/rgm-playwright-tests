# Performance Reports Guide

This project generates multiple types of performance reports that can be accessed in different ways during GitHub Actions runs.

## 📊 Available Report Types

### 1. **Performance Markdown Report** (`performance.md`)
- **Location**: Root of repository 
- **Updated**: After every test run
- **Access**: 
  - Committed to repository automatically
  - Available in GitHub UI
  - Downloaded as artifact

### 2. **GitHub Actions Summary**
- **Location**: GitHub Actions run summary page
- **Content**: 
  - Test metrics overview
  - Success rates
  - Performance alerts
  - Links to detailed reports
- **Access**: Visit any workflow run page

### 3. **HTML Performance Report**
- **Location**: `test-reports/performance-report.html`
- **Features**:
  - Interactive charts and graphs
  - Detailed metrics breakdown
  - Visual performance indicators
  - Mobile-friendly design
- **Access**: Download from artifacts

### 4. **Performance Trends Report**
- **Location**: `performance-reports/trend-report.md`
- **Content**:
  - Historical performance data
  - Trend analysis
  - Performance regression detection
- **Access**: 
  - Committed to repository
  - Available in artifacts

### 5. **Test Badge**
- **Location**: `test-reports/badge.json`
- **Use**: Dynamic status badges for README
- **Access**: Download from artifacts

## 🔍 How to Access Reports

### During GitHub Actions Run

1. **View Run Summary**:
   - Go to Actions tab
   - Click on any workflow run
   - Scroll down to see detailed performance summary

2. **Download Artifacts**:
   - In the workflow run page
   - Scroll to "Artifacts" section
   - Download:
     - `performance-reports` - All reports bundle
     - `html-performance-report` - Interactive HTML report
     - `performance-trends` - Historical trend data
     - `test-results` - Raw test results

### In Pull Requests

- Automatic comment with performance summary
- Links to detailed reports in the workflow run

### Repository Access

- `performance.md` - Always up-to-date in main branch
- `performance-reports/trend-report.md` - Historical trends
- `performance-reports/trends.json` - Raw trend data

## 📈 Setting Up GitHub Pages (Optional)

To deploy HTML reports to GitHub Pages:

1. Uncomment the GitHub Pages deployment steps in `.github/workflows/playwright.yml`
2. Enable GitHub Pages in repository settings
3. HTML reports will be available at: `https://[username].github.io/[repository]/performance-report.html`

## 🚀 GitHub Actions Outputs

The workflow sets these outputs for use in other jobs:

```yaml
steps:
  - name: Run tests
    id: playwright-tests
    # ... test steps ...
    
  - name: Use test results
    run: |
      echo "Tests passed: ${{ steps.playwright-tests.outputs.tests-passed }}"
      echo "Tests failed: ${{ steps.playwright-tests.outputs.tests-failed }}"
      echo "Success rate: ${{ steps.playwright-tests.outputs.success-rate }}%"
```

Available outputs:
- `tests-passed` - Number of passed tests
- `tests-failed` - Number of failed tests  
- `tests-total` - Total number of tests
- `duration` - Total test duration in ms
- `success-rate` - Success percentage

## 📊 Badge Integration

Use the generated badge in your README:

```markdown
![Test Status](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/[username]/[repo]/main/test-reports/badge.json)
```

## 🔧 Customization

### Report Retention
- Test results: 30 days
- Performance trends: 90 days  
- Screenshots: 7 days

### Modify Reports
- Edit `utils/github-summary-reporter.js` for Actions summary
- Edit `utils/html-reporter.js` for HTML report styling
- Edit `utils/performance-trend-reporter.js` for trend analysis

---

*Reports are automatically generated and updated on every test run. No manual intervention required!*
