import { FullPost, PreviewPost } from '@substack-api/domain/post'
import { createMockEntityDeps } from '@test/unit/helpers/mock-services'

describe('PreviewPost Entity - Reactions', () => {
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

  describe('like()', () => {
    it('When liking a post, then throws not-supported error', async () => {
      await expect(post.like()).rejects.toThrow(
        'Post liking is not supported by this version of the API'
      )
    })
  })

  describe('addComment()', () => {
    it('When adding a comment, then throws not-supported error', async () => {
      await expect(post.addComment({ body: 'Test comment' })).rejects.toThrow(
        'Comment creation is not supported by this version of the API'
      )
    })
  })
})

describe('FullPost Entity - Reactions', () => {
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

  describe('Post interface implementation', () => {
    it('When checking methods, then all Post interface methods are available', async () => {
      expect(typeof fullPost.like).toBe('function')
      expect(typeof fullPost.addComment).toBe('function')
      expect(typeof fullPost.comments).toBe('function')
    })

    it('When calling like(), then throws not-supported error', async () => {
      await expect(fullPost.like()).rejects.toThrow(
        'Post liking is not supported by this version of the API'
      )
    })

    it('When calling addComment(), then throws not-supported error', async () => {
      await expect(fullPost.addComment({ body: 'Test' })).rejects.toThrow(
        'Comment creation is not supported by this version of the API'
      )
    })
  })
})
