import type { HttpClient } from '@substack-api/internal/http-client'
import type {
  SubstackPostManagementResponse,
  SubstackPostManagementCounts,
  SubstackDraftPost,
  SubstackDeleteResponse
} from '@substack-api/internal/types'
import {
  SubstackPostManagementResponseCodec,
  SubstackPostManagementCountsCodec,
  SubstackDraftPostCodec,
  SubstackDeleteResponseCodec
} from '@substack-api/internal/types'
import { decodeOrThrow } from '@substack-api/internal/validation'

export class PostManagementService {
  constructor(private readonly publicationClient: HttpClient) {}

  async getPublishedPosts(options?: {
    offset?: number
    limit?: number
    orderBy?: string
    orderDirection?: string
  }): Promise<SubstackPostManagementResponse> {
    const offset = options?.offset ?? 0
    const limit = options?.limit ?? 25
    const orderBy = options?.orderBy ?? 'post_date'
    const orderDirection = options?.orderDirection ?? 'desc'
    const response = await this.publicationClient.get<unknown>(
      `/post_management/published?offset=${offset}&limit=${limit}&order_by=${encodeURIComponent(orderBy)}&order_direction=${encodeURIComponent(orderDirection)}`
    )
    return decodeOrThrow(SubstackPostManagementResponseCodec, response, 'Published posts')
  }

  async getDrafts(options?: {
    offset?: number
    limit?: number
    orderBy?: string
    orderDirection?: string
  }): Promise<SubstackPostManagementResponse> {
    const offset = options?.offset ?? 0
    const limit = options?.limit ?? 25
    const orderBy = options?.orderBy ?? 'draft_updated_at'
    const orderDirection = options?.orderDirection ?? 'desc'
    const response = await this.publicationClient.get<unknown>(
      `/post_management/drafts?offset=${offset}&limit=${limit}&order_by=${encodeURIComponent(orderBy)}&order_direction=${encodeURIComponent(orderDirection)}`
    )
    return decodeOrThrow(SubstackPostManagementResponseCodec, response, 'Drafts')
  }

  async getScheduledPosts(options?: {
    offset?: number
    limit?: number
    orderBy?: string
    orderDirection?: string
  }): Promise<SubstackPostManagementResponse> {
    const offset = options?.offset ?? 0
    const limit = options?.limit ?? 25
    const orderBy = options?.orderBy ?? 'trigger_at'
    const orderDirection = options?.orderDirection ?? 'asc'
    const response = await this.publicationClient.get<unknown>(
      `/post_management/scheduled?offset=${offset}&limit=${limit}&order_by=${encodeURIComponent(orderBy)}&order_direction=${encodeURIComponent(orderDirection)}`
    )
    return decodeOrThrow(SubstackPostManagementResponseCodec, response, 'Scheduled posts')
  }

  async getPostCounts(query?: string): Promise<SubstackPostManagementCounts> {
    const response = await this.publicationClient.get<unknown>(
      `/post_management/counts?query=${encodeURIComponent(query ?? '')}`
    )
    return decodeOrThrow(SubstackPostManagementCountsCodec, response, 'Post counts')
  }

  async getDraft(id: number): Promise<SubstackDraftPost> {
    const response = await this.publicationClient.get<unknown>(`/drafts/${id}`)
    return decodeOrThrow(SubstackDraftPostCodec, response, 'Draft')
  }

  async createDraft(data: {
    title: string
    body?: string
    type?: string
    audience?: string
    bylineUserId?: number
  }): Promise<SubstackDraftPost> {
    if (data.title !== undefined && data.title.length > 200) {
      throw new Error('Draft title exceeds maximum length of 200 characters')
    }
    if (data.body !== undefined && data.body.trim().length === 0) {
      throw new Error('Draft body cannot be empty')
    }
    const request = {
      draft_title: data.title,
      draft_body: data.body,
      type: data.type ?? 'newsletter',
      audience: data.audience ?? 'everyone',
      draft_bylines: data.bylineUserId
        ? [{ id: data.bylineUserId, is_draft: true, is_guest: false }]
        : undefined
    }
    const response = await this.publicationClient.post<unknown>('/drafts', request)
    return decodeOrThrow(SubstackDraftPostCodec, response, 'Created draft')
  }

  async updateDraft(
    id: number,
    data: { title?: string; body?: string; [key: string]: unknown }
  ): Promise<SubstackDraftPost> {
    if (data.title !== undefined && data.title.length > 200) {
      throw new Error('Draft title exceeds maximum length of 200 characters')
    }
    if (data.body !== undefined && data.body.trim().length === 0) {
      throw new Error('Draft body cannot be empty')
    }
    const request: Record<string, unknown> = {}
    if (data.title !== undefined) request.draft_title = data.title
    if (data.body !== undefined) request.draft_body = data.body
    for (const [key, value] of Object.entries(data)) {
      if (key !== 'title' && key !== 'body') {
        request[key] = value
      }
    }
    const response = await this.publicationClient.put<unknown>(`/drafts/${id}`, request)
    return decodeOrThrow(SubstackDraftPostCodec, response, 'Updated draft')
  }

  async publishDraft(id: number): Promise<SubstackDraftPost> {
    const response = await this.publicationClient.post<unknown>(`/drafts/${id}/publish`, {})
    return decodeOrThrow(SubstackDraftPostCodec, response, 'Published draft')
  }

  async deleteDraft(id: number): Promise<SubstackDeleteResponse> {
    const response = await this.publicationClient.delete<unknown>(`/drafts/${id}`)
    return decodeOrThrow(SubstackDeleteResponseCodec, response, 'Delete draft')
  }
}
