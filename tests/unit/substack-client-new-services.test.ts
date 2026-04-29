import { SubstackClient } from '@substack-api/substack-client'
import { HttpClient } from '@substack-api/internal/http-client'
import {
  PublicationDetailService,
  SubscriptionService,
  SettingsService,
  NoteService,
  CommentService,
  PublicationService
} from '@substack-api/internal/services'

jest.mock('@substack-api/internal/http-client')
jest.mock('@substack-api/internal/services')

describe('SubstackClient new service methods', () => {
  let client: SubstackClient
  let mockPublicationDetailService: jest.Mocked<PublicationDetailService>
  let mockSubscriptionService: jest.Mocked<SubscriptionService>
  let mockSettingsService: jest.Mocked<SettingsService>
  let mockNoteService: jest.Mocked<NoteService>
  let mockCommentService: jest.Mocked<CommentService>
  let mockPublicationService: jest.Mocked<PublicationService>

  beforeEach(() => {
    jest.clearAllMocks()

    const mockHttpClient = new HttpClient('https://test.com', 'test') as jest.Mocked<HttpClient>
    mockHttpClient.get = jest.fn()
    mockHttpClient.post = jest.fn()
    mockHttpClient.put = jest.fn()
    mockHttpClient.delete = jest.fn()

    mockPublicationDetailService = new PublicationDetailService(
      mockHttpClient
    ) as jest.Mocked<PublicationDetailService>
    mockPublicationDetailService.getPublicationDetails = jest.fn()
    mockPublicationDetailService.getPostTags = jest.fn()

    mockSubscriptionService = new SubscriptionService(
      mockHttpClient,
      mockHttpClient
    ) as jest.Mocked<SubscriptionService>
    mockSubscriptionService.getCurrentSubscription = jest.fn()
    mockSubscriptionService.getAllSubscriptions = jest.fn()

    mockSettingsService = new SettingsService(mockHttpClient) as jest.Mocked<SettingsService>
    mockSettingsService.getPublisherSettings = jest.fn()

    mockNoteService = new NoteService(mockHttpClient) as jest.Mocked<NoteService>
    mockNoteService.getNotes = jest.fn()

    mockCommentService = new CommentService(
      mockHttpClient,
      mockHttpClient
    ) as jest.Mocked<CommentService>
    mockCommentService.createComment = jest.fn()
    mockCommentService.deleteComment = jest.fn()

    mockPublicationService = new PublicationService(
      mockHttpClient
    ) as jest.Mocked<PublicationService>
    mockPublicationService.getLiveStreams = jest.fn()
    mockPublicationService.getEligibleHosts = jest.fn()

    client = new SubstackClient({
      token: 'test-api-key',
      publicationUrl: 'https://test.substack.com'
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const anyClient = client as any
    anyClient.publicationDetailService = mockPublicationDetailService
    anyClient.subscriptionService = mockSubscriptionService
    anyClient.settingsService = mockSettingsService
    anyClient.noteService = mockNoteService
    anyClient.commentService = mockCommentService
    anyClient.publicationService = mockPublicationService
  })

  describe('publicationDetails', () => {
    it('should delegate to publicationDetailService', async () => {
      const mockResponse = { id: 42, name: 'Test Pub' }
      mockPublicationDetailService.getPublicationDetails.mockResolvedValue(mockResponse)

      const result = await client.publicationDetails()
      expect(result).toEqual(mockResponse)
      expect(mockPublicationDetailService.getPublicationDetails).toHaveBeenCalled()
    })

    it('should throw when no publicationUrl', async () => {
      const noPubClient = new SubstackClient({ token: 'test' })
      await expect(noPubClient.publicationDetails()).rejects.toThrow('Publication required')
    })
  })

  describe('publicationTags', () => {
    it('should delegate to publicationDetailService', async () => {
      const mockResponse = [{ id: 1, name: 'Tech' }]
      mockPublicationDetailService.getPostTags.mockResolvedValue(mockResponse)

      const result = await client.publicationTags()
      expect(result).toEqual(mockResponse)
      expect(mockPublicationDetailService.getPostTags).toHaveBeenCalled()
    })

    it('should throw when no publicationUrl', async () => {
      const noPubClient = new SubstackClient({ token: 'test' })
      await expect(noPubClient.publicationTags()).rejects.toThrow('Publication required')
    })
  })

  describe('subscription', () => {
    it('should delegate to subscriptionService', async () => {
      const mockResponse = { id: 1, type: 'premium' }
      mockSubscriptionService.getCurrentSubscription.mockResolvedValue(mockResponse)

      const result = await client.subscription()
      expect(result).toEqual(mockResponse)
      expect(mockSubscriptionService.getCurrentSubscription).toHaveBeenCalled()
    })

    it('should throw when no auth', async () => {
      const noAuthClient = new SubstackClient({ publicationUrl: 'https://test.substack.com' })
      await expect(noAuthClient.subscription()).rejects.toThrow('Authentication required')
    })

    it('should throw when no publicationUrl', async () => {
      const noPubClient = new SubstackClient({ token: 'test' })
      await expect(noPubClient.subscription()).rejects.toThrow('Publication required')
    })
  })

  describe('subscriptions', () => {
    it('should delegate to subscriptionService with defaults', async () => {
      mockSubscriptionService.getAllSubscriptions.mockResolvedValue({ subscriptions: [] })

      await client.subscriptions()
      expect(mockSubscriptionService.getAllSubscriptions).toHaveBeenCalledWith(undefined)
    })

    it('should pass options to subscriptionService', async () => {
      mockSubscriptionService.getAllSubscriptions.mockResolvedValue({ subscriptions: [] })
      await client.subscriptions({ offset: 10, limit: 50 })
      expect(mockSubscriptionService.getAllSubscriptions).toHaveBeenCalledWith({
        offset: 10,
        limit: 50
      })
    })

    it('should throw when no auth', async () => {
      const noAuthClient = new SubstackClient({ publicationUrl: 'https://test.substack.com' })
      await expect(noAuthClient.subscriptions()).rejects.toThrow('Authentication required')
    })
  })

  describe('publisherSettings', () => {
    it('should delegate to settingsService', async () => {
      const mockResponse = { publication_name: 'Test' }
      mockSettingsService.getPublisherSettings.mockResolvedValue(mockResponse)

      const result = await client.publisherSettings()
      expect(result).toEqual(mockResponse)
      expect(mockSettingsService.getPublisherSettings).toHaveBeenCalled()
    })

    it('should throw when no auth', async () => {
      const noAuthClient = new SubstackClient({ publicationUrl: 'https://test.substack.com' })
      await expect(noAuthClient.publisherSettings()).rejects.toThrow('Authentication required')
    })

    it('should throw when no publicationUrl', async () => {
      const noPubClient = new SubstackClient({ token: 'test' })
      await expect(noPubClient.publisherSettings()).rejects.toThrow('Publication required')
    })
  })

  describe('notesFeed', () => {
    it('should yield notes from noteService', async () => {
      mockNoteService.getNotes.mockResolvedValueOnce({
        items: [{ id: 1 }],
        nextCursor: null
      })
      const results: unknown[] = []
      for await (const note of client.notesFeed()) {
        results.push(note)
      }
      expect(results).toHaveLength(1)
      expect(mockNoteService.getNotes).toHaveBeenCalledWith({ cursor: undefined })
    })

    it('should paginate notes with cursor', async () => {
      mockNoteService.getNotes.mockResolvedValueOnce({
        items: [{ id: 1 }],
        nextCursor: 'page2'
      })
      mockNoteService.getNotes.mockResolvedValueOnce({
        items: [{ id: 2 }],
        nextCursor: null
      })
      const results: unknown[] = []
      for await (const note of client.notesFeed()) {
        results.push(note)
      }
      expect(results).toHaveLength(2)
    })

    it('should respect limit option', async () => {
      mockNoteService.getNotes.mockResolvedValue({
        items: [{ id: 1 }, { id: 2 }],
        nextCursor: null
      })
      const results: unknown[] = []
      for await (const note of client.notesFeed({ limit: 1 })) {
        results.push(note)
      }
      expect(results).toHaveLength(1)
    })

    it('should throw when no auth', async () => {
      const noAuthClient = new SubstackClient({ publicationUrl: 'https://test.substack.com' })
      const gen = noAuthClient.notesFeed()
      await expect(gen.next()).rejects.toThrow('Authentication required')
    })
  })

  describe('createComment', () => {
    it('should delegate to commentService', async () => {
      mockCommentService.createComment.mockResolvedValue({ id: 1 })
      const result = await client.createComment(42, 'test comment')
      expect(mockCommentService.createComment).toHaveBeenCalledWith(42, 'test comment')
      expect(result).toEqual({ id: 1 })
    })

    it('should throw when no auth', async () => {
      const noAuthClient = new SubstackClient({ publicationUrl: 'https://test.substack.com' })
      await expect(noAuthClient.createComment(1, 'x')).rejects.toThrow('Authentication required')
    })

    it('should throw when no publicationUrl', async () => {
      const noPubClient = new SubstackClient({ token: 'test' })
      await expect(noPubClient.createComment(1, 'x')).rejects.toThrow('Publication required')
    })
  })

  describe('deleteComment', () => {
    it('should delegate to commentService', async () => {
      mockCommentService.deleteComment.mockResolvedValue({ deleted: true })
      const result = await client.deleteComment(99)
      expect(mockCommentService.deleteComment).toHaveBeenCalledWith(99)
      expect(result).toEqual({ deleted: true })
    })

    it('should throw when no auth', async () => {
      const noAuthClient = new SubstackClient({ publicationUrl: 'https://test.substack.com' })
      await expect(noAuthClient.deleteComment(1)).rejects.toThrow('Authentication required')
    })

    it('should throw when no publicationUrl', async () => {
      const noPubClient = new SubstackClient({ token: 'test' })
      await expect(noPubClient.deleteComment(1)).rejects.toThrow('Publication required')
    })
  })

  describe('liveStreams', () => {
    it('should delegate to publicationService', async () => {
      mockPublicationService.getLiveStreams.mockResolvedValue([])
      const result = await client.liveStreams()
      expect(mockPublicationService.getLiveStreams).toHaveBeenCalledWith(undefined)
      expect(result).toEqual([])
    })

    it('should pass status option', async () => {
      mockPublicationService.getLiveStreams.mockResolvedValue([])
      await client.liveStreams('active')
      expect(mockPublicationService.getLiveStreams).toHaveBeenCalledWith('active')
    })

    it('should throw when no publicationUrl', async () => {
      const noPubClient = new SubstackClient({ token: 'test' })
      await expect(noPubClient.liveStreams()).rejects.toThrow('Publication required')
    })
  })

  describe('eligibleHosts', () => {
    it('should delegate to publicationService', async () => {
      mockPublicationService.getEligibleHosts.mockResolvedValue([])
      const result = await client.eligibleHosts(42)
      expect(mockPublicationService.getEligibleHosts).toHaveBeenCalledWith(42)
      expect(result).toEqual([])
    })

    it('should throw when no publicationUrl', async () => {
      const noPubClient = new SubstackClient({ token: 'test' })
      await expect(noPubClient.eligibleHosts(1)).rejects.toThrow('Publication required')
    })
  })
})
