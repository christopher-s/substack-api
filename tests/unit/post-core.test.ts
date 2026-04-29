import { FullPost, PreviewPost } from '@substack-api/domain/post'
import { createMockEntityDeps } from '@test/unit/helpers/mock-services'

describe('PreviewPost Entity - Core', () => {
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

  describe('properties', () => {
    it('When accessing properties, then returns correct values', () => {
      expect(post.id).toBe(456)
      expect(post.title).toBe('Test Post')
      expect(post.likesCount).toBe(0) // No reaction_count in mock data
      expect(post.publishedAt).toBeInstanceOf(Date)
    })
  })

  describe('author and likesCount extraction', () => {
    it('When publishedBylines and reaction_count exist, then extracts author and likesCount', () => {
      const mockPostDataWithBylines = {
        id: 100,
        title: 'Post With Author',
        slug: 'post-with-author',
        post_date: '2023-06-15T00:00:00Z',
        canonical_url: 'https://example.com/post-with-author',
        type: 'newsletter' as const,
        subtitle: 'Has author',
        description: 'Desc',
        publishedAt: '2023-06-15T00:00:00Z',
        audience: 'everyone' as const,
        write_comment_permissions: 'everyone' as const,
        should_send_email: true,
        draft: false,
        likes: 10,
        comments: 5,
        restacks: 2,
        cover_image: '',
        podcast_url: '',
        videoUpload: null,
        podcastUpload: null,
        postTags: [],
        pin_comment: false,
        free_unlock: false,
        default_comment_sort: 'best_first' as const,
        reactions: {},
        section_id: null,
        hasCashtag: false,
        body: 'Content',
        voiceover_id: null,
        theme: { background_pop: 'blue' },
        reaction_count: 42,
        publishedBylines: [
          {
            id: 123,
            name: 'Test Author',
            handle: 'testauthor',
            photo_url: 'https://example.com/photo.jpg'
          }
        ]
      }

      const postWithAuthor = new PreviewPost(mockPostDataWithBylines, deps)

      expect(postWithAuthor.author).toEqual({
        id: 123,
        name: 'Test Author',
        handle: 'testauthor',
        avatarUrl: 'https://example.com/photo.jpg'
      })
      expect(postWithAuthor.likesCount).toBe(42)
    })

    it('When no publishedBylines exist, then falls back to Unknown Author', () => {
      const mockPostDataNoBylines = {
        id: 101,
        title: 'Post Without Author',
        slug: 'post-without-author',
        post_date: '2023-06-15T00:00:00Z',
        canonical_url: 'https://example.com/post-without-author',
        type: 'newsletter' as const,
        subtitle: '',
        description: '',
        publishedAt: '2023-06-15T00:00:00Z',
        audience: 'everyone' as const,
        write_comment_permissions: 'everyone' as const,
        should_send_email: true,
        draft: false,
        likes: 0,
        comments: 0,
        restacks: 0,
        cover_image: '',
        podcast_url: '',
        videoUpload: null,
        podcastUpload: null,
        postTags: [],
        pin_comment: false,
        free_unlock: false,
        default_comment_sort: 'best_first' as const,
        reactions: {},
        section_id: null,
        hasCashtag: false,
        body: '',
        voiceover_id: null,
        theme: { background_pop: 'blue' }
        // No publishedBylines and no reaction_count
      }

      const postNoAuthor = new PreviewPost(mockPostDataNoBylines, deps)

      expect(postNoAuthor.author).toEqual({
        id: 0,
        name: 'Unknown Author',
        handle: 'unknown',
        avatarUrl: ''
      })
      expect(postNoAuthor.likesCount).toBe(0)
    })
  })

  describe('fullPost()', () => {
    it('When fetching full post, then returns FullPost instance', async () => {
      const mockFullPostData = {
        id: 456,
        title: 'Test Post',
        slug: 'test-post',
        post_date: '2023-01-01T00:00:00Z',
        canonical_url: 'https://example.com/post',
        type: 'newsletter' as const,
        subtitle: 'Test subtitle',
        description: 'Test description',
        truncated_body_text: 'Truncated content',
        body_html: '<p>Full HTML content</p>',
        htmlBody: '<p>Full HTML content</p>' // For backward compatibility
      }

      deps.postService.getPostById.mockResolvedValue(mockFullPostData)

      const fullPost = await post.fullPost()

      expect(fullPost).toBeInstanceOf(FullPost)
      expect(fullPost.id).toBe(456)
      expect(fullPost.title).toBe('Test Post')
      expect(fullPost.htmlBody).toBe('<p>Full HTML content</p>')
      expect(deps.postService.getPostById).toHaveBeenCalledWith(456)
    })

    it('When PostService fails, then throws error with post ID', async () => {
      deps.postService.getPostById.mockRejectedValue(new Error('API error'))

      await expect(post.fullPost()).rejects.toThrow('Failed to fetch full post 456: API error')
    })
  })
})

describe('FullPost Entity - Core', () => {
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
      htmlBody: '<p>Full HTML content with <strong>formatting</strong></p>' // For backward compatibility
    }

    fullPost = new FullPost(mockFullPostData, deps)
  })

  describe('properties', () => {
    it('When accessing properties, then returns all PreviewPost properties', () => {
      expect(fullPost.id).toBe(789)
      expect(fullPost.title).toBe('Full Test Post')
      expect(fullPost.subtitle).toBe('Full test subtitle')
      expect(fullPost.truncatedBody).toBe('Truncated content')
      expect(fullPost.likesCount).toBe(0)
      expect(fullPost.publishedAt).toBeInstanceOf(Date)
    })

    it('When htmlBody is present, then returns htmlBody property', () => {
      expect(fullPost.htmlBody).toBe('<p>Full HTML content with <strong>formatting</strong></p>')
    })

    it('When htmlBody is missing, then falls back to body_html', () => {
      const mockDataWithoutHtmlBody = {
        id: 999,
        title: 'Test Post',
        slug: 'test-post',
        post_date: '2023-01-01T00:00:00Z',
        canonical_url: 'https://example.com/post',
        type: 'newsletter' as const,
        body_html: '<p>Body from body_html field</p>' // body_html is required, but htmlBody is optional
      }

      const postWithoutHtmlBody = new FullPost(mockDataWithoutHtmlBody, deps)

      expect(postWithoutHtmlBody.htmlBody).toBe('<p>Body from body_html field</p>')
    })
  })

  describe('author extraction', () => {
    it('When publishedBylines exist, then extracts author', () => {
      const mockFullPostDataWithBylines = {
        id: 800,
        title: 'Full Post With Author',
        slug: 'full-post-with-author',
        post_date: '2023-06-15T00:00:00Z',
        canonical_url: 'https://example.com/full-post-with-author',
        type: 'newsletter' as const,
        subtitle: 'Has author',
        truncated_body_text: 'Truncated',
        body_html: '<p>Content</p>',
        reaction_count: 99,
        publishedBylines: [
          {
            id: 456,
            name: 'Full Author',
            handle: 'fullauthor',
            photo_url: 'https://example.com/author.jpg'
          }
        ]
      }

      const fullPostWithAuthor = new FullPost(mockFullPostDataWithBylines, deps)

      expect(fullPostWithAuthor.author).toEqual({
        id: 456,
        name: 'Full Author',
        handle: 'fullauthor',
        avatarUrl: 'https://example.com/author.jpg'
      })
      expect(fullPostWithAuthor.likesCount).toBe(99)
    })

    it('When no publishedBylines exist, then falls back to Unknown Author', () => {
      const mockFullPostDataNoBylines = {
        id: 801,
        title: 'Full Post No Author',
        slug: 'full-post-no-author',
        post_date: '2023-06-15T00:00:00Z',
        canonical_url: 'https://example.com/full-post-no-author',
        type: 'newsletter' as const,
        subtitle: '',
        truncated_body_text: '',
        body_html: '<p>Content</p>'
        // No publishedBylines, no reaction_count
      }

      const fullPostNoAuthor = new FullPost(mockFullPostDataNoBylines, deps)

      expect(fullPostNoAuthor.author).toEqual({
        id: 0,
        name: 'Unknown Author',
        handle: 'unknown',
        avatarUrl: ''
      })
      expect(fullPostNoAuthor.likesCount).toBe(0)
    })
  })
})
