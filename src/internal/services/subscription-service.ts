import type { HttpClient } from '@substack-api/internal/http-client'

export class SubscriptionService {
  constructor(
    private readonly publicationClient: HttpClient,
    private readonly substackClient: HttpClient
  ) {}

  async getCurrentSubscription(): Promise<unknown> {
    return await this.publicationClient.get<unknown>('/subscription')
  }

  async getAllSubscriptions(options?: { offset?: number; limit?: number }): Promise<unknown> {
    const offset = options?.offset ?? 0
    const limit = options?.limit ?? 25
    return await this.substackClient.get<unknown>(`/subscriptions/page_v2?offset=${offset}&limit=${limit}`)
  }
}
