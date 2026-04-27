import { isRight } from 'fp-ts/lib/Either'
import {
  SubstackCategoryCodec,
  SubstackPreviewPostCodec,
  SubstackCommentCodec,
  SubstackCommentResponseCodec,
  SubstackCommentRepliesResponseCodec,
  SubstackNoteCodec,
  SubstackInboxItemCodec
} from '../src/internal/types'

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
    // Log first few errors
    const errors = (result as any).left.slice(0, 3)
    errors.forEach((e: any) => console.log(`     ${e.message}`))
    return false
  }
}

async function main() {
  let passed = 0
  let failed = 0

  // 1. Categories
  console.log('\n📡 /api/v1/categories')
  try {
    const data = await probe(`${BASE_URL}/api/v1/categories`) as unknown[]
    console.log(`   Found ${data.length} categories`)
    if (data.length > 0) {
      const ok = validate('First category', SubstackCategoryCodec, data[0])
      ok ? passed++ : failed++
    }
  } catch (e) {
    console.log(`  ❌ Failed: ${e}`)
    failed++
  }

  // 2. Profile posts (anonymous)
  console.log('\n📡 /api/v1/profile/posts')
  try {
    const data = await probe(
      `${BASE_URL}/api/v1/profile/posts?profile_user_id=28963877&limit=3&offset=0`
    ) as { posts?: unknown[] }
    console.log(`   Found ${data.posts?.length ?? 0} posts`)
    if (data.posts && data.posts.length > 0) {
      const ok = validate('First post', SubstackPreviewPostCodec, data.posts[0])
      ok ? passed++ : failed++
    } else {
      console.log('   ⚠️ No posts to validate (profile may have no posts)')
    }
  } catch (e) {
    console.log(`  ❌ Failed: ${e}`)
    failed++
  }

  // 3. Inbox top (anonymous trending replacement)
  console.log('\n📡 /api/v1/inbox/top')
  try {
    const data = await probe(`${BASE_URL}/api/v1/inbox/top?limit=3`) as { items?: unknown[] }
    console.log(`   Found ${data.items?.length ?? 0} items`)
    if (data.items && data.items.length > 0) {
      const ok = validate('First inbox item', SubstackInboxItemCodec, data.items[0])
      ok ? passed++ : failed++
    } else {
      console.log('   ⚠️ No items to validate')
    }
  } catch (e) {
    console.log(`  ❌ Failed: ${e}`)
    failed++
  }

  // 4. Comment by ID (need a valid comment ID)
  console.log('\n📡 /api/v1/reader/comment/{id}')
  try {
    // Try a known comment ID from e2e tests
    const data = await probe(`${BASE_URL}/api/v1/reader/comment/176729823`)
    const ok = validate('Comment response', SubstackCommentResponseCodec, data)
    ok ? passed++ : failed++
  } catch (e) {
    console.log(`  ❌ Failed: ${e}`)
    failed++
  }

  // 5. Comment replies
  console.log('\n📡 /api/v1/reader/comment/{id}/replies')
  try {
    const data = await probe(`${BASE_URL}/api/v1/reader/comment/176729823/replies`)
    const ok = validate('Comment replies', SubstackCommentRepliesResponseCodec, data)
    ok ? passed++ : failed++
  } catch (e) {
    console.log(`  ❌ Failed: ${e}`)
    failed++
  }

  // 6. Post comments
  console.log('\n📡 /api/v1/post/{id}/comments')
  try {
    const data = await probe(`${BASE_URL}/api/v1/post/176729823/comments`) as { comments?: unknown[] }
    console.log(`   Found ${data.comments?.length ?? 0} comments`)
    if (data.comments && data.comments.length > 0) {
      const ok = validate('First comment', SubstackCommentCodec, data.comments[0])
      ok ? passed++ : failed++
    } else {
      console.log('   ⚠️ No comments to validate')
    }
  } catch (e) {
    console.log(`  ❌ Failed: ${e}`)
    failed++
  }

  // 7. Profile feed notes
  console.log('\n📡 /api/v1/reader/feed/profile/{id}?types=note')
  try {
    const data = await probe(
      `${BASE_URL}/api/v1/reader/feed/profile/28963877?types=note&limit=3`
    ) as { items?: unknown[] }
    console.log(`   Found ${data.items?.length ?? 0} notes`)
    if (data.items && data.items.length > 0) {
      const ok = validate('First note', SubstackNoteCodec, data.items[0])
      ok ? passed++ : failed++
    } else {
      console.log('   ⚠️ No notes to validate')
    }
  } catch (e) {
    console.log(`  ❌ Failed: ${e}`)
    failed++
  }

  console.log(`\n📊 Results: ${passed} passed, ${failed} failed`)
  process.exit(failed > 0 ? 1 : 0)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
