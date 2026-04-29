import type { HttpClient } from '@substack-api/internal/http-client'
import type { SubstackComment, SubstackCommentRepliesResponse } from '@substack-api/internal/types'
import {
  SubstackCommentCodec,
  SubstackCommentResponseCodec,
  SubstackCommentRepliesResponseCodec
} from '@substack-api/internal/types'
import { decodeOrThrow } from '@substack-api/internal/validation'

/**
 * Service responsible for comment-related HTTP operations
 * Returns internal types that can be transformed into domain models
 */
export class CommentService {
  constructor(
    // publicationClient for endpoints under a specific publication domain (e.g. /post/{id}/comments)
    private readonly publicationClient: HttpClient,
    // substackClient for global endpoints under substack.com (e.g. /reader/comment/{id}/replies)
    private readonly substackClient: HttpClient
  ) {}

  /**
   * Get comments for a post
   * @param postId - The post ID
   * @returns Promise<SubstackComment[]> - Raw comment data from API (validated)
   * @throws {Error} When comments cannot be retrieved or validation fails
   */
  async getCommentsForPost(
    postId: number
  ): Promise<{ comments: SubstackComment[]; more: boolean }> {
    const response = await this.publicationClient.get<{
      comments?: unknown[]
      more?: boolean
    }>(`/post/${encodeURIComponent(String(postId))}/comments`)

    const comments = response.comments || []

    // Validate each comment with io-ts
    const validatedComments = comments.map((comment, index) =>
      decodeOrThrow(SubstackCommentCodec, comment, `Comment ${index} in post response`)
    )

    return { comments: validatedComments, more: response.more ?? false }
  }

  /**
   * Get a specific comment by ID
   * @param id - The comment ID
   * @returns Promise<SubstackComment> - Raw comment data from API (validated)
   * @throws {Error} When comment is not found, API request fails, or validation fails
   */
  async getCommentById(id: number): Promise<SubstackComment> {
    const rawResponse = await this.publicationClient.get<unknown>(
      `/reader/comment/${encodeURIComponent(String(id))}`
    )
    const response = decodeOrThrow(SubstackCommentResponseCodec, rawResponse, 'Comment response')
    return response.item.comment
  }

  /**
   * Get threaded replies to a comment
   * GET /api/v1/reader/comment/{id}/replies (anonymous, cursor-paginated)
   */
  async getReplies(
    commentId: number,
    options?: { cursor?: string }
  ): Promise<SubstackCommentRepliesResponse> {
    const params = new URLSearchParams()
    if (options?.cursor) {
      params.set('cursor', options.cursor)
    }
    const query = params.toString() ? `?${params.toString()}` : ''
    const response = await this.substackClient.get<unknown>(
      `/reader/comment/${encodeURIComponent(String(commentId))}/replies${query}`
    )
    return decodeOrThrow(SubstackCommentRepliesResponseCodec, response, 'Comment replies')
  }

  async createComment(postId: number, body: string): Promise<unknown> {
    return await this.publicationClient.post<unknown>(
      `/post/${encodeURIComponent(String(postId))}/comment`,
      { body, post_id: postId }
    )
  }

  async deleteComment(commentId: number): Promise<unknown> {
    return await this.publicationClient.delete<unknown>(
      `/comment/${encodeURIComponent(String(commentId))}`
    )
  }
}
