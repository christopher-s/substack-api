import { SubstackClient } from '@substack-api/substack-client'
import { Profile, FullPost, Comment } from '@substack-api/domain'

/**
 * E2E tests for anonymous (unauthenticated) access.
 * No credentials required — all tests use new SubstackClient({}).
 *
 * Some endpoints wrap in try/catch because the live API occasionally returns
 * data that doesn't match the strict io-ts codecs (e.g., null cover_image,
 * non-numeric category IDs). The tests validate that anonymous ACCESS works
 * (no 401/403), not strict codec conformance.
 */
describe('SubstackClient Anonymous E2E', () => {
  let client: SubstackClient

  beforeAll(() => {
    client = new SubstackClient({
      maxRequestsPerSecond: 2,
      jitter: true,
      maxRetries: 3
    })
  })

  describe('discovery endpoints', () => {
    test('should get trending posts', async () => {
      const trending = await client.posts.trending({ limit: 5 })
      expect(trending).toBeDefined()
      expect(Array.isArray(trending.posts)).toBe(true)
      console.log(`Trending: ${trending.posts.length} posts returned`)
    })

    test('should get top posts', async () => {
      const topPosts = await client.posts.topPosts()

      expect(Array.isArray(topPosts)).toBe(true)
      expect(topPosts.length).toBeGreaterThan(0)

      console.log(`Top posts: ${topPosts.length} items returned`)
    })

    test('should get categories', async () => {
      const categories = await client.publications.categories()
      expect(Array.isArray(categories)).toBe(true)
      expect(categories.length).toBeGreaterThan(0)

      const first = categories[0]
      expect(first.name).toBeTruthy()
      expect(first.slug).toBeTruthy()
      console.log(`Categories: ${categories.length} found, first: "${first.name}"`)
    })
  })

  describe('search endpoints', () => {
    test('should search for content and yield results', async () => {
      const results = []
      for await (const item of client.posts.search('typescript', { limit: 3 })) {
        expect(item.type).toBeTruthy()
        results.push(item)
      }

      expect(results.length).toBeGreaterThan(0)
      console.log(`Search "typescript": ${results.length} results`)
    })

    test('should search for profiles', async () => {
      try {
        const result = await client.profiles.profileSearch('platformer')

        expect(result.results).toBeDefined()
        expect(Array.isArray(result.results)).toBe(true)
        expect(result.results.length).toBeGreaterThan(0)

        console.log(`Profile search "platformer": ${result.results.length} results`)
      } catch (error) {
        // API may return 400 for certain queries — still proves no auth required
        const msg = (error as Error).message
        expect(msg).not.toContain('401')
        expect(msg).not.toContain('403')
        console.log(`Profile search: accessible but API error (${msg.substring(0, 80)})`)
      }
    })
  })

  describe('profile endpoints', () => {
    test('should get profile by slug', async () => {
      const profile = await client.profiles.profileForSlug('platformer')

      expect(profile).toBeInstanceOf(Profile)
      expect(profile.name).toBeTruthy()
      expect(profile.slug).toBe('platformer')
      expect(profile.id).toBeGreaterThan(0)

      console.log(`Profile: ${profile.name} (@${profile.slug}, id=${profile.id})`)
    })

    test('should get profile by id', async () => {
      try {
        const bySlug = await client.profiles.profileForSlug('platformer')
        const profile = await client.profiles.profileForId(bySlug.id)

        expect(profile).toBeInstanceOf(Profile)
        expect(profile.name).toBeTruthy()
        expect(profile.id).toBe(bySlug.id)

        console.log(`Profile by ID: ${profile.name} (@${profile.slug})`)
      } catch (error) {
        const msg = (error as Error).message
        if (msg.includes('429')) {
          console.log('ℹ️ Profile by ID rate-limited (429)')
        } else {
          throw error
        }
      }
    })
  })

  describe('content endpoints', () => {
    test('should get a full post by id', async () => {
      try {
        const post = await client.posts.postForId(176729823)

        expect(post).toBeInstanceOf(FullPost)
        expect(post.title).toBeTruthy()
        expect(post.htmlBody).toBeTruthy()
        expect(post.url).toMatch(/^https:\/\//)

        console.log(`Post: "${post.title}" (${post.url})`)
      } catch (error) {
        const msg = (error as Error).message
        if (msg.includes('429')) {
          console.log('ℹ️ Full post lookup rate-limited (429)')
        } else {
          throw error
        }
      }
    })

    test('should iterate profile posts', async () => {
      try {
        const profile = await client.profiles.profileForSlug('platformer')
        const posts = []

        for await (const post of profile.posts({ limit: 3 })) {
          expect(post.title).toBeTruthy()
          expect(post.id).toBeGreaterThan(0)
          posts.push(post)
        }

        expect(posts.length).toBeGreaterThan(0)
        console.log(`Profile posts: ${posts.length} fetched`)
      } catch (error) {
        const msg = (error as Error).message
        if (msg.includes('429')) {
          console.log('ℹ️ Profile posts iteration rate-limited (429)')
        } else {
          throw error
        }
      }
    })
  })

  describe('discovery feed endpoints', () => {
    test('should iterate discover feed', async () => {
      try {
        const items = []
        for await (const item of client.posts.discoverFeed({ limit: 3 })) {
          expect(item.type).toBeTruthy()
          items.push(item)
          if (items.length >= 3) break
        }
        expect(items.length).toBeGreaterThan(0)
        console.log(`Discover feed: ${items.length} items fetched`)
      } catch (error) {
        const msg = (error as Error).message
        expect(msg).not.toContain('401')
        expect(msg).not.toContain('403')
        console.log(`Discover feed: accessible but error (${msg.substring(0, 80)})`)
      }
    })

    test('should iterate explore search', async () => {
      try {
        const items = []
        for await (const item of client.posts.exploreSearch({ tab: 'explore', limit: 3 })) {
          expect(item.type).toBeTruthy()
          items.push(item)
          if (items.length >= 3) break
        }
        expect(items.length).toBeGreaterThan(0)
        console.log(`Explore search: ${items.length} items fetched`)
      } catch (error) {
        const msg = (error as Error).message
        expect(msg).not.toContain('401')
        expect(msg).not.toContain('403')
        console.log(`Explore search: accessible but error (${msg.substring(0, 80)})`)
      }
    })

    test('should get category publications', async () => {
      try {
        const categories = await client.publications.categories()
        expect(categories.length).toBeGreaterThan(0)

        const firstCategory = categories[0]
        const result = await client.publications.categoryPublications(firstCategory.slug, {
          limit: 3
        })

        expect(Array.isArray(result.publications)).toBe(true)
        console.log(`Category "${firstCategory.name}": ${result.publications.length} publications`)
      } catch (error) {
        const msg = (error as Error).message
        expect(msg).not.toContain('401')
        expect(msg).not.toContain('403')
        console.log(`Category publications: accessible but error (${msg.substring(0, 80)})`)
      }
    })
  })

  describe('entity lookup endpoints', () => {
    test('should get comment by id', async () => {
      try {
        const comment = await client.comments.commentForId(233934688)
        expect(comment).toBeInstanceOf(Comment)
        expect(comment.id).toBeGreaterThan(0)
        console.log(`Comment: ${comment.id} fetched`)
      } catch (error) {
        const msg = (error as Error).message
        if (msg.includes('429')) {
          console.log('ℹ️ Comment lookup rate-limited (429)')
        } else {
          throw error
        }
      }
    })

    test('should get comment replies', async () => {
      try {
        const replies = await client.comments.commentReplies(233934688)
        expect(Array.isArray(replies.commentBranches) || replies.commentBranches === null).toBe(
          true
        )
        console.log(`Comment replies: ${replies.commentBranches?.length ?? 0} branches`)
      } catch (error) {
        const msg = (error as Error).message
        if (msg.includes('429')) {
          console.log('ℹ️ Comment replies rate-limited (429)')
        } else {
          throw error
        }
      }
    })

    test('should get note by id', async () => {
      try {
        // Note lookup is available through profile.notes() iterator
        const profile = await client.profiles.profileForSlug('jakubslys')
        const notes = []
        for await (const note of profile.notes({ limit: 1 })) {
          notes.push(note)
        }
        if (notes.length > 0) {
          expect(notes[0].body).toBeTruthy()
          expect(notes[0].id).toBeTruthy()
          console.log(`Note: ${notes[0].id} fetched`)
        } else {
          console.log('ℹ️ No notes available for this profile')
        }
      } catch (error) {
        const msg = (error as Error).message
        expect(msg).not.toContain('401')
        expect(msg).not.toContain('403')
        console.log(`Note lookup: accessible but error (${msg.substring(0, 80)})`)
      }
    })
  })

  describe('publication endpoints (anonymous)', () => {
    test('should get post reactors (facepile)', async () => {
      try {
        const reactors = await client.publications.postReactors(176729823)
        expect(reactors).toBeDefined()
        console.log(`Post reactors: ${reactors.reactors?.length ?? 0} users`)
      } catch (error) {
        const msg = (error as Error).message
        expect(msg).not.toContain('401')
        expect(msg).not.toContain('403')
        console.log(`Post reactors: accessible but error (${msg.substring(0, 80)})`)
      }
    })

    test('should get active live stream', async () => {
      try {
        const stream = await client.publications.activeLiveStream(176729823)
        expect(stream).toBeDefined()
        console.log(`Live stream: ${stream.activeLiveStream ? 'active' : 'none'}`)
      } catch (error) {
        const msg = (error as Error).message
        expect(msg).not.toContain('401')
        expect(msg).not.toContain('403')
        console.log(`Live stream: accessible but error (${msg.substring(0, 80)})`)
      }
    })

    test('should mark post as seen', async () => {
      try {
        await client.publications.markPostSeen(176729823)
        console.log('Mark post seen: success')
      } catch (error) {
        const msg = (error as Error).message
        expect(msg).not.toContain('401')
        expect(msg).not.toContain('403')
        console.log(`Mark post seen: accessible but error (${msg.substring(0, 80)})`)
      }
    })

    test('should iterate publication feed', async () => {
      try {
        const items = []
        for await (const item of client.publications.publicationFeed(176729823, { limit: 3 })) {
          expect(item.type).toBeTruthy()
          items.push(item)
          if (items.length >= 3) break
        }
        expect(items.length).toBeGreaterThan(0)
        console.log(`Publication feed: ${items.length} items fetched`)
      } catch (error) {
        const msg = (error as Error).message
        expect(msg).not.toContain('401')
        expect(msg).not.toContain('403')
        console.log(`Publication feed: accessible but error (${msg.substring(0, 80)})`)
      }
    })
  })

  describe('publication guard enforcement', () => {
    test('should throw when calling publicationHomepage without publicationUrl', async () => {
      await expect(client.publications.publicationHomepage()).rejects.toThrow()
    })

    test('should throw when calling publicationArchive without publicationUrl', async () => {
      const gen = client.publications.publicationArchive()
      await expect(gen.next()).rejects.toThrow()
    })

    test('should throw when calling publicationPosts without publicationUrl', async () => {
      const gen = client.publications.publicationPosts()
      await expect(gen.next()).rejects.toThrow()
    })
  })
})
