import type { HttpClient } from '@substack-api/internal/http-client'
import type { FeedItem } from '@substack-api/internal/types'
import type { ProfileFeedTab } from '@substack-api/internal/services/feed-types'
import { fetchCursorFeed } from '@substack-api/internal/services/cursor-feed'

/**
 * Service for profile activity feed endpoints.
 */
export class ProfileActivityService {
  constructor(private readonly substackClient: HttpClient) {}

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
