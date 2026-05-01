import { Comment } from '@substack-api/domain'
import type { CommentService } from '@substack-api/internal/services'
import type {
  SubstackCommentRepliesResponse,
  SubstackCreatedComment,
  SubstackDeleteResponse
} from '@substack-api/internal/types'
import type { HttpClient } from '@substack-api/internal/http-client'

/**
 * Sub-client for comment-related operations.
 */
export class CommentClient {
  constructor(
    private readonly commentService: CommentService,
    private readonly publicationClient: HttpClient
  ) {}

  async commentForId(id: number): Promise<Comment> {
    const commentData = await this.commentService.getCommentById(id)
    return new Comment(commentData, this.publicationClient)
  }

  async commentReplies(
    commentId: number,
    options?: { cursor?: string }
  ): Promise<SubstackCommentRepliesResponse> {
    return await this.commentService.getReplies(commentId, options)
  }

  async *commentRepliesFeed(
    commentId: number,
    options: { limit?: number } = {}
  ): AsyncGenerator<SubstackCommentRepliesResponse> {
    let cursor: string | undefined
    let totalYielded = 0

    while (true) {
      const response = await this.commentService.getReplies(commentId, { cursor })
      const branches = response.commentBranches ?? []
      const remaining = options.limit !== undefined ? options.limit - totalYielded : undefined

      if (remaining !== undefined && branches.length > remaining) {
        yield { ...response, commentBranches: branches.slice(0, remaining) }
        return
      }

      yield response
      totalYielded += branches.length

      if (!response.nextCursor) break
      cursor = response.nextCursor
    }
  }

  async createComment(postId: number, body: string): Promise<SubstackCreatedComment> {
    return await this.commentService.createComment(postId, body)
  }

  async deleteComment(commentId: number): Promise<SubstackDeleteResponse> {
    return await this.commentService.deleteComment(commentId)
  }

  async likeComment(commentId: number): Promise<void> {
    await this.commentService.likeComment(commentId)
  }

  async unlikeComment(commentId: number): Promise<void> {
    await this.commentService.unlikeComment(commentId)
  }
}
