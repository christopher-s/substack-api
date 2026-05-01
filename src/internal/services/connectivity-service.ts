import type { HttpClient } from '@substack-api/internal/http-client'
import type { FollowingService } from '@substack-api/internal/services/following-service'
import { AxiosError } from 'axios'

export type ConnectivityResult =
  | { connected: true }
  | { connected: false; reason: 'auth' | 'network' }

/**
 * Service responsible for checking API connectivity and session validity
 * Uses FollowingService.getOwnId (which calls /handle/options + /user/{slug}/public_profile)
 * as a lightweight authenticated read probe.
 */
export class ConnectivityService {
  constructor(
    private readonly substackClient: HttpClient,
    private readonly followingService: FollowingService
  ) {}

  /**
   * Check if the API is connected and accessible
   * Delegates to FollowingService.getOwnId to avoid duplicate /user-setting writes.
   * @returns ConnectivityResult - { connected: true } or { connected: false, reason: 'auth' | 'network' }
   */
  async isConnected(): Promise<ConnectivityResult> {
    try {
      await this.followingService.getOwnId()
      return { connected: true }
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 401) {
        return { connected: false, reason: 'auth' }
      }
      return { connected: false, reason: 'network' }
    }
  }
}
