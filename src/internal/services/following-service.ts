import type { HttpClient } from '@substack-api/internal/http-client'
import {
  SubscriberLists,
  PotentialHandlesCodec,
  SubstackFullProfileCodec
} from '@substack-api/internal/types'
import { decodeOrThrow } from '@substack-api/internal/validation'

type FollowingUser = {
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
    const rawHandles = await this.substackClient.get<unknown>('/handle/options')
    const handles = decodeOrThrow(PotentialHandlesCodec, rawHandles, 'Potential handles response')
    const existing = handles.potentialHandles.find((h) => h.type === 'existing')
    if (!existing) {
      throw new Error('No existing handle found for authenticated user')
    }
    const rawProfile = await this.substackClient.get<unknown>(
      `/user/${existing.handle}/public_profile`
    )
    const profile = decodeOrThrow(SubstackFullProfileCodec, rawProfile, 'Full profile response')
    return profile.id
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
