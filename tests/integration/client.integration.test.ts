import { SubstackClient } from '@substack-api/substack-client'
import { Profile, OwnProfile, Comment, FullPost } from '@substack-api/domain'
import { get } from 'http'

describe('SubstackClient Integration Tests', () => {
  let client: SubstackClient

  beforeEach(() => {
    client = new SubstackClient({
      publicationUrl: global.INTEGRATION_SERVER.url,
      token: 'test-key',
      substackUrl: global.INTEGRATION_SERVER.url,
      urlPrefix: ''
    })
  })

  describe('Happy Path Scenarios', () => {
    describe('isConnected', () => {
      test('should test API connectivity', async () => {
        const result = await client.profiles.isConnected()
        expect(typeof result).toBe('boolean')
        expect(result).toBe(true)
      })
    })

    describe('profileForId', () => {
      test('should retrieve profile by user ID with sample data', async () => {
        const userId = 282291554

        const profile = await client.profiles.profileForId(userId)
        expect(profile).toBeInstanceOf(Profile)
        expect(profile.id).toBe(userId)
        expect(profile.name).toBe('Jenny Ouyang')
        expect(profile.bio).toContain('Former scientist turned software engineer')
        expect(profile.bio).toBeTruthy()
      })

      test('should return Profile instance with all expected properties', async () => {
        const userId = 282291554

        const profile = await client.profiles.profileForId(userId)

        expect(profile).toBeInstanceOf(Profile)
        expect(profile.id).toBe(userId)
        expect(typeof profile.name).toBe('string')
        expect(profile.name).toBeTruthy()
        expect(typeof profile.bio).toBe('string')
        expect(profile.bio).toBeTruthy()
        expect(typeof profile.posts).toBe('function')
      })

      test('should handle large user IDs correctly', async () => {
        const largeUserId = 999999999
        await expect(client.profiles.profileForId(largeUserId)).rejects.toThrow()
      })
    })

    describe('profileForSlug', () => {
      test('should retrieve profile by slug with sample data', async () => {
        const slug = 'jakubslys'

        const profile = await client.profiles.profileForSlug(slug)
        expect(profile).toBeInstanceOf(Profile)
        expect(profile.name).toBe('Jakub Slys 🎖️')
        expect(profile.bio).toContain('Ever wonder how Uber matches rides')
        expect(profile.bio).toBeTruthy()
      })

      test('should handle profileForSlug method use case workflow', async () => {
        const testSlug = 'jakubslys'

        const profile = await client.profiles.profileForSlug(testSlug)

        expect(profile).toBeInstanceOf(Profile)
        expect(profile.slug).toBe('jakubslys')
        expect(profile.name).toBeDefined()
        expect(profile.id).toBeGreaterThan(0)
        expect(typeof profile.name).toBe('string')
        expect(typeof profile.slug).toBe('string')
        expect(typeof profile.id).toBe('number')

        expect(profile.bio).toBeTruthy()
        expect(profile.bio?.length).toBeGreaterThan(0)

        expect(typeof profile.posts).toBe('function')
        expect(typeof profile.notes).toBe('function')

        console.log(`✅ Profile workflow validated for ${profile.name} (@${profile.slug})`)
      })
    })

    describe('ownProfile', () => {
      test('should handle own profile retrieval workflow', async () => {
        try {
          const profile = await client.profiles.ownProfile()
          expect(profile).toBeInstanceOf(OwnProfile)
          expect(profile.id).toBeDefined()
          expect(profile.name).toBeTruthy()
          expect(typeof profile.id).toBe('number')
        } catch (error) {
          expect(error).toBeInstanceOf(Error)
          expect((error as Error).message).toContain('Failed to get own profile')
        }
      })
    })
  })

  describe('Corner Cases and Error Handling', () => {
    describe('profileForSlug', () => {
      test('should reject empty slug parameter', async () => {
        await expect(client.profiles.profileForSlug('')).rejects.toThrow()
      })

      test('should reject whitespace-only slug parameter', async () => {
        await expect(client.profiles.profileForSlug('   ')).rejects.toThrow()
      })

      test('should handle non-existent slug gracefully', async () => {
        await expect(client.profiles.profileForSlug('nonexistentuser123')).rejects.toThrow()
      })
    })

    describe('profileForId', () => {
      test('should handle non-existent user ID gracefully', async () => {
        const nonExistentId = 999999999
        await expect(client.profiles.profileForId(nonExistentId)).rejects.toThrow()
      })
    })

    describe('commentForId', () => {
      test('should handle non-existent comment ID', async () => {
        await expect(client.comments.commentForId(999999999)).rejects.toThrow()
      })

      test('should get comment by ID with sample data', async () => {
        const commentId = 131648795

        const comment = await client.comments.commentForId(commentId)
        expect(comment).toBeInstanceOf(Comment)
        expect(comment.id).toBe(131648795)
        expect(comment.body).toContain('🧨 DO YOU KNOW WHAT REAL AUTOMATION LOOKS LIKE?')
        expect(comment.body).toContain('n8n-operator')
      })
    })

    describe('postForId', () => {
      test('should handle non-existent post ID', async () => {
        await expect(client.posts.postForId(999999999)).rejects.toThrow()
      })

      test('should retrieve full post by ID with sample data', async () => {
        const postId = 167180194

        const post = await client.posts.postForId(postId)
        expect(post).toBeInstanceOf(FullPost)
        expect(post.id).toBe(postId)
        expect(post.title).toBe('Week of June 24, 2025: Build SaaS Without Code')
        expect(post.subtitle).toBe('The New Blueprint for Solopreneurs')
        expect(post.htmlBody).toContain('<div class="captioned-image-container">')
        expect(post.htmlBody).toContain('content shatters the myth')
        expect(post.createdAt).toBeInstanceOf(Date)
        expect(post.slug).toBe('week-of-june-24-2025-build-saas-without')

        expect(post.reactions).toEqual({ '❤': 4 })
        expect(post.restacks).toBe(1)
        expect(post.postTags).toEqual([
          'tldr',
          'workflows',
          'content',
          'digest',
          'solopreneur',
          'entrepreneur',
          'agency'
        ])
        expect(post.coverImage).toContain('substack-post-media.s3.amazonaws.com')
      })

      test('should handle full post workflow with all expected properties', async () => {
        const postId = 167180194

        const post = await client.posts.postForId(postId)

        expect(post).toBeInstanceOf(FullPost)
        expect(post.id).toBe(postId)
        expect(typeof post.title).toBe('string')
        expect(post.title).toBeTruthy()
        expect(typeof post.htmlBody).toBe('string')
        expect(post.htmlBody).toBeTruthy()
        expect(post.createdAt).toBeInstanceOf(Date)

        expect(typeof post.reactions).toBe('object')
        expect(typeof post.restacks).toBe('number')
        expect(Array.isArray(post.postTags)).toBe(true)
        expect(typeof post.coverImage).toBe('string')
        expect(post.coverImage).toBeTruthy()

        expect(typeof post.comments).toBe('function')

        console.log(`✅ Full post workflow validated for "${post.title}" (ID: ${post.id})`)
      })
    })
  })

  describe('Infrastructure Tests', () => {
    test('should have integration server available', async () => {
      expect(global.INTEGRATION_SERVER).toBeDefined()
      expect(global.INTEGRATION_SERVER.url).toBeTruthy()
      expect(global.INTEGRATION_SERVER.server).toBeDefined()
    })

    test('should serve sample data correctly', async () => {
      return new Promise((resolve, reject) => {
        get(`${global.INTEGRATION_SERVER.url}/users/282291554`, (res) => {
          let data = ''
          res.on('data', (chunk) => {
            data += chunk
          })

          res.on('end', () => {
            try {
              expect(res.statusCode).toBe(200)
              const parsed = JSON.parse(data)
              expect(parsed.id).toBe(282291554)
              expect(parsed.name).toBe('Jenny Ouyang')
              resolve(undefined)
            } catch (error) {
              reject(error)
            }
          })
        }).on('error', reject)
      })
    })
  })
})
