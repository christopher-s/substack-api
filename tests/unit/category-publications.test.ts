import { DiscoveryService } from '@substack-api/internal/services/discovery-service'
import type { HttpClient } from '@substack-api/internal/http-client'

describe('DiscoveryService - getCategoryPublications', () => {
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

  it('should fetch publications with a numeric category ID', async () => {
    mockClient.get.mockResolvedValue({
      publications: [
        {
          author_id: 123,
          name: 'Test Publication',
          subdomain: 'testpub',
          logo_url: 'https://example.com/logo.png',
          cover_photo_url: undefined,
          created_at: undefined,
          custom_domain: null
        }
      ],
      more: true
    })

    const result = await service.getCategoryPublications(4)
    expect(result.publications).toHaveLength(1)
    expect(result.publications[0]).toEqual({
      author_id: 123,
      name: 'Test Publication',
      subdomain: 'testpub',
      logo_url: 'https://example.com/logo.png',
      cover_photo_url: undefined,
      created_at: undefined,
      custom_domain: null
    })
    expect(result.more).toBe(true)
    expect(mockClient.get).toHaveBeenCalledWith('/category/public/4/posts')
  })

  it('should fetch publications with a string slug', async () => {
    mockClient.get.mockResolvedValue({
      publications: [
        {
          author_id: 456,
          name: 'Tech Blog',
          subdomain: 'techblog',
          logo_url: undefined,
          cover_photo_url: undefined,
          created_at: undefined,
          custom_domain: undefined
        }
      ],
      more: false
    })

    const result = await service.getCategoryPublications('tech')
    expect(result.publications).toHaveLength(1)
    expect(result.publications[0].name).toBe('Tech Blog')
    expect(result.more).toBe(false)
    expect(mockClient.get).toHaveBeenCalledWith('/category/public/tech/posts')
  })

  it('should pass limit and offset query params', async () => {
    mockClient.get.mockResolvedValue({
      publications: [],
      more: false
    })

    await service.getCategoryPublications(4, { limit: 10, offset: 20 })
    expect(mockClient.get).toHaveBeenCalledWith(expect.stringContaining('limit=10'))
    expect(mockClient.get).toHaveBeenCalledWith(expect.stringContaining('offset=20'))
    expect(mockClient.get).toHaveBeenCalledWith(
      expect.stringContaining('/category/public/4/posts?')
    )
  })

  it('should handle empty results', async () => {
    mockClient.get.mockResolvedValue({})

    const result = await service.getCategoryPublications('podcast')
    expect(result.publications).toHaveLength(0)
    expect(result.more).toBe(false)
    expect(mockClient.get).toHaveBeenCalledWith('/category/public/podcast/posts')
  })

  it('should omit query params when no options provided', async () => {
    mockClient.get.mockResolvedValue({
      publications: [],
      more: false
    })

    await service.getCategoryPublications(4)
    expect(mockClient.get).toHaveBeenCalledWith('/category/public/4/posts')
  })

  it('should decode publications with only required fields', async () => {
    mockClient.get.mockResolvedValue({
      publications: [
        {
          author_id: 789,
          name: 'Minimal Pub',
          subdomain: 'minimal',
          logo_url: undefined,
          cover_photo_url: undefined,
          created_at: undefined,
          custom_domain: undefined
        }
      ],
      more: false
    })

    const result = await service.getCategoryPublications(1)
    expect(result.publications).toHaveLength(1)
    expect(result.publications[0].author_id).toBe(789)
    expect(result.publications[0].name).toBe('Minimal Pub')
    expect(result.publications[0].subdomain).toBe('minimal')
  })
})
