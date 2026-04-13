import { SearchService } from '@substack-api/internal/services/search-service'
import type { HttpClient } from '@substack-api/internal/http-client'

describe('SearchService - exploreSearch', () => {
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

  it('should fetch explore search with default tab', async () => {
    mockClient.get.mockResolvedValue({ items: [], nextCursor: null })
    const result = await service.exploreSearch()
    expect(mockClient.get).toHaveBeenCalledWith(expect.stringContaining('tab=explore'))
    expect(mockClient.get).toHaveBeenCalledWith(expect.stringContaining('type=base'))
    expect(mockClient.get).toHaveBeenCalledWith(expect.stringContaining('/search/explore/web'))
    expect(result.items).toHaveLength(0)
    expect(result.nextCursor).toBeNull()
  })

  it('should use different tab values', async () => {
    mockClient.get.mockResolvedValue({ items: [], nextCursor: null })

    await service.exploreSearch({ tab: 'notes' })
    expect(mockClient.get).toHaveBeenCalledWith(expect.stringContaining('tab=notes'))

    mockClient.get.mockClear()
    await service.exploreSearch({ tab: 'top' })
    expect(mockClient.get).toHaveBeenCalledWith(expect.stringContaining('tab=top'))

    mockClient.get.mockClear()
    await service.exploreSearch({ tab: 'for-you' })
    expect(mockClient.get).toHaveBeenCalledWith(expect.stringContaining('tab=for-you'))
  })

  it('should pass cursor for pagination', async () => {
    mockClient.get.mockResolvedValue({
      items: [{ type: 'post' }],
      nextCursor: 'next-page-cursor'
    })
    const result = await service.exploreSearch({ cursor: 'abc123' })
    expect(mockClient.get).toHaveBeenCalledWith(expect.stringContaining('cursor=abc123'))
    expect(result.items).toHaveLength(1)
    expect(result.nextCursor).toBe('next-page-cursor')
  })

  it('should handle empty response', async () => {
    mockClient.get.mockResolvedValue({})
    const result = await service.exploreSearch({ tab: 'explore' })
    expect(result.items).toHaveLength(0)
    expect(result.nextCursor).toBeNull()
  })

  it('should not include query parameter (unlike regular search)', async () => {
    mockClient.get.mockResolvedValue({ items: [], nextCursor: null })
    await service.exploreSearch()
    const calledUrl = mockClient.get.mock.calls[0][0] as string
    expect(calledUrl).not.toContain('query=')
  })

  it('should return items with correct shape', async () => {
    const items = [
      { type: 'post', entity_key: 'post-1', title: 'Test Post' },
      { type: 'note', entity_key: 'note-1', body: 'Test note' }
    ]
    mockClient.get.mockResolvedValue({ items, nextCursor: 'more' })
    const result = await service.exploreSearch({ tab: 'notes' })
    expect(result.items).toEqual(items)
    expect(result.nextCursor).toBe('more')
  })
})
