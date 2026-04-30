import type { HttpClient } from '@substack-api/internal/http-client'
import type {
  SubstackSubscription,
  SubstackSubscriptionsResponse
} from '@substack-api/internal/types'
import {
  SubstackSubscriptionCodec,
  SubstackSubscriptionsResponseCodec
} from '@substack-api/internal/types'
import { decodeOrThrow } from '@substack-api/internal/validation'

export class SubscriptionService {
  constructor(
    private readonly publicationClient: HttpClient,
    private readonly substackClient: HttpClient
  ) {}

  async getCurrentSubscription(): Promise<SubstackSubscription> {
    const response = await this.publicationClient.get<unknown>('/subscription')
    return decodeOrThrow(SubstackSubscriptionCodec, response, 'Current subscription')
  }

  async getAllSubscriptions(options?: {
    offset?: number
    limit?: number
  }): Promise<SubstackSubscriptionsResponse> {
    const offset = options?.offset ?? 0
    const limit = options?.limit ?? 25
    const response = await this.substackClient.get<unknown>(
      `/subscriptions/page_v2?offset=${offset}&limit=${limit}`
    )
    return decodeOrThrow(SubstackSubscriptionsResponseCodec, response, 'All subscriptions')
  }
}
