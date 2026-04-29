import type { HttpClient } from '@substack-api/internal/http-client'

export class SubscriberStatsService {
  constructor(
    private readonly publicationClient: HttpClient,
    private readonly substackClient: HttpClient
  ) {}

  async getSubscriberStats(): Promise<unknown> {
    return await this.publicationClient.post<unknown>('/subscriber-stats')
  }

  async getSubscriptionsPage(options?: { cursor?: string }): Promise<unknown> {
    const cursor = options?.cursor
    const params = new URLSearchParams()
    if (cursor) params.set('cursor', cursor)
    const path = cursor
      ? `/subscriptions/page_v2?${params.toString()}`
      : '/subscriptions/page_v2'
    return await this.substackClient.get<unknown>(path)
  }
}
