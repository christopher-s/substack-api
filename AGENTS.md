<!-- Generated: 2026-04-28 | Updated: 2026-04-28 -->

# substack-api

## Purpose
TypeScript client library for the Substack API. Provides a service-oriented architecture with entity-based APIs, async iterators for pagination, builder patterns for note creation, and runtime validation via fp-ts and io-ts.

## Key Files
| File | Description |
|------|-------------|
| `package.json` | Package manifest, scripts, dependencies |
| `tsconfig.json` | TypeScript compiler configuration |
| `rollup.config.mjs` | Rollup bundler config (CJS + ESM + d.ts) |
| `jest.config.js` | Unit test configuration |
| `jest.integration.config.js` | Integration test configuration |
| `jest.e2e.config.js` | End-to-end test configuration |
| `eslint.config.mjs` | ESLint configuration |
| `stryker.config.json` | Stryker mutation testing configuration |
| `src/index.ts` | Public API exports |
| `src/substack-client.ts` | Main `SubstackClient` class |
| `README.md` | User-facing documentation |
| `CLAUDE.md` | Project-specific Claude Code instructions |
| `CHANGELOG.md` | Version history |
| `CONTRIBUTING.md` | Contribution guidelines |
| `CODE_OF_CONDUCT.md` | Community standards |
| `LICENSE` | MIT license |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `src/` | Source code: domain models, internal services, HTTP client (see `src/AGENTS.md`) |
| `tests/` | Unit, integration, and E2E tests (see `tests/AGENTS.md`) |
| `docs/` | Generated documentation and guides |
| `samples/` | Example usage code |
| `scripts/` | Development utility scripts (see `scripts/AGENTS.md`) |
| `reports/` | Generated build and test reports (see `reports/AGENTS.md`) |
| `.github/` | GitHub Actions workflows and issue templates |
| `.devcontainer/` | VS Code devcontainer config (see `.devcontainer/AGENTS.md`) |
| `.code-review-graph/` | Code knowledge graph database (see `.code-review-graph/AGENTS.md`) |

## For AI Agents

### Working In This Directory
- Run `pnpm lint`, `pnpm build`, and `pnpm test` before committing.
- Use Conventional Commits for all commit messages.
- The project uses pnpm workspaces (`pnpm-workspace.yaml`).
- Build outputs go to `dist/` (CJS, ESM, and type declarations).

### Testing Requirements
- `pnpm test:unit` — Jest unit tests with mocked HTTP.
- `pnpm test:integration` — Integration tests against real API.
- `pnpm test:e2e` — Full workflow tests requiring credentials.
- `pnpm test:mutation` — Stryker mutation testing.
- Coverage thresholds: 80% branches, functions, lines, statements.

### Common Patterns
- **Entity methods**: Domain objects expose methods like `post.comments()` and `profile.posts()`.
- **Async iterators**: Pagination is consumed with `for await (...)`.
- **Builder pattern**: `NoteBuilder` constructs formatted notes.
- **fp-ts/io-ts**: Functional error handling and runtime type validation.

## Dependencies

### Internal
- `src/` — Domain models, services, HTTP client, caching, validation.

### External
| Package | Purpose |
|---------|---------|
| `axios` | HTTP client |
| `axios-rate-limit` | Request throttling |
| `fp-ts` | Functional programming utilities |
| `io-ts` | Runtime type validation |
| `rollup` | Bundler |
| `@rollup/plugin-typescript` | Rollup TypeScript support |
| `rollup-plugin-dts` | Rollup `.d.ts` generation |
| `jest` / `ts-jest` | Testing framework |
| `eslint` / `prettier` | Linting and formatting |
| `@stryker-mutator/core` | Mutation testing |
| `fast-check` | Property-based testing |
| `nock` | HTTP mocking for tests |
| `dotenv` | Environment variable loading |

<!-- MANUAL: -->
