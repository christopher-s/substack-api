import { Category } from '@substack-api/domain/category'

describe('Category', () => {
  it('should create from raw API data', () => {
    const category = new Category({
      id: 1,
      name: 'Technology',
      canonical_name: 'technology',
      active: true,
      rank: 0,
      slug: 'technology',
      subcategories: [
        {
          id: 10,
          name: 'AI',
          canonical_name: 'ai',
          active: true,
          rank: 0,
          parent_tag_id: 1,
          slug: 'ai'
        }
      ]
    })

    expect(category.id).toBe(1)
    expect(category.name).toBe('Technology')
    expect(category.slug).toBe('technology')
    expect(category.subcategories).toHaveLength(1)
    expect(category.subcategories[0].name).toBe('AI')
  })
})
