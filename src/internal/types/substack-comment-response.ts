import * as t from 'io-ts'
import { maybe } from '@substack-api/internal/types/helpers'
import { SubstackCommentCodec } from '@substack-api/internal/types/substack-comment'

const SubstackCommentResponseUserCodec = t.intersection([
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

const SubstackCommentResponseContextCodec = t.intersection([
  t.type({
    type: t.string,
    timestamp: t.string,
    users: t.array(SubstackCommentResponseUserCodec)
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
 * Response structure from /reader/comment/{id} endpoint
 * Permissive: only the item wrapper is required; all nested fields are optional
 */
export const SubstackCommentResponseCodec = t.type({
  item: t.intersection([
    t.type({
      comment: SubstackCommentCodec
    }),
    t.partial({
      entity_key: maybe(t.string),
      type: maybe(t.string),
      context: maybe(SubstackCommentResponseContextCodec),
      publication: maybe(t.unknown),
      post: maybe(t.unknown),
      parentComments: maybe(t.array(SubstackCommentCodec)),
      isMuted: maybe(t.boolean),
      canReply: maybe(t.boolean),
      trackingParameters: maybe(t.record(t.string, t.unknown))
    })
  ])
})

export type SubstackCommentResponse = t.TypeOf<typeof SubstackCommentResponseCodec>
