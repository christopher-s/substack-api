import { FeedService } from '@substack-api/internal/services/feed-service'
import { CategoryService } from '@substack-api/internal/services/category-service'
import { ProfileActivityService } from '@substack-api/internal/services/profile-activity-service'
import type { FeedTab, ProfileFeedTab } from '@substack-api/internal/services/feed-types'
import type { HttpClient } from '@substack-api/internal/http-client'

describe('FeedService / CategoryService / ProfileActivityService', () => {
  let mockClient: jest.Mocked<HttpClient>
  let feedService: FeedService
  let categoryService: CategoryService
  let profileActivityService: ProfileActivityService

  beforeEach(() => {
    mockClient = {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn()
    } as unknown as jest.Mocked<HttpClient>
    feedService = new FeedService(mockClient)
    categoryService = new CategoryService(mockClient)
    profileActivityService = new ProfileActivityService(mockClient)
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

      const result = await feedService.getTopPosts()
      expect(result.items).toHaveLength(1)
      expect(mockClient.get).toHaveBeenCalledWith('/inbox/top')
    })

    it('When empty inbox', async () => {
      mockClient.get.mockResolvedValue({})
      const result = await feedService.getTopPosts()
      expect(result.items).toHaveLength(0)
    })
  })

  describe('getFeed', () => {
    it('should fetch feed with default tab', async () => {
      mockClient.get.mockResolvedValue({ items: [], nextCursor: null })
      await feedService.getFeed()
      expect(mockClient.get).toHaveBeenCalledWith(expect.stringContaining('tab=for-you'))
    })

    it('should pass cursor for pagination', async () => {
      mockClient.get.mockResolvedValue({ items: [], nextCursor: null })
      await feedService.getFeed({ cursor: 'abc123' })
      expect(mockClient.get).toHaveBeenCalledWith(expect.stringContaining('cursor=abc123'))
    })

    it('When requesting items and nextCursor', async () => {
      mockClient.get.mockResolvedValue({
        items: [{ type: 'post' }],
        nextCursor: 'next-page'
      })
      const result = await feedService.getFeed({ tab: 'top' })
      expect(result.items).toHaveLength(1)
      expect(result.nextCursor).toBe('next-page')
    })

    it('should accept different feed tabs', async () => {
      const tabs: FeedTab[] = ['for-you', 'top', 'popular', 'catchup', 'notes', 'explore']
      for (const tab of tabs) {
        mockClient.get.mockResolvedValueOnce({ items: [], nextCursor: null })
        await feedService.getFeed({ tab })
        expect(mockClient.get).toHaveBeenCalledWith(
          expect.stringContaining(`tab=${encodeURIComponent(tab)}`)
        )
      }
    })

    it('should use tab_id parameter when tabId is provided', async () => {
      mockClient.get.mockResolvedValue({ items: [], nextCursor: null })
      await feedService.getFeed({ tabId: 'subscribed' })
      expect(mockClient.get).toHaveBeenCalledWith(expect.stringContaining('tab_id=subscribed'))
      expect(mockClient.get).not.toHaveBeenCalledWith(expect.stringContaining('tab='))
    })

    it('should return tabs metadata when present', async () => {
      const mockTabs = [
        { id: 'for-you', name: 'For you', type: 'base' },
        { id: 'subscribed', name: 'Following', type: 'secondary' }
      ]
      mockClient.get.mockResolvedValue({ items: [], nextCursor: null, tabs: mockTabs })
      const result = await feedService.getFeed({ tabId: 'for-you' })
      expect(result.tabs).toEqual(mockTabs)
    })

    it('should omit tabs when not in response', async () => {
      mockClient.get.mockResolvedValue({ items: [], nextCursor: null })
      const result = await feedService.getFeed()
      expect(result.tabs).toBeUndefined()
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

      const result = await categoryService.getCategories()
      expect(result).toHaveLength(1)
      expect(mockClient.get).toHaveBeenCalledWith('/categories')
    })
  })

  describe('getProfileActivity', () => {
    it('should fetch profile activity', async () => {
      mockClient.get.mockResolvedValue({ items: [], nextCursor: null })
      const result = await profileActivityService.getProfileActivity(123)
      expect(mockClient.get).toHaveBeenCalledWith('/reader/feed/profile/123')
      expect(result.nextCursor).toBeNull()
    })

    it('should pass cursor for pagination', async () => {
      mockClient.get.mockResolvedValue({ items: [], nextCursor: null })
      await profileActivityService.getProfileActivity(123, { cursor: 'xyz' })
      expect(mockClient.get).toHaveBeenCalledWith(expect.stringContaining('cursor=xyz'))
    })

    it('should include tab parameter in URL', async () => {
      mockClient.get.mockResolvedValue({ items: [], nextCursor: null })
      await profileActivityService.getProfileActivity(123, { tab: 'posts' })
      expect(mockClient.get).toHaveBeenCalledWith(expect.stringContaining('tab=posts'))
    })

    it('should accept different tab values', async () => {
      const tabs: ProfileFeedTab[] = ['posts', 'notes', 'comments', 'likes']
      for (const tab of tabs) {
        mockClient.get.mockResolvedValueOnce({ items: [], nextCursor: null })
        await profileActivityService.getProfileActivity(123, { tab })
        expect(mockClient.get).toHaveBeenCalledWith(expect.stringContaining(`tab=${tab}`))
      }
    })

    it('should omit tab when not specified', async () => {
      mockClient.get.mockResolvedValue({ items: [], nextCursor: null })
      await profileActivityService.getProfileActivity(123)
      const calledUrl = mockClient.get.mock.calls[0][0] as string
      expect(calledUrl).not.toContain('tab=')
    })
  })

  describe('getProfileLikes', () => {
    it('should fetch profile likes with types[]=like', async () => {
      mockClient.get.mockResolvedValue({ items: [], nextCursor: null })
      await profileActivityService.getProfileLikes(456)
      expect(mockClient.get).toHaveBeenCalledWith(expect.stringContaining('types%5B%5D=like'))
    })
  })
})
