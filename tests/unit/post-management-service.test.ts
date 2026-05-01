import { PostManagementService } from '@substack-api/internal/services/post-management-service'
import type { HttpClient } from '@substack-api/internal/http-client'

describe('PostManagementService', () => {
  let mockClient: jest.Mocked<HttpClient>
  let service: PostManagementService

  beforeEach(() => {
    mockClient = {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn()
    } as unknown as jest.Mocked<HttpClient>
    service = new PostManagementService(mockClient)
  })

  describe('getPublishedPosts', () => {
    it('should fetch published posts with default parameters', async () => {
      const mockResponse = {
        posts: [{ id: 1, title: 'Published Post' }],
        offset: 0,
        limit: 25,
        total: 1
      }
      mockClient.get.mockResolvedValue(mockResponse)

      const result = await service.getPublishedPosts()
      expect(result).toEqual(mockResponse)
      expect(mockClient.get).toHaveBeenCalledWith(
        '/post_management/published?offset=0&limit=25&order_by=post_date&order_direction=desc'
      )
    })

    it('should pass custom offset, limit, orderBy, and orderDirection', async () => {
      mockClient.get.mockResolvedValue({ posts: [], offset: 10, limit: 5, total: 0 })
      await service.getPublishedPosts({
        offset: 10,
        limit: 5,
        orderBy: 'title',
        orderDirection: 'asc'
      })
      expect(mockClient.get).toHaveBeenCalledWith(
        '/post_management/published?offset=10&limit=5&order_by=title&order_direction=asc'
      )
    })

    it('should propagate HTTP errors', async () => {
      mockClient.get.mockRejectedValue(new Error('HTTP 500'))
      await expect(service.getPublishedPosts()).rejects.toThrow('HTTP 500')
    })
  })

  describe('getDrafts', () => {
    it('should fetch drafts with default parameters', async () => {
      const mockResponse = {
        posts: [{ id: 2, draft_title: 'Draft Post' }],
        offset: 0,
        limit: 25,
        total: 1
      }
      mockClient.get.mockResolvedValue(mockResponse)

      const result = await service.getDrafts()
      expect(result).toEqual(mockResponse)
      expect(mockClient.get).toHaveBeenCalledWith(
        '/post_management/drafts?offset=0&limit=25&order_by=draft_updated_at&order_direction=desc'
      )
    })

    it('should pass custom parameters', async () => {
      mockClient.get.mockResolvedValue({ posts: [], offset: 5, limit: 10, total: 0 })
      await service.getDrafts({ offset: 5, limit: 10, orderBy: 'title', orderDirection: 'asc' })
      expect(mockClient.get).toHaveBeenCalledWith(
        '/post_management/drafts?offset=5&limit=10&order_by=title&order_direction=asc'
      )
    })

    it('should propagate HTTP errors', async () => {
      mockClient.get.mockRejectedValue(new Error('HTTP 403'))
      await expect(service.getDrafts()).rejects.toThrow('HTTP 403')
    })
  })

  describe('getScheduledPosts', () => {
    it('should fetch scheduled posts with default parameters', async () => {
      const mockResponse = {
        posts: [{ id: 3, draft_title: 'Scheduled Post' }],
        offset: 0,
        limit: 25,
        total: 1
      }
      mockClient.get.mockResolvedValue(mockResponse)

      const result = await service.getScheduledPosts()
      expect(result).toEqual(mockResponse)
      expect(mockClient.get).toHaveBeenCalledWith(
        '/post_management/scheduled?offset=0&limit=25&order_by=trigger_at&order_direction=asc'
      )
    })

    it('should pass custom parameters', async () => {
      mockClient.get.mockResolvedValue({ posts: [], offset: 20, limit: 50, total: 0 })
      await service.getScheduledPosts({
        offset: 20,
        limit: 50,
        orderBy: 'post_date',
        orderDirection: 'desc'
      })
      expect(mockClient.get).toHaveBeenCalledWith(
        '/post_management/scheduled?offset=20&limit=50&order_by=post_date&order_direction=desc'
      )
    })

    it('should propagate HTTP errors', async () => {
      mockClient.get.mockRejectedValue(new Error('HTTP 401'))
      await expect(service.getScheduledPosts()).rejects.toThrow('HTTP 401')
    })
  })

  describe('getPostCounts', () => {
    it('should fetch post counts without query', async () => {
      const mockResponse = { published: 30, drafts: 12, scheduled: 0 }
      mockClient.get.mockResolvedValue(mockResponse)

      const result = await service.getPostCounts()
      expect(result).toEqual(mockResponse)
      expect(mockClient.get).toHaveBeenCalledWith('/post_management/counts?query=')
    })

    it('should pass query parameter', async () => {
      mockClient.get.mockResolvedValue({ published: 5, drafts: 0, scheduled: 0 })
      await service.getPostCounts('test search')
      expect(mockClient.get).toHaveBeenCalledWith('/post_management/counts?query=test%20search')
    })

    it('should propagate HTTP errors', async () => {
      mockClient.get.mockRejectedValue(new Error('HTTP 500'))
      await expect(service.getPostCounts()).rejects.toThrow('HTTP 500')
    })
  })

  describe('getDraft', () => {
    it('should fetch a single draft by id', async () => {
      const mockResponse = { id: 123, draft_title: 'My Draft' }
      mockClient.get.mockResolvedValue(mockResponse)

      const result = await service.getDraft(123)
      expect(result).toEqual(mockResponse)
      expect(mockClient.get).toHaveBeenCalledWith('/drafts/123')
    })

    it('should propagate HTTP errors', async () => {
      mockClient.get.mockRejectedValue(new Error('HTTP 404'))
      await expect(service.getDraft(999)).rejects.toThrow('HTTP 404')
    })
  })

  describe('createDraft', () => {
    it('should create a draft with title only', async () => {
      const mockResponse = { id: 456, draft_title: 'New Post' }
      mockClient.post.mockResolvedValue(mockResponse)

      const result = await service.createDraft({ title: 'New Post' })
      expect(result).toEqual(mockResponse)
      expect(mockClient.post).toHaveBeenCalledWith('/drafts', {
        draft_title: 'New Post',
        draft_body: undefined,
        type: 'newsletter',
        audience: 'everyone',
        draft_bylines: undefined
      })
    })

    it('should create a draft with all fields', async () => {
      const mockResponse = { id: 789 }
      mockClient.post.mockResolvedValue(mockResponse)

      await service.createDraft({
        title: 'Full Draft',
        body: '<p>Content</p>',
        type: 'podcast',
        audience: 'only_paid',
        bylineUserId: 42
      })
      expect(mockClient.post).toHaveBeenCalledWith('/drafts', {
        draft_title: 'Full Draft',
        draft_body: '<p>Content</p>',
        type: 'podcast',
        audience: 'only_paid',
        draft_bylines: [{ id: 42, is_draft: true, is_guest: false }]
      })
    })

    it('should propagate HTTP errors', async () => {
      mockClient.post.mockRejectedValue(new Error('HTTP 400'))
      await expect(service.createDraft({ title: 'Fail' })).rejects.toThrow('HTTP 400')
    })
  })

  describe('updateDraft', () => {
    it('should update a draft with title and body', async () => {
      const mockResponse = { id: 100 }
      mockClient.put.mockResolvedValue(mockResponse)

      const result = await service.updateDraft(100, {
        title: 'Updated Title',
        body: 'Updated body'
      })
      expect(result).toEqual(mockResponse)
      expect(mockClient.put).toHaveBeenCalledWith('/drafts/100', {
        draft_title: 'Updated Title',
        draft_body: 'Updated body'
      })
    })

    it('should include extra fields beyond title and body', async () => {
      mockClient.put.mockResolvedValue({ id: 200 })
      await service.updateDraft(200, {
        title: 'Title',
        custom_field: 'value',
        numeric_field: 42
      })
      expect(mockClient.put).toHaveBeenCalledWith('/drafts/200', {
        draft_title: 'Title',
        custom_field: 'value',
        numeric_field: 42
      })
    })

    it('should send empty body when no fields match title/body', async () => {
      mockClient.put.mockResolvedValue({ id: 300 })
      await service.updateDraft(300, { metadata: 'test' })
      expect(mockClient.put).toHaveBeenCalledWith('/drafts/300', {
        metadata: 'test'
      })
    })

    it('should propagate HTTP errors', async () => {
      mockClient.put.mockRejectedValue(new Error('HTTP 404'))
      await expect(service.updateDraft(999, { title: 'X' })).rejects.toThrow('HTTP 404')
    })
  })

  describe('publishDraft', () => {
    it('should publish a draft by id', async () => {
      const mockResponse = { id: 555, status: 'published' }
      mockClient.post.mockResolvedValue(mockResponse)

      const result = await service.publishDraft(555)
      expect(result).toEqual(mockResponse)
      expect(mockClient.post).toHaveBeenCalledWith('/drafts/555/publish', {})
    })

    it('should propagate HTTP errors', async () => {
      mockClient.post.mockRejectedValue(new Error('HTTP 403'))
      await expect(service.publishDraft(111)).rejects.toThrow('HTTP 403')
    })
  })

  describe('deleteDraft', () => {
    it('should delete a draft by id', async () => {
      const mockResponse = { success: true }
      mockClient.delete.mockResolvedValue(mockResponse)

      const result = await service.deleteDraft(777)
      expect(result).toEqual(mockResponse)
      expect(mockClient.delete).toHaveBeenCalledWith('/drafts/777')
    })

    it('should propagate HTTP errors', async () => {
      mockClient.delete.mockRejectedValue(new Error('HTTP 404'))
      await expect(service.deleteDraft(999)).rejects.toThrow('HTTP 404')
    })
  })
})
