import type { HttpClient } from '@substack-api/internal/http-client'
import { decodeOrThrow } from '@substack-api/internal/validation'
import {
  GrowthSourcesCodec,
  GrowthTimeseriesCodec,
  GrowthEventsCodec
} from '@substack-api/internal/types/growth-stats'
import type {
  GrowthSources,
  GrowthTimeseries,
  GrowthEvents
} from '@substack-api/internal/types/growth-stats'

/**
 * Service for publication growth statistics: sources, timeseries, and events.
 * Thin HTTP wrappers over Substack growth analytics endpoints.
 */
export class GrowthStatsService {
  constructor(private readonly publicationClient: HttpClient) {}

  /**
   * Get traffic/subscriber source breakdown with hierarchical children.
   * GET /api/v1/publication/stats/growth/sources
   */
  async getGrowthSources(options: {
    fromDate: string
    toDate: string
    orderBy?: string
    orderDirection?: string
  }): Promise<GrowthSources> {
    const params = new URLSearchParams()
    params.set('order_by', options.orderBy ?? 'users')
    params.set('order_direction', options.orderDirection ?? 'desc')
    params.set('from_date', options.fromDate)
    params.set('to_date', options.toDate)

    const response = await this.publicationClient.get<unknown>(
      `/publication/stats/growth/sources?${params.toString()}`
    )
    return decodeOrThrow(GrowthSourcesCodec, response, 'growth sources')
  }

  /**
   * Get timeseries chart data for growth sources.
   * POST /api/v1/publication/stats/growth/partial-timeseries
   */
  async getGrowthTimeseries(data: {
    sources: unknown[]
    orderBy: string
    orderDirection: string
    fromDate?: string
    toDate?: string
  }): Promise<GrowthTimeseries> {
    const response = await this.publicationClient.post<unknown>(
      '/publication/stats/growth/partial-timeseries',
      data
    )
    return decodeOrThrow(GrowthTimeseriesCodec, response, 'growth timeseries')
  }

  /**
   * Get publication events for correlating growth spikes.
   * GET /api/v1/publication/stats/growth/events
   */
  async getGrowthEvents(options: { fromDate: string; toDate: string }): Promise<GrowthEvents> {
    const params = new URLSearchParams()
    params.set('from_date', options.fromDate)
    params.set('to_date', options.toDate)
    const response = await this.publicationClient.get<unknown>(
      `/publication/stats/growth/events?${params.toString()}`
    )
    return decodeOrThrow(GrowthEventsCodec, response, 'growth events')
  }
}
