<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-12 | Updated: 2026-04-12 -->

# docs/

## Purpose
Documentation source files for the ReadTheDocs site. The site is built using MkDocs (configured via `mkdocs.yml` in the project root). These Markdown files cover installation, usage, the full API reference, entity model, examples, and contribution guidance for the `substack-api` npm package.

## Key Files

| File | Description |
|------|-------------|
| `index.md` | Documentation homepage with feature overview and table of contents |
| `introduction.md` | Library introduction and high-level description |
| `installation.md` | Installation instructions |
| `quickstart.md` | Getting started guide with code samples for authentication, profiles, posts, notes, and comments |
| `api-reference.md` | Full API reference for `SubstackClient` and all entity classes (`Profile`, `OwnProfile`, `Post`, `Note`, `Comment`) |
| `entity-model.md` | Entity model documentation covering object relationships and navigation patterns |
| `examples.md` | Usage examples and common patterns |
| `development.md` | Contributing and development guide |
| `changelog.md` | Version changelog |
| `note-with-link-example.md` | Specific example showing how to create a note containing a link |
| `conf.py` | Sphinx/Python configuration (may be legacy from a previous docs system) |
| `requirements.txt` | Python dependencies for the docs build |

## For AI Agents

### Working In This Directory
- All documentation files are plain Markdown, rendered by MkDocs
- Internal links use relative paths (e.g., `[API Reference](api-reference.md)`)
- Code examples are TypeScript and reference the public API exported from `substack-api`
- Do not add new documentation files unless explicitly requested
- When updating API documentation, ensure method signatures match the source in `src/domain/` and `src/substack-client.ts`

### Common Patterns
- **Cross-referencing pages**: Each page links to related pages via relative Markdown links (e.g., quickstart links to api-reference and entity-model)
- **Code blocks**: All samples use `typescript` syntax highlighting and import from the `substack-api` package
- **Async iterator examples**: Pagination examples consistently use `for await (const x of ...)` syntax with optional `{ limit: N }` options
- **Entity method documentation**: Properties shown as TypeScript interfaces; methods shown with full signatures, parameter descriptions, and practical examples
- **Error handling patterns**: Documentation includes try-catch examples with specific HTTP status code checks (401, 403, 404, 429)
