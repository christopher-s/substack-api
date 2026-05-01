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

  describe('createComment', () => {
    it('When creating a comment, then posts to the correct endpoint', async () => {
      mockPublicationClient.post.mockResolvedValue({ id: 1, body: 'New comment' })

      const result = await commentService.createComment(123, 'Great post!')

      expect(mockPublicationClient.post).toHaveBeenCalledWith('/post/123/comment', {
        body: 'Great post!',
        post_id: 123
      })
      expect(result).toEqual({ id: 1, body: 'New comment' })
    })

    it('When body is empty, then throws error', async () => {
      await expect(commentService.createComment(123, '')).rejects.toThrow(
        'Comment body cannot be empty'
      )
    })

    it('When body is whitespace, then throws error', async () => {
      await expect(commentService.createComment(123, '   ')).rejects.toThrow(
        'Comment body cannot be empty'
      )
    })

    it('When body exceeds maximum length, then throws error', async () => {
      const longBody = 'x'.repeat(10001)
      await expect(commentService.createComment(123, longBody)).rejects.toThrow(
        'Comment body exceeds maximum length of 10000 characters'
      )
    })
  })

  describe('deleteComment', () => {
    it('When deleting a comment, then sends delete request', async () => {
      mockPublicationClient.delete.mockResolvedValue({ deleted: true })

      const result = await commentService.deleteComment(99)

      expect(mockPublicationClient.delete).toHaveBeenCalledWith('/comment/99')
      expect(result).toEqual({ deleted: true })
    })
  })

  describe('likeComment', () => {
    it('When liking a comment, then posts to the correct endpoint', async () => {
      mockPublicationClient.post.mockResolvedValueOnce(undefined)

      await commentService.likeComment(123)

      expect(mockPublicationClient.post).toHaveBeenCalledWith('/feed/comments/123/like')
    })
  })

  describe('unlikeComment', () => {
    it('When unliking a comment, then posts to the correct endpoint', async () => {
      mockPublicationClient.post.mockResolvedValueOnce(undefined)

      await commentService.unlikeComment(456)

      expect(mockPublicationClient.post).toHaveBeenCalledWith('/feed/comments/456/unlike')
    })
  })
})
