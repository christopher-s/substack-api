/**
 * Property-based tests for io-ts codec round-trips and rejection of invalid data.
 */

import * as t from 'io-ts'
import * as fc from 'fast-check'
import { isRight, isLeft } from 'fp-ts/Either'

import {
  SubstackUserCodec,
  HandleTypeCodec,
  SubstackPreviewPostCodec,
  SubstackCommentCodec,
  SubstackCategoryCodec,
  SubstackNoteCodec
} from '@substack-api/internal/types'
import { SubstackBylineCodec } from '@substack-api/internal/types/substack-byline'

/* ------------------------------------------------------------------ */
/*  Arbitrary builders                                                 */
/* ------------------------------------------------------------------ */

const maybeArb = <T>(arb: fc.Arbitrary<T>): fc.Arbitrary<T | null | undefined> =>
  fc.oneof(arb, fc.constant(null), fc.constant(undefined))

const reactionsArb = fc.dictionary(fc.string(), fc.integer())
const trackingParamsArb = fc.dictionary(fc.string(), fc.anything())

const substackUserArb = fc.record({
  id: fc.integer(),
  name: fc.string(),
  handle: fc.string(),
  photo_url: fc.string()
})

const substackBylineArb = fc.record({
  id: fc.integer(),
  name: fc.string(),
  handle: fc.string(),
  photo_url: fc.string()
})

const handleTypeArb = fc.oneof(
  fc.constant('existing'),
  fc.constant('subdomain'),
  fc.constant('suggestion')
)

const substackPostTagArb = fc.record({
  id: fc.string(),
  publication_id: fc.integer(),
  name: fc.string(),
  slug: fc.string(),
  hidden: fc.boolean()
})

const substackPreviewPostArb = fc.record({
  id: fc.integer(),
  title: fc.string(),
  post_date: fc.string(),
  slug: maybeArb(fc.string()),
  canonical_url: maybeArb(fc.string()),
  type: maybeArb(fc.string()),
  audience: maybeArb(fc.string()),
  subtitle: maybeArb(fc.string()),
  description: maybeArb(fc.string()),
  body_json: maybeArb(fc.anything()),
  body_html: maybeArb(fc.string()),
  truncated_body_text: maybeArb(fc.string()),
  wordcount: maybeArb(fc.integer()),
  cover_image: maybeArb(fc.string()),
  cover_image_is_square: maybeArb(fc.boolean()),
  cover_image_is_explicit: maybeArb(fc.boolean()),
  podcast_url: maybeArb(fc.string()),
  videoUpload: maybeArb(fc.anything()),
  podcastUpload: maybeArb(fc.anything()),
  podcastFields: maybeArb(fc.anything()),
  podcast_preview_upload_id: maybeArb(fc.string()),
  podcastPreviewUpload: maybeArb(fc.anything()),
  voiceover_upload_id: maybeArb(fc.string()),
  voiceoverUpload: maybeArb(fc.anything()),
  has_voiceover: maybeArb(fc.boolean()),
  reaction_count: maybeArb(fc.integer()),
  reactions: maybeArb(reactionsArb),
  restacks: maybeArb(fc.integer()),
  restacked_post_id: maybeArb(fc.integer()),
  restacked_post_slug: maybeArb(fc.string()),
  restacked_pub_name: maybeArb(fc.string()),
  restacked_pub_logo_url: maybeArb(fc.string()),
  comment_count: maybeArb(fc.integer()),
  child_comment_count: maybeArb(fc.integer()),
  section_id: maybeArb(fc.integer()),
  section_name: maybeArb(fc.string()),
  section_slug: maybeArb(fc.string()),
  is_section_pinned: maybeArb(fc.boolean()),
  default_comment_sort: maybeArb(fc.string()),
  write_comment_permissions: maybeArb(fc.string()),
  should_send_free_preview: maybeArb(fc.boolean()),
  free_unlock_required: maybeArb(fc.boolean()),
  is_geoblocked: maybeArb(fc.boolean()),
  hasCashtag: maybeArb(fc.boolean()),
  teaser_post_eligible: maybeArb(fc.boolean()),
  postCountryBlocks: maybeArb(fc.anything()),
  headlineTest: maybeArb(fc.anything()),
  coverImagePalette: maybeArb(fc.anything()),
  publishedBylines: maybeArb(fc.array(substackBylineArb)),
  postTags: maybeArb(fc.array(substackPostTagArb)),
  editor_v2: maybeArb(fc.boolean()),
  publication_id: maybeArb(fc.integer()),
  social_title: maybeArb(fc.string()),
  search_engine_title: maybeArb(fc.string()),
  search_engine_description: maybeArb(fc.string()),
  video_upload_id: maybeArb(fc.string()),
  podcast_upload_id: maybeArb(fc.string()),
  top_exclusions: maybeArb(fc.array(fc.anything())),
  pins: maybeArb(fc.array(fc.anything()))
})

const substackNoteAttachmentArb = fc.record({
  id: fc.oneof(fc.integer(), fc.string()),
  type: fc.string(),
  imageUrl: maybeArb(fc.string()),
  imageWidth: maybeArb(fc.integer()),
  imageHeight: maybeArb(fc.integer()),
  explicit: maybeArb(fc.boolean()),
  publication: maybeArb(fc.anything())
})

const substackCommentArb = fc.record({
  id: fc.integer(),
  body: fc.string(),
  user_id: maybeArb(fc.integer()),
  type: maybeArb(fc.string()),
  date: maybeArb(fc.string()),
  name: maybeArb(fc.string()),
  reaction_count: maybeArb(fc.integer()),
  reactions: maybeArb(reactionsArb),
  restacks: maybeArb(fc.integer()),
  restacked: maybeArb(fc.boolean()),
  children_count: maybeArb(fc.integer()),
  body_json: maybeArb(fc.anything()),
  publication_id: maybeArb(fc.integer()),
  post_id: maybeArb(fc.integer()),
  edited_at: maybeArb(fc.string()),
  ancestor_path: maybeArb(fc.string()),
  reply_minimum_role: maybeArb(fc.string()),
  media_clip_id: maybeArb(fc.string()),
  photo_url: maybeArb(fc.string()),
  bio: maybeArb(fc.string()),
  handle: maybeArb(fc.string()),
  user_bestseller_tier: maybeArb(fc.string()),
  attachments: maybeArb(fc.array(substackNoteAttachmentArb)),
  userStatus: maybeArb(fc.anything()),
  user_primary_publication: maybeArb(fc.anything()),
  language: maybeArb(fc.string()),
  autotranslate_to: maybeArb(fc.string()),
  tracking_parameters: maybeArb(trackingParamsArb),
  author_is_admin: maybeArb(fc.boolean())
})

const substackSubcategoryArb = fc.record({
  id: fc.oneof(fc.integer(), fc.string()),
  name: fc.string(),
  canonical_name: fc.string(),
  active: fc.boolean(),
  rank: fc.integer(),
  parent_tag_id: fc.oneof(fc.integer(), fc.constant(null)),
  slug: fc.string(),
  created_at: fc.option(fc.string(), { nil: undefined }),
  updated_at: fc.option(fc.string(), { nil: undefined }),
  emoji: fc.option(fc.oneof(fc.string(), fc.constant(null)), { nil: undefined }),
  leaderboard_description: fc.option(fc.oneof(fc.string(), fc.constant(null)), { nil: undefined }),
  deprecated: fc.option(fc.boolean(), { nil: undefined })
})

const substackCategoryArb = fc.record({
  id: fc.oneof(fc.integer(), fc.string()),
  name: fc.string(),
  canonical_name: fc.string(),
  active: fc.boolean(),
  rank: fc.integer(),
  slug: fc.string(),
  subcategories: maybeArb(fc.array(substackSubcategoryArb)),
  created_at: fc.option(fc.string(), { nil: undefined }),
  updated_at: fc.option(fc.string(), { nil: undefined }),
  parent_tag_id: fc.option(fc.oneof(fc.integer(), fc.constant(null)), { nil: undefined }),
  emoji: fc.option(fc.oneof(fc.string(), fc.constant(null)), { nil: undefined }),
  leaderboard_description: fc.option(fc.oneof(fc.string(), fc.constant(null)), { nil: undefined }),
  deprecated: fc.option(fc.boolean(), { nil: undefined })
})

const substackNoteUserArb = fc.record({
  id: fc.integer(),
  name: fc.string(),
  handle: fc.string(),
  photo_url: fc.string(),
  previous_name: maybeArb(fc.string()),
  bio: maybeArb(fc.string()),
  profile_set_up_at: maybeArb(fc.string()),
  reader_installed_at: maybeArb(fc.string()),
  bestseller_tier: maybeArb(fc.string()),
  status: maybeArb(fc.anything()),
  primary_publication: maybeArb(fc.anything())
})

const substackNoteCommentArb = fc.record({
  id: fc.integer(),
  body: fc.string(),
  user_id: maybeArb(fc.integer()),
  type: maybeArb(fc.string()),
  date: maybeArb(fc.string()),
  name: maybeArb(fc.string()),
  reaction_count: maybeArb(fc.integer()),
  reactions: maybeArb(reactionsArb),
  restacks: maybeArb(fc.integer()),
  restacked: maybeArb(fc.boolean()),
  children_count: maybeArb(fc.integer()),
  language: maybeArb(fc.string()),
  body_json: maybeArb(fc.anything()),
  publication_id: maybeArb(fc.integer()),
  post_id: maybeArb(fc.integer()),
  edited_at: maybeArb(fc.string()),
  ancestor_path: maybeArb(fc.string()),
  reply_minimum_role: maybeArb(fc.string()),
  media_clip_id: maybeArb(fc.string()),
  photo_url: maybeArb(fc.string()),
  bio: maybeArb(fc.string()),
  handle: maybeArb(fc.string()),
  user_bestseller_tier: maybeArb(fc.string()),
  attachments: maybeArb(fc.array(substackNoteAttachmentArb)),
  userStatus: maybeArb(fc.anything()),
  user_primary_publication: maybeArb(fc.anything()),
  autotranslate_to: maybeArb(fc.string()),
  tracking_parameters: maybeArb(trackingParamsArb)
})

const substackNoteContextArb = fc.record({
  type: fc.string(),
  timestamp: fc.string(),
  users: fc.array(substackNoteUserArb),
  fallbackReason: maybeArb(fc.string()),
  fallbackUrl: maybeArb(fc.string()),
  isFresh: maybeArb(fc.boolean()),
  source: maybeArb(fc.string()),
  page: maybeArb(fc.string()),
  page_rank: maybeArb(fc.integer())
})

const substackNoteArb = fc.record({
  entity_key: fc.string(),
  type: fc.string(),
  context: maybeArb(substackNoteContextArb),
  publication: maybeArb(fc.anything()),
  post: maybeArb(fc.anything()),
  comment: maybeArb(substackNoteCommentArb),
  parentComments: maybeArb(fc.array(substackNoteCommentArb)),
  isMuted: maybeArb(fc.boolean()),
  canReply: maybeArb(fc.boolean()),
  trackingParameters: maybeArb(trackingParamsArb)
})

/* ------------------------------------------------------------------ */
/*  Round-trip helper                                                  */
/* ------------------------------------------------------------------ */

function assertRoundTrip(codec: t.Mixed, arb: fc.Arbitrary<unknown>): void {
  fc.assert(
    fc.property(arb, (value) => {
      const encoded = codec.encode(value)
      const decoded = codec.decode(encoded)
      expect(isRight(decoded)).toBe(true)
      if (isRight(decoded)) {
        expect(decoded.right).toEqual(value)
      }
    }),
    { numRuns: 100 }
  )
}

function assertRejectsInvalid(
  codec: t.Mixed,
  validArb: fc.Arbitrary<unknown>,
  mutate: (v: unknown) => unknown
): void {
  fc.assert(
    fc.property(validArb, (value) => {
      const invalid = mutate(value)
      const result = codec.decode(invalid)
      expect(isLeft(result)).toBe(true)
    }),
    { numRuns: 100 }
  )
}

/* ------------------------------------------------------------------ */
/*  Tests                                                              */
/* ------------------------------------------------------------------ */

describe('codec round-trips', () => {
  it('SubstackUserCodec', () => {
    assertRoundTrip(SubstackUserCodec, substackUserArb)
  })

  it('SubstackBylineCodec', () => {
    assertRoundTrip(SubstackBylineCodec, substackBylineArb)
  })

  it('HandleTypeCodec', () => {
    assertRoundTrip(HandleTypeCodec, handleTypeArb)
  })

  it('SubstackPreviewPostCodec', () => {
    assertRoundTrip(SubstackPreviewPostCodec, substackPreviewPostArb)
  })

  it('SubstackCommentCodec', () => {
    assertRoundTrip(SubstackCommentCodec, substackCommentArb)
  })

  it('SubstackCategoryCodec', () => {
    assertRoundTrip(SubstackCategoryCodec, substackCategoryArb)
  })

  it('SubstackNoteCodec', () => {
    assertRoundTrip(SubstackNoteCodec, substackNoteArb)
  })
})

describe('codec rejects invalid data', () => {
  it('SubstackUserCodec rejects string id', () => {
    assertRejectsInvalid(SubstackUserCodec, substackUserArb, (v) => ({
      ...(v as Record<string, unknown>),
      id: 'not-a-number'
    }))
  })

  it('SubstackBylineCodec rejects missing required field', () => {
    assertRejectsInvalid(SubstackBylineCodec, substackBylineArb, (v) => {
      const { name: _name, ...rest } = v as Record<string, unknown>
      return rest
    })
  })

  it('HandleTypeCodec rejects unknown literal', () => {
    assertRejectsInvalid(HandleTypeCodec, handleTypeArb, () => 'unknown-value')
  })

  it('SubstackPreviewPostCodec rejects string id', () => {
    assertRejectsInvalid(SubstackPreviewPostCodec, substackPreviewPostArb, (v) => ({
      ...(v as Record<string, unknown>),
      id: 'not-a-number'
    }))
  })

  it('SubstackCommentCodec rejects string body', () => {
    assertRejectsInvalid(SubstackCommentCodec, substackCommentArb, (v) => ({
      ...(v as Record<string, unknown>),
      body: 999
    }))
  })

  it('SubstackCategoryCodec rejects boolean rank', () => {
    assertRejectsInvalid(SubstackCategoryCodec, substackCategoryArb, (v) => ({
      ...(v as Record<string, unknown>),
      rank: false
    }))
  })

  it('SubstackNoteCodec rejects missing entity_key', () => {
    assertRejectsInvalid(SubstackNoteCodec, substackNoteArb, (v) => {
      const { entity_key: _entityKey, ...rest } = v as Record<string, unknown>
      return rest
    })
  })
})
