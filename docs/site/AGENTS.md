<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-28 | Updated: 2026-04-28 -->

# site/

## Purpose

GitHub Pages site entry point. Contains the Scalar API reference viewer HTML that renders the OpenAPI specification as an interactive documentation site.

## Key Files

| File | Description |
|------|-------------|
| `index.html` | Scalar API reference viewer — GitHub Pages entry point |
| `.nojekyll` | Disables Jekyll processing on GitHub Pages |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| *(none)* | — |

## For AI Agents

### Working In This Directory
- Only modify `index.html` when updating the Scalar viewer configuration or site branding
- The viewer loads `openapi.yaml` from the parent `openapi/` directory via relative path (`./openapi.yaml`)
- Do not add new Markdown files here — narrative docs belong in the repository root
- Keep the Scalar CDN script pinned to the v1 major line for stability

### Testing Requirements
- Open `index.html` in a browser to verify the Scalar viewer loads and renders the OpenAPI spec correctly
- Confirm the `./openapi.yaml` relative path resolves when the site is served from the `docs/` directory on GitHub Pages
- Verify that the dark mode toggle and navigation links work as expected

### Common Patterns
- Scalar is loaded from `https://cdn.jsdelivr.net/npm/@scalar/api-reference@1`
- The viewer is initialized with `Scalar.createApiReference('#app', { url: './openapi.yaml', ... })`
- The sticky header includes a brand badge and links to the GitHub repository and raw `openapi.yaml`
- The `theme` is set to `default` and `layout` to `modern`

## Dependencies

### Internal
- `docs/openapi/openapi.yaml` — the OpenAPI spec rendered by the viewer
- `docs/openapi/` — sibling directory containing the spec file

### External
- Scalar API Reference (`@scalar/api-reference@1`) loaded from jsDelivr CDN
- GitHub Pages for static site hosting

<!-- MANUAL: -->
