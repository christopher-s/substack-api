import type { HttpClient } from '@substack-api/internal/http-client'

/**
 * Service responsible for recommendation-related HTTP operations
 * Returns raw API responses for domain model transformation
 */
export class RecommendationService {
  constructor(private readonly publicationClient: HttpClient) {}

  /**
   * Get outgoing recommendations for a publication
   * @param publicationId - The publication ID
   * @returns Promise<unknown> - Raw recommendation data from API
   * @throws {Error} When API request fails
   */
  async getOutgoingRecommendations(publicationId: number): Promise<unknown> {
    return await this.publicationClient.get<unknown>(
      `/recommendations/from/${publicationId}`
    )
  }

  /**
   * Get paginated outgoing recommendations for a publication
   * @param publicationId - The publication ID
   * @param options - Pagination options
   * @returns Promise<unknown> - Raw paginated recommendation data from API
   * @throws {Error} When API request fails
   */
  async getOutgoingRecommendationsPaginated(
    publicationId: number,
    options?: { offset?: number; limit?: number; paginate?: boolean }
  ): Promise<unknown> {
    const params = new URLSearchParams()
    if (options?.offset !== undefined) {
      params.set('offset', String(options.offset))
    }
    if (options?.limit !== undefined) {
      params.set('limit', String(options.limit))
    }
    if (options?.paginate !== undefined) {
      params.set('paginate', String(options.paginate))
    }
    const query = params.toString() ? `?${params.toString()}` : ''
    return await this.publicationClient.get<unknown>(
      `/recommendations/from/${publicationId}${query}`
    )
  }

  /**
   * Get stats for outgoing recommendations
   * @param options - Query options for sorting and pagination
   * @returns Promise<unknown> - Raw stats data from API
   * @throws {Error} When API request fails
   */
  async getOutgoingRecommendationStats(options?: {
    offset?: number
    limit?: number
    orderBy?: string
    orderDirection?: string
  }): Promise<unknown> {
    const params = new URLSearchParams()
    if (options?.offset !== undefined) {
      params.set('offset', String(options.offset))
    }
    if (options?.limit !== undefined) {
      params.set('limit', String(options.limit))
    }
    if (options?.orderBy !== undefined) {
      params.set('order_by', options.orderBy)
    }
    if (options?.orderDirection !== undefined) {
      params.set('order_direction', options.orderDirection)
    }
    const query = params.toString() ? `?${params.toString()}` : ''
    return await this.publicationClient.get<unknown>(`/recommendations/stats/from${query}`)
  }

  /**
   * Get stats for incoming recommendations
   * @param options - Query options for sorting and pagination
   * @returns Promise<unknown> - Raw stats data from API
   * @throws {Error} When API request fails
   */
  async getIncomingRecommendationStats(options?: {
    offset?: number
    limit?: number
    orderBy?: string
    orderDirection?: string
  }): Promise<unknown> {
    const params = new URLSearchParams()
    if (options?.offset !== undefined) {
      params.set('offset', String(options.offset))
    }
    if (options?.limit !== undefined) {
      params.set('limit', String(options.limit))
    }
    if (options?.orderBy !== undefined) {
      params.set('order_by', options.orderBy)
    }
    if (options?.orderDirection !== undefined) {
      params.set('order_direction', options.orderDirection)
    }
    const query = params.toString() ? `?${params.toString()}` : ''
    return await this.publicationClient.get<unknown>(`/recommendations/stats/to${query}`)
  }

  /**
   * Check if recommendations exist
   * @returns Promise<unknown> - Raw response from API
   * @throws {Error} When API request fails
   */
  async recommendationsExist(): Promise<unknown> {
    return await this.publicationClient.get<unknown>('/recommendations/exist')
  }

  /**
   * Get AI-suggested recommendations for a publication
   * @param publicationId - The publication ID
   * @returns Promise<unknown> - Raw suggested recommendations from API
   * @throws {Error} When API request fails
   */
  async getSuggestedRecommendations(publicationId: number): Promise<unknown> {
    return await this.publicationClient.get<unknown>(
      `/recommendations/${publicationId}/suggested`
    )
  }
}
