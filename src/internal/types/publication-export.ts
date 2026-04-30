import * as t from 'io-ts'
import { maybe } from '@substack-api/internal/types/helpers'

/**
 * An export object from GET /publication_export
 */
export const SubstackPublicationExportCodec = t.intersection([
  t.type({}),
  t.partial({
    id: maybe(t.number),
    publication_id: maybe(t.number),
    status: maybe(t.string),
    type: maybe(t.string),
    url: maybe(t.string),
    created_at: maybe(t.string),
    completed_at: maybe(t.string),
    expires_at: maybe(t.string),
    error: maybe(t.string),
    file_size: maybe(t.number)
  })
])

export type SubstackPublicationExport = t.TypeOf<typeof SubstackPublicationExportCodec>

/**
 * A publication search result from GET /publication/search
 */
export const SubstackPublicationSearchResultCodec = t.intersection([
  t.type({
    id: t.number
  }),
  t.partial({
    name: maybe(t.string),
    subdomain: maybe(t.string),
    custom_domain: maybe(t.string),
    logo_url: maybe(t.string),
    description: maybe(t.string),
    author_id: maybe(t.number),
    author_name: maybe(t.string),
    author_handle: maybe(t.string),
    author_photo_url: maybe(t.string),
    handles_enabled: maybe(t.boolean),
    explicit: maybe(t.boolean),
    is_personal_mode: maybe(t.boolean),
    payments_state: maybe(t.string),
    pledges_enabled: maybe(t.boolean),
    subscriber_count: maybe(t.number),
    subscriber_count_string: maybe(t.string),
    twitter_screen_name: maybe(t.string),
    github_username: maybe(t.string),
    cover_photo_url: maybe(t.string),
    created_at: maybe(t.string)
  })
])

export type SubstackPublicationSearchResult = t.TypeOf<typeof SubstackPublicationSearchResultCodec>

/**
 * Response from GET /publication/search?query=...&limit=...
 */
export const SubstackPublicationSearchResponseCodec = t.type({
  results: t.array(SubstackPublicationSearchResultCodec)
})

export type SubstackPublicationSearchResponse = t.TypeOf<
  typeof SubstackPublicationSearchResponseCodec
>
