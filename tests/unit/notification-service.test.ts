import { ChatService } from '@substack-api/internal/services/chat-service'
import { createMockHttpClient } from '@test/unit/helpers/mock-http-client'

describe('ChatService (notification methods)', () => {
  let chatService: ChatService
  let mockSubstackClient: ReturnType<typeof createMockHttpClient>

  beforeEach(() => {
    jest.clearAllMocks()

    mockSubstackClient = createMockHttpClient('https://substack.com')

    chatService = new ChatService(mockSubstackClient)
  })

  describe('getNotifications', () => {
    it('When fetching notifications, then returns the response', async () => {
      const mockResponse = {
        notifications: [
          {
            id: 1,
            type: 'new_follower',
            created_at: '2023-01-01T00:00:00Z',
            read: false,
            actor_name: 'Test User',
            actor_handle: 'testuser'
          }
        ],
        nextCursor: null
      }
      mockSubstackClient.get.mockResolvedValueOnce(mockResponse)

      const result = await chatService.getNotifications()

      expect(mockSubstackClient.get).toHaveBeenCalledWith('/notifications')
      expect(result.notifications).toHaveLength(1)
      expect(result.notifications[0].id).toBe(1)
    })

    it('When fetching notifications with cursor, then passes cursor parameter', async () => {
      mockSubstackClient.get.mockResolvedValueOnce({ notifications: [], nextCursor: null })

      await chatService.getNotifications({ cursor: 'cursor-abc' })

      expect(mockSubstackClient.get).toHaveBeenCalledWith('/notifications?cursor=cursor-abc')
    })

    it('When request fails, then throws error', async () => {
      mockSubstackClient.get.mockRejectedValueOnce(new Error('API Error'))

      await expect(chatService.getNotifications()).rejects.toThrow('API Error')
    })
  })

  describe('markNotificationsSeen', () => {
    it('When marking notifications as seen, then posts to the correct endpoint', async () => {
      mockSubstackClient.post.mockResolvedValueOnce(undefined)

      await chatService.markNotificationsSeen()

      expect(mockSubstackClient.post).toHaveBeenCalledWith('/notifications/seen')
    })

    it('When request fails, then throws error', async () => {
      mockSubstackClient.post.mockRejectedValueOnce(new Error('API Error'))

      await expect(chatService.markNotificationsSeen()).rejects.toThrow('API Error')
    })
  })
})
