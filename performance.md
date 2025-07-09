# Performance Report

## Overview

This file contains the performance metrics for the RGM Playwright tests. Metrics are updated after each test run.

## Latest Test Results (July 8, 2025)

### Test Summary

- Total Duration: 6.6 minutes
- Tests Passed: 110
- Tests Failed: 10
- Total Tests: 120

### Page Load Times

- Overview Page: 2,991ms - 13,869ms
- Alerts Page: 2,859ms - 9,641ms
- Analysis Page: 6,123ms - 34,318ms
- Reports Page: 5,766ms - 7,252ms
- Estate Page: 1,494ms - 1,945ms

### Navigation Performance

- Overview Navigation: 3,573ms - 64,902ms
- Alerts Navigation: 4,264ms - 14,440ms
- Analysis Navigation: 6,757ms - 80,896ms
- Reports Navigation: 877ms - 34,073ms
- Estate Navigation: 61,502ms - 61,971ms

### Critical Operations

- Filter Controls: 15,665ms - 23,707ms
- Dashboard Loading: 3,399ms - 17,215ms
- Empty State Tests: 30,830ms - 35,030ms

### Performance Alerts

1. High Navigation Times:
   - Estate page navigation consistently above 60s threshold
   - Analysis page navigation spikes up to 80s
2. Slow Page Loads:
   - Analysis page loads taking up to 34s
   - Reports page occasionally exceeding 7s
3. UI Operation Delays:
   - Filter controls consistently above 15s
   - Empty state tests averaging above 30s

### Failed Tests Analysis

- Alert time range filter tests failed across all browsers (missing "7 days" option)
- Performance monitoring timeouts on page load tests (60s limit exceeded)

## Historical Data

This is the first test run after implementing the new minimal performance reporting structure. Historical data will be accumulated in subsequent runs.

## How to Read This Report

1. All times are in milliseconds (ms)
2. Ranges show minimum - maximum observed times
3. Performance alerts highlight areas exceeding thresholds:
   - Page Load: > 2000ms
   - Navigation: > 3000ms
   - Operations: > 3000ms
4. Test failures are highlighted with their root cause

---

*Note: This consolidated report replaces the previous multi-folder reporting structure for better readability and reduced disk usage.*
