import type { HttpClient } from '@substack-api/internal/http-client'
import type { FeedItem, SubstackInboxItem } from '@substack-api/internal/types'
import type { SubstackTrendingResponse } from '@substack-api/internal/types/substack-trending'
import { SubstackInboxItemCodec } from '@substack-api/internal/types'
import { decodeOrThrow } from '@substack-api/internal/validation'
import type { ActivityFeedTab } from '@substack-api/internal/services/feed-types'
import { fetchCursorFeed } from '@substack-api/internal/services/cursor-feed'

/**
 * Supported tabs for the discovery feed endpoint.
 */
export type FeedTab = 'for-you' | 'top' | 'popular' | 'catchup' | 'notes' | 'explore'

/**
 * Service for feed endpoints: top posts, trending, reader feed.
 * Most endpoints work anonymously. `getFeed` with `tabId` is typically used with auth.
 */
export class FeedService {
  constructor(private readonly substackClient: HttpClient) {}

  /**
   * Get top/trending posts
   * GET /api/v1/inbox/top (anonymous)
   */
  async getTopPosts(): Promise<{ items: SubstackInboxItem[] }> {
    const response = await this.substackClient.get<{ inboxItems?: unknown[] }>('/inbox/top')
    const items = response.inboxItems || []
    return {
      items: items.map((item, i) => decodeOrThrow(SubstackInboxItemCodec, item, `Inbox item ${i}`))
    }
  }

  /**
   * Get trending posts with associated publications
   *
   * GET /api/v1/inbox/top (active endpoint)
   *
   * NOTE: The original /api/v1/trending endpoint has been deprecated by Substack
   * and now returns an HTML page. This method falls back to /inbox/top
   * and maps inbox items to the SubstackTrendingResponse shape for backward
   * compatibility. Publications and trendingPosts arrays will be empty since
   * the replacement endpoint does not provide them.
   */
  async getTrending(options?: {
    limit?: number
    offset?: number
  }): Promise<SubstackTrendingResponse> {
    const params = new URLSearchParams()
    if (options?.limit !== undefined) {
      params.set('limit', String(options.limit))
    }
    if (options?.offset !== undefined) {
      params.set('offset', String(options.offset))
    }
    const query = params.toString() ? `?${params.toString()}` : ''

    // Fetch from /inbox/top since /trending is deprecated
    const response = await this.substackClient.get<{ inboxItems?: unknown[] }>(`/inbox/top${query}`)
    const inboxItems = (response.inboxItems || []) as SubstackInboxItem[]

    // Map inbox items to trending post shape for backward compatibility
    const posts = inboxItems.map((item) => this.mapInboxItemToTrendingPost(item))

    return {
      posts,
      publications: [],
      trendingPosts: []
    }
  }

  /**
   * Map an inbox item to the trending post shape.
   * Derives missing fields where possible.
   */
  private mapInboxItemToTrendingPost(item: SubstackInboxItem): {
    id: number
    title: string
    slug: string
    post_date: string
    type: string
    audience?: string
    subtitle?: string
    canonical_url?: string
    reactions?: Record<string, number>
    restacks?: number
    wordcount?: number
    comment_count?: number
    cover_image?: string
    publishedBylines?: Array<{
      id: number
      name: string
      handle: string
      photo_url: string
    }>
  } {
    // Derive slug from web_url if available
    let slug = ''
    if (item.web_url) {
      const parts = item.web_url.split('/')
      const last = parts.pop() || ''
      slug = last.split('?')[0]
    }

    return {
      id: item.post_id,
      title: item.title,
      slug,
      post_date: item.content_date || '',
      type: item.postType || item.type || 'newsletter',
      audience: item.audience || undefined,
      subtitle: item.subtitle || undefined,
      canonical_url: item.web_url || undefined,
      reactions:
        item.like_count != null ? ({ '❤': item.like_count } as Record<string, number>) : undefined,
      restacks: undefined,
      wordcount: item.duration_metadata?.word_count || undefined,
      comment_count: item.comment_count || undefined,
      cover_image: item.cover_photo_url || undefined,
      publishedBylines: item.published_bylines
        ? item.published_bylines
            .filter((b) => b.handle != null)
            .map((b) => ({
              id: b.id,
              name: b.name,
              handle: b.handle as string,
              photo_url: b.photo_url
            }))
        : undefined
    }
  }

  /**
   * Get reader feed (discovery or activity).
   * GET /api/v1/reader/feed?tab={tab}&type=base (anonymous)
   * GET /api/v1/reader/feed?tab_id={tabId} (authenticated, includes tabs metadata)
   */
  async getFeed(options?: { tab?: FeedTab; tabId?: string; cursor?: string }): Promise<{
    items: FeedItem[]
    nextCursor: string | null
    tabs?: ActivityFeedTab[]
  }> {
    const params = new URLSearchParams()
    if (options?.tabId) {
      params.set('tab_id', options.tabId)
    } else {
      params.set('tab', options?.tab || 'for-you')
      params.set('type', 'base')
    }
    if (options?.cursor) {
      params.set('cursor', options.cursor)
    }
    return fetchCursorFeed(this.substackClient, `/reader/feed?${params.toString()}`)
  }
}
