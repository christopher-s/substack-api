<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-12 | Updated: 2026-04-28 -->

# docs/

## Purpose

Documentation assets for the GitHub Pages site. The site renders an interactive OpenAPI reference using Scalar.

All narrative documentation (installation, quickstart, examples, contributing) lives in the repository root:
- `README.md` — Project overview, installation, quickstart, examples
- `CONTRIBUTING.md` — Development setup and contribution guidelines
- `CHANGELOG.md` — Version history

## Key Files

| File | Description |
|------|-------------|
| `openapi/openapi.yaml` | OpenAPI 3.1 specification describing the Substack HTTP API |
| `openapi/codec-shapes.md` | Reference mapping io-ts codecs to OpenAPI schemas |
| `openapi/endpoint-inventory.json` | Endpoint inventory for spec maintenance |
| `site/index.html` | Scalar API reference viewer (GitHub Pages entry point) |
| `site/.nojekyll` | Disables Jekyll processing on GitHub Pages |

## For AI Agents

### Working In This Directory
- Only modify `openapi/openapi.yaml` when updating the API specification
- Only modify `site/index.html` when updating the Scalar viewer configuration
- Do not add new Markdown files here — narrative docs belong in the repository root
- When updating API documentation, ensure method signatures match the source in `src/domain/` and `src/substack-client.ts`
