import type { SubstackFullPost, SubstackPreviewPost } from '@substack-api/internal'
import type { EntityDeps } from '@substack-api/domain/entity-deps'
import { Comment } from '@substack-api/domain/comment'

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
  like(): Promise<void>
  addComment(data: { body: string }): Promise<Comment>
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

    // Extract author from publishedBylines if available
    const byline = (rawData.publishedBylines as unknown as Array<{ id: number; name: string; handle: string; photo_url: string }> | null | undefined)?.[0]
    this.author = byline
      ? { id: byline.id, name: byline.name, handle: byline.handle, avatarUrl: byline.photo_url }
      : { id: 0, name: 'Unknown Author', handle: 'unknown', avatarUrl: '' }
  }

  /**
   * Get comments for this post
   */
  async *comments(options: { limit?: number } = {}): AsyncIterable<Comment> {
    try {
      const commentsData = await this.deps.commentService.getCommentsForPost(this.id)

      let count = 0
      for (const commentData of commentsData) {
        if (options.limit && count >= options.limit) break
        yield new Comment(commentData, this.deps.publicationClient)
        count++
      }
    } catch (error) {
      throw new Error(`Failed to get comments for post ${this.id}: ${(error as Error).message}`)
    }
  }

  /**
   * Like this post
   */
  async like(): Promise<void> {
    throw new Error('Post liking is not supported by this version of the API')
  }

  /**
   * Add a comment to this post
   */
  async addComment(_data: { body: string }): Promise<Comment> {
    throw new Error('Comment creation is not supported by this version of the API')
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
      throw new Error(`Failed to fetch full post ${this.id}: ${(error as Error).message}`)
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
  public readonly slug: string
  public readonly createdAt: Date
  public readonly reactions?: Record<string, number>
  public readonly restacks?: number
  public readonly postTags?: string[]
  public readonly coverImage?: string
  public readonly url: string

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
    this.url = rawData.canonical_url

    // Extract author from publishedBylines if available
    const byline = (rawData.publishedBylines as unknown as Array<{ id: number; name: string; handle: string; photo_url: string }> | null | undefined)?.[0]
    this.author = byline
      ? { id: byline.id, name: byline.name, handle: byline.handle, avatarUrl: byline.photo_url }
      : { id: 0, name: 'Unknown Author', handle: 'unknown', avatarUrl: '' }

    // Prefer body_html from the full post response, fall back to htmlBody for backward compatibility
    this.htmlBody = rawData.body_html || rawData.htmlBody || ''
    this.slug = rawData.slug
    this.createdAt = new Date(rawData.post_date)
    this.reactions = rawData.reactions
    this.restacks = rawData.restacks
    this.postTags = rawData.postTags
    this.coverImage = rawData.cover_image
  }

  /**
   * Get comments for this post
   */
  async *comments(options: { limit?: number } = {}): AsyncIterable<Comment> {
    try {
      const commentsData = await this.deps.commentService.getCommentsForPost(this.id)

      let count = 0
      for (const commentData of commentsData) {
        if (options.limit && count >= options.limit) break
        yield new Comment(commentData, this.deps.publicationClient)
        count++
      }
    } catch (error) {
      throw new Error(`Failed to get comments for post ${this.id}: ${(error as Error).message}`)
    }
  }

  /**
   * Like this post
   */
  async like(): Promise<void> {
    throw new Error('Post liking is not supported by this version of the API')
  }

  /**
   * Add a comment to this post
   */
  async addComment(_data: { body: string }): Promise<Comment> {
    throw new Error('Comment creation is not supported by this version of the API')
  }
}
