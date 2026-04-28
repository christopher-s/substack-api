import { CommentService } from '@substack-api/internal/services/comment-service'
import { HttpClient } from '@substack-api/internal/http-client'

describe('CommentService - getReplies', () => {
  let mockPublicationClient: jest.Mocked<HttpClient>
  let mockSubstackClient: jest.Mocked<HttpClient>
  let service: CommentService

  beforeEach(() => {
    jest.clearAllMocks()
    mockPublicationClient = new HttpClient('https://test.com') as jest.Mocked<HttpClient>
    mockPublicationClient.get = jest.fn()
    mockSubstackClient = new HttpClient('https://substack.com') as jest.Mocked<HttpClient>
    mockSubstackClient.get = jest.fn()
    service = new CommentService(mockPublicationClient, mockSubstackClient)
  })

  it('should fetch threaded replies for a comment', async () => {
    mockSubstackClient.get.mockResolvedValue({
      commentBranches: [
        {
          comment: {
            id: 234074868,
            body: 'Great point!',
            date: '2025-01-15T10:00:00Z',
            name: 'Test User',
            photo_url: 'https://example.com/photo.jpg',
            children_count: 2,
            reaction_count: 5
          },
          descendantComments: [
            {
              type: 'comment',
              comment: {
                id: 234075000,
                body: 'Thanks!',
                date: '2025-01-15T11:00:00Z'
              }
            }
          ]
        }
      ],
      moreBranches: 50,
      nextCursor: 'abc123'
    })

    const result = await service.getReplies(233934688)
    expect(result.commentBranches).toHaveLength(1)
    expect(result.commentBranches[0].comment.id).toBe(234074868)
    expect(result.commentBranches[0].comment.children_count).toBe(2)
    expect(result.commentBranches[0].descendantComments).toHaveLength(1)
    expect(result.moreBranches).toBe(50)
    expect(result.nextCursor).toBe('abc123')
    expect(mockSubstackClient.get).toHaveBeenCalledWith('/reader/comment/233934688/replies')
  })

  it('should pass cursor for pagination', async () => {
    mockSubstackClient.get.mockResolvedValue({
      commentBranches: [],
      moreBranches: 0,
      nextCursor: null
    })

    await service.getReplies(123, { cursor: 'page2token' })
    expect(mockSubstackClient.get).toHaveBeenCalledWith(
      '/reader/comment/123/replies?cursor=page2token'
    )
  })

  it('When empty replies', async () => {
    mockSubstackClient.get.mockResolvedValue({
      commentBranches: [],
      moreBranches: 0,
      nextCursor: null
    })

    const result = await service.getReplies(999)
    expect(result.commentBranches).toHaveLength(0)
    expect(result.moreBranches).toBe(0)
    expect(result.nextCursor).toBeNull()
  })

  it('should decode reply with only required fields', async () => {
    mockSubstackClient.get.mockResolvedValue({
      commentBranches: [
        {
          comment: { id: 1, body: 'Minimal', date: '2025-01-01T00:00:00Z' },
          descendantComments: []
        }
      ],
      moreBranches: 0,
      nextCursor: null
    })

    const result = await service.getReplies(1)
    expect(result.commentBranches[0].comment.id).toBe(1)
    expect(result.commentBranches[0].comment.body).toBe('Minimal')
  })
})
