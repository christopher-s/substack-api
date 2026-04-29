# Substack API

[![npm version](https://badge.fury.io/js/substack-api.svg)](https://badge.fury.io/js/substack-api)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)

A modern, type-safe TypeScript client for the Substack API. Browse publications, fetch posts and comments, search content, and publish notes — all through a clean, entity-based interface.

## Origins

This project started as a fork of [`jakub-k-slys/substack-api`](https://github.com/jakub-k-slys/substack-api) and has since evolved into an independently maintained library with its own architecture, testing strategy, and release cadence. While the original provided a solid foundation, this version introduces a modern entity-based API, comprehensive OpenAPI specification, async iterator pagination, a note builder for rich content, runtime type validation with io-ts, and extensive test coverage across unit, integration, end-to-end, and live API validation layers.

## Features

- **Anonymous & Authenticated** — Read public content without a token; authenticate with a `substack.sid` cookie for write access
- **Entity-Based API** — Navigate naturally: `profile.posts()`, `post.comments()`, `ownProfile.notes()`
- **Async Iterators** — Built-in pagination with `for await...of`, no manual cursor handling
- **Note Builder** — Rich text notes with formatting, lists, links, and link attachments via a fluent builder API
- **Discovery & Search** — Trending posts, category browsing, profile search, and explore feeds
- **Runtime Type Safety** — io-ts codecs validate every API response beyond TypeScript's compile-time checks
- **Rate Limiting** — Configurable client-side request throttling
- **Full TypeScript** — Complete type definitions exported for consumers

## Installation

```bash
pnpm add substack-api
# or
npm install substack-api
# or
yarn add substack-api
```

Requires Node.js 18 or higher.

## Quickstart

### Anonymous usage (no token required)

```typescript
import { SubstackClient } from 'substack-api';

const client = new SubstackClient({});

// Browse trending content
const trending = await client.topPosts();

// Search profiles
const results = await client.profileSearch('technology');

// Fetch a public profile and iterate their posts
const profile = await client.profileForSlug('platformer');
for await (const post of profile.posts({ limit: 5 })) {
  console.log(`📄 ${post.title} — ${post.publishedAt.toLocaleDateString()}`);
}

// Get post details and comments
const post = await client.postForId(123456);
for await (const comment of post.comments({ limit: 10 })) {
  console.log(`💬 ${comment.name}: ${comment.body}`);
}
```

### Authenticated usage

```typescript
const client = new SubstackClient({
  publicationUrl: 'https://yourpub.substack.com',
  token: process.env.SUBSTACK_API_KEY!,
});

// Verify connectivity
const connected = await client.testConnectivity();

// Get your profile with write capabilities
const me = await client.ownProfile();

// List your recent posts
for await (const post of me.posts({ limit: 10 })) {
  console.log(post.title);
}

// Publish a note with rich formatting
await me
  .newNote()
  .paragraph()
  .text('Hello ')
  .bold('world')
  .text('!')
  .paragraph()
  .text('Check out this ')
  .link('article', 'https://example.com')
  .publish();

// Publish a note with a link attachment
await me
  .newNoteWithLink('https://example.com/article')
  .paragraph()
  .text('Sharing something interesting:')
  .publish();
```

## Architecture

The client follows a service-oriented architecture with domain models:

```
SubstackClient
├── services/          # HTTP business logic (posts, notes, profiles, comments, discovery, publications)
├── domain/            # Entity classes with methods (Profile, Post, Note, Comment, OwnProfile)
├── internal/http-client.ts   # HTTP abstraction with auth, rate limiting, and error handling
└── internal/types/    # io-ts codecs for runtime validation
```

Key patterns:

- **Entity navigation** — Domain objects expose related data as methods (`profile.posts()`, `post.comments()`)
- **Async iterators** — Pagination is transparent; `for await...of` handles cursors automatically
- **Builder pattern** — `NoteBuilder` constructs rich ProseMirror document trees for publishing
- **Functional validation** — io-ts codecs decode API responses with detailed error messages

## Examples

### Browse a publication archive

```typescript
const client = new SubstackClient({
  publicationUrl: 'https://stratechery.substack.com',
});

for await (const post of client.publicationArchive({ limit: 20 })) {
  console.log(`${post.title} — ${post.publishedAt.toLocaleDateString()}`);
}
```

### Search and explore

```typescript
const client = new SubstackClient({});

// Full-text search across posts, people, publications, and notes
for await (const item of client.search('artificial intelligence', { limit: 20 })) {
  if (item.type === 'post') {
    console.log(`📝 ${item.post.title}`);
  }
}

// Browse categories
const categories = await client.categories();
const techPubs = await client.categoryPublications('technology', { limit: 10 });
```

### Comment threads

```typescript
const post = await client.postForId(123456);

for await (const comment of post.comments({ limit: 5 })) {
  console.log(`${comment.name}: ${comment.body}`);

  // Fetch replies
  const replies = await client.commentReplies(comment.id);
  for (const branch of replies.commentBranches) {
    console.log(`  ↳ ${branch.comments[0]?.name}: ${branch.comments[0]?.body}`);
  }
}
```

### Publish a note with a link attachment

```typescript
const me = await client.ownProfile();

await me
  .newNoteWithLink('https://example.com/article')
  .paragraph()
  .text('Check out this interesting read:')
  .publish();
```

## Authentication

Substack uses session cookies for authentication. To obtain your token:

1. Log in to [substack.com](https://substack.com) in your browser
2. Open Developer Tools (F12) → Application/Storage → Cookies → `https://substack.com`
3. Copy the value of the `substack.sid` cookie
4. Pass it as the `token` in `SubstackConfig`

**Never commit your token.** Use environment variables or repository secrets in CI.

## Configuration

| Option | Type | Required | Default | Description |
|---|---|---|---|---|
| `publicationUrl` | `string` | No* | — | Publication base URL (e.g. `https://yourpub.substack.com`). Required for publication-scoped methods |
| `token` | `string` | No | — | `substack.sid` cookie value. Omit for anonymous read-only access |
| `substackUrl` | `string` | No | `substack.com` | Base URL for global Substack endpoints |
| `urlPrefix` | `string` | No | `api/v1` | URL prefix for API endpoints |
| `perPage` | `number` | No | `25` | Default items per page for pagination |
| `maxRequestsPerSecond` | `number` | No | `25` | Client-side rate limit |

\* Required when using publication-scoped methods like `publicationArchive()`, `publicationPosts()`, `publicationHomepage()`, `postReactors()`, `activeLiveStream()`, `markPostSeen()`, etc. `ownProfile()` only requires a `token`.

## API Reference

🌐 **Interactive API documentation** is available at [https://christopher-s.github.io/substack-api/](https://christopher-s.github.io/substack-api/)

The site renders the OpenAPI 3.1 specification with Scalar, allowing you to browse every endpoint, parameter, and response shape.

Key client methods:

| Method | Description |
|---|---|
| `client.topPosts()` | Trending posts from the homepage feed |
| `client.profileForSlug(slug)` | Public profile with posts, comments, notes |
| `client.postForId(id)` | Post details and comments |
| `client.search(query)` | Full-text search across posts, people, publications, notes |
| `client.ownProfile()` | Authenticated profile with write access |
| `me.newNote()` | Publish a note via the fluent builder API |

See the docs site for the complete endpoint inventory.

## Testing

The project uses a four-tier testing strategy:

| Tier | Command | Purpose |
|---|---|---|
| Unit | `pnpm test:unit` | Fast tests with mocked HTTP responses |
| Integration | `pnpm test:integration` | Entity interactions against local test server |
| E2E | `pnpm test:e2e` | Live API calls (requires credentials) |
| Live Validation | `pnpm test:unit --testPathPattern=live-api-validation` | Probes real endpoints for schema drift |

Run all tests:

```bash
pnpm test
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup, testing guidelines, and pull request process.

## License

MIT
