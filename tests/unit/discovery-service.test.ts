import { DiscoveryService } from '@substack-api/internal/services/discovery-service'
import type { FeedTab, ProfileFeedTab } from '@substack-api/internal/services/discovery-service'
import type { HttpClient } from '@substack-api/internal/http-client'

describe('DiscoveryService', () => {
  let mockClient: jest.Mocked<HttpClient>
  let service: DiscoveryService

  beforeEach(() => {
    mockClient = {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn()
    } as unknown as jest.Mocked<HttpClient>
    service = new DiscoveryService(mockClient)
  })

  describe('getTopPosts', () => {
    it('should fetch and decode top posts', async () => {
      mockClient.get.mockResolvedValue({
        inboxItems: [
          {
            post_id: 1,
            type: 'post',
            title: 'Test Post',
            web_url: 'https://example.com/p/test'
          }
        ]
      })

      const result = await service.getTopPosts()
      expect(result.items).toHaveLength(1)
      expect(mockClient.get).toHaveBeenCalledWith('/inbox/top')
    })

    it('When empty inbox', async () => {
      mockClient.get.mockResolvedValue({})
      const result = await service.getTopPosts()
      expect(result.items).toHaveLength(0)
    })
  })

  describe('getFeed', () => {
    it('should fetch feed with default tab', async () => {
      mockClient.get.mockResolvedValue({ items: [], nextCursor: null })
      await service.getFeed()
      expect(mockClient.get).toHaveBeenCalledWith(expect.stringContaining('tab=for-you'))
    })

    it('should pass cursor for pagination', async () => {
      mockClient.get.mockResolvedValue({ items: [], nextCursor: null })
      await service.getFeed({ cursor: 'abc123' })
      expect(mockClient.get).toHaveBeenCalledWith(expect.stringContaining('cursor=abc123'))
    })

    it('When requesting items and nextCursor', async () => {
      mockClient.get.mockResolvedValue({
        items: [{ type: 'post' }],
        nextCursor: 'next-page'
      })
      const result = await service.getFeed({ tab: 'top' })
      expect(result.items).toHaveLength(1)
      expect(result.nextCursor).toBe('next-page')
    })

    it('should accept different feed tabs', async () => {
      const tabs: FeedTab[] = ['for-you', 'top', 'popular', 'catchup', 'notes', 'explore']
      for (const tab of tabs) {
        mockClient.get.mockResolvedValueOnce({ items: [], nextCursor: null })
        await service.getFeed({ tab })
        expect(mockClient.get).toHaveBeenCalledWith(
          expect.stringContaining(`tab=${encodeURIComponent(tab)}`)
        )
      }
    })
  })

  describe('getCategories', () => {
    it('should fetch and decode categories', async () => {
      mockClient.get.mockResolvedValue([
        {
          id: 1,
          name: 'Technology',
          canonical_name: 'technology',
          active: true,
          rank: 0,
          slug: 'technology',
          subcategories: []
        }
      ])

      const result = await service.getCategories()
      expect(result).toHaveLength(1)
      expect(mockClient.get).toHaveBeenCalledWith('/categories')
    })
  })

  describe('getProfileActivity', () => {
    it('should fetch profile activity', async () => {
      mockClient.get.mockResolvedValue({ items: [], nextCursor: null })
      const result = await service.getProfileActivity(123)
      expect(mockClient.get).toHaveBeenCalledWith('/reader/feed/profile/123')
      expect(result.nextCursor).toBeNull()
    })

    it('should pass cursor for pagination', async () => {
      mockClient.get.mockResolvedValue({ items: [], nextCursor: null })
      await service.getProfileActivity(123, { cursor: 'xyz' })
      expect(mockClient.get).toHaveBeenCalledWith(expect.stringContaining('cursor=xyz'))
    })

    it('should include tab parameter in URL', async () => {
      mockClient.get.mockResolvedValue({ items: [], nextCursor: null })
      await service.getProfileActivity(123, { tab: 'posts' })
      expect(mockClient.get).toHaveBeenCalledWith(expect.stringContaining('tab=posts'))
    })

    it('should accept different tab values', async () => {
      const tabs: ProfileFeedTab[] = ['posts', 'notes', 'comments', 'likes']
      for (const tab of tabs) {
        mockClient.get.mockResolvedValueOnce({ items: [], nextCursor: null })
        await service.getProfileActivity(123, { tab })
        expect(mockClient.get).toHaveBeenCalledWith(expect.stringContaining(`tab=${tab}`))
      }
    })

    it('should omit tab when not specified', async () => {
      mockClient.get.mockResolvedValue({ items: [], nextCursor: null })
      await service.getProfileActivity(123)
      const calledUrl = mockClient.get.mock.calls[0][0] as string
      expect(calledUrl).not.toContain('tab=')
    })
  })

  describe('getProfileLikes', () => {
    it('should fetch profile likes with types[]=like', async () => {
      mockClient.get.mockResolvedValue({ items: [], nextCursor: null })
      await service.getProfileLikes(456)
      expect(mockClient.get).toHaveBeenCalledWith(expect.stringContaining('types%5B%5D=like'))
    })
  })
})
