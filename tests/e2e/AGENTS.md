<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-12 | Updated: 2026-04-12 -->

# End-to-End (E2E) Tests

## Purpose

E2E tests validate the SubstackClient against the live Substack API. These tests exercise complete real-world workflows including authentication, profile retrieval, post iteration, comment fetching, and note pagination. They require valid API credentials and make actual network requests to Substack servers.

E2E tests catch integration issues that unit and integration tests cannot, such as API contract changes, authentication failures, and pagination edge cases.

## Key Files

| File | Role |
|---|---|
| `setup.ts` | Global setup that loads `.env` via dotenv, reads `SUBSTACK_API_KEY`/`E2E_API_KEY` and `SUBSTACK_HOSTNAME`/`E2E_HOSTNAME`, and populates `global.E2E_CONFIG` with credential status. Also exposes `global.getTestCredentials()` helper. |
| `checkEnv.ts` | Exports `validateE2ECredentials()` which throws a descriptive error if `SUBSTACK_API_KEY` or `SUBSTACK_HOSTNAME` are missing. Tests call this in `beforeAll` to gate execution on credential availability. |
| `entity-model.e2e.test.ts` | Full workflow tests: connectivity check, profile lookup by slug (`platformer`, `jakubslys`), own profile retrieval, following iteration, post iteration with `PreviewPost`, comment iteration, error handling for invalid IDs, and cursor-based pagination of notes (fetching up to 99 notes). |
| `README.md` | Human-facing documentation covering prerequisites, environment setup, available commands, test behavior with and without credentials, CI/CD integration, and guidelines for adding new tests. |

## For AI Agents

### Working In This Directory

- Tests require two environment variables: `SUBSTACK_API_KEY` (required) and `SUBSTACK_HOSTNAME` (required). Alternative names `E2E_API_KEY` and `E2E_HOSTNAME` are also accepted.
- Credentials are loaded via `dotenv` from a `.env` file in the project root (copy from `.env.example`).
- `setup.ts` runs first and populates `global.E2E_CONFIG`. Individual tests call `validateE2ECredentials()` from `checkEnv.ts` in their `beforeAll` to fail fast with a clear message if credentials are absent.
- Tests use real Substack slugs (`jakubslys`, `platformer`) and real post/comment IDs that exist in the Substack API.
- All tests are designed to be read-only and repeatable -- they do not create or modify content on Substack.

### Testing Requirements

- Run with: `pnpm test:e2e`
- Watch mode: `pnpm test:e2e:watch`
- **Required environment variables**:
  - `SUBSTACK_API_KEY` -- a valid Substack API token
  - `SUBSTACK_HOSTNAME` -- the Substack publication hostname (e.g., `yoursite.substack.com`)
- Without credentials, tests fail immediately with an error message listing the required variables.
- Tests must pass alongside `pnpm lint` and `pnpm build` before committing.

### Common Patterns

- **Create a client for testing**: Call `validateE2ECredentials()` to get `{ token, publicationUrl }`, then instantiate `SubstackClient({ token, publicationUrl })`.
- **Gate on credentials**: Use `validateE2ECredentials()` in `beforeAll` so tests skip cleanly when credentials are missing rather than producing cryptic failures.
- **Iterate with limits**: Use the async iterator pattern with `limit` parameter (e.g., `for await (const profile of ownProfile.following({ limit: 3 }))`) to bound test runtime and API usage.
- **Graceful error handling**: Wrap operations that may fail due to API availability in try/catch, assert the error is an `Error` instance, and log the outcome.
- **Assert domain types**: Verify returned objects are instances of domain classes (`Profile`, `Comment`, `FullPost`) and that their properties match expected types (strings, numbers, `Date` instances).
- **Test known data**: Use well-known slugs and IDs (e.g., slug `jakubslys` has ID `254824415`) to write deterministic assertions against real API data.

## Dependencies

- `SubstackClient` from `@substack-api/substack-client` -- the class under test
- Domain models: `Profile`, `OwnProfile`, `Comment`, `FullPost`, `PreviewPost` from `@substack-api/domain`
- `checkEnv.ts` -- credential validation utility (local to this directory)
- `setup.ts` -- global environment configuration via dotenv (local to this directory)
- `.env` file in project root -- stores `SUBSTACK_API_KEY` and `SUBSTACK_HOSTNAME`
- Live Substack API endpoints -- tests make real HTTP requests
- Jest global setup/teardown (`beforeAll`)
