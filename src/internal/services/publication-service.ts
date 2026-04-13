import type { HttpClient } from '@substack-api/internal/http-client'
import type {
  SubstackPublicationPost,
  SubstackPublicationFullPost,
  SubstackFacepile,
  SubstackLiveStreamResponse
} from '@substack-api/internal/types'
import {
  SubstackPublicationPostCodec,
  SubstackPublicationFullPostCodec,
  SubstackFacepileCodec,
  SubstackLiveStreamResponseCodec
} from '@substack-api/internal/types'
import { decodeOrThrow } from '@substack-api/internal/validation'

/**
 * Service for publication-specific endpoints: archive, homepage, facepile
 * All endpoints work anonymously (no auth required).
 * Uses the publicationClient (publication-specific domain).
 */
export class PublicationService {
  constructor(private readonly publicationClient: HttpClient) {}

  /**
   * Get publication homepage data including recent posts
   * GET {pub}/api/v1/homepage_data (anonymous)
   */
  async getHomepageData(): Promise<{
    newPosts: SubstackPublicationPost[]
  }> {
    const response = await this.publicationClient.get<{
      newPosts?: unknown[]
    }>('/homepage_data')

    const posts = (response.newPosts || []).map((post, i) =>
      decodeOrThrow(SubstackPublicationPostCodec, post, `Homepage post ${i}`)
    )

    return { newPosts: posts }
  }

  /**
   * Get publication post archive
   * GET {pub}/api/v1/archive?sort=&search=&offset=&limit= (anonymous)
   */
  async getArchive(options?: {
    sort?: 'top' | 'new'
    search?: string
    offset?: number
    limit?: number
  }): Promise<SubstackPublicationPost[]> {
    const params = new URLSearchParams()
    params.set('sort', options?.sort || 'new')
    params.set('search', options?.search || '')
    params.set('offset', String(options?.offset ?? 0))
    params.set('limit', String(options?.limit ?? 25))

    const response = await this.publicationClient.get<unknown[]>(`/archive?${params.toString()}`)

    return response.map((post, i) =>
      decodeOrThrow(SubstackPublicationPostCodec, post, `Archive post ${i}`)
    )
  }

  /**
   * Get full publication posts including body_html
   * GET {pub}/api/v1/posts?limit=&offset= (anonymous)
   */
  async getPosts(options?: {
    limit?: number
    offset?: number
  }): Promise<SubstackPublicationFullPost[]> {
    const params = new URLSearchParams()
    params.set('offset', String(options?.offset ?? 0))
    params.set('limit', String(options?.limit ?? 25))

    const response = await this.publicationClient.get<unknown[]>(`/posts?${params.toString()}`)

    return response.map((post, i) =>
      decodeOrThrow(SubstackPublicationFullPostCodec, post, `Full post ${i}`)
    )
  }

  /**
   * Get facepile (reactors) for a post
   * GET {pub}/api/v1/post/{id}/facepile (anonymous)
   */
  async getPostFacepile(postId: number): Promise<SubstackFacepile> {
    const response = await this.publicationClient.get<unknown>(`/post/${postId}/facepile`)
    return decodeOrThrow(SubstackFacepileCodec, response, 'Facepile response')
  }

  /**
   * Get active live stream for a publication
   * GET {pub}/api/v1/live_streams/active/pub/{publicationId} (anonymous)
   */
  async getActiveLiveStream(publicationId: number): Promise<SubstackLiveStreamResponse> {
    const response = await this.publicationClient.get<unknown>(
      `/live_streams/active/pub/${publicationId}`
    )
    return decodeOrThrow(SubstackLiveStreamResponseCodec, response, 'Live stream response')
  }

  /**
   * Mark a post as seen
   * POST {pub}/api/v1/posts/{postId}/seen (anonymous)
   */
  async markPostSeen(postId: number): Promise<void> {
    await this.publicationClient.post(`/posts/${postId}/seen`)
  }
}
