<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-28 | Updated: 2026-04-28 -->

# .devcontainer

## Purpose
VS Code devcontainer configuration for a consistent, reproducible development environment. Supports both local Remote - Containers and GitHub Codespaces.

## Key Files
| File | Description |
|------|-------------|
| `devcontainer.json` | Devcontainer specification: image, extensions, settings, tasks, launch configs |
| `README.md` | Human guide for using the devcontainer |

## Subdirectories
None.

## For AI Agents

### Working In This Directory
- Modify `devcontainer.json` when adding VS Code extensions, settings, or launch configurations.
- Keep `postCreateCommand` aligned with project setup (`npm install && npm run build`).
- The container runs as the `node` user, not root.

### Testing Requirements
- After changes, rebuild the devcontainer and verify `npm install` and `npm run build` succeed inside it.
- Confirm debug launch configurations appear in the VS Code Run and Debug panel.

### Common Patterns
- Extensions list includes ESLint, Prettier, GitLens, Jest, and Code Spell Checker.
- Format-on-save and fix-all-on-save are enabled.
- Available tasks: Build, Lint, Unit Tests, Integration Tests, Format, E2E Tests.

## Dependencies

### Internal
- Root project (`../`) — the devcontainer mounts the workspace at `/workspace`.

### External
- `mcr.microsoft.com/devcontainers/typescript-node` base image.
- VS Code Remote - Containers extension or GitHub Codespaces.

<!-- MANUAL: -->
