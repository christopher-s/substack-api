import type { HttpClient } from '@substack-api/internal/http-client'

/**
 * Service responsible for publication statistics HTTP operations
 * Returns raw API responses for publication analytics endpoints
 */
export class PublicationStatsService {
  constructor(private readonly publicationClient: HttpClient) {}

  // Network tab

  async getNetworkAttribution(options?: {
    timeWindow?: string
    isSubscribed?: boolean
  }): Promise<unknown> {
    const params = new URLSearchParams()
    params.set('time_window', options?.timeWindow ?? '90+days')
    params.set('is_subscribed', String(options?.isSubscribed ?? false))
    return await this.publicationClient.get<unknown>(
      `/publication/stats/network_attribution?${params.toString()}`
    )
  }

  // Audience tab

  async getFollowerTimeseries(options: { from: string }): Promise<unknown> {
    const params = new URLSearchParams()
    params.set('from', options.from)
    return await this.publicationClient.get<unknown>(
      `/publication/stats/followers/timeseries?${params.toString()}`
    )
  }

  async getAudienceLocation(options?: { metric?: string; granularity?: string }): Promise<unknown> {
    const params = new URLSearchParams()
    params.set('metric', options?.metric ?? 'free+signups')
    params.set('granularity', options?.granularity ?? 'usa')
    return await this.publicationClient.get<unknown>(
      `/publication/stats/audience_insights/location?${params.toString()}`
    )
  }

  async getAudienceLocationTotal(): Promise<unknown> {
    return await this.publicationClient.get<unknown>(
      '/publication/stats/audience_insights/location/total'
    )
  }

  async getAudienceOverlap(options?: { limit?: number }): Promise<unknown> {
    const params = new URLSearchParams()
    params.set('limit', String(options?.limit ?? 6))
    return await this.publicationClient.get<unknown>(
      `/publication/stats/audience_insights/overlap?${params.toString()}`
    )
  }

  // Traffic tab

  async getTraffic30dViews(): Promise<unknown> {
    return await this.publicationClient.get<unknown>(
      '/publication/stats/publication_traffic/30d_views'
    )
  }

  async getVisitorSources(options: {
    fromDate: string
    toDate: string
    offset?: number
    limit?: number
    orderBy?: string
    orderDirection?: string
  }): Promise<unknown> {
    const params = new URLSearchParams()
    params.set('from_date', options.fromDate)
    params.set('to_date', options.toDate)
    params.set('offset', String(options.offset ?? 0))
    params.set('limit', String(options.limit ?? 20))
    params.set('order_by', options.orderBy ?? 'views')
    params.set('order_direction', options.orderDirection ?? 'desc')
    return await this.publicationClient.get<unknown>(
      `/publication/stats/visitor_sources?${params.toString()}`
    )
  }

  async getTrafficTimeseries(options: {
    from: string
    to: string
    category?: string
  }): Promise<unknown> {
    const params = new URLSearchParams()
    params.set('from', options.from)
    params.set('to', options.to)
    if (options.category) {
      params.set('category', options.category)
    }
    return await this.publicationClient.get<unknown>(
      `/publication/stats/publication_traffic/timeseries?${params.toString()}`
    )
  }

  // Posts tab

  async getEmail30dOpenRate(): Promise<unknown> {
    return await this.publicationClient.get<unknown>('/publication/stats/email_stats/30d_open_rate')
  }

  async getEmailStats(options?: {
    offset?: number
    limit?: number
    orderBy?: string
    orderDirection?: string
  }): Promise<unknown> {
    const params = new URLSearchParams()
    params.set('offset', String(options?.offset ?? 0))
    params.set('limit', String(options?.limit ?? 20))
    params.set('order_by', options?.orderBy ?? 'post_date')
    params.set('order_direction', options?.orderDirection ?? 'desc')
    return await this.publicationClient.get<unknown>(
      `/publication/stats/email_stats?${params.toString()}`
    )
  }

  // Pledges tab

  async getPledgeSummary(): Promise<unknown> {
    return await this.publicationClient.get<unknown>('/publication/stats/payment_pledges/summary')
  }

  async getPledges(options?: { limit?: number }): Promise<unknown> {
    const params = new URLSearchParams()
    params.set('limit', String(options?.limit ?? 20))
    return await this.publicationClient.get<unknown>(
      `/publication/stats/payment_pledges?${params.toString()}`
    )
  }

  // Sharing tab

  async getReaderReferrals(options: {
    to: string
    offset?: number
    limit?: number
    orderBy?: string
    orderDirection?: string
  }): Promise<unknown> {
    const params = new URLSearchParams()
    params.set('to', options.to)
    params.set('offset', String(options.offset ?? 0))
    params.set('limit', String(options.limit ?? 20))
    params.set('order_by', options.orderBy ?? 'visitors')
    params.set('order_direction', options.orderDirection ?? 'desc')
    return await this.publicationClient.get<unknown>(
      `/publication/stats/reader-referrals?${params.toString()}`
    )
  }

  // Settings & Plans

  async getPledgePlans(): Promise<unknown> {
    return await this.publicationClient.get<unknown>('/pledges/plans')
  }

  async getPledgePlansSummary(): Promise<unknown> {
    return await this.publicationClient.get<unknown>('/pledges/plans/summary')
  }

  async getPublicationSettings(): Promise<unknown> {
    return await this.publicationClient.get<unknown>('/publication_settings')
  }

  async getBestsellerTier(): Promise<unknown> {
    return await this.publicationClient.get<unknown>('/publication/bestseller_tier')
  }
}
