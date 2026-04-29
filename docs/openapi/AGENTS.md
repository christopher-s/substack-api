<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-28 | Updated: 2026-04-28 -->

# openapi/

## Purpose

OpenAPI 3.1 specification and supporting files for the Substack API. This directory contains the machine-readable API contract, a codec-to-schema reference, and an endpoint inventory used for spec maintenance and validation.

## Key Files

| File | Description |
|------|-------------|
| `openapi.yaml` | The main OpenAPI 3.1 specification describing the Substack HTTP API |
| `codec-shapes.md` | Reference mapping io-ts codecs to OpenAPI schemas |
| `endpoint-inventory.json` | Endpoint inventory for spec maintenance and validation |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| *(none)* | — |

## For AI Agents

### Working In This Directory
- Only modify `openapi.yaml` when updating the API specification
- Keep `endpoint-inventory.json` in sync with `src/internal/services/*.ts` when adding or changing endpoints
- Update `codec-shapes.md` when io-ts codecs in `src/internal/types/` change
- Ensure method signatures in `openapi.yaml` match the source in `src/domain/` and `src/substack-client.ts`
- Do not add narrative documentation here — narrative docs belong in the repository root (`README.md`, `CONTRIBUTING.md`)

### Testing Requirements
- Validate `openapi.yaml` syntax with a YAML linter or OpenAPI validator before committing
- Cross-check `endpoint-inventory.json` against the service files in `src/internal/services/` to ensure completeness
- Verify that schema names referenced in `endpoint-inventory.json` exist in `openapi.yaml` components.schemas

### Common Patterns
- `openapi.yaml` uses `allOf` for schema inheritance (e.g., `FullPost` extends `PreviewPost`)
- Nullable fields use `oneOf: [{ type: string }, { type: 'null' }]` per OpenAPI 3.1
- The `substackSession` security scheme references the `substack.sid` cookie
- Endpoint tags group operations by domain: `post`, `profile`, `note`, `comment`, `discovery`, `publication`, `following`, `connectivity`

## Dependencies

### Internal
- `src/internal/services/*.ts` — source of truth for endpoint definitions
- `src/internal/types/*.ts` — io-ts codecs mapped in `codec-shapes.md`
- `src/domain/` — domain entities whose public methods correspond to OpenAPI operations
- `src/substack-client.ts` — main client whose methods map to OpenAPI operations

### External
- OpenAPI 3.1 specification format
- Scalar API reference viewer (consumed by `docs/site/index.html`)

<!-- MANUAL: -->
