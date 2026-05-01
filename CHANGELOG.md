# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/), and this project adheres to [Semantic Versioning](https://semver.org/).

## [4.0.0] - 2026-05-01

### Changed

- Major KISS-driven simplification — 3050 lines removed
- Removed builder pattern API (`NoteBuilder`, `NoteWithLinkBuilder`, `ParagraphBuilder`, `ListBuilder`, `ListItemBuilder`) in favor of direct `publishNote(markdown)`
- Updated E2E tests from `newNote` builder to `publishNote`

### Added

- 14 new API endpoints including social interactions, reading list, notifications, pledges, and analytics
- Security hardening improvements across all services
- Bug fixes and code quality improvements from 3-iteration holistic evaluation

### Fixed

- Resolved 8 findings from KISS/security/code-quality evaluation
- Eliminated 429 rate limits with anti-detection improvements
- E2E tests now resilient to Substack rate limiting and API changes

## [3.x] - 2026-04

### Added

- Custom rate limiting replacing `axios-rate-limit` with token bucket, jitter, and FIFO queue
- Browser fingerprinting with rotating Chrome/Edge User-Agent pool
- Exponential backoff with `Retry-After` support
- io-ts type safety across all services
- Chat API service with E2E tests
- Activity feed with tabs metadata
- Note stats endpoint for analytics
- Markdown-to-HTML and markdown-to-ProseMirror converters
- Comprehensive OpenAPI 3.1 specification with Scalar documentation site
- Pre-push hooks for automated quality checks

### Changed

- Replaced axios-rate-limit with custom rate limiting
- Improved rate limit handling for inbox threads, following, and profile endpoints

### Fixed

- 429 handling for inbox threads iterator and following endpoint
- Profile posts iteration wrapped in 429 try/catch
- OpenAPI schema validation fixes

## [2.x] - 2026-03

### Added

- Entity-based API with domain models (Profile, Post, Note, Comment)
- Async iterator pagination
- Note builder for rich content
- Integration and E2E test tiers
- Category browsing and publication discovery

### Changed

- Evolved from fork of `jakub-k-slys/substack-api` into independent library

## [1.x] - 2025

### Added

- Initial TypeScript client for the Substack API
- Basic HTTP client with authentication
- Profile, post, and comment fetching
