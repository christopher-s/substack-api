<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-12 | Updated: 2026-04-12 -->

# Integration Tests

## Purpose

Integration tests validate the SubstackClient against a local mock HTTP server that serves sample API response files from `samples/api/v1/`. These tests exercise real HTTP request/response flows end-to-end without hitting the live Substack API, verifying that the client correctly constructs requests, handles responses, and wires services together.

No external credentials or network access are required. All tests run offline against the in-process mock server.

## Key Files

| File | Role |
|---|---|
| `setup.ts` | Global setup that creates a local HTTP mock server on a random port. Serves sample data from `samples/api/v1/` and captures requests for assertion. Exposes `global.INTEGRATION_SERVER` with `url`, `server`, and `capturedRequests`. Registered via `beforeAll`/`afterAll`. |
| `client.integration.test.ts` | Tests core client operations: `testConnectivity`, `profileForId`, `profileForSlug`, `ownProfile`, `commentForId`, `postForId`, `noteForId`. Covers happy paths, corner cases (empty/whitespace slugs, non-existent IDs), and infrastructure health checks. |
| `note-publishing.integration.test.ts` | Tests the note publishing workflow via `NoteBuilder`. Publishes a note through the mock server and asserts the captured POST request body matches the expected JSON in `samples/api/v1/comment/feed`. |
| `note-with-link.integration.test.ts` | Tests note-with-link attachment workflow. Verifies two sequential requests (attachment creation to `/comment/attachment/`, then note publishing to `/comment/feed/`) with correct body structure including `attachmentIds`, formatting marks, and bullet lists. |

## For AI Agents

### Working In This Directory

- The mock server is started automatically by `setup.ts` via Jest's `beforeAll` hook. No manual setup is needed.
- The client is configured with `urlPrefix: ''` and pointed at `global.INTEGRATION_SERVER.url` so all requests go to the local mock.
- Sample response files live under `samples/api/v1/` (e.g., `samples/api/v1/user/282291554/profile`, `samples/api/v1/comment/response`). The mock server maps endpoint URLs to these files via `mapUrlToSampleFile()`.
- `global.INTEGRATION_SERVER.capturedRequests` accumulates all requests the mock server receives. Tests clear it in `beforeEach` and assert against it to verify request structure.
- The mock server handles: GET (mapped to sample files), POST `/comment/feed/` (note publishing), POST `/comment/attachment/` (attachment creation), PUT `/user-setting` (connectivity check), and OPTIONS (CORS preflight).

### Testing Requirements

- Run with: `pnpm test:integration`
- Watch mode: `pnpm test:integration:watch`
- No environment variables or API tokens needed.
- Tests must pass alongside `pnpm lint` and `pnpm build` before committing.

### Common Patterns

- **Create a client for testing**: Instantiate `SubstackClient` with `publicationUrl: global.INTEGRATION_SERVER.url`, `token: 'test-key'`, `substackUrl: global.INTEGRATION_SERVER.url`, and `urlPrefix: ''`.
- **Assert request structure**: After an action, check `global.INTEGRATION_SERVER.capturedRequests` array entries for `method`, `url`, and `body`.
- **Clear captured requests**: Call `global.INTEGRATION_SERVER.capturedRequests.length = 0` in `beforeEach` to avoid cross-test pollution.
- **Verify response parsing**: Assert that client methods return correct domain instances (`Profile`, `OwnProfile`, `Comment`, `FullPost`) with expected property values matching the sample data.
- **Note builder tests**: Use `profile.newNote()` or `profile.newNoteWithLink(url)` to construct notes, call `.publish()`, then assert the captured request body matches expected JSON fixtures.

## Dependencies

- `SubstackClient` from `@substack-api/substack-client` -- the class under test
- Domain models: `Profile`, `OwnProfile`, `Comment`, `FullPost`, `PreviewPost` from `@substack-api/domain`
- `samples/api/v1/` directory -- static JSON fixtures served by the mock server
- Node.js `http` module -- used by `setup.ts` to create the mock server
- Jest global setup/teardown (`beforeAll`, `afterAll`, `beforeEach`)
