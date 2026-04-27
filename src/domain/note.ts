import type { SubstackNote } from '@substack-api/internal'
import type { HttpClient } from '@substack-api/internal/http-client'
import { Comment } from '@substack-api/domain/comment'

/**
 * Note entity representing a Substack note
 */
export class Note {
  public readonly id: string
  public readonly body: string
  public readonly likesCount: number
  public readonly author: {
    id: number
    name: string
    handle: string
    avatarUrl: string
  }
  public readonly publishedAt: Date

  constructor(
    private readonly rawData: SubstackNote,
    private readonly publicationClient: HttpClient
  ) {
    this.id = rawData.entity_key
    this.body = rawData.comment?.body || ''
    this.likesCount = rawData.comment?.reaction_count || 0
    this.publishedAt = new Date(rawData.context?.timestamp ?? Date.now())

    // Extract author info from context users
    const firstUser = rawData.context?.users[0]
    this.author = {
      id: firstUser?.id || 0,
      name: firstUser?.name || 'Unknown',
      handle: firstUser?.handle || 'unknown',
      avatarUrl: firstUser?.photo_url || ''
    }
  }

  /**
   * Get parent comments for this note
   */
  async *comments(): AsyncIterable<Comment> {
    // Convert parent comments to Comment entities
    for (const parentComment of this.rawData.parentComments || []) {
      if (parentComment) {
        // Convert note comment format to SubstackComment format - minimal fields only
        const commentData = {
          id: parentComment.id,
          body: parentComment.body,
          user_id: parentComment.user_id,
          type: parentComment.type,
          date: parentComment.date,
          name: parentComment.name,
          reaction_count: parentComment.reaction_count,
          reactions: parentComment.reactions,
          restacks: parentComment.restacks,
          restacked: parentComment.restacked,
          children_count: parentComment.children_count,
          author_is_admin: false // Not available in note comment format
        }
        yield new Comment(commentData, this.publicationClient)
      }
    }
  }

  /**
   * Like this note
   */
  async like(): Promise<void> {
    // Implementation will like the note via the client
    // This requires authentication and proper API endpoints
    throw new Error('Note liking is not supported by this version of the API')
  }

  /**
   * Add a comment to this note
   */
  async addComment(_text: string): Promise<Comment> {
    // Implementation will add a comment via the client
    // This requires authentication and proper API endpoints
    throw new Error('Note commenting is not supported by this version of the API')
  }
}
