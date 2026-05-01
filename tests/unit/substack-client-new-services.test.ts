import { SubstackClient } from '@substack-api/substack-client'
import { HttpClient } from '@substack-api/internal/http-client'
import type { PublisherSettingsDetail } from '@substack-api/internal/types'
import {
  PublicationDetailService,
  SubscriptionService,
  SettingsService,
  NoteService,
  CommentService,
  PublicationService,
  DashboardService,
  DiscoveryService,
  PostService,
  FollowingService,
  NotificationService
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
  let mockDashboardService: jest.Mocked<DashboardService>
  let discoveryService: jest.Mocked<DiscoveryService>
  let mockPostService: jest.Mocked<PostService>
  let mockFollowingService: jest.Mocked<FollowingService>
  let mockNotificationService: jest.Mocked<NotificationService>

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
    mockSettingsService.getPublicationUser = jest.fn()
    mockSettingsService.getSections = jest.fn()
    mockSettingsService.getSubscription = jest.fn()
    mockSettingsService.getBoostSettings = jest.fn()

    mockDashboardService = new DashboardService(mockHttpClient) as jest.Mocked<DashboardService>

    discoveryService = new DiscoveryService(mockHttpClient) as jest.Mocked<DiscoveryService>
    discoveryService.getFeed = jest.fn()

    mockNoteService = new NoteService(mockHttpClient) as jest.Mocked<NoteService>
    mockNoteService.getNotes = jest.fn()
    mockNoteService.getNoteStats = jest.fn()

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

    mockPostService = new PostService(mockHttpClient) as jest.Mocked<PostService>
    mockPostService.likePost = jest.fn()
    mockPostService.unlikePost = jest.fn()
    mockPostService.getReadingList = jest.fn()
    mockPostService.savePost = jest.fn()
    mockPostService.unsavePost = jest.fn()

    mockFollowingService = new FollowingService(
      mockHttpClient,
      mockHttpClient
    ) as jest.Mocked<FollowingService>
    mockFollowingService.followUser = jest.fn()
    mockFollowingService.unfollowUser = jest.fn()

    mockNotificationService = new NotificationService(
      mockHttpClient
    ) as jest.Mocked<NotificationService>
    mockNotificationService.getNotifications = jest.fn()
    mockNotificationService.markNotificationsSeen = jest.fn()

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
    anyClient.dashboardService = mockDashboardService
    anyClient.feedService = discoveryService
    anyClient.searchService = discoveryService
    anyClient.profileActivityService = discoveryService
    anyClient.categoryService = discoveryService
    anyClient.postService = mockPostService
    anyClient.followingService = mockFollowingService
    anyClient.notificationService = mockNotificationService
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
      const mockResponse = { id: 1, user_id: 10, publication_id: 42, type: 'premium' }
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
      mockSettingsService.getPublisherSettings.mockResolvedValue(
        mockResponse as PublisherSettingsDetail
      )

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

  describe('noteStats', () => {
    it('should delegate to noteService', async () => {
      const mockStats = { cards: [{ title: 'Impressions', value: 42 }] }
      mockNoteService.getNoteStats.mockResolvedValue(mockStats)
      const result = await client.noteStats('c-251155220')
      expect(mockNoteService.getNoteStats).toHaveBeenCalledWith('c-251155220')
      expect(result).toEqual(mockStats)
    })

    it('should throw when no auth', async () => {
      const noAuthClient = new SubstackClient({ publicationUrl: 'https://test.substack.com' })
      await expect(noAuthClient.noteStats('c-1')).rejects.toThrow('Authentication required')
    })

    it('should throw when no publicationUrl', async () => {
      const noPubClient = new SubstackClient({ token: 'test' })
      await expect(noPubClient.noteStats('c-1')).rejects.toThrow('Publication required')
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
      const mockResponse = { liveStreams: [], hasMore: false }
      mockPublicationService.getLiveStreams.mockResolvedValue(mockResponse)
      const result = await client.liveStreams()
      expect(mockPublicationService.getLiveStreams).toHaveBeenCalledWith(undefined)
      expect(result).toEqual(mockResponse)
    })

    it('should pass status option', async () => {
      mockPublicationService.getLiveStreams.mockResolvedValue({ liveStreams: [], hasMore: false })
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
      const mockResponse = { hosts: [] }
      mockPublicationService.getEligibleHosts.mockResolvedValue(mockResponse)
      const result = await client.eligibleHosts(42)
      expect(mockPublicationService.getEligibleHosts).toHaveBeenCalledWith(42)
      expect(result).toEqual(mockResponse)
    })

    it('should throw when no publicationUrl', async () => {
      const noPubClient = new SubstackClient({ token: 'test' })
      await expect(noPubClient.eligibleHosts(1)).rejects.toThrow('Publication required')
    })
  })

  describe('publicationUser', () => {
    it('should delegate to settingsService', async () => {
      mockSettingsService.getPublicationUser.mockResolvedValue({
        id: 1,
        user_id: 10,
        role: 'admin'
      })
      const result = await client.publicationUser()
      expect(mockSettingsService.getPublicationUser).toHaveBeenCalled()
      expect(result).toEqual({ id: 1, user_id: 10, role: 'admin' })
    })

    it('should throw when no auth', async () => {
      const noAuthClient = new SubstackClient({ publicationUrl: 'https://test.substack.com' })
      await expect(noAuthClient.publicationUser()).rejects.toThrow('Authentication required')
    })
  })

  describe('sections', () => {
    it('should delegate to settingsService', async () => {
      mockSettingsService.getSections.mockResolvedValue([])
      const result = await client.sections()
      expect(mockSettingsService.getSections).toHaveBeenCalled()
      expect(result).toEqual([])
    })

    it('should throw when no publicationUrl', async () => {
      const noPubClient = new SubstackClient({ token: 'test' })
      await expect(noPubClient.sections()).rejects.toThrow('Publication required')
    })
  })

  describe('subscriptionSettings', () => {
    it('should delegate to settingsService', async () => {
      mockSettingsService.getSubscription.mockResolvedValue({ id: 1 })
      const result = await client.subscriptionSettings()
      expect(mockSettingsService.getSubscription).toHaveBeenCalled()
      expect(result).toEqual({ id: 1 })
    })

    it('should throw when no auth', async () => {
      const noAuthClient = new SubstackClient({ publicationUrl: 'https://test.substack.com' })
      await expect(noAuthClient.subscriptionSettings()).rejects.toThrow('Authentication required')
    })
  })

  describe('boostSettings', () => {
    it('should delegate to settingsService', async () => {
      mockSettingsService.getBoostSettings.mockResolvedValue({ enabled: false })
      const result = await client.boostSettings()
      expect(mockSettingsService.getBoostSettings).toHaveBeenCalled()
      expect(result).toEqual({ enabled: false })
    })

    it('should throw when no auth', async () => {
      const noAuthClient = new SubstackClient({ publicationUrl: 'https://test.substack.com' })
      await expect(noAuthClient.boostSettings()).rejects.toThrow('Authentication required')
    })
  })

  describe('activityFeed', () => {
    it('should yield items from discoveryService', async () => {
      discoveryService.getFeed.mockResolvedValueOnce({
        items: [{ type: 'comment', entity_key: 'c-1' }],
        nextCursor: null
      })
      const results: unknown[] = []
      for await (const item of client.activityFeed()) {
        results.push(item)
      }
      expect(results).toHaveLength(1)
      expect(discoveryService.getFeed).toHaveBeenCalledWith({
        tabId: undefined,
        cursor: undefined
      })
    })

    it('should pass tabId to discoveryService', async () => {
      discoveryService.getFeed.mockResolvedValueOnce({
        items: [],
        nextCursor: null
      })
      const results: unknown[] = []
      for await (const item of client.activityFeed({ tabId: 'subscribed' })) {
        results.push(item)
      }
      expect(discoveryService.getFeed).toHaveBeenCalledWith(
        expect.objectContaining({ tabId: 'subscribed' })
      )
    })

    it('should call onTabs callback with tabs metadata', async () => {
      const mockTabs = [
        { id: 'for-you', name: 'For you', type: 'base' },
        { id: 'subscribed', name: 'Following', type: 'secondary' }
      ]
      discoveryService.getFeed.mockResolvedValueOnce({
        items: [{ type: 'comment', entity_key: 'c-1' }],
        nextCursor: null,
        tabs: mockTabs
      })
      const receivedTabs: unknown[] = []
      for await (const _item of client.activityFeed({
        onTabs: (tabs) => receivedTabs.push(...tabs)
      })) {
        // consume items
      }
      expect(receivedTabs).toEqual(mockTabs)
    })

    it('should paginate with cursor', async () => {
      discoveryService.getFeed
        .mockResolvedValueOnce({
          items: [{ type: 'comment', entity_key: 'c-1' }],
          nextCursor: 'page2'
        })
        .mockResolvedValueOnce({
          items: [{ type: 'post', entity_key: 'p-2' }],
          nextCursor: null
        })
      const results: unknown[] = []
      for await (const item of client.activityFeed()) {
        results.push(item)
      }
      expect(results).toHaveLength(2)
    })

    it('should throw when no auth', async () => {
      const noAuthClient = new SubstackClient({ publicationUrl: 'https://test.substack.com' })
      const gen = noAuthClient.activityFeed()
      await expect(gen.next()).rejects.toThrow('Authentication required')
    })
  })

  describe('likeNote', () => {
    it('should delegate to noteService', async () => {
      mockNoteService.likeNote.mockResolvedValue(undefined)
      await client.likeNote(123)
      expect(mockNoteService.likeNote).toHaveBeenCalledWith(123)
    })

    it('should throw when no auth', async () => {
      const noAuthClient = new SubstackClient({ publicationUrl: 'https://test.substack.com' })
      await expect(noAuthClient.likeNote(1)).rejects.toThrow('Authentication required')
    })
  })

  describe('unlikeNote', () => {
    it('should delegate to noteService', async () => {
      mockNoteService.unlikeNote.mockResolvedValue(undefined)
      await client.unlikeNote(456)
      expect(mockNoteService.unlikeNote).toHaveBeenCalledWith(456)
    })
  })

  describe('likePost', () => {
    it('should delegate to postService', async () => {
      mockPostService.likePost.mockResolvedValue(undefined)
      await client.likePost(123)
      expect(mockPostService.likePost).toHaveBeenCalledWith(123)
    })

    it('should throw when no auth', async () => {
      const noAuthClient = new SubstackClient({ publicationUrl: 'https://test.substack.com' })
      await expect(noAuthClient.likePost(1)).rejects.toThrow('Authentication required')
    })
  })

  describe('unlikePost', () => {
    it('should delegate to postService', async () => {
      mockPostService.unlikePost.mockResolvedValue(undefined)
      await client.unlikePost(456)
      expect(mockPostService.unlikePost).toHaveBeenCalledWith(456)
    })
  })

  describe('getReadingList', () => {
    it('should delegate to postService', async () => {
      mockPostService.getReadingList.mockResolvedValue([])
      const result = await client.getReadingList()
      expect(mockPostService.getReadingList).toHaveBeenCalled()
      expect(result).toEqual([])
    })
  })

  describe('savePost', () => {
    it('should delegate to postService', async () => {
      mockPostService.savePost.mockResolvedValue(undefined)
      await client.savePost(123)
      expect(mockPostService.savePost).toHaveBeenCalledWith(123)
    })
  })

  describe('unsavePost', () => {
    it('should delegate to postService', async () => {
      mockPostService.unsavePost.mockResolvedValue(undefined)
      await client.unsavePost(456)
      expect(mockPostService.unsavePost).toHaveBeenCalledWith(456)
    })
  })

  describe('followUser', () => {
    it('should delegate to followingService', async () => {
      mockFollowingService.followUser.mockResolvedValue(undefined)
      await client.followUser(12345)
      expect(mockFollowingService.followUser).toHaveBeenCalledWith(12345)
    })

    it('should throw when no auth', async () => {
      const noAuthClient = new SubstackClient({ publicationUrl: 'https://test.substack.com' })
      await expect(noAuthClient.followUser(1)).rejects.toThrow('Authentication required')
    })
  })

  describe('unfollowUser', () => {
    it('should delegate to followingService', async () => {
      mockFollowingService.unfollowUser.mockResolvedValue(undefined)
      await client.unfollowUser(67890)
      expect(mockFollowingService.unfollowUser).toHaveBeenCalledWith(67890)
    })
  })

  describe('getNotifications', () => {
    it('should delegate to notificationService', async () => {
      mockNotificationService.getNotifications.mockResolvedValue({
        notifications: [],
        nextCursor: null
      })
      const result = await client.getNotifications()
      expect(mockNotificationService.getNotifications).toHaveBeenCalled()
      expect(result.notifications).toEqual([])
    })

    it('should throw when no auth', async () => {
      const noAuthClient = new SubstackClient({ publicationUrl: 'https://test.substack.com' })
      await expect(noAuthClient.getNotifications()).rejects.toThrow('Authentication required')
    })
  })

  describe('markNotificationsSeen', () => {
    it('should delegate to notificationService', async () => {
      mockNotificationService.markNotificationsSeen.mockResolvedValue(undefined)
      await client.markNotificationsSeen()
      expect(mockNotificationService.markNotificationsSeen).toHaveBeenCalled()
    })
  })
})
