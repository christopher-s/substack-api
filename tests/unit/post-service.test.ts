import nock from 'nock'
import { PostService } from '@substack-api/internal/services/post-service'
import { HttpClient } from '@substack-api/internal/http-client'
import type { SubstackFullPost, SubstackPreviewPost } from '@substack-api/internal'

describe('PostService', () => {
  let postService: PostService
  let httpClient: HttpClient
  const baseUrl = 'https://substack.com'

  beforeEach(() => {
    nock.cleanAll()
    httpClient = new HttpClient(baseUrl)
    postService = new PostService(httpClient)
  })

  afterEach(() => {
    expect(nock.isDone()).toBe(true)
    nock.cleanAll()
  })

  afterAll(() => {
    nock.restore()
  })

  describe('getPostById', () => {
    it('When requesting a post by ID, then returns the post data', async () => {
      const mockPost: SubstackFullPost = {
        id: 123,
        title: 'Test Post',
        slug: 'test-post',
        post_date: '2023-01-01T00:00:00Z',
        canonical_url: 'https://example.com/test-post',
        body_html: '<p>Test post body content</p>'
      }

      nock(baseUrl).get('/posts/by-id/123').reply(200, { post: mockPost })

      const result = await postService.getPostById(123)

      expect(result).toEqual(mockPost)
    })

    it('When the global HTTP client returns an error, then throws the error', async () => {
      const errorMessage = 'HTTP 404: Not found'

      nock(baseUrl).get('/posts/by-id/999').replyWithError(errorMessage)

      await expect(postService.getPostById(999)).rejects.toThrow(errorMessage)
    })

    it('When requesting a post by ID, then uses the global HTTP client', async () => {
      const mockPost: SubstackFullPost = {
        id: 456,
        title: 'Another Test Post',
        slug: 'another-test-post',
        post_date: '2023-02-01T00:00:00Z',
        canonical_url: 'https://example.com/another-test-post',
        body_html: '<p>Another test post body content</p>'
      }

      nock(baseUrl).get('/posts/by-id/456').reply(200, { post: mockPost })

      await postService.getPostById(456)

      // nock verifies the request was made via done() in afterEach if using persist,
      // but here we rely on the test completing without unmocked errors
    })

    it('When response is missing post data, then throws invalid response error', async () => {
      nock(baseUrl).get('/posts/by-id/123').reply(200, {})

      await expect(postService.getPostById(123)).rejects.toThrow(
        'Invalid response format: missing post data'
      )
    })

    it('When postTags contain objects and strings, then transforms them to strings', async () => {
      const mockPost = {
        id: 123,
        title: 'Test Post',
        slug: 'test-post',
        post_date: '2023-01-01T00:00:00Z',
        canonical_url: 'https://example.com/post',
        type: 'newsletter',
        body_html: '<p>Test post body content</p>',
        postTags: [{ name: 'tech', id: 1 }, { name: 'newsletter', id: 2 }, 'simple-string-tag']
      }

      nock(baseUrl).get('/posts/by-id/123').reply(200, { post: mockPost })

      const result = await postService.getPostById(123)

      expect(result.postTags).toEqual(['tech', 'newsletter', 'simple-string-tag'])
    })
  })

  describe('getPostsForProfile', () => {
    it('When requesting posts for a profile, then returns the posts', async () => {
      const mockPosts: SubstackPreviewPost[] = [
        {
          id: 1,
          title: 'Post 1',
          post_date: '2023-01-01T00:00:00Z'
        },
        {
          id: 2,
          title: 'Post 2',
          post_date: '2023-01-02T00:00:00Z'
        }
      ]

      nock(baseUrl)
        .get('/profile/posts')
        .query({ profile_user_id: '123', limit: '10', offset: '0' })
        .reply(200, { posts: mockPosts })

      const result = await postService.getPostsForProfile(123, { limit: 10, offset: 0 })

      expect(result.posts).toEqual(mockPosts)
      expect(result.nextCursor).toBeUndefined()
    })

    it('When posts array is empty, then returns empty array', async () => {
      nock(baseUrl)
        .get('/profile/posts')
        .query({ profile_user_id: '456', limit: '5', offset: '10' })
        .reply(200, { posts: [] })

      const result = await postService.getPostsForProfile(456, { limit: 5, offset: 10 })

      expect(result.posts).toEqual([])
      expect(result.nextCursor).toBeUndefined()
    })

    it('When response is missing posts property, then returns empty array', async () => {
      nock(baseUrl)
        .get('/profile/posts')
        .query({ profile_user_id: '789', limit: '20', offset: '5' })
        .reply(200, {})

      const result = await postService.getPostsForProfile(789, { limit: 20, offset: 5 })

      expect(result.posts).toEqual([])
      expect(result.nextCursor).toBeUndefined()
    })

    it('When HTTP client returns an error, then throws the error', async () => {
      const errorMessage = 'HTTP 500: Internal server error'

      nock(baseUrl)
        .get('/profile/posts')
        .query({ profile_user_id: '123', limit: '10', offset: '0' })
        .replyWithError(errorMessage)

      await expect(postService.getPostsForProfile(123, { limit: 10, offset: 0 })).rejects.toThrow(
        errorMessage
      )
    })

    it('When response contains an invalid post, then throws validation error', async () => {
      const validPost: SubstackPreviewPost = {
        id: 1,
        title: 'Valid Post',
        post_date: '2023-01-01T00:00:00Z'
      }

      const invalidPost = {
        id: 'invalid-id', // Should be number
        title: 'Invalid Post'
        // Missing required fields
      }

      nock(baseUrl)
        .get('/profile/posts')
        .query({ profile_user_id: '123', limit: '10', offset: '0' })
        .reply(200, { posts: [validPost, invalidPost] })

      await expect(postService.getPostsForProfile(123, { limit: 10, offset: 0 })).rejects.toThrow(
        /Post 1 in profile response/
      )
    })

    it('When response contains nextCursor, then returns it', async () => {
      const mockPosts: SubstackPreviewPost[] = [
        {
          id: 1,
          title: 'Post 1',
          post_date: '2023-01-01T00:00:00Z'
        }
      ]

      nock(baseUrl)
        .get('/profile/posts')
        .query({ profile_user_id: '123', limit: '10', offset: '0' })
        .reply(200, { posts: mockPosts, nextCursor: 'cursor123' })

      const result = await postService.getPostsForProfile(123, { limit: 10, offset: 0 })

      expect(result.posts).toEqual(mockPosts)
      expect(result.nextCursor).toBe('cursor123')
    })
  })
})
