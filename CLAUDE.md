# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Build & Development
- `pnpm build` - Compile TypeScript to JavaScript
- `pnpm clean` - Remove dist/ directory
- `pnpm sample` - Run example code from samples/

### Testing
- `pnpm test` - Run unit + integration tests
- `pnpm test:all` - Run unit + integration + e2e tests
- `pnpm test:unit` - Unit tests only
- `pnpm test:integration` - Integration tests only
- `pnpm test:e2e` - End-to-end tests only
- `pnpm test:watch` - Unit tests in watch mode
- `pnpm test:integration:watch` - Integration tests in watch mode
- `pnpm test:e2e:watch` - E2E tests in watch mode
- `pnpm test:unit:smoke` - Smoke tests only (`[smoke]` tag, no coverage)
- `pnpm test:unit:fast` - Unit tests excluding live-api-validation and property tests
- `pnpm test:mutation` - Stryker mutation testing

**Running a single test file:**
- Unit: `jest tests/unit/post.test.ts`
- Integration: `jest --config jest.integration.config.js tests/integration/client.integration.test.ts`
- E2E: `jest --config jest.e2e.config.js tests/e2e/entity-model.e2e.test.ts`

**Running a single test by name:**
- `jest --testNamePattern="should fetch post by id"`

### Code Quality
- `pnpm lint` - Check code style and formatting
- `pnpm lint:fix` - Auto-fix linting issues
- `pnpm format` - Format code with Prettier
- `pnpm format:check` - Check formatting without changing files
- `pnpm check-test-names` - Validate test naming conventions

**Required before committing:** Run `pnpm lint`, `pnpm format:check`, `pnpm build`, and `pnpm test`

`pnpm lint` alone is insufficient — it does not always catch Prettier formatting drift that CI's linter step catches. Always run `pnpm format:check` (or `pnpm format` to auto-fix) as a separate verification before pushing.

## Architecture

This is a TypeScript client library for the Substack API using a service-oriented architecture:

### Core Structure
- **SubstackClient** (`src/substack-client.ts`) - Main client class that orchestrates services
- **Services** (`src/internal/services/`) - Business logic organized by domain (posts, notes, profiles, comments, etc.)
- **Domain Models** (`src/domain/`) - Entity classes with methods (Profile, Post, Note, Comment)
- **HTTP Layer** (`src/internal/http-client.ts`) - Abstraction over HTTP requests with rate limiting
- **Validation** (`src/internal/validation.ts`) - fp-ts/io-ts runtime type validation utilities

### Key Patterns
- **Entity-based API**: Domain objects have methods (e.g., `post.comments()`, `profile.posts()`)
- **Iterator Pattern**: Pagination handled via async iterators (`for await (const post of profile.posts())`)
- **Builder Pattern**: `NoteBuilder` for constructing formatted notes
- **Service Layer**: Separation of HTTP concerns from business logic
- **Functional Programming**: Uses fp-ts and io-ts for validation and error handling

### Dependencies
- **fp-ts**: Functional programming utilities
- **io-ts**: Runtime type validation
- **axios** + **axios-rate-limit**: HTTP transport and rate limiting
- **Jest**: Testing framework with separate configs for unit/integration/e2e tests

### Testing Strategy
- **Unit tests**: Mock HTTP responses, test business logic. Coverage threshold: 80% across branches, functions, lines, statements.
- **Integration tests**: Real HTTP calls against a local mock server serving `samples/api/v1/` fixtures.
- **E2E tests**: Full workflow tests against the live Substack API. Requires `SUBSTACK_API_TOKEN` and `SUBSTACK_HOSTNAME` env vars.

### File Organization
- `src/domain/` - Domain entities and builders
- `src/internal/` - Internal services, HTTP client, validation, types
- `src/types/` - Public type definitions
- `tests/unit/` - Unit tests
- `tests/integration/` - Integration tests
- `tests/e2e/` - End-to-end tests
- `samples/` - Example usage code and API fixture files

## AGENTS.md Hierarchy

Every directory contains an `AGENTS.md` with AI-specific guidance for that area. The hierarchy is navigable via parent references:

- Root: `AGENTS.md`
- `src/AGENTS.md` - Source code guidance
- `tests/AGENTS.md` - Testing strategy and conventions
- `docs/AGENTS.md` - Documentation assets (OpenAPI, Scalar)
- `samples/AGENTS.md` - Sample code and API fixtures

When working in a subdirectory, read its `AGENTS.md` for area-specific instructions.

## Commit Guidelines

Follow [Conventional Commits](https://www.conventionalcommits.org/):
- `feat: add post scheduling`
- `fix: correct auth token refresh`
- `chore: update dependencies`

Pull request titles should use the same format.
