import type { HttpClient } from '@substack-api/internal/http-client'
import { decodeOrThrow } from '@substack-api/internal/validation'
import {
  DashboardSummaryCodec,
  EmailsTimeseriesCodec,
  UnreadActivityCodec,
  UnreadMessageCountCodec
} from '@substack-api/internal/types/dashboard'
import type {
  DashboardSummary,
  EmailsTimeseries,
  UnreadActivity,
  UnreadMessageCount
} from '@substack-api/internal/types/dashboard'

/**
 * Service for publication dashboard data: KPI summary, email timeseries,
 * unread activity/message counts, and growth suggestions.
 * Thin HTTP wrappers over Substack dashboard endpoints.
 */
export class DashboardService {
  constructor(private readonly publicationClient: HttpClient) {}

  /**
   * Get dashboard KPI summary (subscriber counts, ARR, views, pledged ARR).
   * GET /api/v1/publish-dashboard/summary-v2?range=365
   */
  async getDashboardSummary(options?: { range?: number }): Promise<DashboardSummary> {
    const params = new URLSearchParams()
    params.set('range', String(options?.range ?? 365))

    const response = await this.publicationClient.get<unknown>(
      `/publish-dashboard/summary-v2?${params.toString()}`
    )
    return decodeOrThrow(DashboardSummaryCodec, response, 'dashboard summary')
  }

  /**
   * Get subscriber count timeseries from email stats.
   * GET /api/v1/publication/stats/emails/timeseries?from=ISO_DATE
   */
  async getEmailsTimeseries(options: { from: string }): Promise<EmailsTimeseries> {
    const params = new URLSearchParams()
    params.set('from', options.from)

    const response = await this.publicationClient.get<unknown>(
      `/publication/stats/emails/timeseries?${params.toString()}`
    )
    return decodeOrThrow(EmailsTimeseriesCodec, response, 'emails timeseries')
  }

  /**
   * Get unread notification count.
   * GET /api/v1/activity/unread
   */
  async getUnreadActivity(): Promise<UnreadActivity> {
    const response = await this.publicationClient.get<unknown>('/activity/unread')
    return decodeOrThrow(UnreadActivityCodec, response, 'unread activity')
  }

  /**
   * Get unread message count.
   * GET /api/v1/messages/unread-count
   */
  async getUnreadMessageCount(): Promise<UnreadMessageCount> {
    const response = await this.publicationClient.get<unknown>('/messages/unread-count')
    return decodeOrThrow(UnreadMessageCountCodec, response, 'unread message count')
  }
}
