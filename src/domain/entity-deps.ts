import type { HttpClient } from '@substack-api/internal/http-client'
import type {
  ProfileService,
  PostService,
  NoteService,
  CommentService,
  FollowingService,
  NewNoteService
} from '@substack-api/internal/services'

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
  newNoteService: NewNoteService
  perPage: number
}
