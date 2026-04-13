# Entity Model Documentation

The Substack API client provides an object-oriented entity model for navigating profiles, posts, notes, comments, categories, and publications. This guide covers all entity types, their properties, and their methods.

## Overview

The entity model provides:
- **Fluent Navigation** -- Navigate relationships naturally (`profile.posts()`, `post.comments()`)
- **Async Iteration** -- Seamless pagination with `for await` loops
- **Type Safety** -- Full TypeScript support with entity classes
- **Note Builder** -- Rich note creation via the builder pattern
- **Anonymous Access** -- Most read operations work without authentication

## Configuration

```typescript
import { SubstackClient } from 'substack-api';

// Authenticated usage (full access)
const client = new SubstackClient({
  publicationUrl: 'https://yourpub.substack.com',
  token: 'your-connect-sid-cookie-value'
});

// Anonymous usage (read-only, no token needed)
const anonymousClient = new SubstackClient({
  publicationUrl: 'https://yourpub.substack.com'
});
```

### SubstackConfig

| Property | Type | Required | Default | Description |
|---|---|---|---|---|
| `publicationUrl` | `string` | **Yes** | -- | Publication base URL (e.g., `'https://yourpub.substack.com'`) |
| `token` | `string` | No | `undefined` | API token; omit for anonymous read-only access |
| `substackUrl` | `string` | No | `'substack.com'` | Base URL for global Substack endpoints |
| `urlPrefix` | `string` | No | `'api/v1'` | URL prefix for API endpoints |
| `perPage` | `number` | No | `25` | Default items per page for pagination |
| `maxRequestsPerSecond` | `number` | No | `25` | Rate limiting for API requests |

## Profile Entities

Profiles represent Substack users. There are two types: the read-only `Profile` for other users, and `OwnProfile` for the authenticated user with write capabilities.

### Profile (Read-Only)

Standard profile for browsing a user's content. Obtained via `client.profileForSlug()` or `client.profileForId()`.

#### Properties

```typescript
class Profile {
  readonly id: number            // Unique user ID
  readonly name: string          // Display name
  readonly slug: string          // Resolved username/handle
  readonly handle: string        // Username/handle
  readonly url: string           // Profile URL (https://substack.com/@handle)
  readonly avatarUrl: string     // Profile photo URL
  readonly bio?: string          // Profile bio (may be undefined)
}
```

#### Getting Profiles

```typescript
// Get profile by username/slug (anonymous)
const profile = await client.profileForSlug('example-user');
console.log(`${profile.name} (@${profile.slug})`);
console.log(`Bio: ${profile.bio ?? 'No bio available'}`);

// Get profile by numeric ID (anonymous)
const profileById = await client.profileForId(12345);
console.log(`Found: ${profileById.name}`);
```

#### Methods

##### `posts(options?)`

Iterate the profile's posts. Yields `PreviewPost` objects with automatic pagination.

```typescript
posts(options?: { limit?: number }): AsyncIterable<PreviewPost>
```

```typescript
// Get all posts
for await (const post of profile.posts()) {
  console.log(`${post.title}`);
}

// Limit results
for await (const post of profile.posts({ limit: 10 })) {
  console.log(`- ${post.title}`);
}
```

##### `notes(options?)`

Iterate the profile's notes. Yields `Note` objects with cursor-based pagination.

```typescript
notes(options?: { limit?: number }): AsyncIterable<Note>
```

```typescript
for await (const note of profile.notes({ limit: 20 })) {
  console.log(`${note.body.substring(0, 100)}...`);
  console.log(`Likes: ${note.likesCount}`);
}
```

### OwnProfile (Authenticated)

Your authenticated profile with additional capabilities for content creation and following management. Obtained via `client.ownProfile()` (requires token).

OwnProfile extends Profile, so it inherits all Profile properties and the `posts()` method. It overrides `notes()` and adds additional methods.

#### Getting Your Profile

```typescript
const myProfile = await client.ownProfile();
console.log(`Welcome ${myProfile.name}!`);
```

#### Additional Methods

##### `newNote()`

Create a note using the builder pattern. Returns a `NoteBuilder` for constructing rich-formatted notes.

```typescript
newNote(): NoteBuilder
```

```typescript
const note = await myProfile.newNote()
  .paragraph()
  .text('Just shipped a new feature! ')
  .bold('Exciting times ahead.')
  .publish();
```

See the [NoteBuilder](#notebuilder) section below for full details.

##### `newNoteWithLink(link)`

Create a note with an attached link preview using the builder pattern.

```typescript
newNoteWithLink(link: string): NoteWithLinkBuilder
```

```typescript
const noteWithLink = await myProfile.newNoteWithLink('https://example.com/article')
  .paragraph()
  .text('Great read on distributed systems.')
  .publish();
```

##### `following(options?)`

Iterate users that the authenticated user follows. Individual profile fetch failures are silently skipped.

```typescript
following(options?: { limit?: number }): AsyncIterable<Profile>
```

```typescript
for await (const user of myProfile.following({ limit: 50 })) {
  console.log(`- ${user.name} (@${user.slug})`);
}
```

##### `notes(options?)`

Iterate the authenticated user's own notes. Yields `Note` objects.

```typescript
notes(options?: { limit?: number }): AsyncIterable<Note>
```

## Post Entities

Posts represent long-form content like articles and newsletters. There are three post types: `PreviewPost` (from profile iteration), `FullPost` (from `client.postForId()`), and `PublicationPost` (from publication endpoints).

### PreviewPost

Lightweight post returned by `profile.posts()`. Contains truncated body text and basic metadata. Use `fullPost()` to retrieve the complete HTML content.

#### Properties

```typescript
class PreviewPost {
  readonly id: number
  readonly title: string
  readonly subtitle: string
  readonly body: string              // Same as truncatedBody
  readonly truncatedBody: string     // Truncated plain text
  readonly likesCount: number        // Reaction count
  readonly author: {
    id: number
    name: string
    handle: string
    avatarUrl: string
  }
  readonly publishedAt: Date
}
```

#### Methods

##### `comments(options?)`

Iterate comments on this post. Yields `Comment` objects.

```typescript
comments(options?: { limit?: number }): AsyncIterable<Comment>
```

```typescript
for await (const comment of post.comments({ limit: 5 })) {
  console.log(`${comment.body.substring(0, 80)}...`);
}
```

##### `fullPost()`

Fetch the complete post data with full HTML body content.

```typescript
fullPost(): Promise<FullPost>
```

```typescript
const preview = (await profile.posts({ limit: 1 }).next()).value;
const fullPost = await preview.fullPost();
console.log(`HTML body length: ${fullPost.htmlBody.length}`);
```

### FullPost

Complete post with full HTML content. Returned by `client.postForId()` or `previewPost.fullPost()`.

#### Properties

```typescript
class FullPost {
  // Inherited from PreviewPost
  readonly id: number
  readonly title: string
  readonly subtitle: string
  readonly body: string              // Full HTML body
  readonly truncatedBody: string
  readonly likesCount: number
  readonly author: {
    id: number
    name: string
    handle: string
    avatarUrl: string
  }
  readonly publishedAt: Date

  // Additional FullPost properties
  readonly htmlBody: string                // Full HTML body content
  readonly slug: string                    // URL slug
  readonly url: string                     // Canonical URL
  readonly createdAt: Date                 // Creation date
  readonly reactions?: Record<string, number>  // Reaction counts by type
  readonly restacks?: number               // Restack count
  readonly postTags?: string[]             // Post tags/categories
  readonly coverImage?: string             // Cover image URL
}
```

#### Getting a FullPost

```typescript
// By numeric ID (anonymous)
const post = await client.postForId(12345);
console.log(`Title: ${post.title}`);
console.log(`Published: ${post.publishedAt.toLocaleDateString()}`);
console.log(`URL: ${post.url}`);
console.log(`Body length: ${post.htmlBody.length}`);
```

#### Methods

##### `comments(options?)`

Iterate comments on this post. Yields `Comment` objects.

```typescript
comments(options?: { limit?: number }): AsyncIterable<Comment>
```

```typescript
for await (const comment of post.comments()) {
  console.log(`${comment.body.substring(0, 100)}`);
}
```

### PublicationPost

Post from a publication's archive, homepage, or full posts endpoint. Returned by `client.publicationArchive()`, `client.publicationPosts()`, and `client.publicationHomepage()`.

#### Properties

```typescript
class PublicationPost {
  readonly id: number
  readonly title: string
  readonly subtitle: string
  readonly slug: string
  readonly url: string                     // Canonical URL
  readonly publishedAt: Date
  readonly coverImage?: string
  readonly audience: string                // e.g., 'everyone'
  readonly reactions?: Record<string, number>
  readonly restacks?: number
  readonly sectionName?: string
  readonly bodyHtml?: string               // Available from publicationPosts()
}
```

#### Getting Publication Posts

```typescript
// Browse a publication's archive (anonymous)
for await (const post of client.publicationArchive({ limit: 10 })) {
  console.log(`${post.title} - ${post.url}`);
}

// Get publication homepage posts
const homepagePosts = await client.publicationHomepage();
for (const post of homepagePosts) {
  console.log(`${post.title}`);
}
```

## Note Entity

Notes are short-form content similar to social media posts. Returned by `profile.notes()` or `client.noteForId()`.

### Properties

```typescript
class Note {
  readonly id: string
  readonly body: string               // Note text content
  readonly likesCount: number         // Number of likes
  readonly author: {                  // Author info (plain object, NOT a Profile)
    id: number
    name: string
    handle: string
    avatarUrl: string
  }
  readonly publishedAt: Date
}
```

### Getting Notes

```typescript
// By numeric ID (anonymous)
const note = await client.noteForId(12345);
console.log(`By ${note.author.name}:`);
console.log(note.body);
console.log(`Likes: ${note.likesCount}`);

// From a profile
for await (const note of profile.notes({ limit: 10 })) {
  console.log(`${note.author.name}: ${note.body}`);
}
```

### Methods

##### `comments()`

Iterate comments on this note. Yields `Comment` objects.

```typescript
comments(): AsyncIterable<Comment>
```

```typescript
for await (const comment of note.comments()) {
  console.log(`Reply: ${comment.body}`);
}
```

## Comment Entity

Comments represent responses to posts and notes. A lightweight entity with minimal fields.

### Properties

```typescript
class Comment {
  readonly id: number
  readonly body: string               // Comment text
  readonly isAdmin?: boolean          // Whether the author is an admin
  readonly likesCount?: number        // Like count (may be undefined)
}
```

### Getting Comments

```typescript
// By numeric ID (anonymous)
const comment = await client.commentForId(12345);
console.log(`Comment: ${comment.body}`);

// From a post or note
for await (const comment of post.comments()) {
  console.log(`${comment.body}`);
}
```

### Comment Replies

Use `client.commentReplies()` or `client.commentRepliesFeed()` to get threaded replies to a comment.

```typescript
// Single page of replies
const replies = await client.commentReplies(commentId);
for (const branch of replies.commentBranches) {
  console.log(branch);
}

// All replies via iteration
for await (const page of client.commentRepliesFeed(commentId)) {
  for (const branch of page.commentBranches) {
    console.log(branch);
  }
}
```

## Category Entity

Categories represent Substack content categories (e.g., "Culture", "Technology") with nested subcategories.

### Properties

```typescript
class Category {
  readonly id: number
  readonly name: string
  readonly slug: string
  readonly rank: number
  readonly subcategories: ReadonlyArray<{
    id: number
    name: string
    slug: string
    rank: number
  }>
}
```

### Getting Categories

```typescript
// Get all categories (anonymous)
const categories = await client.categories();
for (const cat of categories) {
  console.log(`${cat.name} (${cat.slug})`);
  for (const sub of cat.subcategories) {
    console.log(`  - ${sub.name}`);
  }
}

// Get publications in a category
const result = await client.categoryPublications(cat.id);
for (const pub of result.publications) {
  console.log(pub.name);
}
```

## NoteBuilder

The `NoteBuilder` provides a fluent API for creating rich-formatted notes. Obtained via `myProfile.newNote()`.

### Builder Chain

```
NoteBuilder
  .paragraph() -> ParagraphBuilder
                  .text(str)      -> ParagraphBuilder
                  .bold(str)      -> ParagraphBuilder
                  .italic(str)    -> ParagraphBuilder
                  .code(str)      -> ParagraphBuilder
                  .underline(str) -> ParagraphBuilder
                  .link(text, url) -> ParagraphBuilder
                  .bulletList()   -> ListBuilder
                  .numberedList() -> ListBuilder
                  .paragraph()    -> ParagraphBuilder  (commits current, starts new)
                  .publish()      -> Promise<PublishNoteResponse>
                  .build()        -> PublishNoteRequest
ListBuilder
  .item()       -> ListItemBuilder
ListItemBuilder
  .text(str)    -> ListItemBuilder
  .bold(str)    -> ListItemBuilder
  .italic(str)  -> ListItemBuilder
  .code(str)    -> ListItemBuilder
  .underline(str) -> ListItemBuilder
  .link(text, url) -> ListItemBuilder
  .item()       -> ListItemBuilder  (commits current, starts new)
  .finish()     -> ParagraphBuilder (commits current item, returns to paragraph)
```

### Examples

#### Simple Note

```typescript
const note = await myProfile.newNote()
  .paragraph()
  .text('Just shipped a new feature!')
  .publish();
```

#### Formatted Note

```typescript
const note = await myProfile.newNote()
  .paragraph()
  .text('Key takeaway: ')
  .bold('engagement is everything')
  .paragraph()
  .text('Check out ')
  .link('our blog', 'https://example.com')
  .publish();
```

#### Note with a List

```typescript
const note = await myProfile.newNote()
  .paragraph()
  .text('Top picks this week:')
  .bulletList()
  .item().text('Post on distributed systems').finish()
  .item().text('Newsletter about ').bold('TypeScript').finish()
  .finish()
  .publish();
```

#### Note with Link Attachment

```typescript
const note = await myProfile.newNoteWithLink('https://example.com/article')
  .paragraph()
  .text('Worth reading on distributed consensus.')
  .publish();
```

## FeedItem Type

Several client methods (search, discovery, profile feeds) return `FeedItem` objects. These are heterogeneous items from Substack's feed endpoints where the `type` field discriminates the item kind.

```typescript
interface FeedItem {
  type: string        // Item type discriminator (e.g., 'post', 'comment')
  entity_key: string  // Unique identifier
  [key: string]: unknown  // Additional type-specific fields
}
```

FeedItem-returning methods include:
- `client.search(query)` -- Search posts, notes, publications
- `client.discoverFeed(options)` -- Discovery feed with tab filtering
- `client.exploreSearch(options)` -- Explore search with tab filtering
- `client.profileActivity(profileId, options)` -- Profile activity feed
- `client.profileLikes(profileId, options)` -- Profile likes feed
- `client.publicationFeed(publicationId, options)` -- Publication activity feed

## Async Iteration Patterns

The entity model uses async iterators for seamless navigation and pagination.

### Basic Patterns

```typescript
// Simple iteration -- all items
for await (const post of profile.posts()) {
  console.log(post.title);
}

// Limited iteration
for await (const post of profile.posts({ limit: 10 })) {
  console.log(post.title);
}

// Break early
for await (const post of profile.posts()) {
  if (post.title.includes('BREAKING')) {
    console.log('Found breaking news!');
    break;
  }
}
```

### Collecting Results

```typescript
// Collect into array for processing
const recentPosts: PreviewPost[] = [];
for await (const post of profile.posts({ limit: 20 })) {
  recentPosts.push(post);
}

console.log(`Collected ${recentPosts.length} posts`);

// Sort by date (most recent first)
recentPosts.sort((a, b) =>
  b.publishedAt.getTime() - a.publishedAt.getTime()
);
```

### Nested Navigation

```typescript
for await (const post of profile.posts({ limit: 5 })) {
  console.log(`\n${post.title}`);
  console.log(`  Published: ${post.publishedAt.toLocaleDateString()}`);
  console.log(`  Likes: ${post.likesCount}`);

  for await (const comment of post.comments({ limit: 3 })) {
    console.log(`  Comment: ${comment.body.substring(0, 60)}...`);
  }
}
```

### Performance Considerations

```typescript
// Efficient: Process as you go (constant memory)
for await (const post of profile.posts()) {
  await processPost(post);
}

// Less efficient: Load all first (growing memory)
const allPosts = [];
for await (const post of profile.posts()) {
  allPosts.push(post);
}
```

## Anonymous Usage

Most read operations work without authentication. Simply omit the `token` in your config:

```typescript
const client = new SubstackClient({
  publicationUrl: 'https://example.substack.com'
  // No token -- anonymous read-only access
});

// These all work anonymously:
const profile = await client.profileForSlug('some-user');
const post = await client.postForId(12345);
const note = await client.noteForId(67890);
const categories = await client.categories();
const topPosts = await client.topPosts();
const trending = await client.trending();

for await (const item of client.search('typescript')) {
  console.log(item);
}

for await (const post of client.publicationArchive({ limit: 10 })) {
  console.log(post.title);
}
```

Methods requiring authentication (will throw if no token is provided):
- `client.testConnectivity()`
- `client.ownProfile()`

## Error Handling

```typescript
try {
  const profile = await client.profileForSlug('nonexistent-user');
} catch (error) {
  if (error.message.includes('not found')) {
    console.error('User not found');
  } else {
    console.error('Unexpected error:', error.message);
  }
}

// Handle errors during iteration
try {
  for await (const post of profile.posts()) {
    // Process post
  }
} catch (error) {
  if (error.message.includes('429')) {
    console.error('Rate limited -- wait before continuing');
  } else {
    console.error('Error during iteration:', error.message);
  }
}
```

## Best Practices

### Use Limits

```typescript
// Efficient: Only fetch what you need
for await (const post of profile.posts({ limit: 10 })) {
  // Process only 10 posts
}
```

### Process as You Stream

```typescript
// Good: Constant memory usage
for await (const post of profile.posts()) {
  await processPost(post);
}
```

### Handle Individual Failures

```typescript
for await (const post of profile.posts()) {
  try {
    await processPost(post);
  } catch (error) {
    console.warn(`Failed to process "${post.title}": ${error.message}`);
    // Continue with next post
  }
}
```
