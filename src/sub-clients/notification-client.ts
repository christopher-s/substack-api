import type { ChatService } from '@substack-api/internal/services'
import type { SubstackNotificationsResponse } from '@substack-api/internal/types'

/**
 * Sub-client for notification operations.
 */
export class NotificationClient {
  constructor(private readonly chatService: ChatService) {}

  async getNotifications(): Promise<SubstackNotificationsResponse> {
    return await this.chatService.getNotifications()
  }

  async markNotificationsSeen(): Promise<void> {
    await this.chatService.markNotificationsSeen()
  }
}
