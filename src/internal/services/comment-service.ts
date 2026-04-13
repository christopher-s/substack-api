import type { HttpClient } from '@substack-api/internal/http-client'
import type {
  SubstackComment,
  SubstackCommentRepliesResponse
} from '@substack-api/internal/types'
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
    private readonly publicationClient: HttpClient,
    private readonly substackClient: HttpClient
  ) {}

  /**
   * Get comments for a post
   * @param postId - The post ID
   * @returns Promise<SubstackComment[]> - Raw comment data from API (validated)
   * @throws {Error} When comments cannot be retrieved or validation fails
   */
  async getCommentsForPost(postId: number): Promise<SubstackComment[]> {
    const response = await this.publicationClient.get<{ comments?: unknown[] }>(
      `/post/${postId}/comments`
    )

    const comments = response.comments || []

    // Validate each comment with io-ts
    return comments.map((comment, index) =>
      decodeOrThrow(SubstackCommentCodec, comment, `Comment ${index} in post response`)
    )
  }

  /**
   * Get a specific comment by ID
   * @param id - The comment ID
   * @returns Promise<SubstackComment> - Raw comment data from API (validated)
   * @throws {Error} When comment is not found, API request fails, or validation fails
   */
  async getCommentById(id: number): Promise<SubstackComment> {
    const rawResponse = await this.publicationClient.get<unknown>(`/reader/comment/${id}`)

    // Validate the response structure with io-ts
    const response = decodeOrThrow(SubstackCommentResponseCodec, rawResponse, 'Comment response')

    // Transform the validated API response to match SubstackComment interface
    const commentData: SubstackComment = {
      id: response.item.comment.id,
      body: response.item.comment.body,
      author_is_admin: false // Default value since not in response
    }

    // Validate the transformed data as well
    return decodeOrThrow(SubstackCommentCodec, commentData, 'Transformed comment data')
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
      `/reader/comment/${commentId}/replies${query}`
    )
    return decodeOrThrow(SubstackCommentRepliesResponseCodec, response, 'Comment replies')
  }
}
