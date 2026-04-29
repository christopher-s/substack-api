import type { HttpClient } from '@substack-api/internal/http-client'
import type { FollowingService } from '@substack-api/internal/services/following-service'

/**
 * Service responsible for checking API connectivity and session validity
 * Provides a clean boolean indicator of whether the API is accessible
 */
export class ConnectivityService {
  constructor(
    private readonly substackClient: HttpClient,
    private readonly followingService: FollowingService
  ) {}

  /**
   * Check if the API is connected and accessible
   * Delegates to FollowingService.getOwnId to avoid duplicate /user-setting writes.
   * @returns Promise<boolean> - true if API is accessible, false otherwise
   */
  async isConnected(): Promise<boolean> {
    try {
      await this.followingService.getOwnId()
      return true
    } catch {
      return false
    }
  }
}
