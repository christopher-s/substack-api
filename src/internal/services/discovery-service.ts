import type { HttpClient } from '@substack-api/internal/http-client'
import type {
  SubstackCategory,
  SubstackCategoryPublication,
  SubstackInboxItem,
  SubstackTrendingResponse
} from '@substack-api/internal/types'
import {
  SubstackCategoryCodec,
  SubstackCategoryPublicationCodec,
  SubstackInboxItemCodec,
  SubstackTrendingResponseCodec
} from '@substack-api/internal/types'
import { decodeOrThrow } from '@substack-api/internal/validation'

/**
 * Supported tabs for the discovery feed endpoint.
 */
export type FeedTab = 'for-you' | 'top' | 'popular' | 'catchup' | 'notes' | 'explore'

/**
 * Supported tabs for the profile activity feed endpoint.
 */
export type ProfileFeedTab = 'posts' | 'notes' | 'comments' | 'likes'

/**
 * A feed item from the reader feed, search, or profile activity endpoints.
 * These endpoints return heterogeneous items (posts, comments/notes) mixed together.
 * The `type` field discriminates the item kind.
 */
export interface FeedItem {
  type: string
  entity_key: string
  [key: string]: unknown
}

/**
 * Service for discovery endpoints: trending, feed, categories, profile activity
 * All endpoints work anonymously (no auth required).
 */
export class DiscoveryService {
  constructor(private readonly substackClient: HttpClient) {}

  // ── Public methods ─────────────────────────────────────────────────

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
   * GET /api/v1/trending (anonymous)
   */
  async getTrending(options?: { limit?: number; offset?: number }): Promise<SubstackTrendingResponse> {
    const params = new URLSearchParams()
    if (options?.limit !== undefined) {
      params.set('limit', String(options.limit))
    }
    if (options?.offset !== undefined) {
      params.set('offset', String(options.offset))
    }
    const query = params.toString() ? `?${params.toString()}` : ''
    const response = await this.substackClient.get<unknown>(`/trending${query}`)
    const decoded = decodeOrThrow(SubstackTrendingResponseCodec, response, 'Trending response')
    // trendingPosts decoded as unknown[] — cast to typed interface
    return decoded as SubstackTrendingResponse
  }

  /**
   * Get discovery feed (posts, notes, comments)
   * GET /api/v1/reader/feed?tab={tab}&type=base (anonymous, paginated)
   */
  async getFeed(options?: { tab?: FeedTab; cursor?: string }): Promise<{
    items: FeedItem[]
    nextCursor: string | null
  }> {
    const tab = options?.tab || 'for-you'
    const params = new URLSearchParams({ tab, type: 'base' })
    if (options?.cursor) {
      params.set('cursor', options.cursor)
    }
    return this.fetchCursorFeed(`/reader/feed?${params.toString()}`)
  }

  /**
   * Get all categories with subcategories
   * GET /api/v1/categories (anonymous)
   */
  async getCategories(): Promise<SubstackCategory[]> {
    const response = await this.substackClient.get<unknown[]>('/categories')
    return response.map((cat, i) => decodeOrThrow(SubstackCategoryCodec, cat, `Category ${i}`))
  }

  /**
   * Get profile activity feed
   * GET /api/v1/reader/feed/profile/{id} (anonymous, paginated)
   */
  async getProfileActivity(
    profileId: number,
    options?: { tab?: ProfileFeedTab; cursor?: string }
  ): Promise<{ items: FeedItem[]; nextCursor: string | null }> {
    const params = new URLSearchParams()
    if (options?.tab) params.set('tab', options.tab)
    if (options?.cursor) params.set('cursor', options.cursor)
    const query = params.toString() ? `?${params.toString()}` : ''
    return this.fetchCursorFeed(`/reader/feed/profile/${profileId}${query}`)
  }

  /**
   * Get publication activity feed
   * GET /api/v1/reader/feed/publication/{id} (anonymous, paginated)
   */
  async getPublicationFeed(
    publicationId: number,
    options?: { tab?: string; cursor?: string }
  ): Promise<{ items: FeedItem[]; nextCursor: string | null }> {
    const params = new URLSearchParams()
    if (options?.tab) params.set('tab', options.tab)
    if (options?.cursor) params.set('cursor', options.cursor)
    const query = params.toString() ? `?${params.toString()}` : ''
    return this.fetchCursorFeed(`/reader/feed/publication/${publicationId}${query}`)
  }

  /**
   * Get profile likes feed
   * GET /api/v1/reader/feed/profile/{id}?types[]=like (anonymous, paginated)
   */
  async getProfileLikes(
    profileId: number,
    options?: { cursor?: string }
  ): Promise<{ items: FeedItem[]; nextCursor: string | null }> {
    const params = new URLSearchParams()
    params.append('types[]', 'like')
    if (options?.cursor) params.set('cursor', options.cursor)
    return this.fetchCursorFeed(`/reader/feed/profile/${profileId}?${params.toString()}`)
  }

  /**
   * Get publications in a given category
   * GET /api/v1/category/public/{category_id}/posts (anonymous)
   */
  async getCategoryPublications(
    categoryId: number | string,
    options?: { limit?: number; offset?: number }
  ): Promise<{ publications: SubstackCategoryPublication[]; more: boolean }> {
    const params = new URLSearchParams()
    if (options?.limit !== undefined) params.set('limit', String(options.limit))
    if (options?.offset !== undefined) params.set('offset', String(options.offset))
    const query = params.toString() ? `?${params.toString()}` : ''
    const response = await this.substackClient.get<{
      publications?: unknown[]
      more?: boolean
    }>(`/category/public/${categoryId}/posts${query}`)

    const publications = (response.publications || []).map((pub, i) =>
      decodeOrThrow(SubstackCategoryPublicationCodec, pub, `Category publication ${i}`)
    )

    return {
      publications,
      more: response.more || false
    }
  }

  // ── Private helpers ────────────────────────────────────────────────

  /**
   * Shared cursor-feed fetcher for paginated feed endpoints.
   * Handles the common pattern: fetch URL, normalize items/nextCursor.
   */
  private async fetchCursorFeed(url: string): Promise<{ items: FeedItem[]; nextCursor: string | null }> {
    const response = await this.substackClient.get<{
      items?: FeedItem[]
      nextCursor?: string | null
    }>(url)

    return {
      items: response.items || [],
      nextCursor: response.nextCursor || null
    }
  }
}
