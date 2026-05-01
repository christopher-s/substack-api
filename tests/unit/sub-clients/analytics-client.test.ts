/* eslint-disable @typescript-eslint/no-explicit-any */
import { AnalyticsClient } from '@substack-api/sub-clients/analytics-client'
import type {
  PublicationStatsService,
  GrowthStatsService,
  DashboardService
} from '@substack-api/internal/services'

describe('AnalyticsClient', () => {
  let publicationStatsService: jest.Mocked<PublicationStatsService>
  let growthStatsService: jest.Mocked<GrowthStatsService>
  let dashboardService: jest.Mocked<DashboardService>
  let client: AnalyticsClient

  beforeEach(() => {
    jest.clearAllMocks()

    publicationStatsService = {
      getSubscriberStats: jest.fn(),
      getSubscriptionsPage: jest.fn(),
      getNetworkAttribution: jest.fn(),
      getFollowerTimeseries: jest.fn(),
      getAudienceLocation: jest.fn(),
      getAudienceLocationTotal: jest.fn(),
      getAudienceOverlap: jest.fn(),
      getTraffic30dViews: jest.fn(),
      getVisitorSources: jest.fn(),
      getTrafficTimeseries: jest.fn(),
      getEmail30dOpenRate: jest.fn(),
      getEmailStats: jest.fn(),
      getPledgeSummary: jest.fn(),
      getPledges: jest.fn(),
      getReaderReferrals: jest.fn(),
      getPledgePlans: jest.fn(),
      getPledgePlansSummary: jest.fn(),
      getPublicationSettings: jest.fn(),
      getBestsellerTier: jest.fn()
    } as unknown as jest.Mocked<PublicationStatsService>

    growthStatsService = {
      getGrowthSources: jest.fn(),
      getGrowthTimeseries: jest.fn(),
      getGrowthEvents: jest.fn()
    } as unknown as jest.Mocked<GrowthStatsService>

    dashboardService = {
      getDashboardSummary: jest.fn(),
      getEmailsTimeseries: jest.fn(),
      getUnreadActivity: jest.fn(),
      getUnreadMessageCount: jest.fn()
    } as unknown as jest.Mocked<DashboardService>

    client = new AnalyticsClient(publicationStatsService, growthStatsService, dashboardService)
  })

  // ── Subscriber stats ──

  describe('subscriberStats', () => {
    it('When calling subscriberStats, then delegates to publicationStatsService', async () => {
      const mockData = { total: 500, free: 400, paid: 100 }
      publicationStatsService.getSubscriberStats.mockResolvedValueOnce(mockData as any)

      const result = await client.subscriberStats()

      expect(result).toEqual(mockData)
      expect(publicationStatsService.getSubscriberStats).toHaveBeenCalledTimes(1)
    })

    it('When subscriberStats fails, then error propagates', async () => {
      publicationStatsService.getSubscriberStats.mockRejectedValueOnce(new Error('API error'))

      await expect(client.subscriberStats()).rejects.toThrow('API error')
    })
  })

  describe('subscriptionsPage', () => {
    it('When calling subscriptionsPage with cursor, then delegates with options', async () => {
      const mockData = { subscriptions: [], nextCursor: 'abc' }
      publicationStatsService.getSubscriptionsPage.mockResolvedValueOnce(mockData as any)

      const result = await client.subscriptionsPage({ cursor: 'abc' })

      expect(result).toEqual(mockData)
      expect(publicationStatsService.getSubscriptionsPage).toHaveBeenCalledWith({ cursor: 'abc' })
    })

    it('When calling subscriptionsPage without options, then delegates with undefined', async () => {
      const mockData = { subscriptions: [], nextCursor: null }
      publicationStatsService.getSubscriptionsPage.mockResolvedValueOnce(mockData as any)

      const result = await client.subscriptionsPage()

      expect(result).toEqual(mockData)
      expect(publicationStatsService.getSubscriptionsPage).toHaveBeenCalledWith(undefined)
    })
  })

  // ── Growth stats ──

  describe('growthSources', () => {
    it('When calling growthSources with date range, then delegates to growthStatsService', async () => {
      const mockData = { sources: [] }
      const options = { fromDate: '2024-01-01', toDate: '2024-12-31' }
      growthStatsService.getGrowthSources.mockResolvedValueOnce(mockData as any)

      const result = await client.growthSources(options)

      expect(result).toEqual(mockData)
      expect(growthStatsService.getGrowthSources).toHaveBeenCalledWith(options)
    })

    it('When calling growthSources with ordering options, then passes them through', async () => {
      const mockData = { sources: [] }
      const options = {
        fromDate: '2024-01-01',
        toDate: '2024-12-31',
        orderBy: 'count',
        orderDirection: 'desc'
      }
      growthStatsService.getGrowthSources.mockResolvedValueOnce(mockData as any)

      const result = await client.growthSources(options)

      expect(result).toEqual(mockData)
      expect(growthStatsService.getGrowthSources).toHaveBeenCalledWith(options)
    })
  })

  describe('growthTimeseries', () => {
    it('When calling growthTimeseries, then delegates to growthStatsService', async () => {
      const mockData = { timeseries: [] }
      const data = { sources: ['direct'], orderBy: 'date', orderDirection: 'asc' }
      growthStatsService.getGrowthTimeseries.mockResolvedValueOnce(mockData as any)

      const result = await client.growthTimeseries(data)

      expect(result).toEqual(mockData)
      expect(growthStatsService.getGrowthTimeseries).toHaveBeenCalledWith(data)
    })
  })

  describe('growthEvents', () => {
    it('When calling growthEvents with date range, then delegates to growthStatsService', async () => {
      const mockData = { events: [] }
      const options = { fromDate: '2024-01-01', toDate: '2024-06-30' }
      growthStatsService.getGrowthEvents.mockResolvedValueOnce(mockData as any)

      const result = await client.growthEvents(options)

      expect(result).toEqual(mockData)
      expect(growthStatsService.getGrowthEvents).toHaveBeenCalledWith(options)
    })
  })

  // ── Publication stats ──

  describe('networkAttribution', () => {
    it('When calling networkAttribution with options, then delegates', async () => {
      const mockData = { attribution: [] }
      publicationStatsService.getNetworkAttribution.mockResolvedValueOnce(mockData as any)

      const result = await client.networkAttribution({ timeWindow: '30d', isSubscribed: true })

      expect(result).toEqual(mockData)
      expect(publicationStatsService.getNetworkAttribution).toHaveBeenCalledWith({
        timeWindow: '30d',
        isSubscribed: true
      })
    })

    it('When calling networkAttribution without options, then delegates with undefined', async () => {
      const mockData = { attribution: [] }
      publicationStatsService.getNetworkAttribution.mockResolvedValueOnce(mockData as any)

      const result = await client.networkAttribution()

      expect(result).toEqual(mockData)
      expect(publicationStatsService.getNetworkAttribution).toHaveBeenCalledWith(undefined)
    })
  })

  describe('followerTimeseries', () => {
    it('When calling followerTimeseries, then delegates to publicationStatsService', async () => {
      const mockData = { data: [] }
      publicationStatsService.getFollowerTimeseries.mockResolvedValueOnce(mockData as any)

      const result = await client.followerTimeseries({ from: '2024-01-01' })

      expect(result).toEqual(mockData)
      expect(publicationStatsService.getFollowerTimeseries).toHaveBeenCalledWith({
        from: '2024-01-01'
      })
    })
  })

  describe('audienceLocation', () => {
    it('When calling audienceLocation with options, then delegates', async () => {
      const mockData = { locations: [] }
      publicationStatsService.getAudienceLocation.mockResolvedValueOnce(mockData as any)

      const result = await client.audienceLocation({
        metric: 'subscribers',
        granularity: 'country'
      })

      expect(result).toEqual(mockData)
      expect(publicationStatsService.getAudienceLocation).toHaveBeenCalledWith({
        metric: 'subscribers',
        granularity: 'country'
      })
    })

    it('When calling audienceLocation without options, then delegates with undefined', async () => {
      const mockData = { locations: [] }
      publicationStatsService.getAudienceLocation.mockResolvedValueOnce(mockData as any)

      const result = await client.audienceLocation()

      expect(result).toEqual(mockData)
      expect(publicationStatsService.getAudienceLocation).toHaveBeenCalledWith(undefined)
    })
  })

  describe('audienceLocationTotal', () => {
    it('When calling audienceLocationTotal, then delegates to publicationStatsService', async () => {
      const mockData = { total: 1500 }
      publicationStatsService.getAudienceLocationTotal.mockResolvedValueOnce(mockData as any)

      const result = await client.audienceLocationTotal()

      expect(result).toEqual(mockData)
      expect(publicationStatsService.getAudienceLocationTotal).toHaveBeenCalledTimes(1)
    })
  })

  describe('audienceOverlap', () => {
    it('When calling audienceOverlap with limit, then delegates', async () => {
      const mockData = { overlaps: [] }
      publicationStatsService.getAudienceOverlap.mockResolvedValueOnce(mockData as any)

      const result = await client.audienceOverlap({ limit: 10 })

      expect(result).toEqual(mockData)
      expect(publicationStatsService.getAudienceOverlap).toHaveBeenCalledWith({ limit: 10 })
    })

    it('When calling audienceOverlap without options, then delegates with undefined', async () => {
      const mockData = { overlaps: [] }
      publicationStatsService.getAudienceOverlap.mockResolvedValueOnce(mockData as any)

      const result = await client.audienceOverlap()

      expect(result).toEqual(mockData)
      expect(publicationStatsService.getAudienceOverlap).toHaveBeenCalledWith(undefined)
    })
  })

  describe('traffic30dViews', () => {
    it('When calling traffic30dViews, then delegates to publicationStatsService', async () => {
      const mockData = { views: 50000 }
      publicationStatsService.getTraffic30dViews.mockResolvedValueOnce(mockData as any)

      const result = await client.traffic30dViews()

      expect(result).toEqual(mockData)
      expect(publicationStatsService.getTraffic30dViews).toHaveBeenCalledTimes(1)
    })
  })

  describe('visitorSources', () => {
    it('When calling visitorSources, then delegates to publicationStatsService', async () => {
      const mockData = { sources: [] }
      const options = {
        fromDate: '2024-01-01',
        toDate: '2024-12-31',
        offset: 0,
        limit: 50
      }
      publicationStatsService.getVisitorSources.mockResolvedValueOnce(mockData as any)

      const result = await client.visitorSources(options)

      expect(result).toEqual(mockData)
      expect(publicationStatsService.getVisitorSources).toHaveBeenCalledWith(options)
    })
  })

  describe('trafficTimeseries', () => {
    it('When calling trafficTimeseries, then delegates to publicationStatsService', async () => {
      const mockData = { timeseries: [] }
      const options = { from: '2024-01-01', to: '2024-12-31', category: 'organic' }
      publicationStatsService.getTrafficTimeseries.mockResolvedValueOnce(mockData as any)

      const result = await client.trafficTimeseries(options)

      expect(result).toEqual(mockData)
      expect(publicationStatsService.getTrafficTimeseries).toHaveBeenCalledWith(options)
    })
  })

  describe('email30dOpenRate', () => {
    it('When calling email30dOpenRate, then delegates to publicationStatsService', async () => {
      const mockData = { openRate: 0.45 }
      publicationStatsService.getEmail30dOpenRate.mockResolvedValueOnce(mockData as any)

      const result = await client.email30dOpenRate()

      expect(result).toEqual(mockData)
      expect(publicationStatsService.getEmail30dOpenRate).toHaveBeenCalledTimes(1)
    })
  })

  describe('emailStats', () => {
    it('When calling emailStats with options, then delegates', async () => {
      const mockData = { emails: [] }
      const options = { offset: 10, limit: 20, orderBy: 'date', orderDirection: 'desc' }
      publicationStatsService.getEmailStats.mockResolvedValueOnce(mockData as any)

      const result = await client.emailStats(options)

      expect(result).toEqual(mockData)
      expect(publicationStatsService.getEmailStats).toHaveBeenCalledWith(options)
    })

    it('When calling emailStats without options, then delegates with undefined', async () => {
      const mockData = { emails: [] }
      publicationStatsService.getEmailStats.mockResolvedValueOnce(mockData as any)

      const result = await client.emailStats()

      expect(result).toEqual(mockData)
      expect(publicationStatsService.getEmailStats).toHaveBeenCalledWith(undefined)
    })
  })

  describe('pledgeSummary', () => {
    it('When calling pledgeSummary, then delegates to publicationStatsService', async () => {
      const mockData = { total: 5000, currency: 'usd' }
      publicationStatsService.getPledgeSummary.mockResolvedValueOnce(mockData as any)

      const result = await client.pledgeSummary()

      expect(result).toEqual(mockData)
      expect(publicationStatsService.getPledgeSummary).toHaveBeenCalledTimes(1)
    })
  })

  describe('pledges', () => {
    it('When calling pledges with limit, then delegates', async () => {
      const mockData = { pledges: [] }
      publicationStatsService.getPledges.mockResolvedValueOnce(mockData as any)

      const result = await client.pledges({ limit: 25 })

      expect(result).toEqual(mockData)
      expect(publicationStatsService.getPledges).toHaveBeenCalledWith({ limit: 25 })
    })

    it('When calling pledges without options, then delegates with undefined', async () => {
      const mockData = { pledges: [] }
      publicationStatsService.getPledges.mockResolvedValueOnce(mockData as any)

      const result = await client.pledges()

      expect(result).toEqual(mockData)
      expect(publicationStatsService.getPledges).toHaveBeenCalledWith(undefined)
    })
  })

  describe('readerReferrals', () => {
    it('When calling readerReferrals, then delegates to publicationStatsService', async () => {
      const mockData = { referrals: [] }
      const options = { to: '2024-12-31', offset: 0, limit: 50 }
      publicationStatsService.getReaderReferrals.mockResolvedValueOnce(mockData as any)

      const result = await client.readerReferrals(options)

      expect(result).toEqual(mockData)
      expect(publicationStatsService.getReaderReferrals).toHaveBeenCalledWith(options)
    })
  })

  describe('pledgePlans', () => {
    it('When calling pledgePlans, then delegates to publicationStatsService', async () => {
      const mockData = { plans: [] }
      publicationStatsService.getPledgePlans.mockResolvedValueOnce(mockData as any)

      const result = await client.pledgePlans()

      expect(result).toEqual(mockData)
      expect(publicationStatsService.getPledgePlans).toHaveBeenCalledTimes(1)
    })
  })

  describe('pledgePlansSummary', () => {
    it('When calling pledgePlansSummary, then delegates to publicationStatsService', async () => {
      const mockData = { summary: {} }
      publicationStatsService.getPledgePlansSummary.mockResolvedValueOnce(mockData as any)

      const result = await client.pledgePlansSummary()

      expect(result).toEqual(mockData)
      expect(publicationStatsService.getPledgePlansSummary).toHaveBeenCalledTimes(1)
    })
  })

  describe('publicationSettings', () => {
    it('When calling publicationSettings, then delegates to publicationStatsService', async () => {
      const mockData = { name: 'My Pub', hostname: 'my.pub.substack.com' }
      publicationStatsService.getPublicationSettings.mockResolvedValueOnce(mockData as any)

      const result = await client.publicationSettings()

      expect(result).toEqual(mockData)
      expect(publicationStatsService.getPublicationSettings).toHaveBeenCalledTimes(1)
    })
  })

  describe('bestsellerTier', () => {
    it('When calling bestsellerTier, then delegates to publicationStatsService', async () => {
      const mockData = { tier: 'gold' }
      publicationStatsService.getBestsellerTier.mockResolvedValueOnce(mockData as any)

      const result = await client.bestsellerTier()

      expect(result).toEqual(mockData)
      expect(publicationStatsService.getBestsellerTier).toHaveBeenCalledTimes(1)
    })
  })

  // ── Dashboard ──

  describe('dashboardSummary', () => {
    it('When calling dashboardSummary with range, then delegates to dashboardService', async () => {
      const mockData = { totalSubscribersEnd: 1000 }
      dashboardService.getDashboardSummary.mockResolvedValueOnce(mockData as any)

      const result = await client.dashboardSummary({ range: 30 })

      expect(result).toEqual(mockData)
      expect(dashboardService.getDashboardSummary).toHaveBeenCalledWith({ range: 30 })
    })

    it('When calling dashboardSummary without options, then delegates with undefined', async () => {
      const mockData = { totalSubscribersEnd: 1000 }
      dashboardService.getDashboardSummary.mockResolvedValueOnce(mockData as any)

      const result = await client.dashboardSummary()

      expect(result).toEqual(mockData)
      expect(dashboardService.getDashboardSummary).toHaveBeenCalledWith(undefined)
    })
  })

  describe('emailsTimeseries', () => {
    it('When calling emailsTimeseries, then delegates to dashboardService', async () => {
      const mockData = [['2024-01-01', 500]]
      dashboardService.getEmailsTimeseries.mockResolvedValueOnce(mockData as any)

      const result = await client.emailsTimeseries({ from: '2024-01-01' })

      expect(result).toEqual(mockData)
      expect(dashboardService.getEmailsTimeseries).toHaveBeenCalledWith({ from: '2024-01-01' })
    })
  })

  describe('unreadActivity', () => {
    it('When calling unreadActivity, then delegates to dashboardService', async () => {
      const mockData = { count: 42 }
      dashboardService.getUnreadActivity.mockResolvedValueOnce(mockData as any)

      const result = await client.unreadActivity()

      expect(result).toEqual(mockData)
      expect(dashboardService.getUnreadActivity).toHaveBeenCalledTimes(1)
    })
  })

  describe('unreadMessageCount', () => {
    it('When calling unreadMessageCount, then delegates to dashboardService', async () => {
      const mockData = { unreadCount: 7 }
      dashboardService.getUnreadMessageCount.mockResolvedValueOnce(mockData as any)

      const result = await client.unreadMessageCount()

      expect(result).toEqual(mockData)
      expect(dashboardService.getUnreadMessageCount).toHaveBeenCalledTimes(1)
    })
  })

  // ── Error propagation ──

  describe('error propagation', () => {
    it('When growthStatsService throws, then error propagates from growthSources', async () => {
      growthStatsService.getGrowthSources.mockRejectedValueOnce(new Error('Growth API down'))

      await expect(
        client.growthSources({ fromDate: '2024-01-01', toDate: '2024-12-31' })
      ).rejects.toThrow('Growth API down')
    })

    it('When dashboardService throws, then error propagates from dashboardSummary', async () => {
      dashboardService.getDashboardSummary.mockRejectedValueOnce(new Error('Dashboard error'))

      await expect(client.dashboardSummary()).rejects.toThrow('Dashboard error')
    })
  })
})
