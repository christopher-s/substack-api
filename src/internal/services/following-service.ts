import type { HttpClient } from '@substack-api/internal/http-client'
import { SubscriberLists } from '@substack-api/internal/types'
import { decodeOrThrow } from '@substack-api/internal/validation'

export type FollowingUser = {
  id: number
  handle: string
}
/**
 * Service responsible for following-related HTTP operations
 * Returns internal types that can be transformed into domain models
 */
export class FollowingService {
  constructor(
    private readonly publicationClient: HttpClient,
    private readonly substackClient: HttpClient
  ) {}

  async getOwnId(): Promise<number> {
    const { user_id } = await this.substackClient.put<{ user_id: number }>('/user-setting', {
      type: 'last_home_tab',
      value_text: 'inbox'
    })
    return user_id
  }
  /**
   * Get users that the authenticated user follows
   * @returns Promise<FollowingUser[]> - Array of users that the authenticated user follows
   * @throws {Error} When following list cannot be retrieved
   */
  async getFollowing(): Promise<FollowingUser[]> {
    const userId = await this.getOwnId()
    const data = await this.publicationClient.get(
      `/user/${userId}/subscriber-lists?lists=following`
    )

    const lists = decodeOrThrow(SubscriberLists, data, 'Following list')
    return lists.subscriberLists[0].groups[0].users
  }
}
