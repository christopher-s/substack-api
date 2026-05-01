/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommentClient } from '@substack-api/sub-clients/comment-client'
import type { CommentService } from '@substack-api/internal/services'
import type { EntityDeps } from '@substack-api/domain/entity-deps'

describe('CommentClient', () => {
  let commentService: jest.Mocked<CommentService>
  let buildEntityDeps: jest.Mock<EntityDeps>
  let client: CommentClient

  beforeEach(() => {
    jest.clearAllMocks()

    commentService = {
      getCommentById: jest.fn(),
      getReplies: jest.fn(),
      createComment: jest.fn(),
      deleteComment: jest.fn(),
      likeComment: jest.fn(),
      unlikeComment: jest.fn()
    } as unknown as jest.Mocked<CommentService>

    buildEntityDeps = jest.fn().mockReturnValue({
      publicationClient: {},
      profileService: {},
      postService: {},
      noteService: {},
      commentService: {},
      followingService: {},
      perPage: 20
    } as EntityDeps)

    client = new CommentClient(commentService, buildEntityDeps)
  })

  describe('commentForId', () => {
    it('When calling commentForId, then delegates to commentService and builds Comment entity', async () => {
      const mockCommentData = {
        id: 42,
        body: 'Great post!',
        user_id: 1,
        name: 'Alice',
        photo_url: 'https://example.com/photo.jpg',
        date: '2024-01-15T10:00:00Z',
        reaction_count: 5,
        reactions: { '❤': 5 },
        restacks: 2,
        children_count: 3,
        author_is_admin: false
      }
      commentService.getCommentById.mockResolvedValueOnce(mockCommentData as any)

      const result = await client.commentForId(42)

      expect(result.id).toBe(42)
      expect(result.body).toBe('Great post!')
      expect(result.userId).toBe(1)
      expect(result.name).toBe('Alice')
      expect(result.photoUrl).toBe('https://example.com/photo.jpg')
      expect(result.date).toBe('2024-01-15T10:00:00Z')
      expect(result.reactionCount).toBe(5)
      expect(result.reactions).toEqual({ '❤': 5 })
      expect(result.restacks).toBe(2)
      expect(result.childrenCount).toBe(3)
      expect(result.isAdmin).toBe(false)
      expect(commentService.getCommentById).toHaveBeenCalledWith(42)
      expect(buildEntityDeps).toHaveBeenCalledTimes(1)
    })

    it('When commentService.getCommentById fails, then error propagates', async () => {
      commentService.getCommentById.mockRejectedValueOnce(new Error('Comment not found'))

      await expect(client.commentForId(999)).rejects.toThrow('Comment not found')
    })
  })

  describe('commentReplies', () => {
    it('When calling commentReplies with cursor, then delegates with options', async () => {
      const mockResponse = {
        commentBranches: [{ id: 1, body: 'Reply 1' }],
        nextCursor: 'next-page'
      }
      commentService.getReplies.mockResolvedValueOnce(mockResponse as any)

      const result = await client.commentReplies(42, { cursor: 'some-cursor' })

      expect(result).toEqual(mockResponse)
      expect(commentService.getReplies).toHaveBeenCalledWith(42, { cursor: 'some-cursor' })
    })

    it('When calling commentReplies without options, then delegates with undefined options', async () => {
      const mockResponse = {
        commentBranches: [],
        nextCursor: null
      }
      commentService.getReplies.mockResolvedValueOnce(mockResponse as any)

      const result = await client.commentReplies(42)

      expect(result).toEqual(mockResponse)
      expect(commentService.getReplies).toHaveBeenCalledWith(42, undefined)
    })

    it('When getReplies fails, then error propagates', async () => {
      commentService.getReplies.mockRejectedValueOnce(new Error('Replies error'))

      await expect(client.commentReplies(42)).rejects.toThrow('Replies error')
    })
  })

  describe('commentRepliesFeed', () => {
    it('When iterating commentRepliesFeed with single page, then yields all branches', async () => {
      const response = {
        commentBranches: [
          { id: 1, body: 'Reply 1' },
          { id: 2, body: 'Reply 2' }
        ],
        nextCursor: null
      }
      commentService.getReplies.mockResolvedValueOnce(response as any)

      const results: any[] = []
      for await (const page of client.commentRepliesFeed(42)) {
        results.push(page)
      }

      expect(results).toHaveLength(1)
      expect(results[0].commentBranches).toHaveLength(2)
      expect(commentService.getReplies).toHaveBeenCalledWith(42, { cursor: undefined })
    })

    it('When iterating commentRepliesFeed with multiple pages, then paginates using nextCursor', async () => {
      const page1 = {
        commentBranches: [{ id: 1, body: 'Reply 1' }],
        nextCursor: 'page2'
      }
      const page2 = {
        commentBranches: [{ id: 2, body: 'Reply 2' }],
        nextCursor: null
      }
      commentService.getReplies
        .mockResolvedValueOnce(page1 as any)
        .mockResolvedValueOnce(page2 as any)

      const results: any[] = []
      for await (const page of client.commentRepliesFeed(42)) {
        results.push(page)
      }

      expect(results).toHaveLength(2)
      expect(commentService.getReplies).toHaveBeenCalledTimes(2)
      expect(commentService.getReplies).toHaveBeenNthCalledWith(1, 42, { cursor: undefined })
      expect(commentService.getReplies).toHaveBeenNthCalledWith(2, 42, { cursor: 'page2' })
    })

    it('When limit is set and branches exceed remaining, then truncates last page', async () => {
      const page1 = {
        commentBranches: [{ id: 1 }, { id: 2 }, { id: 3 }],
        nextCursor: 'page2'
      }
      const page2 = {
        commentBranches: [{ id: 4 }, { id: 5 }, { id: 6 }],
        nextCursor: 'page3'
      }
      commentService.getReplies
        .mockResolvedValueOnce(page1 as any)
        .mockResolvedValueOnce(page2 as any)

      const results: any[] = []
      for await (const page of client.commentRepliesFeed(42, { limit: 5 })) {
        results.push(page)
      }

      expect(results).toHaveLength(2)
      expect(results[0].commentBranches).toHaveLength(3)
      expect(results[1].commentBranches).toHaveLength(2) // truncated from 3 to 2
    })

    it('When limit equals total branches, then yields all without truncation', async () => {
      const page1 = {
        commentBranches: [{ id: 1 }, { id: 2 }],
        nextCursor: null
      }
      commentService.getReplies.mockResolvedValueOnce(page1 as any)

      const results: any[] = []
      for await (const page of client.commentRepliesFeed(42, { limit: 2 })) {
        results.push(page)
      }

      expect(results).toHaveLength(1)
      expect(results[0].commentBranches).toHaveLength(2)
    })

    it('When response has no commentBranches, then yields response as-is', async () => {
      const response = { nextCursor: null }
      commentService.getReplies.mockResolvedValueOnce(response as any)

      const results: any[] = []
      for await (const page of client.commentRepliesFeed(42)) {
        results.push(page)
      }

      expect(results).toHaveLength(1)
      // The client passes response through; branches are undefined on the raw response
      expect(results[0].commentBranches).toBeUndefined()
    })

    it('When iterating with default options, then uses empty object', async () => {
      const response = {
        commentBranches: [{ id: 1 }],
        nextCursor: null
      }
      commentService.getReplies.mockResolvedValueOnce(response as any)

      const results: any[] = []
      for await (const page of client.commentRepliesFeed(42)) {
        results.push(page)
      }

      expect(results).toHaveLength(1)
    })
  })

  describe('createComment', () => {
    it('When calling createComment with postId and body, then delegates to commentService', async () => {
      const mockResponse = { id: 100, body: 'New comment', user_id: 1 }
      commentService.createComment.mockResolvedValueOnce(mockResponse as any)

      const result = await client.createComment(42, 'New comment')

      expect(result).toEqual(mockResponse)
      expect(commentService.createComment).toHaveBeenCalledWith(42, 'New comment')
    })

    it('When createComment fails, then error propagates', async () => {
      commentService.createComment.mockRejectedValueOnce(new Error('Create failed'))

      await expect(client.createComment(42, 'test')).rejects.toThrow('Create failed')
    })
  })

  describe('deleteComment', () => {
    it('When calling deleteComment with commentId, then delegates to commentService', async () => {
      const mockResponse = { ok: true }
      commentService.deleteComment.mockResolvedValueOnce(mockResponse as any)

      const result = await client.deleteComment(100)

      expect(result).toEqual(mockResponse)
      expect(commentService.deleteComment).toHaveBeenCalledWith(100)
    })

    it('When deleteComment fails, then error propagates', async () => {
      commentService.deleteComment.mockRejectedValueOnce(new Error('Delete failed'))

      await expect(client.deleteComment(100)).rejects.toThrow('Delete failed')
    })
  })

  describe('likeComment', () => {
    it('When calling likeComment, then delegates to commentService.likeComment', async () => {
      commentService.likeComment.mockResolvedValueOnce(undefined)

      await client.likeComment(100)

      expect(commentService.likeComment).toHaveBeenCalledWith(100)
    })

    it('When likeComment fails, then error propagates', async () => {
      commentService.likeComment.mockRejectedValueOnce(new Error('Like failed'))

      await expect(client.likeComment(100)).rejects.toThrow('Like failed')
    })
  })

  describe('unlikeComment', () => {
    it('When calling unlikeComment, then delegates to commentService.unlikeComment', async () => {
      commentService.unlikeComment.mockResolvedValueOnce(undefined)

      await client.unlikeComment(100)

      expect(commentService.unlikeComment).toHaveBeenCalledWith(100)
    })

    it('When unlikeComment fails, then error propagates', async () => {
      commentService.unlikeComment.mockRejectedValueOnce(new Error('Unlike failed'))

      await expect(client.unlikeComment(100)).rejects.toThrow('Unlike failed')
    })
  })
})
