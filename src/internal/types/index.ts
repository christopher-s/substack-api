/**
 * Internal types - not exported from the public API
 * These represent raw API response shapes and internal structures
 */

// API Response types with io-ts codecs
export type { SubstackPublication } from '@substack-api/internal/types/substack-publication'

export type { SubstackPreviewPost } from '@substack-api/internal/types/substack-preview-post'
export { SubstackPreviewPostCodec } from '@substack-api/internal/types/substack-preview-post'

export type { SubstackFullPost } from '@substack-api/internal/types/substack-full-post'
export { SubstackFullPostCodec } from '@substack-api/internal/types/substack-full-post'

export type { SubstackComment } from '@substack-api/internal/types/substack-comment'
export { SubstackCommentCodec } from '@substack-api/internal/types/substack-comment'

export type { SubstackCommentResponse } from '@substack-api/internal/types/substack-comment-response'
export { SubstackCommentResponseCodec } from '@substack-api/internal/types/substack-comment-response'

export type { SubstackFullProfile } from '@substack-api/internal/types/substack-full-profile'
export { SubstackFullProfileCodec } from '@substack-api/internal/types/substack-full-profile'

export type { SubstackNote } from '@substack-api/internal/types/substack-note'
export { SubstackNoteCodec } from '@substack-api/internal/types/substack-note'

// Common types with codecs
export type { SubstackUser } from '@substack-api/internal/types/substack-user'
export { SubstackUserCodec } from '@substack-api/internal/types/substack-user'

export type { SubstackPublicationBase } from '@substack-api/internal/types/substack-publication-base'

export type { SubstackTrackingParameters } from '@substack-api/internal/types/substack-tracking-parameters'

export type { SubstackProfileItemContext } from '@substack-api/internal/types/substack-profile-item-context'
export { SubstackProfileItemContextCodec } from '@substack-api/internal/types/substack-profile-item-context'

// Common types without codecs (not direct API responses)
export type { SubstackProfilePublication } from '@substack-api/internal/types/substack-profile-publication'
export type { SubstackAuthor } from '@substack-api/internal/types/substack-author'
export type { SubstackLinkMetadata } from '@substack-api/internal/types/substack-link-metadata'
export type { SubstackAttachment } from '@substack-api/internal/types/substack-attachment'
export type { SubstackTheme } from '@substack-api/internal/types/substack-theme'
export type { SubstackUserLink } from '@substack-api/internal/types/substack-user-link'
export type { SubstackPublicationUser } from '@substack-api/internal/types/substack-publication-user'
export type { SubstackByline } from '@substack-api/internal/types/substack-byline'
export type { SubstackProfileSubscription } from '@substack-api/internal/types/substack-profile-subscription'

// Note API types
export type { NoteBodyJson } from '@substack-api/internal/types/note-body-json'
export type { PublishNoteRequest } from '@substack-api/internal/types/publish-note-request'

export type { PublishNoteResponse } from '@substack-api/internal/types/publish-note-response'
export { PublishNoteResponseCodec } from '@substack-api/internal/types/publish-note-response'

export type { CreateAttachmentRequest } from '@substack-api/internal/types/create-attachment-request'

export type { CreateAttachmentResponse } from '@substack-api/internal/types/create-attachment-response'
export { CreateAttachmentResponseCodec } from '@substack-api/internal/types/create-attachment-response'

// Note details types
export type { SubstackNoteContext } from '@substack-api/internal/types/substack-note-context'
export type { SubstackNoteComment } from '@substack-api/internal/types/substack-note-comment'
export type { SubstackNoteTracking } from '@substack-api/internal/types/substack-note-tracking'
export type { PaginatedSubstackNotes } from '@substack-api/internal/types/paginated-substack-notes'

// Profile API types
export type { SubstackPublicProfile } from '@substack-api/internal/types/substack-public-profile'

export type { SubstackUserProfile } from '@substack-api/internal/types/substack-user-profile'
export { SubstackUserProfileCodec } from '@substack-api/internal/types/substack-user-profile'

// Potential handles types
export type { HandleType } from '@substack-api/internal/types/handle-type'
export { HandleTypeCodec } from '@substack-api/internal/types/handle-type'

export type { PotentialHandle } from '@substack-api/internal/types/potential-handle'
export { PotentialHandleCodec } from '@substack-api/internal/types/potential-handle'

export type { PotentialHandles } from '@substack-api/internal/types/potential-handles'
export { PotentialHandlesCodec } from '@substack-api/internal/types/potential-handles'

// Subscriber lists (kept as-is with composition pattern)
export type { SubscriberListsT } from '@substack-api/internal/types/subscriber-lists'
export { SubscriberLists } from '@substack-api/internal/types/subscriber-lists'

// Discovery types
export type { SubstackCategory } from '@substack-api/internal/types/substack-category'
export { SubstackCategoryCodec } from '@substack-api/internal/types/substack-category'

export type { SubstackCategoryPublication } from '@substack-api/internal/types/substack-category-publication'
export { SubstackCategoryPublicationCodec } from '@substack-api/internal/types/substack-category-publication'

export type { SubstackInboxItem } from '@substack-api/internal/types/substack-inbox-item'
export { SubstackInboxItemCodec } from '@substack-api/internal/types/substack-inbox-item'

// Publication types
export type { SubstackPublicationPost } from '@substack-api/internal/types/substack-publication-post'
export { SubstackPublicationPostCodec } from '@substack-api/internal/types/substack-publication-post'

export type { SubstackPublicationFullPost } from '@substack-api/internal/types/substack-publication-full-post'
export { SubstackPublicationFullPostCodec } from '@substack-api/internal/types/substack-publication-full-post'

export type { SubstackFacepile } from '@substack-api/internal/types/substack-facepile'
export { SubstackFacepileCodec } from '@substack-api/internal/types/substack-facepile'

// Live stream types
export type { SubstackLiveStreamResponse } from '@substack-api/internal/types/substack-live-stream'
export { SubstackLiveStreamResponseCodec } from '@substack-api/internal/types/substack-live-stream'

// Trending types
export type { SubstackTrendingResponse } from '@substack-api/internal/types/substack-trending'

// Comment replies types
export type { SubstackCommentRepliesResponse } from '@substack-api/internal/types/substack-comment-replies'
export { SubstackCommentRepliesResponseCodec } from '@substack-api/internal/types/substack-comment-replies'

// Profile search types
export type { SubstackProfileSearchResult } from '@substack-api/internal/types/substack-profile-search'
export { SubstackProfileSearchResponseCodec } from '@substack-api/internal/types/substack-profile-search'

// Feed item type
export type { FeedItem } from '@substack-api/internal/types/feed-item'

// Post management types
export type { SubstackPostManagementCounts } from '@substack-api/internal/types/substack-post-management'
export { SubstackPostManagementCountsCodec } from '@substack-api/internal/types/substack-post-management'

export type { SubstackDraftPost } from '@substack-api/internal/types/substack-post-management'
export { SubstackDraftPostCodec } from '@substack-api/internal/types/substack-post-management'

export type { SubstackPostManagementResponse } from '@substack-api/internal/types/substack-post-management'
export { SubstackPostManagementResponseCodec } from '@substack-api/internal/types/substack-post-management'

export type { SubstackPublicationDetail } from '@substack-api/internal/types/substack-post-management'
export { SubstackPublicationDetailCodec } from '@substack-api/internal/types/substack-post-management'

export type { SubstackSubscription } from '@substack-api/internal/types/substack-post-management'
export { SubstackSubscriptionCodec } from '@substack-api/internal/types/substack-post-management'

export type { SubstackSubscriptionsResponse } from '@substack-api/internal/types/substack-post-management'
export { SubstackSubscriptionsResponseCodec } from '@substack-api/internal/types/substack-post-management'

export type { SubstackPublisherSettings } from '@substack-api/internal/types/substack-post-management'
export { SubstackPublisherSettingsCodec } from '@substack-api/internal/types/substack-post-management'

export type { SubstackNotesList } from '@substack-api/internal/types/substack-post-management'
export { SubstackNotesListCodec } from '@substack-api/internal/types/substack-post-management'

export type { SubstackLiveStreamList } from '@substack-api/internal/types/substack-post-management'
export { SubstackLiveStreamListCodec } from '@substack-api/internal/types/substack-post-management'

export type { SubstackPostTag } from '@substack-api/internal/types/substack-post-management'
export { SubstackPostTagCodec } from '@substack-api/internal/types/substack-post-management'

export type { SubstackNoteStats } from '@substack-api/internal/types/substack-post-management'
export { SubstackNoteStatsCodec } from '@substack-api/internal/types/substack-post-management'

export type { SubstackEligibleHosts } from '@substack-api/internal/types/substack-post-management'
export { SubstackEligibleHostsCodec } from '@substack-api/internal/types/substack-post-management'

export type { SubstackCreatedComment } from '@substack-api/internal/types/substack-post-management'
export { SubstackCreatedCommentCodec } from '@substack-api/internal/types/substack-post-management'

export type { SubstackDeleteResponse } from '@substack-api/internal/types/substack-post-management'
export { SubstackDeleteResponseCodec } from '@substack-api/internal/types/substack-post-management'

// Dashboard types
export type {
  DashboardSummary,
  EmailsTimeseries,
  UnreadActivity,
  UnreadMessageCount
} from '@substack-api/internal/types/dashboard'
export {
  DashboardSummaryCodec,
  EmailsTimeseriesCodec,
  UnreadActivityCodec,
  UnreadMessageCountCodec
} from '@substack-api/internal/types/dashboard'

// Growth stats types
export type {
  GrowthSources,
  GrowthTimeseries,
  GrowthEvents
} from '@substack-api/internal/types/growth-stats'
export {
  GrowthSourcesCodec,
  GrowthTimeseriesCodec,
  GrowthEventsCodec
} from '@substack-api/internal/types/growth-stats'

// Publication stats types
export type {
  NetworkAttribution,
  FollowerTimeseries,
  AudienceLocation,
  AudienceLocationTotal,
  AudienceOverlap,
  Traffic30dViews,
  VisitorSources,
  TrafficTimeseries,
  Email30dOpenRate,
  EmailStats,
  PledgeSummary,
  Pledges,
  ReaderReferrals,
  PledgePlans,
  PledgePlansSummary,
  PublicationSettings,
  BestsellerTier
} from '@substack-api/internal/types/publication-stats'
export {
  NetworkAttributionCodec,
  FollowerTimeseriesCodec,
  AudienceLocationCodec,
  AudienceLocationTotalCodec,
  AudienceOverlapCodec,
  Traffic30dViewsCodec,
  VisitorSourcesCodec,
  TrafficTimeseriesCodec,
  Email30dOpenRateCodec,
  EmailStatsCodec,
  PledgeSummaryCodec,
  PledgesCodec,
  ReaderReferralsCodec,
  PledgePlansCodec,
  PledgePlansSummaryCodec,
  PublicationSettingsCodec,
  BestsellerTierCodec
} from '@substack-api/internal/types/publication-stats'

// Subscriber stats types
export type {
  SubscriberStats,
  SubscriptionsPage
} from '@substack-api/internal/types/subscriber-stats'
export {
  SubscriberStatsCodec,
  SubscriptionsPageCodec
} from '@substack-api/internal/types/subscriber-stats'

// Recommendation types
export type {
  SubstackRecommendation,
  SubstackRecommendationStats,
  SubstackRecommendationsExist,
  SubstackSuggestedRecommendation
} from '@substack-api/internal/types/recommendation'
export {
  SubstackRecommendationCodec,
  SubstackRecommendationStatsCodec,
  SubstackRecommendationsExistCodec,
  SubstackSuggestedRecommendationCodec
} from '@substack-api/internal/types/recommendation'

// Settings types
export type {
  PublisherSettingsDetail,
  SubstackPublicationUserRole,
  SubstackPublicationSection,
  SubstackSubscriptionSettings,
  SubstackBoostSettings
} from '@substack-api/internal/types/settings'
export {
  PublisherSettingsDetailCodec,
  SubstackPublicationUserRoleCodec,
  SubstackPublicationSectionCodec,
  SubstackSubscriptionSettingsCodec,
  SubstackBoostSettingsCodec
} from '@substack-api/internal/types/settings'

// Re-export PublisherSettingsDetail as SettingsPublisherSettings for backward compatibility
export type { PublisherSettingsDetail as SettingsPublisherSettings } from '@substack-api/internal/types/settings'
export { PublisherSettingsDetailCodec as SettingsPublisherSettingsCodec } from '@substack-api/internal/types/settings'

// Publication export and search types
export type {
  SubstackPublicationExport,
  SubstackPublicationSearchResult,
  SubstackPublicationSearchResponse
} from '@substack-api/internal/types/publication-export'
export {
  SubstackPublicationExportCodec,
  SubstackPublicationSearchResultCodec,
  SubstackPublicationSearchResponseCodec
} from '@substack-api/internal/types/publication-export'

// Notification types
export type {
  SubstackNotification,
  SubstackNotificationsResponse
} from '@substack-api/internal/types/notification'
export {
  SubstackNotificationCodec,
  SubstackNotificationsResponseCodec
} from '@substack-api/internal/types/notification'

// Chat types
export type {
  ChatUser,
  ChatMessage,
  ChatThread,
  UnreadCount,
  InboxResponse,
  DmThreadDetail,
  DmResponse,
  SendMessageResponse,
  InvitesResponse,
  ReactionsResponse,
  RealtimeTokenResponse
} from '@substack-api/internal/types/chat'
export {
  ChatUserCodec,
  ChatMessageCodec,
  ChatThreadCodec,
  UnreadCountCodec,
  InboxResponseCodec,
  DmThreadDetailCodec,
  DmResponseCodec,
  SendMessageResponseCodec,
  InvitesResponseCodec,
  ReactionsResponseCodec,
  RealtimeTokenResponseCodec
} from '@substack-api/internal/types/chat'
