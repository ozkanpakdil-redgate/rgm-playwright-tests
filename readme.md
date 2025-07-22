# RGM Playwright Tests

[Playwright Dashboard](https://ozkanpakdil-redgate.github.io/rgm-playwright-tests/)

## 🚀 Unified Test Workflow

This repository now uses a **single, comprehensive GitHub Actions workflow** that handles all testing scenarios and performance reporting.

## Purpose

The goal of this repo is to ensure the reliability and quality of the RGM application by providing a suite of automated browser tests. These tests help catch regressions and verify that key user flows work as expected.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v16 or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Installation

```bash
git clone https://github.com/your-org/rgm-playwright-tests.git
cd rgm-playwright-tests
npm install
```

### Running Tests

To run all tests:

```bash
npm test
```

To run a specific test file:

```bash
npx playwright test path/to/test.spec.ts
```

### Viewing Test Results

After running tests, view the HTML report:

```bash
npx playwright show-report
```

## 🎭 GitHub Actions Workflow

### Triggers

- **Push**: Runs on pushes to `main` or `master` branches
- **Pull Request**: Runs on PRs to `main` or `master` branches
- **Scheduled**: Daily at midnight UTC (00:00)
- **Manual**: Can be triggered manually via workflow dispatch

### Features

- ✅ Multi-browser test execution (Chrome, Firefox, Safari, Mobile)
- 📈 Performance metrics collection and analysis
- 🎯 GitHub Actions summary with detailed results
- 📄 Multiple report formats (Markdown, HTML, JSON)
- 📊 Historical trend analysis and regression detection
- 🏷️ Dynamic status badges
- 💬 Automated PR comments with test results
- 📦 Comprehensive artifact uploads
- 🔄 Automatic report commits to repository

### Generated Artifacts

Each workflow run produces:

- **test-results** (30 days) - Raw test outputs and JSON results
- **performance-reports** (30 days) - Complete performance bundle
- **html-performance-report** (30 days) - Interactive HTML dashboard
- **performance-trends** (90 days) - Historical trend data
- **screenshots** (7 days) - Failure screenshots

### Performance Monitoring

- Real-time performance metrics tracking
- Page load time analysis
- Navigation performance monitoring
- Automated performance regression detection
- Historical trend visualization

### Reports Access

- **In Repository**: `performance.md` (always current)
- **In Actions**: Detailed summary in each workflow run
- **As Artifacts**: Download comprehensive reports
- **In PRs**: Automatic performance comments

## Project Structure

- `tests/` - Contains all Playwright test files.
- `playwright.config.ts` - Playwright configuration.

