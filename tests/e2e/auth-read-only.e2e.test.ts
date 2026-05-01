/**
 * Auth-required read-only E2E tests
 *
 * Tests all authenticated endpoints that perform READ operations only.
 * No data is created, modified, or deleted on Substack.
 *
 * Requires SUBSTACK_API_KEY and SUBSTACK_HOSTNAME in .env
 * Run: pnpm test:e2e -- tests/e2e/auth-read-only.e2e.test.ts
 */

import { SubstackClient } from '@substack-api/substack-client'
import { validateE2ECredentials } from '@test/e2e/checkEnv'

const TIMEOUT = 15000

describe('Auth Read-Only E2E', () => {
  let client: SubstackClient
  let credentials: ReturnType<typeof validateE2ECredentials>

  beforeAll(() => {
    credentials = validateE2ECredentials()
    client = new SubstackClient({
      token: credentials.token,
      publicationUrl: credentials.publicationUrl,
      substackUrl: 'https://substack.com',
      urlPrefix: 'api/v1',
      maxRequestsPerSecond: 2,
      jitter: true,
      maxRetries: 3
    })
  })

  // ── Connectivity ──────────────────────────────────────────────────
  describe('connectivity', () => {
    test(
      'should verify API connectivity',
      async () => {
        const connected = await client.profiles.isConnected()
        expect(typeof connected).toBe('boolean')
      },
      TIMEOUT
    )
  })

  // ── Own Profile ───────────────────────────────────────────────────
  describe('own profile', () => {
    test(
      'should get authenticated user profile',
      async () => {
        const profile = await client.profiles.ownProfile()
        expect(profile).toBeTruthy()
        expect(profile.name).toBeTruthy()
        expect(profile.handle).toBeTruthy()
        console.log(`Own profile: @${profile.handle} (${profile.name})`)
      },
      TIMEOUT
    )
  })

  // ── Chat (read-only) ──────────────────────────────────────────────
  describe('chat', () => {
    test(
      'should get unread message count',
      async () => {
        const unread = await client.chat.unreadCount()
        expect(unread).toBeTruthy()
        expect(typeof unread.unreadCount).toBe('number')
        expect(typeof unread.pendingInviteCount).toBe('number')
        console.log(`Unread: ${unread.unreadCount}, Pending invites: ${unread.pendingInviteCount}`)
      },
      TIMEOUT
    )

    test(
      'should get chat inbox',
      async () => {
        const inbox = await client.chat.inbox()
        expect(inbox).toBeTruthy()
        expect(Array.isArray(inbox.threads)).toBe(true)
        expect(typeof inbox.more).toBe('boolean')
        console.log(`Inbox: ${inbox.threads.length} threads, more: ${inbox.more}`)
      },
      TIMEOUT
    )

    test(
      'should get chat inbox with tab filter',
      async () => {
        const inbox = await client.chat.inbox({ tab: 'people' })
        expect(inbox).toBeTruthy()
        expect(Array.isArray(inbox.threads)).toBe(true)
        console.log(`People inbox: ${inbox.threads.length} threads`)
      },
      TIMEOUT
    )

    test(
      'should iterate inbox threads with limit',
      async () => {
        try {
          const threads = []
          for await (const thread of client.chat.inboxThreads({ limit: 3 })) {
            threads.push(thread)
          }
          expect(threads.length).toBeLessThanOrEqual(3)
          console.log(`Iterated ${threads.length} inbox threads`)
        } catch (error) {
          const msg = (error as Error).message
          if (msg.includes('429')) {
            console.log('ℹ️ Inbox threads iteration rate-limited (429)')
          } else {
            throw error
          }
        }
      },
      TIMEOUT
    )

    test(
      'should get chat invites',
      async () => {
        try {
          const invites = await client.chat.invites()
          expect(invites).toBeTruthy()
          expect(Array.isArray(invites.threads)).toBe(true)
          console.log(`Invites: ${invites.threads.length} threads`)
        } catch (error) {
          const msg = (error as Error).message
          if (msg.includes('429')) {
            console.log('ℹ️ Chat invites rate-limited (429)')
          } else {
            throw error
          }
        }
      },
      TIMEOUT
    )

    test(
      'should get chat reactions metadata',
      async () => {
        try {
          const reactions = await client.chat.reactions()
          expect(reactions).toBeTruthy()
          expect(Array.isArray(reactions.suggestedReactionTypes)).toBe(true)
          console.log(`Reaction types: ${reactions.suggestedReactionTypes.join(', ')}`)
        } catch (error) {
          const msg = (error as Error).message
          if (msg.includes('429')) {
            console.log('ℹ️ Chat reactions rate-limited (429)')
          } else {
            throw error
          }
        }
      },
      TIMEOUT
    )

    test(
      'should get realtime token for chat channel',
      async () => {
        try {
          const token = await client.chat.realtimeToken('chat:general')
          expect(token).toBeTruthy()
          expect(typeof token.token).toBe('string')
          expect(typeof token.endpoint).toBe('string')
          console.log(`Realtime token obtained, endpoint: ${token.endpoint}`)
        } catch (error) {
          const msg = (error as Error).message
          if (msg.includes('429')) {
            console.log('ℹ️ Realtime token rate-limited (429)')
          } else {
            throw error
          }
        }
      },
      TIMEOUT
    )

    test(
      'should get DM messages when inbox has threads',
      async () => {
        try {
          const inbox = await client.chat.inbox()
          const dmThread = inbox.threads.find((t) => t.uuid && t.type !== 'chat')
          if (!dmThread?.uuid) {
            console.log('No DM threads found, skipping DM test')
            return
          }
          const dm = await client.chat.dm(dmThread.uuid)
          expect(dm).toBeTruthy()
          expect(Array.isArray(dm.messages)).toBe(true)
          expect(typeof dm.more).toBe('boolean')
          console.log(`DM with ${dmThread.uuid}: ${dm.messages.length} messages`)
        } catch (error) {
          const msg = (error as Error).message
          if (msg.includes('429')) {
            console.log('ℹ️ DM messages rate-limited (429)')
          } else {
            throw error
          }
        }
      },
      TIMEOUT
    )
  })

  // ── Publication (auth + publication required, read-only) ───────────
  describe('publication', () => {
    test(
      'should get publication details',
      async () => {
        try {
          const details = await client.publications.publicationDetails()
          expect(details).toBeTruthy()
          console.log(`Publication details retrieved`)
        } catch (error) {
          const msg = (error as Error).message
          if (msg.includes('429')) {
            console.log('ℹ️ Publication details rate-limited (429)')
          } else {
            throw error
          }
        }
      },
      TIMEOUT
    )

    test(
      'should get publication tags',
      async () => {
        try {
          const tags = await client.publications.publicationTags()
          expect(tags).toBeTruthy()
          console.log(`Publication tags retrieved`)
        } catch (error) {
          const msg = (error as Error).message
          if (msg.includes('429')) {
            console.log('ℹ️ Publication tags rate-limited (429)')
          } else {
            throw error
          }
        }
      },
      TIMEOUT
    )

    test(
      'should get publication posts',
      async () => {
        try {
          const posts = []
          for await (const post of client.publications.publicationPosts({ limit: 3 })) {
            posts.push(post)
          }
          expect(posts.length).toBeLessThanOrEqual(3)
          console.log(`Publication posts: ${posts.length}`)
        } catch (error) {
          const msg = (error as Error).message
          if (msg.includes('429')) {
            console.log('ℹ️ Publication posts rate-limited (429)')
          } else {
            throw error
          }
        }
      },
      TIMEOUT
    )

    test(
      'should get publication archive',
      async () => {
        try {
          const posts = []
          for await (const post of client.publications.publicationArchive({ limit: 3 })) {
            posts.push(post)
          }
          expect(posts.length).toBeLessThanOrEqual(3)
          console.log(`Archive posts: ${posts.length}`)
        } catch (error) {
          const msg = (error as Error).message
          if (msg.includes('429')) {
            console.log('ℹ️ Publication archive rate-limited (429)')
          } else {
            throw error
          }
        }
      },
      TIMEOUT
    )

    test(
      'should get publication homepage',
      async () => {
        try {
          const homepage = await client.publications.publicationHomepage()
          expect(homepage).toBeTruthy()
          console.log(`Homepage retrieved`)
        } catch (error) {
          const msg = (error as Error).message
          if (msg.includes('429')) {
            console.log('ℹ️ Publication homepage rate-limited (429)')
          } else {
            throw error
          }
        }
      },
      TIMEOUT
    )

    test(
      'should get post counts',
      async () => {
        try {
          const counts = await client.publications.postCounts()
          expect(counts).toBeTruthy()
          console.log(`Post counts retrieved`)
        } catch (error) {
          const msg = (error as Error).message
          if (msg.includes('429')) {
            console.log('ℹ️ Post counts rate-limited (429)')
          } else {
            throw error
          }
        }
      },
      TIMEOUT
    )
  })

  // ── Dashboard / Stats (auth + publication required, read-only) ─────
  describe('dashboard and stats', () => {
    test(
      'should get subscriber stats',
      async () => {
        try {
          const stats = await client.analytics.subscriberStats()
          expect(stats).toBeTruthy()
          console.log(`Subscriber stats retrieved`)
        } catch (error) {
          const msg = (error as Error).message
          if (msg.includes('429')) {
            console.log('ℹ️ Subscriber stats rate-limited (429)')
          } else {
            throw error
          }
        }
      },
      TIMEOUT
    )

    test(
      'should get dashboard summary',
      async () => {
        try {
          const summary = await client.analytics.dashboardSummary()
          expect(summary).toBeTruthy()
          console.log(`Dashboard summary retrieved`)
        } catch (error) {
          const msg = (error as Error).message
          if (msg.includes('429')) {
            console.log('ℹ️ Dashboard summary rate-limited (429)')
          } else {
            throw error
          }
        }
      },
      TIMEOUT
    )

    test(
      'should get growth sources',
      async () => {
        try {
          const toDate = new Date().toISOString().split('T')[0]
          const fromDate = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0]
          const sources = await client.analytics.growthSources({ fromDate, toDate })
          expect(sources).toBeTruthy()
          console.log(`Growth sources retrieved`)
        } catch (error) {
          const msg = (error as Error).message
          if (msg.includes('429')) {
            console.log('ℹ️ Growth sources rate-limited (429)')
          } else {
            throw error
          }
        }
      },
      TIMEOUT
    )
  })

  // ── Settings (auth + publication required, read-only) ──────────────
  describe('settings', () => {
    test(
      'should get publisher settings',
      async () => {
        try {
          const settings = await client.publications.publisherSettings()
          expect(settings).toBeTruthy()
          console.log(`Publisher settings retrieved`)
        } catch (error) {
          const msg = (error as Error).message
          if (msg.includes('429')) {
            console.log('ℹ️ Publisher settings rate-limited (429)')
          } else {
            throw error
          }
        }
      },
      TIMEOUT
    )

    test(
      'should get publication user',
      async () => {
        try {
          const user = await client.publications.publicationUser()
          expect(user).toBeTruthy()
          console.log(`Publication user retrieved`)
        } catch (error) {
          const msg = (error as Error).message
          if (msg.includes('429')) {
            console.log('ℹ️ Publication user rate-limited (429)')
          } else {
            throw error
          }
        }
      },
      TIMEOUT
    )

    test(
      'should get sections',
      async () => {
        try {
          const sections = await client.publications.sections()
          expect(sections).toBeTruthy()
          console.log(`Sections retrieved`)
        } catch (error) {
          const msg = (error as Error).message
          if (msg.includes('429')) {
            console.log('ℹ️ Sections rate-limited (429)')
          } else {
            throw error
          }
        }
      },
      TIMEOUT
    )

    test(
      'should get subscription settings',
      async () => {
        try {
          const settings = await client.publications.subscriptionSettings()
          expect(settings).toBeTruthy()
          console.log(`Subscription settings retrieved`)
        } catch (error) {
          const msg = (error as Error).message
          if (msg.includes('429') || msg.includes('Invalid')) {
            console.log(`ℹ️ Subscription settings unavailable (${msg.substring(0, 80)})`)
          } else {
            throw error
          }
        }
      },
      TIMEOUT
    )

    test(
      'should get boost settings',
      async () => {
        try {
          const settings = await client.publications.boostSettings()
          expect(settings).toBeTruthy()
          console.log(`Boost settings retrieved`)
        } catch (error) {
          const msg = (error as Error).message
          if (msg.includes('429')) {
            console.log('ℹ️ Boost settings rate-limited (429)')
          } else {
            throw error
          }
        }
      },
      TIMEOUT
    )
  })

  // ── Subscriptions (auth required, read-only) ──────────────────────
  describe('subscriptions', () => {
    test(
      'should get subscriptions list',
      async () => {
        try {
          const subs = await client.publications.subscriptions()
          expect(subs).toBeTruthy()
          console.log(`Subscriptions retrieved`)
        } catch (error) {
          const msg = (error as Error).message
          if (msg.includes('429')) {
            console.log('ℹ️ Subscriptions list rate-limited (429)')
          } else {
            throw error
          }
        }
      },
      TIMEOUT
    )

    test(
      'should get subscriptions page',
      async () => {
        try {
          const page = await client.analytics.subscriptionsPage()
          expect(page).toBeTruthy()
          console.log(`Subscriptions page retrieved`)
        } catch (error) {
          const msg = (error as Error).message
          if (msg.includes('429')) {
            console.log('ℹ️ Subscriptions page rate-limited (429)')
          } else {
            throw error
          }
        }
      },
      TIMEOUT
    )
  })

  // ── Notes (auth + publication required, read-only) ─────────────────
  describe('notes and activity', () => {
    test(
      'should get activity feed',
      async () => {
        try {
          const items = []
          for await (const item of client.posts.activityFeed({ limit: 3 })) {
            items.push(item)
          }
          expect(items.length).toBeLessThanOrEqual(3)
          console.log(`Activity feed retrieved: ${items.length} items`)
        } catch (error) {
          const msg = (error as Error).message
          if (msg.includes('429')) {
            console.log('ℹ️ Activity feed rate-limited (429)')
          } else {
            throw error
          }
        }
      },
      TIMEOUT
    )

    test(
      'should get notes feed',
      async () => {
        try {
          const items = []
          for await (const item of client.publications.notesFeed({ limit: 3 })) {
            items.push(item)
          }
          expect(items.length).toBeLessThanOrEqual(3)
          console.log(`Notes feed retrieved: ${items.length} items`)
        } catch (error) {
          const msg = (error as Error).message
          if (msg.includes('429')) {
            console.log('ℹ️ Notes feed rate-limited (429)')
          } else {
            throw error
          }
        }
      },
      TIMEOUT
    )

    test(
      'should get note stats for a known note',
      async () => {
        try {
          // Get a real note ID from the notes feed first
          const items = []
          for await (const item of client.publications.notesFeed({ limit: 1 })) {
            items.push(item)
          }
          const feedItems = items as { entity_key?: string }[]
          const entityKey = feedItems[0]?.entity_key
          if (!entityKey) {
            console.log('No notes found in feed, skipping note stats test')
            return
          }
          const stats = await client.publications.noteStats(entityKey)
          expect(stats).toBeTruthy()
          console.log(`Note stats retrieved for key: ${entityKey}`)
        } catch (error) {
          const msg = (error as Error).message
          if (msg.includes('429')) {
            console.log('ℹ️ Note stats rate-limited (429)')
          } else {
            throw error
          }
        }
      },
      TIMEOUT
    )
  })
})
