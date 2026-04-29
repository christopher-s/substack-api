<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-28 | Updated: 2026-04-28 -->

# ISSUE_TEMPLATE

## Purpose
GitHub issue templates that standardize bug reports and feature requests. Ensures contributors provide the context needed for maintainers to reproduce bugs and evaluate feature proposals efficiently.

## Key Files
| File | Description |
|------|-------------|
| `bug_report.md` | Template for bug reports with reproduction steps, environment details, and code snippets |
| `feature_request.md` | Template for feature requests with proposed API examples and problem descriptions |

## Subdirectories
No subdirectories.

## For AI Agents

### Working In This Directory
- Modify templates only when the project's issue requirements change (e.g., adding a new required field).
- Keep the `about` field concise; it appears in the GitHub issue creation UI.
- Maintain the `---` frontmatter block at the top of each template; GitHub parses this for the template picker.
- Preserve the TypeScript code block placeholders in `bug_report.md` and `feature_request.md` to match the project's language.

### Testing Requirements
- Validate YAML frontmatter syntax with any YAML linter.
- Preview rendered markdown locally or in a GitHub preview tab.
- Verify the template appears correctly in the GitHub "New Issue" UI after merging.

### Common Patterns
- Frontmatter keys: `name`, `about`, `title`, `labels`, `assignees`
- Use `labels` to auto-apply `bug` or `enhancement` labels
- Keep sections in second-level headings (`##`) for consistent formatting

## Dependencies

### Internal
- `../AGENTS.md` - Parent agent instructions
- `../../CLAUDE.md` - Build, test, and architecture reference

### External
- GitHub Issues (native platform feature)

<!-- MANUAL: -->
