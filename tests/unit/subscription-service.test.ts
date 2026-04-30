import { SubscriptionService } from '@substack-api/internal/services/subscription-service'
import type { HttpClient } from '@substack-api/internal/http-client'

describe('SubscriptionService', () => {
  let mockPublicationClient: jest.Mocked<HttpClient>
  let mockSubstackClient: jest.Mocked<HttpClient>
  let service: SubscriptionService

  beforeEach(() => {
    mockPublicationClient = {
      get: jest.fn()
    } as unknown as jest.Mocked<HttpClient>
    mockSubstackClient = {
      get: jest.fn()
    } as unknown as jest.Mocked<HttpClient>
    service = new SubscriptionService(mockPublicationClient, mockSubstackClient)
  })

  describe('getCurrentSubscription', () => {
    it('should fetch subscription from publication client', async () => {
      const mockResponse = { id: 1, user_id: 10, publication_id: 42, type: 'premium' }
      mockPublicationClient.get.mockResolvedValue(mockResponse)

      const result = await service.getCurrentSubscription()
      expect(result).toEqual(mockResponse)
      expect(mockPublicationClient.get).toHaveBeenCalledWith('/subscription')
    })

    it('should propagate HTTP errors', async () => {
      mockPublicationClient.get.mockRejectedValue(new Error('HTTP 401'))
      await expect(service.getCurrentSubscription()).rejects.toThrow('HTTP 401')
    })
  })

  describe('getAllSubscriptions', () => {
    it('should fetch subscriptions with default parameters', async () => {
      const mockResponse = { subscriptions: [], more: false }
      mockSubstackClient.get.mockResolvedValue(mockResponse)

      const result = await service.getAllSubscriptions()
      expect(result).toEqual(mockResponse)
      expect(mockSubstackClient.get).toHaveBeenCalledWith(
        '/subscriptions/page_v2?offset=0&limit=25'
      )
    })

    it('should pass custom offset and limit', async () => {
      mockSubstackClient.get.mockResolvedValue({ subscriptions: [] })
      await service.getAllSubscriptions({ offset: 10, limit: 50 })
      expect(mockSubstackClient.get).toHaveBeenCalledWith(
        '/subscriptions/page_v2?offset=10&limit=50'
      )
    })

    it('should propagate HTTP errors', async () => {
      mockSubstackClient.get.mockRejectedValue(new Error('HTTP 403'))
      await expect(service.getAllSubscriptions()).rejects.toThrow('HTTP 403')
    })
  })
})
