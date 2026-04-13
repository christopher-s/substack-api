import { SearchService } from '@substack-api/internal/services/search-service'
import type { HttpClient } from '@substack-api/internal/http-client'

describe('SearchService', () => {
  let mockClient: jest.Mocked<HttpClient>
  let service: SearchService

  beforeEach(() => {
    mockClient = {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn()
    } as unknown as jest.Mocked<HttpClient>
    service = new SearchService(mockClient)
  })

  it('should search with query', async () => {
    mockClient.get.mockResolvedValue({ items: [], nextCursor: null })
    const result = await service.search('technology')
    expect(mockClient.get).toHaveBeenCalledWith(expect.stringContaining('query=technology'))
    expect(result.items).toHaveLength(0)
  })

  it('should pass cursor for pagination', async () => {
    mockClient.get.mockResolvedValue({ items: [{ type: 'post' }], nextCursor: 'next' })
    const result = await service.search('test', { cursor: 'abc' })
    expect(mockClient.get).toHaveBeenCalledWith(expect.stringContaining('cursor=abc'))
    expect(result.items).toHaveLength(1)
    expect(result.nextCursor).toBe('next')
  })
})
