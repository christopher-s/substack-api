<!-- Parent: ../AGENTS.md -->
# src/internal/

> Internal implementation layer for the Substack API client library.
> This directory is **not** part of the public API surface.

Generated: 2026-04-12 | Updated: 2026-04-12

## Purpose

The `internal/` directory houses the HTTP transport layer, runtime type validation utilities, service classes that communicate with Substack's API, and io-ts codec definitions for raw API responses. Nothing here is exported from the top-level package entry point. Domain models in `src/domain/` consume these services and translate internal types into public-facing entities.

## Key Files

| File | Responsibility |
|------|---------------|
| `index.ts` | Barrel export re-exporting `types/` and `services/` subdirectories. Not part of the public API. |
| `http-client.ts` | `HttpClient` class wrapping axios with `axios-rate-limit`. Authenticates via cookie (`substack.sid`). Provides `get`, `post`, and `put` methods with generic typed responses. Default rate limit: 25 requests/second. |
| `validation.ts` | Two utilities built on fp-ts/io-ts: `decodeOrThrow` (decodes with a codec, throws on failure with `PathReporter` messages) and `decodeEither` (returns an `Either` without throwing). |

## Subdirectories

### services/

7 service classes handling HTTP communication with the Substack API:

| Service | File | Purpose |
|---------|------|---------|
| `PostService` | `post-service.ts` | Fetch posts (preview and full) |
| `NoteService` | `note-service.ts` | Retrieve notes with pagination |
| `ProfileService` | `profile-service.ts` | Fetch user profiles and related data |
| `CommentService` | `comment-service.ts` | Retrieve comments on posts |
| `FollowingService` | `following-service.ts` | Manage following relationships |
| `ConnectivityService` | `connectivity-service.ts` | Check API connectivity |
| `NewNoteService` | `new-note-service.ts` | Publish new notes |

Services are instantiated by `SubstackClient` (`src/substack-client.ts`) and injected into domain model constructors. Services return internal types from the `types/` subdirectory.

### types/

34 io-ts codec and type definition files representing raw Substack API response shapes. Categories:

- **Post types**: `SubstackPreviewPost`, `SubstackFullPost`
- **Note types**: `SubstackNote`, `NoteBodyJson`, `PublishNoteRequest`, `PublishNoteResponse`, `CreateAttachmentRequest`, `CreateAttachmentResponse`, `PaginatedSubstackNotes`, `SubstackNoteContext`, `SubstackNoteComment`, `SubstackNoteTracking`
- **Profile types**: `SubstackFullProfile`, `SubstackPublicProfile`, `SubstackUserProfile`, `PotentialHandle`, `PotentialHandles`, `HandleType`
- **Comment types**: `SubstackComment`, `SubstackCommentResponse`
- **Publication types**: `SubstackPublication`, `SubstackPublicationBase`, `SubstackPublicationUser`
- **User/connection types**: `SubstackUser`, `SubstackAuthor`, `SubstackUserLink`, `SubstackProfilePublication`, `SubstackProfileSubscription`, `SubstackProfileItemContext`
- **Content types**: `SubstackLinkMetadata`, `SubstackAttachment`, `SubstackTheme`, `SubstackTrackingParameters`
- **Utility types**: `SubscriberLists`

Types with a companion `*Codec` export (e.g., `SubstackFullPostCodec`) can be used with `decodeOrThrow` for runtime validation. Types without codecs are plain TypeScript interfaces used for structural typing only.

## For AI Agents

### Working In This Directory

- **Do not export internal symbols publicly.** The barrel `index.ts` exists for cross-module convenience within `src/`, not for external consumption.
- **Adding a new service**: Create the file in `services/`, add the export to `services/index.ts`. The service should accept `HttpClient` in its constructor and return internal types.
- **Adding a new type**: Create the file in `types/`. If the type represents a raw API response that needs runtime validation, define both the TypeScript interface and an io-ts codec. Export both from `types/index.ts`.
- **Authentication**: All API calls go through `HttpClient` which sets the `Cookie: substack.sid={token}` header. Services never handle auth directly.

### Testing Requirements

- Unit tests for services should mock `HttpClient` responses. Do not make real API calls in unit tests.
- Unit tests for validation should test both success and failure paths of `decodeOrThrow`.
- Integration tests may use real API responses validated against codecs.
- Run: `pnpm test:unit` (unit), `pnpm test:integration` (integration), `pnpm test:e2e` (end-to-end).

### Common Patterns

- **Service pattern**: Each service class receives `HttpClient` via constructor injection. Methods call `this.httpClient.get<T>()` or `this.httpClient.post<T>()` with an internal type parameter.
- **Validation pattern**: Raw API responses are validated at service boundaries using `decodeOrThrow(Codec, data, contextLabel)`. Invalid data throws with a descriptive error.
- **Pagination**: Handled via async iterators in services, consumed by domain model entity methods (e.g., `for await (const post of profile.posts())`).

## Dependencies

- **axios** + **axios-rate-limit**: HTTP transport and rate limiting in `http-client.ts`
- **fp-ts** (`pipe`, `fold`, `Either`): Functional utilities for validation flow in `validation.ts`
- **io-ts** (`Type`, `PathReporter`): Runtime type codecs and error reporting in `validation.ts` and `types/`
