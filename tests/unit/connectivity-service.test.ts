import { ConnectivityService } from '@substack-api/internal/services/connectivity-service'
import { FollowingService } from '@substack-api/internal/services/following-service'
import { HttpClient } from '@substack-api/internal/http-client'

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
      const result = await connectivityService.isConnected()

      // Assert
      expect(result).toBe(true)
      expect(mockFollowingService.getOwnId).toHaveBeenCalledTimes(1)
    })

    it('When requesting false when API request fails with network error', async () => {
      // Arrange
      mockFollowingService.getOwnId.mockRejectedValue(new Error('Network error'))

      // Act
      const result = await connectivityService.isConnected()

      // Assert
      expect(result).toBe(false)
      expect(mockFollowingService.getOwnId).toHaveBeenCalledTimes(1)
    })

    it('When requesting false when API request fails with HTTP error', async () => {
      // Arrange
      mockFollowingService.getOwnId.mockRejectedValue(new Error('HTTP 401: Unauthorized'))

      // Act
      const result = await connectivityService.isConnected()

      // Assert
      expect(result).toBe(false)
      expect(mockFollowingService.getOwnId).toHaveBeenCalledTimes(1)
    })

    it('When requesting false when API request fails with timeout', async () => {
      // Arrange
      mockFollowingService.getOwnId.mockRejectedValue(new Error('Request timeout'))

      // Act
      const result = await connectivityService.isConnected()

      // Assert
      expect(result).toBe(false)
      expect(mockFollowingService.getOwnId).toHaveBeenCalledTimes(1)
    })

    it('When successful API response with data', async () => {
      // Arrange
      mockFollowingService.getOwnId.mockResolvedValue(456)

      // Act
      const result = await connectivityService.isConnected()

      // Assert
      expect(result).toBe(true)
      expect(mockFollowingService.getOwnId).toHaveBeenCalledTimes(1)
    })
  })
})
