#!/bin/bash
# Test script to verify the duration conversion logic

DURATION="453087.59"
echo "Original duration: $DURATION"

# Remove decimal part
DURATION_SEC=${DURATION%.*}
echo "Duration without decimal: $DURATION_SEC"

# Convert to seconds
DURATION_SEC=$((DURATION_SEC / 1000))
echo "Duration in seconds: $DURATION_SEC"

# Test success rate calculation
PASSED=107
TOTAL=120
SUCCESS_RATE=$((PASSED * 100 / TOTAL))
echo "Success rate: $SUCCESS_RATE%"
