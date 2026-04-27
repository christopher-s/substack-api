import { FullPost, PreviewPost } from '@substack-api/domain/post'
import { Comment } from '@substack-api/domain/comment'
import { CommentService } from '@substack-api/internal/services/comment-service'
import { PostService } from '@substack-api/internal/services/post-service'
import { ProfileService } from '@substack-api/internal/services/profile-service'
import { NoteService } from '@substack-api/internal/services/note-service'
import { FollowingService } from '@substack-api/internal/services/following-service'
import { NoteBuilderFactory } from '@substack-api/internal/services/new-note-service'
import type { HttpClient } from '@substack-api/internal/http-client'

describe('PreviewPost Entity', () => {
  let mockPublicationClient: jest.Mocked<HttpClient>
  let mockCommentService: jest.Mocked<CommentService>
  let mockPostService: jest.Mocked<PostService>
  let mockProfileService: jest.Mocked<ProfileService>
  let mockNoteService: jest.Mocked<NoteService>
  let mockFollowingService: jest.Mocked<FollowingService>
  let mockNoteBuilderFactory: jest.Mocked<NoteBuilderFactory>
  let post: PreviewPost

  beforeEach(() => {
    mockPublicationClient = {
      get: jest.fn(),
      post: jest.fn(),
      request: jest.fn()
    } as unknown as jest.Mocked<HttpClient>

    mockCommentService = {
      getCommentsForPost: jest.fn(),
      getCommentById: jest.fn()
    } as unknown as jest.Mocked<CommentService>

    mockPostService = {
      getPostById: jest.fn(),
      getPostsForProfile: jest.fn()
    } as unknown as jest.Mocked<PostService>

    mockProfileService = {
      getOwnProfile: jest.fn(),
      getProfileById: jest.fn(),
      getProfileBySlug: jest.fn()
    } as unknown as jest.Mocked<ProfileService>

    mockNoteService = {
      getNoteById: jest.fn(),
      getNotesForLoggedUser: jest.fn(),
      getNotesForProfile: jest.fn()
    } as unknown as jest.Mocked<NoteService>

    mockFollowingService = {
      getFollowing: jest.fn(),
      getOwnId: jest.fn()
    } as unknown as jest.Mocked<FollowingService>

    mockNoteBuilderFactory = {
      newNote: jest.fn(),
      newNoteWithLink: jest.fn()
    } as unknown as jest.Mocked<NoteBuilderFactory>

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

    post = new PreviewPost(mockPostData, {
      publicationClient: mockPublicationClient,
      commentService: mockCommentService,
      postService: mockPostService,
      profileService: mockProfileService,
      noteService: mockNoteService,
      followingService: mockFollowingService,
      newNoteService: mockNoteBuilderFactory,
      perPage: 25
    })
  })

  describe('comments()', () => {
    it('should iterate through post comments', async () => {
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
      mockCommentService.getCommentsForPost.mockResolvedValue({ comments: mockComments, more: false })

      const comments = []
      for await (const comment of post.comments({ limit: 2 })) {
        comments.push(comment)
      }

      expect(comments).toHaveLength(2)
      expect(comments[0]).toBeInstanceOf(Comment)
      expect(comments[0].body).toBe('Comment 1')
      expect(comments[1].body).toBe('Comment 2')
      expect(mockCommentService.getCommentsForPost).toHaveBeenCalledWith(456)
    })

    it('should handle limit parameter', async () => {
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
      mockCommentService.getCommentsForPost.mockResolvedValue({ comments: mockComments, more: false })

      const comments = []
      for await (const comment of post.comments({ limit: 1 })) {
        comments.push(comment)
      }

      expect(comments).toHaveLength(1)
      expect(comments[0].body).toBe('Comment 1')
    })

    it('should handle empty comments response', async () => {
      mockCommentService.getCommentsForPost.mockResolvedValue({ comments: [], more: false })

      const comments = []
      for await (const comment of post.comments()) {
        comments.push(comment)
      }

      expect(comments).toHaveLength(0)
    })

    it('should handle missing comments property', async () => {
      mockCommentService.getCommentsForPost.mockResolvedValue({ comments: [], more: false })

      const comments = []
      for await (const comment of post.comments()) {
        comments.push(comment)
      }

      expect(comments).toHaveLength(0)
    })

    it('should throw error when API fails', async () => {
      mockCommentService.getCommentsForPost.mockRejectedValue(new Error('API error'))

      const comments = []
      await expect(async () => {
        for await (const comment of post.comments()) {
          comments.push(comment)
        }
      }).rejects.toThrow('Failed to get comments for post 456: API error')
    })
  })

  describe('like()', () => {
    it('should throw error for unimplemented like functionality', async () => {
      await expect(post.like()).rejects.toThrow(
        'Post liking is not supported by this version of the API'
      )
    })
  })

  describe('addComment()', () => {
    it('should throw error for unimplemented comment functionality', async () => {
      await expect(post.addComment({ body: 'Test comment' })).rejects.toThrow(
        'Comment creation is not supported by this version of the API'
      )
    })
  })

  describe('properties', () => {
    it('should have correct property values', () => {
      expect(post.id).toBe(456)
      expect(post.title).toBe('Test Post')
      expect(post.likesCount).toBe(0) // No reaction_count in mock data
      expect(post.publishedAt).toBeInstanceOf(Date)
    })
  })

  describe('author and likesCount extraction', () => {
    it('should extract author from publishedBylines and likesCount from reaction_count', () => {
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

      const postWithAuthor = new PreviewPost(mockPostDataWithBylines, {
        publicationClient: mockPublicationClient,
        commentService: mockCommentService,
        postService: mockPostService,
        profileService: mockProfileService,
        noteService: mockNoteService,
        followingService: mockFollowingService,
        newNoteService: mockNoteBuilderFactory,
        perPage: 25
      })

      expect(postWithAuthor.author).toEqual({
        id: 123,
        name: 'Test Author',
        handle: 'testauthor',
        avatarUrl: 'https://example.com/photo.jpg'
      })
      expect(postWithAuthor.likesCount).toBe(42)
    })

    it('should fall back to Unknown Author when no publishedBylines', () => {
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

      const postNoAuthor = new PreviewPost(mockPostDataNoBylines, {
        publicationClient: mockPublicationClient,
        commentService: mockCommentService,
        postService: mockPostService,
        profileService: mockProfileService,
        noteService: mockNoteService,
        followingService: mockFollowingService,
        newNoteService: mockNoteBuilderFactory,
        perPage: 25
      })

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
    it('should fetch full post data and return FullPost instance', async () => {
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

      mockPostService.getPostById.mockResolvedValue(mockFullPostData)

      const fullPost = await post.fullPost()

      expect(fullPost).toBeInstanceOf(FullPost)
      expect(fullPost.id).toBe(456)
      expect(fullPost.title).toBe('Test Post')
      expect(fullPost.htmlBody).toBe('<p>Full HTML content</p>')
      expect(mockPostService.getPostById).toHaveBeenCalledWith(456)
    })

    it('should throw error when PostService fails', async () => {
      mockPostService.getPostById.mockRejectedValue(new Error('API error'))

      await expect(post.fullPost()).rejects.toThrow('Failed to fetch full post 456: API error')
    })
  })
})

describe('FullPost Entity', () => {
  let mockHttpClient: jest.Mocked<HttpClient>
  let mockCommentService: jest.Mocked<CommentService>
  let _mockPostService: jest.Mocked<PostService>
  let _mockProfileService: jest.Mocked<ProfileService>
  let _mockNoteService: jest.Mocked<NoteService>
  let _mockFollowingService: jest.Mocked<FollowingService>
  let _mockNoteBuilderFactory: jest.Mocked<NoteBuilderFactory>
  let fullPost: FullPost

  beforeEach(() => {
    mockHttpClient = {
      get: jest.fn(),
      post: jest.fn(),
      request: jest.fn()
    } as unknown as jest.Mocked<HttpClient>

    mockCommentService = {
      getCommentsForPost: jest.fn(),
      getCommentById: jest.fn()
    } as unknown as jest.Mocked<CommentService>

    _mockPostService = {
      getPostById: jest.fn(),
      getPostsForProfile: jest.fn()
    } as unknown as jest.Mocked<PostService>

    _mockProfileService = {
      getOwnProfile: jest.fn(),
      getProfileById: jest.fn(),
      getProfileBySlug: jest.fn()
    } as unknown as jest.Mocked<ProfileService>

    _mockNoteService = {
      getNoteById: jest.fn(),
      getNotesForLoggedUser: jest.fn(),
      getNotesForProfile: jest.fn()
    } as unknown as jest.Mocked<NoteService>

    _mockFollowingService = {
      getFollowing: jest.fn(),
      getOwnId: jest.fn()
    } as unknown as jest.Mocked<FollowingService>

    _mockNoteBuilderFactory = {
      newNote: jest.fn(),
      newNoteWithLink: jest.fn()
    } as unknown as jest.Mocked<NoteBuilderFactory>

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

    fullPost = new FullPost(mockFullPostData, {
      publicationClient: mockHttpClient,
      commentService: mockCommentService,
      postService: _mockPostService,
      profileService: _mockProfileService,
      noteService: _mockNoteService,
      followingService: _mockFollowingService,
      newNoteService: _mockNoteBuilderFactory,
      perPage: 25
    })
  })

  describe('properties', () => {
    it('should have all PreviewPost properties', () => {
      expect(fullPost.id).toBe(789)
      expect(fullPost.title).toBe('Full Test Post')
      expect(fullPost.subtitle).toBe('Full test subtitle')
      expect(fullPost.truncatedBody).toBe('Truncated content')
      expect(fullPost.likesCount).toBe(0)
      expect(fullPost.publishedAt).toBeInstanceOf(Date)
    })

    it('should have htmlBody property', () => {
      expect(fullPost.htmlBody).toBe('<p>Full HTML content with <strong>formatting</strong></p>')
    })

    it('should handle missing htmlBody gracefully', () => {
      const mockDataWithoutHtmlBody = {
        id: 999,
        title: 'Test Post',
        slug: 'test-post',
        post_date: '2023-01-01T00:00:00Z',
        canonical_url: 'https://example.com/post',
        type: 'newsletter' as const,
        body_html: '<p>Body from body_html field</p>' // body_html is required, but htmlBody is optional
      }

      const postWithoutHtmlBody = new FullPost(mockDataWithoutHtmlBody, {
        publicationClient: mockHttpClient,
        commentService: mockCommentService,
        postService: _mockPostService,
        profileService: _mockProfileService,
        noteService: _mockNoteService,
        followingService: _mockFollowingService,
        newNoteService: _mockNoteBuilderFactory,
        perPage: 25
      })

      expect(postWithoutHtmlBody.htmlBody).toBe('<p>Body from body_html field</p>')
    })
  })

  describe('author extraction', () => {
    it('should extract author from publishedBylines', () => {
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

      const fullPostWithAuthor = new FullPost(mockFullPostDataWithBylines, {
        publicationClient: mockHttpClient,
        commentService: mockCommentService,
        postService: _mockPostService,
        profileService: _mockProfileService,
        noteService: _mockNoteService,
        followingService: _mockFollowingService,
        newNoteService: _mockNoteBuilderFactory,
        perPage: 25
      })

      expect(fullPostWithAuthor.author).toEqual({
        id: 456,
        name: 'Full Author',
        handle: 'fullauthor',
        avatarUrl: 'https://example.com/author.jpg'
      })
      expect(fullPostWithAuthor.likesCount).toBe(99)
    })

    it('should fall back to Unknown Author when no publishedBylines', () => {
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

      const fullPostNoAuthor = new FullPost(mockFullPostDataNoBylines, {
        publicationClient: mockHttpClient,
        commentService: mockCommentService,
        postService: _mockPostService,
        profileService: _mockProfileService,
        noteService: _mockNoteService,
        followingService: _mockFollowingService,
        newNoteService: _mockNoteBuilderFactory,
        perPage: 25
      })

      expect(fullPostNoAuthor.author).toEqual({
        id: 0,
        name: 'Unknown Author',
        handle: 'unknown',
        avatarUrl: ''
      })
      expect(fullPostNoAuthor.likesCount).toBe(0)
    })
  })

  describe('comments()', () => {
    it('should iterate through comments and return Comment entities', async () => {
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
      mockCommentService.getCommentsForPost.mockResolvedValue({ comments: mockComments, more: false })

      const comments = []
      for await (const comment of fullPost.comments({ limit: 2 })) {
        comments.push(comment)
      }

      expect(comments).toHaveLength(2)
      expect(comments[0]).toBeInstanceOf(Comment)
      expect(comments[0].body).toBe('Full post comment 1')
      expect(comments[1].body).toBe('Full post comment 2')
      expect(mockCommentService.getCommentsForPost).toHaveBeenCalledWith(789)
    })
  })

  describe('Post interface implementation', () => {
    it('should implement all methods from Post interface', async () => {
      // Test that like method is available
      expect(typeof fullPost.like).toBe('function')

      // Test that addComment method is available
      expect(typeof fullPost.addComment).toBe('function')

      // Test that comments method is available
      expect(typeof fullPost.comments).toBe('function')
    })
  })
})
