<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-12 -->
<!-- Updated: 2026-04-12 -->

# tests/

Test suite for the Substack API client library, organized into three tiers with increasing scope and external dependency requirements.

## Purpose

Validates the Substack API client across three levels of isolation: unit tests with mocked HTTP responses, integration tests with real HTTP calls against test data, and end-to-end workflow tests requiring live API credentials.

## Key Files

| File | Description |
|------|-------------|
| `unit/*.test.ts` | 22 unit test files covering services, domain entities, builders, validation, and the main client |
| `integration/setup.ts` | Shared setup for integration tests |
| `integration/*.integration.test.ts` | 3 integration test files for client, note publishing, and note-with-link workflows |
| `e2e/setup.ts` | Shared setup for e2e tests |
| `e2e/checkEnv.ts` | Environment variable validation for e2e runs |
| `e2e/entity-model.e2e.test.ts` | Full workflow entity model test |
| `e2e/tsconfig.json` | Separate TypeScript config for e2e tests |
| `e2e/global.d.ts` | Type declarations for e2e test environment |

## Subdirectories

### `unit/`

Unit tests that mock HTTP responses and test business logic in isolation. No network calls, no credentials required. Coverage thresholds enforced at 80% for branches, functions, lines, and statements.

**Test files:** `comment-service`, `connectivity-service`, `entities`, `following-service`, `http-client`, `io-ts-validation`, `note-builder-coverage`, `note-builder-immutability`, `note-builder`, `note-service`, `note-with-link-builder`, `note`, `own-profile-note-with-link`, `own-profile`, `post-builder`, `post-global-endpoint`, `post-service`, `post`, `profile-service`, `profile`, `public-api-exports`, `substack-client`

**Config:** `jest.config.js` (root) -- matches `**/unit/**/*.test.ts`, collects coverage, 10s default timeout.

### `integration/`

Integration tests that make real HTTP calls using a local test server or test data. Requires a Substack API token. No coverage collection.

**Test files:** `client`, `note-publishing`, `note-with-link`

**Config:** `jest.integration.config.js` -- matches `**/*.integration.test.ts`, 10s timeout, setup file at `tests/integration/setup.ts`.

### `e2e/`

End-to-end workflow tests that exercise the full client against the live Substack API. Requires the `SUBSTACK_API_TOKEN` environment variable. No coverage collection.

**Test files:** `entity-model.e2e.test`

**Config:** `jest.e2e.config.js` -- matches `**/*.e2e.test.ts`, 30s timeout for API calls, uses its own `tsconfig.json`, setup file at `tests/e2e/setup.ts`.

## For AI Agents

### Working In This Directory

- Run `pnpm test:unit` for unit tests only (fast, no external dependencies).
- Run `pnpm test:integration` for integration tests (requires API token).
- Run `pnpm test:e2e` for end-to-end tests (requires `SUBSTACK_API_TOKEN` env var).
- Run `pnpm test` to run all three tiers sequentially.
- Use `pnpm test:watch` or `pnpm test:integration:watch` or `pnpm test:e2e:watch` for watch mode during development.
- Unit test file naming: `<subject>.test.ts` in `tests/unit/`.
- Integration test file naming: `<subject>.integration.test.ts` in `tests/integration/`.
- E2E test file naming: `<subject>.e2e.test.ts` in `tests/e2e/`.

### Testing Requirements

- All tests must pass before committing: `pnpm lint`, `pnpm build`, `pnpm test`.
- Unit tests have an 80% coverage threshold across branches, functions, lines, and statements.
- New source files in `src/` must have corresponding unit tests to meet coverage requirements.
- Integration and e2e tests do not collect coverage and have extended timeouts (10s and 30s respectively).

### Common Patterns

- **Path aliases:** `@substack-api/*` maps to `src/*`; `@test/*` maps to `tests/*`.
- **Test framework:** Jest with ts-jest, ESM mode.
- **Unit test mocking:** Mock HTTP responses to test services and domain logic in isolation.
- **Entity tests:** Domain objects (`Post`, `Note`, `Profile`, `Comment`) tested with mocked service layer.
- **Builder tests:** `NoteBuilder`, `PostBuilder`, `NoteWithLinkBuilder` tested for construction and immutability.
- **Jest reporters:** `jest-junit` configured for CI output (`junit.xml`, `junit-integration.xml`, `junit-e2e.xml`).

## Dependencies

- **Jest** -- test runner with ts-jest preset
- **ts-jest** -- TypeScript compilation for Jest
- **jest-junit** -- JUnit XML reporter for CI
- **fp-ts / io-ts** -- used in source code under test for validation
- **TypeScript** -- `tsconfig.test.json` for unit/integration, `tests/e2e/tsconfig.json` for e2e
