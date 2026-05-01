import * as t from 'io-ts'
import { maybe } from '@substack-api/internal/types/helpers'

/**
 * Post counts from the post management endpoint
 * e.g. {"published": 0, "drafts": 1, "scheduled": 0}
 */
export const SubstackPostManagementCountsCodec = t.type({
  published: t.number,
  drafts: t.number,
  scheduled: t.number
})

export type SubstackPostManagementCounts = t.TypeOf<typeof SubstackPostManagementCountsCodec>

/**
 * A draft or published post from post management endpoints
 * Based on actual API responses from /post_management/drafts, /post_management/published, etc.
 * Only id is required; all other fields are optional.
 */
export const SubstackDraftPostCodec = t.intersection([
  t.type({
    id: t.number
  }),
  t.partial({
    uuid: maybe(t.string),
    editor_v2: maybe(t.boolean),
    publication_id: maybe(t.number),
    type: maybe(t.string),
    post_date: maybe(t.string),
    draft_created_at: maybe(t.string),
    draft_updated_at: maybe(t.string),
    email_sent_at: maybe(t.string),
    is_published: maybe(t.boolean),
    title: maybe(t.string),
    draft_title: maybe(t.string),
    draft_body: maybe(t.string),
    body: maybe(t.string),
    subtitle: maybe(t.string),
    draft_subtitle: maybe(t.string),
    slug: maybe(t.string),
    audience: maybe(t.string),
    cover_image: maybe(t.string),
    should_send_email: maybe(t.boolean),
    should_send_free_preview: maybe(t.boolean),
    write_comment_permissions: maybe(t.string),
    default_comment_sort: maybe(t.string),
    meter_type: maybe(t.string),
    section_id: maybe(t.number),
    section_slug: maybe(t.string),
    section_name: maybe(t.string),
    draft_section_name: maybe(t.string),
    is_draft_hidden: maybe(t.boolean),
    reaction_count: maybe(t.number),
    comment_count: maybe(t.number),
    child_comment_count: maybe(t.number),
    reactions: maybe(t.record(t.string, t.number)),
    free_unlock_required: maybe(t.boolean),
    word_count: maybe(t.number)
  })
])

export type SubstackDraftPost = t.TypeOf<typeof SubstackDraftPostCodec>

/**
 * Response from post_management/published, post_management/drafts, post_management/scheduled
 */
export const SubstackPostManagementResponseCodec = t.type({
  posts: t.array(SubstackDraftPostCodec),
  offset: t.number,
  limit: t.number,
  total: t.number
})

export type SubstackPostManagementResponse = t.TypeOf<typeof SubstackPostManagementResponseCodec>

/**
 * Publication detail from GET /publication
 * All fields optional — includes the most useful subset of 100+ fields
 */
export const SubstackPublicationDetailCodec = t.partial({
  subdomain: maybe(t.string),
  name: maybe(t.string),
  is_personal_mode: maybe(t.boolean),
  custom_domain: maybe(t.string),
  logo_url: maybe(t.string),
  cover_photo_url: maybe(t.string),
  email_from_name: maybe(t.string),
  language: maybe(t.string),
  tags: maybe(t.array(t.unknown)),
  has_paid_subs: maybe(t.boolean),
  community_enabled: maybe(t.boolean),
  podcast_enabled: maybe(t.boolean),
  bylines_enabled: maybe(t.boolean),
  invite_only: maybe(t.boolean),
  founding_plan_enabled: maybe(t.boolean),
  boost_enabled: maybe(t.boolean),
  tts_enabled: maybe(t.boolean)
})

export type SubstackPublicationDetail = t.TypeOf<typeof SubstackPublicationDetailCodec>

/**
 * A single subscription from GET /subscription
 */
export const SubstackSubscriptionCodec = t.intersection([
  t.type({
    id: t.number,
    user_id: t.number,
    publication_id: t.number
  }),
  t.partial({
    email_disabled: maybe(t.boolean),
    membership_state: maybe(t.string),
    type: maybe(t.string),
    created_at: maybe(t.string),
    visibility: maybe(t.string),
    is_founding: maybe(t.boolean),
    is_favorite: maybe(t.boolean)
  })
])

export type SubstackSubscription = t.TypeOf<typeof SubstackSubscriptionCodec>

/**
 * Response from GET /subscriptions/page_v2
 */
export const SubstackSubscriptionsResponseCodec = t.type({
  subscriptions: t.array(SubstackSubscriptionCodec)
})

export type SubstackSubscriptionsResponse = t.TypeOf<typeof SubstackSubscriptionsResponseCodec>

/**
 * Publisher settings from GET /settings
 */
export const SubstackPublisherSettingsCodec = t.intersection([
  t.type({
    settings: t.unknown
  }),
  t.partial({
    twitterAccount: maybe(t.unknown),
    userInboxView: maybe(t.unknown),
    hasActiveSubscriptionSection: maybe(t.boolean)
  })
])

export type SubstackPublisherSettings = t.TypeOf<typeof SubstackPublisherSettingsCodec>

/**
 * Notes list from GET /notes
 */
export const SubstackNotesListCodec = t.partial({
  items: maybe(t.array(t.unknown)),
  originalCursorTimestamp: maybe(t.string),
  nextCursor: maybe(t.string)
})

export type SubstackNotesList = t.TypeOf<typeof SubstackNotesListCodec>

/**
 * Live stream list from GET /live_streams
 */
export const SubstackLiveStreamListCodec = t.partial({
  liveStreams: maybe(t.array(t.unknown)),
  hasMore: maybe(t.boolean)
})

export type SubstackLiveStreamList = t.TypeOf<typeof SubstackLiveStreamListCodec>

/**
 * A single post tag
 */
export const SubstackPostTagCodec = t.partial({
  id: maybe(t.union([t.number, t.string])),
  name: maybe(t.string)
})

export type SubstackPostTag = t.TypeOf<typeof SubstackPostTagCodec>

/**
 * Note stats from GET /note_stats/{entityKey}
 * Analytics data: impressions, surfaces, audience breakdown, interactions
 */
export const SubstackNoteStatsCodec = t.intersection([
  t.type({}),
  t.partial({
    impressions: maybe(t.number),
    surfaces: maybe(t.record(t.string, t.number)),
    audience: maybe(t.record(t.string, t.number)),
    interactions: maybe(t.record(t.string, t.number)),
    likes: maybe(t.number),
    restacks: maybe(t.number),
    comments: maybe(t.number),
    shares: maybe(t.number),
    entity_key: maybe(t.string)
  })
])

export type SubstackNoteStats = t.TypeOf<typeof SubstackNoteStatsCodec>

/**
 * Eligible hosts from GET /live_stream/eligible_hosts
 */
export const SubstackEligibleHostsCodec = t.intersection([
  t.type({}),
  t.partial({
    hosts: maybe(
      t.array(
        t.intersection([
          t.type({}),
          t.partial({
            id: maybe(t.number),
            name: maybe(t.string),
            handle: maybe(t.string),
            photo_url: maybe(t.string),
            email: maybe(t.string),
            role: maybe(t.string),
            user_id: maybe(t.number),
            publication_id: maybe(t.number)
          })
        ])
      )
    )
  })
])

export type SubstackEligibleHosts = t.TypeOf<typeof SubstackEligibleHostsCodec>

/**
 * Response from POST /post/{id}/comment (create comment)
 */
export const SubstackCreatedCommentCodec = t.intersection([
  t.type({}),
  t.partial({
    id: maybe(t.number),
    body: maybe(t.string),
    user_id: maybe(t.number),
    post_id: maybe(t.number),
    date: maybe(t.string),
    name: maybe(t.string),
    type: maybe(t.string)
  })
])

export type SubstackCreatedComment = t.TypeOf<typeof SubstackCreatedCommentCodec>

/**
 * Response from DELETE /comment/{id} or DELETE /drafts/{id}
 */
export const SubstackDeleteResponseCodec = t.intersection([
  t.type({}),
  t.partial({
    success: maybe(t.boolean),
    deleted: maybe(t.boolean),
    id: maybe(t.number)
  })
])

export type SubstackDeleteResponse = t.TypeOf<typeof SubstackDeleteResponseCodec>
