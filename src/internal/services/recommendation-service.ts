import type { HttpClient } from '@substack-api/internal/http-client'
import type {
  SubstackRecommendation,
  SubstackRecommendationStats,
  SubstackRecommendationsExist,
  SubstackSuggestedRecommendation
} from '@substack-api/internal/types'
import {
  SubstackRecommendationCodec,
  SubstackRecommendationStatsCodec,
  SubstackRecommendationsExistCodec,
  SubstackSuggestedRecommendationCodec
} from '@substack-api/internal/types'
import { decodeOrThrow } from '@substack-api/internal/validation'

/**
 * Service responsible for recommendation-related HTTP operations
 * Returns typed API responses for domain model transformation
 */
export class RecommendationService {
  constructor(private readonly publicationClient: HttpClient) {}

  /**
   * Get outgoing recommendations for a publication
   * @param publicationId - The publication ID
   * @returns Promise<SubstackRecommendation[]> - Typed recommendation data from API
   * @throws {Error} When API request fails
   */
  async getOutgoingRecommendations(publicationId: number): Promise<SubstackRecommendation[]> {
    const response = await this.publicationClient.get<unknown>(
      `/recommendations/from/${publicationId}`
    )
    if (Array.isArray(response)) {
      return response.map((item, i) =>
        decodeOrThrow(SubstackRecommendationCodec, item, `Outgoing recommendation ${i}`)
      )
    }
    // Response may be an object wrapper
    return decodeOrThrow(
      SubstackRecommendationCodec,
      response,
      'Outgoing recommendation'
    ) as unknown as SubstackRecommendation[]
  }

  /**
   * Get paginated outgoing recommendations for a publication
   * @param publicationId - The publication ID
   * @param options - Pagination options
   * @returns Typed paginated recommendation data from API
   * @throws {Error} When API request fails
   */
  async getOutgoingRecommendationsPaginated(
    publicationId: number,
    options?: { offset?: number; limit?: number; paginate?: boolean }
  ): Promise<SubstackRecommendation[]> {
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
    const response = await this.publicationClient.get<unknown>(
      `/recommendations/from/${publicationId}${query}`
    )
    if (Array.isArray(response)) {
      return response.map((item, i) =>
        decodeOrThrow(SubstackRecommendationCodec, item, `Paginated recommendation ${i}`)
      )
    }
    return decodeOrThrow(
      SubstackRecommendationCodec,
      response,
      'Paginated recommendations'
    ) as unknown as SubstackRecommendation[]
  }

  /**
   * Get stats for outgoing recommendations
   * @param options - Query options for sorting and pagination
   * @returns Typed stats data from API
   * @throws {Error} When API request fails
   */
  async getOutgoingRecommendationStats(options?: {
    offset?: number
    limit?: number
    orderBy?: string
    orderDirection?: string
  }): Promise<SubstackRecommendationStats[]> {
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
    const response = await this.publicationClient.get<unknown>(
      `/recommendations/stats/from${query}`
    )
    if (Array.isArray(response)) {
      return response.map((item, i) =>
        decodeOrThrow(SubstackRecommendationStatsCodec, item, `Outgoing stat ${i}`)
      )
    }
    return decodeOrThrow(
      SubstackRecommendationStatsCodec,
      response,
      'Outgoing stats'
    ) as unknown as SubstackRecommendationStats[]
  }

  /**
   * Get stats for incoming recommendations
   * @param options - Query options for sorting and pagination
   * @returns Typed stats data from API
   * @throws {Error} When API request fails
   */
  async getIncomingRecommendationStats(options?: {
    offset?: number
    limit?: number
    orderBy?: string
    orderDirection?: string
  }): Promise<SubstackRecommendationStats[]> {
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
    const response = await this.publicationClient.get<unknown>(`/recommendations/stats/to${query}`)
    if (Array.isArray(response)) {
      return response.map((item, i) =>
        decodeOrThrow(SubstackRecommendationStatsCodec, item, `Incoming stat ${i}`)
      )
    }
    return decodeOrThrow(
      SubstackRecommendationStatsCodec,
      response,
      'Incoming stats'
    ) as unknown as SubstackRecommendationStats[]
  }

  /**
   * Check if recommendations exist
   * @returns Promise<SubstackRecommendationsExist> - Typed response from API
   * @throws {Error} When API request fails
   */
  async recommendationsExist(): Promise<SubstackRecommendationsExist> {
    const response = await this.publicationClient.get<unknown>('/recommendations/exist')
    return decodeOrThrow(SubstackRecommendationsExistCodec, response, 'Recommendations exist')
  }

  /**
   * Get AI-suggested recommendations for a publication
   * @param publicationId - The publication ID
   * @returns Promise<SubstackSuggestedRecommendation[]> - Typed suggested recommendations from API
   * @throws {Error} When API request fails
   */
  async getSuggestedRecommendations(
    publicationId: number
  ): Promise<SubstackSuggestedRecommendation[]> {
    const response = await this.publicationClient.get<unknown>(
      `/recommendations/${publicationId}/suggested`
    )
    if (Array.isArray(response)) {
      return response.map((item, i) =>
        decodeOrThrow(SubstackSuggestedRecommendationCodec, item, `Suggested recommendation ${i}`)
      )
    }
    // Handle case where response is not an array (e.g. single object wrapper)
    const decoded = decodeOrThrow(
      SubstackSuggestedRecommendationCodec,
      response,
      'Suggested recommendation'
    )
    return [decoded]
  }
}
