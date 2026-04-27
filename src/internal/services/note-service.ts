import type { SubstackNote, PaginatedSubstackNotes } from '@substack-api/internal/types'
import { SubstackCommentResponseCodec } from '@substack-api/internal/types'
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
    // Only include minimal fields validated by SubstackNoteCodec
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
        type: 'comment',
        date: comment.date,
        name: comment.name,
        reaction_count: 0,
        reactions: {},
        restacks: 0,
        restacked: false,
        children_count: 0,
        language: 'en'
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
}
