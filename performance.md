# Performance Test Report

## Test Run Summary
- Total Duration: 4045ms
- Tests Passed: undefined
- Tests Failed: undefined
- Total Tests: undefined

## Page Load Times

## Navigation Times
- basic: 3130.50ms average

## Critical Operations

## Test Failures
- should verify basic navigation structure: Error: expect.toBeVisible: Error: strict mode violation: getByRole('link', { name: 'Configuration' }) resolved to 2 elements:
    1) <a title="Configuration" href="/Configuration" class="flex px-[2px] text-white hover:text-white h-full cursor-pointer [&_span]:hover:border-b-red-5 [&_span]:border-y-5 rounded-none m-0 border-solid bg-transparent hover:bg-transparent">…</a> aka getByRole('link', { name: 'Configuration', exact: true })
    2) <a class="text-blue-3 hover:text-blue-3 hover:underline" href="https://monitor.red-gate.com/Alerts/Inbox?v=1&fullAlertType=74%3A0&cir=&timeWindowMode=LastUpdatedIn&resetFilter=true&duration=1440">Configuration change</a> aka getByRole('link', { name: 'Configuration change' })

Call log:
[2m  - Expect "toBeVisible" with timeout 10000ms[22m
[2m  - waiting for getByRole('link', { name: 'Configuration' })[22m

