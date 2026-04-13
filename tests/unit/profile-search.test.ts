import { SearchService } from '@substack-api/internal/services/search-service'
import { HttpClient } from '@substack-api/internal/http-client'

describe('SearchService - searchProfiles', () => {
  let mockClient: jest.Mocked<HttpClient>
  let service: SearchService

  beforeEach(() => {
    jest.clearAllMocks()
    mockClient = new HttpClient('https://substack.com') as jest.Mocked<HttpClient>
    mockClient.get = jest.fn()
    service = new SearchService(mockClient)
  })

  it('should fetch profile search results', async () => {
    mockClient.get.mockResolvedValue({
      results: [
        {
          id: 1,
          name: 'Test User',
          handle: 'testuser',
          bio: 'A tester',
          photo_url: 'https://example.com/photo.jpg',
          followerCount: 100,
          subscriberCount: 50,
          hasPosts: true
        }
      ],
      more: true
    })

    const result = await service.searchProfiles('test')
    expect(result.results).toHaveLength(1)
    expect(result.results[0].name).toBe('Test User')
    expect(result.results[0].handle).toBe('testuser')
    expect(result.more).toBe(true)
    expect(mockClient.get).toHaveBeenCalledWith('/profile/search?query=test')
  })

  it('should pass page parameter', async () => {
    mockClient.get.mockResolvedValue({ results: [], more: false })

    await service.searchProfiles('python', { page: 2 })
    expect(mockClient.get).toHaveBeenCalledWith('/profile/search?query=python&page=2')
  })

  it('should handle empty results', async () => {
    mockClient.get.mockResolvedValue({ results: [], more: false })

    const result = await service.searchProfiles('nonexistent')
    expect(result.results).toHaveLength(0)
    expect(result.more).toBe(false)
  })

  it('should decode result with only required fields', async () => {
    mockClient.get.mockResolvedValue({
      results: [{ id: 42, name: 'Min', handle: 'min' }],
      more: false
    })

    const result = await service.searchProfiles('min')
    expect(result.results[0].id).toBe(42)
    expect(result.results[0].name).toBe('Min')
    expect(result.results[0].bio).toBeUndefined()
  })
})
