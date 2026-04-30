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
- **Chat API** — Direct messages, inbox management, and publication chat rooms
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

## Markdown Support

The library includes built-in markdown-to-HTML and markdown-to-ProseMirror converters for publishing content:

```typescript
import { markdownToHtml, markdownToNoteBody } from 'substack-api';

// Convert markdown to HTML (for posts/drafts)
const html = markdownToHtml('**bold** and *italic*');

// Convert markdown to ProseMirror JSON (for notes)
const body = markdownToNoteBody('**bold** and *italic*');
```

Supported formatting: bold, italic, strikethrough, code, links, headings, lists (bullet and ordered, with nesting), blockquotes, code blocks, and horizontal rules.

### Create a draft from markdown

```typescript
const client = new SubstackClient({
  publicationUrl: 'https://yourpub.substack.com',
  token: process.env.SUBSTACK_API_KEY!,
});

const result = await client.createDraftFromMarkdown(
  '# My Post\n\nThis is **bold** text with `code`.\n\n- Item 1\n- Item 2',
  { title: 'Draft from Markdown' }
);
```

### Publish a note from markdown

```typescript
const me = await client.ownProfile();

await me
  .newNote()
  .markdown('Check out this **bold** take!\n\n- Point one\n- Point two')
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
- **Markdown adapters** — Convert standard markdown to HTML or ProseMirror JSON for posts and notes
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

### Browsing & Discovery (anonymous)

| Method | Description |
|---|---|
| `client.topPosts()` | Trending posts from the homepage feed |
| `client.profileForSlug(slug)` | Public profile by handle |
| `client.profileForId(id)` | Public profile by user ID |
| `client.postForId(id)` | Post details and comments |
| `client.noteForId(id)` | Note by ID |
| `client.commentForId(id)` | Comment by ID |
| `client.search(query, options?)` | Full-text search (posts, people, publications, notes) |
| `client.profileSearch(query)` | Search user profiles |
| `client.exploreSearch(options)` | Explore feed with tab filtering |
| `client.discoverFeed(options)` | Discovery feed with tab selection |
| `client.activityFeed(options)` | Authenticated activity feed with tabs |
| `client.categories()` | All content categories |
| `client.categoryPublications(id)` | Publications in a category |

### Publication Content (anonymous)

| Method | Description |
|---|---|
| `client.publicationArchive(options)` | Publication post archive (async iterator) |
| `client.publicationPosts(options)` | Full posts with body HTML (async iterator) |
| `client.publicationHomepage()` | Recent homepage posts |
| `client.postReactors(postId)` | Users who reacted to a post |
| `client.activeLiveStream(pubId)` | Active live stream for a publication |

### Feed Iterators (anonymous)

| Method | Description |
|---|---|
| `client.profileActivity(id, options)` | Profile activity feed (posts, notes, comments, likes) |
| `client.profileLikes(id, options)` | Posts liked by a profile |
| `client.publicationFeed(id, options)` | Publication activity feed |
| `client.commentRepliesFeed(id, options)` | Paginated comment replies |

### Authenticated — Writing

| Method | Description |
|---|---|
| `client.ownProfile()` | Get authenticated profile with write access |
| `me.newNote()` | Start building a note (fluent builder) |
| `me.newNoteWithLink(url)` | Start building a note with link attachment |
| `client.createDraft(data)` | Create a draft post |
| `client.createDraftFromMarkdown(md, opts)` | Create a draft from markdown content |
| `client.updateDraft(id, data)` | Update an existing draft |
| `client.publishDraft(id)` | Publish a draft |
| `client.deleteDraft(id)` | Delete a draft |
| `client.createComment(postId, body)` | Post a comment |
| `client.deleteComment(id)` | Delete a comment |

### Authenticated — Account & Content

| Method | Description |
|---|---|
| `client.testConnectivity()` | Verify API token works |
| `client.publishedPosts(options)` | Your published posts |
| `client.drafts(options)` | List your drafts |
| `client.scheduledPosts(options)` | List scheduled posts |
| `client.postCounts(query)` | Post statistics |
| `client.draft(id)` | Get a specific draft |
| `client.notesFeed(options)` | Your notes feed |
| `client.noteStats(entityKey)` | Note analytics (impressions, interactions) |

### Authenticated — Publication Management

| Method | Description |
|---|---|
| `client.publicationDetails()` | Publication metadata |
| `client.publicationTags()` | Publication tags |
| `client.liveStreams(status)` | Live streams |
| `client.eligibleHosts(pubId)` | Eligible chat hosts |
| `client.subscription()` | Current subscription |

### Authenticated — Dashboard & Analytics

| Method | Description |
|---|---|
| `client.dashboardSummary(options)` | Dashboard overview stats |
| `client.emailsTimeseries(options)` | Email timeseries data |
| `client.unreadActivity()` | Unread activity count |
| `client.unreadMessageCount()` | Unread message count |
| `client.subscriberStats()` | Subscriber statistics |
| `client.growthSources(options)` | Growth source breakdown |
| `client.growthTimeseries(data)` | Growth over time |
| `client.networkAttribution(options)` | Network attribution stats |
| `client.followerTimeseries(options)` | Follower growth data |

### Authenticated — Recommendations

| Method | Description |
|---|---|
| `client.outgoingRecommendations(pubId)` | Your outgoing recommendations |
| `client.outgoingRecommendationStats()` | Recommendation statistics |
| `client.incomingRecommendationStats()` | Incoming recommendation stats |
| `client.recommendationsExist()` | Check if recommendations are set up |
| `client.suggestedRecommendations(pubId)` | Suggested publications to recommend |

### Authenticated — Chat

| Method | Description |
|---|---|
| `client.chatUnreadCount()` | Unread chat message count |
| `client.chatInbox(options)` | Chat inbox threads |
| `client.chatInboxThreads(options)` | Paginated inbox threads |
| `client.chatDm(uuid, options)` | Direct message thread |
| `client.chatDmMessages(uuid, options)` | Paginated DM messages |
| `client.chatSendMessage(uuid, body)` | Send a chat message |
| `client.chatInvites()` | Pending chat invites |
| `client.chatReactions()` | Chat reactions |

See the [docs site](https://christopher-s.github.io/substack-api/) for the complete OpenAPI endpoint inventory.

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
