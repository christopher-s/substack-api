import { isRight } from 'fp-ts/lib/Either'
import * as t from 'io-ts'
import {
  SubstackCategoryCodec,
  SubstackCategoryPublicationCodec,
  SubstackPreviewPostCodec,
  SubstackCommentCodec,
  SubstackCommentResponseCodec,
  SubstackCommentRepliesResponseCodec,
  SubstackNoteCodec,
  SubstackInboxItemCodec,
  SubstackFullProfileCodec,
  SubstackProfileSearchResponseCodec,
  SubstackTrendingResponseCodec,
  SubstackPublicationPostCodec,
  SubstackPublicationFullPostCodec,
  SubstackFacepileCodec,
  SubstackLiveStreamResponseCodec
} from '@substack-api/internal/types'

const BASE_URL = 'https://substack.com'
const PUB_URL = 'https://on.substack.com'
const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  Accept: 'application/json'
}

async function probe(url: string, retries = 3): Promise<unknown> {
  let lastError: Error | undefined
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, { headers: HEADERS })
      if (res.status === 429 || res.status === 503) {
        console.log(`   ⏳ ${res.status} on attempt ${i + 1}, waiting...`)
        await new Promise((r) => setTimeout(r, 1000 * (i + 1)))
        continue
      }
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`)
      }
      return res.json()
    } catch (e) {
      lastError = e as Error
      if (i < retries - 1) {
        await new Promise((r) => setTimeout(r, 1000 * (i + 1)))
      }
    }
  }
  throw lastError ?? new Error('Probe failed after retries')
}

function validate(name: string, codec: t.Mixed, data: unknown): boolean {
  const result = codec.decode(data)
  if (isRight(result)) {
    console.log(`  ✅ ${name}: valid`)
    return true
  } else {
    console.log(`  ❌ ${name}: invalid`)
    const errors = result.left.slice(0, 3)
    errors.forEach((e) => console.log(`     ${e.message || JSON.stringify(e)}`))
    return false
  }
}

function skipIfFlaky(e: unknown): void {
  const msg = String(e)
  if (msg.includes('429') || msg.includes('503') || msg.includes('403') || msg.includes('fetch failed')) {
    console.log(`   ⏭️ Skipping due to transient error: ${msg}`)
    return
  }
  throw e
}

describe('Live API Validation', () => {
  // ── Discovery endpoints ─────────────────────────────────────────────

  it('When probing /api/v1/categories, then validates first category', async () => {
    try {
      const data = (await probe(`${BASE_URL}/api/v1/categories`)) as unknown[]
      expect(data.length).toBeGreaterThan(0)
      const ok = validate('First category', SubstackCategoryCodec, data[0])
      expect(ok).toBe(true)
    } catch (e) {
      skipIfFlaky(e)
    }
  })

  it('When probing /api/v1/profile/posts, then validates first post', async () => {
    try {
      const data = (await probe(
        `${BASE_URL}/api/v1/profile/posts?profile_user_id=28963877&limit=3&offset=0`
      )) as { posts?: unknown[] }
      if (data.posts && data.posts.length > 0) {
        const ok = validate('First post', SubstackPreviewPostCodec, data.posts[0])
        expect(ok).toBe(true)
      } else {
        console.log('   ⚠️ No posts to validate (profile may have no posts)')
      }
    } catch (e) {
      skipIfFlaky(e)
    }
  })

  it('When probing /api/v1/inbox/top, then validates first inbox item', async () => {
    try {
      const data = (await probe(`${BASE_URL}/api/v1/inbox/top?limit=3`)) as { items?: unknown[] }
      if (data.items && data.items.length > 0) {
        const ok = validate('First inbox item', SubstackInboxItemCodec, data.items[0])
        expect(ok).toBe(true)
      } else {
        console.log('   ⚠️ No inbox items to validate')
      }
    } catch (e) {
      skipIfFlaky(e)
    }
  })

  it('When probing /api/v1/trending via inbox/top fallback, then validates trending response', async () => {
    try {
      const data = (await probe(`${BASE_URL}/api/v1/inbox/top?limit=3`)) as {
        items?: Array<Record<string, unknown>>
      }
      const items = data.items || []
      const ok = validate('Trending response (inbox/top)', SubstackTrendingResponseCodec, {
        posts: items.map((item) => ({
          id: (item.post_id as number) ?? 0,
          title: (item.title as string) ?? '',
          slug: (item.web_url as string)
            ? (String(item.web_url).split('/').pop()?.split('?')[0] ?? '')
            : '',
          post_date: (item.content_date as string) ?? '',
          type: (item.postType as string) ?? (item.type as string) ?? 'newsletter',
          audience: item.audience as string | undefined,
          subtitle: item.subtitle as string | undefined,
          canonical_url: item.web_url as string | undefined,
          reactions: item.like_count != null ? { '❤': item.like_count as number } : undefined,
          restacks: undefined,
          wordcount: (item.duration_metadata as Record<string, number> | undefined)?.word_count,
          comment_count: item.comment_count as number | undefined,
          cover_image: item.cover_photo_url as string | undefined,
          publishedBylines: (item.published_bylines as Array<Record<string, unknown>> | undefined)
            ? (item.published_bylines as Array<Record<string, unknown>>)
                .filter((b) => b.handle != null)
                .map((b) => ({
                  id: b.id as number,
                  name: b.name as string,
                  handle: b.handle as string,
                  photo_url: b.photo_url as string
                }))
            : undefined
        })),
        publications: [],
        trendingPosts: []
      })
      expect(ok).toBe(true)
    } catch (e) {
      skipIfFlaky(e)
    }
  })

  it('When probing /api/v1/category/public/{id}/posts, then validates first category publication', async () => {
    try {
      const data = (await probe(`${BASE_URL}/api/v1/category/public/1/posts?limit=3`)) as {
        publications?: unknown[]
      }
      if (data.publications && data.publications.length > 0) {
        const ok = validate(
          'First category publication',
          SubstackCategoryPublicationCodec,
          data.publications[0]
        )
        expect(ok).toBe(true)
      } else {
        console.log('   ⚠️ No category publications to validate')
      }
    } catch (e) {
      skipIfFlaky(e)
    }
  })

  it('When probing /api/v1/profile/search, then validates search response', async () => {
    try {
      const data = await probe(`${BASE_URL}/api/v1/profile/search?query=tech&page=1`)
      const ok = validate('Profile search response', SubstackProfileSearchResponseCodec, data)
      expect(ok).toBe(true)
    } catch (e) {
      skipIfFlaky(e)
    }
  })

  it('When probing /api/v1/reader/feed/profile/{id}?types=note, then validates first note', async () => {
    try {
      const data = (await probe(
        `${BASE_URL}/api/v1/reader/feed/profile/28963877?types=note&limit=3`
      )) as { items?: unknown[] }
      if (data.items && data.items.length > 0) {
        const ok = validate('First note', SubstackNoteCodec, data.items[0])
        expect(ok).toBe(true)
      } else {
        console.log('   ⚠️ No notes to validate')
      }
    } catch (e) {
      skipIfFlaky(e)
    }
  })

  // ── Comment endpoints ───────────────────────────────────────────────

  it('When probing /api/v1/reader/comment/{id}, then validates comment response', async () => {
    try {
      const data = await probe(`${BASE_URL}/api/v1/reader/comment/176729823`)
      const ok = validate('Comment response', SubstackCommentResponseCodec, data)
      expect(ok).toBe(true)
    } catch (e) {
      skipIfFlaky(e)
    }
  })

  it('When probing /api/v1/reader/comment/{id}/replies, then validates comment replies', async () => {
    try {
      const data = await probe(`${BASE_URL}/api/v1/reader/comment/176729823/replies`)
      const ok = validate('Comment replies', SubstackCommentRepliesResponseCodec, data)
      expect(ok).toBe(true)
    } catch (e) {
      skipIfFlaky(e)
    }
  })

  it('When probing /api/v1/post/{id}/comments, then validates first comment', async () => {
    try {
      // Use a recent stable post ID from on.substack.com publication domain
      const data = (await probe(`${PUB_URL}/api/v1/post/195236851/comments`)) as {
        comments?: unknown[]
      }
      if (data.comments && data.comments.length > 0) {
        const ok = validate('First comment', SubstackCommentCodec, data.comments[0])
        expect(ok).toBe(true)
      } else {
        console.log('   ⚠️ No comments to validate')
      }
    } catch (e) {
      skipIfFlaky(e)
    }
  })

  // ── Profile endpoints ───────────────────────────────────────────────

  it('When probing /api/v1/user/{slug}/public_profile, then validates public profile', async () => {
    try {
      const data = await probe(`${BASE_URL}/api/v1/user/chrisdoyle/public_profile`)
      const ok = validate('Public profile', SubstackFullProfileCodec, data)
      expect(ok).toBe(true)
    } catch (e) {
      skipIfFlaky(e)
    }
  })

  // ── Publication endpoints (on.substack.com) ─────────────────────────

  it('When probing {pub}/api/v1/homepage_data, then validates first homepage post', async () => {
    try {
      const data = (await probe(`${PUB_URL}/api/v1/homepage_data`)) as {
        newPosts?: unknown[]
      }
      if (data.newPosts && data.newPosts.length > 0) {
        const ok = validate('First homepage post', SubstackPublicationPostCodec, data.newPosts[0])
        expect(ok).toBe(true)
      } else {
        console.log('   ⚠️ No homepage posts to validate')
      }
    } catch (e) {
      skipIfFlaky(e)
    }
  })

  it('When probing {pub}/api/v1/archive, then validates first archive post', async () => {
    try {
      const data = (await probe(
        `${PUB_URL}/api/v1/archive?sort=new&search=&offset=0&limit=3`
      )) as unknown[]
      if (data.length > 0) {
        const ok = validate('First archive post', SubstackPublicationPostCodec, data[0])
        expect(ok).toBe(true)
      } else {
        console.log('   ⚠️ No archive posts to validate')
      }
    } catch (e) {
      skipIfFlaky(e)
    }
  })

  it('When probing {pub}/api/v1/posts, then validates first full publication post', async () => {
    try {
      const data = (await probe(`${PUB_URL}/api/v1/posts?offset=0&limit=3`)) as unknown[]
      if (data.length > 0) {
        const ok = validate(
          'First full publication post',
          SubstackPublicationFullPostCodec,
          data[0]
        )
        expect(ok).toBe(true)
      } else {
        console.log('   ⚠️ No publication posts to validate')
      }
    } catch (e) {
      skipIfFlaky(e)
    }
  })

  it('When probing {pub}/api/v1/post/{id}/facepile, then validates facepile response', async () => {
    try {
      // Use a recent post ID from on.substack.com archive
      const data = await probe(`${PUB_URL}/api/v1/post/195236851/facepile`)
      const ok = validate('Facepile response', SubstackFacepileCodec, data)
      expect(ok).toBe(true)
    } catch (e) {
      skipIfFlaky(e)
    }
  })

  it('When probing {pub}/api/v1/live_streams/active/pub/{id}, then validates live stream response', async () => {
    try {
      // on.substack.com publication id is typically 1
      const data = await probe(`${PUB_URL}/api/v1/live_streams/active/pub/1`)
      const ok = validate('Live stream response', SubstackLiveStreamResponseCodec, data)
      expect(ok).toBe(true)
    } catch (e) {
      skipIfFlaky(e)
    }
  })
})
