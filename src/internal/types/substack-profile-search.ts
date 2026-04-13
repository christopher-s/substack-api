import * as t from 'io-ts'

/**
 * A profile search result from GET /api/v1/profile/search
 * Kept to fields most useful for consumers
 */
export const SubstackProfileSearchResultCodec = t.intersection([
  t.type({
    id: t.number,
    name: t.string,
    handle: t.string
  }),
  t.partial({
    bio: t.union([t.string, t.null]),
    photo_url: t.union([t.string, t.null]),
    followerCount: t.number,
    subscriberCount: t.number,
    hasPosts: t.boolean,
    slug: t.string
  })
])

export type SubstackProfileSearchResult = t.TypeOf<typeof SubstackProfileSearchResultCodec>

/**
 * Response from GET /api/v1/profile/search
 */
export const SubstackProfileSearchResponseCodec = t.type({
  results: t.array(SubstackProfileSearchResultCodec),
  more: t.boolean
})

export type SubstackProfileSearchResponse = t.TypeOf<typeof SubstackProfileSearchResponseCodec>
