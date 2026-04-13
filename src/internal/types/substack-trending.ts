import * as t from 'io-ts'
import { SubstackBylineCodec } from '@substack-api/internal/types/substack-byline'

/**
 * A trending post from GET /api/v1/trending
 * Kept to fields consumers actually use
 */
export const SubstackTrendingPostCodec = t.intersection([
  t.type({
    id: t.number,
    title: t.string,
    slug: t.string,
    post_date: t.string,
    type: t.string
  }),
  t.partial({
    audience: t.string,
    subtitle: t.string,
    canonical_url: t.string,
    reactions: t.record(t.string, t.number),
    restacks: t.number,
    wordcount: t.number,
    comment_count: t.number,
    cover_image: t.string,
    publishedBylines: t.array(SubstackBylineCodec)
  })
])

export type SubstackTrendingPost = t.TypeOf<typeof SubstackTrendingPostCodec>

/**
 * A publication from GET /api/v1/trending
 * Trimmed to most useful optional fields
 */
export const SubstackTrendingPublicationCodec = t.intersection([
  t.type({
    id: t.number,
    name: t.string,
    subdomain: t.string
  }),
  t.partial({
    logo_url: t.union([t.string, t.null]),
    cover_photo_url: t.union([t.string, t.null]),
    type: t.string,
    author_name: t.string,
    author_handle: t.string,
    has_posts: t.boolean,
    has_podcast: t.boolean
  })
])

export type SubstackTrendingPublication = t.TypeOf<typeof SubstackTrendingPublicationCodec>

/**
 * A trending post reference — plain interface (all fields optional by nature)
 * No io-ts codec needed: validates nothing meaningful when every field is optional
 */
export interface SubstackTrendingPostRef {
  post_id?: number
  publication_id?: number | null
  primary_category?: string | null
  tag_id?: number | null
}

/**
 * Top-level response from GET /api/v1/trending
 */
export const SubstackTrendingResponseCodec = t.type({
  posts: t.array(SubstackTrendingPostCodec),
  publications: t.array(SubstackTrendingPublicationCodec),
  trendingPosts: t.array(t.unknown)
})

export interface SubstackTrendingResponse {
  posts: SubstackTrendingPost[]
  publications: SubstackTrendingPublication[]
  trendingPosts: SubstackTrendingPostRef[]
}
