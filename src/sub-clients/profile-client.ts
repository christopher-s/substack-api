import { Profile, OwnProfile } from '@substack-api/domain'
import type {
  ProfileService,
  SearchService,
  ProfileActivityService
} from '@substack-api/internal/services'
import type { FeedItem, SubstackProfileSearchResult } from '@substack-api/internal/types'
import type { ProfileFeedTab } from '@substack-api/internal/services/feed-types'
import type { EntityDeps } from '@substack-api/domain/entity-deps'
import { paginateFeed } from '@substack-api/sub-clients/pagination'

/**
 * Sub-client for profile-related operations.
 */
export class ProfileClient {
  constructor(
    private readonly profileService: ProfileService,
    private readonly searchService: SearchService,
    private readonly profileActivityService: ProfileActivityService,
    private readonly buildEntityDeps: () => EntityDeps
  ) {}

  async profileForSlug(slug: string): Promise<Profile> {
    const profile = await this.profileService.getProfileBySlug(slug)
    return new Profile(profile, this.buildEntityDeps(), profile.handle)
  }

  async profileForId(id: number): Promise<Profile> {
    const profile = await this.profileService.getProfileById(id)
    return new Profile(profile, this.buildEntityDeps(), profile.handle)
  }

  async ownProfile(): Promise<OwnProfile> {
    const profile = await this.profileService.getOwnProfile()
    return new OwnProfile(profile, this.buildEntityDeps(), profile.handle)
  }

  async profileSearch(
    query: string,
    options?: { page?: number }
  ): Promise<{ results: SubstackProfileSearchResult[]; more: boolean }> {
    return this.searchService.searchProfiles(query, options)
  }

  async *profileSearchAll(
    query: string,
    options: { limit?: number } = {}
  ): AsyncGenerator<SubstackProfileSearchResult> {
    let page = 1
    let totalYielded = 0
    while (true) {
      const response = await this.searchService.searchProfiles(query, { page })
      for (const result of response.results) {
        if (options.limit && totalYielded >= options.limit) return
        yield result
        totalYielded++
      }
      if (!response.more) break
      page++
    }
  }

  async *profileActivity(
    profileId: number,
    options: { tab?: ProfileFeedTab; limit?: number } = {}
  ): AsyncGenerator<FeedItem> {
    yield* paginateFeed(
      (cursor) =>
        this.profileActivityService.getProfileActivity(profileId, { tab: options.tab, cursor }),
      options.limit
    )
  }

  async *profileLikes(
    profileId: number,
    options: { limit?: number } = {}
  ): AsyncGenerator<FeedItem> {
    yield* paginateFeed(
      (cursor) => this.profileActivityService.getProfileLikes(profileId, { cursor }),
      options.limit
    )
  }
}
