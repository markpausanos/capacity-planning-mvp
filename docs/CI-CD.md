# CI/CD Testing Documentation

This project uses GitHub Actions to run automated tests on every push and pull request. We have two main workflows designed to provide comprehensive testing while optimizing for speed and resource usage.

## Workflows Overview

### 1. Full Test Suite (`test.yml`)

**Triggers:**

- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches

**Jobs:**

- **Lint & Type Check**: ESLint and TypeScript compilation
- **Unit Tests**: Vitest tests with coverage reporting
- **E2E & Smoke Tests**: Full Playwright test suite with Supabase
- **Test Summary**: Aggregates results from all jobs

**Features:**

- Playwright browser caching for faster runs
- Coverage reporting via Codecov
- Test artifacts uploaded on failure
- Comprehensive error reporting

### 2. PR Tests (`pr-tests.yml`)

**Triggers:**

- Pull requests to `main` or `develop` branches

**Jobs:**

- **Quick Checks**: Lint, type check, and unit tests
- **Critical Path Test**: Smoke tests only (skipped for draft PRs)

**Features:**

- Faster feedback for pull requests
- Skips heavy e2e tests for draft PRs
- Focuses on critical user journey validation

## Test Types

### Unit Tests

- **Framework**: Vitest with jsdom
- **Coverage**: Enabled with lcov reporting
- **Setup**: Mock Next.js router and other dependencies
- **Command**: `npm run test`

### E2E Tests

- **Framework**: Playwright
- **Browser**: Chromium (headless in CI)
- **Environment**: Local Supabase instance
- **Command**: `npm run test:e2e`

### Smoke Tests

- **Purpose**: Critical user journey validation
- **Flow**: Login → Dashboard → Create Allocation
- **Database**: Fresh Supabase reset before each run
- **Command**: `npm run test:smoke`

## Environment Setup

### Supabase Configuration

The workflows automatically set up a local Supabase instance with:

- **URL**: `http://127.0.0.1:54321`
- **Anon Key**: Standard local development key
- **Database**: Reset before smoke tests

### Node.js Configuration

- **Version**: 18.x
- **Package Manager**: npm with `npm ci` for deterministic installs
- **Caching**: Enabled for `node_modules`

## Artifacts and Reports

### Test Reports

- **Playwright Reports**: Uploaded on test failures
- **Coverage Reports**: Sent to Codecov
- **Test Results**: Raw Playwright output

### Retention Policies

- **Playwright Reports**: 30 days
- **Test Results**: 7 days
- **Coverage**: Persistent via Codecov

## Performance Optimizations

### Caching Strategy

- **Node modules**: Cached based on `package-lock.json`
- **Playwright browsers**: Cached based on Playwright version
- **Dependency installation**: Only when cache misses

### Resource Management

- **Parallel Execution**: Unit tests run separately from e2e tests
- **Browser Optimization**: Only installs Chromium in CI
- **Supabase**: Uses local instance to avoid external dependencies

## Debugging Test Failures

### Accessing Reports

1. Go to the failed workflow run
2. Scroll to "Artifacts" section
3. Download the relevant report:
   - `playwright-report-{run-id}` for detailed test results
   - `test-results-{run-id}` for raw output

### Common Issues

#### Supabase Connection

```bash
# If Supabase fails to start, check Docker availability
supabase status
```

#### Playwright Browser Issues

```bash
# Reinstall browsers if tests fail to launch
npx playwright install --with-deps chromium
```

#### Environment Variables

Ensure these are set in CI:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_APP_URL`

## Local Development

### Running Tests Locally

```bash
# Unit tests
npm run test

# Unit tests with coverage
npm run test -- --coverage

# E2E tests (requires running Next.js dev server)
npm run test:e2e

# Smoke tests (includes Supabase reset)
npm run test:smoke

# Interactive test UI
npm run test:e2e:ui
```

### Prerequisites

- Docker (for Supabase)
- Node.js 18+
- Supabase CLI

### Setup Commands

```bash
# Start local Supabase
npm run supabase:start

# Reset database
npm run supabase:reset

# Stop Supabase
npm run supabase:stop
```

## Contributing

### Adding New Tests

#### Unit Tests

1. Create test files in `tests/unit/`
2. Follow naming convention: `*.test.ts`
3. Use Vitest and Testing Library
4. Mock external dependencies

#### E2E Tests

1. Add test files in `tests/e2e/`
2. Use descriptive test names
3. Follow Page Object Model pattern
4. Include proper cleanup

### Modifying Workflows

#### Before Changes

- Test locally with `act` (GitHub Actions local runner)
- Consider impact on CI minutes
- Ensure backwards compatibility

#### After Changes

- Monitor first few runs carefully
- Check artifact uploads work correctly
- Verify caching is effective

## Security Considerations

### Secrets Management

- No secrets required for current setup
- Supabase uses local instance with default keys
- Consider adding production environment tests later

### Permissions

- Workflows have minimal permissions
- Only read access to repository
- Artifact upload permissions as needed
