/* eslint-disable @typescript-eslint/no-explicit-any */
import { ProfileClient } from '@substack-api/sub-clients/profile-client'

describe('ProfileClient', () => {
  let profileService: {
    getProfileBySlug: jest.Mock
    getProfileById: jest.Mock
    getOwnProfile: jest.Mock
    getProfileActivity: jest.Mock
    getProfileLikes: jest.Mock
  }
  let searchService: {
    searchProfiles: jest.Mock
  }
  let buildEntityDeps: jest.Mock
  let followingService: {
    isConnected: jest.Mock
    followUser: jest.Mock
    unfollowUser: jest.Mock
  }

  function createClient(withFollowing = true): ProfileClient {
    return new ProfileClient(
      profileService as any,
      searchService as any,
      buildEntityDeps,
      withFollowing ? (followingService as any) : undefined
    )
  }

  beforeEach(() => {
    jest.clearAllMocks()
    profileService = {
      getProfileBySlug: jest.fn(),
      getProfileById: jest.fn(),
      getOwnProfile: jest.fn(),
      getProfileActivity: jest.fn(),
      getProfileLikes: jest.fn()
    }
    searchService = {
      searchProfiles: jest.fn()
    }
    buildEntityDeps = jest.fn().mockReturnValue({})
    followingService = {
      isConnected: jest.fn(),
      followUser: jest.fn(),
      unfollowUser: jest.fn()
    }
  })

  describe('profileForSlug', () => {
    it('When fetching profile by slug, then returns Profile entity', async () => {
      const mockProfile = { id: 1, handle: 'testuser', name: 'Test User' }
      profileService.getProfileBySlug.mockResolvedValueOnce(mockProfile)

      const result = await createClient().profileForSlug('testuser')

      expect(profileService.getProfileBySlug).toHaveBeenCalledWith('testuser')
      expect(buildEntityDeps).toHaveBeenCalled()
      expect(result).toBeDefined()
    })
  })

  describe('profileForId', () => {
    it('When fetching profile by id, then returns Profile entity', async () => {
      const mockProfile = { id: 42, handle: 'testuser', name: 'Test User' }
      profileService.getProfileById.mockResolvedValueOnce(mockProfile)

      const result = await createClient().profileForId(42)

      expect(profileService.getProfileById).toHaveBeenCalledWith(42)
      expect(buildEntityDeps).toHaveBeenCalled()
      expect(result).toBeDefined()
    })
  })

  describe('ownProfile', () => {
    it('When fetching own profile, then returns OwnProfile entity', async () => {
      const mockProfile = { id: 1, handle: 'me', name: 'Myself' }
      profileService.getOwnProfile.mockResolvedValueOnce(mockProfile)

      const result = await createClient().ownProfile()

      expect(profileService.getOwnProfile).toHaveBeenCalled()
      expect(buildEntityDeps).toHaveBeenCalled()
      expect(result).toBeDefined()
    })
  })

  describe('profileSearch', () => {
    it('When searching profiles with query, then delegates to search service', async () => {
      const mockResults = {
        results: [
          { id: 1, name: 'User 1' },
          { id: 2, name: 'User 2' }
        ],
        more: true
      }
      searchService.searchProfiles.mockResolvedValueOnce(mockResults)

      const result = await createClient().profileSearch('test')

      expect(result).toEqual(mockResults)
      expect(searchService.searchProfiles).toHaveBeenCalledWith('test', undefined)
    })

    it('When searching profiles with page option, then passes options to service', async () => {
      searchService.searchProfiles.mockResolvedValueOnce({ results: [], more: false })

      await createClient().profileSearch('test', { page: 2 })

      expect(searchService.searchProfiles).toHaveBeenCalledWith('test', { page: 2 })
    })
  })

  describe('profileSearchAll', () => {
    it('When iterating all search results across pages, then yields all results', async () => {
      searchService.searchProfiles
        .mockResolvedValueOnce({
          results: [
            { id: 1, name: 'User 1' },
            { id: 2, name: 'User 2' }
          ],
          more: true
        })
        .mockResolvedValueOnce({
          results: [{ id: 3, name: 'User 3' }],
          more: false
        })

      const results: any[] = []
      for await (const item of createClient().profileSearchAll('test')) {
        results.push(item)
      }

      expect(results).toHaveLength(3)
      expect(searchService.searchProfiles).toHaveBeenCalledTimes(2)
      expect(searchService.searchProfiles).toHaveBeenNthCalledWith(1, 'test', { page: 1 })
      expect(searchService.searchProfiles).toHaveBeenNthCalledWith(2, 'test', { page: 2 })
    })

    it('When search returns no more results, then stops after first page', async () => {
      searchService.searchProfiles.mockResolvedValueOnce({
        results: [{ id: 1, name: 'User 1' }],
        more: false
      })

      const results: any[] = []
      for await (const item of createClient().profileSearchAll('test')) {
        results.push(item)
      }

      expect(results).toHaveLength(1)
      expect(searchService.searchProfiles).toHaveBeenCalledTimes(1)
    })

    it('When limit is set, then stops after reaching limit', async () => {
      searchService.searchProfiles.mockResolvedValue({
        results: [{ id: 1 }, { id: 2 }, { id: 3 }],
        more: true
      })

      const results: any[] = []
      for await (const item of createClient().profileSearchAll('test', { limit: 2 })) {
        results.push(item)
      }

      expect(results).toHaveLength(2)
    })
  })

  describe('profileActivity', () => {
    it('When iterating profile activity, then calls profileService and yields items', async () => {
      const mockItem = { id: 'act1', type: 'post', entity_key: 'ek1' }
      profileService.getProfileActivity.mockResolvedValueOnce({
        items: [mockItem],
        nextCursor: null
      })

      const results: any[] = []
      for await (const item of createClient().profileActivity(42)) {
        results.push(item)
      }

      expect(results).toEqual([mockItem])
      expect(profileService.getProfileActivity).toHaveBeenCalledWith(42, {
        tab: undefined,
        cursor: undefined
      })
    })

    it('When profile activity called with tab and limit, then passes to service', async () => {
      profileService.getProfileActivity.mockResolvedValueOnce({
        items: [{ id: 'item1', type: 'post', entity_key: 'ek1' }],
        nextCursor: null
      })

      const results: any[] = []
      for await (const item of createClient().profileActivity(42, { tab: 'posts', limit: 1 })) {
        results.push(item)
      }

      expect(profileService.getProfileActivity).toHaveBeenCalledWith(42, {
        tab: 'posts',
        cursor: undefined
      })
    })
  })

  describe('profileLikes', () => {
    it('When iterating profile likes, then calls profileService and yields items', async () => {
      const mockItem = { id: 'like1', type: 'like', entity_key: 'ek1' }
      profileService.getProfileLikes.mockResolvedValueOnce({
        items: [mockItem],
        nextCursor: null
      })

      const results: any[] = []
      for await (const item of createClient().profileLikes(42)) {
        results.push(item)
      }

      expect(results).toEqual([mockItem])
      expect(profileService.getProfileLikes).toHaveBeenCalledWith(42, { cursor: undefined })
    })

    it('When profile likes called with limit, then stops after reaching limit', async () => {
      profileService.getProfileLikes.mockResolvedValueOnce({
        items: [
          { id: 'l1', type: 'like', entity_key: 'ek1' },
          { id: 'l2', type: 'like', entity_key: 'ek2' }
        ],
        nextCursor: 'more'
      })

      const results: any[] = []
      for await (const item of createClient().profileLikes(42, { limit: 1 })) {
        results.push(item)
      }

      expect(results).toHaveLength(1)
    })
  })

  describe('isConnected', () => {
    it('When following service is connected, then returns true', async () => {
      followingService.isConnected.mockResolvedValueOnce({ connected: true })

      const result = await createClient().isConnected()

      expect(result).toBe(true)
      expect(followingService.isConnected).toHaveBeenCalled()
    })

    it('When following service reports not connected, then returns false', async () => {
      followingService.isConnected.mockResolvedValueOnce({ connected: false })

      const result = await createClient().isConnected()

      expect(result).toBe(false)
    })

    it('When following service is undefined, then returns false', async () => {
      const result = await createClient(false).isConnected()

      expect(result).toBe(false)
    })
  })

  describe('followUser', () => {
    it('When following a user, then delegates to following service', async () => {
      followingService.followUser.mockResolvedValueOnce(undefined)

      await createClient().followUser(42)

      expect(followingService.followUser).toHaveBeenCalledWith(42)
    })

    it('When following service is undefined, then throws error', async () => {
      await expect(createClient(false).followUser(42)).rejects.toThrow(
        'Following service not available'
      )
    })
  })

  describe('unfollowUser', () => {
    it('When unfollowing a user, then delegates to following service', async () => {
      followingService.unfollowUser.mockResolvedValueOnce(undefined)

      await createClient().unfollowUser(42)

      expect(followingService.unfollowUser).toHaveBeenCalledWith(42)
    })

    it('When following service is undefined, then throws error', async () => {
      await expect(createClient(false).unfollowUser(42)).rejects.toThrow(
        'Following service not available'
      )
    })
  })
})
