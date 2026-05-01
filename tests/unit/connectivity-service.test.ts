import { FollowingService } from '@substack-api/internal/services/following-service'
import type { ConnectivityResult } from '@substack-api/internal/services/following-service'
import type { AxiosResponse } from 'axios'
import { HttpClient } from '@substack-api/internal/http-client'
import { AxiosError } from 'axios'

jest.mock('@substack-api/internal/http-client')

describe('FollowingService.isConnected', () => {
  let followingService: FollowingService
  let mockSubstackClient: jest.Mocked<HttpClient>
  let mockPublicationClient: jest.Mocked<HttpClient>

  beforeEach(() => {
    jest.clearAllMocks()
    mockSubstackClient = new HttpClient('https://test.com', 'test') as jest.Mocked<HttpClient>
    mockPublicationClient = new HttpClient('https://test.com', 'test') as jest.Mocked<HttpClient>
    mockSubstackClient.get = jest.fn()
    mockSubstackClient.post = jest.fn()
    mockPublicationClient.get = jest.fn()
    mockPublicationClient.post = jest.fn()

    followingService = new FollowingService(mockPublicationClient, mockSubstackClient)

    // Spy on getOwnId so isConnected can call through
    jest.spyOn(followingService, 'getOwnId')
  })

  describe('isConnected', () => {
    it('When requesting true when API is accessible', async () => {
      // Arrange - getOwnId resolves successfully
      jest.spyOn(followingService, 'getOwnId').mockResolvedValue(123)

      // Act
      const result: ConnectivityResult = await followingService.isConnected()

      // Assert
      expect(result.connected).toBe(true)
      expect(followingService.getOwnId).toHaveBeenCalledTimes(1)
    })

    it('When returning auth reason on 401', async () => {
      // Arrange
      const axiosError = new AxiosError('Unauthorized', '401', undefined, undefined, {
        status: 401,
        data: {}
      } as unknown as AxiosResponse)
      jest.spyOn(followingService, 'getOwnId').mockRejectedValue(axiosError)

      // Act
      const result: ConnectivityResult = await followingService.isConnected()

      // Assert
      expect(result.connected).toBe(false)
      if (!result.connected) {
        expect(result.reason).toBe('auth')
      }
      expect(followingService.getOwnId).toHaveBeenCalledTimes(1)
    })

    it('When returning network reason on non-401 errors', async () => {
      // Arrange
      jest.spyOn(followingService, 'getOwnId').mockRejectedValue(new Error('Network error'))

      // Act
      const result: ConnectivityResult = await followingService.isConnected()

      // Assert
      expect(result.connected).toBe(false)
      if (!result.connected) {
        expect(result.reason).toBe('network')
      }
      expect(followingService.getOwnId).toHaveBeenCalledTimes(1)
    })

    it('When returning network reason on Axios 5xx error', async () => {
      // Arrange
      const axiosError = new AxiosError('Server Error', '502', undefined, undefined, {
        status: 502,
        data: {}
      } as unknown as AxiosResponse)
      jest.spyOn(followingService, 'getOwnId').mockRejectedValue(axiosError)

      // Act
      const result: ConnectivityResult = await followingService.isConnected()

      // Assert
      expect(result.connected).toBe(false)
      if (!result.connected) {
        expect(result.reason).toBe('network')
      }
      expect(followingService.getOwnId).toHaveBeenCalledTimes(1)
    })
  })
})
