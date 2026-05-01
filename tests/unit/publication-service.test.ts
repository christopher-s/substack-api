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

  describe('getPublicationExport', () => {
    it('should fetch publication export list', async () => {
      mockClient.get.mockResolvedValue([
        {
          id: 1,
          status: 'completed',
          created_at: '2026-01-01T00:00:00Z',
          export_url: 'https://example.com/export.csv'
        }
      ])

      const result = await service.getPublicationExport()
      expect(mockClient.get).toHaveBeenCalledWith('/publication_export')
      expect(result).toHaveLength(1)
      expect(result[0].status).toBe('completed')
    })
  })

  describe('searchPublications', () => {
    it('should search with query string', async () => {
      mockClient.get.mockResolvedValue({
        results: [
          {
            id: 1,
            name: 'Test Pub',
            subdomain: 'test-pub',
            logo_url: 'https://example.com/logo.png'
          }
        ]
      })

      const result = await service.searchPublications('test query')
      expect(mockClient.get).toHaveBeenCalledWith(
        expect.stringContaining('/publication/search?query=test+query')
      )
      expect(result.results).toHaveLength(1)
    })

    it('should include limit when provided', async () => {
      mockClient.get.mockResolvedValue({ results: [] })

      await service.searchPublications('test', { limit: 5 })
      const url = mockClient.get.mock.calls[0][0] as string
      expect(url).toContain('limit=5')
    })
  })

  describe('getLiveStreams', () => {
    it('should use default status=scheduled when no status given', async () => {
      mockClient.get.mockResolvedValue({ live_streams: [] })

      await service.getLiveStreams()
      expect(mockClient.get).toHaveBeenCalledWith('/live_streams?status=scheduled')
    })

    it('should pass custom status', async () => {
      mockClient.get.mockResolvedValue({ live_streams: [] })

      await service.getLiveStreams('live')
      expect(mockClient.get).toHaveBeenCalledWith('/live_streams?status=live')
    })
  })

  describe('getEligibleHosts', () => {
    it('should fetch eligible hosts for a publication', async () => {
      mockClient.get.mockResolvedValue({
        hosts: [{ id: 1, name: 'Host User' }]
      })

      const result = await service.getEligibleHosts(42)
      expect(mockClient.get).toHaveBeenCalledWith('/live_stream/eligible_hosts?publication_id=42')
      expect(result).toBeDefined()
    })
  })

  describe('getArchive', () => {
    it('should omit sort param when sort=new (default)', async () => {
      mockClient.get.mockResolvedValue([])

      await service.getArchive({ sort: 'new' })
      const url = mockClient.get.mock.calls[0][0] as string
      expect(url).not.toContain('sort=')
    })

    it('should not include offset=0 or limit=25 (defaults)', async () => {
      mockClient.get.mockResolvedValue([])

      await service.getArchive({ offset: 0, limit: 25 })
      const url = mockClient.get.mock.calls[0][0] as string
      expect(url).not.toContain('offset=0')
      expect(url).not.toContain('limit=25')
    })
  })
})
