import type { HttpClient } from '@substack-api/internal/http-client'

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
  async getDashboardSummary(options?: { range?: number }): Promise<unknown> {
    const params = new URLSearchParams()
    params.set('range', String(options?.range ?? 365))

    return await this.publicationClient.get<unknown>(
      `/publish-dashboard/summary-v2?${params.toString()}`
    )
  }

  /**
   * Get subscriber count timeseries from email stats.
   * GET /api/v1/publication/stats/emails/timeseries?from=ISO_DATE
   */
  async getEmailsTimeseries(options: { from: string }): Promise<unknown> {
    const params = new URLSearchParams()
    params.set('from', options.from)

    return await this.publicationClient.get<unknown>(
      `/publication/stats/emails/timeseries?${params.toString()}`
    )
  }

  /**
   * Get unread notification count.
   * GET /api/v1/activity/unread
   */
  async getUnreadActivity(): Promise<unknown> {
    return await this.publicationClient.get<unknown>('/activity/unread')
  }

  /**
   * Get unread message count.
   * GET /api/v1/messages/unread-count
   */
  async getUnreadMessageCount(): Promise<unknown> {
    return await this.publicationClient.get<unknown>('/messages/unread-count')
  }

  /**
   * Get growth suggestion tip.
   * GET /api/v1/grow/suggestion
   */
  async getGrowthSuggestion(): Promise<unknown> {
    return await this.publicationClient.get<unknown>('/grow/suggestion')
  }
}
