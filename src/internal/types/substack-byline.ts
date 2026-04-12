import * as t from 'io-ts'

/**
 * Author byline from publishedBylines array in post responses
 */
export const SubstackBylineCodec = t.type({
  id: t.number,
  name: t.string,
  handle: t.string,
  photo_url: t.string
})

export type SubstackByline = t.TypeOf<typeof SubstackBylineCodec>
