import { SettingsService } from '@substack-api/internal/services/settings-service'
import type { HttpClient } from '@substack-api/internal/http-client'

describe('SettingsService', () => {
  let mockClient: jest.Mocked<HttpClient>
  let service: SettingsService

  beforeEach(() => {
    mockClient = {
      get: jest.fn()
    } as unknown as jest.Mocked<HttpClient>
    service = new SettingsService(mockClient)
  })

  describe('getPublisherSettings', () => {
    it('should fetch publisher settings', async () => {
      const mockResponse = { publication_name: 'Test', author_name: 'Author' }
      mockClient.get.mockResolvedValue(mockResponse)

      const result = await service.getPublisherSettings()
      expect(result).toEqual(mockResponse)
      expect(mockClient.get).toHaveBeenCalledWith('/settings')
    })

    it('should propagate HTTP errors', async () => {
      mockClient.get.mockRejectedValue(new Error('HTTP 403'))
      await expect(service.getPublisherSettings()).rejects.toThrow('HTTP 403')
    })
  })
})
