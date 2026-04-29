<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-28 | Updated: 2026-04-28 -->

# Property-Based Tests

## Purpose

Property-based tests for io-ts codecs using `fast-check`. Validates that codecs correctly round-trip valid data and reject invalid mutations, providing broader coverage than example-based tests alone.

## Key Files

| File | Description |
|------|-------------|
| `codecs.test.ts` | Property-based tests for `SubstackUserCodec`, `SubstackBylineCodec`, `SubstackPublicationCodec`, `HandleTypeCodec`, `SubstackPreviewPostCodec`, `SubstackCommentCodec`, `SubstackCategoryCodec`, and `SubstackNoteCodec`. Covers round-trip encoding/decoding and rejection of invalid data |
| `setup.ts` | Global `fast-check` configuration — sets deterministic seed (`seed: 42`) for reproducible test runs |

## Subdirectories

None.

## For AI Agents

### Working In This Directory

- Add new `fc.record` arbitrary builders when new codecs are introduced.
- Keep arbitraries in sync with the io-ts codec definitions in `src/internal/types/`.
- Use `assertRoundTrip` and `assertRejectsInvalid` helpers for consistency.
- Run `numRuns: 100` as the default; increase only for critical codecs.

### Testing Requirements

- Run with: `pnpm test:unit` (property tests are included in the unit test suite).
- `setup.ts` is loaded automatically by Jest via the test configuration.
- Failing property tests print the minimal counter-example from `fast-check`.

### Common Patterns

1. **Arbitrary builder**: Define `fc.record({ ... })` matching the codec's expected shape, using `maybeArb` for optional/nullable fields.
2. **Round-trip test**: `assertRoundTrip(codec, arb)` encodes a generated value, decodes it back, and asserts equality.
3. **Rejection test**: `assertRejectsInvalid(codec, arb, mutate)` generates valid data, applies a mutation, and asserts the codec returns `Left`.
4. **Deterministic seed**: `setup.ts` sets `fc.configureGlobal({ seed: 42 })` so failures are reproducible across runs.

## Dependencies

### Internal

- `src/internal/types/*` — io-ts codecs under test (`SubstackUserCodec`, `SubstackPreviewPostCodec`, etc.)
- `src/internal/types/substack-publication` — `SubstackPublicationCodec`

### External

- `fast-check` — Property-based testing framework
- `io-ts` — Runtime type validation codecs
- `fp-ts/Either` — `isRight` and `isLeft` for asserting decode results
- `jest` — Test runner
