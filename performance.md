# Performance Test Report

## Test Run Summary
- Total Duration: 419283ms
- Tests Passed: undefined
- Tests Failed: undefined
- Total Tests: undefined

## Page Load Times

## Navigation Times
- basic: 11625.00ms average
- global: 14346.00ms average
- main: 133476.67ms average
- utility: 25241.67ms average

## Critical Operations

## Performance Alerts
- [Timeout Alerts] should verify alert inbox structure and filters exceeded timeout of 60000ms
- [Timeout Alerts] should verify alert list controls exceeded timeout of 60000ms
- [Timeout Alerts] should test analysis page functionality exceeded timeout of 60000ms
- [Timeout Alerts] should verify alert history section exceeded timeout of 60000ms
- [Timeout Alerts] should monitor reports page performance exceeded timeout of 60000ms
- [Timeout Alerts] should monitor reports page performance exceeded timeout of 60000ms
- [Timeout Alerts] should verify alert history section exceeded timeout of 60000ms
- [Timeout Alerts] should verify action links exceeded timeout of 60000ms
- [Timeout Alerts] should test analysis page functionality exceeded timeout of 60000ms
- [Timeout Alerts] should analyze response times across public pages exceeded timeout of 60000ms
- [Timeout Alerts] should analyze response times across public pages exceeded timeout of 60000ms
- [Timeout Alerts] should analyze response times across public pages exceeded timeout of 60000ms
- [Timeout Alerts] should analyze response times across public pages exceeded timeout of 60000ms
- [Timeout Alerts] should analyze response times across public pages exceeded timeout of 60000ms
- [Timeout Alerts] should analyze response times across public pages exceeded timeout of 60000ms

## Test Failures
- should test reports page functionality: Error: page.goto: NS_ERROR_NET_TIMEOUT
Call log:
[2m  - navigating to "https://monitor.red-gate.com/reports", waiting until "load"[22m

- should monitor reports page performance: Error: page.goto: NS_ERROR_NET_TIMEOUT
Call log:
[2m  - navigating to "https://monitor.red-gate.com/Reports", waiting until "load"[22m

- should verify main navigation structure: Error: [31mTimed out 10000ms waiting for [39m[2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m()[22m

Locator: getByRole('link', { name: 'Alerts' }).first()
Expected: visible
Received: <element(s) not found>
Call log:
[2m  - Expect "toBeVisible" with timeout 10000ms[22m
[2m  - waiting for getByRole('link', { name: 'Alerts' }).first()[22m

- should test alert time range filter: Error: [31mTimed out 10000ms waiting for [39m[2mexpect([22m[31mlocator[39m[2m).[22mtoHaveValue[2m([22m[32mexpected[39m[2m)[22m

Locator: getByRole('combobox', { name: 'Within', exact: true })
Expected string: [32m"1[7m day[27m"[39m
Received string: [31m"1[7m440[27m"[39m
Call log:
[2m  - Expect "toHaveValue" with timeout 10000ms[22m
[2m  - waiting for getByRole('combobox', { name: 'Within', exact: true })[22m
[2m    13 × locator resolved to <select id="relative-minutes" class="relative-time-dropdown">…</select>[22m
[2m       - unexpected value "1440"[22m

- should test alert time range filter: Error: [31mTimed out 10000ms waiting for [39m[2mexpect([22m[31mlocator[39m[2m).[22mtoHaveValue[2m([22m[32mexpected[39m[2m)[22m

Locator: getByRole('combobox', { name: 'Within', exact: true })
Expected string: [32m"1[7m day[27m"[39m
Received string: [31m"1[7m440[27m"[39m
Call log:
[2m  - Expect "toHaveValue" with timeout 10000ms[22m
[2m  - waiting for getByRole('combobox', { name: 'Within', exact: true })[22m
[2m    12 × locator resolved to <select id="relative-minutes" class="relative-time-dropdown">…</select>[22m
[2m       - unexpected value "1440"[22m

- should test alert time range filter: Error: [31mTimed out 10000ms waiting for [39m[2mexpect([22m[31mlocator[39m[2m).[22mtoHaveValue[2m([22m[32mexpected[39m[2m)[22m

Locator: getByRole('combobox', { name: 'Within', exact: true })
Expected string: [32m"1[7m day[27m"[39m
Received string: [31m"1[7m440[27m"[39m
Call log:
[2m  - Expect "toHaveValue" with timeout 10000ms[22m
[2m  - waiting for getByRole('combobox', { name: 'Within', exact: true })[22m
[2m    13 × locator resolved to <select id="relative-minutes" class="relative-time-dropdown">…</select>[22m
[2m       - unexpected value "1440"[22m

- should test alert time range filter: Error: [31mTimed out 10000ms waiting for [39m[2mexpect([22m[31mlocator[39m[2m).[22mtoHaveValue[2m([22m[32mexpected[39m[2m)[22m

Locator: getByRole('combobox', { name: 'Within', exact: true })
Expected string: [32m"1[7m day[27m"[39m
Received string: [31m"1[7m440[27m"[39m
Call log:
[2m  - Expect "toHaveValue" with timeout 10000ms[22m
[2m  - waiting for getByRole('combobox', { name: 'Within', exact: true })[22m
[2m    13 × locator resolved to <select id="relative-minutes" class="relative-time-dropdown">…</select>[22m
[2m       - unexpected value "1440"[22m

- should test alert time range filter: Error: [31mTimed out 10000ms waiting for [39m[2mexpect([22m[31mlocator[39m[2m).[22mtoHaveValue[2m([22m[32mexpected[39m[2m)[22m

Locator: getByRole('combobox', { name: 'Within', exact: true })
Expected string: [32m"1[7m day[27m"[39m
Received string: [31m"1[7m440[27m"[39m
Call log:
[2m  - Expect "toHaveValue" with timeout 10000ms[22m
[2m  - waiting for getByRole('combobox', { name: 'Within', exact: true })[22m
[2m    13 × locator resolved to <select id="relative-minutes" class="relative-time-dropdown">…</select>[22m
[2m       - unexpected value "1440"[22m

- should test alert time range filter: Error: [31mTimed out 10000ms waiting for [39m[2mexpect([22m[31mlocator[39m[2m).[22mtoHaveValue[2m([22m[32mexpected[39m[2m)[22m

Locator: getByRole('combobox', { name: 'Within', exact: true })
Expected string: [32m"1[7m day[27m"[39m
Received string: [31m"1[7m440[27m"[39m
Call log:
[2m  - Expect "toHaveValue" with timeout 10000ms[22m
[2m  - waiting for getByRole('combobox', { name: 'Within', exact: true })[22m
[2m    13 × locator resolved to <select id="relative-minutes" class="relative-time-dropdown">…</select>[22m
[2m       - unexpected value "1440"[22m

