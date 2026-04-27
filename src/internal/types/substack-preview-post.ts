import * as t from 'io-ts'
import { maybe } from '@substack-api/internal/types/helpers'
import { SubstackBylineCodec } from '@substack-api/internal/types/substack-byline'

const SubstackPostTagCodec = t.type({
  id: t.string,
  publication_id: t.number,
  name: t.string,
  slug: t.string,
  hidden: t.boolean
})

/**
 * Raw API response shape for posts from /api/v1/profile/posts
 * Permissive: only id, title, post_date are required
 */
export const SubstackPreviewPostCodec = t.intersection([
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
    body_json: maybe(t.unknown),
    body_html: maybe(t.string),
    truncated_body_text: maybe(t.string),
    wordcount: maybe(t.number),
    cover_image: maybe(t.string),
    cover_image_is_square: maybe(t.boolean),
    cover_image_is_explicit: maybe(t.boolean),
    podcast_url: maybe(t.string),
    videoUpload: maybe(t.unknown),
    podcastUpload: maybe(t.unknown),
    podcastFields: maybe(t.unknown),
    podcast_preview_upload_id: maybe(t.string),
    podcastPreviewUpload: maybe(t.unknown),
    voiceover_upload_id: maybe(t.string),
    voiceoverUpload: maybe(t.unknown),
    has_voiceover: maybe(t.boolean),
    reaction_count: maybe(t.number),
    reactions: maybe(t.record(t.string, t.number)),
    restacks: maybe(t.number),
    restacked_post_id: maybe(t.number),
    restacked_post_slug: maybe(t.string),
    restacked_pub_name: maybe(t.string),
    restacked_pub_logo_url: maybe(t.string),
    comment_count: maybe(t.number),
    child_comment_count: maybe(t.number),
    section_id: maybe(t.number),
    section_name: maybe(t.string),
    section_slug: maybe(t.string),
    is_section_pinned: maybe(t.boolean),
    default_comment_sort: maybe(t.string),
    write_comment_permissions: maybe(t.string),
    should_send_free_preview: maybe(t.boolean),
    free_unlock_required: maybe(t.boolean),
    is_geoblocked: maybe(t.boolean),
    hasCashtag: maybe(t.boolean),
    teaser_post_eligible: maybe(t.boolean),
    postCountryBlocks: maybe(t.unknown),
    headlineTest: maybe(t.unknown),
    coverImagePalette: maybe(t.unknown),
    publishedBylines: maybe(t.array(SubstackBylineCodec)),
    postTags: maybe(t.array(SubstackPostTagCodec)),
    editor_v2: maybe(t.boolean),
    publication_id: maybe(t.number),
    social_title: maybe(t.string),
    search_engine_title: maybe(t.string),
    search_engine_description: maybe(t.string),
    video_upload_id: maybe(t.string),
    podcast_upload_id: maybe(t.string),
    top_exclusions: maybe(t.array(t.unknown)),
    pins: maybe(t.array(t.unknown))
  })
])

export type SubstackPreviewPost = t.TypeOf<typeof SubstackPreviewPostCodec>
