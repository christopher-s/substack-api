import { PublicationDetailService } from '@substack-api/internal/services/publication-detail-service'
import type { HttpClient } from '@substack-api/internal/http-client'

describe('PublicationDetailService', () => {
  let mockClient: jest.Mocked<HttpClient>
  let service: PublicationDetailService

  beforeEach(() => {
    mockClient = {
      get: jest.fn()
    } as unknown as jest.Mocked<HttpClient>
    service = new PublicationDetailService(mockClient)
  })

  describe('getPublicationDetails', () => {
    it('should fetch publication details', async () => {
      const mockResponse = { id: 42, name: 'Test Pub', subdomain: 'test' }
      mockClient.get.mockResolvedValue(mockResponse)

      const result = await service.getPublicationDetails()
      expect(result).toEqual(mockResponse)
      expect(mockClient.get).toHaveBeenCalledWith('/publication')
    })

    it('should propagate HTTP errors', async () => {
      mockClient.get.mockRejectedValue(new Error('HTTP 500'))
      await expect(service.getPublicationDetails()).rejects.toThrow('HTTP 500')
    })
  })

  describe('getPostTags', () => {
    it('should fetch post tags', async () => {
      const mockResponse = [{ id: 1, name: 'Technology' }, { id: 2, name: 'Science' }]
      mockClient.get.mockResolvedValue(mockResponse)

      const result = await service.getPostTags()
      expect(result).toEqual(mockResponse)
      expect(mockClient.get).toHaveBeenCalledWith('/publication/post-tag')
    })

    it('should propagate HTTP errors', async () => {
      mockClient.get.mockRejectedValue(new Error('HTTP 401'))
      await expect(service.getPostTags()).rejects.toThrow('HTTP 401')
    })
  })
})
