#!/bin/bash

# Validation script for the unified Playwright workflow
# This script checks if all necessary components are properly configured

echo "🔍 VALIDATING UNIFIED PLAYWRIGHT WORKFLOW"
echo "========================================"
echo ""

# Check workflow file
WORKFLOW_FILE=".github/workflows/playwright.yml"
if [ -f "$WORKFLOW_FILE" ]; then
    echo "✅ Workflow file exists: $WORKFLOW_FILE"
    
    # Check for all required triggers
    echo "🔍 Checking workflow triggers:"
    if grep -q "push:" "$WORKFLOW_FILE"; then
        echo "  ✅ Push trigger configured"
    else
        echo "  ❌ Push trigger missing"
    fi
    
    if grep -q "pull_request:" "$WORKFLOW_FILE"; then
        echo "  ✅ Pull request trigger configured"
    else
        echo "  ❌ Pull request trigger missing"
    fi
    
    if grep -q "schedule:" "$WORKFLOW_FILE"; then
        echo "  ✅ Schedule trigger configured"
    else
        echo "  ❌ Schedule trigger missing"
    fi
    
    if grep -q "workflow_dispatch:" "$WORKFLOW_FILE"; then
        echo "  ✅ Manual trigger configured"
    else
        echo "  ❌ Manual trigger missing"
    fi
    
    # Check for key steps
    echo "🔍 Checking workflow steps:"
    if grep -q "Generate GitHub Actions Summary" "$WORKFLOW_FILE"; then
        echo "  ✅ GitHub Actions Summary step configured"
    else
        echo "  ❌ GitHub Actions Summary step missing"
    fi
    
    if grep -q "Display comprehensive reports" "$WORKFLOW_FILE"; then
        echo "  ✅ Comprehensive reports step configured"
    else
        echo "  ❌ Comprehensive reports step missing"
    fi
    
    if grep -q "upload-artifact" "$WORKFLOW_FILE"; then
        echo "  ✅ Artifact upload steps configured"
    else
        echo "  ❌ Artifact upload steps missing"
    fi
    
else
    echo "❌ Workflow file not found: $WORKFLOW_FILE"
fi

echo ""

# Check for nightly workflow (should not exist)
NIGHTLY_FILE=".github/workflows/nightly-tests.yml"
if [ -f "$NIGHTLY_FILE" ]; then
    echo "⚠️ Warning: Old nightly workflow still exists: $NIGHTLY_FILE"
    echo "   Consider removing it to avoid redundancy"
else
    echo "✅ No redundant nightly workflow file found"
fi

echo ""

# Check package.json for test script
if [ -f "package.json" ]; then
    echo "✅ package.json exists"
    if grep -q '"test"' package.json; then
        echo "  ✅ Test script configured in package.json"
    else
        echo "  ❌ Test script missing in package.json"
    fi
else
    echo "❌ package.json not found"
fi

echo ""

# Check Playwright config
if [ -f "playwright.config.js" ]; then
    echo "✅ Playwright configuration exists"
else
    echo "❌ Playwright configuration not found"
fi

echo ""

# Check for test directories
if [ -d "tests" ]; then
    TEST_COUNT=$(find tests -name "*.spec.js" -o -name "*.spec.ts" | wc -l)
    echo "✅ Tests directory exists with $TEST_COUNT test files"
else
    echo "❌ Tests directory not found"
fi

echo ""

# Check for utils directory
if [ -d "utils" ]; then
    echo "✅ Utils directory exists"
else
    echo "❌ Utils directory not found"
fi

echo ""

# Check existing reports
echo "📊 CHECKING EXISTING REPORTS:"
echo "============================"

if [ -f "performance.md" ]; then
    echo "✅ Performance report exists ($(ls -lh performance.md | awk '{print $5}'))"
else
    echo "❌ Performance report not found"
fi

if [ -d "performance-reports" ]; then
    TREND_FILES=$(ls performance-reports/trend-* 2>/dev/null | wc -l)
    ALERT_FILES=$(ls performance-reports/performance-alerts-* 2>/dev/null | wc -l)
    echo "✅ Performance reports directory exists"
    echo "  📈 Trend files: $TREND_FILES"
    echo "  ⚠️ Alert files: $ALERT_FILES"
else
    echo "❌ Performance reports directory not found"
fi

if [ -d "test-reports" ]; then
    echo "✅ Test reports directory exists"
else
    echo "❌ Test reports directory not found"
fi

echo ""

# Validate JSON files if they exist
echo "🔍 VALIDATING JSON FILES:"
echo "========================="

if [ -f "test-reports/test-results.json" ]; then
    if jq empty test-reports/test-results.json 2>/dev/null; then
        echo "✅ test-results.json is valid JSON"
    else
        echo "❌ test-results.json is invalid JSON"
    fi
else
    echo "ℹ️ test-results.json not found (normal if tests haven't run yet)"
fi

if [ -f "performance-reports/trends.json" ]; then
    if jq empty performance-reports/trends.json 2>/dev/null; then
        echo "✅ trends.json is valid JSON"
    else
        echo "❌ trends.json is invalid JSON"
    fi
else
    echo "ℹ️ trends.json not found (normal if tests haven't run yet)"
fi

if [ -f "test-reports/badge.json" ]; then
    if jq empty test-reports/badge.json 2>/dev/null; then
        echo "✅ badge.json is valid JSON"
    else
        echo "❌ badge.json is invalid JSON"
    fi
else
    echo "ℹ️ badge.json not found (normal if tests haven't run yet)"
fi

echo ""

# Summary
echo "📋 VALIDATION SUMMARY:"
echo "====================="
echo "✅ = Good"
echo "❌ = Issue needs attention"
echo "⚠️ = Warning"
echo "ℹ️ = Information"
echo ""
echo "🔗 To trigger the workflow:"
echo "  • Push to main/master branch"
echo "  • Create a pull request"
echo "  • Go to Actions tab and run manually"
echo "  • Wait for scheduled nightly run"
echo ""
echo "📊 After workflow runs, check:"
echo "  • GitHub Actions Summary for embedded reports"
echo "  • Workflow logs for comprehensive output"
echo "  • Artifacts for downloadable files"
echo ""
echo "========================================"
echo "🎭 VALIDATION COMPLETE"
echo "========================================"
