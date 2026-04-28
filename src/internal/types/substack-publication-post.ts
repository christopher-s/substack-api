import * as t from 'io-ts'

/**
 * Post from a publication archive or homepage_data
 * Used by /api/v1/archive and /api/v1/homepage_data endpoints
 */
export const SubstackPublicationPostCodec = t.intersection([
  t.type({
    id: t.number,
    title: t.string,
    slug: t.string,
    post_date: t.string,
    canonical_url: t.string
  }),
  t.partial({
    subtitle: t.union([t.string, t.null]),
    cover_image: t.union([t.string, t.null]),
    cover_image_is_square: t.boolean,
    audience: t.string,
    type: t.string,
    reactions: t.record(t.string, t.number),
    restacks: t.number,
    section_id: t.union([t.number, t.null]),
    section_name: t.union([t.string, t.null]),
    section_slug: t.union([t.string, t.null]),
    podcast_url: t.union([t.string, t.null]),
    videoUpload: t.union([t.unknown, t.null])
  })
])

export type SubstackPublicationPost = t.TypeOf<typeof SubstackPublicationPostCodec>
