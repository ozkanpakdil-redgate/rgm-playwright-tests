# Performance Test Report

## Test Run Summary
- Total Duration: 16056ms
- Tests Passed: undefined
- Tests Failed: undefined
- Total Tests: undefined

## Page Load Times

## Navigation Times

## Critical Operations

## Test Failures
- should test alert time range filter: Error: [31mTimed out 10000ms waiting for [39m[2mexpect([22m[31mlocator[39m[2m).[22mtoHaveValue[2m([22m[32mexpected[39m[2m)[22m

Locator: getByRole('combobox', { name: 'Within', exact: true })
Expected string: [32m"1[7m day[27m"[39m
Received string: [31m"1[7m440[27m"[39m
Call log:
[2m  - Expect "toHaveValue" with timeout 10000ms[22m
[2m  - waiting for getByRole('combobox', { name: 'Within', exact: true })[22m
[2m    14 × locator resolved to <select id="relative-minutes" class="relative-time-dropdown">…</select>[22m
[2m       - unexpected value "1440"[22m

- should test alert time range filter: Error: [31mTimed out 10000ms waiting for [39m[2mexpect([22m[31mlocator[39m[2m).[22mtoHaveText[2m([22m[32mexpected[39m[2m)[22m

Locator: getByRole('combobox', { name: 'Within', exact: true })
Expected string: [32m"1 day"[39m
Received string: [31m"All time15 minutes1 hour3 hours6 hours12 hours1 day3 days1 week2 weeks1 month3 months6 months1 year"[39m
Call log:
[2m  - Expect "toHaveText" with timeout 10000ms[22m
[2m  - waiting for getByRole('combobox', { name: 'Within', exact: true })[22m
[2m    14 × locator resolved to <select id="relative-minutes" class="relative-time-dropdown">…</select>[22m
[2m       - unexpected value "All time15 minutes1 hour3 hours6 hours12 hours1 day3 days1 week2 weeks1 month3 months6 months1 year"[22m

- should test alert time range filter: Error: [2mexpect([22m[31mgetByRole('combobox', { name: 'Within', exact: true })[39m[2m).[22mtoHaveValue[2m([22m[32m1440[39m[2m)[22m

Locator: getByRole('combobox', { name: 'Within', exact: true })


[1mMatcher error[22m: [32mexpected[39m value must be a string or regular expression

Expected has type:  number
Expected has value: [32m1440[39m
