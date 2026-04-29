import { GrowthStatsService } from '@substack-api/internal/services/growth-stats-service'
import { createMockHttpClient } from '@test/unit/helpers/mock-http-client'

describe('GrowthStatsService', () => {
  let mockPublicationClient: ReturnType<typeof createMockHttpClient>
  let service: GrowthStatsService

  beforeEach(() => {
    jest.clearAllMocks()
    mockPublicationClient = createMockHttpClient('https://test.substack.com')
    service = new GrowthStatsService(mockPublicationClient)
  })

  describe('getGrowthSources', () => {
    const mockGrowthSourcesResponse = {
      sourceMetrics: [
        {
          source: 'substack_network',
          sourceName: 'Substack',
          originalSourceName: 'Substack Network',
          category: 'Substack' as const,
          logoUrl: null,
          metrics: [
            {
              name: 'Traffic' as const,
              timeseries: [
                { date: '2024-01-01', value: 100 },
                { date: '2024-01-02', value: 150 }
              ],
              total: 250
            }
          ],
          children: [
            {
              source: 'substack_app',
              sourceName: 'Substack App',
              originalSourceName: 'Substack App',
              category: 'Substack',
              metrics: [
                {
                  name: 'Traffic',
                  timeseries: [{ date: '2024-01-01', value: 50 }],
                  total: 50
                }
              ],
              children: []
            }
          ]
        }
      ]
    }

    it('When fetching growth sources with required params, then builds correct query string', async () => {
      // Arrange
      mockPublicationClient.get.mockResolvedValue(mockGrowthSourcesResponse)

      // Act
      const result = await service.getGrowthSources({
        fromDate: '2024-01-01',
        toDate: '2024-01-31'
      })

      // Assert
      expect(mockPublicationClient.get).toHaveBeenCalledWith(
        '/publication/stats/growth/sources?order_by=users&order_direction=desc&from_date=2024-01-01&to_date=2024-01-31'
      )
      expect(result).toEqual(mockGrowthSourcesResponse)
    })

    it('When fetching growth sources with custom order params, then uses provided values', async () => {
      // Arrange
      mockPublicationClient.get.mockResolvedValue(mockGrowthSourcesResponse)

      // Act
      await service.getGrowthSources({
        fromDate: '2024-01-01',
        toDate: '2024-01-31',
        orderBy: 'subscribers',
        orderDirection: 'asc'
      })

      // Assert
      expect(mockPublicationClient.get).toHaveBeenCalledWith(
        '/publication/stats/growth/sources?order_by=subscribers&order_direction=asc&from_date=2024-01-01&to_date=2024-01-31'
      )
    })

    it('When growth sources request fails, then propagates error', async () => {
      // Arrange
      const error = new Error('Network error')
      mockPublicationClient.get.mockRejectedValue(error)

      // Act & Assert
      await expect(
        service.getGrowthSources({ fromDate: '2024-01-01', toDate: '2024-01-31' })
      ).rejects.toThrow('Network error')
    })
  })

  describe('getGrowthTimeseries', () => {
    const mockTimeseriesResponse = {
      timeseries: [
        { date: '2024-01-01', value: 100 },
        { date: '2024-01-02', value: 150 }
      ]
    }

    it('When fetching timeseries with required body, then posts correct data', async () => {
      // Arrange
      mockPublicationClient.post.mockResolvedValue(mockTimeseriesResponse)
      const body = {
        sources: [{ source: 'substack_network', sourceName: 'Substack' }],
        orderBy: 'users',
        orderDirection: 'desc'
      }

      // Act
      const result = await service.getGrowthTimeseries(body)

      // Assert
      expect(mockPublicationClient.post).toHaveBeenCalledWith(
        '/publication/stats/growth/partial-timeseries',
        body
      )
      expect(result).toEqual(mockTimeseriesResponse)
    })

    it('When fetching timeseries with optional date range, then includes dates in body', async () => {
      // Arrange
      mockPublicationClient.post.mockResolvedValue(mockTimeseriesResponse)
      const body = {
        sources: [{ source: 'google' }],
        orderBy: 'subscribers',
        orderDirection: 'asc',
        fromDate: '2024-01-01',
        toDate: '2024-01-31'
      }

      // Act
      const result = await service.getGrowthTimeseries(body)

      // Assert
      expect(mockPublicationClient.post).toHaveBeenCalledWith(
        '/publication/stats/growth/partial-timeseries',
        body
      )
      expect(result).toEqual(mockTimeseriesResponse)
    })

    it('When timeseries request fails, then propagates error', async () => {
      // Arrange
      const error = new Error('Server error')
      mockPublicationClient.post.mockRejectedValue(error)

      // Act & Assert
      await expect(
        service.getGrowthTimeseries({
          sources: [],
          orderBy: 'users',
          orderDirection: 'desc'
        })
      ).rejects.toThrow('Server error')
    })
  })

  describe('getGrowthEvents', () => {
    const mockEventsResponse = {
      pubEvents: [
        {
          id: 1,
          date: '2024-01-15',
          title: 'My great post',
          slug: 'my-great-post',
          type: 'text' as const,
          url: 'https://test.substack.com/p/my-great-post'
        },
        {
          id: 2,
          date: '2024-01-20',
          title: 'A quick note',
          slug: 'a-quick-note',
          type: 'note' as const
        }
      ]
    }

    it('When fetching growth events, then builds correct query string', async () => {
      // Arrange
      mockPublicationClient.get.mockResolvedValue(mockEventsResponse)

      // Act
      const result = await service.getGrowthEvents({
        fromDate: '2024-01-01',
        toDate: '2024-01-31'
      })

      // Assert
      expect(mockPublicationClient.get).toHaveBeenCalledWith(
        '/publication/stats/growth/events?from_date=2024-01-01&to_date=2024-01-31'
      )
      expect(result).toEqual(mockEventsResponse)
    })

    it('When growth events request fails, then propagates error', async () => {
      // Arrange
      const error = new Error('Unauthorized')
      mockPublicationClient.get.mockRejectedValue(error)

      // Act & Assert
      await expect(
        service.getGrowthEvents({ fromDate: '2024-01-01', toDate: '2024-01-31' })
      ).rejects.toThrow('Unauthorized')
    })
  })
})
