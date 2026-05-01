import { FeedService } from '@substack-api/internal/services/feed-service'
import type { HttpClient } from '@substack-api/internal/http-client'

describe('FeedService - getTrending', () => {
  let mockClient: jest.Mocked<HttpClient>
  let service: FeedService

  beforeEach(() => {
    mockClient = {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn()
    } as unknown as jest.Mocked<HttpClient>
    service = new FeedService(mockClient)
  })

  it('should fetch and decode trending response from inbox/top', async () => {
    mockClient.get.mockResolvedValue({
      inboxItems: [
        {
          post_id: 100,
          type: 'newsletter',
          title: 'Trending Post',
          web_url: 'https://test.substack.com/p/trending-post',
          content_date: '2025-01-01T00:00:00Z',
          audience: 'everyone',
          subtitle: 'Subtitle',
          like_count: 7582,
          comment_count: 45,
          published_bylines: [
            { id: 1, name: 'Author', handle: 'author', photo_url: 'https://example.com/photo.jpg' }
          ]
        }
      ]
    })

    const result = await service.getTrending()
    expect(result.posts).toHaveLength(1)
    expect(result.posts[0].id).toBe(100)
    expect(result.posts[0].title).toBe('Trending Post')
    expect(result.publications).toHaveLength(0)
    expect(result.trendingPosts).toHaveLength(0)
    expect(mockClient.get).toHaveBeenCalledWith('/inbox/top')
  })

  it('should pass limit parameter in URL', async () => {
    mockClient.get.mockResolvedValue({ inboxItems: [] })

    await service.getTrending({ limit: 25 })
    expect(mockClient.get).toHaveBeenCalledWith('/inbox/top?limit=25')
  })

  it('When empty results', async () => {
    mockClient.get.mockResolvedValue({ inboxItems: [] })

    const result = await service.getTrending()
    expect(result.posts).toHaveLength(0)
    expect(result.publications).toHaveLength(0)
    expect(result.trendingPosts).toHaveLength(0)
  })

  it('should omit query params when no options provided', async () => {
    mockClient.get.mockResolvedValue({ inboxItems: [] })

    await service.getTrending()
    expect(mockClient.get).toHaveBeenCalledWith('/inbox/top')
  })

  it('should decode posts with only required fields', async () => {
    mockClient.get.mockResolvedValue({
      inboxItems: [
        {
          post_id: 300,
          type: 'newsletter',
          title: 'Minimal Post',
          web_url: 'https://test.substack.com/p/minimal-post',
          content_date: '2025-06-01T00:00:00Z'
        }
      ]
    })

    const result = await service.getTrending()
    expect(result.posts[0].id).toBe(300)
    expect(result.posts[0].title).toBe('Minimal Post')
  })

  it('should pass offset parameter in URL', async () => {
    mockClient.get.mockResolvedValue({ inboxItems: [] })

    await service.getTrending({ offset: 50 })
    expect(mockClient.get).toHaveBeenCalledWith('/inbox/top?offset=50')
  })

  it('should pass both limit and offset parameters', async () => {
    mockClient.get.mockResolvedValue({ inboxItems: [] })

    await service.getTrending({ limit: 25, offset: 50 })
    expect(mockClient.get).toHaveBeenCalledWith('/inbox/top?limit=25&offset=50')
  })
})
