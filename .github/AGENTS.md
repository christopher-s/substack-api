<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-28 | Updated: 2026-04-28 -->

# .github

## Purpose

GitHub-specific configuration and automation. Contains issue templates, CI/CD workflows, Dependabot settings, and Copilot instructions.

## Key Files

| File | Description |
|------|-------------|
| `copilot-instructions.md` | GitHub Copilot instructions pointing to `CLAUDE.md` |
| `codecov.yml` | Codecov coverage reporting configuration |
| `dependabot.yaml` | Dependabot dependency update automation |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `ISSUE_TEMPLATE/` | Bug report and feature request templates (see `ISSUE_TEMPLATE/AGENTS.md`) |
| `workflows/` | GitHub Actions CI/CD workflows (see `workflows/AGENTS.md`) |

## For AI Agents

### Working In This Directory
- Do not modify workflow files without understanding the full CI/CD pipeline.
- Issue templates use GitHub-flavored Markdown with YAML frontmatter.
- Workflow files are YAML; validate syntax before committing.

### Testing Requirements
- Workflow changes should be tested on a branch or fork when possible.
- Verify YAML syntax with `pnpm lint` or a YAML linter.

### Common Patterns
- Conventional Commits format for PR titles and commit messages.
- Workflows trigger on `push`, `pull_request`, and scheduled `cron` events.

## Dependencies

### Internal
- `../CLAUDE.md` — Authoritative source for build, test, lint, architecture, and contribution guidelines.

### External
- GitHub Actions runners (ubuntu-latest)
- codecov/codecov-action for coverage uploads

<!-- MANUAL: See CLAUDE.md for the authoritative source on build, test, lint commands, project architecture, directory structure, commit/PR guidelines, and testing strategy. -->
