import {
  ConnectivityService,
  ConnectivityResult
} from '@substack-api/internal/services/connectivity-service'
import { FollowingService } from '@substack-api/internal/services/following-service'
import type { AxiosResponse } from 'axios'
import { HttpClient } from '@substack-api/internal/http-client'
import { AxiosError } from 'axios'

// Mock the HttpClient
jest.mock('@substack-api/internal/http-client')

describe('ConnectivityService', () => {
  let connectivityService: ConnectivityService
  let mockSubstackClient: jest.Mocked<HttpClient>
  let mockFollowingService: jest.Mocked<FollowingService>

  beforeEach(() => {
    jest.clearAllMocks()
    mockSubstackClient = new HttpClient('https://test.com', 'test') as jest.Mocked<HttpClient>
    mockFollowingService = {
      getOwnId: jest.fn()
    } as unknown as jest.Mocked<FollowingService>

    connectivityService = new ConnectivityService(mockSubstackClient, mockFollowingService)
  })

  describe('isConnected', () => {
    it('When requesting true when API is accessible', async () => {
      // Arrange
      mockFollowingService.getOwnId.mockResolvedValue(123)

      // Act
      const result: ConnectivityResult = await connectivityService.isConnected()

      // Assert
      expect(result.connected).toBe(true)
      expect(mockFollowingService.getOwnId).toHaveBeenCalledTimes(1)
    })

    it('When returning auth reason on 401', async () => {
      // Arrange
      const axiosError = new AxiosError('Unauthorized', '401', undefined, undefined, {
        status: 401,
        data: {}
      } as unknown as AxiosResponse)
      mockFollowingService.getOwnId.mockRejectedValue(axiosError)

      // Act
      const result: ConnectivityResult = await connectivityService.isConnected()

      // Assert
      expect(result.connected).toBe(false)
      if (!result.connected) {
        expect(result.reason).toBe('auth')
      }
      expect(mockFollowingService.getOwnId).toHaveBeenCalledTimes(1)
    })

    it('When returning network reason on non-401 errors', async () => {
      // Arrange
      mockFollowingService.getOwnId.mockRejectedValue(new Error('Network error'))

      // Act
      const result: ConnectivityResult = await connectivityService.isConnected()

      // Assert
      expect(result.connected).toBe(false)
      if (!result.connected) {
        expect(result.reason).toBe('network')
      }
      expect(mockFollowingService.getOwnId).toHaveBeenCalledTimes(1)
    })

    it('When returning network reason on Axios 5xx error', async () => {
      // Arrange
      const axiosError = new AxiosError('Server Error', '502', undefined, undefined, {
        status: 502,
        data: {}
      } as unknown as AxiosResponse)
      mockFollowingService.getOwnId.mockRejectedValue(axiosError)

      // Act
      const result: ConnectivityResult = await connectivityService.isConnected()

      // Assert
      expect(result.connected).toBe(false)
      if (!result.connected) {
        expect(result.reason).toBe('network')
      }
      expect(mockFollowingService.getOwnId).toHaveBeenCalledTimes(1)
    })
  })
})
