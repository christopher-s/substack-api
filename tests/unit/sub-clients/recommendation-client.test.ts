import { RecommendationClient } from '@substack-api/sub-clients/recommendation-client'

describe('RecommendationClient', () => {
  let client: RecommendationClient
  let recommendationService: {
    getOutgoingRecommendations: jest.Mock
    getOutgoingRecommendationsPaginated: jest.Mock
    getOutgoingRecommendationStats: jest.Mock
    getIncomingRecommendationStats: jest.Mock
    recommendationsExist: jest.Mock
    getSuggestedRecommendations: jest.Mock
  }

  beforeEach(() => {
    jest.clearAllMocks()
    recommendationService = {
      getOutgoingRecommendations: jest.fn(),
      getOutgoingRecommendationsPaginated: jest.fn(),
      getOutgoingRecommendationStats: jest.fn(),
      getIncomingRecommendationStats: jest.fn(),
      recommendationsExist: jest.fn(),
      getSuggestedRecommendations: jest.fn()
    }
    client = new RecommendationClient(
      recommendationService as unknown as import('@substack-api/internal/services').RecommendationService
    )
  })

  describe('outgoingRecommendations', () => {
    it('When fetching outgoing recommendations, then delegates to service', async () => {
      const mockResponse = [{ id: 1, publication_id: 100, recommended_publication_id: 200 }]
      recommendationService.getOutgoingRecommendations.mockResolvedValueOnce(mockResponse)

      const result = await client.outgoingRecommendations(100)

      expect(result).toEqual(mockResponse)
      expect(recommendationService.getOutgoingRecommendations).toHaveBeenCalledWith(100)
    })

    it('When service returns empty array, then returns empty array', async () => {
      recommendationService.getOutgoingRecommendations.mockResolvedValueOnce([])

      const result = await client.outgoingRecommendations(100)

      expect(result).toEqual([])
    })
  })

  describe('outgoingRecommendationsPaginated', () => {
    it('When fetching with all options, then passes options to service', async () => {
      const mockResponse = [{ id: 1 }]
      const options = { offset: 0, limit: 50, paginate: true }
      recommendationService.getOutgoingRecommendationsPaginated.mockResolvedValueOnce(mockResponse)

      const result = await client.outgoingRecommendationsPaginated(100, options)

      expect(result).toEqual(mockResponse)
      expect(recommendationService.getOutgoingRecommendationsPaginated).toHaveBeenCalledWith(
        100,
        options
      )
    })

    it('When fetching without options, then calls service with undefined options', async () => {
      recommendationService.getOutgoingRecommendationsPaginated.mockResolvedValueOnce([])

      const result = await client.outgoingRecommendationsPaginated(100)

      expect(result).toEqual([])
      expect(recommendationService.getOutgoingRecommendationsPaginated).toHaveBeenCalledWith(
        100,
        undefined
      )
    })
  })

  describe('outgoingRecommendationStats', () => {
    it('When fetching outgoing stats with options, then delegates to service', async () => {
      const mockStats = [{ publication_id: 100, subscriber_count: 500 }]
      const options = { offset: 0, limit: 10, orderBy: 'name', orderDirection: 'asc' }
      recommendationService.getOutgoingRecommendationStats.mockResolvedValueOnce(mockStats)

      const result = await client.outgoingRecommendationStats(options)

      expect(result).toEqual(mockStats)
      expect(recommendationService.getOutgoingRecommendationStats).toHaveBeenCalledWith(options)
    })

    it('When fetching outgoing stats without options, then calls service with undefined', async () => {
      recommendationService.getOutgoingRecommendationStats.mockResolvedValueOnce([])

      const result = await client.outgoingRecommendationStats()

      expect(result).toEqual([])
      expect(recommendationService.getOutgoingRecommendationStats).toHaveBeenCalledWith(undefined)
    })
  })

  describe('incomingRecommendationStats', () => {
    it('When fetching incoming stats with options, then delegates to service', async () => {
      const mockStats = [{ publication_id: 200, subscriber_count: 300 }]
      const options = { offset: 5, limit: 20, orderBy: 'date', orderDirection: 'desc' }
      recommendationService.getIncomingRecommendationStats.mockResolvedValueOnce(mockStats)

      const result = await client.incomingRecommendationStats(options)

      expect(result).toEqual(mockStats)
      expect(recommendationService.getIncomingRecommendationStats).toHaveBeenCalledWith(options)
    })

    it('When fetching incoming stats without options, then calls service with undefined', async () => {
      recommendationService.getIncomingRecommendationStats.mockResolvedValueOnce([])

      const result = await client.incomingRecommendationStats()

      expect(result).toEqual([])
      expect(recommendationService.getIncomingRecommendationStats).toHaveBeenCalledWith(undefined)
    })
  })

  describe('recommendationsExist', () => {
    it('When checking if recommendations exist, then returns service result', async () => {
      const mockResponse = { exists: true }
      recommendationService.recommendationsExist.mockResolvedValueOnce(mockResponse)

      const result = await client.recommendationsExist()

      expect(result).toEqual(mockResponse)
      expect(recommendationService.recommendationsExist).toHaveBeenCalled()
    })

    it('When no recommendations exist, then returns false', async () => {
      const mockResponse = { exists: false }
      recommendationService.recommendationsExist.mockResolvedValueOnce(mockResponse)

      const result = await client.recommendationsExist()

      expect(result).toEqual(mockResponse)
    })
  })

  describe('suggestedRecommendations', () => {
    it('When fetching suggested recommendations, then delegates to service', async () => {
      const mockSuggestions = [{ publication_id: 300, name: 'Suggested Pub' }]
      recommendationService.getSuggestedRecommendations.mockResolvedValueOnce(mockSuggestions)

      const result = await client.suggestedRecommendations(100)

      expect(result).toEqual(mockSuggestions)
      expect(recommendationService.getSuggestedRecommendations).toHaveBeenCalledWith(100)
    })

    it('When no suggestions found, then returns empty array', async () => {
      recommendationService.getSuggestedRecommendations.mockResolvedValueOnce([])

      const result = await client.suggestedRecommendations(100)

      expect(result).toEqual([])
    })
  })
})
