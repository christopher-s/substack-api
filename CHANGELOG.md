# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Anonymous access — `token` is now optional in `SubstackConfig`, all public endpoints work without authentication
- `DiscoveryService` with methods: topPosts, trending, trendingFeed, discoverFeed, categories, categoryPublications, profileActivity, profileLikes, publicationFeed
- Search functionality: search, profileSearch, profileSearchAll, exploreSearch
- `PublicationService` with methods: publicationArchive, publicationPosts, publicationHomepage, postReactors, activeLiveStream, markPostSeen
- Comment replies: commentReplies, commentRepliesFeed
- Profile lookup by numeric ID: profileForId
- New types: Category, PublicationPost, FeedItem, SubstackTrendingResponse, SubstackCommentRepliesResponse, SubstackProfileSearchResult, SubstackFacepile, SubstackInboxItem, SubstackCategoryPublication, SubstackLiveStreamResponse
- io-ts runtime validation with `decodeOrThrow` for all API responses
- Rate limiting via `maxRequestsPerSecond` config option
- `substackUrl` config option for custom Substack domain
- `urlPrefix` config option for API URL prefix
- `perPage` config option for pagination page size
- Expanded io-ts codecs to match live Substack API responses:
  - `SubstackPreviewPostCodec` — 60+ fields including slug, canonical_url, cover_image, comment_count, restacks, type, audience, wordcount, publishedBylines, postTags, reactions
  - `SubstackNoteCodec` — full nested structures for comments, users, context, attachments, reactions, restacks
  - `SubstackCommentCodec` — name, photo_url, user_id, date, reaction_count, reactions, restacks, children_count, post_id, publication_id
  - `SubstackCommentResponseCodec` — full wrapper structure with context, parentComments, siblingComments
  - `SubstackPublicationFullPostCodec` — all fields from publication /posts endpoint
- `maybe()` helper for permissive null/undefined/omitted field handling in codecs
- Live API endpoint validation tests (`tests/unit/live-api-validation.test.ts`) probing 7 real Substack endpoints

### Changed
- `publicationUrl` is now required in `SubstackConfig`
- `postForId`, `noteForId`, `commentForId` now accept `number` (not string)
- SearchService merged into DiscoveryService for simpler architecture
- `token` is now optional in `SubstackConfig` for anonymous access
- Removed `decodeEither` helper (only `decodeOrThrow` remains)
- Comment `getCommentById` no longer fabricates `author_is_admin: false`
- Domain models expanded with complete API data:
  - `PreviewPost` / `FullPost` — url, slug, coverImage, reactions, restacks, postTags, commentCount, wordcount, type, audience, description, podcastUrl, author, likesCount
  - `Comment` — name, photoUrl, userId, date, reactionCount, reactions, restacks, childrenCount, isAdmin, likesCount
  - `Profile` — subscriberCount, primaryPublication, isFollowing, isSubscribed
  - `Note` — restacks, reactions, childrenCount, type, likesCount
- Service return types now return complete responses:
  - `PostService.getPostsForProfile` returns `{ posts, nextCursor }` for cursor-based pagination
  - `CommentService.getCommentsForPost` returns `{ comments, more }` for reliable pagination
- `body_json` fields changed from `string` to `unknown` (ProseMirror doc objects)
- E2E anonymous tests updated with reduced try/catch wrappers for validated endpoints

### Removed
- `SearchService` class (merged into `DiscoveryService`)
- Dead type exports that had zero consumers

## [0.4.0] - 2024-12-19

### Added
- Comprehensive documentation restructuring
- Improved README with focus on quick start and key features

### Changed
- Streamlined README following open-source best practices
- Enhanced project structure and organization

## Release Notes

For the latest releases and detailed release notes, please visit our [GitHub Releases](https://github.com/christopher-s/substack-api/releases) page.

## Migration Guide

### From v0.3.x to v0.4.x

No breaking changes in this version. All existing code should continue to work as expected.

### Contributing to Changelog

When adding new features or making changes:

1. Add entries to the "Unreleased" section
2. Follow the Keep a Changelog format
3. Categorize changes as Added, Changed, Deprecated, Removed, Fixed, or Security
4. Move entries to a versioned section when releasing