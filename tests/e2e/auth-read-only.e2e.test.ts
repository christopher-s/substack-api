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
      urlPrefix: 'api/v1'
    })
  })

  // ── Connectivity ──────────────────────────────────────────────────
  describe('connectivity', () => {
    test(
      'should verify API connectivity',
      async () => {
        const connected = await client.testConnectivity()
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
        const profile = await client.ownProfile()
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
        const unread = await client.chatUnreadCount()
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
        const inbox = await client.chatInbox()
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
        const inbox = await client.chatInbox({ tab: 'people' })
        expect(inbox).toBeTruthy()
        expect(Array.isArray(inbox.threads)).toBe(true)
        console.log(`People inbox: ${inbox.threads.length} threads`)
      },
      TIMEOUT
    )

    test(
      'should iterate inbox threads with limit',
      async () => {
        const threads = []
        for await (const thread of client.chatInboxThreads({ limit: 3 })) {
          threads.push(thread)
        }
        expect(threads.length).toBeLessThanOrEqual(3)
        console.log(`Iterated ${threads.length} inbox threads`)
      },
      TIMEOUT
    )

    test(
      'should get chat invites',
      async () => {
        const invites = await client.chatInvites()
        expect(invites).toBeTruthy()
        expect(Array.isArray(invites.threads)).toBe(true)
        console.log(`Invites: ${invites.threads.length} threads`)
      },
      TIMEOUT
    )

    test(
      'should get chat reactions metadata',
      async () => {
        const reactions = await client.chatReactions()
        expect(reactions).toBeTruthy()
        expect(Array.isArray(reactions.suggestedReactionTypes)).toBe(true)
        console.log(`Reaction types: ${reactions.suggestedReactionTypes.join(', ')}`)
      },
      TIMEOUT
    )

    test(
      'should get realtime token for chat channel',
      async () => {
        const token = await client.chatRealtimeToken('chat:general')
        expect(token).toBeTruthy()
        expect(typeof token.token).toBe('string')
        expect(typeof token.endpoint).toBe('string')
        console.log(`Realtime token obtained, endpoint: ${token.endpoint}`)
      },
      TIMEOUT
    )

    test(
      'should get DM messages when inbox has threads',
      async () => {
        const inbox = await client.chatInbox()
        const dmThread = inbox.threads.find((t) => t.uuid && t.type !== 'chat')
        if (!dmThread?.uuid) {
          console.log('No DM threads found, skipping DM test')
          return
        }
        const dm = await client.chatDm(dmThread.uuid)
        expect(dm).toBeTruthy()
        expect(Array.isArray(dm.messages)).toBe(true)
        expect(typeof dm.more).toBe('boolean')
        console.log(`DM with ${dmThread.uuid}: ${dm.messages.length} messages`)
      },
      TIMEOUT
    )
  })

  // ── Publication (auth + publication required, read-only) ───────────
  describe('publication', () => {
    test(
      'should get publication details',
      async () => {
        const details = await client.publicationDetails()
        expect(details).toBeTruthy()
        console.log(`Publication details retrieved`)
      },
      TIMEOUT
    )

    test(
      'should get publication tags',
      async () => {
        const tags = await client.publicationTags()
        expect(tags).toBeTruthy()
        console.log(`Publication tags retrieved`)
      },
      TIMEOUT
    )

    test(
      'should get publication posts',
      async () => {
        const posts = []
        for await (const post of client.publicationPosts({ limit: 3 })) {
          posts.push(post)
        }
        expect(posts.length).toBeLessThanOrEqual(3)
        console.log(`Publication posts: ${posts.length}`)
      },
      TIMEOUT
    )

    test(
      'should get publication archive',
      async () => {
        const posts = []
        for await (const post of client.publicationArchive({ limit: 3 })) {
          posts.push(post)
        }
        expect(posts.length).toBeLessThanOrEqual(3)
        console.log(`Archive posts: ${posts.length}`)
      },
      TIMEOUT
    )

    test(
      'should get publication homepage',
      async () => {
        const homepage = await client.publicationHomepage()
        expect(homepage).toBeTruthy()
        console.log(`Homepage retrieved`)
      },
      TIMEOUT
    )

    test(
      'should get post counts',
      async () => {
        const counts = await client.postCounts()
        expect(counts).toBeTruthy()
        console.log(`Post counts retrieved`)
      },
      TIMEOUT
    )
  })

  // ── Dashboard / Stats (auth + publication required, read-only) ─────
  describe('dashboard and stats', () => {
    test(
      'should get subscriber stats',
      async () => {
        const stats = await client.subscriberStats()
        expect(stats).toBeTruthy()
        console.log(`Subscriber stats retrieved`)
      },
      TIMEOUT
    )

    test(
      'should get dashboard summary',
      async () => {
        const summary = await client.dashboardSummary()
        expect(summary).toBeTruthy()
        console.log(`Dashboard summary retrieved`)
      },
      TIMEOUT
    )

    test(
      'should get growth sources',
      async () => {
        const toDate = new Date().toISOString().split('T')[0]
        const fromDate = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0]
        const sources = await client.growthSources({ fromDate, toDate })
        expect(sources).toBeTruthy()
        console.log(`Growth sources retrieved`)
      },
      TIMEOUT
    )
  })

  // ── Settings (auth + publication required, read-only) ──────────────
  describe('settings', () => {
    test(
      'should get publisher settings',
      async () => {
        const settings = await client.publisherSettings()
        expect(settings).toBeTruthy()
        console.log(`Publisher settings retrieved`)
      },
      TIMEOUT
    )

    test(
      'should get publication user',
      async () => {
        const user = await client.publicationUser()
        expect(user).toBeTruthy()
        console.log(`Publication user retrieved`)
      },
      TIMEOUT
    )

    test(
      'should get sections',
      async () => {
        const sections = await client.sections()
        expect(sections).toBeTruthy()
        console.log(`Sections retrieved`)
      },
      TIMEOUT
    )

    test(
      'should get subscription settings',
      async () => {
        const settings = await client.subscriptionSettings()
        expect(settings).toBeTruthy()
        console.log(`Subscription settings retrieved`)
      },
      TIMEOUT
    )

    test(
      'should get boost settings',
      async () => {
        const settings = await client.boostSettings()
        expect(settings).toBeTruthy()
        console.log(`Boost settings retrieved`)
      },
      TIMEOUT
    )
  })

  // ── Subscriptions (auth required, read-only) ──────────────────────
  describe('subscriptions', () => {
    test(
      'should get subscriptions list',
      async () => {
        const subs = await client.subscriptions()
        expect(subs).toBeTruthy()
        console.log(`Subscriptions retrieved`)
      },
      TIMEOUT
    )

    test(
      'should get subscriptions page',
      async () => {
        const page = await client.subscriptionsPage()
        expect(page).toBeTruthy()
        console.log(`Subscriptions page retrieved`)
      },
      TIMEOUT
    )
  })

  // ── Notes (auth + publication required, read-only) ─────────────────
  describe('notes and activity', () => {
    test(
      'should get activity feed',
      async () => {
        const feed = await client.activityFeed()
        expect(feed).toBeTruthy()
        console.log(`Activity feed retrieved`)
      },
      TIMEOUT
    )

    test(
      'should get notes feed',
      async () => {
        const feed = await client.notesFeed()
        expect(feed).toBeTruthy()
        console.log(`Notes feed retrieved`)
      },
      TIMEOUT
    )

    test(
      'should get note stats for a known note',
      async () => {
        // Get a real note ID from the notes feed first
        const feed = await client.notesFeed()
        const feedItems = feed as { items?: { entity_key?: string }[] }
        const entityKey = feedItems?.items?.[0]?.entity_key
        if (!entityKey) {
          console.log('No notes found in feed, skipping note stats test')
          return
        }
        const stats = await client.noteStats(entityKey)
        expect(stats).toBeTruthy()
        console.log(`Note stats retrieved for key: ${entityKey}`)
      },
      TIMEOUT
    )
  })
})
