import { Profile } from '@substack-api/domain/profile'
import { PreviewPost } from '@substack-api/domain'
import { createMockEntityDeps } from '@test/unit/helpers/mock-services'

describe('Profile Entity - Posts', () => {
  let deps: ReturnType<typeof createMockEntityDeps>
  let profile: Profile
  let mockProfileData: any

  beforeEach(() => {
    deps = createMockEntityDeps()

    mockProfileData = {
      id: 123,
      handle: 'testuser',
      name: 'Test User',
      photo_url: 'https://example.com/photo.jpg',
      bio: 'Test bio',
      profile_set_up_at: '2023-01-01T00:00:00Z',
      reader_installed_at: '2023-01-01T00:00:00Z',
      profile_disabled: false,
      publicationUsers: [],
      userLinks: [],
      subscriptions: [],
      subscriptionsTruncated: false,
      hasGuestPost: false,
      max_pub_tier: 0,
      hasActivity: false,
      hasLikes: false,
      lists: [],
      rough_num_free_subscribers_int: 0,
      rough_num_free_subscribers: '0',
      bestseller_badge_disabled: false,
      subscriberCountString: '0',
      subscriberCount: '0',
      subscriberCountNumber: 0,
      hasHiddenPublicationUsers: false,
      visibleSubscriptionsCount: 0,
      slug: 'testuser',
      primaryPublicationIsPledged: false,
      primaryPublicationSubscriptionState: 'not_subscribed',
      isSubscribed: false,
      isFollowing: false,
      followsViewer: false,
      can_dm: false,
      dm_upgrade_options: []
    }

    profile = new Profile(mockProfileData, deps)
  })

  describe('posts()', () => {
    it('When iterating profile posts, then returns PreviewPost instances', async () => {
      const mockPosts = [
        {
          id: 1,
          title: 'Post 1',
          slug: 'post-1',
          post_date: '2023-01-01T00:00:00Z',
          canonical_url: 'https://example.com/post1',
          type: 'newsletter' as const
        },
        {
          id: 2,
          title: 'Post 2',
          slug: 'post-2',
          post_date: '2023-01-02T00:00:00Z',
          canonical_url: 'https://example.com/post2',
          type: 'newsletter' as const
        }
      ]
      deps.postService.getPostsForProfile.mockResolvedValue({ posts: mockPosts, nextCursor: null })

      const posts = []
      for await (const post of profile.posts({ limit: 2 })) {
        posts.push(post)
      }

      expect(posts).toHaveLength(2)
      expect(posts[0]).toBeInstanceOf(PreviewPost)
      expect(posts[0].title).toBe('Post 1')
      expect(posts[1].title).toBe('Post 2')
      expect(deps.postService.getPostsForProfile).toHaveBeenCalledWith(123, {
        limit: 25,
        offset: 0
      })
    })

    it('When limit is specified, then returns only that many posts', async () => {
      const mockPosts = [
        {
          id: 1,
          title: 'Post 1',
          slug: 'post-1',
          post_date: '2023-01-01T00:00:00Z',
          canonical_url: 'https://example.com/post1',
          type: 'newsletter' as const
        },
        {
          id: 2,
          title: 'Post 2',
          slug: 'post-2',
          post_date: '2023-01-02T00:00:00Z',
          canonical_url: 'https://example.com/post2',
          type: 'newsletter' as const
        }
      ]
      deps.postService.getPostsForProfile.mockResolvedValue({ posts: mockPosts, nextCursor: null })

      const posts = []
      for await (const post of profile.posts({ limit: 1 })) {
        posts.push(post)
      }

      expect(posts).toHaveLength(1)
      expect(posts[0].title).toBe('Post 1')
    })

    it('When posts response is empty, then returns empty array', async () => {
      deps.postService.getPostsForProfile.mockResolvedValue({ posts: [], nextCursor: null })

      const posts = []
      for await (const post of profile.posts()) {
        posts.push(post)
      }

      expect(posts).toHaveLength(0)
    })

    it('When posts property is missing, then returns empty array', async () => {
      deps.postService.getPostsForProfile.mockResolvedValue({ posts: [], nextCursor: null })

      const posts = []
      for await (const post of profile.posts()) {
        posts.push(post)
      }

      expect(posts).toHaveLength(0)
    })

    it('When posts() API call fails, then propagates the error', async () => {
      deps.postService.getPostsForProfile.mockRejectedValue(new Error('API error'))

      const collectPosts = async () => {
        const posts = []
        for await (const post of profile.posts()) {
          posts.push(post)
        }
        return posts
      }

      await expect(collectPosts()).rejects.toThrow('API error')
    })

    it('When multiple pages of posts exist, then paginates through all pages', async () => {
      // Reset the mock to avoid interference from other tests
      deps.postService.getPostsForProfile.mockReset()

      // Create a new profile with perPage set to 2 for this test
      const profileWithCustomPerPage = new Profile(
        profile['rawData'],
        createMockEntityDeps({ perPage: 2, postService: deps.postService })
      )

      // Mock first page response (full page)
      const firstPagePosts = [
        {
          id: 1,
          title: 'Post 1',
          slug: 'post-1',
          post_date: '2023-01-01T00:00:00Z',
          canonical_url: 'https://example.com/post1',
          type: 'newsletter' as const
        },
        {
          id: 2,
          title: 'Post 2',
          slug: 'post-2',
          post_date: '2023-01-02T00:00:00Z',
          canonical_url: 'https://example.com/post2',
          type: 'newsletter' as const
        }
      ]

      // Mock second page response (full page)
      const secondPagePosts = [
        {
          id: 3,
          title: 'Post 3',
          slug: 'post-3',
          post_date: '2023-01-03T00:00:00Z',
          canonical_url: 'https://example.com/post3',
          type: 'newsletter' as const
        },
        {
          id: 4,
          title: 'Post 4',
          slug: 'post-4',
          post_date: '2023-01-04T00:00:00Z',
          canonical_url: 'https://example.com/post4',
          type: 'newsletter' as const
        }
      ]

      // Mock third page response (partial page - should trigger end of pagination)
      const thirdPagePosts = [
        {
          id: 5,
          title: 'Post 5',
          slug: 'post-5',
          post_date: '2023-01-05T00:00:00Z',
          canonical_url: 'https://example.com/post5',
          type: 'newsletter' as const
        }
      ]

      // Setup sequential responses for pagination
      deps.postService.getPostsForProfile
        .mockResolvedValueOnce({ posts: firstPagePosts, nextCursor: 'cursor2' }) // offset=0, returns 2 posts (full page)
        .mockResolvedValueOnce({ posts: secondPagePosts, nextCursor: 'cursor3' }) // offset=2, returns 2 posts (full page)
        .mockResolvedValueOnce({ posts: thirdPagePosts, nextCursor: null }) // offset=4, returns 1 post (partial page - end)

      const posts = []
      for await (const post of profileWithCustomPerPage.posts()) {
        posts.push(post)
      }

      expect(posts).toHaveLength(5)
      expect(posts[0].title).toBe('Post 1')
      expect(posts[1].title).toBe('Post 2')
      expect(posts[2].title).toBe('Post 3')
      expect(posts[3].title).toBe('Post 4')
      expect(posts[4].title).toBe('Post 5')

      // Verify all three service calls were made with correct offsets
      expect(deps.postService.getPostsForProfile).toHaveBeenCalledTimes(3)
      expect(deps.postService.getPostsForProfile).toHaveBeenNthCalledWith(1, 123, {
        limit: 2,
        offset: 0
      })
      expect(deps.postService.getPostsForProfile).toHaveBeenNthCalledWith(2, 123, {
        limit: 2,
        offset: 2
      })
      expect(deps.postService.getPostsForProfile).toHaveBeenNthCalledWith(3, 123, {
        limit: 2,
        offset: 4
      })
    })
  })
})
