import type { RecommendationService } from '@substack-api/internal/services'
import type {
  SubstackRecommendation,
  SubstackRecommendationStats,
  SubstackRecommendationsExist,
  SubstackSuggestedRecommendation
} from '@substack-api/internal/types'

/**
 * Sub-client for recommendation operations.
 */
export class RecommendationClient {
  constructor(private readonly recommendationService: RecommendationService) {}

  async outgoingRecommendations(publicationId: number): Promise<SubstackRecommendation[]> {
    return await this.recommendationService.getOutgoingRecommendations(publicationId)
  }

  async outgoingRecommendationsPaginated(
    publicationId: number,
    options?: { offset?: number; limit?: number; paginate?: boolean }
  ): Promise<SubstackRecommendation[]> {
    return await this.recommendationService.getOutgoingRecommendationsPaginated(
      publicationId,
      options
    )
  }

  async outgoingRecommendationStats(options?: {
    offset?: number
    limit?: number
    orderBy?: string
    orderDirection?: string
  }): Promise<SubstackRecommendationStats[]> {
    return await this.recommendationService.getOutgoingRecommendationStats(options)
  }

  async incomingRecommendationStats(options?: {
    offset?: number
    limit?: number
    orderBy?: string
    orderDirection?: string
  }): Promise<SubstackRecommendationStats[]> {
    return await this.recommendationService.getIncomingRecommendationStats(options)
  }

  async recommendationsExist(): Promise<SubstackRecommendationsExist> {
    return await this.recommendationService.recommendationsExist()
  }

  async suggestedRecommendations(
    publicationId: number
  ): Promise<SubstackSuggestedRecommendation[]> {
    return await this.recommendationService.getSuggestedRecommendations(publicationId)
  }
}
