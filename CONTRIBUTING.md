# Contributing to Substack API

Thank you for considering contributing to this project. This document covers development setup, testing, and the contribution process.

## Development Setup

### Prerequisites

- Node.js 18 or higher
- pnpm (recommended), npm, or yarn
- Git

### Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/christopher-s/substack-api.git
   cd substack-api
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Build the project:
   ```bash
   pnpm build
   ```

4. Run the test suite:
   ```bash
   pnpm test
   ```

### Environment Setup for E2E Tests

Create a `.env` file for live API testing:

```bash
SUBSTACK_API_KEY=your-connect-sid-cookie-value
SUBSTACK_HOSTNAME=example.substack.com
```

To obtain your `substack.sid` cookie:
1. Log in to Substack in your browser
2. Open Developer Tools (F12) → Application/Storage → Cookies → `https://substack.com`
3. Copy the value of the `substack.sid` cookie

**Never commit your `.env` file.** It is already listed in `.gitignore`.

## Project Structure

```
src/
├── substack-client.ts          # Main client entry point
├── index.ts                    # Public API exports
├── domain/                     # Entity classes (Profile, Post, Note, Comment, builders)
│   ├── profile.ts
│   ├── own-profile.ts
│   ├── post.ts
│   ├── note.ts
│   ├── comment.ts
│   └── note-builder.ts
├── internal/
│   ├── services/               # Business logic by domain
│   │   ├── post-service.ts
│   │   ├── note-service.ts
│   │   ├── profile-service.ts
│   │   ├── comment-service.ts
│   │   ├── discovery-service.ts
│   │   ├── publication-service.ts
│   │   ├── following-service.ts
│   │   └── connectivity-service.ts
│   ├── http-client.ts          # HTTP abstraction with auth and rate limiting
│   ├── types/                  # io-ts codecs and internal type definitions
│   └── validation.ts           # Runtime type validation helpers
├── types/                      # Public type definitions (SubstackConfig, etc.)
tests/
├── unit/                       # Unit tests (mocked HTTP, fast)
├── integration/                # Integration tests (local test server)
└── e2e/                        # End-to-end tests (live API)
samples/                        # Example applications
docs/
├── openapi/                    # OpenAPI 3.1 specification
└── site/                       # GitHub Pages site (Scalar API reference)
```

## Testing Strategy

The project uses a four-tier testing strategy:

### 1. Unit Tests

- **Location**: `tests/unit/`
- **Purpose**: Test individual components in isolation with mocked HTTP responses
- **Speed**: Very fast (< 1 second)
- **Mocking**: Heavy use of mocks for external dependencies

```bash
pnpm test:unit          # Run once
pnpm test:watch         # Run in watch mode
pnpm test:unit:fast     # Skip live-api-validation and property tests
```

### 2. Integration Tests

- **Location**: `tests/integration/`
- **Purpose**: Test entity interactions and builder patterns against a local test server
- **Speed**: Fast (few seconds)
- **Mocking**: Mock HTTP layer, real entity logic

```bash
pnpm test:integration
pnpm test:integration:watch
```

### 3. End-to-End Tests

- **Location**: `tests/e2e/`
- **Purpose**: Validate against the real Substack API
- **Speed**: Slower (network dependent)
- **Mocking**: None — real API calls

```bash
pnpm test:e2e
```

E2E tests are designed to be safe (read-only where possible), isolated, and conditional — they skip gracefully when credentials are unavailable.

### 4. Live API Validation

- **Location**: `tests/unit/live-api-validation.test.ts`
- **Purpose**: Probe real Substack endpoints to detect schema drift
- **Behavior**: Skips on transient errors (429, 503, 403) rather than failing

```bash
pnpm test:unit --testPathPattern=live-api-validation
```

## Development Workflow

Before making changes:

```bash
pnpm lint        # Check code style and formatting
pnpm build       # Ensure TypeScript compiles
pnpm test        # Run unit + integration tests
```

Before submitting a pull request:

```bash
pnpm lint        # Fix any linting issues
pnpm format      # Format code with Prettier
pnpm build       # Ensure clean build
pnpm test        # All tests must pass
pnpm check-test-names  # Validate test naming conventions
```

### Additional commands

```bash
pnpm sample            # Run the example in samples/
pnpm test:mutation     # Run Stryker mutation testing
```

## Code Style

- Use explicit types where beneficial
- Document public APIs with JSDoc comments
- Follow consistent naming conventions
- Write unit tests for new functionality
- Use `async/await` and handle errors gracefully
- Prefer immutable data and pure functions where possible

## Pull Request Guidelines

- Keep changes focused and atomic
- Follow existing code style
- Include tests for new functionality
- Update documentation as needed
- Follow [Conventional Commits](https://www.conventionalcommits.org/): `feat:`, `fix:`, `test:`, `docs:`
- Describe your changes in the PR description
- Ensure all CI checks pass

## Release Process

Releases are automated via [semantic-release](https://semantic-release.gitbook.io/) in GitHub Actions. The workflow:

1. Commits to `main` are analyzed
2. Version bumps are determined from conventional commit messages
3. Changelog is generated automatically
4. Package is published to npm
5. GitHub release is created

No manual version bumps or publish steps are required.

## Security

- **Never commit** your `.env` file or API credentials
- **Use repository secrets** for CI/CD credentials
- E2E tests should be read-only operations where possible

## Getting Help

- Check existing tests for patterns and examples
- Review the codebase for similar implementations
- Open an issue for clarification on requirements
- Ask questions in pull request discussions
