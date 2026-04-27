<!-- Parent: ../AGENTS.md -->

# src/types — Public Type Definitions

> Generated: 2026-04-12 | Updated: 2026-04-12

## Purpose

This directory exports the clean, stable type definitions that form the public API surface of the Substack client library. Consumers of the library depend on these types for configuration, pagination, search, and iterator options. They are re-exported through a single barrel file so external code only needs to import from `@substack-api/types`.

## Key Files

### `index.ts`

Barrel re-export file. Re-exports everything from the two sibling modules (`domain-config` and `domain-options`) so that `import { ... } from '@substack-api/types'` works as a single entry point.

### `domain-config.ts`

Configuration and request-parameter interfaces for the Substack API client:

- **`SubstackConfig`** -- Client initialization options. Mandatory fields: `publicationUrl` (the publication's base URL) and `token` (API auth token). Optional fields: `substackUrl` (global Substack base URL, defaults to `https://substack.com`), `urlPrefix` (API path prefix, defaults to `api/v1/`), `perPage` (default pagination page size, defaults to 25), and `maxRequestsPerSecond` (rate-limit cap, defaults to 25).
- **`PaginationParams`** -- Generic pagination parameters with optional `limit` and `offset` fields, used across list endpoints.
- **`SearchParams`** -- Extends `PaginationParams` with a mandatory `query` string and optional `sort` (`'top'` or `'new'`) and `author` filter.

### `domain-options.ts`

Iterator option interfaces that control async iteration over domain entities:

- **`PostsIteratorOptions`** -- Options for iterating posts, with an optional `limit` on how many posts to yield.
- **`CommentsIteratorOptions`** -- Options for iterating comments, with an optional `postId` to scope to a specific post and an optional `limit`.
- **`NotesIteratorOptions`** -- Options for iterating notes, with an optional `limit` on how many notes to yield.

## For AI Agents

- These types are the **public contract** of the library. Changes here are breaking changes for consumers.
- All interfaces are pure data types with no runtime behavior or side effects.
- The `index.ts` barrel must stay in sync when files are added or removed from this directory.
- `SubstackConfig` is consumed by `SubstackClient` during construction. Iterator options are consumed by domain entity methods (e.g., `profile.posts()`, `post.comments()`).

## Dependencies

- No external runtime dependencies. These are TypeScript-only type definitions.
- The path alias `@substack-api/types` resolves to this directory (configured in `tsconfig.json`).
- Consumers: `SubstackClient`, domain entities in `src/domain/`, and services in `src/internal/services/`.
