import type { HttpClient } from '@substack-api/internal/http-client'
import type { SubstackNotificationsResponse } from '@substack-api/internal/types'
import { SubstackNotificationsResponseCodec } from '@substack-api/internal/types'
import { decodeOrThrow } from '@substack-api/internal/validation'

/**
 * Service responsible for notification-related HTTP operations
 */
export class NotificationService {
  constructor(private readonly substackClient: HttpClient) {}

  async getNotifications(options?: { cursor?: string }): Promise<SubstackNotificationsResponse> {
    const url = options?.cursor
      ? `/notifications?cursor=${encodeURIComponent(options.cursor)}`
      : '/notifications'
    const response = await this.substackClient.get<unknown>(url)
    return decodeOrThrow(SubstackNotificationsResponseCodec, response, 'Notifications response')
  }

  async markNotificationsSeen(): Promise<void> {
    await this.substackClient.post('/notifications/seen')
  }
}
