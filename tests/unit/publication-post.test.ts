import { PublicationPost } from '@substack-api/domain/publication-post'

describe('PublicationPost', () => {
  it('should create from raw API data with all fields', () => {
    const post = new PublicationPost({
      id: 1,
      title: 'Test Post',
      slug: 'test-post',
      post_date: '2026-01-15T12:00:00Z',
      canonical_url: 'https://example.com/p/test-post',
      subtitle: 'A subtitle',
      cover_image: 'https://img.com/cover.jpg',
      audience: 'everyone',
      reactions: { '❤': 42 },
      restacks: 10,
      section_name: 'Essays'
    })

    expect(post.id).toBe(1)
    expect(post.title).toBe('Test Post')
    expect(post.subtitle).toBe('A subtitle')
    expect(post.slug).toBe('test-post')
    expect(post.url).toBe('https://example.com/p/test-post')
    expect(post.publishedAt).toEqual(new Date('2026-01-15T12:00:00Z'))
    expect(post.coverImage).toBe('https://img.com/cover.jpg')
    expect(post.audience).toBe('everyone')
    expect(post.reactions).toEqual({ '❤': 42 })
    expect(post.restacks).toBe(10)
    expect(post.sectionName).toBe('Essays')
  })

  it('should handle minimal data', () => {
    const post = new PublicationPost({
      id: 2,
      title: 'Minimal',
      slug: 'minimal',
      post_date: '2026-01-01T00:00:00Z',
      canonical_url: 'https://example.com/p/minimal'
    })

    expect(post.id).toBe(2)
    expect(post.subtitle).toBe('')
    expect(post.coverImage).toBeUndefined()
    expect(post.reactions).toBeUndefined()
    expect(post.restacks).toBeUndefined()
  })
})
