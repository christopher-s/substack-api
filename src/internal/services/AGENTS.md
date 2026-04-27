<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-12 | Updated: 2026-04-12 -->

# Services Layer

## Purpose

The services layer handles HTTP communication with the Substack API. Each service is responsible for a specific domain (posts, notes, profiles, comments, following, connectivity) and returns internal types that are transformed into domain models by `SubstackClient`. Services do **not** construct domain entities directly -- they fetch raw data and validate it via io-ts codecs.

## Key Files

| File | Class | Public Methods | Responsibility |
|------|-------|---------------|----------------|
| `index.ts` | -- | -- | Barrel export for all service classes |
| `post-service.ts` | `PostService` | `getPostById(id)`, `getPostsForProfile(profileId, options)` | Fetches full posts by ID and lists of preview posts for a profile |
| `note-service.ts` | `NoteService` | `getNoteById(id)`, `getNotesForLoggedUser(options?)`, `getNotesForProfile(profileId, options?)` | Fetches individual notes and paginated note lists for logged-in user or a profile |
| `profile-service.ts` | `ProfileService` | `getOwnProfile()`, `getProfileById(id)`, `getProfileBySlug(slug)` | Fetches full profile data by ID or slug; resolves own profile via handle lookup |
| `comment-service.ts` | `CommentService` | `getCommentsForPost(postId)`, `getCommentById(id)` | Fetches comments for a post or a single comment by ID |
| `following-service.ts` | `FollowingService` | `getFollowing()`, `getOwnId()` | Retrieves the authenticated user's following list; `getOwnId()` resolves the current user ID |
| `connectivity-service.ts` | `ConnectivityService` | `isConnected()` | Lightweight connectivity check via a PUT to `/user-setting` |
| `new-note-service.ts` | `NewNoteService` | `newNote()`, `newNoteWithLink(link)` | Factory for `NoteBuilder` and `NoteWithLinkBuilder` instances |

## For AI Agents

### Working In This Directory

- Services receive `HttpClient` instances via constructor injection. Some services use `substackClient` (global `substack.com` endpoint) while others use `publicationClient` (publication-specific hostname). Check each service's constructor to determine which client is which.
- All API responses are validated through io-ts codecs via `decodeOrThrow`. When adding a new service method, define or reuse an appropriate codec and validate the response before returning.
- The `NoteService.getNoteById` method repurposes the `/reader/comment/:id` endpoint and transforms the comment response into a `SubstackNote` structure.
- The `PostService.getPostById` method includes a `transformPostData` private helper that normalizes `postTags` from objects to string arrays.
- The `FollowingService` uses two HTTP clients: `publicationClient` for the subscriber-lists endpoint and `substackClient` for resolving the current user ID.

### Testing Requirements

- Unit tests mock HTTP responses and test business logic (validation, transformation, error handling).
- Each service method should have tests covering: successful response, validation failure (malformed API data), and API error cases.
- Test files mirror the service structure under `tests/unit/services/`.

### Common Patterns

- **Constructor injection**: All services accept `HttpClient` (or multiple clients) via `private readonly` constructor parameters.
- **`decodeOrThrow`**: Standard pattern for io-ts validation -- decodes raw API data and throws a descriptive `Error` on failure.
- **Pagination**: Note methods use cursor-based pagination via an optional `cursor` parameter, returning `PaginatedSubstackNotes` with `notes` and `nextCursor`.
- **Builder factory**: `NewNoteService` does not perform HTTP calls itself; it returns builder instances (`NoteBuilder`, `NoteWithLinkBuilder`) that handle the actual note creation.
- **Error handling**: Services throw plain `Error` objects with descriptive messages. They do not catch or wrap errors from the HTTP layer.

## Dependencies

- **`@substack-api/internal/http-client`**: `HttpClient` type used for all HTTP operations.
- **`@substack-api/internal/types`**: io-ts codecs (`SubstackFullPostCodec`, `SubstackPreviewPostCodec`, `SubstackCommentCodec`, `SubstackCommentResponseCodec`, `SubstackFullProfileCodec`, `SubstackUserProfileCodec`, `PotentialHandlesCodec`, `SubscriberLists`) and corresponding type definitions.
- **`@substack-api/internal/validation`**: `decodeOrThrow` helper for runtime validation.
- **`@substack-api/domain/note-builder`**: `NoteBuilder` and `NoteWithLinkBuilder` classes used by `NewNoteService`.
- **`fp-ts/Either`** and **`io-ts/PathReporter`**: Used by `FollowingService` for manual codec validation.
