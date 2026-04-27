<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-12 | Updated: 2026-04-12 -->

# Unit Tests

## Purpose

Unit tests for the substack-api client library. All tests use fully mocked HTTP responses (no real API calls) to verify business logic, entity behavior, builder mechanics, validation codecs, and client orchestration in isolation.

## Key Files

### Client Tests

| File | Description |
|------|-------------|
| `substack-client.test.ts` | SubstackClient orchestration: connectivity checks, profile/post/note/comment lookups, URL normalization |
| `http-client.test.ts` | HttpClient low-level GET/POST/PUT behavior, error handling for non-200 responses, axios instance creation |

### Service Tests

| File | Description |
|------|-------------|
| `comment-service.test.ts` | CommentService: fetching comments for a post, fetching by ID, null/empty handling |
| `connectivity-service.test.ts` | ConnectivityService: `isConnected` via `/user-setting` PUT, network/timeout/HTTP error tolerance |
| `following-service.test.ts` | FollowingService: fetching followed users via subscriber lists, two-client coordination (publication + substack) |
| `note-service.test.ts` | NoteService: note retrieval and feed operations |
| `post-service.test.ts` | PostService: post retrieval by ID and profile |
| `profile-service.test.ts` | ProfileService: own profile, profile by ID, profile by slug |

### Entity Tests

| File | Description |
|------|-------------|
| `entities.test.ts` | Entity creation (Profile, PreviewPost, Comment) with injected mock services |
| `note.test.ts` | Note entity: property access, author metadata |
| `post.test.ts` | Post entity: property access, content retrieval |
| `profile.test.ts` | Profile entity: property access, slug handling |
| `own-profile.test.ts` | OwnProfile entity: authenticated user-specific operations |
| `own-profile-note-with-link.test.ts` | OwnProfile note creation with embedded links |

### Builder Tests

| File | Description |
|------|-------------|
| `note-builder.test.ts` | Legacy NoteBuilder suite: paragraph construction, rich text (bold/italic/code), multi-paragraph, publish flow |
| `note-builder-coverage.test.ts` | Additional edge-case coverage for NoteBuilder |
| `note-builder-immutability.test.ts` | Builder immutability: branching, state isolation, regression tests for shared builder mutation |
| `note-with-link-builder.test.ts` | Note builder with link embedding |
| `post-builder.test.ts` | Post builder: lists (bullet/numbered), links, mixed formatting, validation errors, builder type scoping |

### Validation and API Surface Tests

| File | Description |
|------|-------------|
| `io-ts-validation.test.ts` | io-ts codec validation: SubstackPreviewPostCodec, SubstackFullPostCodec, SubstackCommentCodec, SubstackCommentResponseCodec |
| `public-api-exports.test.ts` | Verifies public package exports (NoteBuilder, ParagraphBuilder, ListBuilder, ListItemBuilder) are accessible from `@substack-api/index` |
| `post-global-endpoint.test.ts` | Global post endpoint (`/posts/by-id/:id`) across different publication hostnames |

## For AI Agents

### Working In This Directory

- All 22 test files follow Jest conventions with `describe`/`it` blocks and `beforeEach` for setup.
- Tests import from `@substack-api/*` path aliases (configured in tsconfig), not relative paths into `src/`.
- The `beforeEach` block in each file calls `jest.clearAllMocks()` to ensure test isolation.
- No real HTTP calls are made. Everything is mocked at the axios or HttpClient level.

### Testing Requirements

- Run with: `pnpm test:unit` (all unit tests) or `pnpm test:watch` (watch mode).
- Unit test configuration is in `jest.config.unit.ts` (or the `test:unit` script in `package.json`).
- New tests must follow the existing patterns: `describe` blocks grouped by method/feature, `beforeEach` for mock setup, `expect` assertions on both mock calls and return values.
- Mock HttpClient using `jest.mock('@substack-api/internal/http-client')` and cast to `jest.Mocked<HttpClient>` with manually assigned `get`, `post`, `put` jest fns.

### Common Patterns

1. **Service mock pattern**: Create a `jest.Mocked<HttpClient>` in `beforeEach`, assign `jest.fn()` to its methods, instantiate the service under test with the mock client. Verify the correct endpoint is called and the return value is transformed properly.

2. **Client mock pattern** (substack-client.test.ts): Use `jest.mock` on both `HttpClient` and service modules. Replace internal services on the client instance via cast: `(client as unknown as { postService: PostService }).postService = mockPostService`.

3. **Builder mock pattern**: Create a mock `HttpClient` with `post` resolving to a `PublishNoteResponse`. Verify `mockPublicationClient.post` is called with the expected endpoint (`/comment/feed/`) and structured `bodyJson` payload.

4. **Validation codec pattern**: Use `decodeEither` (returns `Either` from fp-ts) and `decodeOrThrow` to exercise io-ts codecs. Assert `isRight`/`isLeft` on the `Either` result and verify thrown error messages from `decodeOrThrow`.

5. **Immutability testing pattern**: Capture builder instances at intermediate steps, verify `not.toBe` (reference inequality), then assert each branch produces independent results without cross-contamination.

## Dependencies

- **Jest**: Test framework (`jest`, `@types/jest`, `ts-jest`)
- **fp-ts**: Functional programming used in validation tests (`isLeft`, `isRight`)
- **io-ts**: Runtime type validation codecs under test
- **axios**: Mocked at module level in http-client tests
- **Source modules under test**: `src/substack-client.ts`, `src/internal/services/*`, `src/internal/http-client.ts`, `src/domain/*`, `src/internal/types/*`, `src/internal/validation/*`
