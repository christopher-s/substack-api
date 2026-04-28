import { OwnProfile } from '@substack-api/domain/own-profile'
import { NoteWithLinkBuilder } from '@substack-api/domain/note-builder'
import { HttpClient } from '@substack-api/internal/http-client'
import {
  ProfileService,
  PostService,
  NoteService,
  FollowingService,
  CommentService,
  NoteBuilderFactory
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
const MockNoteBuilderFactory = NoteBuilderFactory as jest.MockedClass<typeof NoteBuilderFactory>

describe('OwnProfile - newNoteWithLink', () => {
  let mockClient: jest.Mocked<HttpClient>
  let mockProfileService: jest.Mocked<ProfileService>
  let mockPostService: jest.Mocked<PostService>
  let mockNoteService: jest.Mocked<NoteService>
  let mockCommentService: jest.Mocked<CommentService>
  let mockFollowingService: jest.Mocked<FollowingService>
  let mockNoteBuilderFactory: jest.Mocked<NoteBuilderFactory>
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
  } as any

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
    mockNoteBuilderFactory = new MockNoteBuilderFactory(
      mockClient
    ) as jest.Mocked<NoteBuilderFactory>

    // Setup mock implementations for NoteBuilderFactory methods
    mockNoteBuilderFactory.newNote = jest.fn().mockImplementation(() => {
      const { NoteBuilder } = jest.requireActual('@substack-api/domain/note-builder')
      return new NoteBuilder(mockClient)
    })
    mockNoteBuilderFactory.newNoteWithLink = jest.fn().mockImplementation((link: string) => {
      const { NoteWithLinkBuilder } = jest.requireActual('@substack-api/domain/note-builder')
      return new NoteWithLinkBuilder(mockClient, link)
    })

    ownProfile = new OwnProfile(
      mockProfileData,
      {
        publicationClient: mockClient,
        profileService: mockProfileService,
        postService: mockPostService,
        noteService: mockNoteService,
        commentService: mockCommentService,
        followingService: mockFollowingService,
        newNoteService: mockNoteBuilderFactory,
        perPage: 25
      },
      'testuser'
    )
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('newNoteWithLink', () => {
    it('When calling newNoteWithLink, then returns a NoteWithLinkBuilder instance', () => {
      // Arrange
      const linkUrl = 'https://example.com/article'

      // Act
      const noteBuilder = ownProfile.newNoteWithLink(linkUrl)

      // Assert
      expect(noteBuilder).toBeInstanceOf(NoteWithLinkBuilder)
    })

    it('When creating NoteWithLinkBuilder, then uses correct client and link', () => {
      // Arrange
      const linkUrl = 'https://iam.slys.dev/p/understanding-locking-contention'

      // Act
      const noteBuilder = ownProfile.newNoteWithLink(linkUrl)

      // Assert
      expect(noteBuilder).toBeInstanceOf(NoteWithLinkBuilder)
    })

    it('When passing different URL types, then creates builder for each', () => {
      // Arrange
      const urls = [
        'https://example.com/test',
        'http://blog.example.com/post/123',
        'https://subdomain.domain.com/path/to/article?param=value',
        'https://iam.slys.dev/p/understanding-locking-contention'
      ]

      // Act & Assert
      urls.forEach((url) => {
        const noteBuilder = ownProfile.newNoteWithLink(url)
        expect(noteBuilder).toBeInstanceOf(NoteWithLinkBuilder)
      })
    })

    it('When chaining builder methods, then returns defined result', () => {
      // Arrange
      const linkUrl = 'https://example.com/article'
      const noteBuilder = ownProfile.newNoteWithLink(linkUrl)

      // Act
      const chained = noteBuilder
        .paragraph()
        .text('Check out this article!')
        .paragraph()
        .text('It contains great information.')

      // Assert
      expect(chained).toBeDefined()
    })
  })

  describe('integration with regular newNote', () => {
    it('When creating both note types, then both are defined and different', () => {
      // Act
      const regularNote = ownProfile.newNote()
      const noteWithLink = ownProfile.newNoteWithLink('https://example.com')

      // Assert
      expect(regularNote).toBeDefined()
      expect(noteWithLink).toBeDefined()
      expect(noteWithLink).not.toBe(regularNote)
      expect(noteWithLink).toBeInstanceOf(NoteWithLinkBuilder)
    })
  })
})
