import * as t from 'io-ts'

/**
 * Subcategory within a category
 */
const SubstackSubcategoryCodec = t.type({
  id: t.number,
  name: t.string,
  canonical_name: t.string,
  active: t.boolean,
  rank: t.number,
  parent_tag_id: t.number,
  slug: t.string
})

export type SubstackSubcategory = t.TypeOf<typeof SubstackSubcategoryCodec>

/**
 * Top-level category (e.g., "Culture", "Technology")
 */
export const SubstackCategoryCodec = t.type({
  id: t.number,
  name: t.string,
  canonical_name: t.string,
  active: t.boolean,
  rank: t.number,
  slug: t.string,
  subcategories: t.array(SubstackSubcategoryCodec)
})

export type SubstackCategory = t.TypeOf<typeof SubstackCategoryCodec>
