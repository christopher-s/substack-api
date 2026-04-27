import * as t from 'io-ts'
import { maybe } from '@substack-api/internal/types/helpers'

const SubstackNoteUserCodec = t.intersection([
  t.type({
    id: t.number,
    name: t.string,
    handle: t.string,
    photo_url: t.string
  }),
  t.partial({
    previous_name: maybe(t.string),
    bio: maybe(t.string),
    profile_set_up_at: maybe(t.string),
    reader_installed_at: maybe(t.string),
    bestseller_tier: maybe(t.string),
    status: maybe(t.unknown),
    primary_publication: maybe(t.unknown)
  })
])

const SubstackNoteAttachmentCodec = t.intersection([
  t.type({
    id: t.union([t.number, t.string]),
    type: t.string
  }),
  t.partial({
    imageUrl: maybe(t.string),
    imageWidth: maybe(t.number),
    imageHeight: maybe(t.number),
    explicit: maybe(t.boolean),
    publication: maybe(t.unknown)
  })
])

const SubstackNoteCommentCodec = t.intersection([
  t.type({
    id: t.number,
    body: t.string
  }),
  t.partial({
    user_id: maybe(t.number),
    type: maybe(t.string),
    date: maybe(t.string),
    name: maybe(t.string),
    reaction_count: maybe(t.number),
    reactions: maybe(t.record(t.string, t.number)),
    restacks: maybe(t.number),
    restacked: maybe(t.boolean),
    children_count: maybe(t.number),
    language: maybe(t.string),
    body_json: maybe(t.unknown),
    publication_id: maybe(t.number),
    post_id: maybe(t.number),
    edited_at: maybe(t.string),
    ancestor_path: maybe(t.string),
    reply_minimum_role: maybe(t.string),
    media_clip_id: maybe(t.string),
    photo_url: maybe(t.string),
    bio: maybe(t.string),
    handle: maybe(t.string),
    user_bestseller_tier: maybe(t.string),
    attachments: maybe(t.array(SubstackNoteAttachmentCodec)),
    userStatus: maybe(t.unknown),
    user_primary_publication: maybe(t.unknown),
    autotranslate_to: maybe(t.string),
    tracking_parameters: maybe(t.record(t.string, t.unknown))
  })
])

const SubstackNoteContextCodec = t.intersection([
  t.type({
    type: t.string,
    timestamp: t.string,
    users: t.array(SubstackNoteUserCodec)
  }),
  t.partial({
    fallbackReason: maybe(t.string),
    fallbackUrl: maybe(t.string),
    isFresh: maybe(t.boolean),
    source: maybe(t.string),
    page: maybe(t.string),
    page_rank: maybe(t.number)
  })
])

/**
 * Codec for Note API responses from /reader/feed/profile/{id}?types=note
 * Permissive: only entity_key and type are required
 */
export const SubstackNoteCodec = t.intersection([
  t.type({
    entity_key: t.string,
    type: t.string
  }),
  t.partial({
    context: maybe(SubstackNoteContextCodec),
    publication: maybe(t.unknown),
    post: maybe(t.unknown),
    comment: maybe(SubstackNoteCommentCodec),
    parentComments: maybe(t.array(SubstackNoteCommentCodec)),
    isMuted: maybe(t.boolean),
    canReply: maybe(t.boolean),
    trackingParameters: maybe(t.record(t.string, t.unknown))
  })
])

export type SubstackNote = t.TypeOf<typeof SubstackNoteCodec>
