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

  describe('getPublicationUser', () => {
    it('When requesting publication user data', async () => {
      const mockResponse = {
        pub_users: [
          {
            id: 3379788,
            publication_id: 3317680,
            user_id: 284846000,
            public: true,
            role: 'admin',
            is_primary: true
          }
        ]
      }
      mockClient.get.mockResolvedValueOnce(mockResponse)

      const result = await service.getPublicationUser()

      expect(result).toEqual(mockResponse)
      expect(mockClient.get).toHaveBeenCalledWith('/publication_user')
    })

    it('should propagate errors', async () => {
      mockClient.get.mockRejectedValueOnce(new Error('HTTP 500'))
      await expect(service.getPublicationUser()).rejects.toThrow('HTTP 500')
    })
  })

  describe('getSections', () => {
    it('When requesting publication sections', async () => {
      const mockResponse: Array<{ id: number; name: string }> = []
      mockClient.get.mockResolvedValueOnce(mockResponse)

      const result = await service.getSections()

      expect(result).toEqual(mockResponse)
      expect(mockClient.get).toHaveBeenCalledWith('/publication/sections')
    })
  })

  describe('getSubscription', () => {
    it('When requesting subscription settings', async () => {
      const mockResponse = {
        id: 610839131,
        user_id: 284846000,
        publication_id: 3317680,
        email_disabled: false,
        notification_settings: { marketing: 'off' }
      }
      mockClient.get.mockResolvedValueOnce(mockResponse)

      const result = await service.getSubscription()

      expect(result).toEqual(mockResponse)
      expect(mockClient.get).toHaveBeenCalledWith('/subscription')
    })

    it('should propagate errors', async () => {
      mockClient.get.mockRejectedValueOnce(new Error('HTTP 401'))
      await expect(service.getSubscription()).rejects.toThrow('HTTP 401')
    })
  })
})
