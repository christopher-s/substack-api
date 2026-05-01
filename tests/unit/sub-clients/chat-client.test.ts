/* eslint-disable @typescript-eslint/no-explicit-any */
import { ChatClient } from '@substack-api/sub-clients/chat-client'
import type { ChatService } from '@substack-api/internal/services'

describe('ChatClient', () => {
  let chatService: jest.Mocked<ChatService>
  let client: ChatClient

  beforeEach(() => {
    jest.clearAllMocks()

    chatService = {
      getUnreadCount: jest.fn(),
      getInbox: jest.fn(),
      markInboxSeen: jest.fn(),
      getDm: jest.fn(),
      sendMessage: jest.fn(),
      markDmSeen: jest.fn(),
      getInvites: jest.fn(),
      markInvitesSeen: jest.fn(),
      getReactions: jest.fn(),
      getRealtimeToken: jest.fn(),
      inboxThreads: jest.fn(),
      dmMessages: jest.fn(),
      getNotifications: jest.fn(),
      markNotificationsSeen: jest.fn()
    } as unknown as jest.Mocked<ChatService>

    client = new ChatClient(chatService)
  })

  describe('unreadCount', () => {
    it('When calling unreadCount, then delegates to chatService.getUnreadCount', async () => {
      const mockData = { unreadCount: 5 }
      chatService.getUnreadCount.mockResolvedValueOnce(mockData as any)

      const result = await client.unreadCount()

      expect(result).toEqual(mockData)
      expect(chatService.getUnreadCount).toHaveBeenCalledTimes(1)
    })

    it('When getUnreadCount fails, then error propagates', async () => {
      chatService.getUnreadCount.mockRejectedValueOnce(new Error('Unread count error'))

      await expect(client.unreadCount()).rejects.toThrow('Unread count error')
    })
  })

  describe('inbox', () => {
    it('When calling inbox with tab option, then delegates with options', async () => {
      const mockData = { threads: [] }
      chatService.getInbox.mockResolvedValueOnce(mockData as any)

      const result = await client.inbox({ tab: 'people' })

      expect(result).toEqual(mockData)
      expect(chatService.getInbox).toHaveBeenCalledWith({ tab: 'people' })
    })

    it('When calling inbox without options, then delegates with undefined', async () => {
      const mockData = { threads: [] }
      chatService.getInbox.mockResolvedValueOnce(mockData as any)

      const result = await client.inbox()

      expect(result).toEqual(mockData)
      expect(chatService.getInbox).toHaveBeenCalledWith(undefined)
    })

    it('When inbox request fails, then error propagates', async () => {
      chatService.getInbox.mockRejectedValueOnce(new Error('Inbox error'))

      await expect(client.inbox()).rejects.toThrow('Inbox error')
    })
  })

  describe('markInboxSeen', () => {
    it('When calling markInboxSeen, then delegates to chatService.markInboxSeen', async () => {
      chatService.markInboxSeen.mockResolvedValueOnce({ ok: true })

      const result = await client.markInboxSeen()

      expect(result).toEqual({ ok: true })
      expect(chatService.markInboxSeen).toHaveBeenCalledTimes(1)
    })
  })

  describe('dm', () => {
    it('When calling dm with uuid and cursor, then delegates with options', async () => {
      const mockData = { messages: [] }
      chatService.getDm.mockResolvedValueOnce(mockData as any)

      const result = await client.dm('user-uuid-123', { cursor: 'abc' })

      expect(result).toEqual(mockData)
      expect(chatService.getDm).toHaveBeenCalledWith('user-uuid-123', { cursor: 'abc' })
    })

    it('When calling dm with uuid only, then delegates without options', async () => {
      const mockData = { messages: [] }
      chatService.getDm.mockResolvedValueOnce(mockData as any)

      const result = await client.dm('user-uuid-456')

      expect(result).toEqual(mockData)
      expect(chatService.getDm).toHaveBeenCalledWith('user-uuid-456', undefined)
    })
  })

  describe('sendMessage', () => {
    it('When calling sendMessage with uuid and body, then delegates to chatService', async () => {
      const mockResponse = { messageId: 'msg-1', ok: true }
      chatService.sendMessage.mockResolvedValueOnce(mockResponse as any)

      const result = await client.sendMessage('user-uuid-123', 'Hello world')

      expect(result).toEqual(mockResponse)
      expect(chatService.sendMessage).toHaveBeenCalledWith(
        'user-uuid-123',
        'Hello world',
        undefined
      )
    })

    it('When calling sendMessage with clientId option, then passes it through', async () => {
      const mockResponse = { messageId: 'msg-2', ok: true }
      chatService.sendMessage.mockResolvedValueOnce(mockResponse as any)

      const result = await client.sendMessage('user-uuid-123', 'Hello', { clientId: 'client-abc' })

      expect(result).toEqual(mockResponse)
      expect(chatService.sendMessage).toHaveBeenCalledWith('user-uuid-123', 'Hello', {
        clientId: 'client-abc'
      })
    })
  })

  describe('markDmSeen', () => {
    it('When calling markDmSeen with uuid, then delegates to chatService', async () => {
      chatService.markDmSeen.mockResolvedValueOnce({ ok: true })

      const result = await client.markDmSeen('user-uuid-123')

      expect(result).toEqual({ ok: true })
      expect(chatService.markDmSeen).toHaveBeenCalledWith('user-uuid-123')
    })
  })

  describe('invites', () => {
    it('When calling invites, then delegates to chatService.getInvites', async () => {
      const mockData = { invites: [] }
      chatService.getInvites.mockResolvedValueOnce(mockData as any)

      const result = await client.invites()

      expect(result).toEqual(mockData)
      expect(chatService.getInvites).toHaveBeenCalledTimes(1)
    })

    it('When getInvites fails, then error propagates', async () => {
      chatService.getInvites.mockRejectedValueOnce(new Error('Invites error'))

      await expect(client.invites()).rejects.toThrow('Invites error')
    })
  })

  describe('markInvitesSeen', () => {
    it('When calling markInvitesSeen, then delegates to chatService.markInvitesSeen', async () => {
      chatService.markInvitesSeen.mockResolvedValueOnce({ ok: true })

      const result = await client.markInvitesSeen()

      expect(result).toEqual({ ok: true })
      expect(chatService.markInvitesSeen).toHaveBeenCalledTimes(1)
    })
  })

  describe('reactions', () => {
    it('When calling reactions, then delegates to chatService.getReactions', async () => {
      const mockData = { reactions: [] }
      chatService.getReactions.mockResolvedValueOnce(mockData as any)

      const result = await client.reactions()

      expect(result).toEqual(mockData)
      expect(chatService.getReactions).toHaveBeenCalledTimes(1)
    })
  })

  describe('realtimeToken', () => {
    it('When calling realtimeToken with channel, then delegates to chatService', async () => {
      const mockData = { token: 'rt-token-123', expiresAt: '2024-12-31' }
      chatService.getRealtimeToken.mockResolvedValueOnce(mockData as any)

      const result = await client.realtimeToken('channel-xyz')

      expect(result).toEqual(mockData)
      expect(chatService.getRealtimeToken).toHaveBeenCalledWith('channel-xyz')
    })

    it('When realtimeToken fails, then error propagates', async () => {
      chatService.getRealtimeToken.mockRejectedValueOnce(new Error('Token error'))

      await expect(client.realtimeToken('channel-xyz')).rejects.toThrow('Token error')
    })
  })

  describe('inboxThreads', () => {
    it('When iterating inboxThreads, then yields items from chatService.inboxThreads', async () => {
      const thread1 = { id: 't1', name: 'Thread 1' }
      const thread2 = { id: 't2', name: 'Thread 2' }

      async function* mockGenerator(): AsyncGenerator<any> {
        yield thread1
        yield thread2
      }
      ;(chatService as any).inboxThreads = mockGenerator

      const results: any[] = []
      for await (const thread of client.inboxThreads({ tab: 'all', limit: 10 })) {
        results.push(thread)
      }

      expect(results).toEqual([thread1, thread2])
    })

    it('When calling inboxThreads with default options, then uses empty object', async () => {
      const thread = { id: 't1' }

      async function* mockGenerator(): AsyncGenerator<any> {
        yield thread
      }
      ;(chatService as any).inboxThreads = mockGenerator

      const results: any[] = []
      for await (const thread of client.inboxThreads()) {
        results.push(thread)
      }

      expect(results).toEqual([thread])
    })
  })

  describe('dmMessages', () => {
    it('When iterating dmMessages, then yields items from chatService.dmMessages', async () => {
      const msg1 = { id: 'm1', body: 'Hello' }
      const msg2 = { id: 'm2', body: 'World' }

      async function* mockGenerator(): AsyncGenerator<any> {
        yield msg1
        yield msg2
      }
      ;(chatService as any).dmMessages = mockGenerator

      const results: any[] = []
      for await (const msg of client.dmMessages('user-uuid-123', { limit: 20 })) {
        results.push(msg)
      }

      expect(results).toEqual([msg1, msg2])
    })

    it('When calling dmMessages with default options, then uses empty object', async () => {
      const msg = { id: 'm1', body: 'Hello' }

      async function* mockGenerator(): AsyncGenerator<any> {
        yield msg
      }
      ;(chatService as any).dmMessages = mockGenerator

      const results: any[] = []
      for await (const msg of client.dmMessages('user-uuid-456')) {
        results.push(msg)
      }

      expect(results).toEqual([msg])
    })
  })
})
