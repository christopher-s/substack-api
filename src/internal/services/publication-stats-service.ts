import type { HttpClient } from '@substack-api/internal/http-client'
import { decodeOrThrow } from '@substack-api/internal/validation'
import {
  NetworkAttributionCodec,
  FollowerTimeseriesCodec,
  AudienceLocationCodec,
  AudienceLocationTotalCodec,
  AudienceOverlapCodec,
  Traffic30dViewsCodec,
  VisitorSourcesCodec,
  TrafficTimeseriesCodec,
  Email30dOpenRateCodec,
  EmailStatsCodec,
  PledgeSummaryCodec,
  PledgesCodec,
  ReaderReferralsCodec,
  PledgePlansCodec,
  PledgePlansSummaryCodec,
  PublicationSettingsCodec,
  BestsellerTierCodec
} from '@substack-api/internal/types/publication-stats'
import type {
  NetworkAttribution,
  FollowerTimeseries,
  AudienceLocation,
  AudienceLocationTotal,
  AudienceOverlap,
  Traffic30dViews,
  VisitorSources,
  TrafficTimeseries,
  Email30dOpenRate,
  EmailStats,
  PledgeSummary,
  Pledges,
  ReaderReferrals,
  PledgePlans,
  PledgePlansSummary,
  PublicationSettings,
  BestsellerTier
} from '@substack-api/internal/types/publication-stats'

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
  }): Promise<NetworkAttribution> {
    const params = new URLSearchParams()
    params.set('time_window', options?.timeWindow ?? '90+days')
    params.set('is_subscribed', String(options?.isSubscribed ?? false))
    const response = await this.publicationClient.get<unknown>(
      `/publication/stats/network_attribution?${params.toString()}`
    )
    return decodeOrThrow(NetworkAttributionCodec, response, 'network attribution')
  }

  // Audience tab

  async getFollowerTimeseries(options: { from: string }): Promise<FollowerTimeseries> {
    const params = new URLSearchParams()
    params.set('from', options.from)
    const response = await this.publicationClient.get<unknown>(
      `/publication/stats/followers/timeseries?${params.toString()}`
    )
    return decodeOrThrow(FollowerTimeseriesCodec, response, 'follower timeseries')
  }

  async getAudienceLocation(options?: {
    metric?: string
    granularity?: string
  }): Promise<AudienceLocation> {
    const params = new URLSearchParams()
    params.set('metric', options?.metric ?? 'free+signups')
    params.set('granularity', options?.granularity ?? 'usa')
    const response = await this.publicationClient.get<unknown>(
      `/publication/stats/audience_insights/location?${params.toString()}`
    )
    return decodeOrThrow(AudienceLocationCodec, response, 'audience location')
  }

  async getAudienceLocationTotal(): Promise<AudienceLocationTotal> {
    const response = await this.publicationClient.get<unknown>(
      '/publication/stats/audience_insights/location/total'
    )
    return decodeOrThrow(AudienceLocationTotalCodec, response, 'audience location total')
  }

  async getAudienceOverlap(options?: { limit?: number }): Promise<AudienceOverlap> {
    const params = new URLSearchParams()
    params.set('limit', String(options?.limit ?? 6))
    const response = await this.publicationClient.get<unknown>(
      `/publication/stats/audience_insights/overlap?${params.toString()}`
    )
    return decodeOrThrow(AudienceOverlapCodec, response, 'audience overlap')
  }

  // Traffic tab

  async getTraffic30dViews(): Promise<Traffic30dViews> {
    const response = await this.publicationClient.get<unknown>(
      '/publication/stats/publication_traffic/30d_views'
    )
    return decodeOrThrow(Traffic30dViewsCodec, response, 'traffic 30d views')
  }

  async getVisitorSources(options: {
    fromDate: string
    toDate: string
    offset?: number
    limit?: number
    orderBy?: string
    orderDirection?: string
  }): Promise<VisitorSources> {
    const params = new URLSearchParams()
    params.set('from_date', options.fromDate)
    params.set('to_date', options.toDate)
    params.set('offset', String(options.offset ?? 0))
    params.set('limit', String(options.limit ?? 20))
    params.set('order_by', options.orderBy ?? 'views')
    params.set('order_direction', options.orderDirection ?? 'desc')
    const response = await this.publicationClient.get<unknown>(
      `/publication/stats/visitor_sources?${params.toString()}`
    )
    return decodeOrThrow(VisitorSourcesCodec, response, 'visitor sources')
  }

  async getTrafficTimeseries(options: {
    from: string
    to: string
    category?: string
  }): Promise<TrafficTimeseries> {
    const params = new URLSearchParams()
    params.set('from', options.from)
    params.set('to', options.to)
    if (options.category) {
      params.set('category', options.category)
    }
    const response = await this.publicationClient.get<unknown>(
      `/publication/stats/publication_traffic/timeseries?${params.toString()}`
    )
    return decodeOrThrow(TrafficTimeseriesCodec, response, 'traffic timeseries')
  }

  // Posts tab

  async getEmail30dOpenRate(): Promise<Email30dOpenRate> {
    const response = await this.publicationClient.get<unknown>(
      '/publication/stats/email_stats/30d_open_rate'
    )
    return decodeOrThrow(Email30dOpenRateCodec, response, 'email 30d open rate')
  }

  async getEmailStats(options?: {
    offset?: number
    limit?: number
    orderBy?: string
    orderDirection?: string
  }): Promise<EmailStats> {
    const params = new URLSearchParams()
    params.set('offset', String(options?.offset ?? 0))
    params.set('limit', String(options?.limit ?? 20))
    params.set('order_by', options?.orderBy ?? 'post_date')
    params.set('order_direction', options?.orderDirection ?? 'desc')
    const response = await this.publicationClient.get<unknown>(
      `/publication/stats/email_stats?${params.toString()}`
    )
    return decodeOrThrow(EmailStatsCodec, response, 'email stats')
  }

  // Pledges tab

  async getPledgeSummary(): Promise<PledgeSummary> {
    const response = await this.publicationClient.get<unknown>(
      '/publication/stats/payment_pledges/summary'
    )
    return decodeOrThrow(PledgeSummaryCodec, response, 'pledge summary')
  }

  async getPledges(options?: { limit?: number }): Promise<Pledges> {
    const params = new URLSearchParams()
    params.set('limit', String(options?.limit ?? 20))
    const response = await this.publicationClient.get<unknown>(
      `/publication/stats/payment_pledges?${params.toString()}`
    )
    return decodeOrThrow(PledgesCodec, response, 'pledges')
  }

  // Sharing tab

  async getReaderReferrals(options: {
    to: string
    offset?: number
    limit?: number
    orderBy?: string
    orderDirection?: string
  }): Promise<ReaderReferrals> {
    const params = new URLSearchParams()
    params.set('to', options.to)
    params.set('offset', String(options.offset ?? 0))
    params.set('limit', String(options.limit ?? 20))
    params.set('order_by', options.orderBy ?? 'visitors')
    params.set('order_direction', options.orderDirection ?? 'desc')
    const response = await this.publicationClient.get<unknown>(
      `/publication/stats/reader-referrals?${params.toString()}`
    )
    return decodeOrThrow(ReaderReferralsCodec, response, 'reader referrals')
  }

  // Settings & Plans

  async getPledgePlans(): Promise<PledgePlans> {
    const response = await this.publicationClient.get<unknown>('/pledges/plans')
    return decodeOrThrow(PledgePlansCodec, response, 'pledge plans')
  }

  async getPledgePlansSummary(): Promise<PledgePlansSummary> {
    const response = await this.publicationClient.get<unknown>('/pledges/plans/summary')
    return decodeOrThrow(PledgePlansSummaryCodec, response, 'pledge plans summary')
  }

  async getPublicationSettings(): Promise<PublicationSettings> {
    const response = await this.publicationClient.get<unknown>('/publication_settings')
    return decodeOrThrow(PublicationSettingsCodec, response, 'publication settings')
  }

  async getBestsellerTier(): Promise<BestsellerTier> {
    const response = await this.publicationClient.get<unknown>('/publication/bestseller_tier')
    return decodeOrThrow(BestsellerTierCodec, response, 'bestseller tier')
  }
}
