import type { SubstackFullPost, SubstackPreviewPost } from '@substack-api/internal'
import type { EntityDeps } from '@substack-api/domain/entity-deps'
import { Comment } from '@substack-api/domain/comment'
import { getErrorMessage } from '@substack-api/internal/validation'

/**
 * Post interface defining the common contract for all post types
 */
export interface Post {
  readonly id: number
  readonly title: string
  readonly subtitle: string
  readonly body: string
  readonly truncatedBody: string
  readonly likesCount: number
  readonly author: {
    id: number
    name: string
    handle: string
    avatarUrl: string
  }
  readonly publishedAt: Date

  comments(options?: { limit?: number }): AsyncIterable<Comment>
}

/**
 * PreviewPost entity representing a Substack post with truncated content
 */
export class PreviewPost implements Post {
  public readonly id: number
  public readonly title: string
  public readonly subtitle: string
  public readonly body: string
  public readonly truncatedBody: string
  public readonly likesCount: number
  public readonly author: {
    id: number
    name: string
    handle: string
    avatarUrl: string
  }
  public readonly publishedAt: Date
  public readonly slug?: string
  public readonly url?: string
  public readonly coverImage?: string
  public readonly reactions?: Record<string, number>
  public readonly restacks?: number
  public readonly postTags?: string[]
  public readonly commentCount?: number
  public readonly wordcount?: number
  public readonly type?: string
  public readonly audience?: string
  public readonly description?: string
  public readonly podcastUrl?: string

  private readonly deps: EntityDeps

  constructor(rawData: SubstackPreviewPost, deps: EntityDeps) {
    this.deps = deps
    this.id = rawData.id
    this.title = rawData.title
    this.subtitle = rawData.subtitle || ''
    this.truncatedBody = rawData.truncated_body_text || ''
    this.body = rawData.truncated_body_text || ''
    this.likesCount = rawData.reaction_count || 0
    this.publishedAt = new Date(rawData.post_date)
    this.slug = rawData.slug || undefined
    this.url = rawData.canonical_url || undefined
    this.coverImage = rawData.cover_image || undefined
    this.reactions = rawData.reactions || undefined
    this.restacks = rawData.restacks || undefined
    this.postTags = rawData.postTags?.map((tag) => tag.name) || undefined
    this.commentCount = rawData.comment_count || undefined
    this.wordcount = rawData.wordcount || undefined
    this.type = rawData.type || undefined
    this.audience = rawData.audience || undefined
    this.description = rawData.description || undefined
    this.podcastUrl = rawData.podcast_url || undefined

    // Extract author from publishedBylines if available
    const byline = rawData.publishedBylines?.[0]
    this.author = byline
      ? { id: byline.id, name: byline.name, handle: byline.handle, avatarUrl: byline.photo_url }
      : { id: 0, name: 'Unknown Author', handle: 'unknown', avatarUrl: '' }
  }

  /**
   * Get comments for this post
   */
  async *comments(options: { limit?: number } = {}): AsyncIterable<Comment> {
    try {
      const response = await this.deps.commentService.getCommentsForPost(this.id)

      let count = 0
      for (const commentData of response.comments) {
        if (options.limit && count >= options.limit) break
        yield new Comment(commentData, this.deps)
        count++
      }
    } catch (error) {
      throw new Error(`Failed to get comments for post ${this.id}: ${getErrorMessage(error)}`, {
        cause: error
      })
    }
  }

  /**
   * Fetch the full post data with HTML body content
   * @returns Promise<FullPost> - A FullPost instance with complete content
   * @throws {Error} When full post retrieval fails
   */
  async fullPost(): Promise<FullPost> {
    try {
      const fullPostData = await this.deps.postService.getPostById(this.id)
      return new FullPost(fullPostData, this.deps)
    } catch (error) {
      throw new Error(`Failed to fetch full post ${this.id}: ${getErrorMessage(error)}`, {
        cause: error
      })
    }
  }
}

/**
 * FullPost entity representing a Substack post with complete HTML content
 */
export class FullPost implements Post {
  public readonly id: number
  public readonly title: string
  public readonly subtitle: string
  public readonly body: string
  public readonly truncatedBody: string
  public readonly likesCount: number
  public readonly author: {
    id: number
    name: string
    handle: string
    avatarUrl: string
  }
  public readonly publishedAt: Date
  public readonly htmlBody: string
  public readonly slug?: string
  public readonly createdAt: Date
  public readonly reactions?: Record<string, number>
  public readonly restacks?: number
  public readonly postTags?: string[]
  public readonly coverImage?: string
  public readonly url?: string
  public readonly commentCount?: number
  public readonly wordcount?: number
  public readonly type?: string
  public readonly audience?: string
  public readonly description?: string
  public readonly podcastUrl?: string

  private readonly deps: EntityDeps

  constructor(rawData: SubstackFullPost, deps: EntityDeps) {
    this.deps = deps
    this.id = rawData.id
    this.title = rawData.title
    this.subtitle = rawData.subtitle || ''
    this.truncatedBody = rawData.truncated_body_text || ''
    this.body = rawData.body_html || rawData.htmlBody || rawData.truncated_body_text || ''
    this.likesCount = rawData.reaction_count || 0
    this.publishedAt = new Date(rawData.post_date)
    this.url = rawData.canonical_url || undefined

    // Extract author from publishedBylines if available
    const byline = rawData.publishedBylines?.[0]
    this.author = byline
      ? { id: byline.id, name: byline.name, handle: byline.handle, avatarUrl: byline.photo_url }
      : { id: 0, name: 'Unknown Author', handle: 'unknown', avatarUrl: '' }

    // Prefer body_html from the full post response, fall back to htmlBody for backward compatibility
    this.htmlBody = rawData.body_html || rawData.htmlBody || ''
    this.slug = rawData.slug || undefined
    this.createdAt = new Date(rawData.post_date)
    this.reactions = rawData.reactions || undefined
    this.restacks = rawData.restacks || undefined
    this.postTags = rawData.postTags || undefined
    this.coverImage = rawData.cover_image || undefined
    this.commentCount = rawData.comment_count || undefined
    this.wordcount = rawData.wordcount || undefined
    this.type = rawData.type || undefined
    this.audience = rawData.audience || undefined
    this.description = rawData.description || undefined
    this.podcastUrl = rawData.podcast_url || undefined
  }

  /**
   * Get comments for this post
   */
  async *comments(options: { limit?: number } = {}): AsyncIterable<Comment> {
    try {
      const response = await this.deps.commentService.getCommentsForPost(this.id)

      let count = 0
      for (const commentData of response.comments) {
        if (options.limit && count >= options.limit) break
        yield new Comment(commentData, this.deps)
        count++
      }
    } catch (error) {
      throw new Error(`Failed to get comments for post ${this.id}: ${getErrorMessage(error)}`, {
        cause: error
      })
    }
  }
}
