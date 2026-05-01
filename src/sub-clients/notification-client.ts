import type { NotificationService } from '@substack-api/internal/services'
import type { SubstackNotificationsResponse } from '@substack-api/internal/types'

/**
 * Sub-client for notification operations.
 */
export class NotificationClient {
  constructor(private readonly notificationService: NotificationService) {}

  async getNotifications(): Promise<SubstackNotificationsResponse> {
    return await this.notificationService.getNotifications()
  }

  async markNotificationsSeen(): Promise<void> {
    await this.notificationService.markNotificationsSeen()
  }
}
