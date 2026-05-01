/**
 * Legacy DiscoveryService — delegates to split services.
 *
 * This file exists for backward compatibility during the transition.
 * New code should use FeedService, SearchService, ProfileActivityService,
 * or CategoryService directly.
 *
 * @deprecated Use FeedService, SearchService, ProfileActivityService, or CategoryService
 */
import type { HttpClient } from '@substack-api/internal/http-client'
import { FeedService } from '@substack-api/internal/services/feed-service'
import { SearchService } from '@substack-api/internal/services/search-service'
import { ProfileActivityService } from '@substack-api/internal/services/profile-activity-service'
import { CategoryService } from '@substack-api/internal/services/category-service'
import type {
  FeedTab,
  ProfileFeedTab,
  ActivityFeedTab
} from '@substack-api/internal/services/feed-types'
import type {
  FeedItem,
  SubstackInboxItem,
  SubstackCategory,
  SubstackCategoryPublication,
  SubstackProfileSearchResult,
  SubstackTrendingResponse
} from '@substack-api/internal/types'

export type { FeedTab, ProfileFeedTab, ActivityFeedTab }

/**
 * @deprecated Use FeedService, SearchService, ProfileActivityService, or CategoryService
 */
export class DiscoveryService {
  private readonly feedService: FeedService
  private readonly searchService: SearchService
  private readonly profileActivityService: ProfileActivityService
  private readonly categoryService: CategoryService

  constructor(substackClient: HttpClient) {
    this.feedService = new FeedService(substackClient)
    this.searchService = new SearchService(substackClient)
    this.profileActivityService = new ProfileActivityService(substackClient)
    this.categoryService = new CategoryService(substackClient)
  }

  getTopPosts(): Promise<{ items: SubstackInboxItem[] }> {
    return this.feedService.getTopPosts()
  }

  getTrending(options?: { limit?: number; offset?: number }): Promise<SubstackTrendingResponse> {
    return this.feedService.getTrending(options) as Promise<SubstackTrendingResponse>
  }

  getFeed(options?: { tab?: FeedTab; tabId?: string; cursor?: string }): Promise<{
    items: FeedItem[]
    nextCursor: string | null
    tabs?: ActivityFeedTab[]
  }> {
    return this.feedService.getFeed(options)
  }

  getCategories(): Promise<SubstackCategory[]> {
    return this.categoryService.getCategories()
  }

  getProfileActivity(
    profileId: number,
    options?: { tab?: ProfileFeedTab; cursor?: string }
  ): Promise<{ items: FeedItem[]; nextCursor: string | null }> {
    return this.profileActivityService.getProfileActivity(profileId, options)
  }

  getPublicationFeed(
    publicationId: number,
    options?: { tab?: string; cursor?: string }
  ): Promise<{ items: FeedItem[]; nextCursor: string | null }> {
    return this.categoryService.getPublicationFeed(publicationId, options)
  }

  getProfileLikes(
    profileId: number,
    options?: { cursor?: string }
  ): Promise<{ items: FeedItem[]; nextCursor: string | null }> {
    return this.profileActivityService.getProfileLikes(profileId, options)
  }

  getCategoryPublications(
    categoryId: number | string,
    options?: { limit?: number; offset?: number }
  ): Promise<{ publications: SubstackCategoryPublication[]; more: boolean }> {
    return this.categoryService.getCategoryPublications(categoryId, options)
  }

  search(
    query: string,
    options?: { cursor?: string }
  ): Promise<{ items: FeedItem[]; nextCursor: string | null }> {
    return this.searchService.search(query, options)
  }

  searchProfiles(
    query: string,
    options?: { page?: number }
  ): Promise<{ results: SubstackProfileSearchResult[]; more: boolean }> {
    return this.searchService.searchProfiles(query, options)
  }

  exploreSearch(options?: {
    tab?: string
    cursor?: string
  }): Promise<{ items: FeedItem[]; nextCursor: string | null }> {
    return this.searchService.exploreSearch(options)
  }
}
