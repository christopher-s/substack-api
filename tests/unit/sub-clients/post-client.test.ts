/* eslint-disable @typescript-eslint/no-explicit-any */
import { PostClient } from '@substack-api/sub-clients/post-client'

describe('PostClient', () => {
  let client: PostClient
  let postService: {
    getPostById: jest.Mock
    likePost: jest.Mock
    unlikePost: jest.Mock
    getReadingList: jest.Mock
    savePost: jest.Mock
    unsavePost: jest.Mock
  }
  let feedService: {
    getTopPosts: jest.Mock
    getTrending: jest.Mock
    getFeed: jest.Mock
  }
  let publicationService: Record<string, jest.Mock>
  let buildEntityDeps: jest.Mock
  let searchService: {
    search: jest.Mock
    exploreSearch: jest.Mock
  }

  beforeEach(() => {
    jest.clearAllMocks()
    postService = {
      getPostById: jest.fn(),
      likePost: jest.fn(),
      unlikePost: jest.fn(),
      getReadingList: jest.fn(),
      savePost: jest.fn(),
      unsavePost: jest.fn()
    }
    feedService = {
      getTopPosts: jest.fn(),
      getTrending: jest.fn(),
      getFeed: jest.fn()
    }
    publicationService = {}
    buildEntityDeps = jest.fn().mockReturnValue({})
    searchService = {
      search: jest.fn(),
      exploreSearch: jest.fn()
    }
    client = new PostClient(
      postService as any,
      feedService as any,
      publicationService as any,
      buildEntityDeps,
      20,
      searchService as any
    )
  })

  describe('postForId', () => {
    it('When fetching post by id, then returns FullPost entity', async () => {
      const mockPost = { id: 123, title: 'Test Post', body_html: '<p>Hello</p>' }
      postService.getPostById.mockResolvedValueOnce(mockPost)

      const result = await client.postForId(123)

      expect(postService.getPostById).toHaveBeenCalledWith(123)
      expect(buildEntityDeps).toHaveBeenCalled()
      expect(result).toBeDefined()
    })
  })

  describe('topPosts', () => {
    it('When fetching top posts, then returns items from feed service', async () => {
      const mockItems = [
        { id: 1, title: 'Top Post' },
        { id: 2, title: 'Another Post' }
      ]
      feedService.getTopPosts.mockResolvedValueOnce({ items: mockItems })

      const result = await client.topPosts()

      expect(result).toEqual(mockItems)
      expect(feedService.getTopPosts).toHaveBeenCalled()
    })

    it('When top posts returns empty items, then returns empty array', async () => {
      feedService.getTopPosts.mockResolvedValueOnce({ items: [] })

      const result = await client.topPosts()

      expect(result).toEqual([])
    })
  })

  describe('trending', () => {
    it('When fetching trending without options, then delegates to feed service', async () => {
      const mockResponse = { posts: [{ id: 1 }], next_offset: 0 }
      feedService.getTrending.mockResolvedValueOnce(mockResponse)

      const result = await client.trending()

      expect(result).toEqual(mockResponse)
      expect(feedService.getTrending).toHaveBeenCalledWith(undefined)
    })

    it('When fetching trending with limit, then passes options to service', async () => {
      const mockResponse = { posts: [{ id: 1 }], next_offset: 0 }
      feedService.getTrending.mockResolvedValueOnce(mockResponse)

      const result = await client.trending({ limit: 10 })

      expect(result).toEqual(mockResponse)
      expect(feedService.getTrending).toHaveBeenCalledWith({ limit: 10 })
    })
  })

  describe('trendingFeed', () => {
    it('When iterating trending feed with full page, then yields multiple responses', async () => {
      const response1 = { posts: Array(20).fill({ id: 1 }) }
      const response2 = { posts: [{ id: 2 }] }
      feedService.getTrending.mockResolvedValueOnce(response1).mockResolvedValueOnce(response2)

      const results: any[] = []
      for await (const item of client.trendingFeed()) {
        results.push(item)
      }

      expect(results).toHaveLength(2)
      expect(results[0]).toEqual(response1)
      expect(results[1]).toEqual(response2)
      expect(feedService.getTrending).toHaveBeenCalledTimes(2)
    })

    it('When trending feed returns less than batch size, then stops after first page', async () => {
      const response = { posts: [{ id: 1 }] }
      feedService.getTrending.mockResolvedValueOnce(response)

      const results: any[] = []
      for await (const item of client.trendingFeed()) {
        results.push(item)
      }

      expect(results).toHaveLength(1)
      expect(feedService.getTrending).toHaveBeenCalledTimes(1)
    })

    it('When custom limit provided, then uses limit as batch size', async () => {
      const response1 = { posts: Array(5).fill({ id: 1 }) }
      const response2 = { posts: [{ id: 2 }] }
      feedService.getTrending.mockResolvedValueOnce(response1).mockResolvedValueOnce(response2)

      const results: any[] = []
      for await (const item of client.trendingFeed({ limit: 5 })) {
        results.push(item)
      }

      expect(results).toHaveLength(2)
      expect(feedService.getTrending).toHaveBeenCalledWith({ limit: 5, offset: 0 })
      expect(feedService.getTrending).toHaveBeenCalledWith({ limit: 5, offset: 5 })
    })
  })

  describe('discoverFeed', () => {
    it('When iterating discover feed, then calls feedService.getFeed and yields items', async () => {
      const mockItem = { id: 'item1', type: 'post', entity_key: 'ek1' }
      feedService.getFeed.mockResolvedValueOnce({
        items: [mockItem],
        nextCursor: null
      })

      const results: any[] = []
      for await (const item of client.discoverFeed()) {
        results.push(item)
      }

      expect(results).toEqual([mockItem])
      expect(feedService.getFeed).toHaveBeenCalledWith({ tab: undefined, cursor: undefined })
    })

    it('When discover feed called with tab and limit, then passes to service', async () => {
      feedService.getFeed.mockResolvedValueOnce({
        items: [{ id: 'item1', type: 'post', entity_key: 'ek1' }],
        nextCursor: null
      })

      const results: any[] = []
      for await (const item of client.discoverFeed({ tab: 'for-you', limit: 1 })) {
        results.push(item)
      }

      expect(feedService.getFeed).toHaveBeenCalledWith({ tab: 'for-you', cursor: undefined })
    })

    it('When discover feed paginates across multiple pages, then uses cursor', async () => {
      feedService.getFeed
        .mockResolvedValueOnce({
          items: [{ id: 'item1', type: 'post', entity_key: 'ek1' }],
          nextCursor: 'cursor123'
        })
        .mockResolvedValueOnce({
          items: [{ id: 'item2', type: 'post', entity_key: 'ek2' }],
          nextCursor: null
        })

      const results: any[] = []
      for await (const item of client.discoverFeed()) {
        results.push(item)
      }

      expect(results).toHaveLength(2)
      expect(feedService.getFeed).toHaveBeenCalledTimes(2)
      expect(feedService.getFeed).toHaveBeenNthCalledWith(1, { tab: undefined, cursor: undefined })
      expect(feedService.getFeed).toHaveBeenNthCalledWith(2, {
        tab: undefined,
        cursor: 'cursor123'
      })
    })
  })

  describe('activityFeed', () => {
    it('When iterating activity feed, then yields items from feed service', async () => {
      const mockItem = { id: 'act1', type: 'activity', entity_key: 'ek1' }
      feedService.getFeed.mockResolvedValueOnce({
        items: [mockItem],
        nextCursor: null
      })

      const results: any[] = []
      for await (const item of client.activityFeed()) {
        results.push(item)
      }

      expect(results).toEqual([mockItem])
    })

    it('When activity feed provides onTabs callback and feed returns tabs, then invokes onTabs', async () => {
      const mockTabs = [{ id: 'tab1', name: 'All' }]
      const onTabs = jest.fn()
      feedService.getFeed.mockResolvedValueOnce({
        items: [{ id: 'item1', type: 'post', entity_key: 'ek1' }],
        nextCursor: null,
        tabs: mockTabs
      })

      const results: any[] = []
      for await (const item of client.activityFeed({ onTabs })) {
        results.push(item)
      }

      expect(onTabs).toHaveBeenCalledWith(mockTabs)
    })

    it('When activity feed called with tabId and limit, then passes to service', async () => {
      feedService.getFeed.mockResolvedValueOnce({
        items: [{ id: 'item1', type: 'post', entity_key: 'ek1' }],
        nextCursor: null
      })

      const results: any[] = []
      for await (const item of client.activityFeed({ tabId: 'my-tab', limit: 1 })) {
        results.push(item)
      }

      expect(feedService.getFeed).toHaveBeenCalledWith({ tabId: 'my-tab', cursor: undefined })
    })

    it('When feed returns no tabs and onTabs is provided, then onTabs is not invoked', async () => {
      const onTabs = jest.fn()
      feedService.getFeed.mockResolvedValueOnce({
        items: [{ id: 'item1', type: 'post', entity_key: 'ek1' }],
        nextCursor: null
      })

      for await (const _ of client.activityFeed({ onTabs })) {
        // consume
      }

      expect(onTabs).not.toHaveBeenCalled()
    })
  })

  describe('likePost', () => {
    it('When liking a post, then delegates to post service', async () => {
      postService.likePost.mockResolvedValueOnce(undefined)

      await client.likePost(42)

      expect(postService.likePost).toHaveBeenCalledWith(42)
    })
  })

  describe('unlikePost', () => {
    it('When unliking a post, then delegates to post service', async () => {
      postService.unlikePost.mockResolvedValueOnce(undefined)

      await client.unlikePost(42)

      expect(postService.unlikePost).toHaveBeenCalledWith(42)
    })
  })

  describe('getReadingList', () => {
    it('When fetching reading list, then returns result from service', async () => {
      const mockList = [{ id: 1, title: 'Saved Post' }]
      postService.getReadingList.mockResolvedValueOnce(mockList)

      const result = await client.getReadingList()

      expect(result).toEqual(mockList)
      expect(postService.getReadingList).toHaveBeenCalled()
    })
  })

  describe('savePost', () => {
    it('When saving a post, then delegates to post service', async () => {
      postService.savePost.mockResolvedValueOnce(undefined)

      await client.savePost(42)

      expect(postService.savePost).toHaveBeenCalledWith(42)
    })
  })

  describe('unsavePost', () => {
    it('When unsaving a post, then delegates to post service', async () => {
      postService.unsavePost.mockResolvedValueOnce(undefined)

      await client.unsavePost(42)

      expect(postService.unsavePost).toHaveBeenCalledWith(42)
    })
  })

  describe('search', () => {
    it('When searching with query, then calls searchService and yields items', async () => {
      const mockItem = { id: 'search1', type: 'post', entity_key: 'ek1' }
      searchService.search.mockResolvedValueOnce({
        items: [mockItem],
        nextCursor: null
      })

      const results: any[] = []
      for await (const item of client.search('test query')) {
        results.push(item)
      }

      expect(results).toEqual([mockItem])
      expect(searchService.search).toHaveBeenCalledWith('test query', { cursor: undefined })
    })

    it('When searching with limit, then stops after reaching limit', async () => {
      searchService.search.mockResolvedValueOnce({
        items: [
          { id: 's1', type: 'post', entity_key: 'ek1' },
          { id: 's2', type: 'post', entity_key: 'ek2' }
        ],
        nextCursor: 'more'
      })

      const results: any[] = []
      for await (const item of client.search('test', { limit: 1 })) {
        results.push(item)
      }

      expect(results).toHaveLength(1)
    })
  })

  describe('exploreSearch', () => {
    it('When exploring search, then calls exploreSearch and yields items', async () => {
      const mockItem = { id: 'explore1', type: 'post', entity_key: 'ek1' }
      searchService.exploreSearch.mockResolvedValueOnce({
        items: [mockItem],
        nextCursor: null
      })

      const results: any[] = []
      for await (const item of client.exploreSearch()) {
        results.push(item)
      }

      expect(results).toEqual([mockItem])
      expect(searchService.exploreSearch).toHaveBeenCalledWith({
        tab: undefined,
        cursor: undefined
      })
    })

    it('When exploring search with tab and limit, then passes to service', async () => {
      searchService.exploreSearch.mockResolvedValueOnce({
        items: [{ id: 'e1', type: 'post', entity_key: 'ek1' }],
        nextCursor: null
      })

      const results: any[] = []
      for await (const item of client.exploreSearch({ tab: 'all', limit: 1 })) {
        results.push(item)
      }

      expect(searchService.exploreSearch).toHaveBeenCalledWith({ tab: 'all', cursor: undefined })
    })
  })

  describe('constructor without searchService', () => {
    it('When constructed without search service, then client still works for non-search methods', async () => {
      const clientNoSearch = new PostClient(
        postService as any,
        feedService as any,
        publicationService as any,
        buildEntityDeps,
        20
        // no searchService
      )

      feedService.getTopPosts.mockResolvedValueOnce({ items: [] })
      const result = await clientNoSearch.topPosts()
      expect(result).toEqual([])
    })
  })
})
