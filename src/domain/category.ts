import type { SubstackCategory } from '@substack-api/internal/types'

/**
 * Category representing a Substack content category (e.g., "Culture", "Technology")
 */
export class Category {
  public readonly id: number
  public readonly name: string
  public readonly slug: string
  public readonly rank: number
  public readonly subcategories: ReadonlyArray<{
    id: number
    name: string
    slug: string
    rank: number
  }>

  constructor(rawData: SubstackCategory) {
    this.id = Number(rawData.id)
    this.name = rawData.name
    this.slug = rawData.slug
    this.rank = rawData.rank
    this.subcategories = (rawData.subcategories || []).map((sub) => ({
      id: Number(sub.id),
      name: sub.name,
      slug: sub.slug,
      rank: sub.rank
    }))
  }
}
