import { PublicationService } from '@substack-api/internal/services/publication-service'
import type { HttpClient } from '@substack-api/internal/http-client'

describe('PublicationService', () => {
  let mockClient: jest.Mocked<HttpClient>
  let service: PublicationService

  beforeEach(() => {
    mockClient = {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn()
    } as unknown as jest.Mocked<HttpClient>
    service = new PublicationService(mockClient)
  })

  describe('getHomepageData', () => {
    it('should fetch homepage posts', async () => {
      mockClient.get.mockResolvedValue({
        newPosts: [
          {
            id: 1,
            title: 'Test',
            slug: 'test',
            post_date: '2026-01-01T00:00:00Z',
            canonical_url: 'https://example.com/p/test'
          }
        ]
      })

      const result = await service.getHomepageData()
      expect(result.newPosts).toHaveLength(1)
      expect(mockClient.get).toHaveBeenCalledWith('/homepage_data')
    })

    it('When empty homepage', async () => {
      mockClient.get.mockResolvedValue({})
      const result = await service.getHomepageData()
      expect(result.newPosts).toHaveLength(0)
    })
  })

  describe('getArchive', () => {
    it('should fetch archive with defaults', async () => {
      mockClient.get.mockResolvedValue([
        {
          id: 1,
          title: 'Archive Post',
          slug: 'archive-post',
          post_date: '2026-01-01T00:00:00Z',
          canonical_url: 'https://example.com/p/archive-post'
        }
      ])

      const result = await service.getArchive()
      expect(result).toHaveLength(1)
      expect(mockClient.get).toHaveBeenCalledWith(expect.stringContaining('/archive?'))
    })

    it('should pass sort and pagination options', async () => {
      mockClient.get.mockResolvedValue([])
      await service.getArchive({ sort: 'top', offset: 10, limit: 5 })
      const url = mockClient.get.mock.calls[0][0] as string
      expect(url).toContain('sort=top')
      expect(url).toContain('offset=10')
      expect(url).toContain('limit=5')
    })
  })

  describe('getPostFacepile', () => {
    it('should fetch facepile for a post', async () => {
      mockClient.get.mockResolvedValue({
        reactors: [{ id: 1, name: 'User', photo_url: 'https://img.com/u.jpg' }]
      })

      const result = await service.getPostFacepile(42)
      expect(mockClient.get).toHaveBeenCalledWith('/post/42/facepile')
      expect(result).toBeDefined()
    })
  })
})
