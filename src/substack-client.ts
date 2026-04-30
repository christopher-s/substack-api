import { HttpClient } from '@substack-api/internal/http-client'
import {
  Category,
  Comment,
  FullPost,
  Note,
  OwnProfile,
  Profile,
  PublicationPost
} from '@substack-api/domain'
import type { EntityDeps } from '@substack-api/domain/entity-deps'
import {
  CommentService,
  ConnectivityService,
  DashboardService,
  DiscoveryService,
  FollowingService,
  GrowthStatsService,
  NoteService,
  PostManagementService,
  PostService,
  ProfileService,
  PublicationDetailService,
  PublicationService,
  PublicationStatsService,
  RecommendationService,
  SettingsService,
  SubscriberStatsService,
  SubscriptionService,
  ChatService
} from '@substack-api/internal/services'
import { NoteBuilderFactory } from '@substack-api/domain'
import { markdownToHtml } from '@substack-api/internal/markdown-to-html'
import type {
  FeedTab,
  ProfileFeedTab,
  ActivityFeedTab
} from '@substack-api/internal/services/discovery-service'
import type {
  FeedItem,
  SubstackInboxItem,
  SubstackFacepile,
  SubstackCategoryPublication,
  SubstackLiveStreamResponse,
  SubstackTrendingResponse,
  SubstackPublicationPost,
  SubstackCommentRepliesResponse,
  SubstackProfileSearchResult,
  SubscriberStats,
  SubscriptionsPage,
  GrowthSources,
  GrowthTimeseries,
  GrowthEvents,
  NetworkAttribution,
  FollowerTimeseries,
  AudienceLocation,
  AudienceLocationTotal,
  AudienceOverlap,
  Traffic30dViews,
  VisitorSources,
  TrafficTimeseries,
  Email30dOpenRate,
  EmailStats,
  PledgeSummary,
  Pledges,
  ReaderReferrals,
  PledgePlans,
  PledgePlansSummary,
  PublicationSettings,
  BestsellerTier,
  DashboardSummary,
  EmailsTimeseries,
  UnreadActivity,
  UnreadMessageCount,
  SubstackRecommendation,
  SubstackRecommendationsExist,
  SubstackSuggestedRecommendation,
  SubstackPublicationExport,
  SubstackPublicationSearchResponse,
  PublisherSettingsDetail,
  SubstackSubscriptionSettings,
  SubstackBoostSettings,
  SubstackPostManagementResponse,
  SubstackPostManagementCounts,
  SubstackDraftPost,
  SubstackDeleteResponse,
  SubstackLiveStreamList,
  SubstackEligibleHosts,
  SubstackPublicationDetail,
  SubstackPostTag,
  SubstackSubscription,
  SubstackSubscriptionsResponse,
  SubstackPublicationUserRole,
  SubstackPublicationSection,
  SubstackNoteStats,
  SubstackCreatedComment
} from '@substack-api/internal/types'
import type { SubstackConfig } from '@substack-api/types'
import type {
  UnreadCount,
  InboxResponse,
  DmResponse,
  SendMessageResponse,
  InvitesResponse,
  ReactionsResponse,
  RealtimeTokenResponse,
  ChatThread,
  ChatMessage
} from '@substack-api/internal/types/chat'

const DEFAULT_PER_PAGE = 25
const DEFAULT_MAX_RPS = 25

/**
 * Modern SubstackClient with entity-based API
 *
 * Supports both authenticated and anonymous usage:
 * - Anonymous: omit `token` in config for read-only access to public endpoints
 * - Authenticated: provide `token` for full access including write operations
 */
export class SubstackClient {
  private readonly publicationClient: HttpClient
  private readonly substackClient: HttpClient
  private readonly postService: PostService
  private readonly noteService: NoteService
  private readonly profileService: ProfileService
  private readonly commentService: CommentService
  private readonly followingService: FollowingService
  private readonly connectivityService: ConnectivityService
  private readonly newNoteService: NoteBuilderFactory
  private readonly discoveryService: DiscoveryService
  private readonly publicationService: PublicationService
  private readonly postManagementService: PostManagementService
  private readonly publicationDetailService: PublicationDetailService
  private readonly subscriptionService: SubscriptionService
  private readonly settingsService: SettingsService
  private readonly subscriberStatsService: SubscriberStatsService
  private readonly growthStatsService: GrowthStatsService
  private readonly publicationStatsService: PublicationStatsService
  private readonly dashboardService: DashboardService
  private readonly recommendationService: RecommendationService
  private readonly chatService: ChatService
  private readonly perPage: number
  private readonly token: string | undefined
  private readonly hasPublication: boolean

  /**
   * Normalize URL by ensuring it has a protocol
   * If no protocol is specified, defaults to https://
   */
  private static normalizeUrl(url: string): string {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url
    }
    return `https://${url}`
  }

  constructor(config: SubstackConfig) {
    this.token = config.token
    this.hasPublication = !!config.publicationUrl

    // Normalize URLs to ensure they have protocols
    // When no publicationUrl is provided, fall back to substackUrl so publicationClient
    // still works for global endpoints (noteForId, commentForId, etc.)
    const normalizedPublicationUrl = SubstackClient.normalizeUrl(
      config.publicationUrl || config.substackUrl || 'substack.com'
    )
    const normalizedSubstackUrl = SubstackClient.normalizeUrl(config.substackUrl || 'substack.com')

    // Determine URL prefix
    const urlPrefix = config.urlPrefix !== undefined ? config.urlPrefix : 'api/v1'

    // Store configuration
    this.perPage = config.perPage || DEFAULT_PER_PAGE
    const maxRequestsPerSecond = config.maxRequestsPerSecond || DEFAULT_MAX_RPS

    // Construct full base URL for publication-specific endpoints
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
      onRateLimit: config.onRateLimit
    })

    // Construct full base URL for global Substack endpoints
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
      onRateLimit: config.onRateLimit
    })

    // Initialize services
    this.postService = new PostService(this.substackClient)
    this.noteService = new NoteService(this.publicationClient)
    this.profileService = new ProfileService(this.substackClient)
    this.commentService = new CommentService(this.publicationClient, this.substackClient)
    this.followingService = new FollowingService(this.publicationClient, this.substackClient)
    this.connectivityService = new ConnectivityService(this.substackClient, this.followingService)
    this.newNoteService = new NoteBuilderFactory(this.substackClient)
    this.discoveryService = new DiscoveryService(this.substackClient)
    this.publicationService = new PublicationService(this.publicationClient)
    this.postManagementService = new PostManagementService(this.publicationClient)
    this.publicationDetailService = new PublicationDetailService(this.publicationClient)
    this.subscriptionService = new SubscriptionService(this.publicationClient, this.substackClient)
    this.settingsService = new SettingsService(this.publicationClient)
    this.subscriberStatsService = new SubscriberStatsService(
      this.publicationClient,
      this.substackClient
    )
    this.growthStatsService = new GrowthStatsService(this.publicationClient)
    this.publicationStatsService = new PublicationStatsService(this.publicationClient)
    this.dashboardService = new DashboardService(this.publicationClient)
    this.recommendationService = new RecommendationService(this.publicationClient)
    this.chatService = new ChatService(this.substackClient)
  }

  /** Throw a clear error when an authenticated method is called without a token */
  private requireAuth(methodName: string): void {
    if (!this.token) {
      throw new Error(
        `Authentication required: provide a token in SubstackConfig to use ${methodName}()`
      )
    }
  }

  /** Throw a clear error when a publication-scoped method is called without a publicationUrl */
  private requirePublication(methodName: string): void {
    if (!this.hasPublication) {
      throw new Error(
        `Publication required: provide a publicationUrl in SubstackConfig to use ${methodName}()`
      )
    }
  }

  // ── Authenticated methods ──────────────────────────────────────────

  /**
   * Test API connectivity (requires authentication)
   * @throws {Error} When no token is configured or authentication fails
   */
  async testConnectivity(): Promise<boolean> {
    this.requireAuth('testConnectivity')
    return await this.connectivityService.isConnected()
  }

  /**
   * Get the authenticated user's own profile with write capabilities
   * @throws {Error} When no token is configured or authentication fails
   */
  async ownProfile(): Promise<OwnProfile> {
    this.requireAuth('ownProfile')
    try {
      const profile = await this.profileService.getOwnProfile()
      return new OwnProfile(profile, this.buildEntityDeps(), profile.handle)
    } catch (error) {
      throw new Error(`Failed to get own profile: ${(error as Error).message}`, { cause: error })
    }
  }

  // ── Public methods (work anonymously) ──────────────────────────────

  /**
   * Get a profile by handle/slug (works anonymously)
   */
  async profileForSlug(slug: string): Promise<Profile> {
    if (!slug || slug.trim() === '') {
      throw new Error('Profile slug cannot be empty')
    }

    try {
      const profile = await this.profileService.getProfileBySlug(slug)
      return new Profile(profile, this.buildEntityDeps(), profile.handle)
    } catch (error) {
      throw new Error(`Profile with slug '${slug}' not found: ${(error as Error).message}`, {
        cause: error
      })
    }
  }

  /**
   * Get a profile by user ID (works anonymously)
   */
  async profileForId(id: number): Promise<Profile> {
    try {
      const profile = await this.profileService.getProfileById(id)
      return new Profile(profile, this.buildEntityDeps(), profile.handle)
    } catch (error) {
      throw new Error(`Profile with ID ${id} not found: ${(error as Error).message}`, {
        cause: error
      })
    }
  }

  /**
   * Get a specific post by ID (works anonymously)
   */
  async postForId(id: number): Promise<FullPost> {
    try {
      const post = await this.postService.getPostById(id)
      return new FullPost(post, this.buildEntityDeps())
    } catch (error) {
      throw new Error(`Post with ID ${id} not found: ${(error as Error).message}`, { cause: error })
    }
  }

  /**
   * Get a specific note by ID (works anonymously)
   */
  async noteForId(id: number): Promise<Note> {
    try {
      const noteData = await this.noteService.getNoteById(id)
      return new Note(noteData, this.publicationClient)
    } catch (error) {
      throw new Error(`Note with ID ${id} not found: ${(error as Error).message}`, { cause: error })
    }
  }

  /**
   * Get a specific comment by ID (works anonymously)
   */
  async commentForId(id: number): Promise<Comment> {
    try {
      const commentData = await this.commentService.getCommentById(id)
      return new Comment(commentData, this.publicationClient)
    } catch (error) {
      throw new Error(`Comment with ID ${id} not found: ${(error as Error).message}`, {
        cause: error
      })
    }
  }

  /**
   * Get threaded replies to a comment
   * @param commentId - The parent comment ID
   * @param options.cursor - Pagination cursor from previous response
   * @throws {Error} On network or API errors
   */
  async commentReplies(
    commentId: number,
    options?: { cursor?: string }
  ): Promise<SubstackCommentRepliesResponse> {
    return await this.commentService.getReplies(commentId, options)
  }

  /**
   * Iterate all replies to a comment via cursor pagination
   * @param commentId - The parent comment ID
   * @param options.limit - Max reply branches to yield
   * @throws {Error} On network or API errors
   */
  async *commentRepliesFeed(
    commentId: number,
    options: { limit?: number } = {}
  ): AsyncGenerator<SubstackCommentRepliesResponse> {
    let cursor: string | undefined
    let totalYielded = 0

    while (true) {
      const response = await this.commentService.getReplies(commentId, { cursor })
      const branches = response.commentBranches ?? []
      const remaining = options.limit !== undefined ? options.limit - totalYielded : undefined

      if (remaining !== undefined && branches.length > remaining) {
        yield { ...response, commentBranches: branches.slice(0, remaining) }
        return
      }

      yield response
      totalYielded += branches.length

      if (!response.nextCursor) break
      cursor = response.nextCursor
    }
  }

  // ── Discovery methods (anonymous) ──────────────────────────────────

  /**
   * Get top/trending posts from Substack's homepage feed
   */
  async topPosts(): Promise<SubstackInboxItem[]> {
    const result = await this.discoveryService.getTopPosts()
    return result.items
  }

  /**
   * Get trending posts with associated publications
   * GET /api/v1/trending (anonymous)
   * @deprecated Returns empty `publications` and `trendingPosts` arrays. Use {@link topPosts} instead.
   */
  async trending(options?: { limit?: number }): Promise<SubstackTrendingResponse> {
    return await this.discoveryService.getTrending(options)
  }

  /**
   * Iterate all trending posts via offset pagination.
   * Yields whole pages (SubstackTrendingResponse) so consumers can
   * access both posts and publications together — unlike paginateOffset
   * which yields individual items.
   * @param options.limit - Max items to yield per page (passed to API)
   * @throws {Error} On network or API errors
   * @deprecated Returns empty `publications` and `trendingPosts` arrays. Use {@link topPosts} instead.
   */
  async *trendingFeed(options: { limit?: number } = {}): AsyncGenerator<SubstackTrendingResponse> {
    let offset = 0
    const batchSize = options.limit || this.perPage

    while (true) {
      const response = await this.discoveryService.getTrending({
        limit: batchSize,
        offset
      })

      yield response

      if (response.posts.length < batchSize) break
      offset += batchSize
    }
  }

  /**
   * Get discovery feed items (posts, notes, comments)
   * @param options.tab - Feed tab: 'for-you' (default), 'top', 'popular', 'catchup', 'notes', or 'explore'
   * @param options.limit - Max items to yield
   * @throws {Error} On network or API errors
   */
  async *discoverFeed(options: { tab?: FeedTab; limit?: number } = {}): AsyncGenerator<FeedItem> {
    yield* this.paginateFeed(
      (cursor) => this.discoveryService.getFeed({ tab: options.tab, cursor }),
      options.limit
    )
  }

  /**
   * Get activity feed (requires auth).
   * Yields feed items from /api/v1/reader/feed with tab filtering support.
   * @param options.tabId - Feed tab: 'for-you', 'subscribed', 'bestseller', or category ID
   * @param options.limit - Max items to yield
   * @param options.onTabs - Callback receiving tabs metadata from the first page
   */
  async *activityFeed(
    options: { tabId?: string; limit?: number; onTabs?: (tabs: ActivityFeedTab[]) => void } = {}
  ): AsyncGenerator<FeedItem> {
    this.requireAuth('activityFeed')
    let tabsDelivered = false
    yield* this.paginateFeed(async (cursor) => {
      const result = await this.discoveryService.getFeed({ tabId: options.tabId, cursor })
      if (!tabsDelivered && result.tabs && options.onTabs) {
        options.onTabs(result.tabs)
        tabsDelivered = true
      }
      return result
    }, options.limit)
  }

  /**
   * Get all content categories with subcategories
   */
  async categories(): Promise<Category[]> {
    const rawCategories = await this.discoveryService.getCategories()
    return rawCategories.map((cat) => new Category(cat))
  }

  /**
   * Get publications in a given category
   * @param categoryId - Category ID (number) or slug (e.g., "podcast", "tech")
   * @param options.limit - Number of results per page (default 25)
   * @param options.offset - Offset for pagination
   * @throws {Error} On network or API errors
   */
  async categoryPublications(
    categoryId: number | string,
    options?: { limit?: number; offset?: number }
  ): Promise<{ publications: SubstackCategoryPublication[]; more: boolean }> {
    return await this.discoveryService.getCategoryPublications(categoryId, options)
  }

  // ── Search methods (anonymous) ─────────────────────────────────────

  /**
   * Search for posts, people, publications, and notes
   * @param query - Search query string
   * @param options.limit - Max items to yield
   * @throws {Error} On network or API errors
   */
  async *search(query: string, options: { limit?: number } = {}): AsyncGenerator<FeedItem> {
    yield* this.paginateFeed(
      (cursor) => this.discoveryService.search(query, { cursor }),
      options.limit
    )
  }

  /**
   * Search for user profiles by name or handle
   * @param query - Search query string
   * @param options.page - Page number (1-based)
   * @throws {Error} On network or API errors
   */
  async profileSearch(
    query: string,
    options?: { page?: number }
  ): Promise<{ results: SubstackProfileSearchResult[]; more: boolean }> {
    return await this.discoveryService.searchProfiles(query, options)
  }

  /**
   * Iterate all profile search results via page pagination
   * @param query - Search query string
   * @param options.limit - Max profiles to yield
   * @throws {Error} On network or API errors
   */
  async *profileSearchAll(
    query: string,
    options: { limit?: number } = {}
  ): AsyncGenerator<SubstackProfileSearchResult> {
    let page = 1
    let totalYielded = 0
    while (true) {
      const response = await this.discoveryService.searchProfiles(query, { page })
      for (const result of response.results) {
        if (options.limit && totalYielded >= options.limit) return
        yield result
        totalYielded++
      }
      if (!response.more) break
      page++
    }
  }

  /**
   * Explore search with different tabs (alternative to search)
   * @param options.tab - Explore tab: 'explore' (default), 'notes', 'top', or 'for-you'
   * @param options.limit - Max items to yield
   * @throws {Error} On network or API errors
   */
  async *exploreSearch(options: { tab?: string; limit?: number } = {}): AsyncGenerator<FeedItem> {
    yield* this.paginateFeed(
      (cursor) => this.discoveryService.exploreSearch({ tab: options.tab, cursor }),
      options.limit
    )
  }

  // ── Publication methods (anonymous) ────────────────────────────────

  /**
   * Get posts from the configured publication's archive
   * @param options.sort - Sort order: 'new' (default) or 'top'
   * @param options.limit - Max items to yield
   * @throws {Error} On network or API errors
   */
  async *publicationArchive(
    options: { sort?: 'top' | 'new'; limit?: number } = {}
  ): AsyncGenerator<PublicationPost> {
    this.requirePublication('publicationArchive')
    yield* this.paginateOffset(
      (offset, limit) => this.publicationService.getArchive({ sort: options.sort, offset, limit }),
      options.limit
    )
  }

  /**
   * Get full posts from the configured publication (includes body_html)
   * Uses offset-based pagination.
   * @param options.limit - Max items to yield
   * @throws {Error} On network or API errors
   */
  async *publicationPosts(options: { limit?: number } = {}): AsyncGenerator<PublicationPost> {
    this.requirePublication('publicationPosts')
    yield* this.paginateOffset(
      (offset, limit) => this.publicationService.getPosts({ offset, limit }),
      options.limit
    )
  }

  /**
   * Get recent posts from the configured publication's homepage
   */
  async publicationHomepage(): Promise<PublicationPost[]> {
    this.requirePublication('publicationHomepage')
    const result = await this.publicationService.getHomepageData()
    return result.newPosts.map((post) => new PublicationPost(post))
  }

  /**
   * Get users who reacted to a post (facepile)
   */
  async postReactors(postId: number): Promise<SubstackFacepile> {
    this.requirePublication('postReactors')
    return await this.publicationService.getPostFacepile(postId)
  }

  /**
   * Get active live stream for a publication (works anonymously)
   */
  async activeLiveStream(publicationId: number): Promise<SubstackLiveStreamResponse> {
    this.requirePublication('activeLiveStream')
    return await this.publicationService.getActiveLiveStream(publicationId)
  }

  /**
   * Mark a post as seen (works anonymously)
   */
  async markPostSeen(postId: number): Promise<void> {
    this.requirePublication('markPostSeen')
    await this.publicationService.markPostSeen(postId)
  }

  /**
   * Get publication export status/history
   * GET {pub}/api/v1/publication_export (requires auth)
   */
  async publicationExport(): Promise<SubstackPublicationExport[]> {
    this.requireAuth('publicationExport')
    this.requirePublication('publicationExport')
    return await this.publicationService.getPublicationExport()
  }

  /**
   * Search for publications
   * GET /api/v1/publication/search?query=...&limit=... (anonymous)
   */
  async publicationSearch(
    query: string,
    options?: { limit?: number }
  ): Promise<SubstackPublicationSearchResponse> {
    return await this.publicationService.searchPublications(query, options)
  }

  // ── Profile feed methods (anonymous) ───────────────────────────────

  /**
   * Get profile activity feed (posts, notes, likes)
   * @param options.tab - Filter by content type: "posts", "notes", "comments", or "likes"
   * @param options.limit - Max items to yield
   * @throws {Error} On network or API errors
   */
  async *profileActivity(
    profileId: number,
    options: { tab?: ProfileFeedTab; limit?: number } = {}
  ): AsyncGenerator<FeedItem> {
    yield* this.paginateFeed(
      (cursor) => this.discoveryService.getProfileActivity(profileId, { tab: options.tab, cursor }),
      options.limit
    )
  }

  /**
   * Get profile likes feed
   * @throws {Error} On network or API errors
   */
  async *profileLikes(
    profileId: number,
    options: { limit?: number } = {}
  ): AsyncGenerator<FeedItem> {
    yield* this.paginateFeed(
      (cursor) => this.discoveryService.getProfileLikes(profileId, { cursor }),
      options.limit
    )
  }

  /**
   * Get publication activity feed (posts, notes)
   * @param publicationId - Publication ID
   * @param options.tab - Feed tab (e.g. 'posts')
   * @param options.limit - Max items to yield
   * @throws {Error} On network or API errors
   */
  async *publicationFeed(
    publicationId: number,
    options: { tab?: string; limit?: number } = {}
  ): AsyncGenerator<FeedItem> {
    yield* this.paginateFeed(
      (cursor) =>
        this.discoveryService.getPublicationFeed(publicationId, { tab: options.tab, cursor }),
      options.limit
    )
  }

  // ── Post management methods (require auth + publication) ───────────

  async publishedPosts(options?: {
    offset?: number
    limit?: number
  }): Promise<SubstackPostManagementResponse> {
    this.requireAuth('publishedPosts')
    this.requirePublication('publishedPosts')
    return await this.postManagementService.getPublishedPosts(options)
  }

  async drafts(options?: {
    offset?: number
    limit?: number
  }): Promise<SubstackPostManagementResponse> {
    this.requireAuth('drafts')
    this.requirePublication('drafts')
    return await this.postManagementService.getDrafts(options)
  }

  async scheduledPosts(options?: {
    offset?: number
    limit?: number
  }): Promise<SubstackPostManagementResponse> {
    this.requireAuth('scheduledPosts')
    this.requirePublication('scheduledPosts')
    return await this.postManagementService.getScheduledPosts(options)
  }

  async postCounts(query?: string): Promise<SubstackPostManagementCounts> {
    this.requireAuth('postCounts')
    this.requirePublication('postCounts')
    return await this.postManagementService.getPostCounts(query)
  }

  async draft(id: number): Promise<SubstackDraftPost> {
    this.requireAuth('draft')
    this.requirePublication('draft')
    return await this.postManagementService.getDraft(id)
  }

  async createDraft(data: {
    title: string
    body?: string
    type?: string
    audience?: string
    bylineUserId?: number
  }): Promise<SubstackDraftPost> {
    this.requireAuth('createDraft')
    this.requirePublication('createDraft')
    return await this.postManagementService.createDraft(data)
  }

  /**
   * Create a draft post from markdown content
   * Converts markdown to HTML and creates a draft on the publication
   * @param markdown - Markdown content for the draft body
   * @param options - Optional draft metadata (title, type, audience, bylineUserId)
   * @returns Promise with the created draft data (includes id)
   * @throws {Error} When no token/publication configured, markdown is empty, or API fails
   */
  async createDraftFromMarkdown(
    markdown: string,
    options?: {
      title?: string
      type?: string
      audience?: string
      bylineUserId?: number
    }
  ): Promise<SubstackDraftPost> {
    this.requireAuth('createDraftFromMarkdown')
    this.requirePublication('createDraftFromMarkdown')
    try {
      const html = markdownToHtml(markdown)
      return await this.postManagementService.createDraft({
        title: options?.title ?? '',
        body: html,
        type: options?.type,
        audience: options?.audience,
        bylineUserId: options?.bylineUserId
      })
    } catch (error) {
      throw new Error(
        `Failed to create draft from markdown: ${error instanceof Error ? error.message : String(error)}`,
        { cause: error }
      )
    }
  }

  async updateDraft(
    id: number,
    data: { title?: string; body?: string; [key: string]: unknown }
  ): Promise<SubstackDraftPost> {
    this.requireAuth('updateDraft')
    this.requirePublication('updateDraft')
    return await this.postManagementService.updateDraft(id, data)
  }

  async publishDraft(id: number): Promise<SubstackDraftPost> {
    this.requireAuth('publishDraft')
    this.requirePublication('publishDraft')
    return await this.postManagementService.publishDraft(id)
  }

  async deleteDraft(id: number): Promise<SubstackDeleteResponse> {
    this.requireAuth('deleteDraft')
    this.requirePublication('deleteDraft')
    return await this.postManagementService.deleteDraft(id)
  }

  // ── Comment write methods (require auth) ────────────────────────────

  async createComment(postId: number, body: string): Promise<SubstackCreatedComment> {
    this.requireAuth('createComment')
    this.requirePublication('createComment')
    return await this.commentService.createComment(postId, body)
  }

  async deleteComment(commentId: number): Promise<SubstackDeleteResponse> {
    this.requireAuth('deleteComment')
    this.requirePublication('deleteComment')
    return await this.commentService.deleteComment(commentId)
  }

  // ── Publication detail methods ──────────────────────────────────────

  async publicationDetails(): Promise<SubstackPublicationDetail> {
    this.requirePublication('publicationDetails')
    return await this.publicationDetailService.getPublicationDetails()
  }

  async publicationTags(): Promise<SubstackPostTag[]> {
    this.requirePublication('publicationTags')
    return await this.publicationDetailService.getPostTags()
  }

  async liveStreams(status?: string): Promise<SubstackLiveStreamList> {
    this.requirePublication('liveStreams')
    return await this.publicationService.getLiveStreams(status)
  }

  async eligibleHosts(publicationId: number): Promise<SubstackEligibleHosts> {
    this.requirePublication('eligibleHosts')
    return await this.publicationService.getEligibleHosts(publicationId)
  }

  // ── Subscription methods (require auth) ─────────────────────────────

  async subscription(): Promise<SubstackSubscription> {
    this.requireAuth('subscription')
    this.requirePublication('subscription')
    return await this.subscriptionService.getCurrentSubscription()
  }

  async subscriptions(options?: {
    offset?: number
    limit?: number
  }): Promise<SubstackSubscriptionsResponse> {
    this.requireAuth('subscriptions')
    return await this.subscriptionService.getAllSubscriptions(options)
  }

  // ── Notes listing (require auth) ────────────────────────────────────

  async *notesFeed(options: { limit?: number } = {}): AsyncGenerator<unknown> {
    this.requireAuth('notesFeed')
    this.requirePublication('notesFeed')
    let cursor: string | undefined
    let totalYielded = 0

    while (true) {
      const result = await this.noteService.getNotes({ cursor })
      for (const item of result.items) {
        if (options.limit && totalYielded >= options.limit) return
        yield item
        totalYielded++
      }
      if (!result.nextCursor) break
      cursor = result.nextCursor
    }
  }

  async noteStats(entityKey: string): Promise<SubstackNoteStats> {
    this.requireAuth('noteStats')
    this.requirePublication('noteStats')
    return await this.noteService.getNoteStats(entityKey)
  }

  // ── Settings methods (require auth) ─────────────────────────────────

  async publisherSettings(): Promise<PublisherSettingsDetail> {
    this.requireAuth('publisherSettings')
    this.requirePublication('publisherSettings')
    return await this.settingsService.getPublisherSettings()
  }

  async publicationUser(): Promise<SubstackPublicationUserRole> {
    this.requireAuth('publicationUser')
    this.requirePublication('publicationUser')
    return await this.settingsService.getPublicationUser()
  }

  async sections(): Promise<SubstackPublicationSection[]> {
    this.requireAuth('sections')
    this.requirePublication('sections')
    return await this.settingsService.getSections()
  }

  async subscriptionSettings(): Promise<SubstackSubscriptionSettings> {
    this.requireAuth('subscriptionSettings')
    this.requirePublication('subscriptionSettings')
    return await this.settingsService.getSubscription()
  }

  async boostSettings(): Promise<SubstackBoostSettings> {
    this.requireAuth('boostSettings')
    this.requirePublication('boostSettings')
    return await this.settingsService.getBoostSettings()
  }

  // ── Subscriber stats methods (require auth) ──────────────────────────

  async subscriberStats(): Promise<SubscriberStats> {
    this.requireAuth('subscriberStats')
    this.requirePublication('subscriberStats')
    return await this.subscriberStatsService.getSubscriberStats()
  }

  async subscriptionsPage(options?: { cursor?: string }): Promise<SubscriptionsPage> {
    this.requireAuth('subscriptionsPage')
    this.requirePublication('subscriptionsPage')
    return await this.subscriberStatsService.getSubscriptionsPage(options)
  }

  // ── Growth stats methods (require auth) ───────────────────────────────

  async growthSources(options: {
    fromDate: string
    toDate: string
    orderBy?: string
    orderDirection?: string
  }): Promise<GrowthSources> {
    this.requireAuth('growthSources')
    this.requirePublication('growthSources')
    return await this.growthStatsService.getGrowthSources(options)
  }

  async growthTimeseries(data: {
    sources: unknown[]
    orderBy: string
    orderDirection: string
    fromDate?: string
    toDate?: string
  }): Promise<GrowthTimeseries> {
    this.requireAuth('growthTimeseries')
    this.requirePublication('growthTimeseries')
    return await this.growthStatsService.getGrowthTimeseries(data)
  }

  async growthEvents(options: { fromDate: string; toDate: string }): Promise<GrowthEvents> {
    this.requireAuth('growthEvents')
    this.requirePublication('growthEvents')
    return await this.growthStatsService.getGrowthEvents(options)
  }

  // ── Publication stats methods (require auth) ─────────────────────────

  async networkAttribution(options?: {
    timeWindow?: string
    isSubscribed?: boolean
  }): Promise<NetworkAttribution> {
    this.requireAuth('networkAttribution')
    this.requirePublication('networkAttribution')
    return await this.publicationStatsService.getNetworkAttribution(options)
  }

  async followerTimeseries(options: { from: string }): Promise<FollowerTimeseries> {
    this.requireAuth('followerTimeseries')
    this.requirePublication('followerTimeseries')
    return await this.publicationStatsService.getFollowerTimeseries(options)
  }

  async audienceLocation(options?: {
    metric?: string
    granularity?: string
  }): Promise<AudienceLocation> {
    this.requireAuth('audienceLocation')
    this.requirePublication('audienceLocation')
    return await this.publicationStatsService.getAudienceLocation(options)
  }

  async audienceLocationTotal(): Promise<AudienceLocationTotal> {
    this.requireAuth('audienceLocationTotal')
    this.requirePublication('audienceLocationTotal')
    return await this.publicationStatsService.getAudienceLocationTotal()
  }

  async audienceOverlap(options?: { limit?: number }): Promise<AudienceOverlap> {
    this.requireAuth('audienceOverlap')
    this.requirePublication('audienceOverlap')
    return await this.publicationStatsService.getAudienceOverlap(options)
  }

  async traffic30dViews(): Promise<Traffic30dViews> {
    this.requireAuth('traffic30dViews')
    this.requirePublication('traffic30dViews')
    return await this.publicationStatsService.getTraffic30dViews()
  }

  async visitorSources(options: {
    fromDate: string
    toDate: string
    offset?: number
    limit?: number
    orderBy?: string
    orderDirection?: string
  }): Promise<VisitorSources> {
    this.requireAuth('visitorSources')
    this.requirePublication('visitorSources')
    return await this.publicationStatsService.getVisitorSources(options)
  }

  async trafficTimeseries(options: {
    from: string
    to: string
    category?: string
  }): Promise<TrafficTimeseries> {
    this.requireAuth('trafficTimeseries')
    this.requirePublication('trafficTimeseries')
    return await this.publicationStatsService.getTrafficTimeseries(options)
  }

  async email30dOpenRate(): Promise<Email30dOpenRate> {
    this.requireAuth('email30dOpenRate')
    this.requirePublication('email30dOpenRate')
    return await this.publicationStatsService.getEmail30dOpenRate()
  }

  async emailStats(options?: {
    offset?: number
    limit?: number
    orderBy?: string
    orderDirection?: string
  }): Promise<EmailStats> {
    this.requireAuth('emailStats')
    this.requirePublication('emailStats')
    return await this.publicationStatsService.getEmailStats(options)
  }

  async pledgeSummary(): Promise<PledgeSummary> {
    this.requireAuth('pledgeSummary')
    this.requirePublication('pledgeSummary')
    return await this.publicationStatsService.getPledgeSummary()
  }

  async pledges(options?: { limit?: number }): Promise<Pledges> {
    this.requireAuth('pledges')
    this.requirePublication('pledges')
    return await this.publicationStatsService.getPledges(options)
  }

  async readerReferrals(options: {
    to: string
    offset?: number
    limit?: number
    orderBy?: string
    orderDirection?: string
  }): Promise<ReaderReferrals> {
    this.requireAuth('readerReferrals')
    this.requirePublication('readerReferrals')
    return await this.publicationStatsService.getReaderReferrals(options)
  }

  async pledgePlans(): Promise<PledgePlans> {
    this.requireAuth('pledgePlans')
    this.requirePublication('pledgePlans')
    return await this.publicationStatsService.getPledgePlans()
  }

  async pledgePlansSummary(): Promise<PledgePlansSummary> {
    this.requireAuth('pledgePlansSummary')
    this.requirePublication('pledgePlansSummary')
    return await this.publicationStatsService.getPledgePlansSummary()
  }

  async publicationSettings(): Promise<PublicationSettings> {
    this.requireAuth('publicationSettings')
    this.requirePublication('publicationSettings')
    return await this.publicationStatsService.getPublicationSettings()
  }

  async bestsellerTier(): Promise<BestsellerTier> {
    this.requireAuth('bestsellerTier')
    this.requirePublication('bestsellerTier')
    return await this.publicationStatsService.getBestsellerTier()
  }

  // ── Dashboard methods (require auth) ────────────────────────────────

  async dashboardSummary(options?: { range?: number }): Promise<DashboardSummary> {
    this.requireAuth('dashboardSummary')
    this.requirePublication('dashboardSummary')
    return await this.dashboardService.getDashboardSummary(options)
  }

  async emailsTimeseries(options: { from: string }): Promise<EmailsTimeseries> {
    this.requireAuth('emailsTimeseries')
    this.requirePublication('emailsTimeseries')
    return await this.dashboardService.getEmailsTimeseries(options)
  }

  async unreadActivity(): Promise<UnreadActivity> {
    this.requireAuth('unreadActivity')
    this.requirePublication('unreadActivity')
    return await this.dashboardService.getUnreadActivity()
  }

  async unreadMessageCount(): Promise<UnreadMessageCount> {
    this.requireAuth('unreadMessageCount')
    this.requirePublication('unreadMessageCount')
    return await this.dashboardService.getUnreadMessageCount()
  }

  // ── Recommendation methods (require auth) ───────────────────────────

  async outgoingRecommendations(publicationId: number): Promise<SubstackRecommendation[]> {
    this.requireAuth('outgoingRecommendations')
    this.requirePublication('outgoingRecommendations')
    return await this.recommendationService.getOutgoingRecommendations(publicationId)
  }

  async outgoingRecommendationsPaginated(
    publicationId: number,
    options?: { offset?: number; limit?: number; paginate?: boolean }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Promise<any> {
    this.requireAuth('outgoingRecommendationsPaginated')
    this.requirePublication('outgoingRecommendationsPaginated')
    return await this.recommendationService.getOutgoingRecommendationsPaginated(
      publicationId,
      options
    )
  }

  async outgoingRecommendationStats(options?: {
    offset?: number
    limit?: number
    orderBy?: string
    orderDirection?: string
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  }): Promise<any> {
    this.requireAuth('outgoingRecommendationStats')
    this.requirePublication('outgoingRecommendationStats')
    return await this.recommendationService.getOutgoingRecommendationStats(options)
  }

  async incomingRecommendationStats(options?: {
    offset?: number
    limit?: number
    orderBy?: string
    orderDirection?: string
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  }): Promise<any> {
    this.requireAuth('incomingRecommendationStats')
    this.requirePublication('incomingRecommendationStats')
    return await this.recommendationService.getIncomingRecommendationStats(options)
  }

  async recommendationsExist(): Promise<SubstackRecommendationsExist> {
    this.requireAuth('recommendationsExist')
    this.requirePublication('recommendationsExist')
    return await this.recommendationService.recommendationsExist()
  }

  async suggestedRecommendations(
    publicationId: number
  ): Promise<SubstackSuggestedRecommendation[]> {
    this.requireAuth('suggestedRecommendations')
    this.requirePublication('suggestedRecommendations')
    return await this.recommendationService.getSuggestedRecommendations(publicationId)
  }

  // ── Chat methods (require auth) ────────────────────────────────────

  async chatUnreadCount(): Promise<UnreadCount> {
    this.requireAuth('chatUnreadCount')
    return await this.chatService.getUnreadCount()
  }

  async chatInbox(options?: { tab?: 'all' | 'people' }): Promise<InboxResponse> {
    this.requireAuth('chatInbox')
    return await this.chatService.getInbox(options)
  }

  async chatMarkInboxSeen(): Promise<{ ok: boolean }> {
    this.requireAuth('chatMarkInboxSeen')
    return await this.chatService.markInboxSeen()
  }

  async chatDm(uuid: string, options?: { cursor?: string }): Promise<DmResponse> {
    this.requireAuth('chatDm')
    return await this.chatService.getDm(uuid, options)
  }

  async chatSendMessage(
    uuid: string,
    body: string,
    options?: { clientId?: string }
  ): Promise<SendMessageResponse> {
    this.requireAuth('chatSendMessage')
    return await this.chatService.sendMessage(uuid, body, options)
  }

  async chatMarkDmSeen(uuid: string): Promise<{ ok: boolean }> {
    this.requireAuth('chatMarkDmSeen')
    return await this.chatService.markDmSeen(uuid)
  }

  async chatInvites(): Promise<InvitesResponse> {
    this.requireAuth('chatInvites')
    return await this.chatService.getInvites()
  }

  async chatMarkInvitesSeen(): Promise<{ ok: boolean }> {
    this.requireAuth('chatMarkInvitesSeen')
    return await this.chatService.markInvitesSeen()
  }

  async chatReactions(): Promise<ReactionsResponse> {
    this.requireAuth('chatReactions')
    return await this.chatService.getReactions()
  }

  async chatRealtimeToken(channel: string): Promise<RealtimeTokenResponse> {
    this.requireAuth('chatRealtimeToken')
    return await this.chatService.getRealtimeToken(channel)
  }

  async *chatInboxThreads(
    options: { tab?: 'all' | 'people'; limit?: number } = {}
  ): AsyncGenerator<ChatThread> {
    this.requireAuth('chatInboxThreads')
    yield* this.chatService.inboxThreads(options)
  }

  async *chatDmMessages(
    uuid: string,
    options: { limit?: number } = {}
  ): AsyncGenerator<ChatMessage> {
    this.requireAuth('chatDmMessages')
    yield* this.chatService.dmMessages(uuid, options)
  }

  // ── Private helpers ────────────────────────────────────────────────

  private buildEntityDeps(): EntityDeps {
    return {
      publicationClient: this.publicationClient,
      profileService: this.profileService,
      postService: this.postService,
      noteService: this.noteService,
      commentService: this.commentService,
      followingService: this.followingService,
      newNoteService: this.newNoteService,
      perPage: this.perPage
    }
  }

  /**
   * Generic cursor-based pagination for feed endpoints.
   * Eliminates duplicated pagination loop logic.
   */
  private async *paginateFeed(
    fetcher: (cursor?: string) => Promise<{ items: FeedItem[]; nextCursor: string | null }>,
    limit?: number
  ): AsyncGenerator<FeedItem> {
    let cursor: string | undefined
    let totalYielded = 0

    while (true) {
      const result = await fetcher(cursor)

      for (const item of result.items) {
        if (limit && totalYielded >= limit) return
        yield item
        totalYielded++
      }

      if (!result.nextCursor) break
      cursor = result.nextCursor
    }
  }

  /**
   * Generic offset-based pagination for publication endpoints.
   * Eliminates duplicated offset-pagination loop logic.
   */
  private async *paginateOffset(
    fetcher: (offset: number, limit: number) => Promise<SubstackPublicationPost[]>,
    limit?: number
  ): AsyncGenerator<PublicationPost> {
    let offset = 0
    let totalYielded = 0
    const batchSize = this.perPage

    while (true) {
      const items = await fetcher(offset, batchSize)

      for (const item of items) {
        if (limit && totalYielded >= limit) return
        yield new PublicationPost(item)
        totalYielded++
      }

      if (items.length < batchSize) break
      offset += batchSize
    }
  }
}
