import { PublicationPost } from '@substack-api/domain'
import type {
  PublicationService,
  CategoryService,
  PublicationDetailService,
  PostManagementService,
  SubscriptionService,
  NoteService
} from '@substack-api/internal/services'
import type {
  FeedItem,
  SubstackFacepile,
  SubstackLiveStreamResponse,
  SubstackPublicationExport,
  SubstackPublicationSearchResponse,
  SubstackPublicationDetail,
  SubstackPostTag,
  SubstackLiveStreamList,
  SubstackEligibleHosts,
  SubstackPostManagementResponse,
  SubstackPostManagementCounts,
  SubstackDraftPost,
  SubstackDeleteResponse,
  SubstackSubscription,
  SubstackSubscriptionsResponse,
  SubstackNoteStats
} from '@substack-api/internal/types'
import { paginateFeed, paginateOffset } from '@substack-api/sub-clients/pagination'

/**
 * Sub-client for publication-related operations.
 * Includes publication content, notes, subscriptions, and post management.
 */
export class PublicationClient {
  constructor(
    private readonly publicationService: PublicationService,
    private readonly categoryService: CategoryService,
    private readonly publicationDetailService: PublicationDetailService,
    private readonly postManagementService: PostManagementService,
    private readonly subscriptionService: SubscriptionService,
    private readonly noteService: NoteService,
    private readonly perPage: number
  ) {}

  async *publicationArchive(
    options: { sort?: 'top' | 'new'; limit?: number } = {}
  ): AsyncGenerator<PublicationPost> {
    yield* paginateOffset(
      (offset, limit) => this.publicationService.getArchive({ sort: options.sort, offset, limit }),
      this.perPage,
      options.limit,
      (item) => new PublicationPost(item)
    )
  }

  async *publicationPosts(options: { limit?: number } = {}): AsyncGenerator<PublicationPost> {
    yield* paginateOffset(
      (offset, limit) => this.publicationService.getPosts({ offset, limit }),
      this.perPage,
      options.limit,
      (item) => new PublicationPost(item)
    )
  }

  async publicationHomepage(): Promise<PublicationPost[]> {
    const result = await this.publicationService.getHomepageData()
    return result.newPosts.map((post) => new PublicationPost(post))
  }

  async postReactors(postId: number): Promise<SubstackFacepile> {
    return await this.publicationService.getPostFacepile(postId)
  }

  async activeLiveStream(publicationId: number): Promise<SubstackLiveStreamResponse> {
    return await this.publicationService.getActiveLiveStream(publicationId)
  }

  async markPostSeen(postId: number): Promise<void> {
    await this.publicationService.markPostSeen(postId)
  }

  async publicationExport(): Promise<SubstackPublicationExport[]> {
    return await this.publicationService.getPublicationExport()
  }

  async publicationSearch(
    query: string,
    options?: { limit?: number }
  ): Promise<SubstackPublicationSearchResponse> {
    return await this.publicationService.searchPublications(query, options)
  }

  async *publicationFeed(
    publicationId: number,
    options: { tab?: string; limit?: number } = {}
  ): AsyncGenerator<FeedItem> {
    yield* paginateFeed(
      (cursor) =>
        this.categoryService.getPublicationFeed(publicationId, { tab: options.tab, cursor }),
      options.limit
    )
  }

  async publicationDetails(): Promise<SubstackPublicationDetail> {
    return await this.publicationDetailService.getPublicationDetails()
  }

  async publicationTags(): Promise<SubstackPostTag[]> {
    return await this.publicationDetailService.getPostTags()
  }

  async liveStreams(status?: string): Promise<SubstackLiveStreamList> {
    return await this.publicationService.getLiveStreams(status)
  }

  async eligibleHosts(publicationId: number): Promise<SubstackEligibleHosts> {
    return await this.publicationService.getEligibleHosts(publicationId)
  }

  async publishedPosts(options?: {
    offset?: number
    limit?: number
  }): Promise<SubstackPostManagementResponse> {
    return await this.postManagementService.getPublishedPosts(options)
  }

  async drafts(options?: {
    offset?: number
    limit?: number
  }): Promise<SubstackPostManagementResponse> {
    return await this.postManagementService.getDrafts(options)
  }

  async scheduledPosts(options?: {
    offset?: number
    limit?: number
  }): Promise<SubstackPostManagementResponse> {
    return await this.postManagementService.getScheduledPosts(options)
  }

  async postCounts(query?: string): Promise<SubstackPostManagementCounts> {
    return await this.postManagementService.getPostCounts(query)
  }

  async draft(id: number): Promise<SubstackDraftPost> {
    return await this.postManagementService.getDraft(id)
  }

  async createDraft(data: {
    title: string
    body?: string
    type?: string
    audience?: string
    bylineUserId?: number
  }): Promise<SubstackDraftPost> {
    return await this.postManagementService.createDraft(data)
  }

  async updateDraft(
    id: number,
    data: { title?: string; body?: string; type?: string; audience?: string; bylineUserId?: number }
  ): Promise<SubstackDraftPost> {
    return await this.postManagementService.updateDraft(id, data)
  }

  async publishDraft(id: number): Promise<SubstackDraftPost> {
    return await this.postManagementService.publishDraft(id)
  }

  async deleteDraft(id: number): Promise<SubstackDeleteResponse> {
    return await this.postManagementService.deleteDraft(id)
  }

  async subscription(): Promise<SubstackSubscription> {
    return await this.subscriptionService.getCurrentSubscription()
  }

  async subscriptions(options?: {
    offset?: number
    limit?: number
  }): Promise<SubstackSubscriptionsResponse> {
    return await this.subscriptionService.getAllSubscriptions(options)
  }

  async *notesFeed(options: { limit?: number } = {}): AsyncGenerator<unknown> {
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
    return await this.noteService.getNoteStats(entityKey)
  }

  async restackNote(noteId: number): Promise<void> {
    await this.noteService.restackNote(noteId)
  }

  async unrestackNote(noteId: number): Promise<void> {
    await this.noteService.unrestackNote(noteId)
  }

  async likeNote(noteId: number): Promise<void> {
    await this.noteService.likeNote(noteId)
  }

  async unlikeNote(noteId: number): Promise<void> {
    await this.noteService.unlikeNote(noteId)
  }
}
