import type { HttpClient } from '@substack-api/internal/http-client'
import type { FeedItem } from '@substack-api/internal/services/discovery-service'
import type { SubstackProfileSearchResult } from '@substack-api/internal/types'
import { SubstackProfileSearchResponseCodec } from '@substack-api/internal/types'
import { decodeOrThrow } from '@substack-api/internal/validation'

/**
 * Service for search endpoint
 * Works anonymously (no auth required).
 */
export class SearchService {
  constructor(private readonly substackClient: HttpClient) {}

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
    const response = await this.substackClient.get<{
      items?: FeedItem[]
      nextCursor?: string | null
    }>(`/top/search?${params.toString()}`)

    return {
      items: response.items || [],
      nextCursor: response.nextCursor || null
    }
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
    const response = await this.substackClient.get<unknown>(
      `/profile/search?${params.toString()}`
    )
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
    const response = await this.substackClient.get<{
      items?: FeedItem[]
      nextCursor?: string | null
    }>(`/search/explore/web?${params.toString()}`)

    return {
      items: response.items || [],
      nextCursor: response.nextCursor || null
    }
  }
}
