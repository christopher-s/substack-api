import { Profile } from '@substack-api/domain/profile'
import { createMockEntityDeps } from '@test/unit/helpers/mock-services'

describe('Profile Entity - Core', () => {
  let deps: ReturnType<typeof createMockEntityDeps>
  let profile: Profile
  let mockProfileData: Record<string, unknown>

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

    profile = new Profile(
      mockProfileData as unknown as import('@substack-api/internal').SubstackFullProfile,
      deps
    )
  })

  describe('new profile fields', () => {
    it('[smoke] When primaryPublication has string id, then normalizes to number', () => {
      const profileWithStringPubId = new Profile(
        {
          ...mockProfileData,
          primaryPublication: {
            id: '12345' as unknown as number,
            name: 'Test Publication',
            subdomain: 'testpub'
          }
        } as unknown as import('@substack-api/internal').SubstackFullProfile,
        createMockEntityDeps()
      )

      expect(profileWithStringPubId.primaryPublication).toEqual({
        id: 12345,
        name: 'Test Publication',
        subdomain: 'testpub'
      })
    })

    it('When profile has no subscribers or follows, then exposes default values', () => {
      expect(profile.subscriberCount).toBe(0)
      expect(profile.isFollowing).toBe(false)
      expect(profile.isSubscribed).toBe(false)
    })
  })
})
