import type { FeedItem } from '@substack-api/internal/types'

/**
 * Generic cursor-based pagination for feed endpoints.
 * Eliminates duplicated pagination loop logic.
 */
export async function* paginateFeed(
  fetcher: (cursor?: string) => Promise<{ items: FeedItem[]; nextCursor: string | null }>,
  limit?: number
): AsyncGenerator<FeedItem> {
  let cursor: string | undefined
  let totalYielded = 0

  while (true) {
    const result = await fetcher(cursor)

    for (const item of result.items) {
      if (limit && totalYielded >= limit) return
      yield item
      totalYielded++
    }

    if (!result.nextCursor) break
    cursor = result.nextCursor
  }
}

/**
 * Generic offset-based pagination for publication endpoints.
 * Accepts an optional mapper to transform raw items.
 */
export async function* paginateOffset<T, R = T>(
  fetcher: (offset: number, limit: number) => Promise<T[]>,
  perPage: number,
  limit?: number,
  map?: (item: T) => R
): AsyncGenerator<R> {
  let offset = 0
  let totalYielded = 0

  while (true) {
    const items = await fetcher(offset, perPage)

    for (const item of items) {
      if (limit && totalYielded >= limit) return
      yield map ? map(item) : (item as unknown as R)
      totalYielded++
    }

    if (items.length < perPage) break
    offset += perPage
  }
}
