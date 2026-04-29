<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-28 | Updated: 2026-04-28 -->

# scripts

## Purpose
Utility scripts for development workflows. Includes a shell script for enforcing test naming conventions and a TypeScript script for live API validation of io-ts codecs.

## Key Files
| File | Description |
|------|-------------|
| `check-test-names.sh` | Validates that unit test `it()` descriptions follow the 3-part naming convention: "When {scenario}, then {expected result}" |
| `validate-codecs-live.ts` | Live API validation script that exercises io-ts codecs against real Substack API responses |

## Subdirectories
None.

## For AI Agents

### Working In This Directory
- `check-test-names.sh` is invoked via `pnpm check-test-names`.
- The script enforces 3-part naming only on files created or significantly modified in the current PR; legacy files are grandfathered.
- `validate-codecs-live.ts` requires network access and valid API credentials; run only when explicitly validating codecs.

### Testing Requirements
- Verify `check-test-names.sh` returns exit code 0 when all new test names comply.
- Verify `validate-codecs-live.ts` compiles with `ts-node` before running against live API.

### Common Patterns
- Test naming convention rejects `it('should...')`, `it('returns...')`, `it('validates...')`.
- Legacy files produce warnings (non-blocking) rather than errors.
- Live codec validation is separate from the main test suite and should not run in CI without secrets.

## Dependencies

### Internal
- Root project (`../`) — tests and source code being validated.

### External
| Package | Purpose |
|---------|---------|
| `bash` | `check-test-names.sh` runtime |
| `ts-node` | Executes `validate-codecs-live.ts` |
| `io-ts` | Runtime validation in live script |
| `fp-ts` | Functional utilities in live script |

<!-- MANUAL: -->
