import * as t from 'io-ts'
import { maybe } from '@substack-api/internal/types/helpers'
import { SubstackPublicationPostCodec } from '@substack-api/internal/types/substack-publication-post'
import { SubstackBylineCodec } from '@substack-api/internal/types/substack-byline'

const SubstackPostTagCodec = t.type({
  id: t.number,
  publication_id: t.number,
  name: t.string,
  slug: t.string,
  hidden: t.boolean
})

/**
 * Full post from the publication /posts endpoint
 * Extends the base publication post with all additional fields seen in live API
 * Used by GET {pub}/api/v1/posts (anonymous)
 */
export const SubstackPublicationFullPostCodec = t.intersection([
  SubstackPublicationPostCodec,
  t.partial({
    body_html: maybe(t.string),
    description: maybe(t.string),
    wordcount: maybe(t.number),
    meter_type: maybe(t.string),
    write_comment_permissions: maybe(t.string),
    postTags: maybe(t.array(SubstackPostTagCodec)),
    podcastFields: maybe(t.unknown),
    voiceover_upload_id: maybe(t.string),
    voiceoverUpload: maybe(t.unknown),
    has_voiceover: maybe(t.boolean),
    editor_v2: maybe(t.boolean),
    publication_id: maybe(t.number),
    social_title: maybe(t.string),
    search_engine_title: maybe(t.string),
    search_engine_description: maybe(t.string),
    video_upload_id: maybe(t.string),
    podcast_upload_id: maybe(t.string),
    top_exclusions: maybe(t.array(t.unknown)),
    pins: maybe(t.array(t.unknown)),
    is_section_pinned: maybe(t.boolean),
    section_slug: maybe(t.string),
    section_name: maybe(t.string),
    should_send_free_preview: maybe(t.boolean),
    free_unlock_required: maybe(t.boolean),
    default_comment_sort: maybe(t.string),
    restacked_post_id: maybe(t.number),
    restacked_post_slug: maybe(t.string),
    restacked_pub_name: maybe(t.string),
    restacked_pub_logo_url: maybe(t.string),
    cover_image_is_square: maybe(t.boolean),
    cover_image_is_explicit: maybe(t.boolean),
    teaser_post_eligible: maybe(t.boolean),
    postCountryBlocks: maybe(t.unknown),
    headlineTest: maybe(t.unknown),
    coverImagePalette: maybe(t.unknown),
    reaction: maybe(t.unknown),
    is_geoblocked: maybe(t.boolean),
    hasCashtag: maybe(t.boolean),
    comment_count: maybe(t.number),
    child_comment_count: maybe(t.number),
    publishedBylines: maybe(t.array(SubstackBylineCodec))
  })
])

export type SubstackPublicationFullPost = t.TypeOf<typeof SubstackPublicationFullPostCodec>
