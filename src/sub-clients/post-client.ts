import { FullPost } from '@substack-api/domain'
import type { PostService, FeedService } from '@substack-api/internal/services'
import type { PublicationService } from '@substack-api/internal/services'
import type {
  FeedItem,
  SubstackInboxItem,
  SubstackTrendingResponse,
  SubstackPreviewPost
} from '@substack-api/internal/types'
import type { FeedTab, ActivityFeedTab } from '@substack-api/internal/services/feed-types'
import type { EntityDeps } from '@substack-api/domain/entity-deps'
import { paginateFeed } from '@substack-api/sub-clients/pagination'

/**
 * Sub-client for post and feed-related operations.
 */
export class PostClient {
  constructor(
    private readonly postService: PostService,
    private readonly feedService: FeedService,
    private readonly publicationService: PublicationService,
    private readonly buildEntityDeps: () => EntityDeps,
    private readonly perPage: number
  ) {}

  async postForId(id: number): Promise<FullPost> {
    const post = await this.postService.getPostById(id)
    return new FullPost(post, this.buildEntityDeps())
  }

  async topPosts(): Promise<SubstackInboxItem[]> {
    const result = await this.feedService.getTopPosts()
    return result.items
  }

  async trending(options?: { limit?: number }): Promise<SubstackTrendingResponse> {
    return (await this.feedService.getTrending(options)) as unknown as SubstackTrendingResponse
  }

  async *trendingFeed(options: { limit?: number } = {}): AsyncGenerator<SubstackTrendingResponse> {
    let offset = 0
    const batchSize = options.limit || this.perPage

    while (true) {
      const response = (await this.feedService.getTrending({
        limit: batchSize,
        offset
      })) as unknown as SubstackTrendingResponse
      yield response
      if (response.posts.length < batchSize) break
      offset += batchSize
    }
  }

  async *discoverFeed(options: { tab?: FeedTab; limit?: number } = {}): AsyncGenerator<FeedItem> {
    yield* paginateFeed(
      (cursor) => this.feedService.getFeed({ tab: options.tab, cursor }),
      options.limit
    )
  }

  async *activityFeed(
    options: { tabId?: string; limit?: number; onTabs?: (tabs: ActivityFeedTab[]) => void } = {}
  ): AsyncGenerator<FeedItem> {
    let tabsDelivered = false
    yield* paginateFeed(async (cursor) => {
      const result = await this.feedService.getFeed({ tabId: options.tabId, cursor })
      if (!tabsDelivered && result.tabs && options.onTabs) {
        options.onTabs(result.tabs)
        tabsDelivered = true
      }
      return result
    }, options.limit)
  }

  async likePost(postId: number): Promise<void> {
    await this.postService.likePost(postId)
  }

  async unlikePost(postId: number): Promise<void> {
    await this.postService.unlikePost(postId)
  }

  async getReadingList(): Promise<SubstackPreviewPost[]> {
    return await this.postService.getReadingList()
  }

  async savePost(postId: number): Promise<void> {
    await this.postService.savePost(postId)
  }

  async unsavePost(postId: number): Promise<void> {
    await this.postService.unsavePost(postId)
  }
}
