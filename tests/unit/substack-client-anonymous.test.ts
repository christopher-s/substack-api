import { SubstackClient } from '@substack-api/substack-client'
import { HttpClient } from '@substack-api/internal/http-client'
import {
  DiscoveryService,
  PublicationService,
  CommentService
} from '@substack-api/internal/services'

jest.mock('@substack-api/internal/http-client')
jest.mock('@substack-api/internal/services')

describe('SubstackClient anonymous and discovery methods', () => {
  let client: SubstackClient
  let mockDiscoveryService: jest.Mocked<DiscoveryService>
  let mockPublicationService: jest.Mocked<PublicationService>
  let mockCommentService: jest.Mocked<CommentService>

  beforeEach(() => {
    jest.clearAllMocks()

    const mockHttpClient = new HttpClient('https://test.com') as jest.Mocked<HttpClient>
    mockHttpClient.get = jest.fn()
    mockHttpClient.post = jest.fn()
    mockHttpClient.put = jest.fn()

    mockDiscoveryService = new DiscoveryService(mockHttpClient) as jest.Mocked<DiscoveryService>
    mockDiscoveryService.getTopPosts = jest.fn()
    mockDiscoveryService.getTrending = jest.fn()
    mockDiscoveryService.getFeed = jest.fn()
    mockDiscoveryService.getCategories = jest.fn()
    mockDiscoveryService.getProfileActivity = jest.fn()
    mockDiscoveryService.getProfileLikes = jest.fn()
    mockDiscoveryService.search = jest.fn()
    mockDiscoveryService.searchProfiles = jest.fn()
    mockDiscoveryService.exploreSearch = jest.fn()
    mockDiscoveryService.getPublicationFeed = jest.fn()
    mockDiscoveryService.getCategoryPublications = jest.fn()

    mockCommentService = new CommentService(
      mockHttpClient,
      mockHttpClient
    ) as jest.Mocked<CommentService>
    mockCommentService.getReplies = jest.fn()

    mockPublicationService = new PublicationService(
      mockHttpClient
    ) as jest.Mocked<PublicationService>
    mockPublicationService.getHomepageData = jest.fn()
    mockPublicationService.getArchive = jest.fn()
    mockPublicationService.getPostFacepile = jest.fn()
    mockPublicationService.getActiveLiveStream = jest.fn()
    mockPublicationService.markPostSeen = jest.fn()
    mockPublicationService.getPosts = jest.fn()

    client = new SubstackClient({ publicationUrl: 'https://test.substack.com' })

    // Replace the service instances on the client
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const anyClient = client as any
    anyClient.discoveryService = mockDiscoveryService
    anyClient.publicationService = mockPublicationService
    anyClient.commentService = mockCommentService
  })

  describe('topPosts', () => {
    it('When requesting top posts from discovery service', async () => {
      const mockItems = [
        { post_id: 1, type: 'post', title: 'Test 1', web_url: 'https://test.com/1' },
        { post_id: 2, type: 'post', title: 'Test 2', web_url: 'https://test.com/2' }
      ]
      mockDiscoveryService.getTopPosts.mockResolvedValue({ items: mockItems })
      const result = await client.topPosts()
      expect(result).toEqual(mockItems)
    })
  })

  describe('categories', () => {
    it('When requesting Category instances', async () => {
      mockDiscoveryService.getCategories.mockResolvedValue([
        {
          id: 1,
          name: 'Tech',
          canonical_name: 'tech',
          active: true,
          rank: 0,
          slug: 'tech',
          subcategories: []
        }
      ])
      const categories = await client.categories()
      expect(categories).toHaveLength(1)
      expect(categories[0].name).toBe('Tech')
    })
  })

  describe('search', () => {
    it('should yield search results and stop when no cursor', async () => {
      mockDiscoveryService.search.mockResolvedValueOnce({
        items: [
          { type: 'post', entity_key: 'test-1' },
          { type: 'comment', entity_key: 'test-1' }
        ],
        nextCursor: null
      })
      const results = []
      for await (const item of client.search('test')) {
        results.push(item)
      }
      expect(results).toHaveLength(2)
    })

    it('should paginate with cursor', async () => {
      mockDiscoveryService.search.mockResolvedValueOnce({
        items: [{ type: 'post', entity_key: 'test-1' }],
        nextCursor: 'page2'
      })
      mockDiscoveryService.search.mockResolvedValueOnce({
        items: [{ type: 'comment', entity_key: 'test-1' }],
        nextCursor: null
      })
      const results = []
      for await (const item of client.search('test')) {
        results.push(item)
      }
      expect(results).toHaveLength(2)
      expect(mockDiscoveryService.search).toHaveBeenCalledTimes(2)
    })

    it('should respect limit option', async () => {
      mockDiscoveryService.search.mockResolvedValue({
        items: [
          { type: 'post', entity_key: 'test-1' },
          { type: 'comment', entity_key: 'test-1' }
        ],
        nextCursor: null
      })
      const results = []
      for await (const item of client.search('test', { limit: 1 })) {
        results.push(item)
      }
      expect(results).toHaveLength(1)
    })
  })

  describe('discoverFeed', () => {
    it('should yield feed items', async () => {
      mockDiscoveryService.getFeed.mockResolvedValueOnce({
        items: [{ type: 'post', entity_key: 'test-1' }],
        nextCursor: null
      })
      const results = []
      for await (const item of client.discoverFeed()) {
        results.push(item)
      }
      expect(results).toHaveLength(1)
    })

    it('should paginate and respect limit', async () => {
      mockDiscoveryService.getFeed.mockResolvedValueOnce({
        items: [
          { type: 'post', entity_key: 'test-1' },
          { type: 'note', entity_key: 'test-1' }
        ],
        nextCursor: 'next'
      })
      mockDiscoveryService.getFeed.mockResolvedValueOnce({
        items: [{ type: 'comment', entity_key: 'test-1' }],
        nextCursor: null
      })
      const results = []
      for await (const item of client.discoverFeed({ limit: 2 })) {
        results.push(item)
      }
      expect(results).toHaveLength(2)
    })
  })

  describe('publicationArchive', () => {
    it('should yield PublicationPost instances', async () => {
      mockPublicationService.getArchive.mockResolvedValueOnce([
        {
          id: 1,
          title: 'Post',
          slug: 'post',
          post_date: '2026-01-01T00:00:00Z',
          canonical_url: 'https://test.substack.com/p/post'
        }
      ])
      const results = []
      for await (const post of client.publicationArchive()) {
        results.push(post)
      }
      expect(results).toHaveLength(1)
      expect(results[0].title).toBe('Post')
    })

    it('should paginate and respect limit', async () => {
      mockPublicationService.getArchive.mockResolvedValueOnce([
        {
          id: 1,
          title: 'A',
          slug: 'a',
          post_date: '2026-01-01T00:00:00Z',
          canonical_url: 'https://test.substack.com/p/a'
        },
        {
          id: 2,
          title: 'B',
          slug: 'b',
          post_date: '2026-01-02T00:00:00Z',
          canonical_url: 'https://test.substack.com/p/b'
        }
      ])
      const results = []
      for await (const post of client.publicationArchive({ limit: 1 })) {
        results.push(post)
      }
      expect(results).toHaveLength(1)
    })
  })

  describe('publicationHomepage', () => {
    it('When requesting PublicationPost instances', async () => {
      mockPublicationService.getHomepageData.mockResolvedValue({
        newPosts: [
          {
            id: 1,
            title: 'Home Post',
            slug: 'home-post',
            post_date: '2026-01-01T00:00:00Z',
            canonical_url: 'https://test.substack.com/p/home-post'
          }
        ]
      })
      const posts = await client.publicationHomepage()
      expect(posts).toHaveLength(1)
      expect(posts[0].title).toBe('Home Post')
    })
  })

  describe('postReactors', () => {
    it('should delegate to publication service', async () => {
      mockPublicationService.getPostFacepile.mockResolvedValue({
        reactors: [{ id: 1, name: 'User', photo_url: 'url' }]
      })
      const result = await client.postReactors(42)
      expect(mockPublicationService.getPostFacepile).toHaveBeenCalledWith(42)
      expect(result).toBeDefined()
    })
  })

  describe('profileActivity', () => {
    it('should yield activity items', async () => {
      mockDiscoveryService.getProfileActivity.mockResolvedValueOnce({
        items: [{ type: 'post', entity_key: 'test-1' }],
        nextCursor: null
      })
      const results = []
      for await (const item of client.profileActivity(123)) {
        results.push(item)
      }
      expect(results).toHaveLength(1)
    })

    it('should respect limit', async () => {
      mockDiscoveryService.getProfileActivity.mockResolvedValueOnce({
        items: [
          { type: 'post', entity_key: 'test-1' },
          { type: 'note', entity_key: 'test-1' }
        ],
        nextCursor: null
      })
      const results = []
      for await (const item of client.profileActivity(123, { limit: 1 })) {
        results.push(item)
      }
      expect(results).toHaveLength(1)
    })
  })

  describe('profileLikes', () => {
    it('should yield like items', async () => {
      mockDiscoveryService.getProfileLikes.mockResolvedValueOnce({
        items: [{ type: 'comment', entity_key: 'test-1' }],
        nextCursor: null
      })
      const results = []
      for await (const item of client.profileLikes(456)) {
        results.push(item)
      }
      expect(results).toHaveLength(1)
    })
  })

  describe('anonymous mode', () => {
    it('should work without a token', () => {
      expect(
        () => new SubstackClient({ publicationUrl: 'https://test.substack.com' })
      ).not.toThrow()
    })
  })

  describe('trendingFeed', () => {
    it('should yield trending responses via offset pagination', async () => {
      mockDiscoveryService.getTrending.mockResolvedValueOnce({
        posts: [{ id: 1, title: 'A', slug: 'a', post_date: '2026-01-01', type: 'post' }],
        publications: [],
        trendingPosts: []
      })

      const results = []
      for await (const response of client.trendingFeed()) {
        results.push(response)
      }
      expect(results).toHaveLength(1)
      expect(results[0].posts[0].id).toBe(1)
      expect(mockDiscoveryService.getTrending).toHaveBeenCalledWith({ limit: 25, offset: 0 })
    })

    it('should paginate with offset when page is full', async () => {
      // Return 25 posts (full batch) on first page, then empty on second
      const fullPage = Array.from({ length: 25 }, (_, i) => ({
        id: i + 1,
        title: `Post ${i}`,
        slug: `post-${i}`,
        post_date: '2026-01-01',
        type: 'post'
      }))
      mockDiscoveryService.getTrending.mockResolvedValueOnce({
        posts: fullPage,
        publications: [],
        trendingPosts: []
      })
      mockDiscoveryService.getTrending.mockResolvedValueOnce({
        posts: [],
        publications: [],
        trendingPosts: []
      })

      const results = []
      for await (const response of client.trendingFeed()) {
        results.push(response)
      }
      expect(results).toHaveLength(2)
      expect(results[0].posts).toHaveLength(25)
      expect(results[1].posts).toHaveLength(0)
      expect(mockDiscoveryService.getTrending).toHaveBeenCalledWith({ limit: 25, offset: 25 })
    })
  })

  describe('commentReplies', () => {
    it('should delegate to comment service', async () => {
      const mockResponse = {
        commentBranches: [],
        moreBranches: 0,
        nextCursor: null
      }
      mockCommentService.getReplies.mockResolvedValue(mockResponse)
      const result = await client.commentReplies(123)
      expect(mockCommentService.getReplies).toHaveBeenCalledWith(123, undefined)
      expect(result).toEqual(mockResponse)
    })

    it('should pass cursor option', async () => {
      mockCommentService.getReplies.mockResolvedValue({
        commentBranches: [],
        moreBranches: 0,
        nextCursor: null
      })
      await client.commentReplies(123, { cursor: 'abc' })
      expect(mockCommentService.getReplies).toHaveBeenCalledWith(123, { cursor: 'abc' })
    })
  })

  describe('commentRepliesFeed', () => {
    it('should paginate replies via cursor', async () => {
      mockCommentService.getReplies.mockResolvedValueOnce({
        commentBranches: [
          { comment: { id: 1, body: 'Reply', date: '2025-01-01' }, descendantComments: [] }
        ],
        moreBranches: 5,
        nextCursor: 'next'
      })
      mockCommentService.getReplies.mockResolvedValueOnce({
        commentBranches: [],
        moreBranches: 0,
        nextCursor: null
      })

      const results = []
      for await (const response of client.commentRepliesFeed(123)) {
        results.push(response)
      }
      expect(results).toHaveLength(2)
      expect(mockCommentService.getReplies).toHaveBeenCalledWith(123, { cursor: 'next' })
    })

    it('should respect limit and trim the last page', async () => {
      mockCommentService.getReplies.mockResolvedValueOnce({
        commentBranches: [
          { comment: { id: 1, body: 'A', date: '2025-01-01' }, descendantComments: [] },
          { comment: { id: 2, body: 'B', date: '2025-01-02' }, descendantComments: [] },
          { comment: { id: 3, body: 'C', date: '2025-01-03' }, descendantComments: [] }
        ],
        moreBranches: 5,
        nextCursor: 'next'
      })

      const results = []
      for await (const response of client.commentRepliesFeed(123, { limit: 2 })) {
        results.push(response)
      }
      expect(results).toHaveLength(1)
      expect(results[0].commentBranches).toHaveLength(2)
      expect(results[0].commentBranches[0].comment.id).toBe(1)
      expect(results[0].commentBranches[1].comment.id).toBe(2)
      expect(mockCommentService.getReplies).toHaveBeenCalledTimes(1)
    })

    it('should respect limit across multiple pages', async () => {
      mockCommentService.getReplies.mockResolvedValueOnce({
        commentBranches: [
          { comment: { id: 1, body: 'A', date: '2025-01-01' }, descendantComments: [] },
          { comment: { id: 2, body: 'B', date: '2025-01-02' }, descendantComments: [] },
          { comment: { id: 3, body: 'C', date: '2025-01-03' }, descendantComments: [] },
          { comment: { id: 4, body: 'D', date: '2025-01-04' }, descendantComments: [] },
          { comment: { id: 5, body: 'E', date: '2025-01-05' }, descendantComments: [] }
        ],
        moreBranches: 5,
        nextCursor: 'page2'
      })
      mockCommentService.getReplies.mockResolvedValueOnce({
        commentBranches: [
          { comment: { id: 6, body: 'F', date: '2025-01-06' }, descendantComments: [] },
          { comment: { id: 7, body: 'G', date: '2025-01-07' }, descendantComments: [] },
          { comment: { id: 8, body: 'H', date: '2025-01-08' }, descendantComments: [] },
          { comment: { id: 9, body: 'I', date: '2025-01-09' }, descendantComments: [] },
          { comment: { id: 10, body: 'J', date: '2025-01-10' }, descendantComments: [] }
        ],
        moreBranches: 0,
        nextCursor: null
      })

      const results = []
      let totalBranches = 0
      for await (const response of client.commentRepliesFeed(123, { limit: 7 })) {
        results.push(response)
        totalBranches += response.commentBranches.length
      }
      expect(results).toHaveLength(2)
      expect(totalBranches).toBe(7)
      expect(results[0].commentBranches).toHaveLength(5)
      expect(results[1].commentBranches).toHaveLength(2)
      expect(mockCommentService.getReplies).toHaveBeenCalledTimes(2)
      expect(mockCommentService.getReplies).toHaveBeenNthCalledWith(1, 123, { cursor: undefined })
      expect(mockCommentService.getReplies).toHaveBeenNthCalledWith(2, 123, { cursor: 'page2' })
    })
  })

  describe('profileSearch', () => {
    it('should delegate to search service', async () => {
      mockDiscoveryService.searchProfiles.mockResolvedValue({
        results: [{ id: 1, name: 'Test', handle: 'test' }],
        more: false
      })
      const result = await client.profileSearch('test')
      expect(mockDiscoveryService.searchProfiles).toHaveBeenCalledWith('test', undefined)
      expect(result.results).toHaveLength(1)
    })

    it('should pass page option', async () => {
      mockDiscoveryService.searchProfiles.mockResolvedValue({
        results: [],
        more: false
      })
      await client.profileSearch('test', { page: 2 })
      expect(mockDiscoveryService.searchProfiles).toHaveBeenCalledWith('test', { page: 2 })
    })
  })

  describe('profileSearchAll', () => {
    it('When iterating all pages', async () => {
      mockDiscoveryService.searchProfiles.mockResolvedValueOnce({
        results: [
          { id: 1, name: 'A', handle: 'a' },
          { id: 2, name: 'B', handle: 'b' }
        ],
        more: true
      })
      mockDiscoveryService.searchProfiles.mockResolvedValueOnce({
        results: [{ id: 3, name: 'C', handle: 'c' }],
        more: false
      })

      const results = []
      for await (const profile of client.profileSearchAll('test')) {
        results.push(profile)
      }
      expect(results).toHaveLength(3)
      expect(mockDiscoveryService.searchProfiles).toHaveBeenCalledWith('test', { page: 1 })
      expect(mockDiscoveryService.searchProfiles).toHaveBeenCalledWith('test', { page: 2 })
    })
  })

  describe('exploreSearch', () => {
    it('should yield explore search results', async () => {
      mockDiscoveryService.exploreSearch.mockResolvedValueOnce({
        items: [{ type: 'post', entity_key: 'explore-1' }],
        nextCursor: null
      })
      const results = []
      for await (const item of client.exploreSearch()) {
        results.push(item)
      }
      expect(results).toHaveLength(1)
      expect(mockDiscoveryService.exploreSearch).toHaveBeenCalledWith({
        tab: undefined,
        cursor: undefined
      })
    })

    it('should pass tab option and paginate', async () => {
      mockDiscoveryService.exploreSearch.mockResolvedValueOnce({
        items: [{ type: 'note', entity_key: 'note-1' }],
        nextCursor: 'next'
      })
      mockDiscoveryService.exploreSearch.mockResolvedValueOnce({
        items: [{ type: 'note', entity_key: 'note-2' }],
        nextCursor: null
      })
      const results = []
      for await (const item of client.exploreSearch({ tab: 'notes' })) {
        results.push(item)
      }
      expect(results).toHaveLength(2)
      expect(mockDiscoveryService.exploreSearch).toHaveBeenCalledWith({
        tab: 'notes',
        cursor: undefined
      })
      expect(mockDiscoveryService.exploreSearch).toHaveBeenLastCalledWith({
        tab: 'notes',
        cursor: 'next'
      })
    })

    it('should respect limit', async () => {
      mockDiscoveryService.exploreSearch.mockResolvedValue({
        items: [
          { type: 'post', entity_key: 'a' },
          { type: 'post', entity_key: 'b' }
        ],
        nextCursor: null
      })
      const results = []
      for await (const item of client.exploreSearch({ limit: 1 })) {
        results.push(item)
      }
      expect(results).toHaveLength(1)
    })
  })

  describe('publicationFeed', () => {
    it('should yield publication feed items', async () => {
      mockDiscoveryService.getPublicationFeed.mockResolvedValueOnce({
        items: [{ type: 'post', entity_key: 'pub-1' }],
        nextCursor: null
      })
      const results = []
      for await (const item of client.publicationFeed(42)) {
        results.push(item)
      }
      expect(results).toHaveLength(1)
      expect(mockDiscoveryService.getPublicationFeed).toHaveBeenCalledWith(42, {
        tab: undefined,
        cursor: undefined
      })
    })

    it('should pass tab option and paginate', async () => {
      mockDiscoveryService.getPublicationFeed.mockResolvedValueOnce({
        items: [{ type: 'post', entity_key: 'pub-1' }],
        nextCursor: 'page2'
      })
      mockDiscoveryService.getPublicationFeed.mockResolvedValueOnce({
        items: [{ type: 'note', entity_key: 'pub-2' }],
        nextCursor: null
      })
      const results = []
      for await (const item of client.publicationFeed(42, { tab: 'posts' })) {
        results.push(item)
      }
      expect(results).toHaveLength(2)
      expect(mockDiscoveryService.getPublicationFeed).toHaveBeenCalledWith(42, {
        tab: 'posts',
        cursor: undefined
      })
      expect(mockDiscoveryService.getPublicationFeed).toHaveBeenLastCalledWith(42, {
        tab: 'posts',
        cursor: 'page2'
      })
    })

    it('should respect limit', async () => {
      mockDiscoveryService.getPublicationFeed.mockResolvedValue({
        items: [
          { type: 'post', entity_key: 'a' },
          { type: 'post', entity_key: 'b' }
        ],
        nextCursor: null
      })
      const results = []
      for await (const item of client.publicationFeed(42, { limit: 1 })) {
        results.push(item)
      }
      expect(results).toHaveLength(1)
    })
  })

  describe('categoryPublications', () => {
    it('should delegate to discovery service with category id', async () => {
      mockDiscoveryService.getCategoryPublications.mockResolvedValue({
        publications: [
          {
            author_id: 1,
            name: 'Pub',
            subdomain: 'pub',
            logo_url: '',
            cover_photo_url: '',
            created_at: undefined,
            custom_domain: undefined
          }
        ],
        more: false
      })
      const result = await client.categoryPublications('tech')
      expect(mockDiscoveryService.getCategoryPublications).toHaveBeenCalledWith('tech', undefined)
      expect(result.publications).toHaveLength(1)
    })

    it('should pass limit and offset options', async () => {
      mockDiscoveryService.getCategoryPublications.mockResolvedValue({
        publications: [],
        more: false
      })
      await client.categoryPublications(1, { limit: 10, offset: 20 })
      expect(mockDiscoveryService.getCategoryPublications).toHaveBeenCalledWith(1, {
        limit: 10,
        offset: 20
      })
    })
  })

  describe('activeLiveStream', () => {
    it('should delegate to publication service', async () => {
      mockPublicationService.getActiveLiveStream.mockResolvedValue({
        activeLiveStream: { id: 1, title: 'Live' }
      })
      const result = await client.activeLiveStream(99)
      expect(mockPublicationService.getActiveLiveStream).toHaveBeenCalledWith(99)
      expect(result).toBeDefined()
    })
  })

  describe('markPostSeen', () => {
    it('should delegate to publication service', async () => {
      mockPublicationService.markPostSeen.mockResolvedValue(undefined)
      await client.markPostSeen(77)
      expect(mockPublicationService.markPostSeen).toHaveBeenCalledWith(77)
    })
  })

  describe('publicationPosts', () => {
    it('should yield PublicationPost instances', async () => {
      mockPublicationService.getPosts.mockResolvedValueOnce([
        {
          id: 1,
          title: 'Post',
          slug: 'post',
          post_date: '2026-01-01T00:00:00Z',
          canonical_url: 'https://test.substack.com/p/post'
        }
      ])
      const results = []
      for await (const post of client.publicationPosts()) {
        results.push(post)
      }
      expect(results).toHaveLength(1)
      expect(results[0].title).toBe('Post')
    })

    it('should paginate and respect limit', async () => {
      mockPublicationService.getPosts.mockResolvedValueOnce([
        {
          id: 1,
          title: 'A',
          slug: 'a',
          post_date: '2026-01-01T00:00:00Z',
          canonical_url: 'https://test.substack.com/p/a'
        },
        {
          id: 2,
          title: 'B',
          slug: 'b',
          post_date: '2026-01-02T00:00:00Z',
          canonical_url: 'https://test.substack.com/p/b'
        }
      ])
      const results = []
      for await (const post of client.publicationPosts({ limit: 1 })) {
        results.push(post)
      }
      expect(results).toHaveLength(1)
    })
  })

  describe('optional publicationUrl', () => {
    it('When client without publicationUrl', () => {
      const noPubClient = new SubstackClient({})
      expect(noPubClient).toBeDefined()
    })

    it('When client with only substackUrl', () => {
      const client = new SubstackClient({ substackUrl: 'substack.com' })
      expect(client).toBeDefined()
    })

    it('should throw when calling publicationHomepage without publicationUrl', async () => {
      const noPubClient = new SubstackClient({})
      await expect(noPubClient.publicationHomepage()).rejects.toThrow(
        'Publication required: provide a publicationUrl in SubstackConfig to use publicationHomepage()'
      )
    })

    it('should throw when calling postReactors without publicationUrl', async () => {
      const noPubClient = new SubstackClient({})
      await expect(noPubClient.postReactors(123)).rejects.toThrow(
        'Publication required: provide a publicationUrl in SubstackConfig to use postReactors()'
      )
    })

    it('should throw when calling activeLiveStream without publicationUrl', async () => {
      const noPubClient = new SubstackClient({})
      await expect(noPubClient.activeLiveStream(456)).rejects.toThrow(
        'Publication required: provide a publicationUrl in SubstackConfig to use activeLiveStream()'
      )
    })

    it('should throw when calling markPostSeen without publicationUrl', async () => {
      const noPubClient = new SubstackClient({})
      await expect(noPubClient.markPostSeen(789)).rejects.toThrow(
        'Publication required: provide a publicationUrl in SubstackConfig to use markPostSeen()'
      )
    })

    it('should throw when calling publicationArchive without publicationUrl', async () => {
      const noPubClient = new SubstackClient({})
      const gen = noPubClient.publicationArchive()
      await expect(gen.next()).rejects.toThrow(
        'Publication required: provide a publicationUrl in SubstackConfig to use publicationArchive()'
      )
    })

    it('should throw when calling publicationPosts without publicationUrl', async () => {
      const noPubClient = new SubstackClient({})
      const gen = noPubClient.publicationPosts()
      await expect(gen.next()).rejects.toThrow(
        'Publication required: provide a publicationUrl in SubstackConfig to use publicationPosts()'
      )
    })

    it('should treat empty string publicationUrl as absent', async () => {
      const client = new SubstackClient({ publicationUrl: '' })
      await expect(client.publicationHomepage()).rejects.toThrow(
        'Publication required: provide a publicationUrl in SubstackConfig to use publicationHomepage()'
      )
    })
  })
})
