import type { SubstackPublicProfile, SubstackFullProfile } from '@substack-api/internal'
import type { EntityDeps } from '@substack-api/domain/entity-deps'
import { PreviewPost } from '@substack-api/domain/post'
import { Note } from '@substack-api/domain/note'

/**
 * Base Profile class representing a Substack user profile (read-only)
 */
export class Profile {
  public readonly id: number
  public readonly slug: string
  public readonly handle: string
  public readonly name: string
  public readonly url: string
  public readonly avatarUrl: string
  public readonly bio: string | null | undefined
  public readonly subscriberCount?: number
  public readonly primaryPublication?: { id: number; name: string; subdomain: string }
  public readonly isFollowing?: boolean
  public readonly isSubscribed?: boolean

  constructor(
    protected readonly rawData: SubstackPublicProfile | SubstackFullProfile,
    protected readonly deps: EntityDeps,
    resolvedSlug?: string
  ) {
    this.id = rawData.id
    // Use resolved slug from subscriptions cache if available, otherwise fallback to handle
    this.slug = resolvedSlug || rawData.handle
    this.handle = rawData.handle
    this.name = rawData.name
    this.url = `https://substack.com/@${this.handle}`
    this.avatarUrl = rawData.photo_url || ''
    this.bio = rawData.bio

    // Expose fields available on full profile responses
    this.subscriberCount =
      (rawData as SubstackPublicProfile).subscriberCountNumber ??
      (rawData as SubstackFullProfile).subscriberCountNumber ??
      undefined
    this.isFollowing =
      (rawData as SubstackPublicProfile).isFollowing ??
      (rawData as SubstackFullProfile).isFollowing ??
      undefined
    this.isSubscribed =
      (rawData as SubstackPublicProfile).isSubscribed ??
      (rawData as SubstackFullProfile).isSubscribed ??
      undefined

    const pub =
      (rawData as SubstackPublicProfile).primaryPublication ??
      (rawData as SubstackFullProfile).primaryPublication ??
      undefined
    if (pub && pub.id != null && pub.name && pub.subdomain) {
      this.primaryPublication = {
        id: typeof pub.id === 'number' ? pub.id : Number(pub.id),
        name: pub.name,
        subdomain: pub.subdomain
      }
    }
  }

  /**
   * Get posts from this profile's publications
   */
  async *posts(options: { limit?: number } = {}): AsyncIterable<PreviewPost> {
    let offset = 0
    let totalYielded = 0

    while (true) {
      const response = await this.deps.postService.getPostsForProfile(this.id, {
        limit: this.deps.perPage,
        offset
      })

      if (!response.posts || response.posts.length === 0) {
        break // No more posts to fetch
      }

      for (const postData of response.posts) {
        if (options.limit && totalYielded >= options.limit) {
          return // Stop if we've reached the requested limit
        }
        yield new PreviewPost(postData, this.deps)
        totalYielded++
      }

      // If we got fewer posts than requested or there's no next cursor, we've reached the end
      if (response.posts.length < this.deps.perPage || !response.nextCursor) {
        break
      }

      offset += this.deps.perPage
    }
  }

  /**
   * Get notes from this profile
   */
  async *notes(options: { limit?: number } = {}): AsyncIterable<Note> {
    let cursor: string | undefined = undefined
    let totalYielded = 0

    while (true) {
      // Use NoteService to get notes for this profile with cursor-based pagination
      const paginatedNotes = await this.deps.noteService.getNotesForProfile(this.id, {
        cursor
      })

      if (!paginatedNotes.notes) {
        break // No more notes to fetch
      }

      for (const item of paginatedNotes.notes) {
        if (options.limit && totalYielded >= options.limit) {
          return // Stop if we've reached the requested limit
        }
        yield new Note(item, this.deps)
        totalYielded++
      }

      // If there's no next cursor, we've reached the end
      if (!paginatedNotes.nextCursor) {
        break
      }

      cursor = paginatedNotes.nextCursor
    }
  }
}
