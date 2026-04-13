import * as t from 'io-ts'
import { SubstackBylineCodec } from '@substack-api/internal/types/substack-byline'

/**
 * Raw API response shape for posts - minimal validation
 * Only validates fields actually used by PreviewPost domain class
 */
export const SubstackPreviewPostCodec = t.intersection([
  t.type({
    id: t.number,
    title: t.string,
    post_date: t.string
  }),
  t.partial({
    subtitle: t.string,
    truncated_body_text: t.string,
    reaction_count: t.number,
    publishedBylines: t.array(SubstackBylineCodec)
  })
])

export type SubstackPreviewPost = t.TypeOf<typeof SubstackPreviewPostCodec>
