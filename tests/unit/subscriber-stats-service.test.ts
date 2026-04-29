import { SubscriberStatsService } from '@substack-api/internal/services/subscriber-stats-service'
import type { HttpClient } from '@substack-api/internal/http-client'

describe('SubscriberStatsService', () => {
  let mockPublicationClient: jest.Mocked<HttpClient>
  let mockSubstackClient: jest.Mocked<HttpClient>
  let service: SubscriberStatsService

  beforeEach(() => {
    mockPublicationClient = {
      get: jest.fn(),
      post: jest.fn()
    } as unknown as jest.Mocked<HttpClient>
    mockSubstackClient = {
      get: jest.fn()
    } as unknown as jest.Mocked<HttpClient>
    service = new SubscriberStatsService(mockPublicationClient, mockSubstackClient)
  })

  describe('getSubscriberStats', () => {
    it('should fetch subscriber stats from publication client', async () => {
      const mockResponse = {
        subscribers: [
          {
            total_count: 1,
            user_email_address: 'john@example.com',
            user_photo_url: 'https://example.com/photo.jpg',
            user_name: 'John Doe',
            user_id: 12345,
            subscription_type: 'paid',
            activity_rating: 4,
            subscription_created_at: '2024-01-15T10:30:00Z',
            total_revenue_generated: 120.0,
            subscription_id: 67890,
            subscription_interval: 'month',
            is_subscribed: true,
            is_founding: false,
            is_gift: false,
            is_comp: false,
            is_free_trial: false,
            is_bitcoin: false
          }
        ]
      }
      mockPublicationClient.post.mockResolvedValue(mockResponse)

      const result = await service.getSubscriberStats()
      expect(result).toEqual(mockResponse)
      expect(mockPublicationClient.post).toHaveBeenCalledWith('/subscriber-stats')
    })

    it('should propagate HTTP errors', async () => {
      mockPublicationClient.post.mockRejectedValue(new Error('HTTP 401'))
      await expect(service.getSubscriberStats()).rejects.toThrow('HTTP 401')
    })
  })

  describe('getSubscriptionsPage', () => {
    it('should fetch subscriptions page without cursor', async () => {
      const mockResponse = {
        subscriptions: [
          {
            id: 100,
            user_id: 12345,
            publication_id: 42,
            expiry: '2025-01-15T00:00:00Z',
            bundle_id: null,
            email_disabled: false,
            membership_state: 'active',
            type: 'paid',
            gift_user_id: null,
            created_at: '2024-01-15T10:30:00Z',
            gifted_at: null,
            paused: null,
            is_group_parent: false,
            parent_type: null,
            visibility: 'public',
            is_founding: false,
            is_favorite: false,
            podcast_rss_token: 'abc123token',
            first_payment_at: '2024-01-15T10:30:00Z'
          }
        ],
        publicationUsers: [
          {
            id: 1,
            publication_id: 42,
            user_id: 12345,
            public: true,
            created_at: '2024-01-15T10:30:00Z',
            updated_at: '2024-06-01T12:00:00Z'
          }
        ]
      }
      mockSubstackClient.get.mockResolvedValue(mockResponse)

      const result = await service.getSubscriptionsPage()
      expect(result).toEqual(mockResponse)
      expect(mockSubstackClient.get).toHaveBeenCalledWith('/subscriptions/page_v2')
    })

    it('should fetch subscriptions page with cursor', async () => {
      const mockResponse = {
        subscriptions: [],
        publicationUsers: []
      }
      mockSubstackClient.get.mockResolvedValue(mockResponse)

      const result = await service.getSubscriptionsPage({ cursor: 'next_page_token' })
      expect(result).toEqual(mockResponse)
      expect(mockSubstackClient.get).toHaveBeenCalledWith(
        '/subscriptions/page_v2?cursor=next_page_token'
      )
    })

    it('should propagate HTTP errors', async () => {
      mockSubstackClient.get.mockRejectedValue(new Error('HTTP 403'))
      await expect(service.getSubscriptionsPage()).rejects.toThrow('HTTP 403')
    })
  })
})
