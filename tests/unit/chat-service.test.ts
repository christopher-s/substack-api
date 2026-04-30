import { ChatService } from '@substack-api/internal/services/chat-service'
import { HttpClient } from '@substack-api/internal/http-client'

jest.mock('@substack-api/internal/http-client')

describe('ChatService', () => {
  let mockSubstackClient: jest.Mocked<HttpClient>
  let service: ChatService

  const mockUnreadCount = {
    unreadCount: 3,
    pendingInviteCount: 1,
    pendingInviteUnreadCount: 0,
    newPendingInviteUnreadCount: 0,
    pubChatUnreadCount: 2
  }

  const mockThread = {
    id: 'thread-1',
    type: 'direct-message',
    timestamp: '2026-01-01T00:00:00Z'
  }

  const mockMessage = {
    id: 'msg-1',
    body: 'Hello world'
  }

  const mockChatUser = {
    id: 42,
    name: 'Test User',
    handle: 'testuser'
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockSubstackClient = new HttpClient('https://test.com', 'test') as jest.Mocked<HttpClient>
    mockSubstackClient.get = jest.fn()
    mockSubstackClient.post = jest.fn()
    service = new ChatService(mockSubstackClient)
  })

  describe('getUnreadCount', () => {
    it('When fetching unread count', async () => {
      mockSubstackClient.get.mockResolvedValueOnce(mockUnreadCount)

      const result = await service.getUnreadCount()

      expect(result).toEqual(mockUnreadCount)
      expect(mockSubstackClient.get).toHaveBeenCalledWith('/messages/unread-count')
    })
  })

  describe('getInbox', () => {
    it('When fetching inbox without tab filter', async () => {
      const mockInbox = { threads: [mockThread], more: false }
      mockSubstackClient.get.mockResolvedValueOnce(mockInbox)

      const result = await service.getInbox()

      expect(result).toEqual(mockInbox)
      expect(mockSubstackClient.get).toHaveBeenCalledWith('/messages/inbox')
    })

    it('When fetching inbox with tab filter', async () => {
      const mockInbox = { threads: [mockThread], more: false }
      mockSubstackClient.get.mockResolvedValueOnce(mockInbox)

      const result = await service.getInbox({ tab: 'people' })

      expect(result).toEqual(mockInbox)
      expect(mockSubstackClient.get).toHaveBeenCalledWith('/messages/inbox?tab=people')
    })
  })

  describe('markInboxSeen', () => {
    it('When marking inbox as seen', async () => {
      mockSubstackClient.post.mockResolvedValueOnce({ ok: true })

      const result = await service.markInboxSeen()

      expect(result).toEqual({ ok: true })
      expect(mockSubstackClient.post).toHaveBeenCalledWith('/messages/inbox/seen')
    })
  })

  describe('getDm', () => {
    it('When fetching DM without cursor', async () => {
      const mockDm = { messages: [mockMessage], more: false }
      mockSubstackClient.get.mockResolvedValueOnce(mockDm)

      const result = await service.getDm('uuid-123')

      expect(result).toEqual(mockDm)
      expect(mockSubstackClient.get).toHaveBeenCalledWith('/messages/dm/uuid-123')
    })

    it('When fetching DM with cursor', async () => {
      const mockDm = { messages: [mockMessage], more: false, cursor: 'next-cursor' }
      mockSubstackClient.get.mockResolvedValueOnce(mockDm)

      const result = await service.getDm('uuid-123', { cursor: 'abc' })

      expect(result).toEqual(mockDm)
      expect(mockSubstackClient.get).toHaveBeenCalledWith('/messages/dm/uuid-123?cursor=abc')
    })
  })

  describe('sendMessage', () => {
    it('When sending a message', async () => {
      const mockResponse = {
        thread: { id: 'thread-1' },
        reply: { comment: mockMessage, user: mockChatUser }
      }
      mockSubstackClient.post.mockResolvedValueOnce(mockResponse)

      const result = await service.sendMessage('uuid-123', 'Hello')

      expect(result).toEqual(mockResponse)
      expect(mockSubstackClient.post).toHaveBeenCalledWith('/messages/dm/uuid-123', {
        body: 'Hello',
        client_id: expect.any(String)
      })
    })

    it('When sending a message with custom clientId', async () => {
      const mockResponse = {
        thread: { id: 'thread-1' },
        reply: { comment: mockMessage, user: mockChatUser }
      }
      mockSubstackClient.post.mockResolvedValueOnce(mockResponse)

      const result = await service.sendMessage('uuid-123', 'Hello', { clientId: 'custom-id' })

      expect(result).toEqual(mockResponse)
      expect(mockSubstackClient.post).toHaveBeenCalledWith('/messages/dm/uuid-123', {
        body: 'Hello',
        client_id: 'custom-id'
      })
    })
  })

  describe('markDmSeen', () => {
    it('When marking DM as seen', async () => {
      mockSubstackClient.post.mockResolvedValueOnce({ ok: true })

      const result = await service.markDmSeen('uuid-123')

      expect(result).toEqual({ ok: true })
      expect(mockSubstackClient.post).toHaveBeenCalledWith('/messages/dm/uuid-123/seen')
    })
  })

  describe('getInvites', () => {
    it('When fetching invites', async () => {
      const mockInvites = {
        threads: [mockThread],
        spamThreads: [],
        subscriberThreads: [],
        more: false
      }
      mockSubstackClient.get.mockResolvedValueOnce(mockInvites)

      const result = await service.getInvites()

      expect(result).toEqual(mockInvites)
      expect(mockSubstackClient.get).toHaveBeenCalledWith('/messages/dm/invites?paginate=true')
    })
  })

  describe('markInvitesSeen', () => {
    it('When marking invites as seen', async () => {
      mockSubstackClient.post.mockResolvedValueOnce({ ok: true })

      const result = await service.markInvitesSeen()

      expect(result).toEqual({ ok: true })
      expect(mockSubstackClient.post).toHaveBeenCalledWith('/messages/inbox/invites/seen')
    })
  })

  describe('getReactions', () => {
    it('When fetching reactions', async () => {
      const mockReactions = {
        suggestedReactionTypes: ['❤️'],
        categories: [],
        reactionTypes: {}
      }
      mockSubstackClient.get.mockResolvedValueOnce(mockReactions)

      const result = await service.getReactions()

      expect(result).toEqual(mockReactions)
      expect(mockSubstackClient.get).toHaveBeenCalledWith('/threads/reactions')
    })
  })

  describe('getRealtimeToken', () => {
    it('When fetching realtime token', async () => {
      const mockToken = {
        token: 'abc123',
        expiry: '2026-01-01T01:00:00Z',
        permissions: ['read'],
        endpoint: 'wss://example.com'
      }
      mockSubstackClient.get.mockResolvedValueOnce(mockToken)

      const result = await service.getRealtimeToken('channel-1')

      expect(result).toEqual(mockToken)
      expect(mockSubstackClient.get).toHaveBeenCalledWith('/realtime/token?channels=channel-1')
    })
  })

  describe('inboxThreads', () => {
    it('When iterating inbox threads', async () => {
      const threads = [mockThread, { ...mockThread, id: 'thread-2' }]
      mockSubstackClient.get.mockResolvedValueOnce({ threads, more: false })

      const collected: unknown[] = []
      for await (const thread of service.inboxThreads()) {
        collected.push(thread)
      }

      expect(collected).toHaveLength(2)
    })

    it('When iterating inbox threads with limit', async () => {
      const threads = [mockThread, { ...mockThread, id: 'thread-2' }]
      mockSubstackClient.get.mockResolvedValueOnce({ threads, more: false })

      const collected: unknown[] = []
      for await (const thread of service.inboxThreads({ limit: 1 })) {
        collected.push(thread)
      }

      expect(collected).toHaveLength(1)
    })
  })

  describe('dmMessages', () => {
    it('When iterating DM messages single page', async () => {
      mockSubstackClient.get.mockResolvedValueOnce({
        messages: [mockMessage],
        more: false
      })

      const collected: unknown[] = []
      for await (const msg of service.dmMessages('uuid-123')) {
        collected.push(msg)
      }

      expect(collected).toHaveLength(1)
    })

    it('When iterating DM messages with pagination', async () => {
      const msg2 = { ...mockMessage, id: 'msg-2' }
      mockSubstackClient.get
        .mockResolvedValueOnce({ messages: [mockMessage], more: true, cursor: 'page2' })
        .mockResolvedValueOnce({ messages: [msg2], more: false })

      const collected: unknown[] = []
      for await (const msg of service.dmMessages('uuid-123')) {
        collected.push(msg)
      }

      expect(collected).toHaveLength(2)
      expect(mockSubstackClient.get).toHaveBeenCalledTimes(2)
    })

    it('When iterating DM messages with limit', async () => {
      mockSubstackClient.get.mockResolvedValueOnce({
        messages: [mockMessage, { ...mockMessage, id: 'msg-2' }],
        more: false
      })

      const collected: unknown[] = []
      for await (const msg of service.dmMessages('uuid-123', { limit: 1 })) {
        collected.push(msg)
      }

      expect(collected).toHaveLength(1)
    })
  })
})
