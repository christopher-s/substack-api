import * as t from 'io-ts'
import { maybe } from '@substack-api/internal/types/helpers'

/**
 * A comment within a reply branch from GET /api/v1/reader/comment/{id}/replies
 * Permissive: only id and body are required
 */
export const SubstackReplyCommentCodec = t.intersection([
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
    attachments: maybe(t.array(t.unknown)),
    userStatus: maybe(t.unknown),
    user_primary_publication: maybe(t.unknown),
    language: maybe(t.string),
    autotranslate_to: maybe(t.string),
    tracking_parameters: maybe(t.record(t.string, t.unknown))
  })
])

export type SubstackReplyComment = t.TypeOf<typeof SubstackReplyCommentCodec>

const DescendantCommentWrapperCodec = t.type({
  type: t.string,
  comment: SubstackReplyCommentCodec
})

/**
 * A branch of threaded replies from the comment replies endpoint
 * descendantComments are wrapped objects: { type: "comment", comment: {...} }
 */
export const SubstackCommentBranchCodec = t.type({
  comment: SubstackReplyCommentCodec,
  descendantComments: t.array(DescendantCommentWrapperCodec)
})

export type SubstackCommentBranch = t.TypeOf<typeof SubstackCommentBranchCodec>

/**
 * Response from GET /api/v1/reader/comment/{id}/replies
 */
export const SubstackCommentRepliesResponseCodec = t.type({
  commentBranches: t.array(SubstackCommentBranchCodec),
  moreBranches: t.number,
  nextCursor: t.union([t.string, t.null])
})

export type SubstackCommentRepliesResponse = t.TypeOf<typeof SubstackCommentRepliesResponseCodec>
