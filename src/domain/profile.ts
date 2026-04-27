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
    this.avatarUrl = rawData.photo_url
    this.bio = rawData.bio
  }

  /**
   * Get posts from this profile's publications
   */
  async *posts(options: { limit?: number } = {}): AsyncIterable<PreviewPost> {
    let offset = 0
    let totalYielded = 0

    while (true) {
      const postsData = await this.deps.postService.getPostsForProfile(this.id, {
        limit: this.deps.perPage,
        offset
      })

      if (!postsData) {
        break // No more posts to fetch
      }

      for (const postData of postsData) {
        if (options.limit && totalYielded >= options.limit) {
          return // Stop if we've reached the requested limit
        }
        yield new PreviewPost(postData, this.deps)
        totalYielded++
      }

      // If we got fewer posts than requested, we've reached the end
      if (postsData.length < this.deps.perPage) {
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
        yield new Note(item, this.deps.publicationClient)
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
