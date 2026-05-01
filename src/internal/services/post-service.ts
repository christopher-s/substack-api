import type { SubstackFullPost, SubstackPreviewPost } from '@substack-api/internal/types'
import { SubstackFullPostCodec, SubstackPreviewPostCodec } from '@substack-api/internal/types'
import { decodeOrThrow } from '@substack-api/internal/validation'
import type { HttpClient } from '@substack-api/internal/http-client'

/**
 * Service responsible for post-related HTTP operations
 * Returns internal types that can be transformed into domain models
 */
export class PostService {
  constructor(private readonly substackClient: HttpClient) {}

  /**
   * Get a post by ID from the API
   * @param id - The post ID
   * @returns Promise<SubstackFullPost> - Raw full post data from API (validated)
   * @throws {Error} When post is not found, API request fails, or validation fails
   *
   * Note: Uses SubstackFullPostCodec to validate the full post response from /posts/by-id/:id
   * which includes body_html, postTags, reactions, and other fields not present in preview responses.
   * This codec is specifically designed for FullPost construction.
   */
  async getPostById(id: number): Promise<SubstackFullPost> {
    // Post lookup by ID must use the global substack.com endpoint, not publication-specific hostnames
    const rawResponse = await this.substackClient.get<{ post: unknown }>(
      `/posts/by-id/${encodeURIComponent(String(id))}`
    )

    // Extract the post data from the wrapper object
    if (!rawResponse.post) {
      throw new Error('Invalid response format: missing post data')
    }

    // Transform the raw post data to match our codec expectations
    const postData = this.transformPostData(rawResponse.post as Record<string, unknown>)

    // Validate the response with SubstackFullPostCodec for full post data including body_html
    return decodeOrThrow(SubstackFullPostCodec, postData, 'Full post response')
  }

  /**
   * Transform raw API post data to match our codec structure
   */
  private transformPostData(rawPost: Record<string, unknown>): Record<string, unknown> {
    const transformedPost = { ...rawPost }

    // Transform postTags from objects to string array
    const postTags = rawPost.postTags
    if (postTags && Array.isArray(postTags)) {
      transformedPost.postTags = postTags.map((tag: unknown) => {
        if (typeof tag === 'object' && tag !== null && 'name' in tag) {
          return (tag as { name: string }).name
        }
        return tag
      })
    }

    return transformedPost
  }

  /**
   * Get posts for a profile
   * @param profileId - The profile user ID
   * @param options - Pagination options
   * @returns Promise<SubstackPreviewPost[]> - Raw post data from API (validated)
   * @throws {Error} When posts cannot be retrieved or validation fails
   */
  async getPostsForProfile(
    profileId: number,
    options: { limit: number; offset: number }
  ): Promise<{
    posts: SubstackPreviewPost[]
    nextCursor?: string | null
  }> {
    const params = new URLSearchParams({
      profile_user_id: String(profileId),
      limit: String(options.limit),
      offset: String(options.offset)
    })
    const response = await this.substackClient.get<{
      posts?: unknown[]
      nextCursor?: string | null
    }>(`/profile/posts?${params.toString()}`)

    const posts = response.posts || []

    // Validate each post with io-ts
    const validatedPosts = posts.map((post, index) =>
      decodeOrThrow(SubstackPreviewPostCodec, post, `Post ${index} in profile response`)
    )

    return { posts: validatedPosts, nextCursor: response.nextCursor }
  }

  async likePost(postId: number): Promise<void> {
    await this.substackClient.post(`/posts/${postId}/like`)
  }

  async unlikePost(postId: number): Promise<void> {
    await this.substackClient.post(`/posts/${postId}/unlike`)
  }

  async getReadingList(): Promise<SubstackPreviewPost[]> {
    const response = await this.substackClient.get<{ posts?: SubstackPreviewPost[] }>(
      '/reading-list'
    )
    return response.posts || []
  }

  async savePost(postId: number): Promise<void> {
    await this.substackClient.post(`/posts/${postId}/save`)
  }

  async unsavePost(postId: number): Promise<void> {
    await this.substackClient.post(`/posts/${postId}/unsave`)
  }
}
