<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-28 | Updated: 2026-04-28 -->

# Test Helpers

## Purpose

Shared mock utilities for unit tests. Provides factory functions that create fully-typed `jest.Mocked` implementations of `HttpClient` and domain service dependencies, eliminating boilerplate in every test file.

## Key Files

| File | Description |
|------|-------------|
| `mock-http-client.ts` | `createMockHttpClient(baseUrl, overrides?)` — returns a `jest.Mocked<HttpClient>` with `get`, `post`, and `put` as `jest.fn()` |
| `mock-services.ts` | `createMockEntityDeps(overrides?)` — returns a `MockedEntityDeps` object containing mocked `HttpClient`, `ProfileService`, `PostService`, `NoteService`, `CommentService`, `FollowingService`, and `NoteBuilderFactory` |

## Subdirectories

None.

## For AI Agents

### Working In This Directory

- Extend `createMockEntityDeps` when new services are added to `EntityDeps`.
- Keep mock return types aligned with the real service interfaces.
- Use `Partial<EntityDeps>` for overrides so callers supply only what they need.

### Testing Requirements

- Helpers are exercised indirectly through every unit test. Run `pnpm test:unit` to verify.
- If a mock factory breaks, most entity and service tests will fail.

### Common Patterns

1. **HttpClient mock**: `createMockHttpClient('https://test.substack.com')` gives a mock with typed `get`/`post`/`put` methods.
2. **EntityDeps mock**: `createMockEntityDeps({ perPage: 10 })` overrides only `perPage`, leaving all services as default mocks.
3. **Override pattern**: Spread `...overrides` last so callers can replace any mock method or property.

## Dependencies

### Internal

- `src/internal/http-client.ts` — `HttpClient` interface
- `src/domain/entity-deps.ts` — `EntityDeps` type
- `src/domain/note-builder-factory.ts` — `NoteBuilderFactory` interface
- `src/internal/services/*` — service interfaces

### External

- `jest` — `jest.fn()` and `jest.Mocked<T>` types
