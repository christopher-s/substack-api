import { DashboardService } from '@substack-api/internal/services/dashboard-service'
import { HttpClient } from '@substack-api/internal/http-client'

// Mock the HttpClient
jest.mock('@substack-api/internal/http-client')

describe('DashboardService', () => {
  let mockPublicationClient: jest.Mocked<HttpClient>
  let service: DashboardService

  beforeEach(() => {
    jest.clearAllMocks()

    mockPublicationClient = new HttpClient('https://test.com', 'test') as jest.Mocked<HttpClient>
    mockPublicationClient.get = jest.fn()

    service = new DashboardService(mockPublicationClient)
  })

  describe('getDashboardSummary', () => {
    it('When fetching dashboard summary with default range', async () => {
      const mockSummary = {
        totalSubscribersEnd: 1000,
        totalSubscribersStart: 800,
        paidSubscribersEnd: 200,
        paidSubscribersStart: 150,
        arrEnd: 50000,
        arrStart: 40000,
        totalViewsEnd: 30000,
        totalViewsStart: 25000,
        pledgedArrEnd: 10000,
        pledgedArrStart: 8000
      }

      mockPublicationClient.get.mockResolvedValueOnce(mockSummary)

      const result = await service.getDashboardSummary()

      expect(result).toEqual(mockSummary)
      expect(mockPublicationClient.get).toHaveBeenCalledWith(
        '/publish-dashboard/summary-v2?range=365'
      )
    })

    it('When fetching dashboard summary with custom range', async () => {
      const mockSummary = {
        totalSubscribersEnd: 1000,
        totalSubscribersStart: 900,
        paidSubscribersEnd: 200,
        paidSubscribersStart: 180,
        arrEnd: 50000,
        arrStart: 45000,
        totalViewsEnd: 30000,
        totalViewsStart: 28000,
        pledgedArrEnd: 10000,
        pledgedArrStart: 9000
      }

      mockPublicationClient.get.mockResolvedValueOnce(mockSummary)

      const result = await service.getDashboardSummary({ range: 30 })

      expect(result).toEqual(mockSummary)
      expect(mockPublicationClient.get).toHaveBeenCalledWith(
        '/publish-dashboard/summary-v2?range=30'
      )
    })

    it('When dashboard summary request fails', async () => {
      mockPublicationClient.get.mockRejectedValueOnce(new Error('Dashboard API Error'))

      await expect(service.getDashboardSummary()).rejects.toThrow('Dashboard API Error')
      expect(mockPublicationClient.get).toHaveBeenCalledWith(
        '/publish-dashboard/summary-v2?range=365'
      )
    })
  })

  describe('getEmailsTimeseries', () => {
    it('When fetching email timeseries data', async () => {
      const mockTimeseries: Array<[string, number]> = [
        ['2024-01-01', 500],
        ['2024-02-01', 550],
        ['2024-03-01', 620]
      ]

      mockPublicationClient.get.mockResolvedValueOnce(mockTimeseries)

      const result = await service.getEmailsTimeseries({ from: '2024-01-01' })

      expect(result).toEqual(mockTimeseries)
      expect(mockPublicationClient.get).toHaveBeenCalledWith(
        '/publication/stats/emails/timeseries?from=2024-01-01'
      )
    })

    it('When email timeseries request fails', async () => {
      mockPublicationClient.get.mockRejectedValueOnce(new Error('Timeseries API Error'))

      await expect(service.getEmailsTimeseries({ from: '2024-01-01' })).rejects.toThrow(
        'Timeseries API Error'
      )
      expect(mockPublicationClient.get).toHaveBeenCalledWith(
        '/publication/stats/emails/timeseries?from=2024-01-01'
      )
    })
  })

  describe('getUnreadActivity', () => {
    it('When fetching unread activity count', async () => {
      const mockUnread = { count: 42, max: false, lastViewedAt: '2024-06-15T10:30:00Z' }

      mockPublicationClient.get.mockResolvedValueOnce(mockUnread)

      const result = await service.getUnreadActivity()

      expect(result).toEqual(mockUnread)
      expect(mockPublicationClient.get).toHaveBeenCalledWith('/activity/unread')
    })

    it('When unread activity request fails', async () => {
      mockPublicationClient.get.mockRejectedValueOnce(new Error('Activity API Error'))

      await expect(service.getUnreadActivity()).rejects.toThrow('Activity API Error')
      expect(mockPublicationClient.get).toHaveBeenCalledWith('/activity/unread')
    })
  })

  describe('getUnreadMessageCount', () => {
    it('When fetching unread message count', async () => {
      const mockUnreadMessages = {
        unreadCount: 7,
        pendingInviteCount: 3,
        pendingInviteUnreadCount: 2,
        newPendingInviteUnreadCount: 1,
        pubChatUnreadCount: 4
      }

      mockPublicationClient.get.mockResolvedValueOnce(mockUnreadMessages)

      const result = await service.getUnreadMessageCount()

      expect(result).toEqual(mockUnreadMessages)
      expect(mockPublicationClient.get).toHaveBeenCalledWith('/messages/unread-count')
    })
  })

  describe('getGrowthSuggestion', () => {
    it('When fetching growth suggestion', async () => {
      const mockSuggestion = {
        suggestion: {
          header: 'Set up a referral program',
          body: 'Word of mouth is the best way to grow your publication.',
          cta: 'Set up referrals',
          url: '/settings/referrals'
        },
        suggestionKey: 'referral_setup'
      }

      mockPublicationClient.get.mockResolvedValueOnce(mockSuggestion)

      const result = await service.getGrowthSuggestion()

      expect(result).toEqual(mockSuggestion)
      expect(mockPublicationClient.get).toHaveBeenCalledWith('/grow/suggestion')
    })
  })
})
