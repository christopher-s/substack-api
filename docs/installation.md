# Installation

## Requirements

- Node.js 16 or higher
- npm, yarn, or pnpm package manager
- A Substack account (only required for authenticated operations -- most features work anonymously)

## NPM Installation

```bash
npm install substack-api
```

## Yarn Installation

```bash
yarn add substack-api
```

## PNPM Installation

```bash
pnpm add substack-api
```

## TypeScript Configuration

The library is written in TypeScript and includes type definitions out of the box. No additional setup is required for TypeScript projects.

For optimal TypeScript integration, ensure your `tsconfig.json` includes:

```json
{
  "compilerOptions": {
    "esModuleInterop": true,
    "moduleResolution": "node"
  }
}
```

## Verification

### Anonymous Verification

You can verify the installation without any authentication -- just provide a publication URL:

```typescript
import { SubstackClient } from 'substack-api';

const client = new SubstackClient({
  publicationUrl: 'example.substack.com'
});

async function test() {
  try {
    // Browse trending content -- no token needed
    const trending = await client.trending({ limit: 3 });
    console.log('Connection working! Trending posts:', trending.posts.length);

    // Look up a profile
    const profile = await client.profileForSlug('username');
    console.log('Found profile:', profile.name);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

test();
```

### Authenticated Verification

If you have a token, you can verify authenticated operations:

```typescript
import { SubstackClient } from 'substack-api';

const client = new SubstackClient({
  publicationUrl: 'example.substack.com',
  token: 'your-connect-sid-cookie-value'
});

async function test() {
  try {
    const isConnected = await client.testConnectivity();
    console.log('Connection status:', isConnected ? 'Connected' : 'Failed');
  } catch (error) {
    console.error('Error:', error.message);
  }
}

test();
```

## Development Installation

If you want to contribute to the library or run it from source:

1. Clone the repository:
   ```bash
   git clone https://github.com/jakub-k-slys/substack-api.git
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

4. Run tests:
   ```bash
   pnpm test
   ```

## Next Steps

Once installed, you can:

- Follow the [Quickstart](quickstart.md) guide to begin using the library
- Check out the [Examples](examples.md) for common use cases
- Read the [API Reference](api-reference.md) for detailed API documentation
