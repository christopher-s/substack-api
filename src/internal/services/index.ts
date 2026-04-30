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
export { DiscoveryService } from '@substack-api/internal/services/discovery-service'
export type {
  FeedTab,
  ProfileFeedTab,
  ActivityFeedTab
} from '@substack-api/internal/services/discovery-service'
export { PublicationService } from '@substack-api/internal/services/publication-service'
export { PostManagementService } from '@substack-api/internal/services/post-management-service'
export { PublicationDetailService } from '@substack-api/internal/services/publication-detail-service'
export { SubscriptionService } from '@substack-api/internal/services/subscription-service'
export { SettingsService } from '@substack-api/internal/services/settings-service'
export { GrowthStatsService } from '@substack-api/internal/services/growth-stats-service'
export { SubscriberStatsService } from '@substack-api/internal/services/subscriber-stats-service'
export { PublicationStatsService } from '@substack-api/internal/services/publication-stats-service'
export { DashboardService } from '@substack-api/internal/services/dashboard-service'
export { RecommendationService } from '@substack-api/internal/services/recommendation-service'
export { ChatService } from '@substack-api/internal/services/chat-service'
