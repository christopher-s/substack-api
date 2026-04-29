import type { HttpClient } from '@substack-api/internal/http-client'

export class PostManagementService {
  constructor(private readonly publicationClient: HttpClient) {}

  async getPublishedPosts(options?: {
    offset?: number
    limit?: number
    orderBy?: string
    orderDirection?: string
  }): Promise<unknown> {
    const offset = options?.offset ?? 0
    const limit = options?.limit ?? 25
    const orderBy = options?.orderBy ?? 'post_date'
    const orderDirection = options?.orderDirection ?? 'desc'
    return await this.publicationClient.get<unknown>(
      `/post_management/published?offset=${offset}&limit=${limit}&order_by=${orderBy}&order_direction=${orderDirection}`
    )
  }

  async getDrafts(options?: {
    offset?: number
    limit?: number
    orderBy?: string
    orderDirection?: string
  }): Promise<unknown> {
    const offset = options?.offset ?? 0
    const limit = options?.limit ?? 25
    const orderBy = options?.orderBy ?? 'draft_updated_at'
    const orderDirection = options?.orderDirection ?? 'desc'
    return await this.publicationClient.get<unknown>(
      `/post_management/drafts?offset=${offset}&limit=${limit}&order_by=${orderBy}&order_direction=${orderDirection}`
    )
  }

  async getScheduledPosts(options?: {
    offset?: number
    limit?: number
    orderBy?: string
    orderDirection?: string
  }): Promise<unknown> {
    const offset = options?.offset ?? 0
    const limit = options?.limit ?? 25
    const orderBy = options?.orderBy ?? 'trigger_at'
    const orderDirection = options?.orderDirection ?? 'asc'
    return await this.publicationClient.get<unknown>(
      `/post_management/scheduled?offset=${offset}&limit=${limit}&order_by=${orderBy}&order_direction=${orderDirection}`
    )
  }

  async getPostCounts(query?: string): Promise<unknown> {
    return await this.publicationClient.get<unknown>(`/post_management/counts?query=${query ?? ''}`)
  }

  async getDraft(id: number): Promise<unknown> {
    return await this.publicationClient.get<unknown>(`/drafts/${id}`)
  }

  async createDraft(data: {
    title: string
    body?: string
    type?: string
    audience?: string
    bylineUserId?: number
  }): Promise<unknown> {
    const request = {
      draft_title: data.title,
      draft_body: data.body,
      type: data.type ?? 'newsletter',
      audience: data.audience ?? 'everyone',
      draft_bylines: data.bylineUserId
        ? [{ id: data.bylineUserId, is_draft: true, is_guest: false }]
        : undefined
    }
    return await this.publicationClient.post<unknown>('/drafts', request)
  }

  async updateDraft(
    id: number,
    data: { title?: string; body?: string; [key: string]: unknown }
  ): Promise<unknown> {
    const request: Record<string, unknown> = {}
    if (data.title !== undefined) request.draft_title = data.title
    if (data.body !== undefined) request.draft_body = data.body
    for (const [key, value] of Object.entries(data)) {
      if (key !== 'title' && key !== 'body') {
        request[key] = value
      }
    }
    return await this.publicationClient.put<unknown>(`/drafts/${id}`, request)
  }

  async publishDraft(id: number): Promise<unknown> {
    return await this.publicationClient.post<unknown>(`/drafts/${id}/publish`, {})
  }

  async deleteDraft(id: number): Promise<unknown> {
    return await this.publicationClient.delete<unknown>(`/drafts/${id}`)
  }
}
