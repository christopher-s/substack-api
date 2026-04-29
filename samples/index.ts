#!/usr/bin/env ts-node

/**
 * Substack API Client Example
 *
 * Demonstrates authentication, profile fetching, content listing,
 * and foreign profile exploration.
 */

import { SubstackClient } from '@substack-api'
import { config } from 'dotenv'
import { createInterface } from 'readline'

config()

async function getCredentials(): Promise<{ token: string; publicationUrl: string }> {
  const envToken = process.env.SUBSTACK_API_KEY || process.env.E2E_API_KEY
  const envHostname = process.env.SUBSTACK_HOSTNAME || process.env.E2E_HOSTNAME || 'substack.com'
  const envPublicationUrl = envHostname.startsWith('http') ? envHostname : `https://${envHostname}`

  if (envToken) {
    console.log('Using API token from environment variables')
    return { token: envToken, publicationUrl: envPublicationUrl }
  }

  console.log('API credentials not found in environment variables')
  const rl = createInterface({ input: process.stdin, output: process.stdout })
  const question = (prompt: string): Promise<string> =>
    new Promise((resolve) => rl.question(prompt, resolve))

  try {
    const token = await question('Enter your Substack API token: ')
    const hostname = await question('Enter your publication URL (e.g., https://yourpub.substack.com): ')
    rl.close()
    return { token: token.trim(), publicationUrl: hostname.startsWith('http') ? hostname : `https://${hostname}` }
  } catch (error) {
    rl.close()
    throw error
  }
}

async function runExample(): Promise<void> {
  console.log('Substack API Client Example\n')

  const { token, publicationUrl } = await getCredentials()
  if (!token) {
    console.log('API token is required to run this example')
    process.exit(1)
  }

  const client = new SubstackClient({ publicationUrl, token })
  console.log(`Connected to: ${publicationUrl}`)

  // Test connectivity
  console.log('\nTesting API connectivity...')
  const isConnected = await client.testConnectivity()
  if (!isConnected) {
    console.log('Failed to connect to Substack API')
    process.exit(1)
  }
  console.log('Connectivity verified')

  // Own profile
  console.log('\nFetching your profile...')
  const profile = await client.ownProfile()
  console.log(`Name: ${profile.name}`)
  console.log(`Handle: @${profile.slug}`)
  console.log(`URL: ${profile.url}`)
  if (profile.bio) console.log(`Bio: ${profile.bio}`)

  // Recent posts
  console.log('\nFetching your 3 most recent posts...')
  try {
    for await (const post of profile.posts({ limit: 3 })) {
      console.log(`  "${post.title}" — ${post.publishedAt?.toLocaleDateString() ?? 'Unknown'}`)
    }
  } catch (error) {
    console.log(`  Could not fetch posts: ${(error as Error).message}`)
  }

  // Recent notes
  console.log('\nFetching your 3 most recent notes...')
  try {
    for await (const note of profile.notes({ limit: 3 })) {
      const preview = note.body.length > 100 ? note.body.substring(0, 97) + '...' : note.body
      console.log(`  "${preview}" — ${note.publishedAt?.toLocaleDateString() ?? 'Unknown'}`)
    }
  } catch (error) {
    console.log(`  Could not fetch notes: ${(error as Error).message}`)
  }

  // Following
  console.log('\nFetching users you follow...')
  try {
    for await (const user of profile.following({ limit: 3 })) {
      console.log(`  ${user.name} (@${user.slug})`)
    }
  } catch (error) {
    console.log(`  Could not fetch following: ${(error as Error).message}`)
  }

  // Anonymous discovery example
  console.log('\nAnonymous discovery — trending posts:')
  const anonClient = new SubstackClient({})
  const trending = await anonClient.topPosts()
  for (const item of trending.slice(0, 3)) {
    if (item.type === 'post') {
      console.log(`  "${item.post.title}"`)
    }
  }

  console.log('\nExample completed successfully!')
}

if (require.main === module) {
  runExample().catch((error) => {
    console.error('Unhandled error:', error)
    process.exit(1)
  })
}

export { runExample }
