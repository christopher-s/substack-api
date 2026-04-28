import { FullPost, PreviewPost } from '@substack-api/domain/post'
import { Comment } from '@substack-api/domain/comment'
import { createMockEntityDeps } from '@test/unit/helpers/mock-services'

describe('PreviewPost Entity - Comments', () => {
  let deps: ReturnType<typeof createMockEntityDeps>
  let post: PreviewPost

  beforeEach(() => {
    deps = createMockEntityDeps()

    const mockPostData = {
      id: 456,
      title: 'Test Post',
      slug: 'test-post',
      post_date: '2023-01-01T00:00:00Z',
      canonical_url: 'https://example.com/post',
      type: 'newsletter' as const,
      subtitle: 'Test subtitle',
      description: 'Test description',
      publishedAt: '2023-01-01T00:00:00Z',
      audience: 'everyone' as const,
      write_comment_permissions: 'everyone' as const,
      should_send_email: true,
      draft: false,
      likes: 10,
      comments: 5,
      restacks: 2,
      cover_image: 'https://example.com/cover.jpg',
      podcast_url: '',
      videoUpload: null,
      podcastUpload: null,
      postTags: [],
      pin_comment: false,
      free_unlock: false,
      default_comment_sort: 'best_first' as const,
      reactions: {
        '❤️': 5,
        '👍': 3,
        '👎': 1
      },
      section_id: null,
      hasCashtag: false,
      body: 'Test post content',
      voiceover_id: null,
      theme: { background_pop: 'blue' }
    }

    post = new PreviewPost(mockPostData, deps)
  })

  describe('comments()', () => {
    it('When iterating comments, then returns Comment entities', async () => {
      const mockComments = [
        {
          id: 1,
          body: 'Comment 1',
          date: '2023-01-01T00:00:00Z',
          post_id: 456,
          user_id: 123,
          name: 'User 1'
        },
        {
          id: 2,
          body: 'Comment 2',
          date: '2023-01-02T00:00:00Z',
          post_id: 456,
          user_id: 124,
          name: 'User 2'
        }
      ]
      deps.commentService.getCommentsForPost.mockResolvedValue({
        comments: mockComments,
        more: false
      })

      const comments = []
      for await (const comment of post.comments({ limit: 2 })) {
        comments.push(comment)
      }

      expect(comments).toHaveLength(2)
      expect(comments[0]).toBeInstanceOf(Comment)
      expect(comments[0].body).toBe('Comment 1')
      expect(comments[1].body).toBe('Comment 2')
      expect(deps.commentService.getCommentsForPost).toHaveBeenCalledWith(456)
    })

    it('When limit is provided, then respects the limit', async () => {
      const mockComments = [
        {
          id: 1,
          body: 'Comment 1',
          date: '2023-01-01T00:00:00Z',
          post_id: 456,
          user_id: 123,
          name: 'User 1'
        },
        {
          id: 2,
          body: 'Comment 2',
          date: '2023-01-02T00:00:00Z',
          post_id: 456,
          user_id: 124,
          name: 'User 2'
        }
      ]
      deps.commentService.getCommentsForPost.mockResolvedValue({
        comments: mockComments,
        more: false
      })

      const comments = []
      for await (const comment of post.comments({ limit: 1 })) {
        comments.push(comment)
      }

      expect(comments).toHaveLength(1)
      expect(comments[0].body).toBe('Comment 1')
    })

    it('When comments response is empty, then returns empty array', async () => {
      deps.commentService.getCommentsForPost.mockResolvedValue({ comments: [], more: false })

      const comments = []
      for await (const comment of post.comments()) {
        comments.push(comment)
      }

      expect(comments).toHaveLength(0)
    })

    it('When comments property is missing, then returns empty array', async () => {
      deps.commentService.getCommentsForPost.mockResolvedValue({ comments: [], more: false })

      const comments = []
      for await (const comment of post.comments()) {
        comments.push(comment)
      }

      expect(comments).toHaveLength(0)
    })

    it('When API fails, then throws error with post ID', async () => {
      deps.commentService.getCommentsForPost.mockRejectedValue(new Error('API error'))

      const comments = []
      await expect(async () => {
        for await (const comment of post.comments()) {
          comments.push(comment)
        }
      }).rejects.toThrow('Failed to get comments for post 456: API error')
    })
  })
})

describe('FullPost Entity - Comments', () => {
  let deps: ReturnType<typeof createMockEntityDeps>
  let fullPost: FullPost

  beforeEach(() => {
    deps = createMockEntityDeps()

    const mockFullPostData = {
      id: 789,
      title: 'Full Test Post',
      slug: 'full-test-post',
      post_date: '2023-01-01T00:00:00Z',
      canonical_url: 'https://example.com/full-post',
      type: 'newsletter' as const,
      subtitle: 'Full test subtitle',
      description: 'Full test description',
      truncated_body_text: 'Truncated content',
      body_html: '<p>Full HTML content with <strong>formatting</strong></p>',
      htmlBody: '<p>Full HTML content with <strong>formatting</strong></p>'
    }

    fullPost = new FullPost(mockFullPostData, deps)
  })

  describe('comments()', () => {
    it('When iterating comments, then returns Comment entities', async () => {
      const mockComments = [
        {
          id: 10,
          body: 'Full post comment 1',
          date: '2023-01-01T00:00:00Z',
          post_id: 789,
          user_id: 100,
          name: 'Commenter 1'
        },
        {
          id: 11,
          body: 'Full post comment 2',
          date: '2023-01-02T00:00:00Z',
          post_id: 789,
          user_id: 101,
          name: 'Commenter 2'
        }
      ]
      deps.commentService.getCommentsForPost.mockResolvedValue({
        comments: mockComments,
        more: false
      })

      const comments = []
      for await (const comment of fullPost.comments({ limit: 2 })) {
        comments.push(comment)
      }

      expect(comments).toHaveLength(2)
      expect(comments[0]).toBeInstanceOf(Comment)
      expect(comments[0].body).toBe('Full post comment 1')
      expect(comments[1].body).toBe('Full post comment 2')
      expect(deps.commentService.getCommentsForPost).toHaveBeenCalledWith(789)
    })
  })
})
