import { PublicationStatsService } from '@substack-api/internal/services/publication-stats-service'
import type { HttpClient } from '@substack-api/internal/http-client'

describe('PublicationStatsService', () => {
  let mockPublicationClient: jest.Mocked<HttpClient>
  let service: PublicationStatsService

  beforeEach(() => {
    mockPublicationClient = {
      get: jest.fn()
    } as unknown as jest.Mocked<HttpClient>
    service = new PublicationStatsService(mockPublicationClient)
  })

  describe('Network tab', () => {
    describe('getNetworkAttribution', () => {
      it('When requesting network attribution with defaults', async () => {
        const mockResponse = {
          rows: [
            {
              publication_id: 123,
              time_window: '90+days',
              is_subscribed: false,
              criteria: 'search',
              label: 'Google Search',
              subs_count: 42,
              pct_time_window_total: 0.15,
              data_updated_at: '2024-01-01T00:00:00Z'
            }
          ],
          total: 280
        }
        mockPublicationClient.get.mockResolvedValueOnce(mockResponse)

        const result = await service.getNetworkAttribution()

        expect(result).toEqual(mockResponse)
        expect(mockPublicationClient.get).toHaveBeenCalledWith(
          '/publication/stats/network_attribution?time_window=90%2Bdays&is_subscribed=false'
        )
      })

      it('When requesting network attribution with custom options', async () => {
        const mockResponse = { rows: [], total: 0 }
        mockPublicationClient.get.mockResolvedValueOnce(mockResponse)

        await service.getNetworkAttribution({ timeWindow: '30+days', isSubscribed: true })

        expect(mockPublicationClient.get).toHaveBeenCalledWith(
          '/publication/stats/network_attribution?time_window=30%2Bdays&is_subscribed=true'
        )
      })

      it('When network attribution request fails', async () => {
        mockPublicationClient.get.mockRejectedValueOnce(new Error('Network API Error'))

        await expect(service.getNetworkAttribution()).rejects.toThrow('Network API Error')
      })
    })
  })

  describe('Audience tab', () => {
    describe('getFollowerTimeseries', () => {
      it('When requesting follower timeseries', async () => {
        const mockResponse = [
          ['2024-01-01', 1000],
          ['2024-01-02', 1015],
          ['2024-01-03', 1032]
        ]
        mockPublicationClient.get.mockResolvedValueOnce(mockResponse)

        const result = await service.getFollowerTimeseries({ from: '2024-01-01' })

        expect(result).toEqual(mockResponse)
        expect(mockPublicationClient.get).toHaveBeenCalledWith(
          '/publication/stats/followers/timeseries?from=2024-01-01'
        )
      })

      it('When follower timeseries request fails', async () => {
        mockPublicationClient.get.mockRejectedValueOnce(new Error('Timeseries API Error'))

        await expect(
          service.getFollowerTimeseries({ from: '2024-01-01' })
        ).rejects.toThrow('Timeseries API Error')
      })
    })

    describe('getAudienceLocation', () => {
      it('When requesting audience location with defaults', async () => {
        const mockResponse = [
          {
            publication_id: 123,
            granularity: 'usa',
            location: 'California',
            metric: 'free+signups',
            value: 500,
            md5: 'abc123',
            data_updated_at: '2024-01-01T00:00:00Z'
          }
        ]
        mockPublicationClient.get.mockResolvedValueOnce(mockResponse)

        const result = await service.getAudienceLocation()

        expect(result).toEqual(mockResponse)
        expect(mockPublicationClient.get).toHaveBeenCalledWith(
          '/publication/stats/audience_insights/location?metric=free%2Bsignups&granularity=usa'
        )
      })

      it('When requesting audience location with custom options', async () => {
        mockPublicationClient.get.mockResolvedValueOnce([])

        await service.getAudienceLocation({ metric: 'paid+signups', granularity: 'global' })

        expect(mockPublicationClient.get).toHaveBeenCalledWith(
          '/publication/stats/audience_insights/location?metric=paid%2Bsignups&granularity=global'
        )
      })
    })

    describe('getAudienceLocationTotal', () => {
      it('When requesting audience location totals', async () => {
        const mockResponse = {
          global: { locations: 50, total: 10000 },
          usa: { locations: 50, total: 6000 }
        }
        mockPublicationClient.get.mockResolvedValueOnce(mockResponse)

        const result = await service.getAudienceLocationTotal()

        expect(result).toEqual(mockResponse)
        expect(mockPublicationClient.get).toHaveBeenCalledWith(
          '/publication/stats/audience_insights/location/total'
        )
      })
    })

    describe('getAudienceOverlap', () => {
      it('When requesting audience overlap with default limit', async () => {
        const mockResponse = [
          { percentOverlap: '25', pub: { id: 1, name: 'Other Pub' } }
        ]
        mockPublicationClient.get.mockResolvedValueOnce(mockResponse)

        const result = await service.getAudienceOverlap()

        expect(result).toEqual(mockResponse)
        expect(mockPublicationClient.get).toHaveBeenCalledWith(
          '/publication/stats/audience_insights/overlap?limit=6'
        )
      })

      it('When requesting audience overlap with custom limit', async () => {
        mockPublicationClient.get.mockResolvedValueOnce([])

        await service.getAudienceOverlap({ limit: 10 })

        expect(mockPublicationClient.get).toHaveBeenCalledWith(
          '/publication/stats/audience_insights/overlap?limit=10'
        )
      })
    })
  })

  describe('Traffic tab', () => {
    describe('getTraffic30dViews', () => {
      it('When requesting 30d traffic views', async () => {
        const mockResponse = { views30d: 50000, viewsDelta30d: 1200 }
        mockPublicationClient.get.mockResolvedValueOnce(mockResponse)

        const result = await service.getTraffic30dViews()

        expect(result).toEqual(mockResponse)
        expect(mockPublicationClient.get).toHaveBeenCalledWith(
          '/publication/stats/publication_traffic/30d_views'
        )
      })
    })

    describe('getVisitorSources', () => {
      it('When requesting visitor sources with required params', async () => {
        const mockResponse = {
          rows: [
            {
              source: 'google.com',
              source_category: 'search',
              views: 5000,
              users: 3500,
              free_signup: 200,
              subscribed: 50
            }
          ],
          total: 1
        }
        mockPublicationClient.get.mockResolvedValueOnce(mockResponse)

        const result = await service.getVisitorSources({
          fromDate: '2024-01-01',
          toDate: '2024-01-31'
        })

        expect(result).toEqual(mockResponse)
        expect(mockPublicationClient.get).toHaveBeenCalledWith(
          '/publication/stats/visitor_sources?from_date=2024-01-01&to_date=2024-01-31&offset=0&limit=20&order_by=views&order_direction=desc'
        )
      })

      it('When requesting visitor sources with all custom options', async () => {
        mockPublicationClient.get.mockResolvedValueOnce({ rows: [], total: 0 })

        await service.getVisitorSources({
          fromDate: '2024-01-01',
          toDate: '2024-01-31',
          offset: 10,
          limit: 50,
          orderBy: 'users',
          orderDirection: 'asc'
        })

        expect(mockPublicationClient.get).toHaveBeenCalledWith(
          '/publication/stats/visitor_sources?from_date=2024-01-01&to_date=2024-01-31&offset=10&limit=50&order_by=users&order_direction=asc'
        )
      })

      it('When visitor sources request fails', async () => {
        mockPublicationClient.get.mockRejectedValueOnce(new Error('Visitor Sources API Error'))

        await expect(
          service.getVisitorSources({ fromDate: '2024-01-01', toDate: '2024-01-31' })
        ).rejects.toThrow('Visitor Sources API Error')
      })
    })

    describe('getTrafficTimeseries', () => {
      it('When requesting traffic timeseries without category', async () => {
        const mockResponse = [
          ['2024-01-01', 1500],
          ['2024-01-02', 1650]
        ]
        mockPublicationClient.get.mockResolvedValueOnce(mockResponse)

        const result = await service.getTrafficTimeseries({
          from: '2024-01-01',
          to: '2024-01-31'
        })

        expect(result).toEqual(mockResponse)
        expect(mockPublicationClient.get).toHaveBeenCalledWith(
          '/publication/stats/publication_traffic/timeseries?from=2024-01-01&to=2024-01-31'
        )
      })

      it('When requesting traffic timeseries with category', async () => {
        mockPublicationClient.get.mockResolvedValueOnce([])

        await service.getTrafficTimeseries({
          from: '2024-01-01',
          to: '2024-01-31',
          category: 'organic'
        })

        expect(mockPublicationClient.get).toHaveBeenCalledWith(
          '/publication/stats/publication_traffic/timeseries?from=2024-01-01&to=2024-01-31&category=organic'
        )
      })
    })
  })

  describe('Posts tab', () => {
    describe('getEmail30dOpenRate', () => {
      it('When requesting 30d email open rate', async () => {
        const mockResponse = { openRate: 0.52, openRateDiff: 0.03 }
        mockPublicationClient.get.mockResolvedValueOnce(mockResponse)

        const result = await service.getEmail30dOpenRate()

        expect(result).toEqual(mockResponse)
        expect(mockPublicationClient.get).toHaveBeenCalledWith(
          '/publication/stats/email_stats/30d_open_rate'
        )
      })
    })

    describe('getEmailStats', () => {
      it('When requesting email stats with defaults', async () => {
        const mockResponse = {
          rows: [
            {
              title: 'Weekly Update',
              post_date: '2024-01-15',
              audience: 'everyone',
              type: 'newsletter',
              post_id: 456,
              queued: false,
              sent: 10000,
              delivered: 9900,
              dropped: 100,
              complaints: 5,
              opens: 5000,
              opened: 0.5,
              open_rate: 0.51,
              unique_opens_day7: 4500,
              unique_opens_day28: 4800,
              clicks: 800,
              clicked: 0.08,
              click_through_rate: 0.16,
              signups: 120,
              subscribes: 30,
              founding_subscribes: 2,
              annual_subscribes: 10,
              monthly_subscribes: 18,
              free_trials: 5,
              free_to_paid_upgrades: 3,
              estimated_value: 1500,
              unsubscribes: 15,
              likes: 200,
              comments: 50,
              shares: 30,
              restacks: 10,
              engagement_rate: 0.12,
              unique_engagements: 1200,
              subscribers_finished_post: 6000
            }
          ]
        }
        mockPublicationClient.get.mockResolvedValueOnce(mockResponse)

        const result = await service.getEmailStats()

        expect(result).toEqual(mockResponse)
        expect(mockPublicationClient.get).toHaveBeenCalledWith(
          '/publication/stats/email_stats?offset=0&limit=20&order_by=post_date&order_direction=desc'
        )
      })

      it('When requesting email stats with custom options', async () => {
        mockPublicationClient.get.mockResolvedValueOnce({ rows: [] })

        await service.getEmailStats({ offset: 20, limit: 10, orderBy: 'open_rate', orderDirection: 'asc' })

        expect(mockPublicationClient.get).toHaveBeenCalledWith(
          '/publication/stats/email_stats?offset=20&limit=10&order_by=open_rate&order_direction=asc'
        )
      })

      it('When email stats request fails', async () => {
        mockPublicationClient.get.mockRejectedValueOnce(new Error('Email Stats API Error'))

        await expect(service.getEmailStats()).rejects.toThrow('Email Stats API Error')
      })
    })
  })

  describe('Pledges tab', () => {
    describe('getPledgeSummary', () => {
      it('When requesting pledge summary', async () => {
        const mockResponse = { totalPledges: 150, totalPledgeAmount: 5000, currency: 'usd' }
        mockPublicationClient.get.mockResolvedValueOnce(mockResponse)

        const result = await service.getPledgeSummary()

        expect(result).toEqual(mockResponse)
        expect(mockPublicationClient.get).toHaveBeenCalledWith(
          '/publication/stats/payment_pledges/summary'
        )
      })
    })

    describe('getPledges', () => {
      it('When requesting pledges with default limit', async () => {
        const mockResponse = {
          pledgeAndUserData: [
            {
              pledge: {
                publication_id: 123,
                user_id: 456,
                plan_interval: 'month',
                payment_currency: 'usd',
                payment_amount: 500,
                is_founding: false,
                created_at: '2024-01-15T00:00:00Z',
                note: 'Love your work!',
                can_share_note: true
              },
              user: {
                id: 456,
                name: 'Jane Doe',
                handle: 'janedoe',
                photo_url: 'https://example.com/photo.jpg',
                bio: 'A reader',
                profile_set_up_at: '2023-06-01T00:00:00Z'
              }
            }
          ]
        }
        mockPublicationClient.get.mockResolvedValueOnce(mockResponse)

        const result = await service.getPledges()

        expect(result).toEqual(mockResponse)
        expect(mockPublicationClient.get).toHaveBeenCalledWith(
          '/publication/stats/payment_pledges?limit=20'
        )
      })

      it('When requesting pledges with custom limit', async () => {
        mockPublicationClient.get.mockResolvedValueOnce({ pledgeAndUserData: [] })

        await service.getPledges({ limit: 50 })

        expect(mockPublicationClient.get).toHaveBeenCalledWith(
          '/publication/stats/payment_pledges?limit=50'
        )
      })
    })
  })

  describe('Sharing tab', () => {
    describe('getReaderReferrals', () => {
      it('When requesting reader referrals with required params', async () => {
        const mockResponse = {
          rows: [
            {
              referrer_user_id: 789,
              free_subscribers: 15,
              visitors: 200,
              paid_subscribers: 3,
              user: {
                id: 789,
                email: 'reader@example.com',
                name: 'Bob Reader',
                handle: 'bobreader',
                bio: 'Curious mind',
                photo_url: 'https://example.com/bob.jpg',
                reader_installed_at: '2023-01-01T00:00:00Z'
              }
            }
          ]
        }
        mockPublicationClient.get.mockResolvedValueOnce(mockResponse)

        const result = await service.getReaderReferrals({ to: '2024-01-31' })

        expect(result).toEqual(mockResponse)
        expect(mockPublicationClient.get).toHaveBeenCalledWith(
          '/publication/stats/reader-referrals?to=2024-01-31&offset=0&limit=20&order_by=visitors&order_direction=desc'
        )
      })

      it('When requesting reader referrals with all custom options', async () => {
        mockPublicationClient.get.mockResolvedValueOnce({ rows: [] })

        await service.getReaderReferrals({
          to: '2024-01-31',
          offset: 10,
          limit: 50,
          orderBy: 'paid_subscribers',
          orderDirection: 'asc'
        })

        expect(mockPublicationClient.get).toHaveBeenCalledWith(
          '/publication/stats/reader-referrals?to=2024-01-31&offset=10&limit=50&order_by=paid_subscribers&order_direction=asc'
        )
      })

      it('When reader referrals request fails', async () => {
        mockPublicationClient.get.mockRejectedValueOnce(new Error('Referrals API Error'))

        await expect(
          service.getReaderReferrals({ to: '2024-01-31' })
        ).rejects.toThrow('Referrals API Error')
      })
    })
  })
})
