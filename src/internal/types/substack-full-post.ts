import * as t from 'io-ts'
import { maybe } from '@substack-api/internal/types/helpers'
import { SubstackBylineCodec } from '@substack-api/internal/types/substack-byline'

/**
 * Raw API response shape for full posts from /posts/by-id/:id endpoint
 * Permissive: only id, title, post_date are required; all others use maybe()
 */
export const SubstackFullPostCodec = t.intersection([
  t.type({
    id: t.number,
    title: t.string,
    post_date: t.string
  }),
  t.partial({
    slug: maybe(t.string),
    canonical_url: maybe(t.string),
    type: maybe(t.string),
    audience: maybe(t.string),
    subtitle: maybe(t.string),
    description: maybe(t.string),
    truncated_body_text: maybe(t.string),
    body_html: maybe(t.string),
    htmlBody: maybe(t.string),
    wordcount: maybe(t.number),
    cover_image: maybe(t.string),
    podcast_url: maybe(t.string),
    reactions: maybe(t.record(t.string, t.number)),
    reaction_count: maybe(t.number),
    restacks: maybe(t.number),
    comment_count: maybe(t.number),
    child_comment_count: maybe(t.number),
    postTags: maybe(t.array(t.string)),
    publishedBylines: maybe(t.array(SubstackBylineCodec))
  })
])

export type SubstackFullPost = t.TypeOf<typeof SubstackFullPostCodec>
