# Quickstart

This guide will help you get started with the Substack API client quickly using the modern entity-based API.

## Prerequisites

You'll need:
- Node.js 16+ or a modern browser environment
- TypeScript (recommended) or JavaScript

For authenticated operations only, you'll also need:
- A Substack account with publication access
- Your substack.sid cookie value for authentication

Most features work without a token. See [Anonymous Quickstart](#anonymous-quickstart) below.

## Installation

```bash
npm install substack-api
```

## Anonymous Quickstart

Most features work without any authentication. No configuration is needed for discovery and search:

```typescript
import { SubstackClient } from 'substack-api';

const client = new SubstackClient({});

// Browse trending content
const trending = await client.trending({ limit: 5 });
console.log('Trending:', trending);

// Search for content
for await (const item of client.search('typescript', { limit: 5 })) {
  console.log(item);
}

// Search for profiles
const profiles = await client.profileSearch('sam altman');
console.log(`Found ${profiles.results.length} profiles`);

// Explore categories
const categories = await client.categories();
console.log('Categories:', categories);

// Browse a publication's posts (requires publicationUrl)
const pubClient = new SubstackClient({
  publicationUrl: 'example.substack.com'
});
for await (const post of pubClient.publicationPosts({ limit: 10 })) {
  console.log(post.title);
}
```

## Authenticated Setup

For operations that require authentication (testing connectivity, accessing your own profile, creating notes):

### Get Your Token

The Substack API uses cookie-based authentication. You need to extract your `substack.sid` cookie value:

1. **Login to Substack** in your browser
2. **Open Developer Tools** (F12 or right-click -> "Inspect")
3. **Go to Application/Storage tab** -> Cookies -> `https://substack.com`
4. **Find the `substack.sid` cookie** and copy its value
5. **Use this value** as your `token` in the client configuration

### Initialize the Client

```typescript
import { SubstackClient } from 'substack-api';

const client = new SubstackClient({
  publicationUrl: 'yoursite.substack.com', // optional -- required for publication-scoped methods
  token: 'your-connect-sid-cookie-value'    // optional -- omit for anonymous access
});

// Test connectivity (requires token)
const isConnected = await client.testConnectivity();
console.log('Connected:', isConnected);
```

**Important:** Never hardcode your cookie value in client-side code. Use environment variables:

```typescript
const client = new SubstackClient({
  publicationUrl: process.env.SUBSTACK_PUBLICATION_URL!,
  token: process.env.SUBSTACK_TOKEN // omit this entirely for anonymous usage
});
```

## Working with Profiles

### Get Your Own Profile

Your authenticated profile has note creation capabilities:

```typescript
const myProfile = await client.ownProfile();
console.log(`Welcome ${myProfile.name}! (@${myProfile.slug})`);

// Iterate through your posts
for await (const post of myProfile.posts({ limit: 5 })) {
  console.log(`"${post.title}" - ${post.publishedAt?.toLocaleDateString()}`);
  console.log(`  ${post.likesCount} likes`);
}
```

### Get Other Profiles

```typescript
// Get a profile by slug (works anonymously)
const profile = await client.profileForSlug('example-user');
console.log(`${profile.name}: ${profile.bio || 'No bio available'}`);

// Get profile by ID (works anonymously)
const profileById = await client.profileForId(12345);

// Iterate through their posts
for await (const post of profile.posts({ limit: 10 })) {
  console.log(`- ${post.title}`);
  console.log(`  Published: ${post.publishedAt?.toLocaleDateString()}`);
}
```

### Profile Activity

```typescript
// View a profile's activity across different tabs
for await (const item of client.profileActivity(12345, { tab: 'notes', limit: 5 })) {
  console.log(item);
}

// View what a profile has liked
for await (const item of client.profileLikes(12345, { limit: 10 })) {
  console.log(item);
}
```

## Working with Posts

### Get a Post

```typescript
// Get a specific post by ID (works anonymously)
const post = await client.postForId(12345);
console.log(`Title: ${post.title}`);
console.log(`Published: ${post.publishedAt?.toLocaleDateString()}`);
console.log(`Likes: ${post.likesCount}`);
```

### Publication Posts

```typescript
// Browse a publication's homepage
const homepage = await client.publicationHomepage();
console.log(`Homepage has ${homepage.length} posts`);

// Iterate through publication posts
for await (const post of client.publicationPosts({ limit: 20 })) {
  console.log(post.title);
}

// Browse the archive
for await (const post of client.publicationArchive({ sort: 'new', limit: 10 })) {
  console.log(post.title);
}
```

### Post Reactions

```typescript
// Get reactors (likers) for a post
const reactors = await client.postReactors(12345);
console.log('Reactors:', reactors);
```

## Discovery & Search

### Trending Content

```typescript
// Get trending posts
const trending = await client.trending({ limit: 10 });

// Stream trending posts as a feed
for await (const item of client.trendingFeed({ limit: 20 })) {
  console.log(item);
}
```

### Search

```typescript
// Search for content
for await (const item of client.search('machine learning', { limit: 10 })) {
  console.log(item);
}

// Search for profiles
const results = await client.profileSearch('sam altman');
console.log(`Found ${results.results.length} profiles, more: ${results.more}`);

// Iterate through all profile search results
for await (const result of client.profileSearchAll('sam altman', { limit: 20 })) {
  console.log(result);
}

// Explore search (tab-based discovery)
for await (const item of client.exploreSearch({ tab: 'top', limit: 10 })) {
  console.log(item);
}
```

### Categories

```typescript
// List all categories
const categories = await client.categories();

// Get publications in a category
const result = await client.categoryPublications(categories[0].id, { limit: 10 });
console.log(`Found ${result.publications.length} publications, more: ${result.more}`);
```

### Discover Feed

```typescript
// Browse the discover feed with different tabs
// Tabs: 'for-you', 'top', 'popular', 'catchup', 'notes', 'explore'
for await (const item of client.discoverFeed({ tab: 'top', limit: 10 })) {
  console.log(item);
}
```

### Top Posts

```typescript
const topPosts = await client.topPosts();
console.log(`Top posts: ${topPosts.length}`);
```

## Working with Notes

Notes are short-form posts, similar to social media updates:

```typescript
// Get a specific note by ID (works anonymously)
const note = await client.noteForId(67890);
console.log(`Note: ${note.body}`);
console.log(`Likes: ${note.likesCount}`);

// Get your own profile's notes
const myProfile = await client.ownProfile();
for await (const note of myProfile.notes({ limit: 10 })) {
  console.log(`${note.body.substring(0, 80)}...`);
  console.log(`  ${note.likesCount || 0} likes`);
}
```

### Creating Notes

Use the NoteBuilder pattern on your OwnProfile to create notes:

```typescript
const myProfile = await client.ownProfile();

// Create a simple note
const note = await myProfile
  .newNote()
  .paragraph()
  .text('Just shipped a new feature!')
  .publish();
console.log(`Note published: ${note.id}`);

// Create a formatted note with rich text
const formattedNote = await myProfile
  .newNote()
  .paragraph()
  .text('Building something amazing...')
  .paragraph()
  .bold('Key insight: ')
  .text('User feedback drives everything')
  .paragraph()
  .text('Read more: ')
  .link('our latest update', 'https://example.com')
  .publish();

console.log(`Formatted note created: ${formattedNote.id}`);
```

## Working with Comments

```typescript
// Get a specific comment by ID (works anonymously)
const comment = await client.commentForId(11111);
console.log(`Comment: ${comment.body}`);
console.log(`Likes: ${comment.likesCount}`);
console.log(`Admin: ${comment.isAdmin}`);

// Get replies to a comment
const replies = await client.commentReplies(11111);
console.log(`Replies: ${replies}`);

// Stream replies as a feed
for await (const reply of client.commentRepliesFeed(11111, { limit: 10 })) {
  console.log(reply);
}
```

## Advanced Usage with Async Iterators

The entity model supports powerful async iteration with automatic pagination:

```typescript
// Get all posts from a profile (handles pagination automatically)
const allPosts = [];
for await (const post of profile.posts()) {
  allPosts.push(post);

  // Process each post
  console.log(`Processing: ${post.title}`);

  // You can break early if needed
  if (allPosts.length >= 50) break;
}

// Custom pagination limits
for await (const post of profile.posts({ limit: 25 })) {
  console.log(post.title);
}
```

## Error Handling

Handle errors gracefully:

```typescript
try {
  const profile = await client.ownProfile();
  console.log(`Authenticated as: ${profile.name}`);
} catch (error) {
  if (error.message.includes('401')) {
    console.error('Authentication failed - check your substack.sid cookie');
  } else if (error.message.includes('404')) {
    console.error('Resource not found');
  } else {
    console.error('Unexpected error:', error.message);
  }
}

// Handle network errors during iteration
try {
  for await (const post of profile.posts({ limit: 100 })) {
    console.log(post.title);
  }
} catch (error) {
  console.error('Error during pagination:', error.message);
}
```

## TypeScript Support

The library provides full TypeScript support with comprehensive type definitions:

```typescript
import {
  SubstackClient,
  Profile,
  OwnProfile,
  FullPost,
  Note,
  Comment,
  SubstackConfig
} from 'substack-api';

// Type-safe configuration
const config: SubstackConfig = {
  publicationUrl: 'example.substack.com', // optional -- required for publication-scoped methods
  token: process.env.SUBSTACK_TOKEN      // optional
};

// Type-safe entity usage
async function getProfilePosts(profile: Profile): Promise<void> {
  for await (const post of profile.posts({ limit: 10 })) {
    console.log(post.title);
  }
}

// OwnProfile has additional capabilities
async function publishNote(profile: OwnProfile): Promise<void> {
  await profile
    .newNote()
    .paragraph()
    .text('Hello world!')
    .publish();
}
```

## Complete Example

Here is a comprehensive example demonstrating multiple features:

```typescript
import { SubstackClient } from 'substack-api';

async function substackExplorer() {
  // Anonymous access -- no token needed
  const client = new SubstackClient({});

  try {
    // Browse trending content
    console.log('Trending:');
    const trending = await client.trending({ limit: 5 });
    console.log(`Found ${trending.posts.length} trending posts`);

    // Search for content
    console.log('\nSearch results:');
    for await (const item of client.search('typescript tips', { limit: 5 })) {
      console.log(`- ${JSON.stringify(item)}`);
    }

    // Explore categories
    console.log('\nCategories:');
    const categories = await client.categories();
    for (const category of categories.slice(0, 3)) {
      console.log(`- ${JSON.stringify(category)}`);
    }

    // Look up a profile
    console.log('\nProfile lookup:');
    const profile = await client.profileForSlug('some-writer');
    console.log(`Found: ${profile.name}`);

    // Read their posts
    for await (const post of profile.posts({ limit: 3 })) {
      console.log(`  - "${post.title}"`);
    }

    // Get a specific post
    const post = await client.postForId(12345);
    console.log(`\nPost: "${post.title}" (${post.likesCount} likes)`);

  } catch (error) {
    console.error('Error:', error.message);
  }
}

substackExplorer();
```

## Environment Setup

For production use with authentication, set up your environment variables:

```bash
# .env file
SUBSTACK_TOKEN=your-connect-sid-cookie-value
SUBSTACK_PUBLICATION_URL=yoursite.substack.com
```

```typescript
// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

// Authenticated client
const client = new SubstackClient({
  publicationUrl: process.env.SUBSTACK_PUBLICATION_URL!,
  token: process.env.SUBSTACK_TOKEN
});

// Or anonymous client (no token, no publicationUrl)
const anonymousClient = new SubstackClient({});
```

## Next Steps

- Check out the [API Reference](api-reference.md) for detailed method documentation
- See [Entity Model](entity-model.md) for comprehensive entity documentation
- Review [Examples](examples.md) for more usage patterns
- Read about [Development](development.md) if you want to contribute
