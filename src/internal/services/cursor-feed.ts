import * as t from 'io-ts'
import type { HttpClient } from '@substack-api/internal/http-client'
import type { FeedItem } from '@substack-api/internal/types'
import { SubstackInboxItemCodec } from '@substack-api/internal/types'
import { decodeOrThrow } from '@substack-api/internal/validation'
import type { ActivityFeedTab } from '@substack-api/internal/services/feed-types'

/**
 * Shared cursor-feed fetcher for paginated feed endpoints.
 * Handles the common pattern: fetch URL, normalize items/nextCursor/tabs.
 */
export async function fetchCursorFeed(
  client: HttpClient,
  url: string
): Promise<{ items: FeedItem[]; nextCursor: string | null; tabs?: ActivityFeedTab[] }> {
  const response = await client.get<unknown>(url)

  const decoded = decodeOrThrow(
    t.type({
      items: t.union([t.array(t.unknown), t.null, t.undefined]),
      nextCursor: t.union([t.string, t.null, t.undefined]),
      tabs: t.union([t.array(t.unknown), t.null, t.undefined])
    }),
    response,
    'cursor feed response'
  )

  const items = (decoded.items || []).map((item, i) => {
    // Validate items if they have the inbox item shape; otherwise pass through
    // since feed endpoints return heterogeneous items (posts, notes, comments)
    if (item && typeof item === 'object' && 'post_id' in item) {
      return decodeOrThrow(SubstackInboxItemCodec, item, `Feed item ${i}`) as unknown as FeedItem
    }
    return item as FeedItem
  })

  // Normalize empty string to null so consumers don't loop forever
  const nextCursor = decoded.nextCursor && decoded.nextCursor !== '' ? decoded.nextCursor : null

  const tabs: ActivityFeedTab[] | undefined = decoded.tabs
    ? (decoded.tabs as ActivityFeedTab[])
    : undefined

  return {
    items,
    nextCursor,
    ...(tabs && { tabs })
  }
}
