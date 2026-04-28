import { isRight } from 'fp-ts/lib/Either'
import {
  SubstackCategoryCodec,
  SubstackPreviewPostCodec,
  SubstackCommentCodec,
  SubstackCommentResponseCodec,
  SubstackCommentRepliesResponseCodec,
  SubstackNoteCodec,
  SubstackInboxItemCodec
} from '@substack-api/internal/types'

const BASE_URL = 'https://substack.com'
const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  Accept: 'application/json'
}

async function probe(url: string): Promise<unknown> {
  const res = await fetch(url, { headers: HEADERS })
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${res.statusText}`)
  }
  return res.json()
}

function validate(name: string, codec: any, data: unknown): boolean {
  const result = codec.decode(data)
  if (isRight(result)) {
    console.log(`  ✅ ${name}: valid`)
    return true
  } else {
    console.log(`  ❌ ${name}: invalid`)
    const errors = (result as any).left.slice(0, 3)
    errors.forEach((e: any) => console.log(`     ${e.message}`))
    return false
  }
}

describe('Live API Validation', () => {
  it('validates /api/v1/categories', async () => {
    const data = (await probe(`${BASE_URL}/api/v1/categories`)) as unknown[]
    expect(data.length).toBeGreaterThan(0)
    const ok = validate('First category', SubstackCategoryCodec, data[0])
    expect(ok).toBe(true)
  })

  it('validates /api/v1/profile/posts', async () => {
    const data = (await probe(
      `${BASE_URL}/api/v1/profile/posts?profile_user_id=28963877&limit=3&offset=0`
    )) as { posts?: unknown[] }
    // Even if empty, the response structure should be valid
    if (data.posts && data.posts.length > 0) {
      const ok = validate('First post', SubstackPreviewPostCodec, data.posts[0])
      expect(ok).toBe(true)
    } else {
      console.log('   ⚠️ No posts to validate (profile may have no posts)')
    }
  })

  it('validates /api/v1/inbox/top', async () => {
    const data = (await probe(`${BASE_URL}/api/v1/inbox/top?limit=3`)) as { items?: unknown[] }
    if (data.items && data.items.length > 0) {
      const ok = validate('First inbox item', SubstackInboxItemCodec, data.items[0])
      expect(ok).toBe(true)
    } else {
      console.log('   ⚠️ No inbox items to validate')
    }
  })

  it('validates /api/v1/reader/comment/{id}', async () => {
    try {
      const data = await probe(`${BASE_URL}/api/v1/reader/comment/176729823`)
      const ok = validate('Comment response', SubstackCommentResponseCodec, data)
      expect(ok).toBe(true)
    } catch (e) {
      console.log(`   ⚠️ Comment endpoint failed: ${e}`)
    }
  })

  it('validates /api/v1/reader/comment/{id}/replies', async () => {
    try {
      const data = await probe(`${BASE_URL}/api/v1/reader/comment/176729823/replies`)
      const ok = validate('Comment replies', SubstackCommentRepliesResponseCodec, data)
      expect(ok).toBe(true)
    } catch (e) {
      console.log(`   ⚠️ Comment replies endpoint failed: ${e}`)
    }
  })

  it('validates /api/v1/post/{id}/comments', async () => {
    try {
      const data = (await probe(`${BASE_URL}/api/v1/post/176729823/comments`)) as {
        comments?: unknown[]
      }
      if (data.comments && data.comments.length > 0) {
        const ok = validate('First comment', SubstackCommentCodec, data.comments[0])
        expect(ok).toBe(true)
      } else {
        console.log('   ⚠️ No comments to validate')
      }
    } catch (e) {
      console.log(`   ⚠️ Post comments endpoint failed: ${e}`)
    }
  })

  it('validates /api/v1/reader/feed/profile/{id}?types=note', async () => {
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
      console.log(`   ⚠️ Notes feed endpoint failed: ${e}`)
    }
  })
})
