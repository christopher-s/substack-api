import type {
  SubscriberStatsService,
  GrowthStatsService,
  PublicationStatsService,
  DashboardService
} from '@substack-api/internal/services'
import type {
  SubscriberStats,
  SubscriptionsPage,
  GrowthSources,
  GrowthTimeseries,
  GrowthEvents,
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
  BestsellerTier,
  DashboardSummary,
  EmailsTimeseries,
  UnreadActivity,
  UnreadMessageCount
} from '@substack-api/internal/types'

/**
 * Sub-client for analytics/stats operations.
 */
export class AnalyticsClient {
  constructor(
    private readonly subscriberStatsService: SubscriberStatsService,
    private readonly growthStatsService: GrowthStatsService,
    private readonly publicationStatsService: PublicationStatsService,
    private readonly dashboardService: DashboardService
  ) {}

  // ── Subscriber stats ──

  async subscriberStats(): Promise<SubscriberStats> {
    return await this.subscriberStatsService.getSubscriberStats()
  }

  async subscriptionsPage(options?: { cursor?: string }): Promise<SubscriptionsPage> {
    return await this.subscriberStatsService.getSubscriptionsPage(options)
  }

  // ── Growth stats ──

  async growthSources(options: {
    fromDate: string
    toDate: string
    orderBy?: string
    orderDirection?: string
  }): Promise<GrowthSources> {
    return await this.growthStatsService.getGrowthSources(options)
  }

  async growthTimeseries(data: {
    sources: unknown[]
    orderBy: string
    orderDirection: string
    fromDate?: string
    toDate?: string
  }): Promise<GrowthTimeseries> {
    return await this.growthStatsService.getGrowthTimeseries(data)
  }

  async growthEvents(options: { fromDate: string; toDate: string }): Promise<GrowthEvents> {
    return await this.growthStatsService.getGrowthEvents(options)
  }

  // ── Publication stats ──

  async networkAttribution(options?: {
    timeWindow?: string
    isSubscribed?: boolean
  }): Promise<NetworkAttribution> {
    return await this.publicationStatsService.getNetworkAttribution(options)
  }

  async followerTimeseries(options: { from: string }): Promise<FollowerTimeseries> {
    return await this.publicationStatsService.getFollowerTimeseries(options)
  }

  async audienceLocation(options?: {
    metric?: string
    granularity?: string
  }): Promise<AudienceLocation> {
    return await this.publicationStatsService.getAudienceLocation(options)
  }

  async audienceLocationTotal(): Promise<AudienceLocationTotal> {
    return await this.publicationStatsService.getAudienceLocationTotal()
  }

  async audienceOverlap(options?: { limit?: number }): Promise<AudienceOverlap> {
    return await this.publicationStatsService.getAudienceOverlap(options)
  }

  async traffic30dViews(): Promise<Traffic30dViews> {
    return await this.publicationStatsService.getTraffic30dViews()
  }

  async visitorSources(options: {
    fromDate: string
    toDate: string
    offset?: number
    limit?: number
    orderBy?: string
    orderDirection?: string
  }): Promise<VisitorSources> {
    return await this.publicationStatsService.getVisitorSources(options)
  }

  async trafficTimeseries(options: {
    from: string
    to: string
    category?: string
  }): Promise<TrafficTimeseries> {
    return await this.publicationStatsService.getTrafficTimeseries(options)
  }

  async email30dOpenRate(): Promise<Email30dOpenRate> {
    return await this.publicationStatsService.getEmail30dOpenRate()
  }

  async emailStats(options?: {
    offset?: number
    limit?: number
    orderBy?: string
    orderDirection?: string
  }): Promise<EmailStats> {
    return await this.publicationStatsService.getEmailStats(options)
  }

  async pledgeSummary(): Promise<PledgeSummary> {
    return await this.publicationStatsService.getPledgeSummary()
  }

  async pledges(options?: { limit?: number }): Promise<Pledges> {
    return await this.publicationStatsService.getPledges(options)
  }

  async readerReferrals(options: {
    to: string
    offset?: number
    limit?: number
    orderBy?: string
    orderDirection?: string
  }): Promise<ReaderReferrals> {
    return await this.publicationStatsService.getReaderReferrals(options)
  }

  async pledgePlans(): Promise<PledgePlans> {
    return await this.publicationStatsService.getPledgePlans()
  }

  async pledgePlansSummary(): Promise<PledgePlansSummary> {
    return await this.publicationStatsService.getPledgePlansSummary()
  }

  async publicationSettings(): Promise<PublicationSettings> {
    return await this.publicationStatsService.getPublicationSettings()
  }

  async bestsellerTier(): Promise<BestsellerTier> {
    return await this.publicationStatsService.getBestsellerTier()
  }

  // ── Dashboard ──

  async dashboardSummary(options?: { range?: number }): Promise<DashboardSummary> {
    return await this.dashboardService.getDashboardSummary(options)
  }

  async emailsTimeseries(options: { from: string }): Promise<EmailsTimeseries> {
    return await this.dashboardService.getEmailsTimeseries(options)
  }

  async unreadActivity(): Promise<UnreadActivity> {
    return await this.dashboardService.getUnreadActivity()
  }

  async unreadMessageCount(): Promise<UnreadMessageCount> {
    return await this.dashboardService.getUnreadMessageCount()
  }
}
