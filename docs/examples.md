# Examples

Practical examples of using the Substack API client in real-world scenarios.

## Basic Setup

### Initialize the Client

```typescript
import { SubstackClient } from 'substack-api';

// Authenticated usage (requires a connect.sid cookie)
const client = new SubstackClient({
  publicationUrl: 'https://example.substack.com',
  token: 'your-connect-sid-cookie-value'
});

// Test connection (requires authentication)
const isConnected = await client.testConnectivity();
if (!isConnected) {
  throw new Error('Failed to connect to Substack API');
}
```

### Anonymous Client (Read-Only)

```typescript
// No token needed -- works for all public endpoints
const client = new SubstackClient({});

// Browse profiles, posts, search, trending, categories -- all anonymous
const profile = await client.profileForSlug('some-writer');
const trending = await client.trending();
const categories = await client.categories();
```

### Environment Setup

```typescript
import dotenv from 'dotenv';
dotenv.config();

const client = new SubstackClient({
  publicationUrl: process.env.SUBSTACK_PUBLICATION_URL!,
  token: process.env.SUBSTACK_TOKEN // undefined = anonymous mode
});
```

## Anonymous Usage

### Trending Posts

```typescript
async function showTrending() {
  const client = new SubstackClient({});

  // Get a single page of trending posts
  const trending = await client.trending({ limit: 10 });
  console.log(`Trending posts: ${trending.posts.length}`);

  // Iterate all trending pages
  for await (const page of client.trendingFeed({ limit: 25 })) {
    for (const post of page.posts) {
      console.log(`- ${post.title}`);
    }
  }

  // Get top posts from the homepage feed
  const topPosts = await client.topPosts();
  for (const item of topPosts) {
    console.log(`Top: ${item.entity_key}`);
  }
}
```

### Search

```typescript
async function searchContent(query: string) {
  const client = new SubstackClient({});

  // Search for posts, notes, publications
  for await (const item of client.search(query, { limit: 20 })) {
    console.log(`[${item.type}] ${item.entity_key}`);
  }

  // Search for user profiles
  const profileResults = await client.profileSearch(query);
  console.log(`Found ${profileResults.results.length} profiles`);
  for (const result of profileResults.results) {
    console.log(`- ${result.name} (@${result.handle})`);
    if (result.bio) console.log(`  Bio: ${result.bio}`);
    if (result.followerCount) console.log(`  Followers: ${result.followerCount}`);
  }

  // Iterate all profile search results across pages
  for await (const profile of client.profileSearchAll(query, { limit: 50 })) {
    console.log(`${profile.name} (@${profile.handle})`);
  }

  // Explore search with different tabs
  for await (const item of client.exploreSearch({ tab: 'notes', limit: 10 })) {
    console.log(`[${item.type}] ${item.entity_key}`);
  }
}
```

### Discovery Feed

```typescript
async function browseDiscovery() {
  const client = new SubstackClient({});

  // Browse different feed tabs
  const tabs = ['for-you', 'top', 'popular', 'catchup', 'notes', 'explore'] as const;

  for (const tab of tabs) {
    console.log(`\n--- ${tab.toUpperCase()} ---`);
    let count = 0;
    for await (const item of client.discoverFeed({ tab, limit: 5 })) {
      console.log(`[${item.type}] ${item.entity_key}`);
      count++;
    }
    console.log(`  (${count} items)`);
  }
}
```

### Categories

```typescript
async function browseCategories() {
  const client = new SubstackClient({});

  // List all categories and subcategories
  const categories = await client.categories();
  for (const cat of categories) {
    console.log(`\n${cat.name} (${cat.slug})`);
    for (const sub of cat.subcategories) {
      console.log(`  - ${sub.name} (${sub.slug})`);
    }
  }

  // Get publications in a category
  if (categories.length > 0) {
    const result = await client.categoryPublications(categories[0].id);
    console.log(`\nPublications in "${categories[0].name}":`);
    for (const pub of result.publications) {
      console.log(`- ${pub.name}`);
    }
    console.log(`More available: ${result.more}`);
  }
}
```

### Publication Archive

```typescript
async function browsePublicationArchive() {
  const client = new SubstackClient({
    publicationUrl: 'https://example.substack.com' // required for publication methods
  });

  // Browse the publication's archive (sorted by newest)
  console.log('Recent posts from publication archive:');
  for await (const post of client.publicationArchive({ limit: 10 })) {
    console.log(`- ${post.title}`);
    console.log(`  ${post.url}`);
    console.log(`  Published: ${post.publishedAt.toLocaleDateString()}`);
  }

  // Browse top posts from archive
  console.log('\nTop posts:');
  for await (const post of client.publicationArchive({ sort: 'top', limit: 5 })) {
    console.log(`- ${post.title}`);
    if (post.reactions) {
      const totalReactions = Object.values(post.reactions).reduce((a, b) => a + b, 0);
      console.log(`  Reactions: ${totalReactions}`);
    }
  }

  // Get full posts (includes body_html)
  console.log('\nFull posts with HTML body:');
  for await (const post of client.publicationPosts({ limit: 3 })) {
    console.log(`- ${post.title}`);
    if (post.bodyHtml) {
      console.log(`  Body length: ${post.bodyHtml.length} characters`);
    }
  }

  // Get homepage posts
  const homepagePosts = await client.publicationHomepage();
  console.log(`\nHomepage: ${homepagePosts.length} posts`);
  for (const post of homepagePosts) {
    console.log(`- ${post.title} (${post.publishedAt.toLocaleDateString()})`);
  }
}
```

### Profile Activity and Likes

```typescript
async function showProfileActivity(profileId: number) {
  const client = new SubstackClient({});

  // Get a profile's activity feed (posts, notes, comments)
  console.log('Profile activity:');
  for await (const item of client.profileActivity(profileId, { limit: 10 })) {
    console.log(`[${item.type}] ${item.entity_key}`);
  }

  // Filter by content type
  console.log('\nJust their posts:');
  for await (const item of client.profileActivity(profileId, { tab: 'posts', limit: 5 })) {
    console.log(`[${item.type}] ${item.entity_key}`);
  }

  // Get a profile's likes
  console.log('\nLiked content:');
  for await (const item of client.profileLikes(profileId, { limit: 10 })) {
    console.log(`[${item.type}] ${item.entity_key}`);
  }
}

// Usage
const profile = await client.profileForSlug('some-writer');
await showProfileActivity(profile.id);
```

### Publication Feed

```typescript
async function showPublicationFeed(publicationId: number) {
  // publicationFeed uses the discovery API, no publicationUrl needed
  const client = new SubstackClient({});

  for await (const item of client.publicationFeed(publicationId, { limit: 10 })) {
    console.log(`[${item.type}] ${item.entity_key}`);
  }
}
```

## Profile Management

### Get Your Own Profile

```typescript
async function getMyProfile() {
  const client = new SubstackClient({
    publicationUrl: 'https://example.substack.com',
    token: process.env.SUBSTACK_TOKEN!
  });

  const myProfile = await client.ownProfile();

  console.log(`Welcome ${myProfile.name}!`);
  console.log(`Username: @${myProfile.slug}`);
  console.log(`Bio: ${myProfile.bio ?? 'No bio set'}`);

  return myProfile;
}
```

### Get Other Profiles

```typescript
async function exploreProfiles() {
  const client = new SubstackClient({});

  // Get profile by slug (anonymous)
  const profile = await client.profileForSlug('interesting-writer');
  console.log(`Found: ${profile.name} (@${profile.slug})`);
  console.log(`Bio: ${profile.bio ?? 'No bio'}`);
  console.log(`Avatar: ${profile.avatarUrl}`);

  // Get profile by ID (anonymous)
  const profileById = await client.profileForId(12345);
  console.log(`Profile by ID: ${profileById.name}`);

  // Search for profiles by name
  const searchResults = await client.profileSearch('technology writer');
  console.log(`\nSearch results (${searchResults.results.length}):`);
  for (const result of searchResults.results) {
    console.log(`- ${result.name} (@${result.handle})`);
    if (result.followerCount) {
      console.log(`  Followers: ${result.followerCount}`);
    }
  }
}
```

## Content Browsing

### Browse Posts from a Profile

```typescript
async function browseContent(username: string) {
  const client = new SubstackClient({});

  const profile = await client.profileForSlug(username);
  console.log(`Content from ${profile.name}:\n`);

  for await (const post of profile.posts({ limit: 10 })) {
    console.log(`"${post.title}"`);
    console.log(`  Published: ${post.publishedAt.toLocaleDateString()}`);
    console.log(`  Author: ${post.author.name} (@${post.author.handle})`);
    console.log(`  Likes: ${post.likesCount}`);

    // Preview of comments
    let commentCount = 0;
    for await (const comment of post.comments({ limit: 2 })) {
      if (commentCount === 0) console.log('  Recent comments:');
      console.log(`    - ${comment.body.substring(0, 60)}...`);
      commentCount++;
    }

    if (commentCount === 0) {
      console.log('  (No comments yet)');
    }

    console.log('');
  }
}

await browseContent('example-writer');
```

### Fetch Full Post Content

```typescript
async function readFullPost(postId: number) {
  const client = new SubstackClient({});

  const post = await client.postForId(postId);

  console.log(`Title: ${post.title}`);
  console.log(`URL: ${post.url}`);
  console.log(`Published: ${post.publishedAt.toLocaleDateString()}`);
  console.log(`Tags: ${post.postTags?.join(', ') ?? 'none'}`);

  if (post.reactions) {
    for (const [type, count] of Object.entries(post.reactions)) {
      console.log(`  ${type}: ${count}`);
    }
  }

  if (post.coverImage) {
    console.log(`Cover: ${post.coverImage}`);
  }

  // Full HTML body
  console.log(`\nBody (${post.htmlBody.length} chars):`);
  console.log(post.htmlBody.substring(0, 500) + '...');
}
```

### Discover Notes

```typescript
async function exploreNotes(username: string) {
  const client = new SubstackClient({});

  const profile = await client.profileForSlug(username);
  console.log(`Notes from ${profile.name}:\n`);

  for await (const note of profile.notes({ limit: 15 })) {
    console.log(`"${note.body.substring(0, 100)}"`);
    console.log(`  By: ${note.author.name} (@${note.author.handle})`);
    console.log(`  Published: ${note.publishedAt.toLocaleDateString()}`);
    console.log(`  Likes: ${note.likesCount}`);

    // Check for comments/replies
    let replyCount = 0;
    for await (const comment of note.comments()) {
      replyCount++;
      if (replyCount <= 2) {
        console.log(`  Reply: ${comment.body.substring(0, 60)}...`);
      }
    }
    if (replyCount > 2) {
      console.log(`  ... and ${replyCount - 2} more replies`);
    }

    console.log('');
  }
}
```

### Comment Replies

```typescript
async function readCommentThread(commentId: number) {
  const client = new SubstackClient({});

  // Get the original comment
  const comment = await client.commentForId(commentId);
  console.log(`Original: ${comment.body}`);

  // Get replies (single page)
  const replies = await client.commentReplies(commentId);
  console.log(`\n${replies.commentBranches.length} reply branches`);

  // Iterate all reply pages
  console.log('\nAll replies:');
  for await (const page of client.commentRepliesFeed(commentId, { limit: 50 })) {
    for (const branch of page.commentBranches) {
      console.log(`  Branch with ${branch.descendantComments.length} replies`);
    }
  }
}
```

### Post Reactors

```typescript
async function showReactions(postId: number) {
  const client = new SubstackClient({
    publicationUrl: 'https://example.substack.com' // required for postReactors
  });

  const facepile = await client.postReactors(postId);
  console.log('Users who reacted:');
  // facepile structure depends on API response
  console.log(JSON.stringify(facepile, null, 2));
}
```

## Note Creation

### Simple Note

```typescript
async function publishSimpleNote() {
  const client = new SubstackClient({
    publicationUrl: 'https://example.substack.com',
    token: process.env.SUBSTACK_TOKEN!
  });

  const myProfile = await client.ownProfile();

  const note = await myProfile.newNote()
    .paragraph()
    .text('Just shipped a new feature!')
    .publish();

  console.log(`Note published: ${note.user_id}`);
}
```

### Formatted Note

```typescript
async function publishFormattedNote() {
  const client = new SubstackClient({
    publicationUrl: 'https://example.substack.com',
    token: process.env.SUBSTACK_TOKEN!
  });

  const myProfile = await client.ownProfile();

  const note = await myProfile.newNote()
    .paragraph()
    .text('Key takeaways from today: ')
    .bold('engagement is everything')
    .paragraph()
    .text('Check out ')
    .link('our blog', 'https://example.com')
    .paragraph()
    .italic('What do you think?')
    .publish();

  console.log('Formatted note published');
}
```

### Note with a List

```typescript
async function publishListNote() {
  const client = new SubstackClient({
    publicationUrl: 'https://example.substack.com',
    token: process.env.SUBSTACK_TOKEN!
  });

  const myProfile = await client.ownProfile();

  const note = await myProfile.newNote()
    .paragraph()
    .text('Top 3 reads this week:')
    .numberedList()
    .item().text('Distributed consensus patterns').finish()
    .item().text('TypeScript ').bold('best practices').finish()
    .item().link('API Design Guide', 'https://example.com/api').finish()
    .finish()
    .publish();

  console.log('List note published');
}
```

### Note with Link Attachment

```typescript
async function shareLink() {
  const client = new SubstackClient({
    publicationUrl: 'https://example.substack.com',
    token: process.env.SUBSTACK_TOKEN!
  });

  const myProfile = await client.ownProfile();

  const note = await myProfile.newNoteWithLink('https://example.com/article')
    .paragraph()
    .text('Worth reading on distributed systems.')
    .publish();

  console.log('Link note published');
}
```

### Build Without Publishing

```typescript
async function previewNote() {
  const client = new SubstackClient({
    publicationUrl: 'https://example.substack.com',
    token: process.env.SUBSTACK_TOKEN!
  });

  const myProfile = await client.ownProfile();

  // Build the request without sending it
  const request = myProfile.newNote()
    .paragraph()
    .text('Preview this note')
    .build();

  console.log('Note request:', JSON.stringify(request, null, 2));
}
```

## Following Management

### Browse Your Following List

```typescript
async function browseFollowing() {
  const client = new SubstackClient({
    publicationUrl: 'https://example.substack.com',
    token: process.env.SUBSTACK_TOKEN!
  });

  const myProfile = await client.ownProfile();

  console.log('People you follow:\n');
  for await (const user of myProfile.following({ limit: 50 })) {
    console.log(`- ${user.name} (@${user.slug})`);

    // Check their latest post
    for await (const post of user.posts({ limit: 1 })) {
      console.log(`  Latest: "${post.title}"`);
      break;
    }
  }
}
```

## Analytics and Monitoring

### Content Performance Dashboard

```typescript
async function contentDashboard() {
  const client = new SubstackClient({
    publicationUrl: 'https://example.substack.com',
    token: process.env.SUBSTACK_TOKEN!
  });

  const myProfile = await client.ownProfile();
  console.log(`Content Dashboard for ${myProfile.name}\n`);

  // Analyze recent posts
  const posts = [];
  for await (const post of myProfile.posts({ limit: 10 })) {
    posts.push(post);
  }

  if (posts.length === 0) {
    console.log('No posts found.');
    return;
  }

  // Calculate metrics
  const totalLikes = posts.reduce((sum, post) => sum + post.likesCount, 0);
  const avgLikes = (totalLikes / posts.length).toFixed(1);

  console.log(`Posts analyzed: ${posts.length}`);
  console.log(`Total likes: ${totalLikes}`);
  console.log(`Average likes per post: ${avgLikes}`);

  // Top performing posts
  const sorted = [...posts].sort((a, b) => b.likesCount - a.likesCount);
  console.log(`\nTop 3 posts:`);
  sorted.slice(0, 3).forEach((post, index) => {
    console.log(`  ${index + 1}. "${post.title}" (${post.likesCount} likes)`);
    console.log(`     Published: ${post.publishedAt.toLocaleDateString()}`);
  });

  // Recent notes engagement
  console.log(`\nRecent notes:`);
  let noteCount = 0;
  for await (const note of myProfile.notes({ limit: 10 })) {
    console.log(`  - "${note.body.substring(0, 60)}..." (${note.likesCount} likes)`);
    noteCount++;
  }
  if (noteCount === 0) {
    console.log('  (No recent notes)');
  }
}
```

### Publication Analytics

```typescript
async function publicationAnalytics() {
  const client = new SubstackClient({
    publicationUrl: 'https://example.substack.com' // required for publication methods
  });

  // Collect posts from publication archive
  const posts = [];
  for await (const post of client.publicationArchive({ limit: 50 })) {
    posts.push(post);
  }

  console.log(`Publication Archive Analysis`);
  console.log(`Total posts: ${posts.length}`);

  // Calculate total reactions
  let totalReactions = 0;
  for (const post of posts) {
    if (post.reactions) {
      totalReactions += Object.values(post.reactions).reduce((a, b) => a + b, 0);
    }
  }
  console.log(`Total reactions: ${totalReactions}`);

  // Sort by reaction count
  const sorted = posts.filter(p => p.reactions).sort((a, b) => {
    const aTotal = Object.values(a.reactions!).reduce((x, y) => x + y, 0);
    const bTotal = Object.values(b.reactions!).reduce((x, y) => x + y, 0);
    return bTotal - aTotal;
  });

  console.log(`\nTop 5 posts by reactions:`);
  sorted.slice(0, 5).forEach((post, index) => {
    const total = Object.values(post.reactions!).reduce((a, b) => a + b, 0);
    console.log(`  ${index + 1}. "${post.title}" (${total} reactions)`);
  });

  // Posts by section
  const sections = new Map<string, number>();
  for (const post of posts) {
    const section = post.sectionName ?? 'Uncategorized';
    sections.set(section, (sections.get(section) ?? 0) + 1);
  }
  console.log(`\nPosts by section:`);
  for (const [section, count] of sections) {
    console.log(`  ${section}: ${count} posts`);
  }
}
```

### Profile Analysis

```typescript
async function analyzeProfile(username: string) {
  const client = new SubstackClient({});

  const profile = await client.profileForSlug(username);
  console.log(`Analyzing ${profile.name} (@${profile.slug})\n`);

  // Collect posts
  const posts = [];
  for await (const post of profile.posts({ limit: 50 })) {
    posts.push(post);
  }

  console.log(`Total posts analyzed: ${posts.length}`);

  // Calculate average likes
  const totalLikes = posts.reduce((sum, post) => sum + post.likesCount, 0);
  console.log(`Average likes per post: ${(totalLikes / posts.length).toFixed(1)}`);

  // Most popular post
  const mostPopular = posts.reduce((max, post) =>
    post.likesCount > max.likesCount ? post : max
  );
  console.log(`Most popular: "${mostPopular.title}" (${mostPopular.likesCount} likes)`);

  // Posting frequency (last 30 days)
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const recentPosts = posts.filter(post => post.publishedAt > thirtyDaysAgo);
  console.log(`Posts in last 30 days: ${recentPosts.length}`);
}
```

## Complete Application Examples

### Content Curation Tool

```typescript
async function curateContent(topic: string) {
  const client = new SubstackClient({});

  const interestingPosts = [];

  // Search for posts on a topic
  for await (const item of client.search(topic, { limit: 20 })) {
    if (item.type === 'post') {
      interestingPosts.push(item);
    }
  }

  console.log(`Found ${interestingPosts.length} posts about "${topic}"`);

  // Also check trending for popular content
  const trending = await client.trending({ limit: 10 });
  console.log(`\nCurrent trending: ${trending.posts.length} posts`);

  return interestingPosts;
}
```

### Community Explorer

```typescript
async function exploreCommunity() {
  const client = new SubstackClient({});

  // List all categories
  const categories = await client.categories();
  console.log('Substack Categories:\n');

  for (const cat of categories) {
    console.log(`${cat.name}`);

    // Get top publications in this category
    const result = await client.categoryPublications(cat.id, { limit: 3 });
    for (const pub of result.publications) {
      console.log(`  - ${pub.name}`);
    }
  }

  // Search for profiles
  console.log('\n\nProfile search for "technology":');
  const searchResults = await client.profileSearch('technology');
  for (const result of searchResults.results.slice(0, 5)) {
    console.log(`- ${result.name} (@${result.handle})`);
    if (result.followerCount) {
      console.log(`  Followers: ${result.followerCount}`);
    }
    if (result.bio) {
      console.log(`  Bio: ${result.bio.substring(0, 80)}...`);
    }
  }
}
```

### Automated Content Report

```typescript
async function generateReport() {
  const client = new SubstackClient({
    publicationUrl: 'https://example.substack.com' // required for publicationArchive
  });

  const report = {
    trending: 0,
    categories: 0,
    searchResults: 0,
    archivePosts: 0
  };

  // Trending
  const trending = await client.trending({ limit: 10 });
  report.trending = trending.posts.length;

  // Categories
  const categories = await client.categories();
  report.categories = categories.length;

  // Search
  for await (const item of client.search('newsletter', { limit: 10 })) {
    report.searchResults++;
  }

  // Publication archive
  for await (const post of client.publicationArchive({ limit: 10 })) {
    report.archivePosts++;
  }

  console.log('Content Report:');
  console.log(JSON.stringify(report, null, 2));

  return report;
}
```

## Error Handling Examples

### Robust Error Handling

```typescript
async function robustContentAccess() {
  const client = new SubstackClient({
    publicationUrl: 'https://example.substack.com',
    token: process.env.SUBSTACK_TOKEN
  });

  // Test connectivity (requires token)
  if (client instanceof SubstackClient && process.env.SUBSTACK_TOKEN) {
    const isConnected = await client.testConnectivity();
    if (!isConnected) {
      throw new Error('Failed to connect -- check your authentication');
    }
  }

  // Get profile with retry logic
  let profile;
  let retries = 3;

  while (retries > 0) {
    try {
      profile = await client.profileForSlug('example-user');
      break;
    } catch (error) {
      retries--;
      const msg = (error as Error).message;
      if (msg.includes('429')) {
        console.log(`Rate limited, waiting... (${retries} retries left)`);
        await new Promise(resolve => setTimeout(resolve, 5000));
      } else if (msg.includes('not found')) {
        throw new Error('User not found');
      } else if (retries === 0) {
        throw error;
      }
    }
  }

  if (!profile) {
    throw new Error('Failed to get profile after retries');
  }

  console.log(`Accessed profile: ${profile.name}`);

  // Access posts with individual error handling
  let successful = 0;
  let failed = 0;

  for await (const post of profile.posts({ limit: 10 })) {
    try {
      console.log(`"${post.title}" (${post.likesCount} likes)`);

      // Try to get comments (may fail for some posts)
      try {
        let commentCount = 0;
        for await (const comment of post.comments({ limit: 3 })) {
          commentCount++;
        }
        console.log(`  ${commentCount} comments loaded`);
      } catch (commentError) {
        console.log(`  Comments unavailable: ${(commentError as Error).message}`);
      }

      successful++;
    } catch (postError) {
      console.log(`  Error accessing post: ${(postError as Error).message}`);
      failed++;
    }
  }

  console.log(`\nResults: ${successful} successful, ${failed} failed`);
}
```

### Error Handling During Iteration

```typescript
async function safeIteration() {
  const client = new SubstackClient({});

  try {
    const profile = await client.profileForSlug('example-user');

    for await (const post of profile.posts({ limit: 20 })) {
      try {
        await processPost(post);
      } catch (error) {
        console.warn(`Failed to process "${post.title}": ${(error as Error).message}`);
        // Continue with next post
      }
    }
  } catch (error) {
    const msg = (error as Error).message;
    if (msg.includes('401')) {
      console.error('Authentication failed -- check your token');
    } else if (msg.includes('429')) {
      console.error('Rate limit exceeded -- wait before trying again');
    } else {
      console.error('Unexpected error:', msg);
    }
  }
}

async function processPost(post: any) {
  // Your processing logic here
  console.log(`Processing: ${post.title}`);
}
```
