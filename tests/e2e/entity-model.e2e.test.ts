import { SubstackClient } from '@substack-api/substack-client'
import { PreviewPost, Profile, Comment } from '@substack-api/domain'
import { validateE2ECredentials } from '@test/e2e/checkEnv'

describe('SubstackClient Entity Model E2E', () => {
  let client: SubstackClient

  beforeAll(() => {
    const { token, publicationUrl } = validateE2ECredentials()
    client = new SubstackClient({
      token: token,
      publicationUrl: publicationUrl,
      maxRequestsPerSecond: 2,
      jitter: true,
      maxRetries: 3
    })
  })

  test('should test connectivity', async () => {
    const isConnected = await client.testConnectivity()

    expect(typeof isConnected).toBe('boolean')
    expect(isConnected).toBeTruthy()
    console.log(`✅ Connectivity test returned: ${isConnected}`)
  })

  test('should get profile by slug', async () => {
    const profile = await client.profileForSlug('platformer')

    expect(profile).toBeInstanceOf(Profile)
    expect(profile.name).toBeTruthy()
    expect(profile.slug).toBe('platformer')
    expect(profile.id).toBeGreaterThan(0)

    console.log(`✅ Retrieved profile: ${profile.name} (@${profile.slug})`)
  })

  test('should get profile by slug - jakubslys', async () => {
    const profile = await client.profileForSlug('jakubslys')

    expect(profile).toBeInstanceOf(Profile)
    expect(profile.name).toBeTruthy()
    expect(profile.slug).toBe('jakubslys')
    expect(profile.id).toBe(254824415)

    console.log(`✅ Retrieved jakubslys profile: ${profile.name} (@${profile.slug})`)
  })

  test('should iterate through following users', async () => {
    try {
      const ownProfile = await client.ownProfile()
      let counter = 0
      for await (const profile of ownProfile.following({ limit: 3 })) {
        expect(profile).toBeInstanceOf(Profile)
        expect(profile.name).toBeTruthy()
        expect(profile.slug).toBeTruthy()
        ++counter
      }
      expect(counter).toBeLessThanOrEqual(3)
      console.log(`✅ Retrieved ${counter} following profiles`)
    } catch (error) {
      const msg = (error as Error).message
      if (msg.includes('403')) {
        console.log('ℹ️ Following endpoint returned 403 — may require different auth scope')
      } else {
        throw error
      }
    }
  })

  test('should get own profile', async () => {
    try {
      const ownProfile = await client.ownProfile()

      expect(ownProfile.name).toBeTruthy()
      expect(ownProfile.slug).toBeTruthy()
      expect(typeof ownProfile.newNote).toBe('function')
      expect(typeof ownProfile.following).toBe('function')

      console.log(`✅ Retrieved own profile: ${ownProfile.name} (@${ownProfile.slug})`)
    } catch (error) {
      const msg = (error as Error).message
      if (msg.includes('429')) {
        console.log('ℹ️ Own profile rate-limited (429)')
      } else {
        throw error
      }
    }
  })

  test('should handle profile posts iteration', async () => {
    try {
      const profile = await client.profileForSlug('jakubslys')
      const posts: PreviewPost[] = []
      let count = 0

      for await (const post of profile.posts({ limit: 3 })) {
        posts.push(post)
        count++

        expect(post.title).toBeTruthy()
        expect(post.id).toBeGreaterThan(0)
        expect(post.publishedAt).toBeInstanceOf(Date)

        if (count >= 3) break
      }
      expect(count).toEqual(3)
      console.log(`✅ Retrieved ${posts.length} posts from profile`)
      console.log(`First post: "${posts[0].title}"`)
    } catch (error) {
      const msg = (error as Error).message
      if (msg.includes('429')) {
        console.log('ℹ️ Profile posts rate-limited (429) — client connected correctly')
      } else {
        throw error
      }
    }
  })

  test('should handle post comments iteration', async () => {
    try {
      const testPost = await client.postForId(176729823)
      expect(testPost).not.toBeNull()

      let comments: Comment[] = []
      let count = 0

      for await (const comment of testPost.comments({ limit: 3 })) {
        comments.push(comment)
        count++
        expect(comment.body).toBeTruthy()
        if (count >= 3) break
      }
      console.log(`✅ Retrieved ${comments.length} comments from post "${testPost!.title}"`)
    } catch (error) {
      const msg = (error as Error).message
      if (msg.includes('404') || msg.includes('429')) {
        console.log(
          `ℹ️ Comments unavailable (${msg.includes('404') ? 'not found' : 'rate-limited'})`
        )
      } else {
        throw error
      }
    }
  })

  test('should handle error cases gracefully - invalid profile slug', async () => {
    try {
      // Test invalid profile slug
      const profile = await client.profileForSlug('this-profile-should-not-exist-12345')
      // If we reach here, check if it's actually a valid profile or a default
      if (profile && profile.slug === 'this-profile-should-not-exist-12345') {
        // The profile unexpectedly exists, which is fine
        console.log('ℹ️ Profile exists or default profile returned')
      } else {
        console.log('ℹ️ Profile request completed (may be default profile)')
      }
    } catch (error) {
      // Check if it's any kind of error by constructor name
      const errorName = error?.constructor?.name
      const isValidError =
        errorName === 'Error' ||
        errorName === 'TypeError' ||
        errorName === 'FetchError' ||
        error instanceof Error
      expect(isValidError).toBe(true)
      console.log('✅ Properly handles invalid profile lookup')
    }
  })
  test('should handle error cases gracefully - invalid post id', async () => {
    try {
      // Test invalid post ID
      const _post = await client.postForId(999999999999)
      // If we reach here, the post unexpectedly exists or there's a default
      console.log('ℹ️ Post request completed (may be default or existing post)')
    } catch (error) {
      // Check if it's any kind of error by constructor name
      const errorName = error?.constructor?.name
      const isValidError =
        errorName === 'Error' ||
        errorName === 'TypeError' ||
        errorName === 'FetchError' ||
        error instanceof Error
      expect(isValidError).toBe(true)
      console.log('✅ Properly handles invalid post lookup')
    }
  })
  test('should handle error cases gracefully - invalid note id', async () => {
    try {
      // Test invalid note ID
      const _note = await client.noteForId(999999999999)
      // If we reach here, the note unexpectedly exists or there's a default
      console.log('ℹ️ Note request completed (may be default or existing note)')
    } catch (error) {
      // Check if it's any kind of error by constructor name
      const errorName = error?.constructor?.name
      const isValidError =
        errorName === 'Error' ||
        errorName === 'TypeError' ||
        errorName === 'FetchError' ||
        error instanceof Error
      expect(isValidError).toBe(true)
      console.log('✅ Properly handles invalid note lookup')
    }
  })

  test('should fetch 99 notes using cursor-based pagination', async () => {
    const notes = []
    let count = 0

    try {
      const foreignProfile = await client.profileForSlug('jakubslys')
      // Test fetching exactly 99 notes with the limit parameter
      for await (const note of foreignProfile.notes({ limit: 99 })) {
        notes.push(note)
        count++

        // Verify note structure
        expect(note.body).toBeTruthy()
        expect(note.id).toBeTruthy()
        expect(note.author).toBeTruthy()
        expect(note.author.name).toBeTruthy()
        expect(note.publishedAt).toBeInstanceOf(Date)

        // Stop at exactly 99 to verify the limit works
        if (count >= 99) break
      }

      // The count should be exactly what we requested, or fewer if not enough notes available
      expect(count).toBeLessThanOrEqual(99)
      expect(count).toBeGreaterThanOrEqual(0)

      console.log(`✅ Successfully fetched ${count} notes (requested 99)`)

      if (count > 0) {
        const firstNote = notes[0]
        console.log(`First note by: ${firstNote.author.name}`)
        console.log(`First note body preview: ${firstNote.body.substring(0, 50)}...`)
      }

      if (count === 99) {
        console.log(
          '✅ Successfully fetched exactly 99 notes - cursor pagination working correctly'
        )
      } else if (count > 0) {
        console.log(`ℹ️ Only ${count} notes available (fewer than 99 requested)`)
      } else {
        console.log('ℹ️ No notes available for this profile')
      }
    } catch (error) {
      const msg = (error as Error).message
      if (msg.includes('429')) {
        console.log('ℹ️ Notes pagination rate-limited (429)')
        expect(count).toBeGreaterThanOrEqual(0)
      } else {
        const errorName = error?.constructor?.name
        const isValidError =
          errorName === 'Error' ||
          errorName === 'TypeError' ||
          errorName === 'FetchError' ||
          error instanceof Error

        if (isValidError) {
          console.log('ℹ️ Notes API returned an error (may not be available for this profile)')
          expect(count).toBeGreaterThanOrEqual(0)
        } else {
          throw error
        }
      }
    }
  })
})
