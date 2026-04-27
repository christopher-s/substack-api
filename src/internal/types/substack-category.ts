import * as t from 'io-ts'
import { maybe } from '@substack-api/internal/types/helpers'

/**
 * Subcategory within a category
 */
const SubstackSubcategoryCodec = t.intersection([
  t.type({
    id: t.union([t.number, t.string]),
    name: t.string,
    canonical_name: t.string,
    active: t.boolean,
    rank: t.number,
    parent_tag_id: t.union([t.number, t.null]),
    slug: t.string
  }),
  t.partial({
    created_at: t.string,
    updated_at: t.string,
    emoji: t.union([t.string, t.null]),
    leaderboard_description: t.union([t.string, t.null]),
    deprecated: t.boolean
  })
])

export type SubstackSubcategory = t.TypeOf<typeof SubstackSubcategoryCodec>

/**
 * Top-level category (e.g., "Culture", "Technology")
 */
export const SubstackCategoryCodec = t.intersection([
  t.type({
    id: t.union([t.number, t.string]),
    name: t.string,
    canonical_name: t.string,
    active: t.boolean,
    rank: t.number,
    slug: t.string,
    subcategories: maybe(t.array(SubstackSubcategoryCodec))
  }),
  t.partial({
    created_at: t.string,
    updated_at: t.string,
    parent_tag_id: t.union([t.number, t.null]),
    emoji: t.union([t.string, t.null]),
    leaderboard_description: t.union([t.string, t.null]),
    deprecated: t.boolean
  })
])

export type SubstackCategory = t.TypeOf<typeof SubstackCategoryCodec>
