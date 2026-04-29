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
 * A trending post — plain interface
 */
export interface SubstackTrendingPost {
  id: number
  title: string
  slug: string
  post_date: string
  type: string
  audience?: string
  subtitle?: string
  canonical_url?: string
  reactions?: Record<string, number>
  restacks?: number
  wordcount?: number
  comment_count?: number
  cover_image?: string
  publishedBylines?: Array<{
    id: number
    name: string
    handle: string
    photo_url: string
  }>
}

/**
 * A publication from trending results — plain interface
 */
export interface SubstackTrendingPublication {
  id: number
  name: string
  subdomain: string
  logo_url?: string | null
  cover_photo_url?: string | null
  type?: string
  author_name?: string
  author_handle?: string
  has_posts?: boolean
  has_podcast?: boolean
}

/**
 * Top-level response shape for trending data.
 * The original /api/v1/trending endpoint has been deprecated; consumers
 * should use discovery-service.getTrending() which backfills from /inbox/top.
 */
export interface SubstackTrendingResponse {
  posts: SubstackTrendingPost[]
  publications: SubstackTrendingPublication[]
  trendingPosts: SubstackTrendingPostRef[]
}
