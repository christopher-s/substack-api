import type { HttpClient } from '@substack-api/internal/http-client'
import type {
  SubstackPublicationPost,
  SubstackPublicationFullPost,
  SubstackFacepile,
  SubstackLiveStreamResponse,
  SubstackPublicationExport,
  SubstackPublicationSearchResponse,
  SubstackLiveStreamList,
  SubstackEligibleHosts
} from '@substack-api/internal/types'
import {
  SubstackPublicationPostCodec,
  SubstackPublicationFullPostCodec,
  SubstackFacepileCodec,
  SubstackLiveStreamResponseCodec,
  SubstackPublicationExportCodec,
  SubstackPublicationSearchResponseCodec,
  SubstackLiveStreamListCodec,
  SubstackEligibleHostsCodec
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
    pinnedPosts?: SubstackPublicationPost[]
    sections?: unknown[]
    publication?: unknown
  }> {
    const response = await this.publicationClient.get<{
      newPosts?: unknown[]
      pinnedPosts?: unknown[]
      sections?: unknown[]
      publication?: unknown
    }>('/homepage_data')

    const posts = (response.newPosts || []).map((post, i) =>
      decodeOrThrow(SubstackPublicationPostCodec, post, `Homepage post ${i}`)
    )

    const pinned = (response.pinnedPosts || []).map((post, i) =>
      decodeOrThrow(SubstackPublicationPostCodec, post, `Pinned post ${i}`)
    )

    return {
      newPosts: posts,
      pinnedPosts: pinned.length > 0 ? pinned : undefined,
      sections: response.sections,
      publication: response.publication
    }
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
    if (options?.sort && options.sort !== 'new') params.set('sort', options.sort)
    if (options?.search) params.set('search', options.search)
    if (options?.offset !== undefined && options.offset !== 0)
      params.set('offset', String(options.offset))
    if (options?.limit !== undefined && options.limit !== 25)
      params.set('limit', String(options.limit))

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
    const response = await this.publicationClient.get<unknown>(
      `/post/${encodeURIComponent(String(postId))}/facepile`
    )
    return decodeOrThrow(SubstackFacepileCodec, response, 'Facepile response')
  }

  /**
   * Get active live stream for a publication
   * GET {pub}/api/v1/live_streams/active/pub/{publicationId} (anonymous)
   */
  async getActiveLiveStream(publicationId: number): Promise<SubstackLiveStreamResponse> {
    const response = await this.publicationClient.get<unknown>(
      `/live_streams/active/pub/${encodeURIComponent(String(publicationId))}`
    )
    return decodeOrThrow(SubstackLiveStreamResponseCodec, response, 'Live stream response')
  }

  /**
   * Mark a post as seen
   * POST {pub}/api/v1/posts/{postId}/seen (anonymous)
   */
  async markPostSeen(postId: number): Promise<void> {
    await this.publicationClient.post(`/posts/${encodeURIComponent(String(postId))}/seen`)
  }

  /**
   * Get publication export status/history
   * GET {pub}/api/v1/publication_export (requires auth)
   */
  async getPublicationExport(): Promise<SubstackPublicationExport[]> {
    const response = await this.publicationClient.get<unknown[]>('/publication_export')
    return response.map((item, i) =>
      decodeOrThrow(SubstackPublicationExportCodec, item, `Publication export ${i}`)
    )
  }

  /**
   * Search for publications
   * GET /api/v1/publication/search?query=...&limit=... (anonymous)
   */
  async searchPublications(
    query: string,
    options?: { limit?: number }
  ): Promise<SubstackPublicationSearchResponse> {
    const params = new URLSearchParams({ query })
    if (options?.limit !== undefined) {
      params.set('limit', String(options.limit))
    }
    const response = await this.publicationClient.get<unknown>(
      `/publication/search?${params.toString()}`
    )
    return decodeOrThrow(SubstackPublicationSearchResponseCodec, response, 'Publication search')
  }

  async getLiveStreams(status?: string): Promise<SubstackLiveStreamList> {
    const params = status ? `?status=${status}` : '?status=scheduled'
    const response = await this.publicationClient.get<unknown>(`/live_streams${params}`)
    return decodeOrThrow(SubstackLiveStreamListCodec, response, 'Live streams')
  }

  async getEligibleHosts(publicationId: number): Promise<SubstackEligibleHosts> {
    const response = await this.publicationClient.get<unknown>(
      `/live_stream/eligible_hosts?publication_id=${publicationId}`
    )
    return decodeOrThrow(SubstackEligibleHostsCodec, response, 'Eligible hosts')
  }
}
