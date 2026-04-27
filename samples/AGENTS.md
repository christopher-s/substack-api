<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-12 -->
<!-- Updated: 2026-04-12 -->

# samples/

## Purpose

Contains example code demonstrating real-world usage of the `substack-api` library, along with static API response fixtures used as reference data and test inputs. The samples show authentication, profile management, content fetching, note creation, and social features.

## Key Files

- **`index.ts`** - Main example script that demonstrates SubstackClient usage: connectivity testing, own/foreign profile fetching, listing posts and notes, listing followed users, fetching a full post by ID, and commented-out note creation examples using `NoteBuilder`.
- **`tsconfig.json`** - TypeScript configuration extending the root config. Compiles with `noEmit: true` and includes `*.ts` plus `../src/**/*` while excluding test files.
- **`README.md`** - Instructions for running the sample (environment variables or interactive mode) and expected output.

## Subdirectories

- **`api/`** - Static API response fixture tree. Not runnable code.
  - **`api/v1/`** - Fixtures organized by Substack API endpoint path:
    - `comment/` - Comment response fixtures (text, attachment, feed variants)
    - `feed/` - Feed fixtures (following, profile with query-param variants for like/note types)
    - `handle/` - Handle resolution fixtures
    - `notes/` - Notes endpoint fixtures
    - `posts/` - Post fixtures, including `by-id/` for specific post lookups
    - `profile/` - Profile post listings (with query-param fixtures for pagination)
    - `reader/` - Reader endpoint fixtures (comment, feed/profile)
    - `subscription/`, `subscriptions/` - Subscription-related fixtures
    - `user/` - User profile fixtures by ID and handle (e.g., `282291554/profile`, `jakubslys/public_profile`)

## For AI Agents (Working In This Directory)

- Run samples with `pnpm sample` from the project root (requires `SUBSTACK_API_KEY` and `SUBSTACK_HOSTNAME` env vars, or interactive input).
- The `api/v1/` tree contains raw JSON fixture files matching Substack API response shapes. These are useful for understanding API response structures when writing tests or services.
- Fixture file/directory names correspond to API endpoint segments and query strings (e.g., `343074721?types=like` represents `/api/v1/feed/profile/343074721?types=like`).
- Do not add new executable code to this directory without updating the root `package.json` scripts and this file.
- Note creation in `index.ts` is commented out to prevent accidental publishing; do not uncomment without explicit user instruction.
