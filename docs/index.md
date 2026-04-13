# Substack API Documentation

Welcome to the Substack API client documentation. This modern TypeScript library provides a clean, entity-based interface to interact with Substack publications, posts, comments, and user profiles.

## Features

- **Anonymous Access** - Read public content without authentication; most features work without a token
- **Discovery & Search** - Browse trending posts, search content and profiles, explore categories
- **Publication Archive** - Access publication posts, archives, and homepages
- **Modern Entity Model** - Object-oriented API with fluent navigation (`profile.posts()`, `post.comments()`)
- **Async Iterators** - Seamless pagination with `for await` syntax
- **Type Safety** - Full TypeScript support with entity classes (Profile, Post, Note, Comment)
- **Cookie Authentication** - Secure authentication using substack.sid cookies
- **Note Creation** - Build and publish notes through the NoteBuilder pattern on OwnProfile
- **Smart Pagination** - Built-in pagination with configurable limits
- **Error Handling** - Comprehensive error handling with custom error types
- **Configurable** - Support for different hostnames, rate limits, and custom configurations

## Quick Links

- [GitHub Repository](https://github.com/christopher-s/substack-api)
- [NPM Package](https://www.npmjs.com/package/substack-api)
- [Issue Tracker](https://github.com/christopher-s/substack-api/issues)

## Contents

- [Introduction](introduction.md)
- [Installation](installation.md)
- [Quickstart](quickstart.md)
- [API Reference](api-reference.md)
- [Examples](examples.md)
- [Development](development.md)
- [Changelog](changelog.md)
