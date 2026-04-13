import { DiscoveryService } from '@substack-api/internal/services/discovery-service'
import type { HttpClient } from '@substack-api/internal/http-client'

describe('DiscoveryService - getTrending', () => {
  let mockClient: jest.Mocked<HttpClient>
  let service: DiscoveryService

  beforeEach(() => {
    mockClient = {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn()
    } as unknown as jest.Mocked<HttpClient>
    service = new DiscoveryService(mockClient)
  })

  it('should fetch and decode trending response', async () => {
    mockClient.get.mockResolvedValue({
      posts: [
        {
          id: 100,
          title: 'Trending Post',
          slug: 'trending-post',
          post_date: '2025-01-01T00:00:00Z',
          type: 'post',
          audience: 'everyone',
          body_html: '<p>Hello</p>',
          reactions: { '\u2764': 7582 },
          restacks: 120,
          wordcount: 500,
          postTags: ['tech'],
          reaction_count: 7702,
          comment_count: 45,
          child_comment_count: 90,
          publishedBylines: [
            { id: 1, name: 'Author', handle: 'author', photo_url: 'https://example.com/photo.jpg' }
          ]
        }
      ],
      publications: [
        {
          id: 200,
          name: 'Test Publication',
          subdomain: 'testpub',
          logo_url: 'https://example.com/logo.png',
          author_id: 1,
          author_name: 'Author',
          author_handle: 'author'
        }
      ],
      trendingPosts: [{ post_id: 100, publication_id: 200, primary_category: 'tech', tag_id: 5 }]
    })

    const result = await service.getTrending()
    expect(result.posts).toHaveLength(1)
    expect(result.posts[0].id).toBe(100)
    expect(result.posts[0].title).toBe('Trending Post')
    expect(result.publications).toHaveLength(1)
    expect(result.publications[0].name).toBe('Test Publication')
    expect(result.trendingPosts).toHaveLength(1)
    expect(result.trendingPosts[0].post_id).toBe(100)
    expect(mockClient.get).toHaveBeenCalledWith('/trending')
  })

  it('should pass limit parameter in URL', async () => {
    mockClient.get.mockResolvedValue({
      posts: [],
      publications: [],
      trendingPosts: []
    })

    await service.getTrending({ limit: 25 })
    expect(mockClient.get).toHaveBeenCalledWith('/trending?limit=25')
  })

  it('should handle empty results', async () => {
    mockClient.get.mockResolvedValue({
      posts: [],
      publications: [],
      trendingPosts: []
    })

    const result = await service.getTrending()
    expect(result.posts).toHaveLength(0)
    expect(result.publications).toHaveLength(0)
    expect(result.trendingPosts).toHaveLength(0)
  })

  it('should omit query params when no options provided', async () => {
    mockClient.get.mockResolvedValue({
      posts: [],
      publications: [],
      trendingPosts: []
    })

    await service.getTrending()
    expect(mockClient.get).toHaveBeenCalledWith('/trending')
  })

  it('should decode posts with only required fields', async () => {
    mockClient.get.mockResolvedValue({
      posts: [
        {
          id: 300,
          title: 'Minimal Post',
          slug: 'minimal-post',
          post_date: '2025-06-01T00:00:00Z',
          type: 'newsletter'
        }
      ],
      publications: [
        {
          id: 400,
          name: 'Minimal Pub',
          subdomain: 'minimal'
        }
      ],
      trendingPosts: [{}]
    })

    const result = await service.getTrending()
    expect(result.posts[0].id).toBe(300)
    expect(result.posts[0].title).toBe('Minimal Post')
    expect(result.publications[0].id).toBe(400)
    expect(result.publications[0].name).toBe('Minimal Pub')
  })

  it('should pass offset parameter in URL', async () => {
    mockClient.get.mockResolvedValue({
      posts: [],
      publications: [],
      trendingPosts: []
    })

    await service.getTrending({ offset: 50 })
    expect(mockClient.get).toHaveBeenCalledWith('/trending?offset=50')
  })

  it('should pass both limit and offset parameters', async () => {
    mockClient.get.mockResolvedValue({
      posts: [],
      publications: [],
      trendingPosts: []
    })

    await service.getTrending({ limit: 25, offset: 50 })
    expect(mockClient.get).toHaveBeenCalledWith('/trending?limit=25&offset=50')
  })
})
