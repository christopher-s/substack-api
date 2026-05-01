import { FollowingService } from '@substack-api/internal/services/following-service'
import { HttpClient } from '@substack-api/internal/http-client'

// Mock the http client
jest.mock('@substack-api/internal/http-client')

describe('FollowingService', () => {
  let followingService: FollowingService
  let mockPublicationClient: jest.Mocked<HttpClient>
  let mockSubstackClient: jest.Mocked<HttpClient>

  beforeEach(() => {
    jest.clearAllMocks()

    mockPublicationClient = new HttpClient(
      'https://test.substack.com',
      'test'
    ) as jest.Mocked<HttpClient>
    mockPublicationClient.get = jest.fn()

    mockSubstackClient = new HttpClient('https://substack.com', 'test') as jest.Mocked<HttpClient>
    mockSubstackClient.get = jest.fn()

    followingService = new FollowingService(mockPublicationClient, mockSubstackClient)
  })

  describe('getFollowing', () => {
    const mockHandleOptions = {
      potentialHandles: [{ id: '1', handle: 'testuser', type: 'existing' }]
    }
    const mockProfile = { id: 12345, handle: 'testuser', name: 'Test User' }
    const mockSubscriberLists = {
      subscriberLists: [
        {
          id: 'following-list',
          name: 'Following',
          groups: [
            {
              users: [
                { id: 123, handle: 'user123' },
                { id: 456, handle: 'user456' },
                { id: 789, handle: 'user789' }
              ]
            }
          ]
        }
      ]
    }

    it('should fetch following users successfully', async () => {
      mockSubstackClient.get
        .mockResolvedValueOnce(mockHandleOptions)
        .mockResolvedValueOnce(mockProfile)
      mockPublicationClient.get.mockResolvedValue(mockSubscriberLists)

      const result = await followingService.getFollowing()

      expect(mockSubstackClient.get).toHaveBeenCalledWith('/handle/options')
      expect(mockSubstackClient.get).toHaveBeenCalledWith('/user/testuser/public_profile')
      expect(mockPublicationClient.get).toHaveBeenCalledWith(
        '/user/12345/subscriber-lists?lists=following'
      )
      expect(result).toEqual([
        { id: 123, handle: 'user123' },
        { id: 456, handle: 'user456' },
        { id: 789, handle: 'user789' }
      ])
    })

    it('When requesting empty array when no following users', async () => {
      const emptyLists = {
        subscriberLists: [
          {
            id: 'following-list',
            name: 'Following',
            groups: [{ users: [] }]
          }
        ]
      }

      mockSubstackClient.get
        .mockResolvedValueOnce(mockHandleOptions)
        .mockResolvedValueOnce(mockProfile)
      mockPublicationClient.get.mockResolvedValue(emptyLists)

      const result = await followingService.getFollowing()

      expect(result).toEqual([])
    })

    it('When subscriber-lists request fails', async () => {
      const error = new Error('Network error')

      mockSubstackClient.get
        .mockResolvedValueOnce(mockHandleOptions)
        .mockResolvedValueOnce(mockProfile)
      mockPublicationClient.get.mockRejectedValue(error)

      await expect(followingService.getFollowing()).rejects.toThrow('Network error')
    })

    it('When authentication errors gracefully', async () => {
      mockSubstackClient.get.mockRejectedValue(new Error('Unauthorized'))

      await expect(followingService.getFollowing()).rejects.toThrow('Unauthorized')
    })
  })

  describe('followUser', () => {
    it('When following a user, then posts to the correct endpoint', async () => {
      mockSubstackClient.post = jest.fn().mockResolvedValueOnce(undefined)

      await followingService.followUser(12345)

      expect(mockSubstackClient.post).toHaveBeenCalledWith('/user/12345/follow')
    })

    it('When follow request fails, then throws error', async () => {
      mockSubstackClient.post = jest.fn().mockRejectedValueOnce(new Error('API Error'))

      await expect(followingService.followUser(12345)).rejects.toThrow('API Error')
    })
  })

  describe('unfollowUser', () => {
    it('When unfollowing a user, then posts to the correct endpoint', async () => {
      mockSubstackClient.post = jest.fn().mockResolvedValueOnce(undefined)

      await followingService.unfollowUser(67890)

      expect(mockSubstackClient.post).toHaveBeenCalledWith('/user/67890/unfollow')
    })

    it('When unfollow request fails, then throws error', async () => {
      mockSubstackClient.post = jest.fn().mockRejectedValueOnce(new Error('API Error'))

      await expect(followingService.unfollowUser(67890)).rejects.toThrow('API Error')
    })
  })
})
