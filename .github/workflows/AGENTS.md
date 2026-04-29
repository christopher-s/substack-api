<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-28 | Updated: 2026-04-28 -->

# workflows

## Purpose
GitHub Actions CI/CD workflows that automate testing, linting, documentation deployment, release publishing, dependency management, and live API validation for the Substack API client library.

## Key Files
| File | Description |
|------|-------------|
| `test.yaml` | Build and test runner: unit, integration, e2e, and lint jobs on push/PR/schedule |
| `release.yaml` | Semantic release automation triggered manually via workflow_dispatch |
| `docs.yml` | Builds and deploys OpenAPI documentation to GitHub Pages on docs path changes |
| `lintpr.yaml` | Validates pull request titles against Conventional Commits specification |
| `live-api-validation.yml` | Scheduled daily live API validation tests against real Substack endpoints |
| `dependabot.yml` | Auto-approves and auto-merges Dependabot pull requests |

## Subdirectories
No subdirectories.

## For AI Agents

### Working In This Directory
- All workflows use `ubuntu-latest` runners and Node 20 with pnpm 10.
- Prefer `actions/checkout@v6`, `actions/setup-node@v6`, `pnpm/action-setup@v5`, and `actions/upload-artifact@v7` versions already in use.
- `test.yaml` runs on push to `main`, pull requests to `main`, and twice weekly (Mon/Thu at 12:00 UTC).
- `live-api-validation.yml` runs daily at 06:00 UTC and filters tests with `--testPathPattern=live-api-validation`.
- `release.yaml` requires `GH_ACCESS_TOKEN`, `NPM_TOKEN`, `SUBSTACK_API_KEY`, and `SUBSTACK_HOSTNAME` secrets.
- E2E tests in `test.yaml` are skipped when `SUBSTACK_API_KEY` is absent (safe for forks).
- `docs.yml` deploys `docs/site` to GitHub Pages after linting `docs/openapi/openapi.yaml` with Redocly CLI.

### Testing Requirements
- Validate workflow YAML syntax with `actionlint` or the GitHub Actions VS Code extension.
- Test workflow changes in a fork or via `act` (nektos/act) where possible.
- For `test.yaml`, verify the job matrix covers build, unit tests, integration tests, lint/format checks, and conditional E2E tests.
- For `release.yaml`, confirm secrets are configured in repository settings before running.
- For `docs.yml`, ensure `docs/site/index.html` exists and `.redocly.yaml` is present.

### Common Patterns
- Reusable setup steps: checkout -> pnpm setup -> Node setup -> install -> run command
- Artifact uploads use `if: always()` to capture results even on failure
- Secrets are passed via `env:` blocks, never hardcoded
- Scheduled triggers use cron syntax; `workflow_dispatch` enables manual runs
- `permissions` blocks declare minimal required scopes (e.g., `pull-requests: write`)

## Dependencies

### Internal
- `../AGENTS.md` - Parent agent instructions
- `../../CLAUDE.md` - Build commands (`pnpm build`, `pnpm test`, `pnpm lint`, `pnpm format:check`)
- `../../docs/openapi/openapi.yaml` - OpenAPI spec linted and deployed by `docs.yml`
- `../../docs/site/` - Static site deployed to GitHub Pages
- `../../tests/` - Test suites executed by `test.yaml` and `live-api-validation.yml`

### External
| Package / Action | Version | Purpose |
|------------------|---------|---------|
| `actions/checkout` | v6 | Repository checkout |
| `actions/setup-node` | v6 | Node.js environment |
| `pnpm/action-setup` | v5 | pnpm package manager |
| `actions/upload-artifact` | v7 | Test result artifacts |
| `actions/upload-pages-artifact` | v5 | Pages deployment artifact |
| `actions/configure-pages` | v6 | GitHub Pages setup |
| `actions/deploy-pages` | v5 | GitHub Pages deployment |
| `codecov/codecov-action` | v6 | Coverage upload |
| `amannn/action-semantic-pull-request` | v5 | PR title linting |
| `marocchino/sticky-pull-request-comment` | v2 | PR comment management |
| `cycjimmy/semantic-release-action` | v6 | Automated releases |
| `dependabot/fetch-metadata` | v2 | Dependabot PR metadata |
| `@redocly/cli` | latest | OpenAPI linting |
| `@semantic-release/changelog` | 6.0.0 | Release changelog |
| `@semantic-release/npm` | latest | NPM publishing |
| `@semantic-release/git` | latest | Git tagging |

<!-- MANUAL: -->
