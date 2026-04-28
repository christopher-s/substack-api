import type { EntityDeps } from '@substack-api/domain/entity-deps'
import type { HttpClient } from '@substack-api/internal/http-client'
import type {
  ProfileService,
  PostService,
  NoteService,
  CommentService,
  FollowingService,
  NoteBuilderFactory
} from '@substack-api/internal/services'
import { createMockHttpClient } from '@test/unit/helpers/mock-http-client'

type MockedEntityDeps = {
  publicationClient: jest.Mocked<HttpClient>
  profileService: jest.Mocked<ProfileService>
  postService: jest.Mocked<PostService>
  noteService: jest.Mocked<NoteService>
  commentService: jest.Mocked<CommentService>
  followingService: jest.Mocked<FollowingService>
  newNoteService: jest.Mocked<NoteBuilderFactory>
  perPage: number
}

export function createMockEntityDeps(overrides?: Partial<EntityDeps>): MockedEntityDeps {
  return {
    publicationClient: createMockHttpClient('https://test.substack.com'),
    profileService: {
      getOwnSlug: jest.fn(),
      getOwnProfile: jest.fn(),
      getProfileById: jest.fn(),
      getProfileBySlug: jest.fn()
    } as unknown as jest.Mocked<ProfileService>,
    postService: {
      getPostById: jest.fn(),
      getPostsForProfile: jest.fn()
    } as unknown as jest.Mocked<PostService>,
    noteService: {
      getNoteById: jest.fn(),
      getNotesForLoggedUser: jest.fn(),
      getNotesForProfile: jest.fn()
    } as unknown as jest.Mocked<NoteService>,
    commentService: {
      getCommentsForPost: jest.fn(),
      getCommentById: jest.fn(),
      getReplies: jest.fn()
    } as unknown as jest.Mocked<CommentService>,
    followingService: {
      getFollowing: jest.fn(),
      getOwnId: jest.fn()
    } as unknown as jest.Mocked<FollowingService>,
    newNoteService: {
      newNote: jest.fn(),
      newNoteWithLink: jest.fn()
    } as unknown as jest.Mocked<NoteBuilderFactory>,
    perPage: 25,
    ...overrides
  } as unknown as MockedEntityDeps
}
