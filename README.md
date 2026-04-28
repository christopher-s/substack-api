# Substack API

[![npm version](https://badge.fury.io/js/substack-api.svg)](https://badge.fury.io/js/substack-api)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)

A modern, type-safe TypeScript client for the Substack API. Build newsletter automation, content management tools, and subscriber analytics with ease.

## QuickStart

```bash
pnpm add substack-api
```

```typescript
import { SubstackClient } from 'substack-api';

// Initialize client with your token
const client = new SubstackClient({
  token: 'your-connect-sid-cookie-value',
  publicationUrl: 'example.substack.com'
});

// Get your profile and iterate through posts
const profile = await client.ownProfile();
for await (const post of profile.posts({ limit: 5 })) {
  console.log(`📄 "${post.title}" - ${post.publishedAt?.toLocaleDateString()}`);
}

// Test connectivity
const isConnected = await client.testConnectivity();
```

## Documentation

📚 **Complete documentation available in the [`docs/`](docs/) directory.**

- [Installation Guide](docs/installation.md) - Setup and requirements
- [QuickStart Tutorial](docs/quickstart.md) - Get started in minutes
- [API Reference](docs/api-reference.md) - Complete method documentation
- [Entity Model](docs/entity-model.md) - Modern object-oriented API
- [Examples](docs/examples.md) - Real-world usage patterns

🌐 **Interactive API Reference**: [https://christopher-s.github.io/substack-api/](https://christopher-s.github.io/substack-api/)

## License

MIT
