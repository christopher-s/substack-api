import { OwnProfile } from '@substack-api/domain/own-profile'
import { HttpClient } from '@substack-api/internal/http-client'
import {
  ProfileService,
  PostService,
  NoteService,
  FollowingService,
  CommentService
} from '@substack-api/internal/services'

// Mock dependencies
jest.mock('@substack-api/internal/http-client')
jest.mock('@substack-api/internal/services')

const MockHttpClient = HttpClient as jest.MockedClass<typeof HttpClient>
const MockProfileService = ProfileService as jest.MockedClass<typeof ProfileService>
const MockPostService = PostService as jest.MockedClass<typeof PostService>
const MockNoteService = NoteService as jest.MockedClass<typeof NoteService>
const MockCommentService = CommentService as jest.MockedClass<typeof CommentService>
const MockFollowingService = FollowingService as jest.MockedClass<typeof FollowingService>

describe('OwnProfile - publishNote', () => {
  let mockClient: jest.Mocked<HttpClient>
  let mockProfileService: jest.Mocked<ProfileService>
  let mockPostService: jest.Mocked<PostService>
  let mockNoteService: jest.Mocked<NoteService>
  let mockCommentService: jest.Mocked<CommentService>
  let mockFollowingService: jest.Mocked<FollowingService>
  let ownProfile: OwnProfile

  const mockProfileData = {
    id: 12345,
    name: 'Test User',
    handle: 'testuser',
    photo_url: 'https://example.com/photo.jpg',
    bio: 'Test bio',
    profile_set_up_at: '2025-01-01T00:00:00Z',
    is_subscriber: true,
    subscriber_count: 100,
    publication_users: [],
    profile_disabled: false,
    publicationUsers: [],
    userLinks: [],
    subscriptions: [],
    subscriptionsTruncated: false,
    hasGuestPost: false,
    max_pub_tier: 0,
    hasActivity: false,
    theme: {},
    stripe_customer_id: null,
    publishable_stripe_client_secret: null,
    is_guest: false,
    is_writer: false,
    bestseller_tier: null,
    twitter_screen_name: null,
    facebook_account: null,
    github_account: null,
    apple_author_url: null,
    apple_podcast_url: null,
    spotify_url: null,
    linkedin_url: null,
    youtube_url: null,
    activity: {},
    promo_twitter_url: null,
    paywall_free_signup_page: null,
    email: 'test@example.com',
    first_name: 'Test',
    last_name: 'User',
    phone: null,
    email_notifications: true,
    primary_publication_id: null,
    is_default_on: true,
    show_default_payment_methods: true,
    payment_flow: 'normal',
    has_posts: false,
    has_podcast: false,
    has_community_content: false,
    has_recommendations: false,
    has_free_podcast: false,
    has_subscriber_only_podcast: false,
    total_podcasts: 0,
    invites_sent: 0,
    invites_received: 0,
    invites_accepted: 0,
    notes_disabled: false,
    notes_feed_enabled: true,
    primary_handle: 'testuser',
    is_following: false
  }

  beforeEach(() => {
    mockClient = new MockHttpClient(
      'https://example.com',
      'test-api-key'
    ) as jest.Mocked<HttpClient>
    mockProfileService = new MockProfileService(mockClient) as jest.Mocked<ProfileService>
    mockPostService = new MockPostService(mockClient) as jest.Mocked<PostService>
    mockNoteService = new MockNoteService(mockClient) as jest.Mocked<NoteService>
    mockCommentService = new MockCommentService(
      mockClient,
      mockClient
    ) as jest.Mocked<CommentService>
    mockFollowingService = new MockFollowingService(
      mockClient,
      mockClient
    ) as jest.Mocked<FollowingService>

    ownProfile = new OwnProfile(
      mockProfileData,
      {
        publicationClient: mockClient,
        profileService: mockProfileService,
        postService: mockPostService,
        noteService: mockNoteService,
        commentService: mockCommentService,
        followingService: mockFollowingService,
        perPage: 25
      },
      'testuser'
    )
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('publishNote with link', () => {
    it('When publishing a note with a linkUrl, then creates attachment first', async () => {
      const mockAttachmentResponse = { id: 'attachment-123' }
      const mockPublishResponse = {
        id: 789,
        date: '2023-01-01T00:00:00Z',
        body: 'Test note content',
        attachments: []
      }

      mockClient.post
        .mockResolvedValueOnce(mockAttachmentResponse)
        .mockResolvedValueOnce(mockPublishResponse)

      const result = await ownProfile.publishNote('Check out this link!', {
        linkUrl: 'https://example.com/article'
      })

      expect(result.success).toBe(true)
      expect(mockClient.post).toHaveBeenCalledTimes(2)
      expect(mockClient.post).toHaveBeenNthCalledWith(1, '/comment/attachment/', {
        url: 'https://example.com/article',
        type: 'link'
      })
      expect(mockClient.post).toHaveBeenNthCalledWith(
        2,
        '/comment/feed/',
        expect.objectContaining({
          attachmentIds: ['attachment-123']
        })
      )
    })

    it('When attachment creation fails, then error propagates', async () => {
      mockClient.post.mockRejectedValueOnce(new Error('Attachment creation failed'))

      await expect(
        ownProfile.publishNote('Test', { linkUrl: 'https://example.com' })
      ).rejects.toThrow('Attachment creation failed')

      expect(mockClient.post).toHaveBeenCalledTimes(1)
    })
  })
})
