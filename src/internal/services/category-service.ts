import type { HttpClient } from '@substack-api/internal/http-client'
import type { FeedItem } from '@substack-api/internal/types'
import {
  SubstackCategoryCodec,
  SubstackCategoryPublicationCodec,
  type SubstackCategory,
  type SubstackCategoryPublication
} from '@substack-api/internal/types'
import { decodeOrThrow } from '@substack-api/internal/validation'
import { fetchCursorFeed } from '@substack-api/internal/services/cursor-feed'

/**
 * Service for category and publication feed endpoints.
 */
export class CategoryService {
  constructor(private readonly substackClient: HttpClient) {}

  /**
   * Get all categories with subcategories
   * GET /api/v1/categories (anonymous)
   */
  async getCategories(): Promise<SubstackCategory[]> {
    const response = await this.substackClient.get<unknown[]>('/categories')
    return response.map((cat, i) => decodeOrThrow(SubstackCategoryCodec, cat, `Category ${i}`))
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
    }>(`/category/public/${encodeURIComponent(String(categoryId))}/posts${query}`)

    const publications = (response.publications || []).map((pub, i) =>
      decodeOrThrow(SubstackCategoryPublicationCodec, pub, `Category publication ${i}`)
    )

    return {
      publications,
      more: response.more || false
    }
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
    return fetchCursorFeed(
      this.substackClient,
      `/reader/feed/publication/${encodeURIComponent(String(publicationId))}${query}`
    )
  }
}
