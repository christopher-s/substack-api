import * as t from 'io-ts'

/**
 * Author/byline in an inbox item
 */
const InboxItemAuthorCodec = t.type({
  id: t.number,
  name: t.string,
  handle: t.string,
  photo_url: t.string
})

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
    subtitle: t.union([t.string, t.null]),
    cover_photo_url: t.union([t.string, t.null]),
    audience: t.string,
    postType: t.string,
    authors: t.array(t.string),
    published_bylines: t.array(InboxItemAuthorCodec),
    publication_id: t.union([t.number, t.null]),
    publisher_name: t.union([t.string, t.null]),
    publisher_image_url: t.union([t.string, t.null]),
    like_count: t.union([t.number, t.null]),
    comment_count: t.union([t.number, t.null]),
    content_date: t.union([t.string, t.null]),
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
