import { FeedService } from '@substack-api/internal/services/feed-service'
import { CategoryService } from '@substack-api/internal/services/category-service'
import { ProfileService } from '@substack-api/internal/services/profile-service'
import type { HttpClient } from '@substack-api/internal/http-client'

describe('FeedService / CategoryService / ProfileService branches', () => {
  let mockClient: jest.Mocked<HttpClient>
  let feedService: FeedService
  let categoryService: CategoryService
  let profileService: ProfileService

  beforeEach(() => {
    mockClient = {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn()
    } as unknown as jest.Mocked<HttpClient>
    feedService = new FeedService(mockClient)
    categoryService = new CategoryService(mockClient)
    profileService = new ProfileService(mockClient)
  })

  it('getFeed should use for-you tab when no tab specified', async () => {
    mockClient.get.mockResolvedValue({ items: [], nextCursor: null })
    await feedService.getFeed()
    expect(mockClient.get).toHaveBeenCalledWith(expect.stringContaining('tab=for-you'))
  })

  it('getFeed should use custom tab', async () => {
    mockClient.get.mockResolvedValue({ items: [], nextCursor: null })
    await feedService.getFeed({ tab: 'top' })
    expect(mockClient.get).toHaveBeenCalledWith(expect.stringContaining('tab=top'))
  })

  it('getFeed should handle null nextCursor', async () => {
    mockClient.get.mockResolvedValue({ items: [] })
    const result = await feedService.getFeed()
    expect(result.nextCursor).toBeNull()
  })

  it('getFeed should handle explicit nextCursor', async () => {
    mockClient.get.mockResolvedValue({ items: [], nextCursor: 'cursor-value' })
    const result = await feedService.getFeed()
    expect(result.nextCursor).toBe('cursor-value')
  })

  it('getCategories should handle empty array', async () => {
    mockClient.get.mockResolvedValue([])
    const result = await categoryService.getCategories()
    expect(result).toHaveLength(0)
  })

  it('getProfileActivity should handle null cursor', async () => {
    mockClient.get.mockResolvedValue({ items: [], nextCursor: undefined })
    const result = await profileService.getProfileActivity(1)
    expect(result.nextCursor).toBeNull()
    expect(mockClient.get).toHaveBeenCalledWith('/reader/feed/profile/1')
  })

  it('getProfileActivity should handle nextCursor for pagination', async () => {
    mockClient.get.mockResolvedValue({ items: [], nextCursor: 'page2' })
    const result = await profileService.getProfileActivity(1, { cursor: 'page1' })
    expect(result.nextCursor).toBe('page2')
    expect(mockClient.get).toHaveBeenCalledWith(expect.stringContaining('cursor=page1'))
  })

  it('getProfileLikes should handle null cursor', async () => {
    mockClient.get.mockResolvedValue({ items: [], nextCursor: undefined })
    const result = await profileService.getProfileLikes(1)
    expect(result.nextCursor).toBeNull()
  })

  it('getProfileLikes should pass cursor', async () => {
    mockClient.get.mockResolvedValue({ items: [], nextCursor: 'next' })
    const result = await profileService.getProfileLikes(1, { cursor: 'abc' })
    expect(mockClient.get).toHaveBeenCalledWith(expect.stringContaining('cursor=abc'))
    expect(result.nextCursor).toBe('next')
  })
})
