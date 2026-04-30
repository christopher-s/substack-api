import type { HttpClient } from '@substack-api/internal/http-client'
import { decodeOrThrow } from '@substack-api/internal/validation'
import {
  SubscriberStatsCodec,
  SubscriptionsPageCodec
} from '@substack-api/internal/types/subscriber-stats'
import type {
  SubscriberStats,
  SubscriptionsPage
} from '@substack-api/internal/types/subscriber-stats'

export class SubscriberStatsService {
  constructor(
    private readonly publicationClient: HttpClient,
    private readonly substackClient: HttpClient
  ) {}

  async getSubscriberStats(): Promise<SubscriberStats> {
    const response = await this.publicationClient.post<unknown>('/subscriber-stats')
    return decodeOrThrow(SubscriberStatsCodec, response, 'subscriber stats')
  }

  async getSubscriptionsPage(options?: { cursor?: string }): Promise<SubscriptionsPage> {
    const cursor = options?.cursor
    const params = new URLSearchParams()
    if (cursor) params.set('cursor', cursor)
    const path = cursor ? `/subscriptions/page_v2?${params.toString()}` : '/subscriptions/page_v2'
    const response = await this.substackClient.get<unknown>(path)
    return decodeOrThrow(SubscriptionsPageCodec, response, 'subscriptions page')
  }
}
