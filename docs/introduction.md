# Introduction

The Substack API client is a modern, type-safe TypeScript library that provides a comprehensive interface for interacting with Substack's platform. Whether you're building automation tools, analytics dashboards, content management systems, or content discovery applications, this library makes it easy to integrate with Substack.

Most features work **without authentication** -- you can browse trending posts, search content, explore categories, and read public profiles, posts, notes, and comments anonymously. A token is only required for authenticated operations like testing connectivity and accessing your own profile.

## Who This Is For

### Content Creators & Publishers
- **Newsletter automation** - Track engagement and monitor your publication
- **Audience analytics** - Monitor follower growth, engagement rates, content performance
- **Community management** - Read and analyze comments, understand reader engagement

### Developers & Technical Teams
- **API integration** - Clean, typed interface for Substack's APIs
- **Automation workflows** - Build custom content pipelines and workflows
- **Data analysis** - Extract insights from publication data and reader behavior
- **Custom applications** - Build content discovery platforms, reader apps, and newsletter tools

### Data Analysts & Marketers
- **Performance tracking** - Monitor post performance, engagement metrics, growth trends
- **Audience insights** - Understand reader behavior, preferences, and engagement patterns
- **Competitive analysis** - Track industry publications and benchmark performance
- **Content discovery** - Find trending content, explore categories, search across Substack

### Marketing & Growth Teams
- **Lead generation** - Integrate newsletter signups with CRM systems and marketing funnels
- **Social media** - Discover shareable content from across Substack
- **Analytics integration** - Connect Substack data with Google Analytics, Mixpanel, and other tools

## Key Features

### Anonymous Access
Most of the library works without any authentication. Browse publications, search for content, and read public data freely:

```typescript
// No token required -- anonymous read-only access
const client = new SubstackClient({});

// All of these work without a token
const trending = await client.trending({ limit: 5 });
const categories = await client.categories();
const profile = await client.profileForSlug('username');
const post = await client.postForId(12345);
```

### Discovery & Search
Find content and people across Substack with built-in discovery methods:

```typescript
// Search for content
for await (const item of client.search('machine learning', { limit: 10 })) {
  console.log(item);
}

// Browse trending posts
const trending = await client.trending({ limit: 10 });

// Search for profiles
const results = await client.profileSearch('sam altman');
console.log(`Found ${results.results.length} profiles`);

// Explore categories
const categories = await client.categories();
const pubs = await client.categoryPublications(categories[0].id, { limit: 10 });
```

### Publication Archive
Access any publication's posts and archive:

```typescript
const client = new SubstackClient({
  publicationUrl: 'example.substack.com' // required for publication methods
});

// Browse the publication's homepage
const homepage = await client.publicationHomepage();

// Iterate through all publication posts
for await (const post of client.publicationPosts({ limit: 20 })) {
  console.log(post.title);
}

// Browse the archive sorted by top or new
for await (const post of client.publicationArchive({ sort: 'new', limit: 10 })) {
  console.log(post.title);
}
```

### Modern Entity Model
Navigate Substack data naturally with object-oriented entities:

```typescript
// Fluent navigation through relationships
const profile = await client.profileForSlug('username');
for await (const post of profile.posts()) {
  console.log(post.title);
}
```

### Seamless Pagination
Automatic pagination handling with async iterators:

```typescript
// No manual pagination -- just iterate
for await (const post of profile.posts()) {
  console.log(post.title); // Handles all pages automatically
}
```

### Complete Type Safety
Full TypeScript support with comprehensive type definitions:

```typescript
// Everything is typed -- IDE autocomplete and compile-time checks
const profile: Profile = await client.profileForSlug('username');
```

### Secure Authentication
Cookie-based authentication using your Substack session (optional for most features):

```typescript
const client = new SubstackClient({
  publicationUrl: 'example.substack.com', // optional -- required for publication-scoped methods
  token: 'your-connect-sid-cookie-value'   // optional -- omit for anonymous access
});
```

### Note Creation
Create notes through the builder pattern on your authenticated profile:

```typescript
const myProfile = await client.ownProfile();

const note = await myProfile
  .newNote()
  .paragraph()
  .text('Published a new article today!')
  .paragraph()
  .bold('Key takeaway: ')
  .text('Build in public.')
  .publish();
```

### Analytics & Insights
Track engagement and performance on public content:

```typescript
const post = await client.postForId(12345);
const likes = post.likesCount;
const reactionCount = post.reactions ? Object.values(post.reactions).reduce((a, b) => a + b, 0) : 0;
```

## Architecture Overview

The library is built around several key concepts:

### SubstackClient
The main entry point that handles configuration and provides access to entities:

```typescript
// Anonymous access (no publicationUrl needed)
const client = new SubstackClient({});

// Authenticated access
const client = new SubstackClient({
  publicationUrl: 'example.substack.com',
  token: 'cookie-value'
});
```

### Entity Classes
Represent Substack objects with navigation methods:
- **Profile** - User profiles with read access to their content
- **OwnProfile** - Your authenticated profile with note creation capabilities via `newNote()`
- **FullPost** - Long-form articles and newsletters
- **Note** - Short-form social content
- **Comment** - Comments on posts and notes

### Async Iterators
Provide seamless pagination for collections:

```typescript
// All collections support async iteration
profile.posts()      // AsyncIterable<PreviewPost>
post.comments()      // AsyncIterable<Comment>
profile.notes()      // AsyncIterable<Note>
```

### Type Safety
Comprehensive TypeScript definitions ensure compile-time safety:

```typescript
interface Profile {
  id: number;
  name: string;
  slug: string;
  bio?: string;
  avatarUrl: string;
  posts(options?: { limit?: number }): AsyncIterable<PreviewPost>;
}
```

## Use Case Examples

### Content Discovery Tool
```typescript
const client = new SubstackClient({});

// Find trending content
const trending = await client.trending({ limit: 10 });

// Search for specific topics
for await (const item of client.search('typescript tips', { limit: 5 })) {
  console.log(item);
}
```

### Newsletter Analytics Dashboard
```typescript
const myProfile = await client.ownProfile();

// Track performance metrics
for await (const post of myProfile.posts({ limit: 10 })) {
  console.log(`"${post.title}": ${post.likesCount} likes`);
}
```

### Publication Monitor
```typescript
const client = new SubstackClient({
  publicationUrl: 'interesting-pub.substack.com' // required for publication methods
});

// Monitor new posts from a publication
for await (const post of client.publicationArchive({ sort: 'new', limit: 5 })) {
  console.log(`New: "${post.title}"`);
}
```

### Profile Research
```typescript
// Look up a profile and explore their activity
const profile = await client.profileForSlug('some-writer');
console.log(`${profile.name}: ${profile.bio}`);

for await (const post of profile.posts({ limit: 5 })) {
  console.log(`- ${post.title}`);
}
```

## Getting Started

1. **Install the library**: `npm install substack-api`
2. **Initialize the client** with a publication URL (token optional)
3. **Start exploring** with the entity model

```typescript
import { SubstackClient } from 'substack-api';

// Anonymous -- no token needed for most features
const client = new SubstackClient({});

// Browse trending content
const trending = await client.trending();
console.log(`Found ${trending.posts.length} trending posts`);

// Look up a profile
const profile = await client.profileForSlug('username');
console.log(`Welcome ${profile.name}!`);
```

## What Makes This Different

### Entity-Oriented Design
Unlike traditional REST clients that return raw JSON, this library provides rich entity objects with built-in navigation and interaction methods.

### Anonymous-First
Most features work without authentication. Browse publications, search content, read posts and profiles -- all without a token. Authentication is only needed for write operations and private data.

### Developer Experience First
- Intuitive async iteration patterns
- Comprehensive TypeScript support
- Intelligent error handling
- Extensive documentation with real-world examples

### Production Ready
- Robust error handling for network issues and API changes
- Efficient memory usage for large datasets
- Configurable rate limiting
- Comprehensive test coverage

### Community Focused
- Open source with active development
- Responsive to user feedback and feature requests
- Comprehensive documentation and examples
- Regular updates to support new Substack features

The Substack API client makes it easy to build powerful applications on top of Substack's platform. Whether you're automating your newsletter workflow, building analytics tools, or creating new ways to discover content, this library provides the foundation you need.
