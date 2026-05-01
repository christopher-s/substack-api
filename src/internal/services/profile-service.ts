import type { HttpClient } from '@substack-api/internal/http-client'
import {
  SubstackFullProfileCodec,
  SubstackUserProfileCodec,
  PotentialHandlesCodec
} from '@substack-api/internal/types'
import type { SubstackFullProfile, FeedItem } from '@substack-api/internal/types'
import { decodeOrThrow } from '@substack-api/internal/validation'
import type { ProfileFeedTab } from '@substack-api/internal/services/feed-types'
import { fetchCursorFeed } from '@substack-api/internal/services/feed-service'

/**
 * Service responsible for profile-related HTTP operations
 * Returns internal types that can be transformed into domain models
 */
export class ProfileService {
  constructor(private readonly substackClient: HttpClient) {}

  async getOwnSlug(): Promise<string> {
    const rawResponse = await this.substackClient.get<unknown>('/handle/options')
    const data = decodeOrThrow(PotentialHandlesCodec, rawResponse, 'Potential handles response')
    const existingHandle = data.potentialHandles.find((handle) => handle.type === 'existing')
    if (!existingHandle) {
      throw new Error('No existing handle found for authenticated user')
    }
    return existingHandle.handle
  }
  /**
   * Get authenticated user's own profile
   * @returns Promise<SubstackFullProfile> - Raw profile data from API
   * @throws {Error} When authentication fails or profile cannot be retrieved
   */
  async getOwnProfile(): Promise<SubstackFullProfile> {
    const ownSlug = await this.getOwnSlug()
    const rawResponse = await this.substackClient.get<unknown>(`/user/${ownSlug}/public_profile`)
    return decodeOrThrow(SubstackFullProfileCodec, rawResponse, 'Full profile response')
  }

  /**
   * Get a profile by user ID
   * @param id - The user ID
   * @returns Promise<SubstackFullProfile> - Raw profile data from API
   * @throws {Error} When profile is not found or API request fails
   */
  async getProfileById(id: number): Promise<SubstackFullProfile> {
    const rawProfileFeed = await this.substackClient.get<unknown>(`/reader/feed/profile/${id}`)
    const profileFeed = decodeOrThrow(
      SubstackUserProfileCodec,
      rawProfileFeed,
      'User profile feed response'
    )

    for (const item of profileFeed.items) {
      if (item.context?.users.length > 0) {
        for (const user of item.context.users) {
          if (user.id === id) {
            return await this.getProfileBySlug(user.handle)
          }
        }
      }
    }

    throw new Error(`Profile with ID ${id} not found`)
  }

  /**
   * Get a profile by handle/slug
   * @param slug - The user handle/slug
   * @returns Promise<SubstackFullProfile> - Raw profile data from API
   * @throws {Error} When profile is not found or API request fails
   */
  async getProfileBySlug(slug: string): Promise<SubstackFullProfile> {
    if (!/^[a-zA-Z0-9_-]+$/.test(slug)) {
      throw new Error(
        'Invalid slug format: slug must contain only alphanumeric characters, hyphens, and underscores'
      )
    }
    const rawResponse = await this.substackClient.get<unknown>(`/user/${slug}/public_profile`)
    return decodeOrThrow(SubstackFullProfileCodec, rawResponse, 'Full profile response')
  }

  // ── Methods merged from ProfileActivityService ──────────────────────

  /**
   * Get profile activity feed
   * GET /api/v1/reader/feed/profile/{id} (anonymous, paginated)
   */
  async getProfileActivity(
    profileId: number,
    options?: { tab?: ProfileFeedTab; cursor?: string }
  ): Promise<{ items: FeedItem[]; nextCursor: string | null }> {
    const params = new URLSearchParams()
    if (options?.tab) params.set('tab', options.tab)
    if (options?.cursor) params.set('cursor', options.cursor)
    const query = params.toString() ? `?${params.toString()}` : ''
    return fetchCursorFeed(
      this.substackClient,
      `/reader/feed/profile/${encodeURIComponent(String(profileId))}${query}`
    )
  }

  /**
   * Get profile likes feed
   * GET /api/v1/reader/feed/profile/{id}?types[]=like (anonymous, paginated)
   */
  async getProfileLikes(
    profileId: number,
    options?: { cursor?: string }
  ): Promise<{ items: FeedItem[]; nextCursor: string | null }> {
    const params = new URLSearchParams()
    params.append('types[]', 'like')
    if (options?.cursor) params.set('cursor', options.cursor)
    return fetchCursorFeed(
      this.substackClient,
      `/reader/feed/profile/${encodeURIComponent(String(profileId))}?${params.toString()}`
    )
  }
}
