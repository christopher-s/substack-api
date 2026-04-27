import * as t from 'io-ts'
import type { HttpClient } from '@substack-api/internal/http-client'
import type {
  FeedItem,
  SubstackCategory,
  SubstackCategoryPublication,
  SubstackInboxItem,
  SubstackProfileSearchResult,
  SubstackTrendingResponse
} from '@substack-api/internal/types'
import {
  SubstackCategoryCodec,
  SubstackCategoryPublicationCodec,
  SubstackInboxItemCodec,
  SubstackProfileSearchResponseCodec
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
   *
   * NOTE: The original /api/v1/trending endpoint has been deprecated by Substack
   * and now returns an HTML page. This method falls back to /api/v1/inbox/top
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
   * Map an inbox item to the SubstackTrendingPost shape.
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

  /**
   * Search for posts, people, publications, and notes
   * GET /api/v1/top/search?query={query} (anonymous, paginated)
   */
  async search(
    query: string,
    options?: { cursor?: string }
  ): Promise<{ items: FeedItem[]; nextCursor: string | null }> {
    const params = new URLSearchParams({ query })
    if (options?.cursor) {
      params.set('cursor', options.cursor)
    }
    return this.fetchCursorFeed(`/top/search?${params.toString()}`)
  }

  /**
   * Search for user profiles
   * GET /api/v1/profile/search?query={query}&page={page} (anonymous, page-paginated)
   */
  async searchProfiles(
    query: string,
    options?: { page?: number }
  ): Promise<{ results: SubstackProfileSearchResult[]; more: boolean }> {
    const params = new URLSearchParams({ query })
    if (options?.page !== undefined) {
      params.set('page', String(options.page))
    }
    const response = await this.substackClient.get<unknown>(`/profile/search?${params.toString()}`)
    const decoded = decodeOrThrow(SubstackProfileSearchResponseCodec, response, 'Profile search')
    return { results: decoded.results, more: decoded.more }
  }

  /**
   * Explore search with different tabs
   * GET /api/v1/search/explore/web?tab={tab}&type=base (anonymous, paginated)
   */
  async exploreSearch(options?: {
    tab?: string
    cursor?: string
  }): Promise<{ items: FeedItem[]; nextCursor: string | null }> {
    const tab = options?.tab || 'explore'
    const params = new URLSearchParams({ tab, type: 'base' })
    if (options?.cursor) {
      params.set('cursor', options.cursor)
    }
    return this.fetchCursorFeed(`/search/explore/web?${params.toString()}`)
  }

  // ── Private helpers ────────────────────────────────────────────────

  /**
   * Shared cursor-feed fetcher for paginated feed endpoints.
   * Handles the common pattern: fetch URL, normalize items/nextCursor.
   */
  private async fetchCursorFeed(
    url: string
  ): Promise<{ items: FeedItem[]; nextCursor: string | null }> {
    const response = await this.substackClient.get<unknown>(url)

    const decoded = decodeOrThrow(
      t.type({
        items: t.union([t.array(t.unknown), t.null, t.undefined]),
        nextCursor: t.union([t.string, t.null, t.undefined])
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

    return {
      items,
      nextCursor: decoded.nextCursor || null
    }
  }
}
