import type { HttpClient } from '@substack-api/internal/http-client'
import type {
  ProfileService,
  PostService,
  NoteService,
  CommentService,
  FollowingService
} from '@substack-api/internal/services'
import type { NoteBuilderFactory } from '@substack-api/domain/note-builder-factory'

/**
 * Shared dependency container for all domain entities.
 * Not all entities use every field — unused services are simply ignored.
 */
export interface EntityDeps {
  publicationClient: HttpClient
  profileService: ProfileService
  postService: PostService
  noteService: NoteService
  commentService: CommentService
  followingService: FollowingService
  newNoteService: NoteBuilderFactory
  perPage: number
}
