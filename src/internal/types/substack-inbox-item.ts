import * as t from 'io-ts'
import { maybe } from '@substack-api/internal/types/helpers'

/**
 * Author/byline in an inbox item
 */
const InboxItemAuthorCodec = t.intersection([
  t.type({
    id: t.number,
    name: t.string,
    handle: t.union([t.string, t.null]),
    photo_url: t.string
  }),
  t.partial({
    previous_name: t.union([t.string, t.null]),
    bio: maybe(t.string),
    profile_set_up_at: t.union([t.string, t.null]),
    reader_installed_at: t.union([t.string, t.null]),
    publicationUsers: t.array(t.unknown),
    is_guest: t.boolean,
    bestseller_tier: t.union([t.number, t.null]),
    status: t.unknown
  })
])

/**
 * Inbox item from /api/v1/inbox/top — represents a trending post
 */
export const SubstackInboxItemCodec = t.intersection([
  t.type({
    post_id: t.number,
    type: t.string,
    title: t.string,
    web_url: t.string
  }),
  t.partial({
    content_key: t.string,
    updated_at: t.string,
    content_date: t.union([t.string, t.null]),
    inbox_date: t.union([t.string, t.null]),
    seen_at: t.union([t.string, t.null]),
    saved_at: t.union([t.string, t.null]),
    archived_at: t.union([t.string, t.null]),
    skip_inbox: t.boolean,
    extra_views: t.array(t.unknown),
    subtitle: t.union([t.string, t.null]),
    cover_photo_url: t.union([t.string, t.null]),
    detail_view_subtitle: t.union([t.string, t.null]),
    audience: t.string,
    postType: t.string,
    is_preview: t.boolean,
    video_id: t.union([t.number, t.string, t.null]),
    audio_url: t.union([t.string, t.null]),
    audio_type: t.union([t.string, t.null]),
    authors: t.array(t.string),
    published_bylines: t.array(InboxItemAuthorCodec),
    publication_id: t.union([t.number, t.null]),
    publisher_name: t.union([t.string, t.null]),
    publisher_image_url: t.union([t.string, t.null]),
    like_count: t.union([t.number, t.null]),
    comment_count: t.union([t.number, t.null]),
    read_progress: t.number,
    max_read_progress: t.number,
    audio_progress: t.number,
    max_audio_progress: t.number,
    video_progress: t.number,
    max_video_progress: t.number,
    is_personal_mode: t.boolean,
    is_saved: t.boolean,
    created_at: t.string,
    uuid: t.string,
    coverImagePalette: t.unknown,
    duration_metadata: t.union([
      t.type({
        word_count: t.union([t.number, t.null]),
        audio_duration: t.union([t.number, t.null])
      }),
      t.null
    ])
  })
])

export type SubstackInboxItem = t.TypeOf<typeof SubstackInboxItemCodec>
