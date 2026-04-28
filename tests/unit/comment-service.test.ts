import { CommentService } from '@substack-api/internal/services/comment-service'
import { createMockHttpClient } from '@test/unit/helpers/mock-http-client'
import type { SubstackComment, SubstackCommentResponse } from '@substack-api/internal'

describe('CommentService', () => {
  let commentService: CommentService
  let mockPublicationClient: ReturnType<typeof createMockHttpClient>

  beforeEach(() => {
    jest.clearAllMocks()

    mockPublicationClient = createMockHttpClient('https://test.substack.com')

    commentService = new CommentService(mockPublicationClient, mockPublicationClient)
  })

  describe('getCommentsForPost', () => {
    it('When fetching comments for a post, then returns comments array', async () => {
      // Arrange
      const mockComments: SubstackComment[] = [
        {
          id: 1,
          body: 'Test comment 1',
          author_is_admin: false
        },
        {
          id: 2,
          body: 'Test comment 2',
          author_is_admin: true
        }
      ]

      const mockResponse = { comments: mockComments }
      mockPublicationClient.get.mockResolvedValue(mockResponse)

      // Act
      const result = await commentService.getCommentsForPost(123)

      // Assert
      expect(mockPublicationClient.get).toHaveBeenCalledWith('/post/123/comments')
      expect(result).toEqual({ comments: mockComments, more: false })
    })

    it('When no comments exist, then returns empty array', async () => {
      // Arrange
      const mockResponse = { comments: undefined }
      mockPublicationClient.get.mockResolvedValue(mockResponse)

      // Act
      const result = await commentService.getCommentsForPost(123)

      // Assert
      expect(mockPublicationClient.get).toHaveBeenCalledWith('/post/123/comments')
      expect(result).toEqual({ comments: [], more: false })
    })

    it('When comments field is null, then returns empty array', async () => {
      // Arrange
      const mockResponse = { comments: null }
      mockPublicationClient.get.mockResolvedValue(mockResponse)

      // Act
      const result = await commentService.getCommentsForPost(123)

      // Assert
      expect(mockPublicationClient.get).toHaveBeenCalledWith('/post/123/comments')
      expect(result).toEqual({ comments: [], more: false })
    })

    it('When request fails, then throws error', async () => {
      // Arrange
      const error = new Error('Network error')
      mockPublicationClient.get.mockRejectedValue(error)

      // Act & Assert
      await expect(commentService.getCommentsForPost(123)).rejects.toThrow('Network error')
      expect(mockPublicationClient.get).toHaveBeenCalledWith('/post/123/comments')
    })
  })

  describe('getCommentById', () => {
    it('When fetching a comment by ID, then returns comment data', async () => {
      // Arrange
      const mockCommentResponse: SubstackCommentResponse = {
        item: {
          comment: {
            id: 123,
            body: 'Test comment body',
            user_id: 456,
            name: 'Test Author',
            date: '2023-01-01T00:00:00Z',
            post_id: 789
          }
        }
      }

      mockPublicationClient.get.mockResolvedValue(mockCommentResponse)

      // Act
      const result = await commentService.getCommentById(123)

      // Assert
      expect(mockPublicationClient.get).toHaveBeenCalledWith('/reader/comment/123')
      expect(result).toMatchObject({
        id: 123,
        body: 'Test comment body'
      })
    })

    it('When comment has null post_id, then still returns comment', async () => {
      // Arrange
      const mockCommentResponse: SubstackCommentResponse = {
        item: {
          comment: {
            id: 123,
            body: 'Test comment body',
            user_id: 456,
            name: 'Test Author',
            date: '2023-01-01T00:00:00Z',
            post_id: null
          }
        }
      }

      mockPublicationClient.get.mockResolvedValue(mockCommentResponse)

      // Act
      const result = await commentService.getCommentById(123)

      // Assert
      expect(mockPublicationClient.get).toHaveBeenCalledWith('/reader/comment/123')
      expect(result.id).toBe(123)
      expect(result.body).toBe('Test comment body')
      expect(result.author_is_admin).toBeUndefined()
    })

    it('When comment is not found, then throws error', async () => {
      // Arrange
      const error = new Error('Comment not found')
      mockPublicationClient.get.mockRejectedValue(error)

      // Act & Assert
      await expect(commentService.getCommentById(123)).rejects.toThrow('Comment not found')
      expect(mockPublicationClient.get).toHaveBeenCalledWith('/reader/comment/123')
    })
  })

  describe('getCommentsForPost pagination', () => {
    it('When more comments exist, then returns more flag as true', async () => {
      // Arrange
      const mockComments = [
        {
          id: 1,
          body: 'Comment 1'
        },
        {
          id: 2,
          body: 'Comment 2'
        }
      ]

      mockPublicationClient.get.mockResolvedValue({ comments: mockComments, more: true })

      // Act
      const result = await commentService.getCommentsForPost(123)

      // Assert
      expect(result.comments).toEqual(mockComments)
      expect(result.more).toBe(true)
    })
  })
})
