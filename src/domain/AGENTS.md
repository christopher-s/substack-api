<!-- Parent: ../AGENTS.md -->

# Domain Layer

> Generated: 2026-04-12 | Updated: 2026-04-12

## Purpose

The domain layer contains the public-facing entity classes and builders that consumers of the Substack API client interact with directly. Each entity wraps raw API data with a clean interface and provides methods for related operations (e.g., fetching comments on a post, iterating notes for a profile). This directory also houses the `NoteBuilder` fluent API for constructing and publishing rich-text notes.

Entities are instantiated by the service layer (`src/internal/services/`) and returned to callers via `SubstackClient`. They depend on service and HTTP abstractions injected through constructors, keeping network concerns out of the domain objects themselves.

## Key Files

| File | Export(s) | Description |
|------|-----------|-------------|
| `index.ts` | Re-exports all entities, builders, and types | Barrel file that serves as the public API surface for the domain layer. Consumers import from `@substack-api/domain` which resolves here. |
| `profile.ts` | `Profile` | Read-only user profile entity. Exposes `id`, `slug`, `handle`, `name`, `url`, `avatarUrl`, and `bio`. Provides async iterators `posts()` (offset-based pagination) and `notes()` (cursor-based pagination) that yield `PreviewPost` and `Note` instances respectively. Accepts injected services for posts, notes, comments, and profiles. |
| `own-profile.ts` | `OwnProfile` | Authenticated user profile extending `Profile` with write capabilities. Adds `newNote()` (returns a `NoteBuilder`), `newNoteWithLink()` (returns a `NoteWithLinkBuilder` for link-attached notes), `following()` (async iterator of `Profile` for followed users), and overrides `notes()` to use an authenticated cursor-based endpoint. Requires additional `FollowingService` and `NoteBuilderFactory` dependencies. |
| `post.ts` | `PreviewPost`, `FullPost`, `Post` (interface) | `Post` interface defines the shared contract (`id`, `title`, `subtitle`, `body`, `comments()`, `like()`, `addComment()`). `PreviewPost` holds truncated content from list endpoints and exposes `fullPost()` to lazily fetch the `FullPost` with complete HTML body, slug, reactions, restacks, tags, and cover image. Both implement async `comments()` iterators yielding `Comment` entities. |
| `note.ts` | `Note` | Note entity representing a Substack note. Extracts `id` (from `entity_key`), `body`, `likesCount`, `author`, and `publishedAt` from raw `SubstackNote` data. Provides `comments()` async iterator over parent comments and stub methods `like()` and `addComment()` (not yet implemented). |
| `comment.ts` | `Comment` | Comment entity with `id`, `body`, `isAdmin`, and `likesCount` fields. A simple data wrapper around `SubstackComment` with no methods. `likesCount` is currently a TODO placeholder. |
| `note-builder.ts` | `NoteBuilder`, `NoteWithLinkBuilder`, `ParagraphBuilder`, `ListBuilder`, `ListItemBuilder`, `TextSegment`, `ListItem`, `List` (types) | Fluent builder hierarchy for constructing and publishing Substack notes. `NoteBuilder` manages paragraphs and publishes via `POST /comment/feed/`. `ParagraphBuilder` adds rich text segments (bold, italic, code, underline, link) and nested lists. `ListBuilder` and `ListItemBuilder` handle bullet/numbered list construction. `NoteWithLinkBuilder` extends `NoteBuilder` to first create a link attachment via `POST /comment/attachment/` before publishing. All builders are immutable -- each method returns a new instance. |

## For AI Agents

### Working In This Directory

- Entities receive raw API data (`SubstackNote`, `SubstackPreviewPost`, etc.) and injected services via constructors. They do not make direct HTTP calls -- they delegate to services.
- All pagination uses async iterators (`AsyncIterable<T>`). Posts use offset-based pagination; notes use cursor-based pagination. Both accept an optional `limit` option.
- The `NoteBuilder` hierarchy uses immutable builder pattern: every method returns a new instance carrying the accumulated state. To finalize, call `build()` (returns the request payload) or `publish()` (posts to the API).
- `OwnProfile` extends `Profile` via class inheritance. It passes all parent dependencies through `super()` and adds its own services (`FollowingService`, `NoteBuilderFactory`).
- Several fields are marked TODO (e.g., `likesCount` on `PreviewPost` and `Comment`, author extraction on posts). Do not assume these are fully wired.

### Testing Requirements

- Unit tests mock the service layer constructors (e.g., `PostService`, `NoteService`, `CommentService`) and verify that entities call the correct service methods with correct arguments.
- Test async iterators by collecting results with `for await...of` and asserting yielded entities.
- Test `NoteBuilder` by building a note via the fluent API and asserting the `PublishNoteRequest` output from `build()` matches the expected Substack document schema.
- Test `NoteWithLinkBuilder` by mocking the attachment creation call before verifying the publish call includes `attachmentIds`.

### Common Patterns

- **Async iterator pagination**: All collection methods return `AsyncIterable<T>` with internal pagination loops. Errors are caught and result in empty iterators (except for `Post.comments()` which throws).
- **Entity wrapping**: Raw data objects are stored as `private readonly rawData` and fields are extracted in the constructor. No lazy evaluation -- fields are assigned eagerly.
- **Builder immutability**: Each builder method spreads existing state into a new object and returns a fresh builder instance. This prevents mutation bugs but means chaining creates intermediate objects.

## Dependencies

### Internal References

| From | To | Usage |
|------|----|-------|
| All entities | `@substack-api/internal/http-client` | `HttpClient` for authenticated API requests |
| `Profile`, `OwnProfile` | `@substack-api/internal/services` (`ProfileService`, `PostService`, `NoteService`, `CommentService`, `FollowingService`, `NoteBuilderFactory`) | Delegated data fetching and pagination |
| `PreviewPost`, `FullPost` | `@substack-api/internal/services` (`PostService`, `CommentService`) | Post retrieval and comment fetching |
| All entities | `@substack-api/internal` types | Raw data type definitions (`SubstackPublicProfile`, `SubstackNote`, `SubstackPreviewPost`, etc.) |
| `Note`, `PreviewPost`, `FullPost` | `@substack-api/domain/comment` | Instantiating `Comment` entities from raw comment data |
| `Profile` | `@substack-api/domain/post`, `@substack-api/domain/note` | Instantiating `PreviewPost` and `Note` entities from paginated results |
| `OwnProfile` | `@substack-api/domain/profile`, `@substack-api/domain/note` | Creating `Profile` instances for followed users and `Note` instances |
| `NoteBuilder` | `@substack-api/internal` (codecs, request types) | `PublishNoteRequest`, `PublishNoteResponseCodec`, `CreateAttachmentRequest`, `CreateAttachmentResponseCodec` |
| `NoteBuilder` | `@substack-api/internal/validation` | `decodeOrThrow` for runtime response validation |
| `index.ts` | All domain modules | Re-exports everything as the public API barrel |

### External Dependencies

- **fp-ts / io-ts**: Used indirectly through `decodeOrThrow` and the codec types in `note-builder.ts` for runtime validation of API responses. Not imported directly in other domain files.
