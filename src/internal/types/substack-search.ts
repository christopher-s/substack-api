import * as t from 'io-ts'

/**
 * Profile result in a search response
 */
const SearchProfileCodec = t.type({
  id: t.number,
  name: t.string,
  handle: t.string,
  photo_url: t.string
})

/**
 * Profile search results group (first item type in search response)
 */
export const SubstackProfileSearchResultsCodec = t.type({
  type: t.literal('profileSearchResults'),
  results: t.array(SearchProfileCodec),
  hasMore: t.boolean,
  expansionUrl: t.string
})

export type SubstackProfileSearchResults = t.TypeOf<typeof SubstackProfileSearchResultsCodec>

/**
 * A single search result item (post, comment/note, or profile group)
 * The response is a heterogeneous array — first item may be profileSearchResults,
 * rest are individual post/comment entities.
 */
export const SubstackSearchResponseCodec = t.type({
  items: t.array(t.unknown),
  nextCursor: t.union([t.string, t.null]),
  originalCursorTimestamp: t.union([t.string, t.null])
})

export type SubstackSearchResponse = t.TypeOf<typeof SubstackSearchResponseCodec>
