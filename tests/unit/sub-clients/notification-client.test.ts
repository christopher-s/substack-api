/* eslint-disable @typescript-eslint/no-explicit-any */
import { NotificationClient } from '@substack-api/sub-clients/notification-client'
import type { ChatService } from '@substack-api/internal/services'

describe('NotificationClient', () => {
  let chatService: jest.Mocked<ChatService>
  let client: NotificationClient

  beforeEach(() => {
    jest.clearAllMocks()

    chatService = {
      getNotifications: jest.fn(),
      markNotificationsSeen: jest.fn()
    } as unknown as jest.Mocked<ChatService>

    client = new NotificationClient(chatService)
  })

  describe('getNotifications', () => {
    it('When calling getNotifications, then delegates to chatService.getNotifications', async () => {
      const mockData = {
        notifications: [
          { id: 'n1', type: 'like', actor: { name: 'Alice' } },
          { id: 'n2', type: 'comment', actor: { name: 'Bob' } }
        ],
        nextCursor: 'page2'
      }
      chatService.getNotifications.mockResolvedValueOnce(mockData as any)

      const result = await client.getNotifications()

      expect(result).toEqual(mockData)
      expect(chatService.getNotifications).toHaveBeenCalledTimes(1)
      expect(chatService.getNotifications).toHaveBeenCalledWith()
    })

    it('When getNotifications returns empty list, then returns empty array', async () => {
      const mockData = { notifications: [], nextCursor: null }
      chatService.getNotifications.mockResolvedValueOnce(mockData as any)

      const result = await client.getNotifications()

      expect(result).toEqual(mockData)
      expect(result.notifications).toHaveLength(0)
    })

    it('When getNotifications fails, then error propagates', async () => {
      chatService.getNotifications.mockRejectedValueOnce(new Error('Notifications API error'))

      await expect(client.getNotifications()).rejects.toThrow('Notifications API error')
    })
  })

  describe('markNotificationsSeen', () => {
    it('When calling markNotificationsSeen, then delegates to chatService.markNotificationsSeen', async () => {
      chatService.markNotificationsSeen.mockResolvedValueOnce(undefined)

      await client.markNotificationsSeen()

      expect(chatService.markNotificationsSeen).toHaveBeenCalledTimes(1)
      expect(chatService.markNotificationsSeen).toHaveBeenCalledWith()
    })

    it('When markNotificationsSeen fails, then error propagates', async () => {
      chatService.markNotificationsSeen.mockRejectedValueOnce(new Error('Mark seen failed'))

      await expect(client.markNotificationsSeen()).rejects.toThrow('Mark seen failed')
    })
  })
})
