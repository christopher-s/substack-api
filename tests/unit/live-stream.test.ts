import { PublicationService } from '@substack-api/internal/services/publication-service'
import type { HttpClient } from '@substack-api/internal/http-client'

describe('PublicationService - getActiveLiveStream', () => {
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

  it('should fetch an active live stream', async () => {
    mockClient.get.mockResolvedValue({
      activeLiveStream: {
        id: 123,
        title: 'Live Q&A Session'
      }
    })

    const result = await service.getActiveLiveStream(456)
    expect(mockClient.get).toHaveBeenCalledWith('/live_streams/active/pub/456')
    expect(result.activeLiveStream).not.toBeNull()
    expect(result.activeLiveStream!.id).toBe(123)
    expect(result.activeLiveStream!.title).toBe('Live Q&A Session')
  })

  it('should handle null response when no stream is active', async () => {
    mockClient.get.mockResolvedValue({
      activeLiveStream: null
    })

    const result = await service.getActiveLiveStream(789)
    expect(mockClient.get).toHaveBeenCalledWith('/live_streams/active/pub/789')
    expect(result.activeLiveStream).toBeNull()
  })
})
