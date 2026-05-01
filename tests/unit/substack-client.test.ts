import { SubstackClient } from '@substack-api/substack-client'
import { Profile, FullPost, Note, Comment, OwnProfile } from '@substack-api/domain'
import { HttpClient } from '@substack-api/internal/http-client'
import {
  PostService,
  NoteService,
  ProfileService,
  CommentService,
  FollowingService,
  ConnectivityService,
  SubscriberStatsService,
  GrowthStatsService,
  PublicationStatsService,
  DashboardService,
  RecommendationService,
  ChatService
} from '@substack-api/internal/services'
import type { SubstackFullProfile } from '@substack-api/internal'

// Mock the http client and services
jest.mock('@substack-api/internal/http-client')
jest.mock('@substack-api/internal/services')

// Mock the global fetch function
global.fetch = jest.fn()

describe('SubstackClient', () => {
  let client: SubstackClient
  let mockPublicationClient: jest.Mocked<HttpClient>
  let mockSubstackClient: jest.Mocked<HttpClient>
  let mockPostService: jest.Mocked<PostService>
  let mockNoteService: jest.Mocked<NoteService>
  let mockProfileService: jest.Mocked<ProfileService>
  let mockCommentService: jest.Mocked<CommentService>
  let mockFollowingService: jest.Mocked<FollowingService>
  let mockConnectivityService: jest.Mocked<ConnectivityService>
  let mockSubscriberStatsService: jest.Mocked<SubscriberStatsService>
  let mockGrowthStatsService: jest.Mocked<GrowthStatsService>
  let mockPublicationStatsService: jest.Mocked<PublicationStatsService>
  let mockDashboardService: jest.Mocked<DashboardService>
  let mockRecommendationService: jest.Mocked<RecommendationService>
  let mockChatService: jest.Mocked<ChatService>

  beforeEach(() => {
    jest.clearAllMocks()
    mockPublicationClient = new HttpClient('https://test.com', 'test') as jest.Mocked<HttpClient>
    mockPublicationClient.get = jest.fn()
    mockPublicationClient.post = jest.fn()

    mockSubstackClient = new HttpClient('https://substack.com', 'test') as jest.Mocked<HttpClient>
    mockSubstackClient.get = jest.fn()
    mockSubstackClient.post = jest.fn()

    mockPostService = new PostService(mockSubstackClient) as jest.Mocked<PostService>
    mockPostService.getPostById = jest.fn()

    mockNoteService = new NoteService(mockPublicationClient) as jest.Mocked<NoteService>
    mockNoteService.getNoteById = jest.fn()

    mockProfileService = new ProfileService(mockSubstackClient) as jest.Mocked<ProfileService>
    mockProfileService.getOwnProfile = jest.fn()
    mockProfileService.getProfileById = jest.fn()
    mockProfileService.getProfileBySlug = jest.fn()

    mockCommentService = new CommentService(
      mockPublicationClient,
      mockSubstackClient
    ) as jest.Mocked<CommentService>
    mockCommentService.getCommentById = jest.fn()
    mockCommentService.getCommentsForPost = jest.fn()

    mockFollowingService = new FollowingService(
      mockPublicationClient,
      mockSubstackClient
    ) as jest.Mocked<FollowingService>
    mockFollowingService.getFollowing = jest.fn()

    mockConnectivityService = new ConnectivityService(
      mockSubstackClient,
      mockFollowingService
    ) as jest.Mocked<ConnectivityService>
    mockConnectivityService.isConnected = jest.fn()

    mockSubscriberStatsService = new SubscriberStatsService(
      mockPublicationClient,
      mockSubstackClient
    ) as jest.Mocked<SubscriberStatsService>
    mockSubscriberStatsService.getSubscriberStats = jest.fn()
    mockSubscriberStatsService.getSubscriptionsPage = jest.fn()

    mockGrowthStatsService = new GrowthStatsService(
      mockPublicationClient
    ) as jest.Mocked<GrowthStatsService>
    mockGrowthStatsService.getGrowthSources = jest.fn()
    mockGrowthStatsService.getGrowthTimeseries = jest.fn()

    mockPublicationStatsService = new PublicationStatsService(
      mockPublicationClient
    ) as jest.Mocked<PublicationStatsService>
    mockPublicationStatsService.getNetworkAttribution = jest.fn()
    mockPublicationStatsService.getFollowerTimeseries = jest.fn()
    mockPublicationStatsService.getTraffic30dViews = jest.fn()
    mockPublicationStatsService.getVisitorSources = jest.fn()
    mockPublicationStatsService.getTrafficTimeseries = jest.fn()
    mockPublicationStatsService.getEmail30dOpenRate = jest.fn()
    mockPublicationStatsService.getPledgeSummary = jest.fn()
    mockPublicationStatsService.getPledges = jest.fn()

    mockDashboardService = new DashboardService(
      mockPublicationClient
    ) as jest.Mocked<DashboardService>
    mockDashboardService.getDashboardSummary = jest.fn()

    mockRecommendationService = new RecommendationService(
      mockPublicationClient
    ) as jest.Mocked<RecommendationService>
    mockRecommendationService.getOutgoingRecommendations = jest.fn()
    mockRecommendationService.getIncomingRecommendationStats = jest.fn()

    mockChatService = new ChatService(mockSubstackClient) as jest.Mocked<ChatService>
    mockChatService.getUnreadCount = jest.fn()
    mockChatService.getInbox = jest.fn()
    mockChatService.markInboxSeen = jest.fn()
    mockChatService.getDm = jest.fn()
    mockChatService.sendMessage = jest.fn()
    mockChatService.markDmSeen = jest.fn()
    mockChatService.getInvites = jest.fn()
    mockChatService.markInvitesSeen = jest.fn()
    mockChatService.getReactions = jest.fn()
    mockChatService.getRealtimeToken = jest.fn()
    mockChatService.inboxThreads = jest.fn()
    mockChatService.dmMessages = jest.fn()

    client = new SubstackClient({
      token: 'test-api-key',
      publicationUrl: 'test.substack.com'
    })
    // Replace the internal http clients and services with our mocks
    ;(client as unknown as { publicationClient: HttpClient }).publicationClient =
      mockPublicationClient
    ;(client as unknown as { substackClient: HttpClient }).substackClient = mockSubstackClient
    ;(client as unknown as { postService: PostService }).postService = mockPostService
    ;(client as unknown as { noteService: NoteService }).noteService = mockNoteService
    ;(client as unknown as { profileService: ProfileService }).profileService = mockProfileService
    ;(client as unknown as { commentService: CommentService }).commentService = mockCommentService
    ;(client as unknown as { followingService: FollowingService }).followingService =
      mockFollowingService
    ;(client as unknown as { connectivityService: ConnectivityService }).connectivityService =
      mockConnectivityService
    ;(
      client as unknown as { subscriberStatsService: SubscriberStatsService }
    ).subscriberStatsService = mockSubscriberStatsService
    ;(client as unknown as { growthStatsService: GrowthStatsService }).growthStatsService =
      mockGrowthStatsService
    ;(
      client as unknown as { publicationStatsService: PublicationStatsService }
    ).publicationStatsService = mockPublicationStatsService
    ;(client as unknown as { dashboardService: DashboardService }).dashboardService =
      mockDashboardService
    ;(client as unknown as { recommendationService: RecommendationService }).recommendationService =
      mockRecommendationService
    ;(client as unknown as { chatService: ChatService }).chatService = mockChatService
  })

  describe('testConnectivity', () => {
    it('When requesting true when API is accessible', async () => {
      mockConnectivityService.isConnected.mockResolvedValue(true)
      const result = await client.testConnectivity()
      expect(result).toBe(true)
      expect(mockConnectivityService.isConnected).toHaveBeenCalled()
    })

    it('When requesting false when API is not accessible', async () => {
      mockConnectivityService.isConnected.mockResolvedValue(false)
      const result = await client.testConnectivity()
      expect(result).toBe(false)
      expect(mockConnectivityService.isConnected).toHaveBeenCalled()
    })
  })

  describe('ownProfile', () => {
    it('should get own profile when authenticated', async () => {
      const mockProfile = {
        id: 123,
        name: 'Test User',
        handle: 'testuser',
        photo_url: 'https://example.com/photo.jpg'
      }
      mockProfileService.getOwnProfile.mockResolvedValueOnce(mockProfile)

      const ownProfile = await client.ownProfile()
      expect(ownProfile).toBeInstanceOf(OwnProfile)
      expect(ownProfile.id).toBe(123)
      expect(ownProfile.name).toBe('Test User')
      expect(mockProfileService.getOwnProfile).toHaveBeenCalled()
    })

    it('When when authentication fails', async () => {
      mockProfileService.getOwnProfile.mockRejectedValue(new Error('Unauthorized'))

      await expect(client.ownProfile()).rejects.toThrow('Failed to get own profile: Unauthorized')
    })
  })

  describe('profileForId', () => {
    it('should get profile by numeric ID', async () => {
      const mockProfile: Partial<SubstackFullProfile> = {
        id: 123,
        handle: 'testuser',
        name: 'Test User',
        photo_url: 'https://example.com/photo.jpg'
      }
      mockProfileService.getProfileById.mockResolvedValue(
        mockProfile as unknown as SubstackFullProfile
      )

      const profile = await client.profileForId(123)
      expect(profile).toBeInstanceOf(Profile)
      expect(mockProfileService.getProfileById).toHaveBeenCalledWith(123)
    })

    it('When API error for profileForId', async () => {
      mockProfileService.getProfileById.mockRejectedValue(new Error('Not found'))

      await expect(client.profileForId(999)).rejects.toThrow(
        'Profile with ID 999 not found: Not found'
      )
    })

    it('should accept large numeric IDs', async () => {
      const mockProfile: Partial<SubstackFullProfile> = {
        id: 9876543210,
        handle: 'testuser',
        name: 'Test User',
        photo_url: 'https://example.com/photo.jpg'
      }
      mockProfileService.getProfileById.mockResolvedValue(
        mockProfile as unknown as SubstackFullProfile
      )

      const profile = await client.profileForId(9876543210)
      expect(profile).toBeInstanceOf(Profile)
      expect(mockProfileService.getProfileById).toHaveBeenCalledWith(9876543210)
    })
  })

  describe('profileForSlug', () => {
    it('should get profile by slug', async () => {
      const mockProfile: Partial<SubstackFullProfile> = {
        id: 123,
        handle: 'testuser',
        name: 'Test User',
        photo_url: 'https://example.com/photo.jpg'
      }
      mockProfileService.getProfileBySlug.mockResolvedValue(
        mockProfile as unknown as SubstackFullProfile
      )

      const profile = await client.profileForSlug('testuser')
      expect(profile).toBeInstanceOf(Profile)
      expect(mockProfileService.getProfileBySlug).toHaveBeenCalledWith('testuser')
    })

    it('When empty slug', async () => {
      await expect(client.profileForSlug('')).rejects.toThrow('Profile slug cannot be empty')
      await expect(client.profileForSlug('   ')).rejects.toThrow('Profile slug cannot be empty')
    })

    it('When API error for profileForSlug', async () => {
      mockProfileService.getProfileBySlug.mockRejectedValue(new Error('Not found'))

      await expect(client.profileForSlug('nonexistent')).rejects.toThrow(
        "Profile with slug 'nonexistent' not found: Not found"
      )
    })
  })

  describe('postForId', () => {
    it('should get post by ID', async () => {
      const mockPost = {
        id: 456,
        title: 'Test Post',
        slug: 'test-slug',
        post_date: '2023-01-01T00:00:00Z',
        canonical_url: 'https://example.com/test-post',
        body_html: '<p>Test post body content</p>'
      }

      // Mock the PostService's getPostById method
      mockPostService.getPostById.mockResolvedValueOnce(mockPost)

      const post = await client.postForId(456)
      expect(post).toBeInstanceOf(FullPost)

      // Verify that PostService was called with the correct ID
      expect(mockPostService.getPostById).toHaveBeenCalledWith(456)
    })

    it('When API error for postForId', async () => {
      // Mock PostService to throw an HTTP error
      mockPostService.getPostById.mockRejectedValueOnce(new Error('HTTP 404: Not found'))

      await expect(client.postForId(999999999)).rejects.toThrow(
        'Post with ID 999999999 not found: HTTP 404: Not found'
      )
    })
  })

  describe('noteForId', () => {
    it('should get note by ID', async () => {
      const mockNoteData = {
        entity_key: '789',
        type: 'note',
        context: {
          type: 'feed',
          timestamp: '2023-01-01T00:00:00Z',
          users: [
            {
              id: 123,
              name: 'Test User',
              handle: '',
              photo_url: '',
              bio: ''
            }
          ],
          isFresh: false,
          page: null,
          page_rank: 1
        },
        comment: {
          id: 789,
          body: 'Test note',
          type: 'feed',
          date: '2023-01-01T00:00:00Z',
          user_id: 123,
          post_id: null,
          name: 'Test User',
          handle: '',
          photo_url: '',
          ancestor_path: '',
          reply_minimum_role: 'everyone',
          reaction_count: 0,
          reactions: {},
          restacks: 0,
          restacked: false,
          children_count: 0,
          attachments: []
        },
        parentComments: [],
        canReply: true,
        isMuted: false,
        trackingParameters: {
          item_primary_entity_key: '789',
          item_entity_key: '789',
          item_type: 'note',
          item_content_user_id: 123,
          item_context_type: 'feed',
          item_context_type_bucket: 'note',
          item_context_timestamp: '2023-01-01T00:00:00Z',
          item_context_user_id: 123,
          item_context_user_ids: [123],
          item_can_reply: true,
          item_is_fresh: false,
          item_last_impression_at: null,
          item_page: null,
          item_page_rank: 1,
          impression_id: 'generated',
          followed_user_count: 0,
          subscribed_publication_count: 0,
          is_following: false,
          is_explicitly_subscribed: false
        }
      }
      mockNoteService.getNoteById.mockResolvedValue(mockNoteData)

      const note = await client.noteForId(789)
      expect(note).toBeInstanceOf(Note)
      expect(mockNoteService.getNoteById).toHaveBeenCalledWith(789)

      // Verify Note properties are correctly populated
      expect(note.id).toBe('789')
      expect(note.body).toBe('Test note')
      expect(note.author.id).toBe(123)
      expect(note.author.name).toBe('Test User')
    })

    it('When API error for noteForId', async () => {
      mockNoteService.getNoteById.mockRejectedValue(new Error('Not found'))

      await expect(client.noteForId(999)).rejects.toThrow('Note with ID 999 not found')
    })
  })

  describe('commentForId', () => {
    it('should get comment by ID', async () => {
      const mockCommentData = {
        id: 999,
        body: 'Test comment',
        created_at: '2023-01-01T00:00:00Z',
        parent_post_id: 456,
        author_id: 123,
        author_name: 'Test User'
      }
      mockCommentService.getCommentById.mockResolvedValue(mockCommentData)

      const comment = await client.commentForId(999)
      expect(comment).toBeInstanceOf(Comment)
      expect(mockCommentService.getCommentById).toHaveBeenCalledWith(999)
    })
  })

  describe('subscriberStats', () => {
    it('should fetch subscriber stats', async () => {
      mockSubscriberStatsService.getSubscriberStats.mockResolvedValue({
        subscribers: [{ total_count: 100 }]
      } as unknown as Awaited<ReturnType<typeof mockSubscriberStatsService.getSubscriberStats>>)
      const result = await client.subscriberStats()
      expect(mockSubscriberStatsService.getSubscriberStats).toHaveBeenCalled()
      expect(result.subscribers).toHaveLength(1)
    })
  })

  describe('subscriptionsPage', () => {
    it('should fetch subscriptions page', async () => {
      mockSubscriberStatsService.getSubscriptionsPage.mockResolvedValue({
        subscriptions: [],
        cursor: null
      } as unknown as Awaited<ReturnType<typeof mockSubscriberStatsService.getSubscriptionsPage>>)
      await client.subscriptionsPage()
      expect(mockSubscriberStatsService.getSubscriptionsPage).toHaveBeenCalledWith(undefined)
    })
  })

  describe('growthSources', () => {
    it('should fetch growth sources', async () => {
      mockGrowthStatsService.getGrowthSources.mockResolvedValue(
        {} as unknown as Awaited<ReturnType<typeof mockGrowthStatsService.getGrowthSources>>
      )
      const result = await client.growthSources({ fromDate: '2026-01-01', toDate: '2026-03-01' })
      expect(mockGrowthStatsService.getGrowthSources).toHaveBeenCalledWith({
        fromDate: '2026-01-01',
        toDate: '2026-03-01'
      })
      expect(result).toBeDefined()
    })
  })

  describe('growthTimeseries', () => {
    it('should fetch growth timeseries', async () => {
      mockGrowthStatsService.getGrowthTimeseries.mockResolvedValue(
        {} as unknown as Awaited<ReturnType<typeof mockGrowthStatsService.getGrowthTimeseries>>
      )
      const result = await client.growthTimeseries({
        sources: ['s1'],
        orderBy: 'users',
        orderDirection: 'desc'
      })
      expect(mockGrowthStatsService.getGrowthTimeseries).toHaveBeenCalled()
      expect(result).toBeDefined()
    })
  })

  describe('networkAttribution', () => {
    it('should fetch network attribution', async () => {
      mockPublicationStatsService.getNetworkAttribution.mockResolvedValue(
        {} as unknown as Awaited<
          ReturnType<typeof mockPublicationStatsService.getNetworkAttribution>
        >
      )
      await client.networkAttribution()
      expect(mockPublicationStatsService.getNetworkAttribution).toHaveBeenCalledWith(undefined)
    })
  })

  describe('followerTimeseries', () => {
    it('should fetch follower timeseries', async () => {
      const mockResult: [string, number][] = [['2026-01-01', 100]]
      mockPublicationStatsService.getFollowerTimeseries.mockResolvedValue(mockResult)
      const result = await client.followerTimeseries({ from: '2026-01-01' })
      expect(mockPublicationStatsService.getFollowerTimeseries).toHaveBeenCalledWith({
        from: '2026-01-01'
      })
      expect(result).toBe(mockResult)
    })
  })

  describe('traffic30dViews', () => {
    it('should fetch 30-day traffic views', async () => {
      mockPublicationStatsService.getTraffic30dViews.mockResolvedValue({
        views30d: 5000,
        viewsDelta30d: 200,
        uniqueViews30d: 1000,
        uniqueViewsDelta30d: 50
      })
      const result = await client.traffic30dViews()
      expect(mockPublicationStatsService.getTraffic30dViews).toHaveBeenCalled()
      expect(result.views30d).toBe(5000)
    })
  })

  describe('visitorSources', () => {
    it('should fetch visitor sources', async () => {
      mockPublicationStatsService.getVisitorSources.mockResolvedValue(
        {} as unknown as Awaited<ReturnType<typeof mockPublicationStatsService.getVisitorSources>>
      )
      await client.visitorSources({ fromDate: '2026-01-01', toDate: '2026-03-01' })
      expect(mockPublicationStatsService.getVisitorSources).toHaveBeenCalledWith({
        fromDate: '2026-01-01',
        toDate: '2026-03-01'
      })
    })
  })

  describe('trafficTimeseries', () => {
    it('should fetch traffic timeseries', async () => {
      const mockResult: [string, number][] = [['2026-01-15', 500]]
      mockPublicationStatsService.getTrafficTimeseries.mockResolvedValue(mockResult)
      const result = await client.trafficTimeseries({ from: '2026-01-01', to: '2026-03-01' })
      expect(mockPublicationStatsService.getTrafficTimeseries).toHaveBeenCalledWith({
        from: '2026-01-01',
        to: '2026-03-01'
      })
      expect(result).toBe(mockResult)
    })
  })

  describe('email30dOpenRate', () => {
    it('should fetch email open rate', async () => {
      mockPublicationStatsService.getEmail30dOpenRate.mockResolvedValue({
        openRate: 45.2,
        openRateDiff: 1.5
      })
      const result = await client.email30dOpenRate()
      expect(mockPublicationStatsService.getEmail30dOpenRate).toHaveBeenCalled()
      expect(result.openRate).toBe(45.2)
    })
  })

  describe('pledgeSummary', () => {
    it('should fetch pledge summary', async () => {
      mockPublicationStatsService.getPledgeSummary.mockResolvedValue({
        totalPledges: 1000,
        totalPledgeAmount: 50000,
        currency: 'USD'
      })
      const result = await client.pledgeSummary()
      expect(mockPublicationStatsService.getPledgeSummary).toHaveBeenCalled()
      expect(result.totalPledges).toBe(1000)
    })
  })

  describe('pledges', () => {
    it('should fetch pledges', async () => {
      mockPublicationStatsService.getPledges.mockResolvedValue(
        {} as unknown as Awaited<ReturnType<typeof mockPublicationStatsService.getPledges>>
      )
      await client.pledges()
      expect(mockPublicationStatsService.getPledges).toHaveBeenCalledWith(undefined)
    })
  })

  describe('dashboardSummary', () => {
    it('should fetch dashboard summary', async () => {
      mockDashboardService.getDashboardSummary.mockResolvedValue(
        {} as unknown as Awaited<ReturnType<typeof mockDashboardService.getDashboardSummary>>
      )
      await client.dashboardSummary()
      expect(mockDashboardService.getDashboardSummary).toHaveBeenCalledWith(undefined)
    })
  })

  describe('outgoingRecommendations', () => {
    it('should fetch outgoing recommendations', async () => {
      mockRecommendationService.getOutgoingRecommendations.mockResolvedValue([])
      const result = await client.outgoingRecommendations(42)
      expect(mockRecommendationService.getOutgoingRecommendations).toHaveBeenCalledWith(42)
      expect(result).toEqual([])
    })
  })

  describe('incomingRecommendationStats', () => {
    it('should fetch incoming recommendation stats', async () => {
      mockRecommendationService.getIncomingRecommendationStats.mockResolvedValue([])
      const result = await client.incomingRecommendationStats()
      expect(mockRecommendationService.getIncomingRecommendationStats).toHaveBeenCalledWith(
        undefined
      )
      expect(result).toEqual([])
    })
  })

  describe('chat methods', () => {
    it('chatUnreadCount should call service', async () => {
      mockChatService.getUnreadCount.mockResolvedValue({
        unreadCount: 3,
        pendingInviteCount: 0,
        pendingInviteUnreadCount: 0,
        newPendingInviteUnreadCount: 0,
        pubChatUnreadCount: 0
      })
      const result = await client.chatUnreadCount()
      expect(mockChatService.getUnreadCount).toHaveBeenCalled()
      expect(result.unreadCount).toBe(3)
    })

    it('chatInbox should call service', async () => {
      const mockInbox: unknown = {
        threads: [{ id: 't1', unread_count: false, last_message_seen_by_me: false }]
      }
      mockChatService.getInbox.mockResolvedValue(
        mockInbox as Awaited<ReturnType<typeof mockChatService.getInbox>>
      )
      await client.chatInbox()
      expect(mockChatService.getInbox).toHaveBeenCalledWith(undefined)
    })

    it('chatMarkInboxSeen should call service', async () => {
      mockChatService.markInboxSeen.mockResolvedValue({ ok: true })
      const result = await client.chatMarkInboxSeen()
      expect(mockChatService.markInboxSeen).toHaveBeenCalled()
      expect(result.ok).toBe(true)
    })

    it('chatDm should call service', async () => {
      const mockDm: unknown = { messages: [], more: false }
      mockChatService.getDm.mockResolvedValue(
        mockDm as Awaited<ReturnType<typeof mockChatService.getDm>>
      )
      await client.chatDm('uuid-123')
      expect(mockChatService.getDm).toHaveBeenCalledWith('uuid-123', undefined)
    })

    it('chatSendMessage should call service', async () => {
      const mockSend: unknown = { thread: { id: 't1' } }
      mockChatService.sendMessage.mockResolvedValue(
        mockSend as Awaited<ReturnType<typeof mockChatService.sendMessage>>
      )
      await client.chatSendMessage('uuid-123', 'hello')
      expect(mockChatService.sendMessage).toHaveBeenCalledWith('uuid-123', 'hello', undefined)
    })

    it('chatMarkDmSeen should call service', async () => {
      mockChatService.markDmSeen.mockResolvedValue({ ok: true })
      await client.chatMarkDmSeen('uuid-123')
      expect(mockChatService.markDmSeen).toHaveBeenCalledWith('uuid-123')
    })

    it('chatInvites should call service', async () => {
      const mockInvites: unknown = { threads: [] }
      mockChatService.getInvites.mockResolvedValue(
        mockInvites as Awaited<ReturnType<typeof mockChatService.getInvites>>
      )
      await client.chatInvites()
      expect(mockChatService.getInvites).toHaveBeenCalled()
    })

    it('chatMarkInvitesSeen should call service', async () => {
      mockChatService.markInvitesSeen.mockResolvedValue({ ok: true })
      await client.chatMarkInvitesSeen()
      expect(mockChatService.markInvitesSeen).toHaveBeenCalled()
    })

    it('chatReactions should call service', async () => {
      mockChatService.getReactions.mockResolvedValue({
        suggestedReactionTypes: [],
        categories: [],
        reactionTypes: {}
      })
      await client.chatReactions()
      expect(mockChatService.getReactions).toHaveBeenCalled()
    })

    it('chatRealtimeToken should call service', async () => {
      mockChatService.getRealtimeToken.mockResolvedValue({
        token: 'rt-token',
        expiry: '',
        permissions: [],
        endpoint: ''
      })
      await client.chatRealtimeToken('channel-1')
      expect(mockChatService.getRealtimeToken).toHaveBeenCalledWith('channel-1')
    })

    it('chatInboxThreads should yield from service', async () => {
      const mockThreads = [{ id: 't1' }, { id: 't2' }]
      const gen = (async function* () {
        for (const t of mockThreads) yield t
      })()
      mockChatService.inboxThreads = jest.fn().mockReturnValue(gen)
      const results: unknown[] = []
      for await (const thread of client.chatInboxThreads({ tab: 'all' })) {
        results.push(thread)
      }
      expect(mockChatService.inboxThreads).toHaveBeenCalledWith({ tab: 'all' })
      expect(results).toHaveLength(2)
    })

    it('chatDmMessages should yield from service', async () => {
      const mockMessages = [{ id: 'm1' }]
      const gen = (async function* () {
        for (const m of mockMessages) yield m
      })()
      mockChatService.dmMessages = jest.fn().mockReturnValue(gen)
      const results: unknown[] = []
      for await (const msg of client.chatDmMessages('uuid-123')) {
        results.push(msg)
      }
      expect(mockChatService.dmMessages).toHaveBeenCalledWith('uuid-123', {})
      expect(results).toHaveLength(1)
    })
  })

  describe('auth guard for stat methods', () => {
    let anonymousClient: SubstackClient

    beforeEach(() => {
      anonymousClient = new SubstackClient({ publicationUrl: 'test.substack.com' })
      ;(anonymousClient as unknown as { publicationClient: HttpClient }).publicationClient =
        mockPublicationClient
      mockPublicationClient.get = jest.fn()
    })

    const methods: Array<{ name: string; call: (c: SubstackClient) => Promise<unknown> }> = [
      { name: 'subscriberStats', call: (c) => c.subscriberStats() },
      { name: 'growthSources', call: (c) => c.growthSources({ fromDate: 'a', toDate: 'b' }) },
      { name: 'networkAttribution', call: (c) => c.networkAttribution() },
      { name: 'traffic30dViews', call: (c) => c.traffic30dViews() },
      { name: 'email30dOpenRate', call: (c) => c.email30dOpenRate() },
      { name: 'pledgeSummary', call: (c) => c.pledgeSummary() },
      { name: 'dashboardSummary', call: (c) => c.dashboardSummary() },
      { name: 'chatUnreadCount', call: (c) => c.chatUnreadCount() }
    ]

    for (const { name, call } of methods) {
      it(`should throw when calling ${name} without auth`, async () => {
        await expect(call(anonymousClient)).rejects.toThrow('Authentication required')
      })
    }
  })

  describe('URL normalization', () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })

    it('should prepend https:// to publicationUrl without protocol', () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const clientWithoutProtocol = new SubstackClient({
        token: 'test-api-key',
        publicationUrl: 'iam.slys.dev'
      })

      // Verify HttpClient was constructed with normalized URLs
      const httpClientCalls = (HttpClient as jest.MockedClass<typeof HttpClient>).mock.calls
      expect((httpClientCalls[0][0] as unknown as { baseUrl: string }).baseUrl).toBe(
        'https://iam.slys.dev/api/v1'
      ) // publicationClient
      expect((httpClientCalls[1][0] as unknown as { baseUrl: string }).baseUrl).toBe(
        'https://substack.com/api/v1'
      ) // substackClient (default)
    })

    it('should preserve https:// protocol in publicationUrl', () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const clientWithHttps = new SubstackClient({
        token: 'test-api-key',
        publicationUrl: 'https://iam.slys.dev'
      })

      const httpClientCalls = (HttpClient as jest.MockedClass<typeof HttpClient>).mock.calls
      expect((httpClientCalls[0][0] as unknown as { baseUrl: string }).baseUrl).toBe(
        'https://iam.slys.dev/api/v1'
      )
    })

    it('should preserve http:// protocol in publicationUrl', () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const clientWithHttp = new SubstackClient({
        token: 'test-api-key',
        publicationUrl: 'http://localhost:3000'
      })

      const httpClientCalls = (HttpClient as jest.MockedClass<typeof HttpClient>).mock.calls
      expect((httpClientCalls[0][0] as unknown as { baseUrl: string }).baseUrl).toBe(
        'http://localhost:3000/api/v1'
      )
    })

    it('should prepend https:// to substackUrl without protocol', () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const clientWithoutProtocol = new SubstackClient({
        token: 'test-api-key',
        publicationUrl: 'https://iam.slys.dev',
        substackUrl: 'custom.substack.com'
      })

      const httpClientCalls = (HttpClient as jest.MockedClass<typeof HttpClient>).mock.calls
      expect((httpClientCalls[1][0] as unknown as { baseUrl: string }).baseUrl).toBe(
        'https://custom.substack.com/api/v1'
      ) // substackClient
    })

    it('should preserve https:// protocol in substackUrl', () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const clientWithHttps = new SubstackClient({
        token: 'test-api-key',
        publicationUrl: 'https://iam.slys.dev',
        substackUrl: 'https://custom.substack.com'
      })

      const httpClientCalls = (HttpClient as jest.MockedClass<typeof HttpClient>).mock.calls
      expect((httpClientCalls[1][0] as unknown as { baseUrl: string }).baseUrl).toBe(
        'https://custom.substack.com/api/v1'
      )
    })

    it('should preserve http:// protocol in substackUrl', () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const clientWithHttp = new SubstackClient({
        token: 'test-api-key',
        publicationUrl: 'https://iam.slys.dev',
        substackUrl: 'http://localhost:4000'
      })

      const httpClientCalls = (HttpClient as jest.MockedClass<typeof HttpClient>).mock.calls
      expect((httpClientCalls[1][0] as unknown as { baseUrl: string }).baseUrl).toBe(
        'http://localhost:4000/api/v1'
      )
    })

    it('When both URLs without protocol', () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const clientBothWithoutProtocol = new SubstackClient({
        token: 'test-api-key',
        publicationUrl: 'iam.slys.dev',
        substackUrl: 'substack.com'
      })

      const httpClientCalls = (HttpClient as jest.MockedClass<typeof HttpClient>).mock.calls
      expect((httpClientCalls[0][0] as unknown as { baseUrl: string }).baseUrl).toBe(
        'https://iam.slys.dev/api/v1'
      ) // publicationClient
      expect((httpClientCalls[1][0] as unknown as { baseUrl: string }).baseUrl).toBe(
        'https://substack.com/api/v1'
      ) // substackClient
    })

    it('should normalize default substackUrl when not provided', () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const clientWithDefaultSubstack = new SubstackClient({
        token: 'test-api-key',
        publicationUrl: 'iam.slys.dev'
      })

      const httpClientCalls = (HttpClient as jest.MockedClass<typeof HttpClient>).mock.calls
      expect((httpClientCalls[1][0] as unknown as { baseUrl: string }).baseUrl).toBe(
        'https://substack.com/api/v1'
      )
    })
  })
})
