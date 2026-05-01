import type {
  SubstackNote,
  PaginatedSubstackNotes,
  SubstackNoteStats
} from '@substack-api/internal/types'
import { SubstackCommentResponseCodec, SubstackNoteStatsCodec } from '@substack-api/internal/types'
import { decodeOrThrow } from '@substack-api/internal/validation'
import type { HttpClient } from '@substack-api/internal/http-client'

/**
 * Service responsible for note-related HTTP operations
 * Returns internal types that can be transformed into domain models
 */
export class NoteService {
  constructor(private readonly publicationClient: HttpClient) {}

  /**
   * Get a note by ID from the API
   * @param id - The note ID
   * @returns Promise<SubstackNote> - Raw note data from API
   * @throws {Error} When note is not found or API request fails
   */
  async getNoteById(id: number): Promise<SubstackNote> {
    // Notes are fetched using the comment endpoint
    const rawResponse = await this.publicationClient.get<unknown>(`/reader/comment/${id}`)

    // Validate the response structure with io-ts
    const response = decodeOrThrow(
      SubstackCommentResponseCodec,
      rawResponse,
      'Note comment response'
    )

    // Transform the validated comment response to the SubstackNote structure expected by Note entity
    const comment = response.item.comment
    const noteData: SubstackNote = {
      entity_key: String(id),
      type: 'comment',
      context: {
        type: 'comment',
        timestamp: comment.date ?? '',
        users: [
          {
            id: comment.user_id ?? 0,
            name: comment.name ?? '',
            handle: '', // Not available in comment response
            photo_url: comment.photo_url || '',
            bestseller_tier: ''
          }
        ],
        isFresh: false,
        source: 'comment'
      },
      comment: {
        id: comment.id,
        body: comment.body,
        user_id: comment.user_id,
        type: comment.type,
        date: comment.date,
        name: comment.name,
        photo_url: comment.photo_url,
        reaction_count: comment.reaction_count,
        reactions: comment.reactions,
        restacks: comment.restacks,
        restacked: comment.restacked,
        children_count: comment.children_count,
        language: comment.language,
        body_json: comment.body_json,
        publication_id: comment.publication_id,
        post_id: comment.post_id,
        edited_at: comment.edited_at,
        ancestor_path: comment.ancestor_path,
        reply_minimum_role: comment.reply_minimum_role,
        media_clip_id: comment.media_clip_id,
        bio: comment.bio,
        handle: comment.handle,
        user_bestseller_tier: comment.user_bestseller_tier,
        attachments: comment.attachments,
        userStatus: comment.userStatus,
        user_primary_publication: comment.user_primary_publication,
        autotranslate_to: comment.autotranslate_to,
        tracking_parameters: comment.tracking_parameters
      },
      parentComments: []
    }

    return noteData
  }

  /**
   * Get notes for the authenticated user with cursor-based pagination
   * @param options - Pagination options with optional cursor
   * @returns Promise<PaginatedSubstackNotes> - Paginated note data from API
   * @throws {Error} When notes cannot be retrieved
   */
  async getNotesForLoggedUser(options?: { cursor?: string }): Promise<PaginatedSubstackNotes> {
    const url = options?.cursor ? `/notes?cursor=${encodeURIComponent(options.cursor)}` : '/notes'

    const response = await this.publicationClient.get<{
      items?: SubstackNote[]
      nextCursor?: string
    }>(url)

    return {
      notes: response.items || [],
      nextCursor: response.nextCursor
    }
  }

  /**
   * Get notes for a profile with cursor-based pagination
   * @param profileId - The profile user ID
   * @param options - Pagination options with optional cursor
   * @returns Promise<PaginatedSubstackNotes> - Paginated note data from API
   * @throws {Error} When notes cannot be retrieved
   */
  async getNotesForProfile(
    profileId: number,
    options?: { cursor?: string }
  ): Promise<PaginatedSubstackNotes> {
    const url = options?.cursor
      ? `/reader/feed/profile/${profileId}?types=note&cursor=${encodeURIComponent(options.cursor)}`
      : `/reader/feed/profile/${profileId}?types=note`

    const response = await this.publicationClient.get<{
      items?: SubstackNote[]
      nextCursor?: string
    }>(url)
    return {
      notes: response.items || [],
      nextCursor: response.nextCursor
    }
  }

  async getNotes(options?: { cursor?: string }): Promise<{
    items: unknown[]
    nextCursor: string | null
  }> {
    const url = options?.cursor ? `/notes?cursor=${encodeURIComponent(options.cursor)}` : '/notes'
    const response = await this.publicationClient.get<{
      items?: unknown[]
      nextCursor?: string | null
    }>(url)
    return {
      items: response.items || [],
      nextCursor: response.nextCursor ?? null
    }
  }

  /** Get analytics stats for a note (impressions, surfaces, audience, interactions). */
  async getNoteStats(entityKey: string): Promise<SubstackNoteStats> {
    const response = await this.publicationClient.get<unknown>(`/note_stats/${entityKey}`)
    return decodeOrThrow(SubstackNoteStatsCodec, response, 'Note stats')
  }

  async restackNote(noteId: number): Promise<void> {
    await this.publicationClient.post(`/notes/${noteId}/restack`)
  }

  async unrestackNote(noteId: number): Promise<void> {
    await this.publicationClient.post(`/notes/${noteId}/unrestack`)
  }
}
