/**
 * Service layer exports
 * Services handle HTTP communication and return internal types
 */

export { PostService } from '@substack-api/internal/services/post-service'
export { NoteService } from '@substack-api/internal/services/note-service'
export { ProfileService } from '@substack-api/internal/services/profile-service'
export { CommentService } from '@substack-api/internal/services/comment-service'
export { FollowingService } from '@substack-api/internal/services/following-service'
export { ConnectivityService } from '@substack-api/internal/services/connectivity-service'
export { NewNoteService } from '@substack-api/internal/services/new-note-service'
export { DiscoveryService } from '@substack-api/internal/services/discovery-service'
export type { FeedTab, ProfileFeedTab } from '@substack-api/internal/services/discovery-service'
export { PublicationService } from '@substack-api/internal/services/publication-service'
