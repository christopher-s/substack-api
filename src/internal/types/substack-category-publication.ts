import * as t from 'io-ts'

/**
 * A publication listed under a category (e.g., from GET /category/public/{id}/posts)
 * Required fields: author_id, name, subdomain
 * Optional fields: logo_url, cover_photo_url, created_at, custom_domain
 */
export const SubstackCategoryPublicationCodec = t.type({
  author_id: t.number,
  name: t.string,
  subdomain: t.string,
  logo_url: t.union([t.string, t.undefined]),
  cover_photo_url: t.union([t.string, t.undefined]),
  created_at: t.union([t.string, t.undefined]),
  custom_domain: t.union([t.string, t.null, t.undefined])
})

export type SubstackCategoryPublication = t.TypeOf<typeof SubstackCategoryPublicationCodec>
