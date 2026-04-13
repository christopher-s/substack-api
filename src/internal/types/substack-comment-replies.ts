import * as t from 'io-ts'

/**
 * A comment within a reply branch from GET /api/v1/reader/comment/{id}/replies
 */
export const SubstackReplyCommentCodec = t.intersection([
  t.type({
    id: t.number,
    body: t.string,
    date: t.string
  }),
  t.partial({
    name: t.string,
    photo_url: t.string,
    user_id: t.number,
    children_count: t.number,
    reaction_count: t.number,
    reactions: t.record(t.string, t.number),
    restacks: t.number,
    restacked: t.boolean,
    ancestor_path: t.string,
    post_id: t.number,
    publication_id: t.number,
    edited_at: t.union([t.string, t.null])
  })
])

export type SubstackReplyComment = t.TypeOf<typeof SubstackReplyCommentCodec>

/**
 * A branch of threaded replies from the comment replies endpoint
 */
export const SubstackCommentBranchCodec = t.type({
  comment: SubstackReplyCommentCodec,
  descendantComments: t.array(SubstackReplyCommentCodec)
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
