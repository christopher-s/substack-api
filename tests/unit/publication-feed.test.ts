import { SubstackClient } from '@substack-api/substack-client'
import { HttpClient } from '@substack-api/internal/http-client'
import { CategoryService } from '@substack-api/internal/services'

jest.mock('@substack-api/internal/http-client')
jest.mock('@substack-api/internal/services')

describe('publicationFeed', () => {
  let client: SubstackClient
  let mockCategoryService: jest.Mocked<CategoryService>

  beforeEach(() => {
    jest.clearAllMocks()

    const mockHttpClient = new HttpClient('https://test.com') as jest.Mocked<HttpClient>
    mockHttpClient.get = jest.fn()
    mockHttpClient.post = jest.fn()
    mockHttpClient.put = jest.fn()

    mockCategoryService = new CategoryService(mockHttpClient) as jest.Mocked<CategoryService>
    mockCategoryService.getPublicationFeed = jest.fn()

    client = new SubstackClient({ publicationUrl: 'https://test.substack.com' })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const anyClient = client as any
    anyClient.categoryService = mockCategoryService
  })

  it('should yield publication feed items', async () => {
    mockCategoryService.getPublicationFeed.mockResolvedValueOnce({
      items: [{ type: 'post', entity_key: 'pub-post-1' }],
      nextCursor: null
    })
    const results = []
    for await (const item of client.publicationFeed(42)) {
      results.push(item)
    }
    expect(results).toHaveLength(1)
    expect(results[0].type).toBe('post')
    expect(mockCategoryService.getPublicationFeed).toHaveBeenCalledWith(42, {
      tab: undefined,
      cursor: undefined
    })
  })

  it('should paginate with cursor', async () => {
    mockCategoryService.getPublicationFeed.mockResolvedValueOnce({
      items: [{ type: 'post', entity_key: 'pub-1' }],
      nextCursor: 'page2'
    })
    mockCategoryService.getPublicationFeed.mockResolvedValueOnce({
      items: [{ type: 'note', entity_key: 'pub-2' }],
      nextCursor: null
    })
    const results = []
    for await (const item of client.publicationFeed(99)) {
      results.push(item)
    }
    expect(results).toHaveLength(2)
    expect(mockCategoryService.getPublicationFeed).toHaveBeenCalledTimes(2)
    expect(mockCategoryService.getPublicationFeed).toHaveBeenNthCalledWith(2, 99, {
      tab: undefined,
      cursor: 'page2'
    })
  })

  it('should pass tab option to service', async () => {
    mockCategoryService.getPublicationFeed.mockResolvedValueOnce({
      items: [{ type: 'post', entity_key: 'pub-1' }],
      nextCursor: null
    })
    const results = []
    for await (const item of client.publicationFeed(42, { tab: 'posts' })) {
      results.push(item)
    }
    expect(results).toHaveLength(1)
    expect(mockCategoryService.getPublicationFeed).toHaveBeenCalledWith(42, {
      tab: 'posts',
      cursor: undefined
    })
  })

  it('should respect limit option', async () => {
    mockCategoryService.getPublicationFeed.mockResolvedValueOnce({
      items: [
        { type: 'post', entity_key: 'pub-1' },
        { type: 'post', entity_key: 'pub-2' },
        { type: 'post', entity_key: 'pub-3' }
      ],
      nextCursor: null
    })
    const results = []
    for await (const item of client.publicationFeed(42, { limit: 2 })) {
      results.push(item)
    }
    expect(results).toHaveLength(2)
  })
})
