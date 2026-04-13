import { PublicationService } from '@substack-api/internal/services/publication-service'
import type { HttpClient } from '@substack-api/internal/http-client'

describe('PublicationService - markPostSeen', () => {
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

  it('should mark a post as seen using POST', async () => {
    mockClient.post.mockResolvedValue({})

    await service.markPostSeen(42)
    expect(mockClient.post).toHaveBeenCalledWith('/posts/42/seen')
    expect(mockClient.post).toHaveBeenCalledTimes(1)
  })

  it('should not throw on successful call', async () => {
    mockClient.post.mockResolvedValue({})

    await expect(service.markPostSeen(99)).resolves.toBeUndefined()
  })
})
