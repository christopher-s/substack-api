import { Profile } from '@substack-api/domain/profile'
import { Note } from '@substack-api/domain/note'
import { NoteBuilder, NoteWithLinkBuilder } from '@substack-api/domain/note-builder'
import type { SubstackFullProfile } from '@substack-api/internal'
import type { EntityDeps } from '@substack-api/domain/entity-deps'

/**
 * OwnProfile extends Profile with write capabilities for the authenticated user.
 *
 * Individual profile fetch failures in following() are silently skipped —
 * the yielded list may be shorter than the actual following count.
 */
export class OwnProfile extends Profile {
  constructor(rawData: SubstackFullProfile, deps: EntityDeps, resolvedSlug?: string) {
    super(rawData, deps, resolvedSlug)
  }

  /**
   * Create a new note using the builder pattern
   */
  newNote(): NoteBuilder {
    return this.deps.newNoteService.newNote()
  }

  /**
   * Create a new note with a link attachment using the builder pattern
   */
  newNoteWithLink(link: string): NoteWithLinkBuilder {
    return this.deps.newNoteService.newNoteWithLink(link)
  }

  /**
   * Get users that the authenticated user follows.
   * Individual profile fetch failures are silently skipped.
   */
  async *following(options: { limit?: number } = {}): AsyncIterable<Profile> {
    const followingUsers = await this.deps.followingService.getFollowing()

    let count = 0
    for (const user of followingUsers) {
      if (options.limit && count >= options.limit) break

      try {
        const profileResponse = await this.deps.profileService.getProfileBySlug(user.handle)
        yield new Profile(profileResponse, this.deps, user.handle)
        count++
      } catch {
        /* skip profiles that fail to load */
      }
    }
  }

  /**
   * Get notes from the authenticated user's profile
   */
  async *notes(options: { limit?: number } = {}): AsyncIterable<Note> {
    let cursor: string | undefined = undefined
    let totalYielded = 0

    while (true) {
      // Use NoteService to fetch notes for the authenticated user with cursor-based pagination
      const paginatedNotes = await this.deps.noteService.getNotesForLoggedUser({
        cursor
      })

      if (!paginatedNotes.notes) {
        break // No more notes to fetch
      }

      for (const noteData of paginatedNotes.notes) {
        if (options.limit && totalYielded >= options.limit) {
          return // Stop if we've reached the requested limit
        }
        yield new Note(noteData, this.deps.publicationClient)
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
