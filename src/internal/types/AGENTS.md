<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-12 | Updated: 2026-04-12 -->

# Types (`src/internal/types/`)

Internal type definitions for raw Substack API response shapes and request/response contracts. These are **not** exported from the public API. They pair TypeScript types with io-ts codecs for runtime validation where needed.

## Purpose

- Define the shape of raw JSON responses from Substack API endpoints
- Provide io-ts codecs for runtime decoding and validation of API data
- Define request body shapes for write operations (publish note, create attachment)
- Serve as the foundation for domain model construction in the service layer

## Key Files

### Post Types

| File | Type | Codec | Description |
|------|------|-------|-------------|
| `substack-preview-post.ts` | `SubstackPreviewPost` | Yes | Minimal post data (id, title, post_date, optional subtitle/body) |
| `substack-full-post.ts` | `SubstackFullPost` | Yes | Full post response with all fields |

### Note Types

| File | Type | Codec | Description |
|------|------|-------|-------------|
| `substack-note.ts` | `SubstackNote` | Yes | Note API response with context, comment, and parent comments |
| `substack-note-comment.ts` | `SubstackNoteComment` | No | Individual comment within a note |
| `substack-note-context.ts` | `SubstackNoteContext` | No | Timestamp and user context for a note |
| `substack-note-tracking.ts` | `SubstackNoteTracking` | No | Tracking parameters specific to notes |
| `paginated-substack-notes.ts` | `PaginatedSubstackNotes` | No | Cursor-paginated notes response wrapper |
| `note-body-json.ts` | `NoteBodyJson` | No | ProseMirror-style document structure for note content |

### Profile Types

| File | Type | Codec | Description |
|------|------|-------|-------------|
| `substack-author.ts` | `SubstackAuthor` | No | Flattened author info (id, name, optional is_admin) |
| `substack-user.ts` | `SubstackUser` | Yes | User record with id, name, handle, photo_url |
| `substack-user-profile.ts` | `SubstackUserProfile` | Yes | User profile with publication membership details |
| `substack-user-link.ts` | `SubstackUserLink` | No | External link associated with a user profile |
| `substack-public-profile.ts` | `SubstackPublicProfile` | No | Public-facing profile view |
| `substack-full-profile.ts` | `SubstackFullProfile` | Yes | Complete profile with all nested data |
| `substack-profile-publication.ts` | `SubstackProfilePublication` | No | Extended publication info for profile contexts |
| `substack-profile-item-context.ts` | `SubstackProfileItemContext` | Yes | Context for an item within a profile feed |
| `substack-profile-subscription.ts` | `SubstackProfileSubscription` | No | Subscription relationship data |

### Comment Types

| File | Type | Codec | Description |
|------|------|-------|-------------|
| `substack-comment.ts` | `SubstackComment` | Yes | Individual comment on a post |
| `substack-comment-response.ts` | `SubstackCommentResponse` | Yes | API response wrapper for comment operations |

### Publication Types

| File | Type | Codec | Description |
|------|------|-------|-------------|
| `substack-publication.ts` | `SubstackPublication` | No | Full publication response |
| `substack-publication-base.ts` | `SubstackPublicationBase` | Yes (not exported) | Base publication fields (id, name, subdomain, logo, etc.) |
| `substack-publication-user.ts` | `SubstackPublicationUser` | No | User-within-publication info |
| `substack-theme.ts` | `SubstackTheme` | No | Theme/styling configuration for a publication |

### Request/Response Types

| File | Type | Codec | Description |
|------|------|-------|-------------|
| `publish-note-request.ts` | `PublishNoteRequest` | No | Body for note publish API call |
| `publish-note-response.ts` | `PublishNoteResponse` | Yes | Response from note publish endpoint |
| `create-attachment-request.ts` | `CreateAttachmentRequest` | No | Body for attachment upload API call |
| `create-attachment-response.ts` | `CreateAttachmentResponse` | Yes | Response from attachment upload endpoint |

### Other Types

| File | Type | Codec | Description |
|------|------|-------|-------------|
| `substack-attachment.ts` | `SubstackAttachment` | No | File/image attachment metadata |
| `substack-link-metadata.ts` | `SubstackLinkMetadata` | No | URL preview/link embed metadata |
| `substack-tracking-parameters.ts` | `SubstackTrackingParameters` | No | UTM and analytics tracking fields |
| `handle-type.ts` | `HandleType` | Yes | Union literal: `existing` / `subdomain` / `suggestion` |
| `potential-handle.ts` | `PotentialHandle` | Yes | Single handle suggestion with type |
| `potential-handles.ts` | `PotentialHandles` | Yes | Collection of handle suggestions |
| `subscriber-lists.ts` | `SubscriberListsT` | Yes (`SubscriberLists`) | Subscriber list groups with nested user arrays |

### Barrel Export

| File | Description |
|------|-------------|
| `index.ts` | Re-exports all types and codecs using `@substack-api/internal/types/` package aliases |

## For AI Agents

### Working In This Directory

- **Codec files** use io-ts (`import * as t from 'io-ts'`). The pattern is: define a codec constant, then derive the type via `t.TypeOf<typeof XCodec>`. Codecs are co-located with their types in the same file.
- **Plain interface files** use standard TypeScript `export interface` with no runtime validation. Used for types that don't need decoding (request bodies, composed sub-types, wrappers).
- The barrel `index.ts` exports types via `export type { ... }` (type-only) and codecs via `export { ... }` (value export). Package paths use the `@substack-api/internal/types/` alias.
- **Minimal codec principle**: codecs only validate fields the codebase actually reads. Optional API fields use `t.partial(...)` within `t.intersection([...])`. This keeps validation lenient against API changes.
- Files reference each other using `import type` for type-only dependencies (e.g., `PaginatedSubstackNotes` imports `SubstackNote`).

### Testing Requirements

- Codec files are validated through unit tests that feed sample JSON through the codec and assert the decoded output.
- When adding a new type with a codec, add corresponding test fixtures in `tests/unit/`.
- The test command for this area is `pnpm test:unit`.

### Common Patterns

**Adding a new API response type with codec:**
1. Create `substack-<entity>.ts` with an io-ts codec and derived type.
2. Export both from the file.
3. Add `export type` and `export` entries in `index.ts`.

**Adding a new plain type (no codec):**
1. Create the file with `export interface`.
2. Add `export type` entry only in `index.ts`.

**Composing types:**
- Use `extends` for interface inheritance (e.g., `SubstackProfilePublication extends SubstackPublicationBase`).
- Use `import type` for type-only cross-references to avoid circular runtime imports.

## Dependencies

| Dependency | Usage |
|------------|-------|
| `io-ts` | Runtime type validation codecs (`t.type`, `t.partial`, `t.intersection`, `t.union`, `t.literal`, `t.array`) |
