import * as t from 'io-ts'
import { SubstackPublicationPostCodec } from '@substack-api/internal/types/substack-publication-post'

/**
 * Full post from the publication /posts endpoint
 * Extends the base publication post with body_html and additional metadata
 * Used by GET {pub}/api/v1/posts (anonymous)
 */
export const SubstackPublicationFullPostCodec = t.intersection([
  SubstackPublicationPostCodec,
  t.partial({
    body_html: t.string,
    description: t.string,
    wordcount: t.number,
    meter_type: t.string,
    write_comment_permissions: t.string,
    postTags: t.array(t.string)
  })
])

export type SubstackPublicationFullPost = t.TypeOf<typeof SubstackPublicationFullPostCodec>
