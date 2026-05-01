import { HttpClient } from '@substack-api/internal/http-client'
import {
  CategoryService,
  ChatService,
  CommentService,
  DashboardService,
  FeedService,
  FollowingService,
  GrowthStatsService,
  NoteService,
  PostManagementService,
  PostService,
  ProfileService,
  PublicationService,
  PublicationStatsService,
  RecommendationService,
  SearchService,
  SettingsService
} from '@substack-api/internal/services'
import type { SubstackConfig } from '@substack-api/types'
import { publishNote } from '@substack-api/domain'
import type { EntityDeps } from '@substack-api/domain/entity-deps'
import {
  ProfileClient,
  PostClient,
  CommentClient,
  PublicationClient,
  AnalyticsClient,
  RecommendationClient,
  ChatClient,
  NotificationClient
} from '@substack-api/sub-clients'

const DEFAULT_PER_PAGE = 25
const DEFAULT_MAX_RPS = 25

/**
 * Modern SubstackClient with sub-client-based API
 *
 * Supports both authenticated and anonymous usage:
 * - Anonymous: omit `token` in config for read-only access to public endpoints
 * - Authenticated: provide `token` for full access including write operations
 *
 * Operations are accessed through sub-clients:
 * - `client.profiles` - Profile operations (ownProfile, profileForSlug, followUser, etc.)
 * - `client.posts` - Post and feed operations (postForId, topPosts, search, etc.)
 * - `client.comments` - Comment operations (commentForId, createComment, etc.)
 * - `client.publications` - Publication, note, draft, and subscription operations
 * - `client.analytics` - Analytics/stats operations (subscriberStats, growthSources, etc.)
 * - `client.recommendations` - Recommendation operations
 * - `client.chat` - Chat/DM operations
 * - `client.notifications` - Notification operations
 */
export class SubstackClient {
  private readonly publicationClient: HttpClient
  private readonly substackClient: HttpClient
  private readonly postService: PostService
  private readonly noteService: NoteService
  private readonly profileService: ProfileService
  private readonly commentService: CommentService
  private readonly followingService: FollowingService
  private readonly publishNote: typeof publishNote
  private readonly perPage: number

  readonly profiles: ProfileClient
  readonly posts: PostClient
  readonly comments: CommentClient
  readonly publications: PublicationClient
  readonly analytics: AnalyticsClient
  readonly recommendations: RecommendationClient
  readonly chat: ChatClient
  readonly notifications: NotificationClient
  private readonly token: string | undefined

  private static normalizeUrl(url: string): string {
    if (url.startsWith('http://')) {
      if (
        /^http:\/\/localhost(?:[:/]|$)/.test(url) ||
        /^http:\/\/127\.0\.0\.1(?:[:/]|$)/.test(url)
      ) {
        return url
      }
      throw new Error('HTTPS is required; HTTP URLs are not supported for security reasons')
    }
    if (url.startsWith('https://')) {
      return url
    }
    return `https://${url}`
  }

  constructor(config: SubstackConfig) {
    this.token = config.token

    const normalizedPublicationUrl = SubstackClient.normalizeUrl(
      config.publicationUrl || config.substackUrl || 'substack.com'
    )
    const normalizedSubstackUrl = SubstackClient.normalizeUrl(config.substackUrl || 'substack.com')

    const urlPrefix = config.urlPrefix !== undefined ? config.urlPrefix : 'api/v1'

    this.perPage = config.perPage || DEFAULT_PER_PAGE
    const maxRequestsPerSecond = config.maxRequestsPerSecond || DEFAULT_MAX_RPS

    const publicationBaseUrl = urlPrefix
      ? `${normalizedPublicationUrl}/${urlPrefix}`
      : normalizedPublicationUrl
    this.publicationClient = new HttpClient({
      baseUrl: publicationBaseUrl,
      token: config.token,
      maxRequestsPerSecond,
      jitter: config.jitter,
      maxRetries: config.maxRetries,
      baseDelayMs: config.baseDelayMs,
      maxDelayMs: config.maxDelayMs,
      headerMode: config.headerMode,
      onRateLimit: config.onRateLimit,
      onTokenExpired: config.onTokenExpired,
      proxy: config.proxy
    })

    const substackBaseUrl = urlPrefix
      ? `${normalizedSubstackUrl}/${urlPrefix}`
      : normalizedSubstackUrl
    this.substackClient = new HttpClient({
      baseUrl: substackBaseUrl,
      token: config.token,
      maxRequestsPerSecond,
      jitter: config.jitter,
      maxRetries: config.maxRetries,
      baseDelayMs: config.baseDelayMs,
      maxDelayMs: config.maxDelayMs,
      headerMode: config.headerMode,
      onRateLimit: config.onRateLimit,
      onTokenExpired: config.onTokenExpired,
      proxy: config.proxy
    })

    // Initialize core services for entity deps
    this.postService = new PostService(this.substackClient)
    this.noteService = new NoteService(this.publicationClient)
    this.profileService = new ProfileService(this.substackClient)
    this.commentService = new CommentService(this.publicationClient, this.substackClient)
    this.followingService = new FollowingService(this.publicationClient, this.substackClient)
    this.publishNote = publishNote

    // Initialize services for sub-clients
    const feedService = new FeedService(this.substackClient)
    const searchService = new SearchService(this.substackClient)
    const categoryService = new CategoryService(this.substackClient)
    const publicationService = new PublicationService(this.publicationClient, this.substackClient)
    const postManagementService = new PostManagementService(this.publicationClient)
    const growthStatsService = new GrowthStatsService(this.publicationClient)
    const publicationStatsService = new PublicationStatsService(
      this.publicationClient,
      this.substackClient
    )
    const dashboardService = new DashboardService(this.publicationClient)
    const recommendationService = new RecommendationService(this.publicationClient)
    const chatService = new ChatService(this.substackClient)
    const settingsService = new SettingsService(this.publicationClient)

    // Initialize sub-clients
    const entityDeps = () => this.buildEntityDeps()
    this.profiles = new ProfileClient(
      this.profileService,
      searchService,
      entityDeps,
      this.followingService
    )
    this.posts = new PostClient(
      this.postService,
      feedService,
      publicationService,
      entityDeps,
      this.perPage
    )
    this.comments = new CommentClient(this.commentService, entityDeps)
    this.publications = new PublicationClient(
      publicationService,
      categoryService,
      postManagementService,
      this.noteService,
      this.perPage,
      settingsService
    )
    this.analytics = new AnalyticsClient(
      publicationStatsService,
      growthStatsService,
      dashboardService
    )
    this.recommendations = new RecommendationClient(recommendationService)
    this.chat = new ChatClient(chatService)
    this.notifications = new NotificationClient(chatService)
  }

  private buildEntityDeps(): EntityDeps {
    return {
      publicationClient: this.publicationClient,
      profileService: this.profileService,
      postService: this.postService,
      noteService: this.noteService,
      commentService: this.commentService,
      followingService: this.followingService,
      perPage: this.perPage
    }
  }
}
