import { SubstackClient } from '@substack-api/substack-client'
import { HttpClient } from '@substack-api/internal/http-client'
import { PostManagementService } from '@substack-api/internal/services'

jest.mock('@substack-api/internal/http-client')
jest.mock('@substack-api/internal/services')

describe('SubstackClient post management methods', () => {
  let client: SubstackClient
  let mockPostManagementService: jest.Mocked<PostManagementService>

  beforeEach(() => {
    jest.clearAllMocks()

    const mockHttpClient = new HttpClient('https://test.com', 'test') as jest.Mocked<HttpClient>
    mockHttpClient.get = jest.fn()
    mockHttpClient.post = jest.fn()
    mockHttpClient.put = jest.fn()

    mockPostManagementService = new PostManagementService(
      mockHttpClient
    ) as jest.Mocked<PostManagementService>
    mockPostManagementService.getPublishedPosts = jest.fn()
    mockPostManagementService.getDrafts = jest.fn()
    mockPostManagementService.getScheduledPosts = jest.fn()
    mockPostManagementService.getPostCounts = jest.fn()
    mockPostManagementService.getDraft = jest.fn()
    mockPostManagementService.createDraft = jest.fn()
    mockPostManagementService.updateDraft = jest.fn()
    mockPostManagementService.publishDraft = jest.fn()
    mockPostManagementService.deleteDraft = jest.fn()

    client = new SubstackClient({
      token: 'test-api-key',
      publicationUrl: 'https://test.substack.com'
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const anyClient = client as any
    anyClient.postManagementService = mockPostManagementService
  })

  describe('publishedPosts', () => {
    it('should delegate to postManagementService', async () => {
      const mockResponse = [{ id: 1, title: 'Post' }]
      mockPostManagementService.getPublishedPosts.mockResolvedValue(mockResponse)

      const result = await client.publishedPosts()
      expect(result).toEqual(mockResponse)
      expect(mockPostManagementService.getPublishedPosts).toHaveBeenCalledWith(undefined)
    })

    it('should pass options to service', async () => {
      mockPostManagementService.getPublishedPosts.mockResolvedValue([])
      await client.publishedPosts({ offset: 10, limit: 5 })
      expect(mockPostManagementService.getPublishedPosts).toHaveBeenCalledWith({
        offset: 10,
        limit: 5
      })
    })

    it('should throw when no token is configured', async () => {
      const unauthClient = new SubstackClient({ publicationUrl: 'https://test.substack.com' })
      await expect(unauthClient.publishedPosts()).rejects.toThrow(
        'Authentication required: provide a token in SubstackConfig to use publishedPosts()'
      )
    })

    it('should throw when no publicationUrl is configured', async () => {
      const noPubClient = new SubstackClient({ token: 'test-api-key' })
      await expect(noPubClient.publishedPosts()).rejects.toThrow(
        'Publication required: provide a publicationUrl in SubstackConfig to use publishedPosts()'
      )
    })
  })

  describe('drafts', () => {
    it('should delegate to postManagementService', async () => {
      const mockResponse = [{ id: 2, draft_title: 'Draft' }]
      mockPostManagementService.getDrafts.mockResolvedValue(mockResponse)

      const result = await client.drafts()
      expect(result).toEqual(mockResponse)
      expect(mockPostManagementService.getDrafts).toHaveBeenCalledWith(undefined)
    })

    it('should pass options to service', async () => {
      mockPostManagementService.getDrafts.mockResolvedValue([])
      await client.drafts({ offset: 5, limit: 10 })
      expect(mockPostManagementService.getDrafts).toHaveBeenCalledWith({ offset: 5, limit: 10 })
    })

    it('should throw when no token is configured', async () => {
      const unauthClient = new SubstackClient({ publicationUrl: 'https://test.substack.com' })
      await expect(unauthClient.drafts()).rejects.toThrow(
        'Authentication required: provide a token in SubstackConfig to use drafts()'
      )
    })

    it('should throw when no publicationUrl is configured', async () => {
      const noPubClient = new SubstackClient({ token: 'test-api-key' })
      await expect(noPubClient.drafts()).rejects.toThrow(
        'Publication required: provide a publicationUrl in SubstackConfig to use drafts()'
      )
    })
  })

  describe('scheduledPosts', () => {
    it('should delegate to postManagementService', async () => {
      const mockResponse = [{ id: 3, draft_title: 'Scheduled' }]
      mockPostManagementService.getScheduledPosts.mockResolvedValue(mockResponse)

      const result = await client.scheduledPosts()
      expect(result).toEqual(mockResponse)
      expect(mockPostManagementService.getScheduledPosts).toHaveBeenCalledWith(undefined)
    })

    it('should pass options to service', async () => {
      mockPostManagementService.getScheduledPosts.mockResolvedValue([])
      await client.scheduledPosts({ offset: 0, limit: 50 })
      expect(mockPostManagementService.getScheduledPosts).toHaveBeenCalledWith({
        offset: 0,
        limit: 50
      })
    })

    it('should throw when no token is configured', async () => {
      const unauthClient = new SubstackClient({ publicationUrl: 'https://test.substack.com' })
      await expect(unauthClient.scheduledPosts()).rejects.toThrow(
        'Authentication required: provide a token in SubstackConfig to use scheduledPosts()'
      )
    })

    it('should throw when no publicationUrl is configured', async () => {
      const noPubClient = new SubstackClient({ token: 'test-api-key' })
      await expect(noPubClient.scheduledPosts()).rejects.toThrow(
        'Publication required: provide a publicationUrl in SubstackConfig to use scheduledPosts()'
      )
    })
  })

  describe('postCounts', () => {
    it('should delegate to postManagementService', async () => {
      const mockResponse = { total: 42, published: 30, draft: 12 }
      mockPostManagementService.getPostCounts.mockResolvedValue(mockResponse)

      const result = await client.postCounts()
      expect(result).toEqual(mockResponse)
      expect(mockPostManagementService.getPostCounts).toHaveBeenCalled()
    })

    it('should throw when no token is configured', async () => {
      const unauthClient = new SubstackClient({ publicationUrl: 'https://test.substack.com' })
      await expect(unauthClient.postCounts()).rejects.toThrow(
        'Authentication required: provide a token in SubstackConfig to use postCounts()'
      )
    })

    it('should throw when no publicationUrl is configured', async () => {
      const noPubClient = new SubstackClient({ token: 'test-api-key' })
      await expect(noPubClient.postCounts()).rejects.toThrow(
        'Publication required: provide a publicationUrl in SubstackConfig to use postCounts()'
      )
    })
  })

  describe('draft', () => {
    it('should delegate to postManagementService', async () => {
      const mockResponse = { id: 123, draft_title: 'My Draft' }
      mockPostManagementService.getDraft.mockResolvedValue(mockResponse)

      const result = await client.draft(123)
      expect(result).toEqual(mockResponse)
      expect(mockPostManagementService.getDraft).toHaveBeenCalledWith(123)
    })

    it('should throw when no token is configured', async () => {
      const unauthClient = new SubstackClient({ publicationUrl: 'https://test.substack.com' })
      await expect(unauthClient.draft(123)).rejects.toThrow(
        'Authentication required: provide a token in SubstackConfig to use draft()'
      )
    })

    it('should throw when no publicationUrl is configured', async () => {
      const noPubClient = new SubstackClient({ token: 'test-api-key' })
      await expect(noPubClient.draft(123)).rejects.toThrow(
        'Publication required: provide a publicationUrl in SubstackConfig to use draft()'
      )
    })
  })

  describe('createDraft', () => {
    it('should delegate to postManagementService', async () => {
      const mockResponse = { id: 456 }
      mockPostManagementService.createDraft.mockResolvedValue(mockResponse)

      const result = await client.createDraft({ title: 'New Post' })
      expect(result).toEqual(mockResponse)
      expect(mockPostManagementService.createDraft).toHaveBeenCalledWith({ title: 'New Post' })
    })

    it('should pass all fields to service', async () => {
      mockPostManagementService.createDraft.mockResolvedValue({})
      await client.createDraft({
        title: 'Full Draft',
        body: '<p>Content</p>',
        type: 'podcast',
        audience: 'only_paid',
        bylineUserId: 42
      })
      expect(mockPostManagementService.createDraft).toHaveBeenCalledWith({
        title: 'Full Draft',
        body: '<p>Content</p>',
        type: 'podcast',
        audience: 'only_paid',
        bylineUserId: 42
      })
    })

    it('should throw when no token is configured', async () => {
      const unauthClient = new SubstackClient({ publicationUrl: 'https://test.substack.com' })
      await expect(unauthClient.createDraft({ title: 'X' })).rejects.toThrow(
        'Authentication required: provide a token in SubstackConfig to use createDraft()'
      )
    })

    it('should throw when no publicationUrl is configured', async () => {
      const noPubClient = new SubstackClient({ token: 'test-api-key' })
      await expect(noPubClient.createDraft({ title: 'X' })).rejects.toThrow(
        'Publication required: provide a publicationUrl in SubstackConfig to use createDraft()'
      )
    })
  })

  describe('updateDraft', () => {
    it('should delegate to postManagementService', async () => {
      const mockResponse = { id: 100 }
      mockPostManagementService.updateDraft.mockResolvedValue(mockResponse)

      const result = await client.updateDraft(100, { title: 'Updated' })
      expect(result).toEqual(mockResponse)
      expect(mockPostManagementService.updateDraft).toHaveBeenCalledWith(100, { title: 'Updated' })
    })

    it('should throw when no token is configured', async () => {
      const unauthClient = new SubstackClient({ publicationUrl: 'https://test.substack.com' })
      await expect(unauthClient.updateDraft(1, { title: 'X' })).rejects.toThrow(
        'Authentication required: provide a token in SubstackConfig to use updateDraft()'
      )
    })

    it('should throw when no publicationUrl is configured', async () => {
      const noPubClient = new SubstackClient({ token: 'test-api-key' })
      await expect(noPubClient.updateDraft(1, { title: 'X' })).rejects.toThrow(
        'Publication required: provide a publicationUrl in SubstackConfig to use updateDraft()'
      )
    })
  })

  describe('publishDraft', () => {
    it('should delegate to postManagementService', async () => {
      const mockResponse = { id: 555, status: 'published' }
      mockPostManagementService.publishDraft.mockResolvedValue(mockResponse)

      const result = await client.publishDraft(555)
      expect(result).toEqual(mockResponse)
      expect(mockPostManagementService.publishDraft).toHaveBeenCalledWith(555)
    })

    it('should throw when no token is configured', async () => {
      const unauthClient = new SubstackClient({ publicationUrl: 'https://test.substack.com' })
      await expect(unauthClient.publishDraft(1)).rejects.toThrow(
        'Authentication required: provide a token in SubstackConfig to use publishDraft()'
      )
    })

    it('should throw when no publicationUrl is configured', async () => {
      const noPubClient = new SubstackClient({ token: 'test-api-key' })
      await expect(noPubClient.publishDraft(1)).rejects.toThrow(
        'Publication required: provide a publicationUrl in SubstackConfig to use publishDraft()'
      )
    })
  })

  describe('deleteDraft', () => {
    it('should delegate to postManagementService', async () => {
      const mockResponse = { success: true }
      mockPostManagementService.deleteDraft.mockResolvedValue(mockResponse)

      const result = await client.deleteDraft(777)
      expect(result).toEqual(mockResponse)
      expect(mockPostManagementService.deleteDraft).toHaveBeenCalledWith(777)
    })

    it('should throw when no token is configured', async () => {
      const unauthClient = new SubstackClient({ publicationUrl: 'https://test.substack.com' })
      await expect(unauthClient.deleteDraft(1)).rejects.toThrow(
        'Authentication required: provide a token in SubstackConfig to use deleteDraft()'
      )
    })

    it('should throw when no publicationUrl is configured', async () => {
      const noPubClient = new SubstackClient({ token: 'test-api-key' })
      await expect(noPubClient.deleteDraft(1)).rejects.toThrow(
        'Publication required: provide a publicationUrl in SubstackConfig to use deleteDraft()'
      )
    })
  })
})
