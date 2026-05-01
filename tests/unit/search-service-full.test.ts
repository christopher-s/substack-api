import { SearchService } from '@substack-api/internal/services/search-service'
import type { HttpClient } from '@substack-api/internal/http-client'

describe('SearchService branches', () => {
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

  it('When null nextCursor', async () => {
    mockClient.get.mockResolvedValue({ items: [] })
    const result = await service.search('test')
    expect(result.nextCursor).toBeNull()
  })

  it('When explicit null nextCursor', async () => {
    mockClient.get.mockResolvedValue({ items: [], nextCursor: null })
    const result = await service.search('test')
    expect(result.nextCursor).toBeNull()
  })

  it('When empty items', async () => {
    mockClient.get.mockResolvedValue({ items: undefined })
    const result = await service.search('test')
    expect(result.items).toHaveLength(0)
  })
})
