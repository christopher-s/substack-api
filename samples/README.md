# Samples

This directory contains runnable examples demonstrating the `substack-api` client.

## Running the Example

### With environment variables

1. Copy `.env.example` to `.env` in the project root and add your credentials:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env`:
   ```
   SUBSTACK_API_KEY=your-connect-sid-cookie-value
   SUBSTACK_HOSTNAME=your-publication.substack.com
   ```

3. Run:
   ```bash
   pnpm sample
   ```

### Interactive mode

If no `.env` file is present, the sample prompts for credentials at runtime:

```bash
pnpm sample
```

## What It Demonstrates

The `index.ts` example showcases:

1. **Authentication** — Connecting with token and publication URL
2. **Connectivity testing** — Verifying the API connection
3. **Profile fetching** — Getting your own profile information
4. **Content listing** — Recent posts and notes
5. **Social features** — Users you follow

## Requirements

- Node.js 18+
- Valid Substack credentials (for authenticated features)
- A Substack publication (for publication-scoped features)

## Troubleshooting

If you encounter authentication errors:

- Verify your token is the full `substack.sid` cookie value
- Ensure your publication URL matches your publication
- Check that your token has not expired
