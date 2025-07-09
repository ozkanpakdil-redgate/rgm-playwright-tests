# RGM Playwright Tests

This repository contains automated end-to-end tests for the RGM application using [Playwright](https://playwright.dev/).

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

## Project Structure

- `tests/` - Contains all Playwright test files.
- `playwright.config.ts` - Playwright configuration.

## Contributing

Feel free to open issues or submit pull requests to improve the test suite.

## License

See [LICENSE](LICENSE) for details.