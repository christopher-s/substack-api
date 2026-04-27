<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-12 | Updated: 2026-04-12 -->

# src

## Purpose
Source directory for the Substack API TypeScript client library. Contains the public API surface (SubstackClient, domain entities, type definitions) and internal implementation (HTTP client, service layer, validation, raw API response types). The architecture follows a service-oriented pattern where SubstackClient orchestrates domain-specific services, and domain entities expose methods for traversing relationships (e.g., `profile.posts()`, `post.comments()`).

## Key Files
| File | Description |
|------|-------------|
| `index.ts` | Public barrel export. Re-exports SubstackClient, domain entities (Profile, OwnProfile, PreviewPost, FullPost, Note, Comment), builders (NoteBuilder, NoteWithLinkBuilder, ParagraphBuilder, ListBuilder, ListItemBuilder), and public types. Internal modules are not exported. |
| `substack-client.ts` | Main SubstackClient class. Accepts SubstackConfig, creates two HttpClient instances (publication-scoped and global substack.com), and initializes all services. Entry points: `ownProfile()`, `profileForSlug()`, `profileForId()`, `postForId()`, `noteForId()`, `commentForId()`, `testConnectivity()`. |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `domain/` | Domain entities and builders: Profile, OwnProfile, PreviewPost, FullPost, Note, Comment, NoteBuilder, NoteWithLinkBuilder, ParagraphBuilder, ListBuilder, ListItemBuilder. Entities wrap raw API types and expose methods for related data traversal via async iterators. |
| `internal/` | Internal implementation not exported from the public API. Contains services (PostService, NoteService, ProfileService, CommentService, FollowingService, ConnectivityService, NoteBuilderFactory), HttpClient with rate limiting, validation logic (fp-ts/io-ts codecs), and raw API response type definitions. |
| `types/` | Public type definitions: SubstackConfig (client configuration), PaginationParams, SearchParams, PostsIteratorOptions, CommentsIteratorOptions, NotesIteratorOptions. These are exported as TypeScript types (not runtime values). |

## For AI Agents

### Working In This Directory
- Path aliases: `@substack-api/domain`, `@substack-api/internal`, `@substack-api/types`, `@substack-api/substack-client`
- Import pattern: `import { Profile } from '@substack-api/domain'`
- SubstackClient uses two HttpClient instances: `publicationClient` for publication-specific endpoints, `substackClient` for global substack.com endpoints
- URL normalization: URLs without a protocol default to `https://`
- Default API prefix: `api/v1`
- Default pagination: 25 items per page, 25 max requests per second

### Testing Requirements
- Unit tests mock HTTP responses via HttpClient
- Test files are in `tests/unit/`
- Integration tests use real API calls with test data (`tests/integration/`)
- E2E tests require API credentials (`tests/e2e/`)
- Required before committing: `pnpm lint`, `pnpm build`, `pnpm test`

### Common Patterns
- Entity-based API: domain objects carry methods (e.g., `post.comments()`, `profile.posts()`)
- Service layer: services encapsulate HTTP calls and return internal types
- Async iterators: pagination via `for await (const post of profile.posts())`
- Builder pattern: NoteBuilder constructs formatted notes with paragraphs, lists, and links
- fp-ts/io-ts: runtime type validation using codecs (e.g., `SubstackPreviewPostCodec`)
- Domain entities receive service dependencies via constructor injection

## Dependencies

### Internal
- `domain/` depends on `internal/` (services, HTTP client, raw types)
- `internal/` depends on `types/` (public config types)
- `substack-client.ts` depends on `domain/`, `internal/`, and `types/`
- `index.ts` re-exports from `substack-client.ts`, `domain/`, and `types/` only

### External
- axios: HTTP requests (wrapped by HttpClient)
- fp-ts: functional programming utilities (Either, pipe)
- io-ts: runtime type validation and codec definitions
