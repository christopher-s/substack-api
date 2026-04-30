export { SubstackClient } from '@substack-api/substack-client'
export {
  Profile,
  OwnProfile,
  PreviewPost,
  FullPost,
  Note,
  Comment,
  Category,
  PublicationPost,
  NoteBuilder,
  NoteWithLinkBuilder,
  ParagraphBuilder,
  ListBuilder,
  ListItemBuilder
} from '@substack-api/domain'

export type {
  SubstackConfig,
  PaginationParams,
  SearchParams,
  PostsIteratorOptions,
  CommentsIteratorOptions,
  NotesIteratorOptions
} from '@substack-api/types'

export type { TextSegment, ListItem, List } from '@substack-api/domain'

export type {
  FeedTab,
  ProfileFeedTab,
  ActivityFeedTab
} from '@substack-api/internal/services/discovery-service'

export type { SubstackCategoryPublication } from '@substack-api/internal/types'
export type { SubstackLiveStreamResponse } from '@substack-api/internal/types'
export type { SubstackTrendingResponse } from '@substack-api/internal/types'

export type { SubstackCommentRepliesResponse } from '@substack-api/internal/types'
export type { SubstackProfileSearchResult } from '@substack-api/internal/types'
export type { SubstackInboxItem } from '@substack-api/internal/types'
export type { FeedItem } from '@substack-api/internal/types'
export type { SubstackFacepile } from '@substack-api/internal/types'
export type { SubstackPublicationPost } from '@substack-api/internal/types'

export { markdownToNoteBody } from '@substack-api/internal/markdown-to-prosemirror'
export { markdownToHtml } from '@substack-api/internal/markdown-to-html'
