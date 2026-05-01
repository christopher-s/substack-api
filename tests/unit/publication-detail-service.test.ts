import { PublicationService } from '@substack-api/internal/services/publication-service'
import type { HttpClient } from '@substack-api/internal/http-client'

describe('PublicationService (publication detail methods)', () => {
  let mockPublicationClient: jest.Mocked<HttpClient>
  let mockSubstackClient: jest.Mocked<HttpClient>
  let service: PublicationService

  beforeEach(() => {
    mockPublicationClient = {
      get: jest.fn()
    } as unknown as jest.Mocked<HttpClient>
    mockSubstackClient = {
      get: jest.fn()
    } as unknown as jest.Mocked<HttpClient>
    service = new PublicationService(mockPublicationClient, mockSubstackClient)
  })

  describe('getPublicationDetails', () => {
    it('should fetch publication details', async () => {
      const mockResponse = { id: 42, name: 'Test Pub', subdomain: 'test' }
      mockPublicationClient.get.mockResolvedValue(mockResponse)

      const result = await service.getPublicationDetails()
      expect(result).toEqual(mockResponse)
      expect(mockPublicationClient.get).toHaveBeenCalledWith('/publication')
    })

    it('should propagate HTTP errors', async () => {
      mockPublicationClient.get.mockRejectedValue(new Error('HTTP 500'))
      await expect(service.getPublicationDetails()).rejects.toThrow('HTTP 500')
    })
  })

  describe('getPostTags', () => {
    it('should fetch post tags', async () => {
      const mockResponse = [
        { id: 1, name: 'Technology' },
        { id: 2, name: 'Science' }
      ]
      mockPublicationClient.get.mockResolvedValue(mockResponse)

      const result = await service.getPostTags()
      expect(result).toEqual(mockResponse)
      expect(mockPublicationClient.get).toHaveBeenCalledWith('/publication/post-tag')
    })

    it('should propagate HTTP errors', async () => {
      mockPublicationClient.get.mockRejectedValue(new Error('HTTP 401'))
      await expect(service.getPostTags()).rejects.toThrow('HTTP 401')
    })
  })
})
