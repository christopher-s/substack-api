import { PublicationService } from '@substack-api/internal/services/publication-service'
import type { HttpClient } from '@substack-api/internal/http-client'

describe('PublicationService branches', () => {
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

  it('getArchive should use new sort and defaults when no options', async () => {
    mockClient.get.mockResolvedValue([])
    await service.getArchive()
    const url = mockClient.get.mock.calls[0][0] as string
    expect(url).toContain('sort=new')
    expect(url).toContain('offset=0')
    expect(url).toContain('limit=25')
  })

  it('getArchive should use search option', async () => {
    mockClient.get.mockResolvedValue([])
    await service.getArchive({ search: 'AI' })
    const url = mockClient.get.mock.calls[0][0] as string
    expect(url).toContain('search=AI')
  })

  it('getHomepageData should handle missing newPosts', async () => {
    mockClient.get.mockResolvedValue({ newPosts: undefined })
    const result = await service.getHomepageData()
    expect(result.newPosts).toHaveLength(0)
  })

  it('getHomepageData should handle null newPosts', async () => {
    mockClient.get.mockResolvedValue({})
    const result = await service.getHomepageData()
    expect(result.newPosts).toHaveLength(0)
  })

  it('getPostFacepile should decode reactors', async () => {
    mockClient.get.mockResolvedValue({
      reactors: [
        { id: 1, name: 'Alice', photo_url: 'https://img.com/a.jpg' },
        { id: 2, name: 'Bob', photo_url: 'https://img.com/b.jpg' }
      ]
    })
    const result = (await service.getPostFacepile(99)) as { reactors: Array<{ id: number }> }
    expect(result.reactors).toHaveLength(2)
    expect(result.reactors[0].id).toBe(1)
  })
})
