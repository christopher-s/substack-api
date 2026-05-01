import { PublicationPost, Category } from '@substack-api/domain'
import type {
  PublicationService,
  CategoryService,
  PostManagementService,
  NoteService,
  SettingsService
} from '@substack-api/internal/services'
import { markdownToHtml } from '@substack-api/internal/markdown-to-html'
import { getErrorMessage } from '@substack-api/internal/validation'
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
  SubstackNoteStats,
  SubstackCategoryPublication,
  PublisherSettingsDetail,
  SubstackPublicationUserRole,
  SubstackPublicationSection,
  SubstackSubscriptionSettings,
  SubstackBoostSettings
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
    private readonly postManagementService: PostManagementService,
    private readonly noteService: NoteService,
    private readonly perPage: number,
    private readonly settingsService?: SettingsService
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
    return await this.publicationService.getPublicationDetails()
  }

  async publicationTags(): Promise<SubstackPostTag[]> {
    return await this.publicationService.getPostTags()
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
    return await this.publicationService.getCurrentSubscription()
  }

  async subscriptions(options?: {
    offset?: number
    limit?: number
  }): Promise<SubstackSubscriptionsResponse> {
    return await this.publicationService.getAllSubscriptions(options)
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

  async createDraftFromMarkdown(
    markdown: string,
    options?: {
      title?: string
      type?: string
      audience?: string
      bylineUserId?: number
    }
  ): Promise<SubstackDraftPost> {
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
      throw new Error(`Failed to create draft from markdown: ${getErrorMessage(error)}`, {
        cause: error
      })
    }
  }

  async publisherSettings(): Promise<PublisherSettingsDetail> {
    if (!this.settingsService) throw new Error('Settings service not available')
    return await this.settingsService.getPublisherSettings()
  }

  async publicationUser(): Promise<SubstackPublicationUserRole> {
    if (!this.settingsService) throw new Error('Settings service not available')
    return await this.settingsService.getPublicationUser()
  }

  async sections(): Promise<SubstackPublicationSection[]> {
    if (!this.settingsService) throw new Error('Settings service not available')
    return await this.settingsService.getSections()
  }

  async subscriptionSettings(): Promise<SubstackSubscriptionSettings> {
    if (!this.settingsService) throw new Error('Settings service not available')
    return await this.settingsService.getSubscription()
  }

  async boostSettings(): Promise<SubstackBoostSettings> {
    if (!this.settingsService) throw new Error('Settings service not available')
    return await this.settingsService.getBoostSettings()
  }

  async categories(): Promise<Category[]> {
    const rawCategories = await this.categoryService.getCategories()
    return rawCategories.map((cat) => new Category(cat))
  }

  async categoryPublications(
    categoryId: number | string,
    options?: { limit?: number; offset?: number }
  ): Promise<{ publications: SubstackCategoryPublication[]; more: boolean }> {
    return await this.categoryService.getCategoryPublications(categoryId, options)
  }
}
