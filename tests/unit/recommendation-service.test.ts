import { RecommendationService } from '@substack-api/internal/services/recommendation-service'
import { createMockHttpClient } from '@test/unit/helpers/mock-http-client'

describe('RecommendationService', () => {
  let recommendationService: RecommendationService
  let mockPublicationClient: ReturnType<typeof createMockHttpClient>

  beforeEach(() => {
    jest.clearAllMocks()
    mockPublicationClient = createMockHttpClient('https://test.com')
    recommendationService = new RecommendationService(mockPublicationClient)
  })

  describe('getOutgoingRecommendations', () => {
    it('When fetching outgoing recommendations for a publication', async () => {
      const mockResponse = [
        { id: 1, publication_id: 100, recommended_publication_id: 200 },
        { id: 2, publication_id: 100, recommended_publication_id: 300 }
      ]
      mockPublicationClient.get.mockResolvedValueOnce(mockResponse)

      const result = await recommendationService.getOutgoingRecommendations(100)

      expect(result).toEqual(mockResponse)
      expect(mockPublicationClient.get).toHaveBeenCalledWith('/recommendations/from/100')
    })

    it('When publicationId contains special characters', async () => {
      mockPublicationClient.get.mockResolvedValueOnce([])
      await recommendationService.getOutgoingRecommendations(42)
      expect(mockPublicationClient.get).toHaveBeenCalledWith('/recommendations/from/42')
    })
  })

  describe('getOutgoingRecommendationsPaginated', () => {
    it('When fetching paginated recommendations with all options', async () => {
      const mockResponse = [{ id: 1, publication_id: 100 }]
      mockPublicationClient.get.mockResolvedValueOnce(mockResponse)

      const result = await recommendationService.getOutgoingRecommendationsPaginated(100, {
        offset: 0,
        limit: 50,
        paginate: true
      })

      expect(result).toEqual(mockResponse)
      expect(mockPublicationClient.get).toHaveBeenCalledWith(
        '/recommendations/from/100?offset=0&limit=50&paginate=true'
      )
    })

    it('When fetching paginated recommendations without options', async () => {
      mockPublicationClient.get.mockResolvedValueOnce([])
      const result = await recommendationService.getOutgoingRecommendationsPaginated(100)
      expect(result).toEqual([])
      expect(mockPublicationClient.get).toHaveBeenCalledWith('/recommendations/from/100')
    })

    it('When fetching paginated recommendations with partial options', async () => {
      mockPublicationClient.get.mockResolvedValueOnce([])
      await recommendationService.getOutgoingRecommendationsPaginated(100, { limit: 25 })
      expect(mockPublicationClient.get).toHaveBeenCalledWith('/recommendations/from/100?limit=25')
    })
  })

  describe('getOutgoingRecommendationStats', () => {
    it('When fetching outgoing stats with all options', async () => {
      const mockResponse = [
        { publication_id: 200, subscribers_driven: 42, clicks: 1000 },
        { publication_id: 300, subscribers_driven: 15, clicks: 500 }
      ]
      mockPublicationClient.get.mockResolvedValueOnce(mockResponse)

      const result = await recommendationService.getOutgoingRecommendationStats({
        offset: 0,
        limit: 10,
        orderBy: 'subscribers_driven',
        orderDirection: 'desc'
      })

      expect(result).toEqual(mockResponse)
      expect(mockPublicationClient.get).toHaveBeenCalledWith(
        '/recommendations/stats/from?offset=0&limit=10&order_by=subscribers_driven&order_direction=desc'
      )
    })

    it('When fetching outgoing stats without options', async () => {
      mockPublicationClient.get.mockResolvedValueOnce([])
      const result = await recommendationService.getOutgoingRecommendationStats()
      expect(result).toEqual([])
      expect(mockPublicationClient.get).toHaveBeenCalledWith('/recommendations/stats/from')
    })

    it('When HTTP request fails', async () => {
      const error = new Error('Network error')
      mockPublicationClient.get.mockRejectedValueOnce(error)

      await expect(recommendationService.getOutgoingRecommendationStats()).rejects.toThrow(
        'Network error'
      )
    })
  })

  describe('getIncomingRecommendationStats', () => {
    it('When fetching incoming stats with all options', async () => {
      const mockResponse = [
        { publication_id: 400, subscribers_driven: 88, clicks: 2000 },
        { publication_id: 500, subscribers_driven: 30, clicks: 800 }
      ]
      mockPublicationClient.get.mockResolvedValueOnce(mockResponse)

      const result = await recommendationService.getIncomingRecommendationStats({
        offset: 0,
        limit: 10,
        orderBy: 'subscribers_driven',
        orderDirection: 'desc'
      })

      expect(result).toEqual(mockResponse)
      expect(mockPublicationClient.get).toHaveBeenCalledWith(
        '/recommendations/stats/to?offset=0&limit=10&order_by=subscribers_driven&order_direction=desc'
      )
    })

    it('When fetching incoming stats without options', async () => {
      mockPublicationClient.get.mockResolvedValueOnce([])
      const result = await recommendationService.getIncomingRecommendationStats()
      expect(result).toEqual([])
      expect(mockPublicationClient.get).toHaveBeenCalledWith('/recommendations/stats/to')
    })

    it('When HTTP request fails', async () => {
      const error = new Error('Server error')
      mockPublicationClient.get.mockRejectedValueOnce(error)

      await expect(recommendationService.getIncomingRecommendationStats()).rejects.toThrow(
        'Server error'
      )
    })
  })

  describe('recommendationsExist', () => {
    it('When checking if recommendations exist', async () => {
      mockPublicationClient.get.mockResolvedValueOnce({ exist: true })

      const result = await recommendationService.recommendationsExist()

      expect(result).toEqual({ exist: true })
      expect(mockPublicationClient.get).toHaveBeenCalledWith('/recommendations/exist')
    })

    it('When no recommendations exist', async () => {
      mockPublicationClient.get.mockResolvedValueOnce({ exist: false })

      const result = await recommendationService.recommendationsExist()

      expect(result).toEqual({ exist: false })
    })
  })

  describe('getSuggestedRecommendations', () => {
    it('When fetching suggested recommendations for a publication', async () => {
      const mockResponse = [
        { id: 1, publication_id: 600, name: 'Suggested Pub' },
        { id: 2, publication_id: 700, name: 'Another Pub' }
      ]
      mockPublicationClient.get.mockResolvedValueOnce(mockResponse)

      const result = await recommendationService.getSuggestedRecommendations(100)

      expect(result).toEqual(mockResponse)
      expect(mockPublicationClient.get).toHaveBeenCalledWith('/recommendations/100/suggested')
    })

    it('When publicationId is encoded in URL path', async () => {
      mockPublicationClient.get.mockResolvedValueOnce([])
      await recommendationService.getSuggestedRecommendations(999)
      expect(mockPublicationClient.get).toHaveBeenCalledWith('/recommendations/999/suggested')
    })

    it('When HTTP request fails', async () => {
      const error = new Error('Timeout')
      mockPublicationClient.get.mockRejectedValueOnce(error)

      await expect(recommendationService.getSuggestedRecommendations(100)).rejects.toThrow(
        'Timeout'
      )
    })
  })
})
