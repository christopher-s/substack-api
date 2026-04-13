# API Reference

Complete documentation for the `substack-api` client library, covering all public methods of `SubstackClient`, entity classes, and type definitions.

---

## SubstackClient Class

The main entry point for interacting with the Substack API. Supports both authenticated and anonymous usage.

### Constructor

```typescript
new SubstackClient(config: SubstackConfig)
```

Creates a new `SubstackClient` instance.

**Parameters:**

| Field | Type | Required | Default | Description |
|---|---|---|---|---|
| `publicationUrl` | `string` | Yes | - | Publication base URL (e.g., `'yourpub.substack.com'`) |
| `token` | `string` | No | - | API authentication token. Omit for anonymous read-only access |
| `substackUrl` | `string` | No | `'substack.com'` | Base URL for global Substack endpoints |
| `urlPrefix` | `string` | No | `'api/v1'` | URL prefix for API endpoints |
| `perPage` | `number` | No | `25` | Default items per page for pagination |
| `maxRequestsPerSecond` | `number` | No | `25` | Maximum API requests per second |

**Examples:**

```typescript
import { SubstackClient } from 'substack-api';

// Anonymous read-only access
const client = new SubstackClient({
  publicationUrl: 'example.substack.com'
});

// Authenticated access
const client = new SubstackClient({
  publicationUrl: 'example.substack.com',
  token: process.env.SUBSTACK_TOKEN!
});
```

---

## Authenticated Methods

These methods require a `token` in the `SubstackConfig`. Calling them without authentication throws an `Error`.

### testConnectivity()

```typescript
testConnectivity(): Promise<boolean>
```

Tests API connectivity and authentication status.

**Returns:** `Promise<boolean>` -- `true` if connected successfully, `false` otherwise.

**Example:**

```typescript
const isConnected = await client.testConnectivity();
if (isConnected) {
  console.log('Successfully connected to Substack API');
}
```

### ownProfile()

```typescript
ownProfile(): Promise<OwnProfile>
```

Gets the authenticated user's profile with write capabilities.

**Returns:** `Promise<OwnProfile>` -- Your profile with access to note creation and following.

**Example:**

```typescript
const myProfile = await client.ownProfile();
console.log(`Welcome ${myProfile.name}! (@${myProfile.slug})`);

// Create a note using the builder pattern
const note = await myProfile.newNote()
  .paragraph()
  .text('Just published something amazing!')
  .publish();
console.log(`Note created: ${note.id}`);
```

---

## Entity Lookup Methods

All of these methods work anonymously (no `token` required).

### profileForSlug()

```typescript
profileForSlug(slug: string): Promise<Profile>
```

Gets a profile by username/slug.

**Parameters:**
- `slug` (`string`, required) -- The user's slug/handle (without the `@` symbol).

**Returns:** `Promise<Profile>` -- The user's profile.

**Example:**

```typescript
const profile = await client.profileForSlug('example-user');
console.log(`${profile.name}: ${profile.bio || 'No bio'}`);

for await (const post of profile.posts({ limit: 5 })) {
  console.log(`- ${post.title}`);
}
```

### profileForId()

```typescript
profileForId(id: number): Promise<Profile>
```

Gets a profile by numeric ID.

**Parameters:**
- `id` (`number`, required) -- The user's numeric ID.

**Returns:** `Promise<Profile>` -- The user's profile.

**Example:**

```typescript
const profile = await client.profileForId(12345);
console.log(`Found: ${profile.name} (@${profile.slug})`);
```

### postForId()

```typescript
postForId(id: number): Promise<FullPost>
```

Gets a specific post by numeric ID.

**Parameters:**
- `id` (`number`, required) -- The post's numeric ID.

**Returns:** `Promise<FullPost>` -- The post entity with full HTML content.

**Example:**

```typescript
const post = await client.postForId(98765);
console.log(`Title: ${post.title}`);
console.log(`Published: ${post.publishedAt.toLocaleDateString()}`);

for await (const comment of post.comments({ limit: 10 })) {
  console.log(`Comment: ${comment.body.substring(0, 100)}`);
}
```

### noteForId()

```typescript
noteForId(id: number): Promise<Note>
```

Gets a specific note by numeric ID.

**Parameters:**
- `id` (`number`, required) -- The note's numeric ID.

**Returns:** `Promise<Note>` -- The note entity.

**Example:**

```typescript
const note = await client.noteForId(54321);
console.log(`Note by ${note.author.name}: ${note.body}`);

for await (const comment of note.comments()) {
  console.log(`- ${comment.body}`);
}
```

### commentForId()

```typescript
commentForId(id: number): Promise<Comment>
```

Gets a specific comment by numeric ID.

**Parameters:**
- `id` (`number`, required) -- The comment's numeric ID.

**Returns:** `Promise<Comment>` -- The comment entity.

**Example:**

```typescript
const comment = await client.commentForId(11111);
console.log(`Comment: ${comment.body}`);
if (comment.isAdmin) {
  console.log('(posted by admin)');
}
```

---

## Comment Replies

These methods work anonymously.

### commentReplies()

```typescript
commentReplies(
  commentId: number,
  options?: { cursor?: string }
): Promise<SubstackCommentRepliesResponse>
```

Gets threaded replies to a comment. Use the `cursor` from a previous response to fetch the next page.

**Parameters:**
- `commentId` (`number`, required) -- The parent comment ID.
- `options.cursor` (`string`, optional) -- Pagination cursor from a previous response.

**Returns:** `Promise<SubstackCommentRepliesResponse>` -- Contains reply branches and a `nextCursor` for further pagination.

**Example:**

```typescript
const firstPage = await client.commentReplies(11111);
console.log(`Got ${firstPage.commentBranches.length} reply branches`);

if (firstPage.nextCursor) {
  const nextPage = await client.commentReplies(11111, { cursor: firstPage.nextCursor });
  console.log(`Got ${nextPage.commentBranches.length} more reply branches`);
}
```

### commentRepliesFeed()

```typescript
commentRepliesFeed(
  commentId: number,
  options?: { limit?: number }
): AsyncGenerator<SubstackCommentRepliesResponse>
```

Iterates all replies to a comment via automatic cursor pagination. Yields whole pages so consumers can access both reply branches and pagination metadata.

**Parameters:**
- `commentId` (`number`, required) -- The parent comment ID.
- `options.limit` (`number`, optional) -- Max reply branches to yield across all pages.

**Returns:** `AsyncGenerator<SubstackCommentRepliesResponse>` -- Yields one response per page.

**Example:**

```typescript
for await (const page of client.commentRepliesFeed(11111, { limit: 50 })) {
  for (const branch of page.commentBranches) {
    console.log(`Reply: ${branch.comment.body}`);
  }
}
```

---

## Discovery Methods

All of these methods work anonymously.

### topPosts()

```typescript
topPosts(): Promise<SubstackInboxItem[]>
```

Gets top/trending posts from Substack's homepage feed.

**Returns:** `Promise<SubstackInboxItem[]>` -- Array of inbox items representing trending posts.

**Example:**

```typescript
const posts = await client.topPosts();
for (const item of posts) {
  console.log(item.title || 'Untitled');
}
```

### trending()

```typescript
trending(options?: { limit?: number }): Promise<SubstackTrendingResponse>
```

Gets trending posts with associated publications from the Substack trending endpoint.

**Parameters:**
- `options.limit` (`number`, optional) -- Number of results to return per page.

**Returns:** `Promise<SubstackTrendingResponse>` -- Trending posts and publication data.

**Example:**

```typescript
const result = await client.trending({ limit: 10 });
for (const post of result.posts) {
  console.log(`Trending: ${post.title}`);
}
```

### trendingFeed()

```typescript
trendingFeed(options?: { limit?: number }): AsyncGenerator<SubstackTrendingResponse>
```

Iterates all trending posts via automatic offset pagination. Yields whole pages so consumers can access both posts and publications together.

**Parameters:**
- `options.limit` (`number`, optional) -- Max items per page (passed to API).

**Returns:** `AsyncGenerator<SubstackTrendingResponse>` -- Yields one response per page.

**Example:**

```typescript
for await (const page of client.trendingFeed()) {
  console.log(`Page with ${page.posts.length} trending posts`);
  for (const post of page.posts) {
    console.log(`- ${post.title}`);
  }
}
```

### discoverFeed()

```typescript
discoverFeed(options?: {
  tab?: FeedTab;
  limit?: number;
}): AsyncGenerator<FeedItem>
```

Gets discovery feed items (posts, notes, comments) with automatic cursor pagination.

**Parameters:**
- `options.tab` (`FeedTab`, optional) -- Feed tab to retrieve. Defaults to `'for-you'`.
- `options.limit` (`number`, optional) -- Max items to yield.

**Returns:** `AsyncGenerator<FeedItem>` -- Yields individual feed items.

**Example:**

```typescript
// Get popular posts
for await (const item of client.discoverFeed({ tab: 'popular', limit: 20 })) {
  console.log(`[${item.type}] ${item.entity_key}`);
}

// Get notes
for await (const item of client.discoverFeed({ tab: 'notes', limit: 10 })) {
  console.log(`Note: ${item.entity_key}`);
}
```

### categories()

```typescript
categories(): Promise<Category[]>
```

Gets all content categories with their subcategories.

**Returns:** `Promise<Category[]>` -- Array of category entities.

**Example:**

```typescript
const cats = await client.categories();
for (const cat of cats) {
  console.log(`${cat.name} (${cat.slug})`);
  for (const sub of cat.subcategories) {
    console.log(`  - ${sub.name}`);
  }
}
```

### categoryPublications()

```typescript
categoryPublications(
  categoryId: number | string,
  options?: { limit?: number; offset?: number }
): Promise<{ publications: SubstackCategoryPublication[]; more: boolean }>
```

Gets publications in a given category.

**Parameters:**
- `categoryId` (`number | string`, required) -- Category ID (number) or slug (e.g., `"podcast"`, `"tech"`).
- `options.limit` (`number`, optional) -- Number of results per page (default: 25).
- `options.offset` (`number`, optional) -- Offset for pagination.

**Returns:** `Promise<{ publications: SubstackCategoryPublication[]; more: boolean }>` -- Publications array and a flag indicating whether more results exist.

**Example:**

```typescript
const { publications, more } = await client.categoryPublications('tech', { limit: 10 });
for (const pub of publications) {
  console.log(pub.name);
}
if (more) {
  console.log('More publications available');
}
```

---

## Search Methods

All of these methods work anonymously.

### search()

```typescript
search(
  query: string,
  options?: { limit?: number }
): AsyncGenerator<FeedItem>
```

Searches for posts, people, publications, and notes.

**Parameters:**
- `query` (`string`, required) -- Search query string.
- `options.limit` (`number`, optional) -- Max items to yield.

**Returns:** `AsyncGenerator<FeedItem>` -- Yields individual search result items.

**Example:**

```typescript
for await (const item of client.search('typescript', { limit: 15 })) {
  console.log(`[${item.type}] ${item.entity_key}`);
}
```

### profileSearch()

```typescript
profileSearch(
  query: string,
  options?: { page?: number }
): Promise<{ results: SubstackProfileSearchResult[]; more: boolean }>
```

Searches for user profiles by name or handle. Returns a single page of results.

**Parameters:**
- `query` (`string`, required) -- Search query string.
- `options.page` (`number`, optional) -- Page number (1-based).

**Returns:** `Promise<{ results: SubstackProfileSearchResult[]; more: boolean }>` -- Profile results and a flag indicating whether more pages exist.

**Example:**

```typescript
const { results, more } = await client.profileSearch('john', { page: 1 });
for (const profile of results) {
  console.log(`${profile.name} (@${profile.handle})`);
}
```

### profileSearchAll()

```typescript
profileSearchAll(
  query: string,
  options?: { limit?: number }
): AsyncGenerator<SubstackProfileSearchResult>
```

Iterates all profile search results via automatic page pagination.

**Parameters:**
- `query` (`string`, required) -- Search query string.
- `options.limit` (`number`, optional) -- Max profiles to yield.

**Returns:** `AsyncGenerator<SubstackProfileSearchResult>` -- Yields individual profile results.

**Example:**

```typescript
for await (const profile of client.profileSearchAll('john', { limit: 50 })) {
  console.log(`${profile.name} (@${profile.handle})`);
}
```

### exploreSearch()

```typescript
exploreSearch(options?: {
  tab?: string;
  limit?: number;
}): AsyncGenerator<FeedItem>
```

Explores content using different tabs (alternative to `search()`).

**Parameters:**
- `options.tab` (`string`, optional) -- Explore tab: `'explore'` (default), `'notes'`, `'top'`, or `'for-you'`.
- `options.limit` (`number`, optional) -- Max items to yield.

**Returns:** `AsyncGenerator<FeedItem>` -- Yields individual feed items.

**Example:**

```typescript
for await (const item of client.exploreSearch({ tab: 'notes', limit: 20 })) {
  console.log(`[${item.type}] ${item.entity_key}`);
}
```

---

## Publication Methods

All of these methods work anonymously. They operate on the publication specified by `publicationUrl` in the `SubstackConfig`.

### publicationArchive()

```typescript
publicationArchive(options?: {
  sort?: 'top' | 'new';
  limit?: number;
}): AsyncGenerator<PublicationPost>
```

Gets posts from the configured publication's archive with automatic offset pagination.

**Parameters:**
- `options.sort` (`'top' | 'new'`, optional) -- Sort order. Defaults to `'new'`.
- `options.limit` (`number`, optional) -- Max items to yield.

**Returns:** `AsyncGenerator<PublicationPost>` -- Yields individual publication posts.

**Example:**

```typescript
// Get top posts
for await (const post of client.publicationArchive({ sort: 'top', limit: 10 })) {
  console.log(`${post.title} (${post.publishedAt.toLocaleDateString()})`);
}

// Get newest posts
for await (const post of client.publicationArchive({ sort: 'new', limit: 20 })) {
  console.log(post.title);
}
```

### publicationPosts()

```typescript
publicationPosts(options?: { limit?: number }): AsyncGenerator<PublicationPost>
```

Gets full posts from the configured publication (includes `bodyHtml`). Uses offset-based pagination.

**Parameters:**
- `options.limit` (`number`, optional) -- Max items to yield.

**Returns:** `AsyncGenerator<PublicationPost>` -- Yields publication posts with HTML body content.

**Example:**

```typescript
for await (const post of client.publicationPosts({ limit: 5 })) {
  console.log(`Title: ${post.title}`);
  if (post.bodyHtml) {
    console.log(`Body length: ${post.bodyHtml.length} characters`);
  }
}
```

### publicationHomepage()

```typescript
publicationHomepage(): Promise<PublicationPost[]>
```

Gets recent posts from the configured publication's homepage.

**Returns:** `Promise<PublicationPost[]>` -- Array of recent publication posts.

**Example:**

```typescript
const posts = await client.publicationHomepage();
for (const post of posts) {
  console.log(`${post.title} - ${post.url}`);
}
```

### postReactors()

```typescript
postReactors(postId: number): Promise<SubstackFacepile>
```

Gets users who reacted to a post (facepile data).

**Parameters:**
- `postId` (`number`, required) -- The post ID to get reactors for.

**Returns:** `Promise<SubstackFacepile>` -- Users who reacted to the post.

**Example:**

```typescript
const reactors = await client.postReactors(98765);
console.log(`Post has ${reactors.reactors.length} reactions`);
```

### activeLiveStream()

```typescript
activeLiveStream(publicationId: number): Promise<SubstackLiveStreamResponse>
```

Gets the active live stream for a publication.

**Parameters:**
- `publicationId` (`number`, required) -- The publication ID to check.

**Returns:** `Promise<SubstackLiveStreamResponse>` -- Live stream data, if any is active.

**Example:**

```typescript
const stream = await client.activeLiveStream(12345);
if (stream.video_url) {
  console.log(`Live now: ${stream.video_url}`);
}
```

### markPostSeen()

```typescript
markPostSeen(postId: number): Promise<void>
```

Marks a post as seen.

**Parameters:**
- `postId` (`number`, required) -- The post ID to mark as seen.

**Returns:** `Promise<void>`.

**Example:**

```typescript
await client.markPostSeen(98765);
console.log('Post marked as seen');
```

---

## Profile Feed Methods

All of these methods work anonymously.

### profileActivity()

```typescript
profileActivity(
  profileId: number,
  options?: { tab?: ProfileFeedTab; limit?: number }
): AsyncGenerator<FeedItem>
```

Gets a profile's activity feed (posts, notes, comments, or likes).

**Parameters:**
- `profileId` (`number`, required) -- The profile ID.
- `options.tab` (`ProfileFeedTab`, optional) -- Filter by content type: `'posts'`, `'notes'`, `'comments'`, or `'likes'`.
- `options.limit` (`number`, optional) -- Max items to yield.

**Returns:** `AsyncGenerator<FeedItem>` -- Yields individual feed items.

**Example:**

```typescript
// Get a user's recent posts
for await (const item of client.profileActivity(12345, { tab: 'posts', limit: 10 })) {
  console.log(`[${item.type}] ${item.entity_key}`);
}

// Get their notes
for await (const item of client.profileActivity(12345, { tab: 'notes', limit: 10 })) {
  console.log(`Note: ${item.entity_key}`);
}
```

### profileLikes()

```typescript
profileLikes(
  profileId: number,
  options?: { limit?: number }
): AsyncGenerator<FeedItem>
```

Gets a profile's likes feed.

**Parameters:**
- `profileId` (`number`, required) -- The profile ID.
- `options.limit` (`number`, optional) -- Max items to yield.

**Returns:** `AsyncGenerator<FeedItem>` -- Yields individual liked items.

**Example:**

```typescript
for await (const item of client.profileLikes(12345, { limit: 20 })) {
  console.log(`[${item.type}] ${item.entity_key}`);
}
```

### publicationFeed()

```typescript
publicationFeed(
  publicationId: number,
  options?: { tab?: string; limit?: number }
): AsyncGenerator<FeedItem>
```

Gets a publication's activity feed (posts, notes).

**Parameters:**
- `publicationId` (`number`, required) -- The publication ID.
- `options.tab` (`string`, optional) -- Feed tab (e.g., `'posts'`).
- `options.limit` (`number`, optional) -- Max items to yield.

**Returns:** `AsyncGenerator<FeedItem>` -- Yields individual feed items.

**Example:**

```typescript
for await (const item of client.publicationFeed(12345, { tab: 'posts', limit: 10 })) {
  console.log(`[${item.type}] ${item.entity_key}`);
}
```

---

## Entity Classes

### Profile

Represents a user profile with read-only access to their public content.

#### Properties

| Property | Type | Description |
|---|---|---|
| `id` | `number` | Unique user ID |
| `name` | `string` | Display name |
| `slug` | `string` | Resolved slug/handle (may differ from `handle`) |
| `handle` | `string` | Original handle from the API |
| `url` | `string` | Profile URL (e.g., `https://substack.com/@handle`) |
| `avatarUrl` | `string` | Avatar image URL |
| `bio` | `string \| undefined` | User biography |

#### Methods

##### posts()

```typescript
posts(options?: { limit?: number }): AsyncIterable<PreviewPost>
```

Iterates through the profile's published posts with automatic pagination. Yields `PreviewPost` entities with truncated content. Use `previewPost.fullPost()` to fetch the complete post.

**Example:**

```typescript
const profile = await client.profileForSlug('example-user');

for await (const post of profile.posts({ limit: 10 })) {
  console.log(post.title);
}
```

##### notes()

```typescript
notes(options?: { limit?: number }): AsyncIterable<Note>
```

Iterates through the profile's notes.

**Example:**

```typescript
for await (const note of profile.notes({ limit: 5 })) {
  console.log(`${note.author.name}: ${note.body.substring(0, 80)}`);
}
```

---

### OwnProfile

Extends `Profile` with write capabilities for the authenticated user.

#### Additional Methods

##### newNote()

```typescript
newNote(): NoteBuilder
```

Creates a new note using the builder pattern. Requires authentication.

**Example:**

```typescript
const myProfile = await client.ownProfile();

// Simple note
const note = await myProfile.newNote()
  .paragraph()
  .text('Just shipped a new feature!')
  .publish();

// Formatted note
const formattedNote = await myProfile.newNote()
  .paragraph()
  .bold('Breaking: ')
  .text('Something important happened.')
  .paragraph()
  .link('Read more', 'https://example.com')
  .publish();
```

##### newNoteWithLink()

```typescript
newNoteWithLink(link: string): NoteWithLinkBuilder
```

Creates a new note with a link attachment. Requires authentication.

**Parameters:**
- `link` (`string`, required) -- URL to attach to the note.

**Example:**

```typescript
const note = await myProfile.newNoteWithLink('https://example.com/article')
  .paragraph()
  .text('Great read on TypeScript patterns.')
  .publish();
```

##### following()

```typescript
following(options?: { limit?: number }): AsyncIterable<Profile>
```

Iterates through profiles the authenticated user follows. Individual profile fetch failures are silently skipped -- the yielded list may be shorter than the actual following count.

**Example:**

```typescript
const myProfile = await client.ownProfile();

for await (const followed of myProfile.following({ limit: 50 })) {
  console.log(`Following: ${followed.name} (@${followed.slug})`);
}
```

##### posts()

Inherited from `Profile`. See [Profile.posts()](#posts).

##### notes()

Overrides `Profile.notes()` to fetch the authenticated user's own notes.

---

### FullPost

Represents a Substack post with complete HTML content. Returned by `client.postForId()` and `previewPost.fullPost()`.

#### Properties

| Property | Type | Description |
|---|---|---|
| `id` | `number` | Post ID |
| `title` | `string` | Post title |
| `subtitle` | `string` | Post subtitle |
| `body` | `string` | Post body (HTML or truncated text) |
| `truncatedBody` | `string` | Truncated body text |
| `htmlBody` | `string` | Full HTML body content |
| `slug` | `string` | URL slug |
| `url` | `string` | Canonical URL |
| `likesCount` | `number` | Number of likes/reactions |
| `publishedAt` | `Date` | Publication date |
| `createdAt` | `Date` | Creation date |
| `coverImage` | `string \| undefined` | Cover image URL |
| `reactions` | `Record<string, number> \| undefined` | Reaction counts by type |
| `restacks` | `number \| undefined` | Number of restacks |
| `postTags` | `string[] \| undefined` | Post tags |
| `author` | `{ id: number; name: string; handle: string; avatarUrl: string }` | Post author |

#### Methods

##### comments()

```typescript
comments(options?: { limit?: number }): AsyncIterable<Comment>
```

Iterates through comments on this post.

**Example:**

```typescript
const post = await client.postForId(98765);

for await (const comment of post.comments({ limit: 20 })) {
  console.log(`[${comment.id}] ${comment.body.substring(0, 100)}`);
}
```

> **Note:** FullPost also has `like()` and `addComment()` methods, but these currently throw an error ("not supported by this version of the API"). They are reserved for future use.

---

### PreviewPost

Represents a post with truncated content, typically returned by `Profile.posts()`. Has the same core properties as `FullPost` (id, title, subtitle, body, truncatedBody, likesCount, author, publishedAt) but lacks the extended fields (htmlBody, slug, url, coverImage, reactions, restacks, postTags, createdAt).

#### Additional Methods

##### fullPost()

```typescript
fullPost(): Promise<FullPost>
```

Fetches the complete post data with full HTML body content.

**Example:**

```typescript
for await (const preview of profile.posts({ limit: 5 })) {
  console.log(`Preview: ${preview.title}`);
  const full = await preview.fullPost();
  console.log(`HTML body: ${full.htmlBody.length} characters`);
}
```

---

### Note

Represents a Substack note (short-form post).

#### Properties

| Property | Type | Description |
|---|---|---|
| `id` | `string` | Note entity key |
| `body` | `string` | Note body text |
| `likesCount` | `number` | Number of likes |
| `publishedAt` | `Date` | Publication timestamp |
| `author` | `{ id: number; name: string; handle: string; avatarUrl: string }` | Note author |

#### Methods

##### comments()

```typescript
comments(): AsyncIterable<Comment>
```

Iterates through parent comments on this note.

**Example:**

```typescript
const note = await client.noteForId(54321);
for await (const comment of note.comments()) {
  console.log(`- ${comment.body}`);
}
```

> **Note:** Note also has `like()` and `addComment()` methods, but these currently throw an error ("not supported by this version of the API"). They are reserved for future use.

---

### Comment

Represents a comment on a post or note.

#### Properties

| Property | Type | Description |
|---|---|---|
| `id` | `number` | Comment ID |
| `body` | `string` | Comment body text |
| `isAdmin` | `boolean \| undefined` | Whether the commenter is an admin |
| `likesCount` | `number \| undefined` | Number of likes |

---

### Category

Represents a Substack content category (e.g., "Culture", "Technology").

#### Properties

| Property | Type | Description |
|---|---|---|
| `id` | `number` | Category ID |
| `name` | `string` | Category display name |
| `slug` | `string` | URL slug |
| `rank` | `number` | Sort rank |
| `subcategories` | `ReadonlyArray<{ id: number; name: string; slug: string; rank: number }>` | Nested subcategories |

---

### PublicationPost

Represents a post from a publication archive, homepage, or full posts endpoint. Returned by `publicationArchive()`, `publicationPosts()`, and `publicationHomepage()`.

#### Properties

| Property | Type | Description |
|---|---|---|
| `id` | `number` | Post ID |
| `title` | `string` | Post title |
| `subtitle` | `string` | Post subtitle |
| `slug` | `string` | URL slug |
| `url` | `string` | Canonical URL |
| `publishedAt` | `Date` | Publication date |
| `coverImage` | `string \| undefined` | Cover image URL |
| `audience` | `string` | Audience type (default: `'everyone'`) |
| `reactions` | `Record<string, number> \| undefined` | Reaction counts by type |
| `restacks` | `number \| undefined` | Number of restacks |
| `sectionName` | `string \| undefined` | Section name within the publication |
| `bodyHtml` | `string \| undefined` | Full HTML body (available via `publicationPosts()`) |

---

## NoteBuilder

The `NoteBuilder` provides a fluent API for constructing formatted notes with rich text. Obtain an instance via `ownProfile.newNote()` or `ownProfile.newNoteWithLink(url)`.

### Building Flow

```
NoteBuilder
  -> .paragraph() -> ParagraphBuilder
    -> .text() / .bold() / .italic() / .code() / .underline() / .link()
    -> .bulletList() / .numberedList() -> ListBuilder
      -> .item() -> ListItemBuilder
        -> .text() / .bold() / .italic() / .code() / .underline() / .link()
        -> .item() (next item) / .finish() (back to paragraph)
    -> .paragraph() (next paragraph) / .build() / .publish()
```

### ParagraphBuilder Methods

| Method | Returns | Description |
|---|---|---|
| `text(text: string)` | `ParagraphBuilder` | Add plain text |
| `bold(text: string)` | `ParagraphBuilder` | Add bold text |
| `italic(text: string)` | `ParagraphBuilder` | Add italic text |
| `code(text: string)` | `ParagraphBuilder` | Add inline code |
| `underline(text: string)` | `ParagraphBuilder` | Add underlined text |
| `link(text: string, url: string)` | `ParagraphBuilder` | Add a hyperlink |
| `bulletList()` | `ListBuilder` | Start a bullet list |
| `numberedList()` | `ListBuilder` | Start a numbered list |
| `paragraph()` | `ParagraphBuilder` | Commit this paragraph and start a new one |
| `build()` | `PublishNoteRequest` | Build and validate the note request |
| `publish()` | `Promise<PublishNoteResponse>` | Build and publish the note |

### ListBuilder Methods

| Method | Returns | Description |
|---|---|---|
| `item()` | `ListItemBuilder` | Start a new list item |

### ListItemBuilder Methods

| Method | Returns | Description |
|---|---|---|
| `text(text: string)` | `ListItemBuilder` | Add plain text |
| `bold(text: string)` | `ListItemBuilder` | Add bold text |
| `italic(text: string)` | `ListItemBuilder` | Add italic text |
| `code(text: string)` | `ListItemBuilder` | Add inline code |
| `underline(text: string)` | `ListItemBuilder` | Add underlined text |
| `link(text: string, url: string)` | `ListItemBuilder` | Add a hyperlink |
| `item()` | `ListItemBuilder` | Commit this item and start a new one |
| `finish()` | `ParagraphBuilder` | Commit this item and return to paragraph |

### Complete Example

```typescript
const myProfile = await client.ownProfile();

const note = await myProfile.newNote()
  .paragraph()
    .bold('Weekly Update')
    .text(' - Here is what shipped this week:')
  .paragraph()
    .bulletList()
      .item()
        .text('New ')
        .bold('search')
        .text(' endpoint')
      .item()
        .text('Fixed pagination in ')
        .code('discoverFeed()')
      .finish()
  .paragraph()
    .text('Full changelog: ')
    .link('GitHub', 'https://github.com/example/repo')
  .publish();

console.log(`Published note: ${note.id}`);
```

---

## Type Definitions

### SubstackConfig

```typescript
interface SubstackConfig {
  publicationUrl: string           // Publication base URL (required)
  token?: string                   // API token — omit for anonymous read-only access
  substackUrl?: string             // Global Substack base URL (default: 'substack.com')
  urlPrefix?: string               // API URL prefix (default: 'api/v1')
  perPage?: number                 // Items per page (default: 25)
  maxRequestsPerSecond?: number    // Rate limit (default: 25)
}
```

### FeedTab

```typescript
type FeedTab = 'for-you' | 'top' | 'popular' | 'catchup' | 'notes' | 'explore'
```

Tab filter for `discoverFeed()`. Defaults to `'for-you'`.

### ProfileFeedTab

```typescript
type ProfileFeedTab = 'posts' | 'notes' | 'comments' | 'likes'
```

Content type filter for `profileActivity()`.

### FeedItem

```typescript
interface FeedItem {
  type: string           // Item type discriminator (e.g., 'post', 'comment')
  entity_key: string     // Unique item identifier
  [key: string]: unknown // Additional properties vary by item type
}
```

Heterogeneous feed item returned by `discoverFeed()`, `search()`, `exploreSearch()`, `profileActivity()`, `profileLikes()`, and `publicationFeed()`. Inspect the `type` field to determine the item kind.

---

## Async Iteration Patterns

The client uses async iterators for seamless pagination handling. All methods returning `AsyncGenerator` or `AsyncIterable` follow the same patterns.

### Limited Iteration

```typescript
// Process up to 20 items
for await (const item of client.discoverFeed({ limit: 20 })) {
  console.log(item.entity_key);
}
```

### Early Break

```typescript
// Stop as soon as you find what you need
for await (const post of client.publicationArchive({ sort: 'new' })) {
  console.log(post.title);
  if (post.title.includes('IMPORTANT')) {
    break;
  }
}
```

### Collecting Results

```typescript
const recentPosts = await client.publicationHomepage();
console.log(`Collected ${recentPosts.length} posts`);
```

### Nested Iteration

```typescript
const profile = await client.profileForSlug('example-user');

for await (const post of profile.posts({ limit: 5 })) {
  console.log(`\n${post.title}`);

  const full = await post.fullPost();
  for await (const comment of full.comments({ limit: 3 })) {
    console.log(`  Comment: ${comment.body.substring(0, 80)}`);
  }
}
```

---

## Error Handling

All client methods throw `Error` on failure. Wrap calls in try-catch blocks.

```typescript
try {
  const profile = await client.ownProfile();
  const note = await profile.newNote()
    .paragraph()
    .text('My first note!')
    .publish();
  console.log(`Note created: ${note.id}`);
} catch (error) {
  if ((error as Error).message.includes('Authentication required')) {
    console.error('Missing API token');
  } else if ((error as Error).message.includes('not found')) {
    console.error('Resource not found:', (error as Error).message);
  } else {
    console.error('Unexpected error:', (error as Error).message);
  }
}
```

---

## Best Practices

### Authentication

Use environment variables for the API token. Omit the token entirely for anonymous read-only access.

```typescript
// Authenticated
const client = new SubstackClient({
  publicationUrl: 'example.substack.com',
  token: process.env.SUBSTACK_TOKEN
});

// Anonymous read-only
const client = new SubstackClient({
  publicationUrl: 'example.substack.com'
});
```

### Pagination

Use the `limit` option to cap results. Break early when you find what you need.

```typescript
// Efficient: limited and early-exit
for await (const item of client.search('typescript', { limit: 50 })) {
  if (item.type === 'post') {
    console.log('Found a post:', item.entity_key);
    break;
  }
}
```

### Performance

Process items as they arrive rather than collecting everything first.

```typescript
// Efficient: stream processing
for await (const post of client.publicationArchive({ limit: 100 })) {
  await processPost(post); // Process immediately
}

// Less efficient: load all, then process
const allPosts: PublicationPost[] = [];
for await (const post of client.publicationArchive()) {
  allPosts.push(post);
}
allPosts.forEach(processPost);
```
